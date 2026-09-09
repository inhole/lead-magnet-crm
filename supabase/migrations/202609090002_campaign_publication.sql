alter table public.campaigns
add column published_at timestamptz;

update public.campaigns
set published_at = created_at
where published_at is null;

create or replace function public.get_public_form(p_public_id text)
returns table (public_id text, title text, description text, submit_label text, input_schema jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select f.public_id, f.title, f.description, f.submit_label, t.input_schema
  from public.campaign_forms f
  join public.campaigns c on c.id = f.campaign_id
  join public.html_templates t on t.id = f.template_id
  where f.public_id = p_public_id and c.published_at is not null;
$$;

create or replace function public.record_public_visit(p_public_id text, p_link_token text, p_visitor_id uuid, p_event_key uuid)
returns table (visit_id uuid, channel text)
language plpgsql security definer set search_path = public as $$
declare v_form_id uuid; v_link_id uuid; v_channel text; v_visit_id uuid;
begin
  select f.id into v_form_id
  from public.campaign_forms f
  join public.campaigns c on c.id = f.campaign_id
  where f.public_id = p_public_id and c.published_at is not null;
  if v_form_id is null then raise exception 'form not found' using errcode = 'P0002'; end if;
  if p_link_token is not null then
    select id, distribution_links.channel into v_link_id, v_channel from public.distribution_links
    where form_id = v_form_id and link_token = p_link_token;
    if v_link_id is null then raise exception 'link not found' using errcode = 'P0003'; end if;
  end if;
  insert into public.visit_events(form_id, distribution_link_id, visitor_id, event_key)
  values (v_form_id, v_link_id, p_visitor_id, p_event_key)
  on conflict (form_id, event_key) do update set event_key = excluded.event_key returning id into v_visit_id;
  return query select v_visit_id, coalesce(v_channel, 'direct');
end; $$;

create or replace function public.create_public_submission(p_public_id text, p_visit_id uuid, p_idempotency_key uuid, p_values jsonb)
returns table (submission_id uuid, created_at timestamptz, replayed boolean)
language plpgsql security definer set search_path = public as $$
declare v_form_id uuid; v_existing public.submissions%rowtype; v_id uuid; v_created timestamptz;
begin
  select f.id into v_form_id
  from public.campaign_forms f
  join public.campaigns c on c.id = f.campaign_id
  where f.public_id = p_public_id and c.published_at is not null;
  if v_form_id is null then raise exception 'form not found' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.visit_events where id = p_visit_id and form_id = v_form_id) then
    raise exception 'visit not found' using errcode = 'P0003';
  end if;
  select * into v_existing from public.submissions where form_id = v_form_id and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.visit_id <> p_visit_id or v_existing.values <> p_values then raise exception 'idempotency conflict' using errcode = 'P0004'; end if;
    return query select v_existing.id, v_existing.created_at, true; return;
  end if;
  insert into public.submissions(form_id, visit_id, idempotency_key, values)
  values (v_form_id, p_visit_id, p_idempotency_key, p_values)
  returning id, submissions.created_at into v_id, v_created;
  return query select v_id, v_created, false;
exception when unique_violation then
  select * into v_existing from public.submissions where form_id = v_form_id and idempotency_key = p_idempotency_key;
  if v_existing.visit_id <> p_visit_id or v_existing.values <> p_values then raise exception 'idempotency conflict' using errcode = 'P0004'; end if;
  return query select v_existing.id, v_existing.created_at, true;
end; $$;

revoke all on function public.get_public_form(text) from public;
grant execute on function public.get_public_form(text) to anon, authenticated;
revoke all on function public.record_public_visit(text, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_public_visit(text, text, uuid, uuid) to service_role;
revoke all on function public.create_public_submission(text, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.create_public_submission(text, uuid, uuid, jsonb) to service_role;
