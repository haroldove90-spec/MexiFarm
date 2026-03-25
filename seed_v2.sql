-- Seed Data V2 for MediConnect (Supabase SQL)

-- 1. Patients (Mexican Names & Real CURPs)
INSERT INTO patients (nombre, curp, fecha_nacimiento, alergias, contacto_emergencia) VALUES
('Alejandro Ruiz Esparza', 'RUEA880415HDFRRN01', '1988-04-15', ARRAY['Penicilina'], 'Esposa: Laura Ruiz - 5512345678'),
('Ximena Torres Mendoza', 'TOMX951220MDFRRN02', '1995-12-20', ARRAY['Sulfas'], 'Madre: Rosa Mendoza - 5598765432'),
('Gerardo López Obrador', 'LOOG700110HDFRRN03', '1970-01-10', ARRAY[]::text[], 'Hijo: Daniel López - 5544332211'),
('Beatriz Gutiérrez Müller', 'GUMB720315MDFRRN04', '1972-03-15', ARRAY['AINEs (Ketorolaco)'], 'Esposo: Andrés Manuel - 5566778899'),
('Mateo Velázquez Silva', 'VESM050812HDFRRN05', '2005-08-12', ARRAY['Polen', 'Lactosa'], 'Padre: Jorge Velázquez - 5500112233');

-- 2. Inventory Items (Mexican Market)
INSERT INTO inventory (nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, unidad) VALUES
('Paracetamol 500mg', 'Analgésico y antipirético (Caja 20 tabs)', 'Analgésico', 100, 20, 45.50, 'Caja'),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro (Caja 12 caps)', 'Antibiótico', 15, 25, 120.00, 'Caja'), -- Stock Bajo
('Losartán 50mg', 'Antihipertensivo (Caja 30 tabs)', 'Otro', 40, 15, 85.00, 'Caja'),
('Metformina 850mg', 'Hipoglucemiante oral (Caja 30 tabs)', 'Otro', 2, 10, 65.00, 'Caja'), -- Stock Bajo
('Ketorolaco 10mg', 'Analgésico potente (Caja 10 tabs)', 'Analgésico', 5, 15, 55.00, 'Caja'), -- Stock Bajo
('Gasa Estéril 10x10', 'Material de curación (Paquete 10 pzas)', 'Material de curación', 200, 50, 25.00, 'Paquete'),
('Alcohol Etílico 70%', 'Desinfectante (Frasco 500ml)', 'Material de curación', 8, 15, 42.00, 'Frasco'), -- Stock Bajo
('Ceftriaxona 1g IM', 'Antibiótico inyectable (1 ampolleta)', 'Antibiótico', 25, 10, 180.00, 'Ampolleta'),
('Diclofenaco 100mg', 'Antiinflamatorio (Caja 20 tabs)', 'Analgésico', 60, 20, 75.00, 'Caja'),
('Jeringas 5ml', 'Material de aplicación (Caja 100 pzas)', 'Material de curación', 150, 100, 2.50, 'Pieza');

-- 3. Consultations (Assuming doctor_id and patient_id exist)
INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id,
  'Hipertensión Arterial Esencial (I10)',
  'Continuar con Losartán 50mg cada 12h. Dieta hiposódica.',
  '{"presion": "140/90", "temperatura": 36.5, "peso": 82.5}'::jsonb,
  NOW() - INTERVAL '3 days'
FROM patients LIMIT 1;

INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id,
  'Diabetes Mellitus Tipo 2 (E11.9)',
  'Metformina 850mg cada 12h. Control de glucosa capilar.',
  '{"presion": "120/80", "temperatura": 36.7, "peso": 75.0}'::jsonb,
  NOW() - INTERVAL '2 days'
FROM patients OFFSET 1 LIMIT 1;

INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id,
  'Infección de Vías Urinarias (N39.0)',
  'Amoxicilina 500mg cada 8h por 7 días. Abundantes líquidos.',
  '{"presion": "115/75", "temperatura": 37.8, "peso": 68.2}'::jsonb,
  NOW() - INTERVAL '1 day'
FROM patients OFFSET 2 LIMIT 1;

-- 4. Prescription Fulfillment
INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'surtido', NOW() - INTERVAL '3 days' FROM consultations LIMIT 1;

INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'pendiente', NOW() - INTERVAL '2 days' FROM consultations OFFSET 1 LIMIT 1;

INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'pendiente', NOW() - INTERVAL '1 day' FROM consultations OFFSET 2 LIMIT 1;
