-- New complaint categories
ALTER TYPE public.complaint_category ADD VALUE IF NOT EXISTS 'Projector/Smart Board';
ALTER TYPE public.complaint_category ADD VALUE IF NOT EXISTS 'Electrical';
ALTER TYPE public.complaint_category ADD VALUE IF NOT EXISTS 'Plumbing';
ALTER TYPE public.complaint_category ADD VALUE IF NOT EXISTS 'Academic Issue';

-- Pre-authorized admin allowlist (server-side only)
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_allowlist (email) VALUES ('soorya@admin.edu')
ON CONFLICT (email) DO NOTHING;

-- New signups are always students; admins come only from the allowlist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  is_allowed boolean;
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.email,''))
  on conflict (id) do nothing;

  select exists (
    select 1 from public.admin_allowlist a
    where lower(a.email) = lower(coalesce(new.email,''))
  ) into is_allowed;

  insert into public.user_roles (user_id, role)
  values (new.id, case when is_allowed then 'admin'::public.app_role else 'student'::public.app_role end)
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;

-- Revoke admin from anyone not pre-authorized, ensure they are students
DELETE FROM public.user_roles ur
WHERE ur.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.admin_allowlist a ON lower(a.email) = lower(coalesce(u.email,''))
    WHERE u.id = ur.user_id
  );

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'student'::public.app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT (user_id, role) DO NOTHING;
