-- ============================================================
-- EXTENSIONES Y FUNCIONES BASE
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- TABLA: profiles
-- Usuarios del sistema (administradores y voluntarios)
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'volunteer' CHECK (role IN ('admin', 'volunteer')),
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- ============================================================
-- TABLA: seniors
-- Registro de beneficiarios (seniors)
-- ============================================================
CREATE TABLE seniors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    address TEXT,
    city TEXT DEFAULT 'Palm Desert',
    state TEXT DEFAULT 'CA',
    zip_code TEXT DEFAULT '92260',
    phone TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    primary_needs TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{"English"}',
    iehp_member BOOLEAN DEFAULT false,
    iehp_id TEXT,
    housing_status TEXT CHECK (housing_status IN ('stable', 'at_risk', 'homeless', 'temporary')),
    income_level TEXT CHECK (income_level IN ('low', 'moderate', 'above_moderate')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_seniors_updated_at
    BEFORE UPDATE ON seniors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_seniors_name ON seniors(last_name, first_name);
CREATE INDEX idx_seniors_iehp ON seniors(iehp_member);
CREATE INDEX idx_seniors_active ON seniors(is_active);
CREATE INDEX idx_seniors_housing ON seniors(housing_status);
CREATE INDEX idx_seniors_created_by ON seniors(created_by);

-- ============================================================
-- TABLA: cases
-- Casos de gestión asignados a seniors
-- ============================================================
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,
    case_number TEXT NOT NULL UNIQUE DEFAULT 'CASE-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6),
    service_type TEXT NOT NULL CHECK (service_type IN (
        'transportation',
        'housing',
        'wellness',
        'case_management',
        'benefits_navigation',
        'family_crisis',
        'funeral_support',
        'food_assistance',
        'other'
    )),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resources_money_allocated NUMERIC(12,2) DEFAULT 0,
    volunteer_hours_allocated NUMERIC(8,2) DEFAULT 0,
    volunteer_hours_used NUMERIC(8,2) DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE,
    completion_date DATE,
    outcome_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_cases_senior ON cases(senior_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_service ON cases(service_type);
CREATE INDEX idx_cases_assigned ON cases(assigned_to);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_active ON cases(is_active);

-- ============================================================
-- TABLA: donations
-- Registro de donaciones monetarias (Stripe integration)
-- ============================================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'yearly')),
    donation_type TEXT NOT NULL DEFAULT 'general' CHECK (donation_type IN (
        'general',
        'transportation',
        'housing',
        'wellness',
        'funeral_support',
        'food_program',
        'emergency_fund'
    )),
    message TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    tax_receipt_sent BOOLEAN NOT NULL DEFAULT false,
    tax_receipt_number TEXT,
    fee_covered_by_donor BOOLEAN DEFAULT false,
    fee_amount NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2) DEFAULT 0,
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_donations_email ON donations(donor_email);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_date ON donations(created_at);
CREATE INDEX idx_donations_type ON donations(donation_type);
CREATE INDEX idx_donations_stripe ON donations(stripe_payment_intent_id);

-- ============================================================
-- TABLA: expenses
-- Registro de gastos operativos
-- ============================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    category TEXT NOT NULL CHECK (category IN (
        'transportation',
        'housing_assistance',
        'wellness_programs',
        'funeral_support',
        'food_program',
        'utilities',
        'office_supplies',
        'technology',
        'marketing',
        'insurance',
        'legal',
        'staff_salaries',
        'volunteer_expenses',
        'facility_rent',
        'other'
    )),
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'stripe')),
    vendor_name TEXT,
    receipt_number TEXT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    receipt_url TEXT,
    is_reimbursable BOOLEAN DEFAULT false,
    reimbursement_status TEXT CHECK (reimbursement_status IN ('not_applicable', 'pending', 'approved', 'reimbursed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_case ON expenses(case_id);
CREATE INDEX idx_expenses_approved ON expenses(approved_by);

-- ============================================================
-- TABLA: documents
-- Documentos adjuntos (IDs, recibos, formularios)
-- Storage path apunta a bucket privado con signed URLs
-- ============================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    senior_id UUID REFERENCES seniors(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    document_category TEXT NOT NULL CHECK (document_category IN (
        'id_document',
        'medical_record',
        'receipt',
        'application_form',
        'contract',
        'photo',
        'report',
        'correspondence',
        'legal_document',
        'other'
    )),
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    is_confidential BOOLEAN NOT NULL DEFAULT true,
    signed_url TEXT,
    signed_url_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_senior ON documents(senior_id);
CREATE INDEX idx_documents_category ON documents(document_category);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_by);

-- ============================================================
-- TABLA: case_notes
-- Notas y seguimiento de actividades
-- ============================================================
CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'phone_call', 'home_visit', 'meeting', 'referral', 'milestone', 'escalation')),
    content TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_case_notes_updated_at
    BEFORE UPDATE ON case_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_case_notes_case ON case_notes(case_id);
