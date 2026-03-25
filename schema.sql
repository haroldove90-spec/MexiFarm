-- Schema Creation for MediConnect (Supabase SQL)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'especialista', 'farmacia', 'asistente')),
    cedula TEXT,
    especialidad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    curp TEXT UNIQUE,
    fecha_nacimiento DATE,
    alergias TEXT[] DEFAULT '{}',
    contacto_emergencia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Appointments Table (Citas)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL, -- References profiles(id) or auth.users(id)
    fecha_hora TIMESTAMPTZ NOT NULL,
    motivo TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('Programada', 'Completada', 'Cancelada')) DEFAULT 'Programada',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL,
    diagnostico TEXT NOT NULL,
    plan_tratamiento TEXT NOT NULL,
    signos_vitales JSONB DEFAULT '{}',
    receta_json JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    medicamentos JSONB DEFAULT '[]',
    indicaciones TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'Surtida', 'Cancelada')) DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Prescription Fulfillment Table (Cola de Farmacia)
CREATE TABLE IF NOT EXISTS prescription_fulfillment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pendiente', 'surtido', 'cancelado')) DEFAULT 'pendiente',
    despachado_por UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT CHECK (categoria IN ('Antibiótico', 'Analgésico', 'Material de curación', 'Otro')),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    precio_unitario NUMERIC(10, 2) DEFAULT 0.00,
    unidad TEXT DEFAULT 'Unidad',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allowing authenticated and anon for demo purposes)
-- In a production environment, these should be more restrictive based on roles.

CREATE POLICY "Allow all access to authenticated and anon" ON profiles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON patients FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON appointments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON consultations FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON prescriptions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON prescription_fulfillment FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to authenticated and anon" ON inventory FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
