import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Pill, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Activity,
  UserCircle,
  Calendar,
  Package,
  History,
  BarChart3,
  UserPlus,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { role, signOut, profile, loading } = useAuth();

  const getMenuItems = () => {
    switch (role) {
      case 'medico':
        return [
          { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
          { title: 'Agenda', icon: Calendar, path: '/agenda' },
          { title: 'Pacientes', icon: Users, path: '/pacientes' },
          { title: 'Consultas', icon: ClipboardList, path: '/consultas' },
        ];
      case 'farmacia':
        return [
          { title: 'Dashboard', icon: LayoutDashboard, path: '/farmacia' },
          { title: 'Inventario', icon: Package, path: '/farmacia/inventario' },
          { title: 'Recetas Pendientes', icon: Pill, path: '/farmacia/recetas' },
          { title: 'Historial de Surtido', icon: History, path: '/farmacia/historial' },
        ];
      case 'admin':
        return [
          { title: 'Panel de Control', icon: BarChart3, path: '/admin' },
          { title: 'Gestión de Personal', icon: UserPlus, path: '/admin/personal' },
          { title: 'Reportes', icon: ShieldCheck, path: '/admin/reportes' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  if (loading) {
    return (
      <div className="h-screen w-64 flex flex-col items-center justify-center glass border-r border-white/20">
        <div className="w-8 h-8 border-2 border-[#023E8A]/20 border-t-[#023E8A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 w-72 flex flex-col glass border-r border-white/30 shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-8 flex flex-col items-center justify-center gap-4 relative">
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-full flex flex-col items-center gap-3">
          <img 
            src="https://appdesignproyectos.com/mexifarm.jpg" 
            alt="MexiFarm Logo" 
            className="max-h-20 w-auto object-contain drop-shadow-sm rounded-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="text-center">
            <h1 className="font-display font-black text-slate-900 text-xl leading-none tracking-tight">MexiFarm</h1>
            <p className="text-[10px] text-[#023E8A] font-black uppercase tracking-[0.3em] mt-1.5 opacity-80">Gestión Médica Pro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-2.5 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-6 py-4 rounded-[20px] text-sm font-bold transition-all duration-500 group relative overflow-hidden",
              isActive 
                ? "bg-[#023E8A] text-white shadow-lg shadow-[#023E8A]/20" 
                : "text-slate-500 hover:bg-white/60 hover:text-slate-900 hover:shadow-sm"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn(
                  "transition-all duration-500 z-10",
                  isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-[#023E8A] group-hover:scale-110"
                )} />
                <span className="z-10 tracking-tight">{item.title}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#023E8A] to-[#0077B6] opacity-100" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-white/30">
        <div className="flex items-center gap-4 px-5 py-4 mb-8 bg-white/50 rounded-[24px] border border-white/40 shadow-sm backdrop-blur-md group hover:bg-white/70 transition-all duration-300">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 border border-white shadow-inner group-hover:scale-110 transition-transform">
            <UserCircle size={26} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-slate-900 truncate">{profile?.full_name || 'Usuario'}</p>
            <p className="text-[10px] font-black text-[#023E8A] uppercase tracking-widest mt-0.5 opacity-60">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] text-sm font-black text-red-500 hover:bg-red-50/80 transition-all duration-300 group border border-transparent hover:border-red-100"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
