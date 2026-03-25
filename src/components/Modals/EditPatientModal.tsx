import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, User, Phone, Trash2, AlertTriangle } from 'lucide-react';
import { Patient, supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const patientSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  curp: z.string().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/, 'El formato del CURP es inválido'),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (AAAA-MM-DD)'),
  alergias: z.string().optional(),
  contacto_emergencia: z.string().min(5, 'Ingrese un contacto de emergencia válido'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface EditPatientModalProps {
  patient: Patient;
  onClose: () => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ patient, onClose }) => {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nombre: patient.nombre,
      curp: patient.curp,
      fecha_nacimiento: patient.fecha_nacimiento,
      alergias: patient.alergias.join(', '),
      contacto_emergencia: patient.contacto_emergencia || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { error } = await supabase
        .from('patients')
        .update({
          nombre: data.nombre,
          curp: data.curp,
          fecha_nacimiento: data.fecha_nacimiento,
          alergias: data.alergias ? data.alergias.split(',').map(s => s.trim()) : [],
          contacto_emergencia: data.contacto_emergencia,
        })
        .eq('id', patient.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente actualizado correctamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast.error('Error al actualizar el paciente');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente eliminado correctamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
      toast.error('Error al eliminar el paciente');
    },
  });

  const onSubmit = (data: PatientFormData) => {
    updateMutation.mutate(data);
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar Paciente?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Esta acción eliminará permanentemente el expediente de <strong>{patient.nombre}</strong> y todo su historial de consultas. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#023E8A]/10 rounded-xl flex items-center justify-center text-[#023E8A]">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Editar Expediente</h2>
              <p className="text-xs text-slate-500 mt-1">Actualice la información clínica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nombre Completo</label>
            <input
              {...register('nombre')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
            />
            {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">CURP</label>
              <input
                {...register('curp')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.curp ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm uppercase`}
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Phone size={12} /> Contacto de Emergencia
            </label>
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

          <div className="pt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#023E8A] hover:bg-[#0077B6] shadow-lg shadow-[#023E8A]/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Eliminar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