CREATE INDEX idx_case_notes_type ON case_notes(note_type);
CREATE INDEX idx_case_notes_created ON case_notes(created_at);

-- ============================================================
-- TABLA: case_activities
-- Registro de actividades/voluntariado
-- ============================================================
CREATE TABLE case_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'transportation',
        'home_visit',
        'phone_call',
        'administrative',
        'benefits_assistance',
        'housing_search',
        'wellness_check',
        'meal_delivery',
        'funeral_coordination',
        'other'
    )),
    hours_spent NUMERIC(4,2) NOT NULL CHECK (hours_spent > 0),
    miles_driven NUMERIC(6,2) DEFAULT 0,
    description TEXT NOT NULL,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_case_activities_updated_at
    BEFORE UPDATE ON case_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_case_activities_case ON case_activities(case_id);
CREATE INDEX idx_case_activities_volunteer ON case_activities(volunteer_id);
CREATE INDEX idx_case_activities_date ON case_activities(activity_date);

-- ============================================================
-- VISTA: financial_summary
-- Resumen financiero mensual para dashboard
-- ============================================================
CREATE OR REPLACE VIEW financial_summary AS
SELECT
    months.month AS month,
    COALESCE(SUM(d.amount) FILTER (WHERE d.payment_status = 'succeeded'), 0) AS total_donations,
    COALESCE(SUM(d.net_amount) FILTER (WHERE d.payment_status = 'succeeded'), 0) AS net_donations,
    COALESCE(SUM(e.amount), 0) AS total_expenses,
    COALESCE(SUM(d.net_amount) FILTER (WHERE d.payment_status = 'succeeded'), 0) - COALESCE(SUM(e.amount), 0) AS net_balance,
    COUNT(d.id) FILTER (WHERE d.payment_status = 'succeeded') AS donation_count,
    COUNT(e.id) AS expense_count
FROM generate_series(
    (SELECT MIN(created_at) FROM donations),
    now(),
    '1 month'::interval
) AS months(month)
LEFT JOIN donations d ON date_trunc('month', d.created_at) = months.month
LEFT JOIN expenses e ON date_trunc('month', e.created_at) = months.month
GROUP BY months.month
ORDER BY months.month DESC;

-- ============================================================
-- VISTA: case_dashboard
-- Métricas de casos para dashboard
-- ============================================================
CREATE OR REPLACE VIEW case_dashboard AS
SELECT
    c.id AS case_id,
    c.case_number,
    c.status,
    c.priority,
    c.service_type,
    s.first_name || ' ' || s.last_name AS senior_name,
    p.full_name AS assigned_to_name,
    c.resources_money_allocated,
    c.volunteer_hours_allocated,
    c.volunteer_hours_used,
    COALESCE(SUM(e.amount), 0) AS total_expenses,
    COUNT(DISTINCT cn.id) AS note_count,
    COUNT(DISTINCT ca.id) AS activity_count,
    c.start_date,
    c.target_date,
    c.completion_date
FROM cases c
LEFT JOIN seniors s ON c.senior_id = s.id
LEFT JOIN profiles p ON c.assigned_to = p.id
LEFT JOIN expenses e ON c.id = e.case_id
LEFT JOIN case_notes cn ON c.id = cn.case_id
LEFT JOIN case_activities ca ON c.id = ca.case_id
WHERE c.is_active = true
GROUP BY c.id, s.first_name, s.last_name, p.full_name;
