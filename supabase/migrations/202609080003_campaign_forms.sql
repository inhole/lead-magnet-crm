create or replace function public.create_campaign_with_form(
  p_name text,
  p_template_id uuid,
  p_public_id text,
  p_title text,
  p_description text,
  p_submit_label text
) returns table (campaign_id uuid, form_id uuid, public_id text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_form_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.html_templates where id = p_template_id and owner_id = auth.uid()) then
    raise exception 'template not found' using errcode = 'P0002';
  end if;

  insert into public.campaigns (owner_id, name) values (auth.uid(), p_name) returning id into v_campaign_id;
  insert into public.campaign_forms (campaign_id, template_id, public_id, title, description, submit_label)
  values (v_campaign_id, p_template_id, p_public_id, p_title, p_description, p_submit_label)
  returning id into v_form_id;
  return query select v_campaign_id, v_form_id, p_public_id;
end;
$$;

create or replace function public.get_public_form(p_public_id text)
returns table (public_id text, title text, description text, submit_label text, input_schema jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select f.public_id, f.title, f.description, f.submit_label, t.input_schema
  from public.campaign_forms f
  join public.html_templates t on t.id = f.template_id
  where f.public_id = p_public_id;
$$;

revoke all on function public.get_public_form(text) from public;
grant execute on function public.get_public_form(text) to anon, authenticated;

revoke all on function public.create_campaign_with_form(text, uuid, text, text, text, text) from public;
grant execute on function public.create_campaign_with_form(text, uuid, text, text, text, text) to authenticated;
