import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Pill, 
  User, 
  Calendar, 
  ChevronRight, 
  Loader2,
  AlertCircle,
  Database,
  Download,
  Edit2,
  X,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import { supabase, PrescriptionStatus, Consultation, Patient } from '../lib/supabase';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrescriptionWithDetails extends PrescriptionStatus {
  consultation: Consultation & {
    patient: Patient;
  };
}

const EditPrescriptionModal = ({ prescription, onClose, onSave }: { prescription: PrescriptionWithDetails, onClose: () => void, onSave: () => void }) => {
  const [meds, setMeds] = useState<any[]>(prescription.consultation.receta_json || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ receta_json: meds })
        .eq('id', prescription.consultation_id);

      if (error) throw error;
      toast.success('Receta actualizada correctamente');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('Error al guardar cambios: ' + error.message);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#023E8A] rounded-2xl flex items-center justify-center text-white">
              <Pill size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Editar Receta</h2>
              <p className="text-sm text-slate-500">Modifique los medicamentos para {prescription.consultation.patient.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medicamentos</h3>
            <button 
              onClick={addMed}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#023E8A] rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus size={14} />
              Agregar Item
            </button>
          </div>

          <div className="space-y-4">
            {meds.map((med, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                <button 
                  onClick={() => removeMed(idx)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Medicamento</label>
                    <input 
                      value={med.nombre}
                      onChange={(e) => updateMed(idx, 'nombre', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                      placeholder="Nombre del fármaco"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dosis</label>
                      <input 
                        value={med.dosis}
                        onChange={(e) => updateMed(idx, 'dosis', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        placeholder="500mg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frec</label>
                      <input 
                        value={med.frecuencia}
                        onChange={(e) => updateMed(idx, 'frecuencia', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        placeholder="c/8h"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dur</label>
                      <input 
                        value={med.duracion}
                        onChange={(e) => updateMed(idx, 'duracion', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        placeholder="7d"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-4 bg-[#023E8A] text-white rounded-2xl font-bold hover:bg-[#0047AB] shadow-lg shadow-[#023E8A]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PharmacyQueue = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionWithDetails | null>(null);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescription_fulfillment')
        .select(`
          *,
          consultation:consultations (
            *,
            patient:patients (*)
          )
        `)
        .eq('status', 'pendiente')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPrescriptions(data as any[]);
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('prescription_fulfillment_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prescription_fulfillment' 
      }, () => {
        fetchPrescriptions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleExportCSV = () => {
    if (!prescriptions || prescriptions.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const headers = ['Folio', 'Fecha', 'Paciente', 'CURP', 'Medicamentos', 'Estado'];
      const rows = prescriptions.map(p => [
        p.id.slice(0, 8).toUpperCase(),
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
        p.consultation.patient.nombre,
        p.consultation.patient.curp,
        (p.consultation.receta_json || []).map((m: any) => m.nombre).join('; '),
        p.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cola_farmacia_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Datos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      // 1. Check for a sample patient
      let patientId;
      const { data: patients } = await supabase.from('patients').select('id').limit(1);
      
      if (!patients || patients.length === 0) {
        const { data: newPatient, error: pError } = await supabase
          .from('patients')
          .insert([{
            nombre: 'Paciente de Farmacia Ejemplo',
            curp: 'FARM1234567890HXX',
            fecha_nacimiento: '1985-05-15',
            alergias: ['Lactosa']
          }])
          .select()
          .single();
        
        if (pError) throw pError;
        patientId = newPatient.id;
      } else {
        patientId = patients[0].id;
      }

      // 2. Create a sample consultation with prescription
      const { data: consultation, error: cError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: patientId,
          doctor_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000001',
          diagnostico: 'Infección respiratoria leve',
          plan_tratamiento: 'Tratamiento ambulatorio con antibióticos y analgésicos.',
          signos_vitales: { peso: 70, temp: 37.2, presion: '120/80' },
          receta_json: [
            { nombre: 'Paracetamol', dosis: '500mg', frecuencia: 'cada 8 horas', duracion: '3 días' },
            { nombre: 'Amoxicilina', dosis: '500mg', frecuencia: 'cada 12 horas', duracion: '7 días' }
          ]
        }])
        .select()
        .single();

      if (cError) throw cError;

      // 3. Create record in prescription_fulfillment
      const { error: fError } = await supabase
        .from('prescription_fulfillment')
        .insert([{
          consultation_id: consultation.id,
          status: 'pendiente'
        }]);

      if (fError) throw fError;

      toast.success('Datos de ejemplo cargados correctamente');
      fetchPrescriptions();
    } catch (error: any) {
      toast.error('Error al cargar datos de ejemplo: ' + error.message);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleFulfill = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró sesión de usuario');

      // 1. Get the prescription details to know what to deduct from inventory
      const prescription = prescriptions.find(p => p.id === id);
      if (!prescription) throw new Error('No se encontró la receta seleccionada');

      // 2. Update prescription status
      const { error: updateError } = await supabase
        .from('prescription_fulfillment')
        .update({ 
          status: 'surtido',
          despachado_por: user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Optional: Deduct from inventory if medications are listed
      // We do this as a best-effort since we don't have a stored procedure for atomicity here
      if (prescription.consultation.receta_json && Array.isArray(prescription.consultation.receta_json)) {
        for (const med of prescription.consultation.receta_json) {
          if (med.entregado_en_clinica) continue; // Skip if already delivered in clinic

          // Try to find the item in inventory by name (case insensitive)
          const { data: invItems } = await supabase
            .from('inventory')
            .select('id, stock_actual')
            .ilike('nombre', `%${med.nombre}%`)
            .limit(1);

          if (invItems && invItems.length > 0) {
            const item = invItems[0];
            const quantityToDeduct = 1; // Default to 1 if not specified in med object
            
            await supabase
              .from('inventory')
              .update({ stock_actual: Math.max(0, item.stock_actual - quantityToDeduct) })
              .eq('id', item.id);
          }
        }
      }
      
      setSelectedPrescription(null);
      alert('Receta surtida exitosamente');
    } catch (err: any) {
      console.error('Error fulfilling prescription:', err);
      // Provide more specific error message if possible
      const errorMsg = err.message || 'Error desconocido';
      alert('Error al surtir la receta: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.consultation.patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.consultation.patient.curp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold">Cargando cola de farmacia...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cola de Farmacia</h1>
          <p className="text-slate-500 mt-1">Gestión de surtido de recetas en tiempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLoadSampleData}
            disabled={isLoadingSample}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 text-sm font-bold disabled:opacity-50"
            title="Cargar datos de ejemplo"
          >
            <Database size={18} className={isLoadingSample ? 'animate-bounce' : ''} />
            {isLoadingSample ? 'Cargando...' : 'Datos de Ejemplo'}
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            En Vivo
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por paciente o CURP..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#023E8A]/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
              <Filter size={20} />
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors disabled:opacity-50"
              title="Exportar a CSV"
            >
              <Download size={20} className={isExporting ? 'animate-bounce' : ''} />
            </button>
          </div>

          <div className="space-y-3">
            {filteredPrescriptions.length === 0 ? (
              <div className="p-20 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400">
                <Clock size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No hay recetas pendientes</p>
                <p className="text-xs mt-1">Las nuevas recetas aparecerán aquí automáticamente</p>
              </div>
            ) : filteredPrescriptions.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrescription(p)}
                className={cn(
                  "w-full p-6 bg-white rounded-[32px] border transition-all text-left flex items-center justify-between group",
                  selectedPrescription?.id === p.id ? "border-[#023E8A] shadow-xl shadow-[#023E8A]/5 ring-4 ring-[#023E8A]/5" : "border-slate-100 hover:border-slate-200 shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#023E8A]/5 group-hover:text-[#023E8A] transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{p.consultation.patient.nombre}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-mono text-slate-400 uppercase">{p.consultation.patient.curp}</p>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicamentos</p>
                    <p className="text-sm font-bold text-[#023E8A]">{p.consultation.receta_json?.length || 0} items</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-[#023E8A] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Section */}
        <div className="lg:col-span-1">
          {selectedPrescription ? (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden sticky top-8 animate-in slide-in-from-right-8 duration-500">
              <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#023E8A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#023E8A]/20">
                    <Pill size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">Detalle de Receta</h2>
                    <p className="text-xs text-slate-500 mt-1">Folio: {selectedPrescription.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button 
                    onClick={() => setEditingPrescription(selectedPrescription)}
                    className="p-3 bg-white text-blue-600 border border-slate-100 rounded-2xl hover:bg-blue-50 transition-all shadow-sm"
                    title="Editar Receta"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paciente</p>
                    <p className="font-bold text-slate-900">{selectedPrescription.consultation.patient.nombre}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hora</p>
                      <p className="text-sm font-bold text-slate-900">{new Date(selectedPrescription.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Medicamentos a Surtir</h3>
                  <div className="space-y-4">
                    {selectedPrescription.consultation.receta_json?.map((med: any, idx: number) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#023E8A]/5 group-hover:text-[#023E8A] transition-colors shrink-0">
                          <Pill size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{med.nombre}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{med.dosis} · {med.frecuencia} · {med.duracion}</p>
                          {med.entregado_en_clinica && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-wider">
                              Entregado en Clínica
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleFulfill(selectedPrescription.id)}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    {isSubmitting ? 'Procesando...' : 'Marcar como Surtido'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-4">
                    Al confirmar, se registrará su usuario como el despachador de esta receta.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[60vh] bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                <ChevronRight size={40} className="opacity-20" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Seleccione una receta</h3>
              <p className="text-sm max-w-[200px]">Haga clic en una receta de la lista para ver el detalle y surtirla.</p>
            </div>
          )}
        </div>
      </div>

      {editingPrescription && (
        <EditPrescriptionModal 
          prescription={editingPrescription}
          onClose={() => setEditingPrescription(null)}
          onSave={() => {
            fetchPrescriptions();
            if (selectedPrescription?.id === editingPrescription.id) {
              // Update selected prescription with new data
              const updated = prescriptions.find(p => p.id === editingPrescription.id);
              if (updated) setSelectedPrescription(updated as any);
            }
          }}
        />
      )}
    </div>
  );
};

export default PharmacyQueue;
