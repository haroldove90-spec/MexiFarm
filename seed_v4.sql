-- MediConnect Pro - Seed Data v4
-- 10 Patients, 5 Appointments, 10 Inventory Items, 3 Consultations

-- 1. Patients
INSERT INTO patients (nombre, curp, fecha_nacimiento, alergias, contacto_emergencia) VALUES
('Alejandro Ruiz', 'RUIA850101HDFRRN01', '1985-01-01', ARRAY['Penicilina'], '555-123-4567'),
('Beatriz Mendoza', 'MENB920512MDFRRN05', '1992-05-12', ARRAY['Sulfas'], '555-987-6543'),
('Carlos Sánchez', 'SANC750820HDFRRN03', '1975-08-20', ARRAY[]::text[], '555-456-7890'),
('Daniela Torres', 'TORD981130MDFRRN09', '1998-11-30', ARRAY['Látex'], '555-222-3333'),
('Eduardo Jiménez', 'JIME800415HDFRRN02', '1980-04-15', ARRAY['Polen'], '555-888-9999'),
('Fernanda Castro', 'CASF880722MDFRRN07', '1988-07-22', ARRAY['AINEs'], '555-111-2222'),
('Gerardo Ortiz', 'ORTG720310HDFRRN04', '1972-03-10', ARRAY[]::text[], '555-333-4444'),
('Hilda Vargas', 'VARH950925MDFRRN08', '1995-09-25', ARRAY['Nueces'], '555-555-6666'),
('Iván López', 'LOPI821212HDFRRN06', '1982-12-12', ARRAY['Polvo'], '555-777-8888'),
('Julia Méndez', 'MENJ900606MDFRRN01', '1990-06-06', ARRAY[]::text[], '555-999-0000');

-- 2. Inventory
INSERT INTO inventory (nombre, categoria, stock_actual, stock_minimo, precio_unitario, unidad) VALUES
('Paracetamol 500mg', 'Analgésico', 50, 10, 45.00, 'Caja c/20'),
('Amoxicilina 500mg', 'Antibiótico', 4, 10, 120.00, 'Caja c/12'), -- Stock Bajo
('Losartán 50mg', 'Otro', 3, 5, 85.00, 'Caja c/30'), -- Stock Bajo
('Metformina 850mg', 'Otro', 30, 10, 65.00, 'Caja c/30'),
('Gasas Estériles', 'Material de curación', 100, 20, 12.00, 'Paquete'),
('Jeringas 5ml', 'Material de curación', 2, 10, 5.00, 'Pieza'), -- Stock Bajo
('Omeprazol 20mg', 'Otro', 40, 15, 55.00, 'Caja c/14'),
('Ketorolaco 10mg', 'Analgésico', 12, 10, 40.00, 'Caja c/10'),
('Alcohol 70%', 'Material de curación', 15, 5, 35.00, 'Frasco'),
('Ceftriaxona 1g', 'Antibiótico', 20, 5, 250.00, 'Frasco');

-- 3. Appointments & Consultations (Using a DO block to handle IDs)
DO $$
DECLARE
    p1_id UUID;
    p2_id UUID;
    p3_id UUID;
    p4_id UUID;
    p5_id UUID;
    doc_id UUID;
BEGIN
    SELECT id INTO p1_id FROM patients WHERE curp = 'RUIA850101HDFRRN01';
    SELECT id INTO p2_id FROM patients WHERE curp = 'MENB920512MDFRRN05';
    SELECT id INTO p3_id FROM patients WHERE curp = 'SANC750820HDFRRN03';
    SELECT id INTO p4_id FROM patients WHERE curp = 'TORD981130MDFRRN09';
    SELECT id INTO p5_id FROM patients WHERE curp = 'JIME800415HDFRRN02';
    
    -- Get first user from auth.users (assuming at least one exists)
    SELECT id INTO doc_id FROM auth.users LIMIT 1;

    IF doc_id IS NOT NULL THEN
        -- 5 Appointments for this week
        INSERT INTO appointments (patient_id, doctor_id, start_time, end_time, title) VALUES
        (p1_id, doc_id, NOW() + interval '1 day', NOW() + interval '1 day 30 minutes', 'Consulta General - Alejandro'),
        (p2_id, doc_id, NOW() + interval '2 days', NOW() + interval '2 days 30 minutes', 'Seguimiento - Beatriz'),
        (p3_id, doc_id, NOW() + interval '1 day 2 hours', NOW() + interval '1 day 2 hours 30 minutes', 'Revisión - Carlos'),
        (p4_id, doc_id, NOW() + interval '3 days', NOW() + interval '3 days 30 minutes', 'Consulta - Daniela'),
        (p5_id, doc_id, NOW() + interval '4 days', NOW() + interval '4 days 30 minutes', 'Urgencia - Eduardo');

        -- 3 Consultations
        INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json) VALUES
        (p1_id, doc_id, 'Faringitis Aguda (J02.9)', 'Reposo y abundantes líquidos.', '{"peso": 75, "estatura": 175, "temperatura": 38.5, "presion": "120/80"}', '[{"nombre": "Paracetamol 500mg", "dosis": "1 cada 8h"}]'),
        (p2_id, doc_id, 'Infección Urinaria (N39.0)', 'Tratamiento antibiótico por 7 días.', '{"peso": 62, "estatura": 160, "temperatura": 37.2, "presion": "110/70"}', '[{"nombre": "Amoxicilina 500mg", "dosis": "1 cada 12h"}]'),
        (p3_id, doc_id, 'Hipertensión Esencial (I10)', 'Control de dieta y ejercicio.', '{"peso": 85, "estatura": 180, "temperatura": 36.6, "presion": "145/95"}', '[{"nombre": "Losartán 50mg", "dosis": "1 diaria"}]');
    END IF;
END $$;
