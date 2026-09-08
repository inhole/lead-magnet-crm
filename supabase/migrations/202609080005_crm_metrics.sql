create or replace function public.get_campaign_submissions(p_campaign_id uuid, p_limit integer default 100)
returns table (submission_id uuid, submitted_at timestamptz, channel text, values jsonb)
language plpgsql security invoker set search_path = public as $$
begin
  if not exists (select 1 from public.campaigns where id = p_campaign_id and owner_id = auth.uid()) then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;
  return query
  select s.id, s.created_at, coalesce(l.channel, 'direct'), s.values
  from public.submissions s
  join public.visit_events v on v.id = s.visit_id
  join public.campaign_forms f on f.id = s.form_id
  left join public.distribution_links l on l.id = v.distribution_link_id
  where f.campaign_id = p_campaign_id
  order by s.created_at desc
  limit least(greatest(p_limit, 1), 100);
end; $$;

create or replace function public.get_campaign_submission(p_campaign_id uuid, p_submission_id uuid)
returns table (submission_id uuid, submitted_at timestamptz, channel text, values jsonb)
language plpgsql security invoker set search_path = public as $$
begin
  if not exists (select 1 from public.campaigns where id = p_campaign_id and owner_id = auth.uid()) then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;
  return query
  select s.id, s.created_at, coalesce(l.channel, 'direct'), s.values
  from public.submissions s
  join public.visit_events v on v.id = s.visit_id
  join public.campaign_forms f on f.id = s.form_id
  left join public.distribution_links l on l.id = v.distribution_link_id
  where f.campaign_id = p_campaign_id and s.id = p_submission_id;
end; $$;

create or replace function public.get_campaign_metrics(p_campaign_id uuid)
returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare v_form_id uuid; v_overall jsonb; v_channels jsonb;
begin
  select f.id into v_form_id from public.campaign_forms f join public.campaigns c on c.id = f.campaign_id
  where c.id = p_campaign_id and c.owner_id = auth.uid();
  if v_form_id is null then raise exception 'campaign not found' using errcode = 'P0002'; end if;

  select jsonb_build_object(
    'visits', count(*),
    'visitors', count(distinct v.visitor_id),
    'submissions', (select count(*) from public.submissions s where s.form_id = v_form_id),
    'convertedVisitors', (select count(distinct sv.visitor_id) from public.submissions ss join public.visit_events sv on sv.id = ss.visit_id where ss.form_id = v_form_id)
  ) into v_overall from public.visit_events v where v.form_id = v_form_id;

  select jsonb_agg(jsonb_build_object(
    'channel', c.channel,
    'visits', (select count(*) from public.visit_events v left join public.distribution_links l on l.id = v.distribution_link_id where v.form_id = v_form_id and coalesce(l.channel, 'direct') = c.channel),
    'visitors', (select count(distinct v.visitor_id) from public.visit_events v left join public.distribution_links l on l.id = v.distribution_link_id where v.form_id = v_form_id and coalesce(l.channel, 'direct') = c.channel),
    'submissions', (select count(*) from public.submissions s join public.visit_events v on v.id = s.visit_id left join public.distribution_links l on l.id = v.distribution_link_id where s.form_id = v_form_id and coalesce(l.channel, 'direct') = c.channel),
    'convertedVisitors', (select count(distinct v.visitor_id) from public.submissions s join public.visit_events v on v.id = s.visit_id left join public.distribution_links l on l.id = v.distribution_link_id where s.form_id = v_form_id and coalesce(l.channel, 'direct') = c.channel)
  ) order by c.position) into v_channels
  from (values ('instagram', 1), ('x', 2), ('youtube', 3), ('threads', 4), ('direct', 5)) as c(channel, position);

  return jsonb_build_object('overall', v_overall, 'channels', v_channels);
end; $$;

revoke all on function public.get_campaign_submissions(uuid, integer) from public;
grant execute on function public.get_campaign_submissions(uuid, integer) to authenticated;
revoke all on function public.get_campaign_submission(uuid, uuid) from public;
grant execute on function public.get_campaign_submission(uuid, uuid) to authenticated;
revoke all on function public.get_campaign_metrics(uuid) from public;
grant execute on function public.get_campaign_metrics(uuid) to authenticated;
