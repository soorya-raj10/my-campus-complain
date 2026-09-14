-- 1. Link complaints to a real staff account
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS assigned_staff_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS complaints_assigned_staff_id_idx ON public.complaints (assigned_staff_id);

-- 2. Staff read/update access to their own assigned complaints
CREATE POLICY complaints_select_staff ON public.complaints
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND assigned_staff_id = auth.uid());

CREATE POLICY complaints_update_staff ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'staff') AND assigned_staff_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'staff') AND assigned_staff_id = auth.uid());

-- 3. Staff may only change status + resolution details
CREATE OR REPLACE FUNCTION public.restrict_staff_complaint_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if auth.uid() is null then return new; end if;
  if public.has_role(auth.uid(), 'admin') then return new; end if;
  if public.has_role(auth.uid(), 'staff') and old.assigned_staff_id = auth.uid() then
    new.student_id := old.student_id;
    new.title := old.title;
    new.category := old.category;
    new.description := old.description;
    new.location := old.location;
    new.priority := old.priority;
    new.assigned_department := old.assigned_department;
    new.assigned_staff := old.assigned_staff;
    new.assigned_staff_id := old.assigned_staff_id;
    new.attachment := old.attachment;
    new.admin_comments := old.admin_comments;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.restrict_staff_complaint_update() FROM authenticated, anon;

DROP TRIGGER IF EXISTS complaints_restrict_staff_update ON public.complaints;
CREATE TRIGGER complaints_restrict_staff_update
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.restrict_staff_complaint_update();

-- 4. Timeline access for staff
DROP POLICY IF EXISTS updates_select_related ON public.complaint_updates;
CREATE POLICY updates_select_related ON public.complaint_updates
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_updates.complaint_id
        AND (c.student_id = auth.uid() OR c.assigned_staff_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS updates_insert_related ON public.complaint_updates;
CREATE POLICY updates_insert_related ON public.complaint_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.complaints c
        WHERE c.id = complaint_updates.complaint_id
          AND (c.student_id = auth.uid() OR c.assigned_staff_id = auth.uid())
      )
    )
  );

-- 5. Staff can see the students behind their assigned complaints
CREATE POLICY profiles_select_assigned_staff ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'staff')
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.assigned_staff_id = auth.uid() AND c.student_id = profiles.id
    )
  );

-- 6. Admin role management (staff/student only; no admin escalation)
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY user_roles_select_admin ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_insert_admin ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND role <> 'admin');

CREATE POLICY user_roles_delete_admin ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND role <> 'admin');

-- 7. Admins need to see every profile to run role management (policy already exists) and
--    staff must be listed for assignment: allow admins to read all roles (covered above).
