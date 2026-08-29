revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

create policy "attachments_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'complaint-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachments_select_own" on storage.objects for select to authenticated
using (bucket_id = 'complaint-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "attachments_select_admin" on storage.objects for select to authenticated
using (bucket_id = 'complaint-attachments' and public.has_role(auth.uid(),'admin'));

create policy "attachments_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'complaint-attachments' and (storage.foldername(name))[1] = auth.uid()::text);