-- ============================================================
-- FIX: RLS infinite recursion caused by policies querying the
-- same table they protect (profiles).
-- ============================================================

-- Create a SECURITY DEFINER helper that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;
CREATE POLICY "Only admins can create profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (is_admin());

-- ============================================================
-- seniors
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all seniors" ON seniors;
CREATE POLICY "Admins can update all seniors"
    ON seniors FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Only admins can delete seniors" ON seniors;
CREATE POLICY "Only admins can delete seniors"
    ON seniors FOR DELETE
    USING (is_admin());

-- ============================================================
-- cases
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all cases" ON cases;
CREATE POLICY "Admins can update all cases"
    ON cases FOR UPDATE
    USING (is_admin());

DROP POLICY IF EXISTS "Only admins can delete cases" ON cases;
CREATE POLICY "Only admins can delete cases"
    ON cases FOR DELETE
    USING (is_admin());

-- ============================================================
-- donations
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all donations" ON donations;
CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS "Only admins can manage donations" ON donations;
CREATE POLICY "Only admins can manage donations"
    ON donations FOR ALL
    USING (is_admin());

-- ============================================================
-- expenses
-- ============================================================
DROP POLICY IF EXISTS "Only admins can manage expenses" ON expenses;
CREATE POLICY "Only admins can manage expenses"
    ON expenses FOR ALL
    USING (is_admin());

-- ============================================================
-- documents
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;
CREATE POLICY "Admins can view all documents"
    ON documents FOR SELECT
    USING (is_admin());

DROP POLICY IF EXISTS "Uploader or admin can delete documents" ON documents;
CREATE POLICY "Uploader or admin can delete documents"
    ON documents FOR DELETE
    USING (uploaded_by = auth.uid() OR is_admin());

-- ============================================================
-- case_notes
-- ============================================================
DROP POLICY IF EXISTS "Creator or admin can update case notes" ON case_notes;
CREATE POLICY "Creator or admin can update case notes"
    ON case_notes FOR UPDATE
    USING (created_by = auth.uid() OR is_admin());

-- ============================================================
-- case_activities
-- ============================================================
DROP POLICY IF EXISTS "Volunteer or admin can update activities" ON case_activities;
CREATE POLICY "Volunteer or admin can update activities"
    ON case_activities FOR UPDATE
    USING (volunteer_id = auth.uid() OR is_admin());

-- ============================================================
-- storage.objects
-- ============================================================
DROP POLICY IF EXISTS "Users can view own uploaded documents" ON storage.objects;
CREATE POLICY "Users can view own uploaded documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (owner = auth.uid() OR is_admin())
    );

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (owner = auth.uid() OR is_admin())
    );

DROP POLICY IF EXISTS "Only admins can upload public assets" ON storage.objects;
CREATE POLICY "Only admins can upload public assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'public-assets'
        AND is_admin()
    );
