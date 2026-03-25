import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'especialista' | 'farmacia' | 'asistente';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  cedula?: string;
  especialidad?: string;
}

export interface Patient {
  id: string;
  nombre: string;
  curp: string;
  fecha_nacimiento: string;
  alergias: string[];
  contacto_emergencia?: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnostico: string;
  plan_tratamiento: string;
  signos_vitales: {
    presion?: string;
    temperatura?: number;
    peso?: number;
    estatura?: number;
    [key: string]: any;
  };
  receta_json: any;
  created_at: string;
}

export interface PrescriptionStatus {
  id: string;
  consultation_id: string;
  status: 'pendiente' | 'surtido' | 'cancelado';
  despachado_por?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'Antibiótico' | 'Analgésico' | 'Material de curación' | 'Otro';
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  unidad: string;
  created_at: string;
}
