# 🏥 InspireHope Senior Center — Sistema de Gestión Integral
## Documento Base de Proyecto | Next.js 15 + Supabase SSR + Stripe
### Versión: Abril 2026 | Stack Actualizado

---

## 📋 ÍNDICE
1. [Visión del Proyecto](#1-visión-del-proyecto)
2. [Stack Tecnológico 2026](#2-stack-tecnológico-2026)
3. [Cuentas y Migración](#3-cuentas-y-migración)
4. [Esquema de Base de Datos (SQL)](#4-esquema-de-base-de-datos-sql)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Políticas de Storage](#6-políticas-de-storage)
7. [Configuración Supabase SSR](#7-configuración-supabase-ssr)
8. [Estructura de Carpetas](#8-estructura-de-carpetas)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Guía de Implementación VSCode](#10-guía-de-implementación-vscode)
11. [Stripe Nonprofit Setup](#11-stripe-nonprofit-setup)
12. [Checklist de Migración a Cliente](#12-checklist-de-migración-a-cliente)

---

## 1. VISIÓN DEL PROYECTO

**Organización:** InspireHope Senior Center of Coachella Valley (ISCCV)
**Ubicación:** 73960 Highway 111 #4, Palm Desert, CA 92260
**Status:** 501(c)(3) Nonprofit | EIN: 39-4484811 | NPI: 1184584765
**Contacto:** careisccv@gmail.com | 805-904-7882
**Website:** www.inspirehopeseniors.org

### Módulos Principales:
- 🌐 **Web Pública:** Donaciones (Stripe), Formularios de aplicación, Info servicios
- 🔐 **Dashboard Admin:** Gestión de casos, seguimiento recursos, control gastos
- 📊 **Reportes Financieros:** Balance donaciones vs gastos operativos
- 🌍 **Bilingüe:** Español/Inglés completo (next-intl)
- ♿ **Accesibilidad:** WCAG 2.1 AA compliant
- 🔒 **Seguridad:** RLS estricto, cookies httpOnly, URLs firmadas

---

## 2. STACK TECNOLÓGICO 2026

| Capa | Tecnología | Versión | Nota |
|------|-----------|---------|------|
| Framework | Next.js | 15.2.3+ | CVE-2025-29927 patched [^3^] |
| Lenguaje | TypeScript | ^5.4 | Strict mode |
| Estilos | Tailwind CSS | ^3.4 | Configurado para accesibilidad |
| UI Components | shadcn/ui | latest | Basado en Radix UI |
| Base de Datos | Supabase (PostgreSQL) | latest | SSR con @supabase/ssr |
| Auth | Supabase Auth (cookie-based) | latest | httpOnly, no localStorage [^6^] |
| Storage | Supabase Storage | latest | Buckets privados + públicos |
| Pagos | Stripe | ^14.0 | Nonprofit rate: 2.2% + $0.30 [^10^] |
| Validación | Zod | ^3.22 | Esquemas estrictos |
| i18n | next-intl | ^3.0 | Middleware-based routing |
| Formularios | React Hook Form | ^7.50 | + @hookform/resolvers |
| Fechas | date-fns | ^3.0 | Tree-shakeable |
| Gráficos | Recharts | ^2.12 | Para dashboard |
| Iconos | Lucide React | latest | Accesibles por default |
| Rate Limit | @upstash/ratelimit | latest | Opcional, para auth endpoints [^6^] |

---

## 3. CUENTAS Y MIGRACIÓN

### Estrategia: Desarrollo → Staging → Producción Cliente

| Fase | Timeline | Cuentas | Qué hacer |
|------|----------|---------|-----------|
| **Desarrollo** | Semanas 1-4 | Tuyas (dev) | Desarrollo rápido, pruebas, iteración |
| **Staging** | Semana 5 | Tuyas + Cliente | Migrar schema a Supabase del cliente, probar con datos anonimizados |
| **Producción** | Semana 6 | Cliente (100%) | Go-live, dominio real, Stripe live, GDrive org |

### Servicios a Migrar (orden de dificultad):

| Servicio | Dificultad | Qué Migrar | Consideraciones |
|----------|-----------|-----------|---------------|
| **GitHub** | ⭐ Fácil | Repo + historial | Transfer ownership o fork. Issues/PRs se pierden si no exportas. |
| **Vercel** | ⭐⭐ Moderada | Proyecto + env vars + dominios | Reconectar repo, copiar env vars manualmente, reconfigurar DNS. |
| **Supabase** | ⭐⭐⭐ Compleja | Schema, datos, Storage, Auth, RLS, Edge Functions | **Cuello de botella.** No hay exportar todo. Usar `pg_dump` + reconfigurar manualmente. Auth users no migran automáticamente. |
| **Stripe** | ⭐ Fácil | Cambiar test → live keys | Productos/donaciones se recrean. Cuenta **debe** ser del cliente para go-live. |
| **GDrive** | ⭐⭐ Moderada | Carpetas y permisos | Descargar y re-subir, o usar Google Takeout. |

### Buenas prácticas para facilitar migración:

1. **Nunca hardcodear** URLs o keys. Usar siempre variables de entorno.
2. **Migraciones SQL numeradas** en `supabase/migrations/` (001, 002, 003...).
3. **Seed data separada** en `supabase/seed.sql` — no ejecutar en producción.
4. **Stripe switchable** con variables `STRIPE_TEST_*` y `STRIPE_LIVE_*`.
5. **Documentar credenciales** en password manager del cliente (1Password/Bitwarden).

---

## 4. ESQUEMA DE BASE DE DATOS (SQL)

### 4.0 Extensión y Funciones Base

```sql
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
```

### 4.1 Tabla: `profiles`

```sql
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

-- Índices
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);
```

### 4.2 Tabla: `seniors`

```sql
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
```

### 4.3 Tabla: `cases`

```sql
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
```

### 4.4 Tabla: `donations`

```sql
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
```

### 4.5 Tabla: `expenses`

```sql
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
```

### 4.6 Tabla: `documents`

```sql
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
```

### 4.7 Tabla: `case_notes`

```sql
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
```

### 4.8 Tabla: `case_activities`

```sql
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
```

### 4.9 Vista: `financial_summary`

```sql
-- ============================================================
-- VISTA: financial_summary
-- Resumen financiero mensual para dashboard
-- ============================================================
CREATE OR REPLACE VIEW financial_summary AS
SELECT
    date_trunc('month', d.created_at) AS month,
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
```

### 4.10 Vista: `case_dashboard`

```sql
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
```

---

## 5. ROW LEVEL SECURITY (RLS)

### 5.1 Habilitar RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;
```

### 5.2 Políticas: `profiles`

```sql
-- Ver perfil propio
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins ver todos
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Actualizar perfil propio
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Solo admins crear
CREATE POLICY "Only admins can create profiles"
    ON profiles FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Solo admins eliminar
CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 5.3 Políticas: `seniors`

```sql
-- Todos los autenticados pueden ver
CREATE POLICY "Authenticated users can view seniors"
    ON seniors FOR SELECT
    USING (auth.role() = 'authenticated');

-- Autenticados pueden crear
CREATE POLICY "Authenticated users can create seniors"
    ON seniors FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admins pueden actualizar todos
CREATE POLICY "Admins can update all seniors"
    ON seniors FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Voluntarios pueden actualizar los que crearon
CREATE POLICY "Volunteers can update own seniors"
    ON seniors FOR UPDATE
    USING (created_by = auth.uid());

-- Solo admins eliminar
CREATE POLICY "Only admins can delete seniors"
    ON seniors FOR DELETE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 5.4 Políticas: `cases`

```sql
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
```

### 5.5 Políticas: `donations`

```sql
CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Donors can view own donations"
    ON donations FOR SELECT
    USING (donor_email = auth.jwt() ->> 'email');

CREATE POLICY "Only admins can manage donations"
    ON donations FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### 5.6 Políticas: `expenses`

```sql
CREATE POLICY "Only admins can manage expenses"
    ON expenses FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Volunteers can view case expenses"
    ON expenses FOR SELECT
    USING (EXISTS (SELECT 1 FROM cases WHERE cases.id = expenses.case_id AND cases.assigned_to = auth.uid()));
```

### 5.7 Políticas: `documents`

```sql
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
```

### 5.8 Políticas: `case_notes` y `case_activities`

```sql
-- case_notes
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

-- case_activities
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
```

---

## 6. POLÍTICAS DE STORAGE

### 6.1 Crear Buckets

```sql
-- Bucket privado para documentos confidenciales
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760,
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
);

-- Bucket público para assets (logo, fotos eventos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets',
    'public-assets',
    true,
    5242880,
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/webp'
    ]
);
```

### 6.2 Políticas Storage: `documents` (privado)

```sql
CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view own uploaded documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (
            owner = auth.uid()
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );

CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (
            owner = auth.uid()
            OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    );
```

### 6.3 Políticas Storage: `public-assets`

```sql
CREATE POLICY "Public assets are accessible"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'public-assets');

CREATE POLICY "Only admins can upload public assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'public-assets'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

---

## 7. CONFIGURACIÓN SUPABASE SSR

### 7.1 Cliente del Navegador (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { useMemo } from 'react';

// ❌ ANTI-PATRÓN: No usar singleton global
// import { createBrowserClient } from '@supabase/ssr';
// export const supabase = createBrowserClient(...)

// ✅ CORRECTO: Hook con useMemo para evitar state pollution [^2^]
export function useSupabaseClient() {
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storageKey: 'sb-inspirehope-auth',
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  }, []);

  return supabase;
}
```

### 7.2 Cliente del Servidor (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // El método `set` fue llamado desde un Server Component
            // que no puede modificar cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // El método `remove` fue llamado desde un Server Component
          }
        },
      },
    }
  );
}
```

### 7.3 Cliente Admin/Service Role (`src/lib/supabase/admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

// ⚠️ SOLO para Server Actions y API Routes que necesitan bypass RLS
// NUNCA exponer al cliente
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### 7.4 Middleware (`src/middleware.ts`) — OBLIGATORIO [^2^]

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refrescar sesión en CADA request — esto es crítico [^2^]
  const { data: { session } } = await supabase.auth.getSession();

  // Proteger rutas del dashboard
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (isDashboardRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 7.5 Auth Callback Route (`src/app/auth/callback/route.ts`) [^8^]

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

---

## 8. ESTRUCTURA DE CARPETAS

```
inspirehope-senior-center/
├── .env.local                          # NO commitear
├── .env.example                        # Template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json                     # shadcn/ui config
├── middleware.ts                       # Auth + i18n middleware
│
├── src/
│   ├── app/
│   │   ├── (public)/                   # Rutas públicas
│   │   │   ├── [locale]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── about/
│   │   │   │   ├── programs/
│   │   │   │   ├── donate/
│   │   │   │   ├── apply/
│   │   │   │   ├── contact/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                # Rutas admin (protegidas)
│   │   │   ├── [locale]/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── seniors/
│   │   │   │   │   ├── cases/
│   │   │   │   │   ├── donations/
│   │   │   │   │   ├── expenses/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── settings/
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   └── auth/
│   │   │       └── callback/route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── forms/                      # Formularios reutilizables
│   │   ├── tables/                     # Tablas de datos
│   │   ├── charts/                     # Gráficos dashboard
│   │   ├── cards/                      # Tarjetas info
│   │   └── modals/                     # Modales
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser client (Hook)
│   │   │   ├── server.ts               # Server client
│   │   │   └── admin.ts                # Service role (server-only)
│   │   ├── stripe/
│   │   │   └── index.ts
│   │   ├── validations/
│   │   │   ├── senior.schema.ts
│   │   │   ├── case.schema.ts
│   │   │   ├── donation.schema.ts
│   │   │   └── expense.schema.ts
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   └── messages/
│   │   │       ├── en.json
│   │   │       └── es.json
│   │   └── utils.ts
│   │
│   ├── actions/                          # Server Actions
│   │   ├── seniors.actions.ts
│   │   ├── cases.actions.ts
│   │   ├── donations.actions.ts
│   │   ├── expenses.actions.ts
│   │   ├── documents.actions.ts
│   │   └── auth.actions.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-cases.ts
│   │   └── use-donations.ts
│   │
│   └── types/
│       ├── database.types.ts            # Generado: supabase gen types
│       ├── senior.types.ts
│       ├── case.types.ts
│       └── index.ts
│
├── public/
│   ├── images/
│   └── locales/
│
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql
    │   ├── 002_rls_policies.sql
    │   └── 003_storage_policies.sql
    └── seed.sql
```

---

## 9. VARIABLES DE ENTORNO

### `.env.local` (NO commitear)

```env
# ==========================================
# SUPABASE
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# ==========================================
# STRIPE (TEST MODE — desarrollo)
# ==========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe (LIVE MODE — se activa en producción cliente)
# STRIPE_LIVE_SECRET_KEY=sk_live_...
# STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_LIVE_WEBHOOK_SECRET=whsec_...

# ==========================================
# APP
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME="InspireHope Senior Center"
NEXT_PUBLIC_ORG_ADDRESS="73960 Highway 111 #4, Palm Desert, CA 92260"
NEXT_PUBLIC_ORG_PHONE="805-904-7882"
NEXT_PUBLIC_ORG_EMAIL="careisccv@gmail.com"
NEXT_PUBLIC_ORG_EIN="39-4484811"

# ==========================================
# i18n
# ==========================================
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### `.env.example` (Template para repo)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_LIVE_SECRET_KEY=
STRIPE_LIVE_PUBLISHABLE_KEY=
STRIPE_LIVE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ORG_NAME="InspireHope Senior Center"
NEXT_PUBLIC_ORG_ADDRESS="73960 Highway 111 #4, Palm Desert, CA 92260"
NEXT_PUBLIC_ORG_PHONE="805-904-7882"
NEXT_PUBLIC_ORG_EMAIL="careisccv@gmail.com"
NEXT_PUBLIC_ORG_EIN="39-4484811"
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 10. GUÍA DE IMPLEMENTACIÓN VSCODE

### Paso 1: Inicializar Proyecto

```bash
# Crear proyecto con shadcn/ui
npx shadcn@latest init --yes --template next --base-color stone

# Instalar dependencias
npm install @supabase/supabase-js @supabase/ssr
npm install stripe @stripe/stripe-js
npm install zod react-hook-form @hookform/resolvers
npm install next-intl
npm install date-fns
npm install recharts
npm install lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-toast @radix-ui/react-alert-dialog
npm install clsx tailwind-merge class-variance-authority
npm install -D @types/node @types/react @types/react-dom

# Opcional: Rate limiting
npm install @upstash/ratelimit @upstash/redis
```

### Paso 2: Agregar Componentes shadcn/ui

```bash
npx shadcn add button card input label select textarea table
npx shadcn add dialog alert-dialog toast tabs badge avatar
npx shadcn add dropdown-menu sheet calendar popover separator
npx shadcn add skeleton switch checkbox radio-group scroll-area
npx shadcn add data-table
```

### Paso 3: Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor → New Query
3. Copiar y ejecutar migraciones en orden: `001_initial_schema.sql` → `002_rls_policies.sql` → `003_storage_policies.sql`
4. Generar tipos TypeScript:
   ```bash
   npx supabase gen types typescript --project-id tu-proyecto-id --schema public > src/types/database.types.ts
   ```
5. Copiar archivos de `src/lib/supabase/` (client.ts, server.ts, admin.ts)
6. Crear `middleware.ts` en raíz del proyecto

### Paso 4: Configurar Stripe (Test)

1. Crear cuenta en [stripe.com](https://stripe.com)
2. Obtener API keys de test mode
3. Configurar webhook endpoint local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Crear productos para donaciones:
   - Donación General (one-time)
   - Donación Mensual (recurring)
   - Donación Anual (recurring)

### Paso 5: Configurar i18n

1. Crear `src/lib/i18n/config.ts`
2. Crear archivos de mensajes: `src/lib/i18n/messages/en.json` y `es.json`
3. Configurar `middleware.ts` para routing por locale
4. Crear layout con `NextIntlClientProvider`

### Paso 6: Implementar Auth

1. Crear página `/login` con formulario email/password
2. Crear Server Action `loginAction` en `src/actions/auth.actions.ts`
3. Crear página `/signup` (solo admins pueden invitar)
4. Implementar `signOut` en navbar del dashboard

### Paso 7: Implementar Dashboard

1. Crear layout del dashboard con sidebar navigation
2. Implementar CRUD de seniors (tabla + formulario)
3. Implementar CRUD de cases (tabla + formulario + asignación)
4. Implementar seguimiento de donaciones
5. Implementar control de gastos con aprobación

### Paso 8: Implementar Web Pública

1. Homepage con hero section y servicios
2. Página de donación con Stripe Checkout
3. Formulario de aplicación para servicios (público, no requiere auth)
4. Página de contacto

### Paso 9: Testing y Accesibilidad

1. Verificar RLS policies con diferentes roles
2. Testear flujo de donación end-to-end (Stripe test mode)
3. Validar accesibilidad con axe-core:
   ```bash
   npm install -D @axe-core/react
   ```
4. Verificar contraste de colores (WCAG AA)
5. Testear navegación con teclado
6. Verificar responsive design

---

## 11. STRIPE NONPROFIT SETUP

### Tarifas Stripe para Nonprofits [^10^]

| Tipo | Tarifa | Notas |
|------|--------|-------|
| Standard | 2.9% + $0.30 | Tarifa normal |
| **Nonprofit Discount** | **2.2% + $0.30** | Requiere aplicación y 80%+ donaciones |
| ACH/Bank Transfer | 0.8% (max $5) | Mejor para donaciones grandes [^9^] |
| International | +1.5% | Adicional a tarifa base |

### Requisitos para Nonprofit Discount [^10^]:
- EIN (Employer Identification Number): `39-4484811`
- Carta del IRS confirmando 501(c)(3)
- Confirmación de que 80%+ del volumen serán donaciones deducibles

### Configuración de Productos Stripe

```typescript
// lib/stripe/products.ts
export const STRIPE_PRODUCTS = {
  donation_general: {
    name: 'General Donation',
    description: 'Support our senior programs',
  },
  donation_transportation: {
    name: 'Transportation Program',
    description: 'Help seniors get to medical appointments',
  },
  donation_housing: {
    name: 'Housing Assistance',
    description: 'Support housing stability for seniors',
  },
  donation_monthly: {
    name: 'Monthly Sustainer',
    description: 'Recurring monthly donation',
  },
};
```

### Server Action: Crear Checkout Session

```typescript
// actions/donations.actions.ts
'use server';

import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const donationSchema = z.object({
  amount: z.number().min(1).max(100000),
  donationType: z.enum(['general', 'transportation', 'housing', 'wellness', 'funeral_support', 'food_program', 'emergency_fund']),
  isRecurring: z.boolean().default(false),
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  donorPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  coverFees: z.boolean().default(false),
});

export async function createDonationCheckout(data: z.infer<typeof donationSchema>) {
  const validated = donationSchema.parse(data);

  // Calcular monto con fees si aplica
  let finalAmount = validated.amount;
  let feeAmount = 0;

  if (validated.coverFees) {
    feeAmount = Math.round((validated.amount * 0.022 + 0.30) * 100) / 100;
    finalAmount = validated.amount + feeAmount;
  }

  const session = await stripe.checkout.sessions.create({
    mode: validated.isRecurring ? 'subscription' : 'payment',
    payment_method_types: ['card', 'us_bank_account'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Donation - ${validated.donationType}`,
          description: validated.message || 'Thank you for supporting InspireHope',
        },
        unit_amount: Math.round(finalAmount * 100),
        ...(validated.isRecurring && { recurring: { interval: 'month' } }),
      },
      quantity: 1,
    }],
    metadata: {
      donor_name: validated.donorName,
      donor_email: validated.donorEmail,
      donation_type: validated.donationType,
      is_anonymous: String(validated.isAnonymous),
      fee_covered: String(validated.coverFees),
      fee_amount: String(feeAmount),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/cancel`,
    customer_email: validated.donorEmail,
  });

  return { sessionId: session.id, url: session.url };
}
```

---

## 12. CHECKLIST DE MIGRACIÓN A CLIENTE

### Pre-migración
- [ ] MVP aprobado por cliente
- [ ] Tests pasan al 100%
- [ ] Documentación de usuario lista
- [ ] Datos de prueba identificados y listos para limpiar

### GitHub → Cuenta del Cliente
- [ ] Transferir repo o crear fork en organización del cliente
- [ ] Configurar branch protection rules (main requiere PR)
- [ ] Invitar a colaboradores (cliente como owner/admin)
- [ ] Configurar GitHub Actions para CI/CD

### Supabase → Cuenta del Cliente
- [ ] Crear nuevo proyecto en Supabase (cuenta cliente)
- [ ] Ejecutar migraciones SQL en orden (001, 002, 003...)
- [ ] Reconfigurar Storage buckets (documents + public-assets)
- [ ] Reconfigurar RLS policies
- [ ] NO ejecutar seed.sql (datos de prueba)
- [ ] Generar nuevas API keys (anon + service role)
- [ ] Actualizar `.env.local` del cliente
- [ ] Probar autenticación con usuario de prueba
- [ ] **IMPORTANTE:** Auth users NO migran automáticamente. Planificar re-registro o exportar tabla `auth.users` vía SQL.

### Vercel → Cuenta del Cliente
- [ ] Crear nuevo proyecto en Vercel (cuenta cliente)
- [ ] Conectar con repo de GitHub del cliente
- [ ] Copiar variables de entorno UNA POR UNA (no hay export)
- [ ] Configurar dominio personalizado (inspirehopeseniors.org)
- [ ] Configurar DNS records (CNAME/A records)
- [ ] Verificar preview deployments funcionan
- [ ] Configurar Vercel Analytics (opcional)

### Stripe → Cuenta del Cliente
- [ ] Cliente crea cuenta Stripe con email oficial
- [ ] Completar verificación KYC del cliente
- [ ] Aplicar para nonprofit discount (2.2% + $0.30)
    - Subir: EIN 39-4484811, carta IRS 501(c)(3)
    - Confirmar 80%+ volumen = donaciones
- [ ] Recrear productos de donación en modo live
- [ ] Configurar webhook endpoint nuevo (producción)
- [ ] Obtener live keys y actualizar `.env`
- [ ] Hacer donación de prueba con $1 real
- [ ] Verificar webhook recibe eventos correctamente

### GDrive → Cuenta del Cliente
- [ ] Crear Google Workspace o usar cuenta Gmail del cliente
- [ ] Crear carpeta compartida para documentos organización
- [ ] Configurar permisos (solo admins pueden ver confidenciales)
- [ ] Actualizar service account en `.env`
- [ ] Migrar documentos existentes (descargar + re-subir)

### Post-migración
- [ ] Borrar datos de prueba de Supabase personal
- [ ] Revocar API keys antiguas (Supabase, Stripe)
- [ ] Documentar credenciales en password manager del cliente
- [ ] Crear documento "Admin Guide" para equipo del cliente
- [ ] Capacitación al equipo del cliente (2-3 horas)
- [ ] Configurar monitoreo (Vercel + Supabase)
- [ ] Plan de backup automático (Supabase tiene PITR)
- [ ] Configurar alertas de errores (Sentry opcional)

---

## 📎 ANEXOS

### A. Tipos de Servicios (IEHP Alignment)

| Servicio InspireHope | Programa IEHP | Código DB |
|---------------------|---------------|-----------|
| Housing Navigation | Community Supports (CS) | housing |
| Transportation | Community Supports (CS) | transportation |
| Nutrition Resource | Community Supports (CS) | food_assistance |
| Case Management | Enhanced Care Management (ECM) | case_management |
| Wellness Monitoring | Enhanced Care Management (ECM) | wellness |
| Benefits Navigation | Enhanced Care Management (ECM) | benefits_navigation |

### B. Información de Contacto Organización

| Campo | Valor |
|-------|-------|
| Nombre | InspireHope Senior Center of Coachella Valley |
| Dirección | 73960 Highway 111 #4, Palm Desert, CA 92260 |
| Teléfono | 805-904-7882 |
| Email | careisccv@gmail.com |
| Website | www.inspirehopeseniors.org |
| EIN | 39-4484811 |
| NPI | 1184584765 |
| Status | 501(c)(3) Nonprofit |

### C. Board of Directors (ISCCV)

| Rol | Nombre |
|-----|--------|
| Chairman | Mike Noroozy |
| President | Mohammed Bawaneh |
| Secretary | Erika Ramirez |
| Trustee | Ainka Messary |

---

*Documento generado para el desarrollo del Sistema de Gestión Integral de InspireHope Senior Center*
*Fecha: Abril 2026 | Stack: Next.js 15 + Supabase SSR + Stripe Nonprofit*
