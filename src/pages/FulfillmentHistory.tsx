import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  User, 
  Calendar, 
  Package, 
  ArrowRight,
  Clock,
  Activity,
  Database,
  X,
  Save,
  Loader2,
  Pill,
  Trash2,
  Edit2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../components/UI/Skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Fulfillment {
  id: string;
  prescription_id: string;
  fulfilled_by: string;
  created_at: string;
  notes?: string;
  receta?: {
    id: string;
    consulta: {
      paciente: {
        nombre: string;
        curp: string;
      };
      receta_json: any[];
    };
  };
  asistente?: {
    full_name: string;
  };
}

const ViewFulfillmentModal = ({ fulfillment, onClose, onUpdate }: { fulfillment: Fulfillment, onClose: () => void, onUpdate: () => void }) => {
  const [notes, setNotes] = useState(fulfillment.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('prescription_fulfillment')
        .update({ notes })
        .eq('id', fulfillment.id);

      if (error) throw error;
      toast.success('Registro actualizado correctamente');
      onUpdate();
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalle de Surtido</h2>
              <p className="text-sm text-slate-500">Folio: {fulfillment.prescription_id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Paciente</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{fulfillment.receta?.consulta.paciente.nombre}</p>
                  <p className="text-xs font-mono text-slate-400">{fulfillment.receta?.consulta.paciente.curp}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Surtido por</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm font-black text-xs">
                  {fulfillment.asistente?.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{fulfillment.asistente?.full_name}</p>
                  <p className="text-xs text-slate-400">{format(new Date(fulfillment.created_at), 'PPP p', { locale: es })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Pill size={14} />
              Medicamentos Entregados
            </h3>
            <div className="space-y-3">
              {fulfillment.receta?.consulta.receta_json?.map((med: any, idx: number) => (
                <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{med.nombre}</p>
                      <p className="text-xs text-slate-500">{med.dosis} · {med.frecuencia} · {med.duracion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} />
                Notas de Surtido
              </h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Editar Notas
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                  placeholder="Agregar notas sobre el surtido..."
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Guardar Notas
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 min-h-[80px]">
                <p className="text-sm text-slate-600 italic">
                  {fulfillment.notes || 'Sin notas adicionales registradas.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

const FulfillmentHistory = () => {
  const [history, setHistory] = useState<Fulfillment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState<Fulfillment | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prescription_fulfillment')
        .select(`
          *,
          receta:prescriptions(
            id,
            consulta:consultations(
              paciente:patients(nombre, curp),
              receta_json
            )
          ),
          asistente:profiles(full_name)
        `)
        .eq('status', 'surtido')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error('Error al cargar historial: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!history || history.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const headers = ['Fecha', 'Hora', 'Paciente', 'CURP', 'Folio Receta', 'Surtido por', 'Medicamentos', 'Notas'];
      const rows = history.map(h => [
        format(new Date(h.created_at), 'yyyy-MM-dd'),
        format(new Date(h.created_at), 'HH:mm'),
        h.receta?.consulta.paciente.nombre || 'N/A',
        h.receta?.consulta.paciente.curp || 'N/A',
        h.prescription_id.slice(0, 8).toUpperCase(),
        h.asistente?.full_name || 'N/A',
        (h.receta?.consulta.receta_json || []).map((m: any) => m.nombre).join('; '),
        h.notes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historial_surtido_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Historial exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar historial');
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
            nombre: 'Paciente Historial Ejemplo',
            curp: 'HIST1234567890HXX',
            fecha_nacimiento: '1990-01-01',
            alergias: []
          }])
          .select()
          .single();
        
        if (pError) throw pError;
        patientId = newPatient.id;
      } else {
        patientId = patients[0].id;
      }

      const demoRole = localStorage.getItem('demo_role');
      const userId = demoRole ? '00000000-0000-0000-0000-000000000001' : (await supabase.auth.getUser()).data.user?.id;
      
      if (demoRole && userId) {
        const { data: profileExists } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (!profileExists) {
          await supabase.from('profiles').insert([{
            id: userId,
            full_name: 'Dra. Hilda Martínez',
            role: 'especialista',
            especialidad: 'Medicina General'
          }]);
        }
      }

      // 2. Create a sample consultation with prescription
      const { data: consultation, error: cError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: patientId,
          doctor_id: userId,
          diagnostico: 'Control de rutina',
          plan_tratamiento: 'Continuar con medicación habitual.',
          signos_vitales: { peso: 75, temp: 36.6, presion: '110/70' },
          receta_json: [
            { nombre: 'Metformina', dosis: '850mg', frecuencia: 'cada 12 horas', duracion: '30 días' },
            { nombre: 'Losartán', dosis: '50/mg', frecuencia: 'cada 24 horas', duracion: '30 días' }
          ]
        }])
        .select()
        .single();

      if (cError) throw cError;

      // 3. Create record in prescription_fulfillment as 'surtido'
      const { error: fError } = await supabase
        .from('prescription_fulfillment')
        .insert([{
          consultation_id: consultation.id,
          status: 'surtido',
          despachado_por: userId,
          notes: 'Surtido completo de medicamentos de control.'
        }]);

      if (fError) throw fError;

      toast.success('Datos de ejemplo cargados correctamente');
      fetchHistory();
    } catch (error: any) {
      toast.error('Error al cargar datos de ejemplo: ' + error.message);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.receta?.consulta.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.prescription_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl p-8">
          <TableSkeleton rows={5} cols={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Historial de Surtido</h1>
          <p className="text-slate-500 mt-1 font-medium">Registro detallado de entregas de medicamentos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLoadSampleData}
            disabled={isLoadingSample}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold hover:bg-emerald-100 transition-all active:scale-95 shadow-lg shadow-emerald-200/50 disabled:opacity-50"
          >
            <Database size={20} className={isLoadingSample ? 'animate-bounce' : ''} />
            {isLoadingSample ? 'Cargando...' : 'Datos de Ejemplo'}
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-200/50 disabled:opacity-50"
          >
            <Download size={20} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Exportando...' : 'Exportar Historial'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Surtidos Hoy', value: history.filter(h => new Date(h.created_at).toDateString() === new Date().toDateString()).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Mensual', value: history.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Promedio Diario', value: (history.length / 30).toFixed(1), icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por paciente o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
              <Filter size={18} />
              Filtros
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Fecha / Hora</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Folio Receta</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Surtido por</th>
                <th className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((h) => (
                  <tr key={h.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {new Date(h.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{h.receta?.consulta.paciente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span className="text-sm font-black text-blue-600">#{h.prescription_id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                          {h.asistente?.full_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-600">{h.asistente?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedFulfillment(h)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <History className="text-slate-200" size={40} />
                      </div>
                      <p className="text-slate-400 font-bold">No hay registros de surtido</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFulfillment && (
        <ViewFulfillmentModal 
          fulfillment={selectedFulfillment}
          onClose={() => setSelectedFulfillment(null)}
          onUpdate={() => {
            fetchHistory();
            // Update selected fulfillment if it's the one being viewed
            const updated = history.find(h => h.id === selectedFulfillment.id);
            if (updated) setSelectedFulfillment(updated);
          }}
        />
      )}
    </div>
  );
};

export default FulfillmentHistory;
