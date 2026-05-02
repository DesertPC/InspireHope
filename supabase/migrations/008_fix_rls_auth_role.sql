-- Fix RLS policies using deprecated auth.role() = 'authenticated'
-- Replace with auth.uid() IS NOT NULL for reliable authenticated-user checks

-- ============================================================
-- seniors
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view seniors" ON seniors;
CREATE POLICY "Authenticated users can view seniors"
    ON seniors FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create seniors" ON seniors;
CREATE POLICY "Authenticated users can create seniors"
    ON seniors FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- cases
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view cases" ON cases;
CREATE POLICY "Authenticated users can view cases"
    ON cases FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create cases" ON cases;
CREATE POLICY "Authenticated users can create cases"
    ON cases FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- documents
-- ============================================================
DROP POLICY IF EXISTS "Users can view non-confidential documents" ON documents;
CREATE POLICY "Users can view non-confidential documents"
    ON documents FOR SELECT
    USING (is_confidential = false AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON documents;
CREATE POLICY "Authenticated users can upload documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- case_notes
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view case notes" ON case_notes;
CREATE POLICY "Authenticated users can view case notes"
    ON case_notes FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create case notes" ON case_notes;
CREATE POLICY "Authenticated users can create case notes"
    ON case_notes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- case_activities
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view activities" ON case_activities;
CREATE POLICY "Authenticated users can view activities"
    ON case_activities FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create activities" ON case_activities;
CREATE POLICY "Authenticated users can create activities"
    ON case_activities FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
