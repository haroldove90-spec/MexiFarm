-- MediConnect Pro - Refined Seed Data (v3)
-- Run this in Supabase SQL Editor

-- 1. Clear existing data (Optional, use with caution)
-- TRUNCATE patients, inventory, consultations, prescription_fulfillment CASCADE;

-- 2. Patients (Mexican Context)
INSERT INTO patients (nombre, curp, fecha_nacimiento, alergias, contacto_emergencia) VALUES
('Juan Carlos Pérez García', 'PEGJ850101HDFRRN01', '1985-01-01', ARRAY['Penicilina'], 'María López - 555-123-4567'),
('María Elena Rodríguez López', 'ROLM920512MDFRRN05', '1992-05-12', ARRAY['Sulfas', 'AINEs'], 'Roberto Mendoza - 555-987-6543'),
('Carlos Alberto Sánchez Ruiz', 'SARC750820HDFRRN03', '1975-08-20', ARRAY[]::text[], 'Elena Silva - 555-456-7890'),
('Ana Gabriela Martínez Sosa', 'MASA981130MDFRRN09', '1998-11-30', ARRAY['Látex'], 'Sofía Meza - 555-222-3333'),
('Héctor Manuel Jiménez Castro', 'JICH800415HDFRRN02', '1980-04-15', ARRAY['Polen'], 'Laura Castro - 555-888-9999');

-- 3. Inventory (Medicines & Supplies)
INSERT INTO inventory (nombre, categoria, stock_actual, stock_minimo, precio_unitario, unidad) VALUES
('Paracetamol 500mg', 'Analgésico', 50, 20, 45.50, 'Caja c/20'),
('Amoxicilina 500mg', 'Antibiótico', 5, 15, 120.00, 'Caja c/12'),
('Losartán 50mg', 'Otro', 2, 10, 85.00, 'Caja c/30'),
('Metformina 850mg', 'Otro', 30, 15, 65.00, 'Caja c/30'),
('Gasas Estériles 10x10', 'Material de curación', 100, 50, 12.00, 'Paquete'),
('Jeringas 5ml', 'Material de curación', 8, 25, 5.50, 'Pieza'),
('Omeprazol 20mg', 'Otro', 40, 20, 55.00, 'Caja c/14'),
('Ketorolaco 10mg', 'Analgésico', 12, 15, 40.00, 'Caja c/10'),
('Alcohol Etílico 70%', 'Material de curación', 15, 5, 35.00, 'Frasco 500ml'),
('Ceftriaxona 1g IM', 'Antibiótico', 20, 10, 250.00, 'Frasco Ámpula');

-- 4. Previous Consultations (History)
-- Note: Replace '00000000-0000-0000-0000-000000000000' with a real doctor UUID if needed
-- For seeding, we'll use a subquery to get a patient ID

DO $$
DECLARE
    p1_id UUID;
    p2_id UUID;
    doc_id UUID;
BEGIN
    -- Get first two patients
    SELECT id INTO p1_id FROM patients WHERE curp = 'PEGJ850101HDFRRN01';
    SELECT id INTO p2_id FROM patients WHERE curp = 'ROLM920512MDFRRN05';
    
    -- Get current user ID (if running in a session) or use a placeholder
    -- doc_id := auth.uid(); 
    -- For seed, we'll just use a random UUID or assume the first user in auth.users
    SELECT id INTO doc_id FROM auth.users LIMIT 1;

    IF doc_id IS NOT NULL THEN
        -- Consultation 1
        INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json)
        VALUES (p1_id, doc_id, 'Faringoamigdalitis Aguda (J03.9)', 'Reposo, abundantes líquidos y tratamiento antibiótico.', 
                '{"peso": 75, "estatura": 175, "temperatura": 38.5, "presion": "120/80", "imc": 24.5}',
                '[{"nombre": "Amoxicilina 500mg", "dosis": "500mg", "frecuencia": "c/8h", "duracion": "7 días"}]');

        -- Consultation 2
        INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json)
        VALUES (p2_id, doc_id, 'Infección de Vías Urinarias (N39.0)', 'Tratamiento antibiótico y analgésico.', 
                '{"peso": 62, "estatura": 160, "temperatura": 37.2, "presion": "110/70", "imc": 24.2}',
                '[{"nombre": "Ceftriaxona 1g IM", "dosis": "1g", "frecuencia": "Dosis única", "duracion": "1 día"}]');
    END IF;
END $$;
