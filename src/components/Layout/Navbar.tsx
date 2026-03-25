import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, User, ChevronDown, Menu, LogOut, Settings, UserCircle, Clock, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva Cita',
    message: 'El paciente Juan Pérez ha programado una cita para mañana a las 10:00 AM.',
    type: 'info',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'Stock Bajo',
    message: 'El medicamento Paracetamol 500mg está por debajo del stock mínimo (15 unidades restantes).',
    type: 'warning',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false
  },
  {
    id: '3',
    title: 'Receta Surtida',
    message: 'La receta #F123 del paciente María García ha sido surtida exitosamente.',
    type: 'success',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true
  }
];

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <img 
            src="https://appdesignproyectos.com/mexifarm.jpg" 
            alt="MexiFarm Logo" 
            className="h-8 w-8 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#023E8A] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar pacientes, citas o folios..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#023E8A]/10 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2.5 text-slate-400 hover:text-[#023E8A] hover:bg-[#023E8A]/5 rounded-xl transition-all outline-none",
                showNotifications && "text-[#023E8A] bg-[#023E8A]/5"
              )}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-slate-900">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {unreadCount} Nuevas
                    </span>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-bold">Sin notificaciones</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        className={cn(
                          "p-4 border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors cursor-pointer flex gap-3",
                          !n.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="mt-1 shrink-0">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold uppercase">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 bg-slate-50/50 text-center">
                  <button className="text-xs font-black text-[#023E8A] hover:underline uppercase tracking-widest">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Calendar */}
          <button 
            onClick={() => navigate('/agenda')}
            className="p-2.5 text-slate-400 hover:text-[#023E8A] hover:bg-[#023E8A]/5 rounded-xl transition-all outline-none"
          >
            <Calendar size={22} />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-100 mx-2" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-2 group outline-none"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{profile?.full_name || 'Dra. Hilda Martínez'}</p>
              <p className="text-[10px] font-bold text-[#023E8A] uppercase tracking-widest mt-1.5 opacity-60">{role}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#023E8A] to-[#0077B6] p-[2px] shadow-lg shadow-[#023E8A]/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-[#023E8A]">
                <User size={22} />
              </div>
            </div>
            <ChevronDown size={16} className={cn("text-slate-400 group-hover:text-slate-600 transition-all", showUserMenu && "rotate-180")} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-3 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
              <div className="px-6 py-4 border-b border-slate-50 mb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cuenta</p>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">{profile?.full_name || 'Dra. Hilda Martínez'}</p>
              </div>
              
              <button 
                onClick={() => {
                  navigate('/perfil');
                  setShowUserMenu(false);
                }}
                className="w-full px-6 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#023E8A] transition-colors flex items-center gap-3"
              >
                <UserCircle size={18} /> Mi Perfil
              </button>
              <button 
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full px-6 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#023E8A] transition-colors flex items-center gap-3"
              >
                <Settings size={18} /> Configuración
              </button>
              
              <div className="h-px bg-slate-50 my-2 mx-4" />
              
              <button 
                onClick={() => signOut()}
                className="w-full px-6 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
              >
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
