create policy "profiles_select_admin" on public.profiles for select to authenticated
using (public.has_role(auth.uid(),'admin'));