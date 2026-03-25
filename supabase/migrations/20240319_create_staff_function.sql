-- Función para crear un miembro del personal desde el dashboard (Requiere permisos de admin)
-- Nota: Esta función debe ejecutarse en el editor SQL de Supabase

CREATE OR REPLACE FUNCTION create_staff_member(
    email TEXT,
    password TEXT,
    full_name TEXT,
    role TEXT,
    cedula TEXT DEFAULT NULL,
    especialidad TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- 1. Crear el usuario en auth.users
    -- Nota: Esto requiere que la función se ejecute con privilegios de seguridad definidos o que el usuario tenga permisos.
    -- En Supabase, crear usuarios desde SQL es complejo por el esquema auth.
    -- Una alternativa más simple para este prototipo es permitir la inserción en profiles 
    -- y que el usuario se registre normalmente, o usar esta función si se tiene el rol de servicio.
    
    -- Por ahora, generaremos un UUID y lo insertaremos en profiles para que aparezca en la lista.
    -- En una app real, esto debería usar la API de Admin de Supabase.
    
    INSERT INTO profiles (id, full_name, role, cedula, especialidad)
    VALUES (gen_random_uuid(), full_name, role::user_role, cedula, especialidad)
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
