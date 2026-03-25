import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  FileText, 
  History, 
  Edit2, 
  Stethoscope,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Patient } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import EditPatientModal from '../components/Modals/EditPatientModal';
import AddPatientForm from '../components/Patients/AddPatientForm';
import ConsultationWorkflow from '../components/Consultations/ConsultationWorkflow';
import { TableSkeleton } from '../components/UI/Skeleton';

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [consultingPatient, setConsultingPatient] = useState<Patient | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as Patient[];
    }
  });

  const filteredPatients = patients?.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.curp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestión centralizada de expedientes clínicos electrónicos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsAddingPatient(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#023E8A] to-[#0077B6] text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-900/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            Nuevo Paciente
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
              placeholder="Buscar por nombre, CURP o ID..." 
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white/60 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-sm transition-all">
              <Filter size={18} />
              Filtros Avanzados
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
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Paciente</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">CURP</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Última Visita</th>
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
              ) : filteredPatients?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={40} />
                      </div>
                      <p className="text-slate-500 font-medium">No se encontraron pacientes que coincidan con tu búsqueda.</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-[#023E8A] font-bold hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients?.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-base shadow-sm group-hover:scale-110 transition-transform">
                        {patient.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{patient.nombre}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Nacimiento: {new Date(patient.fecha_nacimiento).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-bold tracking-wider">
                      {patient.curp}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <History size={14} className="text-slate-300" />
                      <span>--</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => setConsultingPatient(patient)}
                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" 
                        title="Iniciar Consulta"
                      >
                        <Stethoscope size={20} />
                      </button>
                      <button 
                        onClick={() => setEditingPatient(patient)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </button>
                      <Link 
                        to={`/pacientes/${patient.id}/historial`}
                        className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all" 
                        title="Ver Historial Clínico"
                      >
                        <FileText size={20} />
                      </Link>
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {openMenuId === patient.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-in fade-in zoom-in duration-200">
                              <div className="px-4 py-2 mb-2 border-b border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opciones</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setEditingPatient(patient);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                              >
                                <Edit2 size={16} />
                                Editar Paciente
                              </button>
                              <Link 
                                to={`/pacientes/${patient.id}/historial`}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                              >
                                <History size={16} />
                                Ver Historial
                              </Link>
                              <div className="my-2 border-t border-slate-50" />
                              <button 
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                                onClick={() => {
                                  toast.error('Función de eliminación restringida');
                                  setOpenMenuId(null);
                                }}
                              >
                                <Trash2 size={16} />
                                Eliminar Registro
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {editingPatient && (
        <EditPatientModal 
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
        />
      )}

      {isAddingPatient && (
        <AddPatientForm 
          onClose={() => setIsAddingPatient(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
          }}
        />
      )}

      {consultingPatient && (
        <ConsultationWorkflow 
          patient={consultingPatient}
          onClose={() => setConsultingPatient(null)}
          onSuccess={() => {
            // Success logic
          }}
        />
      )}
    </div>
  );
};

export default PatientList;

