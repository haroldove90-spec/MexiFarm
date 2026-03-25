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
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../components/UI/Skeleton';

interface Fulfillment {
  id: string;
  prescription_id: string;
  fulfilled_by: string;
  created_at: string;
  notes?: string;
  receta?: {
    consulta: {
      paciente: {
        nombre: string;
      };
    };
  };
  asistente?: {
    full_name: string;
  };
}

const FulfillmentHistory = () => {
  const [history, setHistory] = useState<Fulfillment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
            consulta:consultations(
              paciente:patients(nombre)
            )
          ),
          asistente:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error('Error al cargar historial: ' + error.message);
    } finally {
      setLoading(false);
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
        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-200/50">
          <Download size={20} />
          Exportar Historial
        </button>
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
                      <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
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
    </div>
  );
};

export default FulfillmentHistory;
