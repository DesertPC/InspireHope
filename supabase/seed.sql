-- ============================================================
-- SEED DATA — InspireHope Senior Center
-- DATOS DE PRUEBA (ejecutar en Supabase SQL Editor)
--
-- NOTA: No insertamos en 'profiles' porque requiere que el usuario
-- exista primero en auth.users (creado via Sign Up u OAuth).
-- Usamos ON CONFLICT DO NOTHING para poder re-ejecutar sin errores.
-- ============================================================

-- ============================================================
-- 1. SENIORS (Beneficiarios)
-- ============================================================
INSERT INTO seniors (
    id, first_name, last_name, date_of_birth, address, city, state, zip_code,
    phone, email, emergency_contact_name, emergency_contact_phone,
    primary_needs, languages, iehp_member, iehp_id, housing_status, income_level,
    notes, is_active
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Margaret', 'Henderson',
    '1948-03-15',
    '74250 Desert Flower Dr',
    'Palm Desert', 'CA', '92260',
    '760-555-0101',
    'm.henderson@email.local',
    'Susan Henderson',
    '760-555-0102',
    ARRAY['transportation', 'medical_appointments'],
    ARRAY['English'],
    true,
    'IEHP12345678',
    'stable',
    'low',
    'Needs recurring transportation to medical appointments at Eisenhower Medical Center. Uses a walker.',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Roberto', 'Martinez',
    '1942-07-22',
    '45290 Calle Barcelona',
    'La Quinta', 'CA', '92253',
    '760-555-0201',
    'r.martinez@email.local',
    'Elena Martinez',
    '760-555-0202',
    ARRAY['housing', 'food_assistance', 'benefits_navigation'],
    ARRAY['Spanish', 'English'],
    true,
    'IEHP87654321',
    'at_risk',
    'low',
    'Lives alone, limited English. Needs help with Medicaid renewal and SNAP application.',
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Dorothy', 'Williams',
    '1935-11-08',
    '38912 Vista Del Sol',
    'Rancho Mirage', 'CA', '92270',
    '760-555-0301',
    NULL,
    'James Williams',
    '760-555-0302',
    ARRAY['wellness', 'case_management'],
    ARRAY['English'],
    false,
    NULL,
    'stable',
    'moderate',
    'Widow, lives with daughter. Needs weekly wellness check-ins and grief counseling support.',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. CASES (Casos de gestión) — assigned_to dejado como NULL
-- ============================================================
INSERT INTO cases (
    id, senior_id, case_number, service_type, status, priority,
    description, assigned_to, resources_money_allocated, volunteer_hours_allocated,
    start_date, target_date, outcome_notes, is_active
) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'CASE-20260415-A1B2C3',
    'transportation',
    'in_progress',
    'high',
    'Weekly transportation to oncology appointments at Eisenhower Medical Center. Patient requires assistance getting in/out of vehicle.',
    NULL,
    500.00,
    20.00,
    '2026-04-01',
    '2026-06-30',
    NULL,
    true
),
(
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'CASE-20260410-D4E5F6',
    'benefits_navigation',
    'open',
    'urgent',
    'Medicaid (Medi-Cal) renewal expires in 30 days. Patient has not received mail due to address change. Also applying for SNAP and housing voucher.',
    NULL,
    0.00,
    15.00,
    '2026-04-10',
    '2026-05-10',
    NULL,
    true
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. DONATIONS (Donaciones)
-- ============================================================
INSERT INTO donations (
    donor_name, donor_email, donor_phone, amount, currency,
    payment_status, is_recurring, recurring_interval, donation_type,
    message, is_anonymous, fee_covered_by_donor, fee_amount, net_amount
) VALUES
(
    'John Miller', 'john.miller@donor.local', '619-555-0401',
    250.00, 'USD',
    'succeeded', false, NULL, 'general',
    'In memory of my mother who loved this community.',
    false, true, 5.80, 244.20
),
(
    'Anonymous Donor', 'anonymous@donor.local', NULL,
    1000.00, 'USD',
    'succeeded', true, 'monthly', 'transportation',
    'Keep up the great work helping seniors get to their appointments.',
    true, true, 23.20, 976.80
),
(
    'Sarah Chen', 's.chen@donor.local', '510-555-0501',
    75.00, 'USD',
    'succeeded', false, NULL, 'food_program',
    NULL,
    false, false, 0, 75.00
),
(
    'Coachella Valley Rotary', 'rotary@cvrotary.local', '760-555-0601',
    5000.00, 'USD',
    'succeeded', false, NULL, 'general',
    'Annual charity donation from our spring gala.',
    false, true, 113.20, 4886.80
),
(
    'Test Pending', 'test@pending.local', NULL,
    50.00, 'USD',
    'pending', false, NULL, 'wellness',
    NULL,
    false, false, 0, 0
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. EXPENSES (Gastos operativos)
-- ============================================================
INSERT INTO expenses (
    description, amount, category, payment_method, vendor_name,
    receipt_number, expense_date, case_id, notes, is_reimbursable
) VALUES
(
    'Gasoline - Margaret Henderson transport (week Apr 1-15)',
    145.50,
    'transportation',
    'credit_card',
    'Shell Palm Desert',
    'RCP-2026-0415-001',
    '2026-04-15',
    '44444444-4444-4444-4444-444444444444',
    'Receipt saved in Dropbox. 6 round trips to Eisenhower.',
    false
),
(
    'Emergency groceries - Roberto Martinez',
    87.23,
    'food_program',
    'debit_card',
    'Stater Bros',
    'SB-2026-0412-8821',
    '2026-04-12',
    '55555555-5555-5555-5555-555555555555',
    'Emergency basic food basket while SNAP is being approved.',
    false
),
(
    'Office supplies - paper, folders, printer toner',
    124.99,
    'office_supplies',
    'credit_card',
    'Office Depot',
    'OD-2026-0401-4452',
    '2026-04-01',
    NULL,
    'Q2 office supplies.',
    false
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. TESTIMONIALS (aprobados para que aparezcan en la web)
-- ============================================================
INSERT INTO testimonials (name, email, content, status, rating) VALUES
(
    'Margaret Henderson',
    'm.henderson@email.local',
    'InspireHope has been a blessing for me. I can no longer drive, and their volunteer drivers take me to all my medical appointments. The staff is kind, patient, and always on time. I do not know what I would do without them.',
    'approved',
    5
),
(
    'Roberto Martinez',
    'r.martinez@email.local',
    'As a Spanish speaker, it is sometimes difficult to navigate the healthcare system. The InspireHope team helped me renew my Medi-Cal and apply for SNAP. They speak Spanish and truly care about seniors.',
    'approved',
    5
),
(
    'Susan Henderson',
    'susan.h@email.local',
    'My mother Margaret has been using InspireHope services for three months now. The transportation assistance has been life-changing for our family. We are so grateful this organization exists in the Coachella Valley.',
    'approved',
    4
),
(
    'Elena Martinez',
    'elena.m@email.local',
    'InspireHope helped my father Roberto when he was at risk of losing his housing. They connected him with rental assistance and food programs. The case managers follow up regularly. Truly exceptional service.',
    'approved',
    5
)
ON CONFLICT DO NOTHING;
