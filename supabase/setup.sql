-- Estructura de Base de Datos para Clínica de Élite (Supabase/PostgreSQL)

-- 1. Tipos de Enumeración
CREATE TYPE user_role AS ENUM ('admin', 'especialista', 'farmacia', 'asistente');
CREATE TYPE prescription_status AS ENUM ('pendiente', 'surtido', 'cancelado');

-- 2. Tabla de Perfiles (Personal)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'asistente',
    cedula TEXT,
    especialidad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    curp TEXT UNIQUE,
    fecha_nacimiento DATE,
    alergias TEXT[] DEFAULT '{}',
    contacto_emergencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Consultas
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    diagnostico TEXT,
    plan_tratamiento TEXT,
    signos_vitales JSONB DEFAULT '{}',
    receta_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Inventario
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    precio_unitario DECIMAL(10,2) DEFAULT 0.00,
    unidad TEXT DEFAULT 'Unidad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Prescripciones (Estados)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    status prescription_status DEFAULT 'pendiente',
    despachado_por UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Función para crear personal (Admin)
CREATE OR REPLACE FUNCTION create_staff_member(
    p_full_name TEXT,
    p_role user_role,
    p_cedula TEXT DEFAULT NULL,
    p_especialidad TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO profiles (full_name, role, cedula, especialidad)
    VALUES (p_full_name, p_role, p_cedula, p_especialidad)
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Datos de Semilla (Opcional)
INSERT INTO profiles (id, full_name, role, cedula, especialidad)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Dr. Harold Demo', 'admin', 'ADM-12345', 'Administrador Hospitalario')
ON CONFLICT (id) DO NOTHING;
