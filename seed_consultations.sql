-- Insert sample consultations
INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json)
SELECT 
    id as patient_id,
    '00000000-0000-0000-0000-000000000000' as doctor_id,
    'Faringitis aguda (J02.9)' as diagnostico,
    'Reposo y abundantes líquidos. Evitar cambios bruscos de temperatura.' as plan_tratamiento,
    '{"peso": 75, "estatura": 175, "imc": 24.5, "presion": "120/80", "temperatura": 37.5}'::jsonb as signos_vitales,
    '[{"nombre": "Paracetamol 500mg", "dosis": "1 tableta", "frecuencia": "cada 8 horas", "duracion": "3 días"}]'::jsonb as receta_json
FROM patients
LIMIT 3;

INSERT INTO consultations (patient_id, doctor_id, diagnostico, plan_tratamiento, signos_vitales, receta_json)
SELECT 
    id as patient_id,
    '00000000-0000-0000-0000-000000000000' as doctor_id,
    'Hipertensión esencial (I10)' as diagnostico,
    'Continuar con dieta baja en sodio. Ejercicio moderado 30 min al día.' as plan_tratamiento,
    '{"peso": 82, "estatura": 170, "imc": 28.4, "presion": "145/95", "temperatura": 36.6}'::jsonb as signos_vitales,
    '[{"nombre": "Losartán 50mg", "dosis": "1 tableta", "frecuencia": "cada 24 horas", "duracion": "30 días"}]'::jsonb as receta_json
FROM patients
OFFSET 3 LIMIT 2;
