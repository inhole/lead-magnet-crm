alter table public.html_templates
  add column default_title text not null default '',
  add column default_description text not null default '',
  add column default_submit_label text not null default '';
