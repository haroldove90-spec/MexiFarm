-- Seed Data for MediConnect Pro
-- This script inserts test data for patients, inventory, consultations, and appointments.
-- Replace '00000000-0000-0000-0000-000000000000' with a real doctor_id if needed.

-- 1. Insert Patients
INSERT INTO patients (nombre, curp, fecha_nacimiento, alergias, contacto_emergencia)
VALUES 
('Juan Pérez García', 'PEGA800101HDFRRN01', '1980-01-01', '{"Penicilina"}', 'María García - 555-123-4567'),
('Ana María López', 'LOMA850505MDFRRN02', '1985-05-05', '{"Polen", "Polvo"}', 'Roberto López - 555-987-6543'),
('Carlos Rodríguez', 'ROCA901010HDFRRN03', '1990-10-10', '{}', 'Elena Rodríguez - 555-456-7890'),
('Sofía Hernández', 'HESO951212MDFRRN04', '1995-12-12', '{"Lactosa"}', 'Miguel Hernández - 555-321-0987'),
('Luis Martínez', 'MALI750303HDFRRN05', '1975-03-03', '{"Sulfas"}', 'Lucía Martínez - 555-654-3210'),
('Elena Gómez', 'GOEL820808MDFRRN06', '1982-08-08', '{}', 'Jorge Gómez - 555-789-0123'),
('Javier Sánchez', 'SAJA880202HDFRRN07', '1988-02-02', '{"Aspirina"}', 'Carmen Sánchez - 555-012-3456'),
('Lucía Torres', 'TOLU920707MDFRRN08', '1992-07-07', '{}', 'Andrés Torres - 555-234-5678'),
('Ricardo Díaz', 'DIRI780404HDFRRN09', '1978-04-04', '{"Nueces"}', 'Patricia Díaz - 555-345-6789'),
('Mónica Ruiz', 'RUMO840909MDFRRN10', '1984-09-09', '{}', 'Fernando Ruiz - 555-456-7890')
ON CONFLICT (curp) DO NOTHING;

-- 2. Insert Inventory
INSERT INTO inventory (nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, unidad)
VALUES 
('Paracetamol 500mg', 'Analgésico y antipirético', 'Analgésico', 100, 20, 50.00, 'Caja'),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibiótico', 15, 10, 120.00, 'Caja'),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Analgésico', 80, 15, 75.00, 'Caja'),
('Gasas Estériles', 'Paquete de 10x10cm', 'Material de curación', 200, 50, 15.00, 'Paquete'),
('Alcohol Etílico 70%', 'Frasco de 500ml', 'Material de curación', 50, 10, 45.00, 'Frasco'),
('Diclofenaco 100mg', 'Analgésico potente', 'Analgésico', 40, 10, 90.00, 'Caja'),
('Ceftriaxona 1g', 'Antibiótico inyectable', 'Antibiótico', 8, 5, 250.00, 'Ampolleta'),
('Vendas Elásticas', '5cm x 5m', 'Material de curación', 30, 10, 35.00, 'Pieza'),
('Omeprazol 20mg', 'Protector gástrico', 'Otro', 120, 20, 65.00, 'Caja'),
('Loratadina 10mg', 'Antihistamínico', 'Otro', 60, 15, 40.00, 'Caja');

-- 3. Insert Consultations (Assuming some patient IDs exist)
-- We use a subquery to get patient IDs dynamically
DO $$
DECLARE
    p_id UUID;
    d_id UUID := '00000000-0000-0000-0000-000000000000'; -- Placeholder doctor_id
BEGIN
    FOR p_id IN (SELECT id FROM patients LIMIT 5) LOOP
        INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json)
        VALUES (
            p_id, 
            d_id, 
            'Infección respiratoria leve', 
            'Reposo y abundantes líquidos. Tomar paracetamol si hay fiebre.', 
            '{"temp": 37.5, "presion": "120/80", "peso": 70, "talla": 175}', 
            '[{"medicamento": "Paracetamol 500mg", "dosis": "1 cada 8 horas", "duracion": "3 días"}]'
        );
    END LOOP;
END $$;

-- 4. Insert Appointments
DO $$
DECLARE
    p_id UUID;
    d_id UUID := '00000000-0000-0000-0000-000000000000'; -- Placeholder doctor_id
    i INTEGER := 0;
BEGIN
    FOR p_id IN (SELECT id FROM patients LIMIT 10) LOOP
        INSERT INTO appointments (patient_id, doctor_id, start_time, end_time, title, status)
        VALUES (
            p_id, 
            d_id, 
            NOW() + (i || ' days')::interval + '2 hours'::interval, 
            NOW() + (i || ' days')::interval + '3 hours'::interval, 
            'Consulta de seguimiento - ' || (SELECT nombre FROM patients WHERE id = p_id), 
            'scheduled'
        );
        i := i + 1;
    END LOOP;
END $$;
