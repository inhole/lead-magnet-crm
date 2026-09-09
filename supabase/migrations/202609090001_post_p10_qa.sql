create or replace function public.ensure_campaign_links(p_campaign_id uuid)
returns table (channel text, link_token text)
language plpgsql security invoker set search_path = public as $$
declare v_form_id uuid; v_channel text;
begin
  select f.id into v_form_id
  from public.campaign_forms f
  join public.campaigns c on c.id = f.campaign_id
  where c.id = p_campaign_id and c.owner_id = auth.uid();

  if v_form_id is null then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;

  foreach v_channel in array array['instagram','x','youtube','threads'] loop
    insert into public.distribution_links(form_id, channel, link_token)
    values (v_form_id, v_channel, replace(gen_random_uuid()::text, '-', ''))
    on conflict on constraint distribution_links_form_id_channel_key do nothing;
  end loop;

  return query
  select links.channel, links.link_token
  from public.distribution_links links
  where links.form_id = v_form_id
  order by links.channel;
end; $$;

create or replace function public.get_workspace_metrics()
returns jsonb
language sql stable security invoker set search_path = public as $$
  with owned_forms as (
    select f.id
    from public.campaign_forms f
    join public.campaigns c on c.id = f.campaign_id
    where c.owner_id = auth.uid()
  )
  select jsonb_build_object(
    'campaigns', (select count(*) from public.campaigns c where c.owner_id = auth.uid()),
    'visits', (select count(*) from public.visit_events v where v.form_id in (select id from owned_forms)),
    'visitors', (select count(distinct v.visitor_id) from public.visit_events v where v.form_id in (select id from owned_forms)),
    'submissions', (select count(*) from public.submissions s where s.form_id in (select id from owned_forms)),
    'convertedVisitors', (
      select count(distinct v.visitor_id)
      from public.submissions s
      join public.visit_events v on v.id = s.visit_id
      where s.form_id in (select id from owned_forms)
    )
  );
$$;

revoke all on function public.ensure_campaign_links(uuid) from public;
grant execute on function public.ensure_campaign_links(uuid) to authenticated;
revoke all on function public.get_workspace_metrics() from public;
grant execute on function public.get_workspace_metrics() to authenticated;
