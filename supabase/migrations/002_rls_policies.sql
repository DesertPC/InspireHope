-- ============================================================
-- HABILITAR RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can create profiles"
    ON profiles FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POLÍTICAS: seniors
-- ============================================================
CREATE POLICY "Authenticated users can view seniors"
    ON seniors FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create seniors"
    ON seniors FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update all seniors"
    ON seniors FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Volunteers can update own seniors"
    ON seniors FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Only admins can delete seniors"
    ON seniors FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POLÍTICAS: cases
-- ============================================================
CREATE POLICY "Authenticated users can view cases"
    ON cases FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create cases"
    ON cases FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update all cases"
    ON cases FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Assigned users can update own cases"
    ON cases FOR UPDATE
    USING (assigned_to = auth.uid());

CREATE POLICY "Only admins can delete cases"
    ON cases FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POLÍTICAS: donations
-- ============================================================
CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Donors can view own donations"
    ON donations FOR SELECT
    USING (donor_email = auth.jwt() ->> 'email');

CREATE POLICY "Only admins can manage donations"
    ON donations FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POLÍTICAS: expenses
-- ============================================================
CREATE POLICY "Only admins can manage expenses"
    ON expenses FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Volunteers can view case expenses"
    ON expenses FOR SELECT
    USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = expenses.case_id AND cases.assigned_to = auth.uid()));

-- ============================================================
-- POLÍTICAS: documents
-- ============================================================
CREATE POLICY "Users can view non-confidential documents"
    ON documents FOR SELECT
    USING (is_confidential = false AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view all documents"
    ON documents FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view documents of assigned cases"
    ON documents FOR SELECT
    USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.assigned_to = auth.uid()));

CREATE POLICY "Authenticated users can upload documents"
    ON documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Uploader or admin can delete documents"
    ON documents FOR DELETE
    USING (
        uploaded_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- POLÍTICAS: case_notes
-- ============================================================
CREATE POLICY "Authenticated users can view case notes"
    ON case_notes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create case notes"
    ON case_notes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creator or admin can update case notes"
    ON case_notes FOR UPDATE
    USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================
-- POLÍTICAS: case_activities
-- ============================================================
CREATE POLICY "Authenticated users can view activities"
    ON case_activities FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create activities"
    ON case_activities FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Volunteer or admin can update activities"
    ON case_activities FOR UPDATE
    USING (
        volunteer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
