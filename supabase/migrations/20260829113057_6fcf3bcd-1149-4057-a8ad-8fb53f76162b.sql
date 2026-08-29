create type public.app_role as enum ('student','admin');
create type public.complaint_category as enum ('Classroom','Laboratory','Hostel','Wi-Fi','Transportation','Cleanliness','Infrastructure','Other');
create type public.complaint_priority as enum ('Low','Medium','High','Critical');
create type public.complaint_status as enum ('Submitted','Under Review','Assigned','In Progress','Resolved','Closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category public.complaint_category not null,
  description text not null,
  location text not null default '',
  priority public.complaint_priority not null default 'Medium',
  status public.complaint_status not null default 'Submitted',
  assigned_department text,
  assigned_staff text,
  attachment text,
  admin_comments text,
  resolution_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.complaints to authenticated;
grant all on public.complaints to service_role;
alter table public.complaints enable row level security;
create policy "complaints_select_own" on public.complaints for select to authenticated using (student_id = auth.uid());
create policy "complaints_select_admin" on public.complaints for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "complaints_insert_own" on public.complaints for insert to authenticated with check (student_id = auth.uid());
create policy "complaints_update_admin" on public.complaints for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "complaints_delete_own_submitted" on public.complaints for delete to authenticated using (student_id = auth.uid() and status = 'Submitted');
create policy "complaints_delete_admin" on public.complaints for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default '',
  action text not null,
  note text,
  old_status public.complaint_status,
  new_status public.complaint_status,
  created_at timestamptz not null default now()
);
create index complaint_updates_complaint_id_idx on public.complaint_updates(complaint_id);
grant select, insert on public.complaint_updates to authenticated;
grant all on public.complaint_updates to service_role;
alter table public.complaint_updates enable row level security;
create policy "updates_select_related" on public.complaint_updates for select to authenticated using (
  public.has_role(auth.uid(),'admin')
  or exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = auth.uid())
);
create policy "updates_insert_related" on public.complaint_updates for insert to authenticated with check (
  author_id = auth.uid() and (
    public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.complaints c where c.id = complaint_id and c.student_id = auth.uid())
  )
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger complaints_set_updated_at before update on public.complaints
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.email,''))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, case when new.email ilike '%@admin.edu' then 'admin'::public.app_role else 'student'::public.app_role end)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();