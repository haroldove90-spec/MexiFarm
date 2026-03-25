import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Phone, MapPin, Edit2, Camera } from 'lucide-react';

const Profile = () => {
  const { profile, role } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-display font-black text-slate-900">Mi Perfil</h1>
        <p className="text-slate-500 mt-2">Gestiona tu información personal y profesional</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#023E8A] to-[#0077B6] rounded-[40px] flex items-center justify-center text-white shadow-xl shadow-[#023E8A]/20">
                <User size={64} />
              </div>
              <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg text-[#023E8A] hover:scale-110 transition-transform border border-slate-100">
                <Camera size={18} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'Dra. Hilda Martínez'}</h2>
            <p className="text-xs font-black text-[#023E8A] uppercase tracking-widest mt-2 opacity-70">{role || 'Médico Especialista'}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center gap-4">
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">124</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Consultas</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">4.9</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900">Información General</h3>
              <button className="flex items-center gap-2 text-sm font-bold text-[#023E8A] hover:underline">
                <Edit2 size={16} /> Editar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Correo Electrónico
                </p>
                <p className="text-sm font-bold text-slate-700">hilda.martinez@mexifarm.com</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Teléfono
                </p>
                <p className="text-sm font-bold text-slate-700">+52 (555) 123-4567</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Cédula Profesional
                </p>
                <p className="text-sm font-bold text-slate-700">{profile?.cedula || '12345678'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Especialidad
                </p>
                <p className="text-sm font-bold text-slate-700">{profile?.especialidad || 'Medicina General'}</p>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Consultorio
                </p>
                <p className="text-sm font-bold text-slate-700">MexiFarm - Sucursal Central, Consultorio 4B</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Contraseña</p>
                  <p className="text-xs text-slate-500">Última actualización hace 3 meses</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Cambiar
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Autenticación de Dos Pasos</p>
                  <p className="text-xs text-slate-500 text-emerald-600 font-bold">Activado</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
