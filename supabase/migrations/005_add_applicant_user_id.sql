-- Add applicant_user_id to cases table for applicant portal
ALTER TABLE cases ADD COLUMN applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for fast lookup
CREATE INDEX idx_cases_applicant_user ON cases(applicant_user_id);

-- RLS: Applicants can view their own cases
CREATE POLICY "Applicants can view own cases"
    ON cases FOR SELECT
    USING (applicant_user_id = auth.uid());

-- RLS: Applicants can create cases (when applying)
CREATE POLICY "Applicants can create cases"
    ON cases FOR INSERT
    WITH CHECK (applicant_user_id = auth.uid());

-- RLS: Applicants can update their own cases (add requests)
CREATE POLICY "Applicants can update own cases"
    ON cases FOR UPDATE
    USING (applicant_user_id = auth.uid());

-- RLS: Applicants can view own case notes
CREATE POLICY "Applicants can view own case notes"
    ON case_notes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM cases WHERE cases.id = case_notes.case_id AND cases.applicant_user_id = auth.uid()
    ));

-- RLS: Applicants can create case notes (requests)
CREATE POLICY "Applicants can create case notes"
    ON case_notes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM cases WHERE cases.id = case_notes.case_id AND cases.applicant_user_id = auth.uid()
    ));

-- RLS: Applicants can view own case activities
CREATE POLICY "Applicants can view own case activities"
    ON case_activities FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM cases WHERE cases.id = case_activities.case_id AND cases.applicant_user_id = auth.uid()
    ));

-- RLS: Applicants can view non-confidential documents of their cases
CREATE POLICY "Applicants can view case documents"
    ON documents FOR SELECT
    USING (
        is_confidential = false
        AND EXISTS (
            SELECT 1 FROM cases WHERE cases.id = documents.case_id AND cases.applicant_user_id = auth.uid()
        )
    );
