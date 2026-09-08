create table public.distribution_links (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.campaign_forms(id) on delete cascade,
  channel text not null check (channel in ('instagram', 'x', 'youtube', 'threads')),
  link_token text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  unique (form_id, channel)
);

create table public.visit_events (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.campaign_forms(id) on delete cascade,
  distribution_link_id uuid references public.distribution_links(id) on delete restrict,
  visitor_id uuid not null,
  event_key uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (form_id, event_key)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.campaign_forms(id) on delete cascade,
  visit_id uuid not null references public.visit_events(id) on delete restrict,
  idempotency_key uuid not null,
  values jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (form_id, idempotency_key)
);

create index distribution_links_form_id_idx on public.distribution_links(form_id);
create index visit_events_form_visitor_idx on public.visit_events(form_id, visitor_id);
create index submissions_form_created_idx on public.submissions(form_id, created_at desc);

alter table public.distribution_links enable row level security;
alter table public.visit_events enable row level security;
alter table public.submissions enable row level security;

create policy "operators own distribution links" on public.distribution_links for all using (
  exists (select 1 from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id where f.id = form_id and c.owner_id = auth.uid())
) with check (
  exists (select 1 from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id where f.id = form_id and c.owner_id = auth.uid())
);
create policy "operators read visits" on public.visit_events for select using (
  exists (select 1 from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id where f.id = form_id and c.owner_id = auth.uid())
);
create policy "operators read submissions" on public.submissions for select using (
  exists (select 1 from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id where f.id = form_id and c.owner_id = auth.uid())
);

create or replace function public.ensure_campaign_links(p_campaign_id uuid)
returns table (channel text, link_token text)
language plpgsql security invoker set search_path = public as $$
declare v_form_id uuid; v_channel text;
begin
  select f.id into v_form_id from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id
  where c.id = p_campaign_id and c.owner_id = auth.uid();
  if v_form_id is null then raise exception 'campaign not found' using errcode = 'P0002'; end if;
  foreach v_channel in array array['instagram','x','youtube','threads'] loop
    insert into public.distribution_links(form_id, channel, link_token)
    values (v_form_id, v_channel, replace(gen_random_uuid()::text, '-', '')) on conflict (form_id, channel) do nothing;
  end loop;
  return query select l.channel, l.link_token from public.distribution_links l where l.form_id = v_form_id order by l.channel;
end; $$;

create or replace function public.record_public_visit(p_public_id text, p_link_token text, p_visitor_id uuid, p_event_key uuid)
returns table (visit_id uuid, channel text)
language plpgsql security definer set search_path = public as $$
declare v_form_id uuid; v_link_id uuid; v_channel text; v_visit_id uuid;
begin
  select id into v_form_id from public.campaign_forms where public_id = p_public_id;
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
  select id into v_form_id from public.campaign_forms where public_id = p_public_id;
  if v_form_id is null then raise exception 'form not found' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.visit_events where id = p_visit_id and form_id = v_form_id) then
    raise exception 'visit not found' using errcode = 'P0003';
  end if;
  select * into v_existing from public.submissions where form_id = v_form_id and idempotency_key = p_idempotency_key;
  if found then
    if v_existing.visit_id <> p_visit_id or v_existing.values <> p_values then raise exception 'idempotency conflict' using errcode = 'P0004'; end if;
    return query select v_existing.id, v_existing.created_at, true; return;
  end if;
  insert into public.submissions(form_id, visit_id, idempotency_key, values) values (v_form_id, p_visit_id, p_idempotency_key, p_values)
  returning id, submissions.created_at into v_id, v_created;
  return query select v_id, v_created, false;
exception when unique_violation then
  select * into v_existing from public.submissions where form_id = v_form_id and idempotency_key = p_idempotency_key;
  if v_existing.visit_id <> p_visit_id or v_existing.values <> p_values then raise exception 'idempotency conflict' using errcode = 'P0004'; end if;
  return query select v_existing.id, v_existing.created_at, true;
end; $$;

revoke all on function public.ensure_campaign_links(uuid) from public;
grant execute on function public.ensure_campaign_links(uuid) to authenticated;
revoke all on function public.record_public_visit(text, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_public_visit(text, text, uuid, uuid) to service_role;
revoke all on function public.create_public_submission(text, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.create_public_submission(text, uuid, uuid, jsonb) to service_role;
