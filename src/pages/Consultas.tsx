import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity, 
  FileText, 
  ChevronRight,
  RefreshCw,
  Download,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton } from '../components/UI/Skeleton';

interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnostico: string;
  plan_tratamiento: string;
  created_at: string;
  patient?: {
    nombre: string;
  };
}

const Consultas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: consultations, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['all-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, patient:patients(nombre)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Consultation[];
    }
  });

  const filteredConsultations = consultations?.filter(c => 
    c.patient?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Consultas Médicas</h1>
          <p className="text-slate-500 mt-2 font-medium">Historial centralizado de atenciones y diagnósticos clínicos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={isRefetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-card overflow-hidden">
        {/* Filters & Search Bar */}
        <div className="p-8 border-b border-slate-100/50 flex flex-col lg:flex-row gap-6 items-center justify-between bg-white/30">
          <div className="relative w-full lg:w-[450px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#023E8A] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por paciente o diagnóstico..." 
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white/60 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-sm transition-all">
              <Filter size={18} />
              Filtros
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white/60 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-sm transition-all">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha y Hora</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Paciente</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Diagnóstico</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4}>
                    <TableSkeleton rows={6} cols={4} />
                  </td>
                </tr>
              ) : filteredConsultations?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <FileText size={40} />
                      </div>
                      <p className="text-slate-500 font-medium">No se encontraron registros de consultas.</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-[#023E8A] font-bold hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredConsultations?.map((consultation) => (
                <tr 
                  key={consultation.id} 
                  className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                  onClick={() => navigate(`/pacientes/${consultation.patient_id}/historial`)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#023E8A] shadow-sm group-hover:scale-110 transition-transform">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {format(new Date(consultation.created_at), 'dd MMM, yyyy', { locale: es })}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-medium">
                          <Clock size={12} />
                          <span>{format(new Date(consultation.created_at), 'HH:mm', { locale: es })}h</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {consultation.patient?.nombre.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-slate-700">{consultation.patient?.nombre}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <p className="text-sm text-slate-600 line-clamp-1 max-w-xs font-medium">{consultation.diagnostico}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 text-slate-400 group-hover:text-[#023E8A] group-hover:bg-blue-50 rounded-xl transition-all translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                      <ChevronRight size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Consultas;

