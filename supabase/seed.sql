-- ============================================================
-- SEED DATA — InspireHope Senior Center
-- DATOS DE PRUEBA (NO ejecutar en producción)
--
-- IMPORTANTE:
-- 1. Primero crea un usuario admin en Auth (Sign Up vía app o SQL Editor)
-- 2. Obtén el UUID del usuario auth.users.id
-- 3. Reemplaza '00000000-0000-0000-0000-000000000001' con ese UUID real
-- 4. Luego ejecuta este script
-- ============================================================

-- ============================================================
-- 1. PERFIL ADMIN (requiere usuario existente en auth.users)
-- ============================================================
-- Perfil admin (vinculado al usuario creado en Auth)
INSERT INTO profiles (id, email, full_name, role, phone, is_active)
VALUES (
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf',
    'admin@inspirehope.local',
    'Admin User',
    'admin',
    '805-904-7882',
    true
);

-- ============================================================
-- 2. SENIORS (Beneficiarios)
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
    'Necesita transporte recurrente a citas médicas en Eisenhower Medical Center. Usa andador.',
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
    'Vive solo, inglés limitado. Necesita ayuda con renovación de Medicaid y solicitud de SNAP.',
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
    'Viuda, vive con su hija. Necesita chequeos de bienestar semanales y apoyo con grief counseling.',
    true
);

-- ============================================================
-- 3. CASES (Casos de gestión)
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
    'Transporte semanal a citas de oncología en Eisenhower Medical Center. Paciente requiere asistencia para subir/bajar del vehículo.',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf',
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
    'Renovación de Medicaid (Medi-Cal) vence en 30 días. Paciente no ha recibido correos por cambio de dirección. También solicitar SNAP y housing voucher.',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf',
    0.00,
    15.00,
    '2026-04-10',
    '2026-05-10',
    NULL,
    true
);

-- ============================================================
-- 4. DONATIONS (Donaciones)
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
);

-- ============================================================
-- 5. EXPENSES (Gastos operativos)
-- ============================================================
INSERT INTO expenses (
    description, amount, category, payment_method, vendor_name,
    receipt_number, expense_date, case_id, notes, is_reimbursable
) VALUES
(
    'Gasolina - transporte Margaret Henderson (semana 1-15 Abr)',
    145.50,
    'transportation',
    'credit_card',
    'Shell Palm Desert',
    'RCP-2026-0415-001',
    '2026-04-15',
    '44444444-4444-4444-4444-444444444444',
    'Recibo guardado en Dropbox. 6 viajes ida y vuelta a Eisenhower.',
    false
),
(
    'Comestibles emergencia - Roberto Martinez',
    87.23,
    'food_program',
    'debit_card',
    'Stater Bros',
    'SB-2026-0412-8821',
    '2026-04-12',
    '55555555-5555-5555-5555-555555555555',
    'Canasta básica de emergencia mientras se aprueba SNAP.',
    false
),
(
    'Papelera, carpetas, toners impresora',
    124.99,
    'office_supplies',
    'credit_card',
    'Office Depot',
    'OD-2026-0401-4452',
    '2026-04-01',
    NULL,
    'Suministros oficina Q2.',
    false
);

-- ============================================================
-- 6. CASE NOTES
-- ============================================================
INSERT INTO case_notes (
    case_id, note_type, content, contact_name, contact_phone,
    follow_up_required, follow_up_date, created_by
) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'phone_call',
    'Llamada con Margaret. Confirma cita oncología 22 Abr a las 10:30am. Necesita recogida 9:45am. Su hija Susan no puede llevarla ese día.',
    'Margaret Henderson',
    '760-555-0101',
    true,
    '2026-04-21',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf'
),
(
    '55555555-5555-5555-5555-555555555555',
    'home_visit',
    'Visita domiciliaria con Roberto. Explicamos formularios de renovación Medi-Cal en español. Documentos incompletos: falta prueba de residencia actual.',
    'Roberto Martinez',
    '760-555-0201',
    true,
    '2026-04-18',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf'
);

-- ============================================================
-- 7. CASE ACTIVITIES
-- ============================================================
INSERT INTO case_activities (
    case_id, volunteer_id, activity_type, hours_spent, miles_driven,
    description, activity_date
) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf',
    'transportation',
    2.50,
    24.00,
    'Transporte ida y vuelta Eisenhower Medical Center. Espera en lobby durante cita.',
    '2026-04-08'
),
(
    '55555555-5555-5555-5555-555555555555',
    'fb1583ac-cc93-4c08-b3b6-b4c6a1b448bf',
    'benefits_assistance',
    3.00,
    0,
    'Revisión de documentos Medi-Cal, traducción de formularios, llamada a IEHP member services.',
    '2026-04-12'
);
