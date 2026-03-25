import React from 'react';
import { 
  Shield, 
  Settings, 
  FileText, 
  Lock, 
  History, 
  Database, 
  Bell, 
  Globe,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const AdminPanel = () => {
  const logs = [
    { id: 1, action: 'Actualización de RLS', user: 'Admin Harold', time: 'Hace 10 min', status: 'success', detail: 'Tabla: patients' },
    { id: 2, action: 'Intento de Acceso Fallido', user: 'Desconocido', time: 'Hace 25 min', status: 'warning', detail: 'IP: 192.168.1.45' },
    { id: 3, action: 'Cambio de Rol de Usuario', user: 'Admin Harold', time: 'Hace 1 hora', status: 'info', detail: 'Usuario: Dr. Smith -> Medico' },
    { id: 4, action: 'Backup de Base de Datos', user: 'Sistema', time: 'Hace 3 horas', status: 'success', detail: 'Completado: 250MB' },
    { id: 5, action: 'Modificación de Folios', user: 'Admin Harold', time: 'Hace 5 horas', status: 'success', detail: 'Serie: REC-2026' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      case 'info':
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <History size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 mt-1">Configuración global del sistema y monitoreo de seguridad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Seguridad y RLS', desc: 'Políticas de acceso a datos', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Configuración de Folios', desc: 'Series de recetas y facturación', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Base de Datos', desc: 'Mantenimiento y backups', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Notificaciones', desc: 'Alertas críticas del sistema', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item, i) => (
              <button key={i} className="flex items-start gap-4 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left group">
                <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-[#023E8A] transition-colors" />
              </button>
            ))}
          </div>

          {/* System Info Card */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Globe size={120} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Estado del Sistema</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Versión</p>
                <p className="text-sm font-black text-slate-900 mt-1">v2.4.0-pro</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime</p>
                <p className="text-sm font-black text-emerald-600 mt-1">99.98%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Región</p>
                <p className="text-sm font-black text-slate-900 mt-1">US-West-1</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Licencia</p>
                <p className="text-sm font-black text-blue-600 mt-1">Enterprise</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Security Logs */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Lock size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold">Logs de Seguridad</h3>
              </div>
              <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Ver todos</button>
            </div>

            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 group cursor-pointer">
                  <div className="mt-1 shrink-0">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.detail}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-slate-500">{log.user}</span>
                      <span className="text-[10px] font-medium text-slate-500">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2">
              <History size={16} />
              Auditoría Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
