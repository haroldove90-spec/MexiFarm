import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  Edit2, 
  Search, 
  Filter,
  MoreVertical,
  User,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../../components/UI/Skeleton';

interface StaffProfile {
  id: string;
  full_name: string;
  role: 'especialista' | 'asistente';
  cedula?: string;
  especialidad?: string;
  created_at: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'asistente' as 'especialista' | 'asistente',
    cedula: '',
    especialidad: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error('Error al cargar personal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: StaffProfile) => {
    setEditingStaff(member);
    setFormData({
      full_name: member.full_name,
      role: member.role,
      cedula: member.cedula || '',
      especialidad: member.especialidad || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            cedula: formData.role === 'especialista' ? formData.cedula : null,
            especialidad: formData.role === 'especialista' ? formData.especialidad : null
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast.success('Personal actualizado con éxito');
      } else {
        // Crear nuevo perfil (Mock/Directo)
        // En una app real, esto debería crear un usuario en auth.users primero
        const { error } = await supabase
          .from('profiles')
          .insert([{
            id: crypto.randomUUID(),
            full_name: formData.full_name,
            role: formData.role,
            cedula: formData.role === 'especialista' ? formData.cedula : null,
            especialidad: formData.role === 'especialista' ? formData.especialidad : null
          }]);

        if (error) throw error;
        toast.success('Personal agregado con éxito');
      }

      setShowModal(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error: any) {
      toast.error('Error al procesar: ' + error.message);
    }
  };

  const filteredStaff = staff.filter(member => 
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Personal</h1>
          <p className="text-slate-500 mt-1 font-medium">Administra los accesos y perfiles de tu equipo</p>
        </div>
        <button 
          onClick={() => {
            setEditingStaff(null);
            setFormData({
              full_name: '',
              role: 'asistente',
              cedula: '',
              especialidad: ''
            });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-[#023E8A] text-white rounded-2xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-xl shadow-blue-900/20 active:scale-95 group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          Agregar Personal
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {/* Filters Bar */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o rol..."
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
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Personal</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Rol</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Cédula / Especialidad</th>
                <th className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                <th className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{member.full_name}</p>
                          <p className="text-xs font-bold text-slate-400">ID: {member.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
                        member.role === 'especialista' 
                          ? 'bg-purple-50 text-purple-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Shield size={12} />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {member.role === 'especialista' ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">{member.especialidad}</p>
                          <p className="text-xs font-medium text-slate-400">Ced: {member.cedula}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No aplica</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} />
                        <span className="text-sm font-medium">
                          {new Date(member.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(member)}
                          className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => toast.error('La eliminación de personal requiere permisos de super-admin')}
                          className="p-3 bg-white border border-slate-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <User className="text-slate-200" size={40} />
                      </div>
                      <p className="text-slate-400 font-bold">No se encontró personal</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{editingStaff ? 'Editar Perfil' : 'Nuevo Personal'}</h2>
                <p className="text-sm text-slate-500 font-medium">{editingStaff ? 'Actualiza la información del miembro' : 'Crea un nuevo perfil de equipo'}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <MoreVertical size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="asistente">Asistente</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>

              {formData.role === 'especialista' && (
                <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 ml-1">Especialidad</label>
                    <input
                      type="text"
                      required
                      value={formData.especialidad}
                      onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 ml-1">Cédula Profesional</label>
                    <input
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#023E8A] text-white rounded-2xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
