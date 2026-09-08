create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('operator', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.html_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  storage_path text not null,
  input_schema jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.campaign_forms (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references public.campaigns(id) on delete cascade,
  template_id uuid not null references public.html_templates(id) on delete restrict,
  public_id text not null unique,
  title text not null,
  description text not null default '',
  submit_label text not null default '신청하기'
);

create index html_templates_owner_id_idx on public.html_templates(owner_id);
create index campaigns_owner_id_idx on public.campaigns(owner_id);

alter table public.profiles enable row level security;
alter table public.html_templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_forms enable row level security;

create policy "profiles are self readable" on public.profiles for select using (auth.uid() = user_id);
create policy "operators own templates" on public.html_templates for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "operators own campaigns" on public.campaigns for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "operators own forms" on public.campaign_forms for all using (
  exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id = auth.uid())
) with check (
  exists (select 1 from public.campaigns c join public.html_templates t on t.id = template_id where c.id = campaign_id and c.owner_id = auth.uid() and t.owner_id = auth.uid())
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (user_id) values (new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();