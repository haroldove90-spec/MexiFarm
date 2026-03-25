-- Seed Data for MediConnect (Supabase SQL)

-- 1. Patients
INSERT INTO patients (nombre, curp, fecha_nacimiento, alergias) VALUES
('María García López', 'GALM850512HDFRRM01', '1985-05-12', ARRAY['Penicilina']),
('Juan Carlos Martínez', 'MARJ921020HDFRRM02', '1992-10-20', ARRAY['AINEs (Ibuprofeno)']),
('Elena Rodríguez Ruiz', 'RORE780315MDFRRM03', '1978-03-15', ARRAY[]::text[]),
('Roberto Sánchez Díaz', 'SADR651130HDFRRM04', '1965-11-30', ARRAY['Lactosa', 'Sulfa']),
('Sofía Hernández Cruz', 'HECS980725MDFRRM05', '1998-07-25', ARRAY['Polen']);

-- 2. Inventory Items
INSERT INTO inventory (nombre, descripcion, categoria, stock_actual, stock_minimo, unidad) VALUES
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibiótico', 50, 20, 'Caja'),
('Paracetamol 500mg', 'Analgésico y antipirético', 'Analgésico', 100, 30, 'Caja'),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Analgésico', 15, 25, 'Caja'), -- Stock Bajo
('Gasa Estéril 10x10', 'Material de curación básico', 'Material de curación', 200, 50, 'Paquete'),
('Alcohol Etílico 70%', 'Desinfectante de superficies y piel', 'Material de curación', 5, 10, 'Frasco'), -- Stock Bajo
('Ceftriaxona 1g IM', 'Antibiótico inyectable', 'Antibiótico', 12, 15, 'Ampolleta'), -- Stock Bajo
('Ketorolaco 10mg', 'Analgésico potente', 'Analgésico', 45, 20, 'Caja'),
('Vendas Elásticas 5cm', 'Material de soporte y compresión', 'Material de curación', 30, 15, 'Pieza'),
('Omeprazol 20mg', 'Protector gástrico', 'Otro', 60, 20, 'Caja'),
('Jeringas 5ml con aguja', 'Material de aplicación', 'Material de curación', 150, 100, 'Pieza');

-- 3. Consultations (Assuming doctor_id and patient_id exist)
-- Note: Replace with actual IDs from your database if necessary
-- For seeding, we'll use a subquery to get the first patient and a dummy doctor ID
INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id, -- Placeholder
  'Faringoamigdalitis Aguda (J03.9)',
  'Reposo, abundantes líquidos y tratamiento antibiótico por 7 días.',
  '{"temp": 38.5, "pa": "120/80", "fc": 88, "fr": 18, "spo2": 98}'::jsonb,
  NOW() - INTERVAL '2 days'
FROM patients LIMIT 1;

INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id,
  'Gastritis Crónica (K29.5)',
  'Dieta blanda, evitar irritantes y Omeprazol 20mg cada 24h.',
  '{"temp": 36.6, "pa": "110/70", "fc": 72, "fr": 16, "spo2": 99}'::jsonb,
  NOW() - INTERVAL '1 day'
FROM patients OFFSET 1 LIMIT 1;

INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, created_at)
SELECT 
  id as patient_id,
  '00000000-0000-0000-0000-000000000000' as doctor_id,
  'Lumbalgia Mecánica (M54.5)',
  'Higiene de columna, calor local y analgésicos.',
  '{"temp": 36.5, "pa": "125/85", "fc": 80, "fr": 17, "spo2": 98}'::jsonb,
  NOW()
FROM patients OFFSET 2 LIMIT 1;

-- 4. Prescription Fulfillment
INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'surtido', NOW() - INTERVAL '2 days' FROM consultations LIMIT 1;

INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'pendiente', NOW() - INTERVAL '1 day' FROM consultations OFFSET 1 LIMIT 1;

INSERT INTO prescription_fulfillment (consultation_id, status, created_at)
SELECT id, 'pendiente', NOW() FROM consultations OFFSET 2 LIMIT 1;
