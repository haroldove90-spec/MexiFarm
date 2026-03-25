import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Save, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const patientSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  curp: z.string().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/, 'El formato del CURP es inválido'),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  alergias: z.string().optional(),
  contacto_emergencia: z.string().min(5, 'Ingrese un contacto de emergencia válido'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ onClose, onSuccess }) => {
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    setError(null);
    try {
      // Check for duplicate CURP
      const { data: existing, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('curp', data.curp.toUpperCase())
        .single();

      if (existing) {
        setError('Ya existe un paciente registrado con este CURP.');
        return;
      }

      const { error: insertError } = await supabase
        .from('patients')
        .insert([{
          nombre: data.nombre,
          curp: data.curp.toUpperCase(),
          fecha_nacimiento: data.fecha_nacimiento,
          alergias: data.alergias ? data.alergias.split(',').map(s => s.trim()) : [],
          contacto_emergencia: data.contacto_emergencia,
        }]);

      if (insertError) throw insertError;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding patient:', err);
      setError(err.message || 'Error al registrar el paciente');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#023E8A]/10 rounded-xl flex items-center justify-center text-[#023E8A]">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nuevo Paciente</h2>
              <p className="text-xs text-slate-500 mt-1">Registro de expediente clínico</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nombre Completo</label>
            <input
              {...register('nombre')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              placeholder="Ej. Juan Pérez García"
            />
            {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">CURP</label>
              <input
                {...register('curp')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.curp ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm uppercase`}
                placeholder="ABCD123456HXXXXX01"
              />
              {errors.curp && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.curp.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Fecha Nacimiento</label>
              <input
                type="date"
                {...register('fecha_nacimiento')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.fecha_nacimiento ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.fecha_nacimiento && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Contacto de Emergencia</label>
            <input
              {...register('contacto_emergencia')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.contacto_emergencia ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              placeholder="Nombre y Teléfono"
            />
            {errors.contacto_emergencia && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.contacto_emergencia.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Alergias</label>
            <textarea
              {...register('alergias')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm resize-none"
              placeholder="Ej. Penicilina, Sulfas"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#023E8A] hover:bg-[#0077B6] shadow-lg shadow-[#023E8A]/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting ? 'Registrando...' : 'Guardar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;
