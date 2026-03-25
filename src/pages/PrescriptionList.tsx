import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Pill,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../components/UI/Skeleton';

interface Prescription {
  id: string;
  consultation_id: string;
  medicamentos: any[];
  indicaciones: string;
  created_at: string;
  estado: 'Pendiente' | 'Surtida' | 'Cancelada';
  consulta?: {
    paciente: {
      nombre: string;
    };
    doctor: {
      full_name: string;
    };
  };
}

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          consulta:consultations(
            paciente:patients(nombre),
            doctor:profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error: any) {
      toast.error('Error al cargar recetas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ estado: 'Surtida' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Receta marcada como surtida');
      fetchPrescriptions();
    } catch (error: any) {
      toast.error('Error al surtir receta: ' + error.message);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.consulta?.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Todas' || p.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <TableSkeleton rows={5} cols={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Recetas Médicas</h1>
          <p className="text-slate-500 mt-1 font-medium">Control y seguimiento de prescripciones</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Download size={18} />
            Reporte Mensual
          </button>
        </div>
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
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
            >
              <option value="Todas">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Surtida">Surtidas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
            <button className="p-4 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Folio / Fecha</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Médico</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Medicamentos</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((p) => (
                  <tr key={p.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">#{p.id.slice(0, 8)}</p>
                          <p className="text-xs font-bold text-slate-400">
                            {new Date(p.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{p.consulta?.paciente.nombre}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-500">
                      Dr. {p.consulta?.doctor.full_name}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Pill size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {p.medicamentos?.length || 0} items
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                        p.estado === 'Surtida' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : p.estado === 'Pendiente'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {p.estado === 'Surtida' ? <CheckCircle2 size={12} /> : 
                         p.estado === 'Pendiente' ? <Clock size={12} /> : <AlertCircle size={12} />}
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toast.info('Vista previa de receta en desarrollo')}
                          className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </button>
                        {p.estado === 'Pendiente' && (
                          <button 
                            onClick={() => handleFulfill(p.id)}
                            className="p-3 bg-white border border-slate-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <FileText className="text-slate-200" size={40} />
                      </div>
                      <p className="text-slate-400 font-bold">No se encontraron recetas</p>
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

export default PrescriptionList;
