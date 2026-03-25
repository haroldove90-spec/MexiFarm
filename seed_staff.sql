-- Seed profiles for staff management
-- Note: In a real app, these would be linked to auth.users
-- This script assumes the profiles table exists as defined in the architecture

INSERT INTO profiles (id, full_name, role, cedula, especialidad)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Dr. Harold Demo', 'admin', 'ADM-12345', 'Administrador Hospitalario'),
  ('00000000-0000-0000-0000-000000000002', 'Dra. Elena Rodriguez', 'medico', 'MED-67890', 'Pediatría'),
  ('00000000-0000-0000-0000-000000000003', 'Dr. Roberto Gomez', 'medico', 'MED-11223', 'Cardiología'),
  ('00000000-0000-0000-0000-000000000004', 'Lic. Maria Lopez', 'farmacia', 'FAR-44556', 'Farmacéutica'),
  ('00000000-0000-0000-0000-000000000005', 'Dra. Sofia Martinez', 'medico', 'MED-99887', 'Ginecología')
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, 
    role = EXCLUDED.role, 
    cedula = EXCLUDED.cedula, 
    especialidad = EXCLUDED.especialidad;
