insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('html-templates', 'html-templates', false, 262144, array['text/html'])
on conflict (id) do update set public = false, file_size_limit = 262144, allowed_mime_types = array['text/html'];

create policy "operators upload own html templates"
on storage.objects for insert to authenticated
with check (bucket_id = 'html-templates' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "operators read own html templates"
on storage.objects for select to authenticated
using (bucket_id = 'html-templates' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "operators delete own html templates"
on storage.objects for delete to authenticated
using (bucket_id = 'html-templates' and (storage.foldername(name))[1] = auth.uid()::text);
