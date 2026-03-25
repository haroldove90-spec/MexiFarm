-- Schema Creation for MediConnect (Supabase SQL)
-- Run this before the seed data if tables don't exist or have different columns

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    curp TEXT UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    alergias TEXT[] DEFAULT '{}',
    contacto_emergencia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('Antibiótico', 'Analgésico', 'Material de curación', 'Otro')),
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    precio_unitario NUMERIC(10, 2) DEFAULT 0.00,
    unidad TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL, -- References auth.users(id)
    diagnostico TEXT NOT NULL,
    plan_tratamiento TEXT NOT NULL,
    signos_vitales JSONB DEFAULT '{}',
    receta_json JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Prescription Fulfillment Table
CREATE TABLE IF NOT EXISTS prescription_fulfillment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pendiente', 'surtido', 'cancelado')) DEFAULT 'pendiente',
    despachado_por UUID, -- References auth.users(id)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_fulfillment ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Adjust as needed for specific roles)
CREATE POLICY "Allow authenticated read" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update" ON inventory FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON consultations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON consultations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON prescription_fulfillment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON prescription_fulfillment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON prescription_fulfillment FOR UPDATE TO authenticated USING (true);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL, -- References auth.users(id)
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON appointments FOR DELETE TO authenticated USING (true);
