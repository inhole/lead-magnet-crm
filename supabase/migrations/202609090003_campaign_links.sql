create or replace function public.create_form_distribution_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_channel text;
begin
  foreach v_channel in array array['instagram', 'x', 'youtube', 'threads'] loop
    insert into public.distribution_links (form_id, channel, link_token)
    values (new.id, v_channel, replace(gen_random_uuid()::text, '-', ''))
    on conflict on constraint distribution_links_form_id_channel_key do nothing;
  end loop;
  return new;
end;
$$;

revoke all on function public.create_form_distribution_links() from public, anon, authenticated;

drop trigger if exists on_campaign_form_created on public.campaign_forms;
create trigger on_campaign_form_created
after insert on public.campaign_forms
for each row execute procedure public.create_form_distribution_links();

insert into public.distribution_links (form_id, channel, link_token)
select f.id, c.channel, replace(gen_random_uuid()::text, '-', '')
from public.campaign_forms f
cross join unnest(array['instagram', 'x', 'youtube', 'threads']) as c(channel)
on conflict on constraint distribution_links_form_id_channel_key do nothing;

create or replace function public.get_campaign_links(p_campaign_id uuid)
returns table (channel text, link_token text)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare v_form_id uuid;
begin
  select f.id into v_form_id
  from public.campaign_forms f
  join public.campaigns c on c.id = f.campaign_id
  where c.id = p_campaign_id and c.owner_id = auth.uid();

  if v_form_id is null then
    raise exception 'campaign not found' using errcode = 'P0002';
  end if;

  return query
  select l.channel, l.link_token
  from public.distribution_links l
  where l.form_id = v_form_id
  order by l.channel;
end;
$$;

revoke all on function public.get_campaign_links(uuid) from public;
grant execute on function public.get_campaign_links(uuid) to authenticated;
