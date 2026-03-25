import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, FileText, Trash2, AlertTriangle, Plus, Trash } from 'lucide-react';
import { Consultation, supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const consultationSchema = z.object({
  diagnostico: z.string().min(5, 'El diagnóstico debe tener al menos 5 caracteres'),
  plan_tratamiento: z.string().min(5, 'El plan de tratamiento debe tener al menos 5 caracteres'),
  signos_vitales: z.object({
    peso: z.string().optional(),
    estatura: z.string().optional(),
    imc: z.string().optional(),
    temp: z.string().optional(),
    presion: z.string().optional(),
  }),
  receta_json: z.array(z.object({
    nombre: z.string(),
    dosis: z.string(),
    frecuencia: z.string(),
    duracion: z.string(),
  })).optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface EditConsultationModalProps {
  consultation: Consultation;
  onClose: () => void;
}

const EditConsultationModal: React.FC<EditConsultationModalProps> = ({ consultation, onClose }) => {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meds, setMeds] = useState<any[]>(consultation.receta_json || []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      diagnostico: consultation.diagnostico,
      plan_tratamiento: consultation.plan_tratamiento,
      signos_vitales: consultation.signos_vitales,
      receta_json: consultation.receta_json,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const { error } = await supabase
        .from('consultations')
        .update({
          diagnostico: data.diagnostico,
          plan_tratamiento: data.plan_tratamiento,
          signos_vitales: data.signos_vitales,
          receta_json: meds,
        })
        .eq('id', consultation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-history'] });
      toast.success('Consulta actualizada correctamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating consultation:', error);
      toast.error('Error al actualizar la consulta');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-history'] });
      toast.success('Consulta eliminada correctamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting consultation:', error);
      toast.error('Error al eliminar la consulta');
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    updateMutation.mutate(data);
  };

  const addMed = () => {
    setMeds([...meds, { nombre: '', dosis: '', frecuencia: '', duracion: '' }]);
  };

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const updateMed = (index: number, field: string, value: string) => {
    const newMeds = [...meds];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMeds(newMeds);
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar Consulta?</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Esta acción eliminará permanentemente esta nota de evolución. Esta acción no se puede deshacer.
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
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#023E8A]/10 rounded-xl flex items-center justify-center text-[#023E8A]">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Editar Consulta</h2>
              <p className="text-xs text-slate-500 mt-1">Modifique la nota de evolución</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-l-4 border-[#023E8A] pl-2 uppercase tracking-wider">Signos Vitales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Peso (kg)</label>
                  <input {...register('signos_vitales.peso')} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estatura (cm)</label>
                  <input {...register('signos_vitales.estatura')} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Temperatura (°C)</label>
                  <input {...register('signos_vitales.temp')} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Presión Arterial</label>
                  <input {...register('signos_vitales.presion')} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm" placeholder="120/80" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Diagnóstico (CIE-10)</label>
                <textarea
                  {...register('diagnostico')}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.diagnostico ? 'border-red-500' : 'border-slate-100'} text-sm resize-none`}
                />
                {errors.diagnostico && <p className="text-[10px] text-red-500 font-bold">{errors.diagnostico.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Plan de Tratamiento</label>
                <textarea
                  {...register('plan_tratamiento')}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.plan_tratamiento ? 'border-red-500' : 'border-slate-100'} text-sm resize-none`}
                />
                {errors.plan_tratamiento && <p className="text-[10px] text-red-500 font-bold">{errors.plan_tratamiento.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider">Prescripción</h3>
                <button
                  type="button"
                  onClick={addMed}
                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {meds.map((med, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeMed(index)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Medicamento</label>
                      <input
                        value={med.nombre}
                        onChange={(e) => updateMed(index, 'nombre', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        placeholder="Nombre del fármaco"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Dosis</label>
                        <input
                          value={med.dosis}
                          onChange={(e) => updateMed(index, 'dosis', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          placeholder="500mg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Frecuencia</label>
                        <input
                          value={med.frecuencia}
                          onChange={(e) => updateMed(index, 'frecuencia', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          placeholder="c/8h"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Duración</label>
                        <input
                          value={med.duracion}
                          onChange={(e) => updateMed(index, 'duracion', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                          placeholder="7 días"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {meds.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400">No hay medicamentos en la receta</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
            <div className="flex-1 flex gap-3">
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
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#023E8A] hover:bg-[#0047AB] shadow-lg shadow-[#023E8A]/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConsultationModal;
