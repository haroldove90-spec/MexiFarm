import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Globe, Moon, Sun, Smartphone, Database, Trash2 } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-display font-black text-slate-900">Configuración</h1>
        <p className="text-slate-500 mt-2">Personaliza tu experiencia y gestiona los ajustes del sistema</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full px-6 py-3 text-left bg-[#023E8A] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#023E8A]/10 flex items-center gap-3">
            <SettingsIcon size={18} /> General
          </button>
          <button className="w-full px-6 py-3 text-left text-slate-500 hover:bg-slate-50 rounded-2xl text-sm font-bold transition-colors flex items-center gap-3">
            <Bell size={18} /> Notificaciones
          </button>
          <button className="w-full px-6 py-3 text-left text-slate-500 hover:bg-slate-50 rounded-2xl text-sm font-bold transition-colors flex items-center gap-3">
            <Shield size={18} /> Privacidad
          </button>
          <button className="w-full px-6 py-3 text-left text-slate-500 hover:bg-slate-50 rounded-2xl text-sm font-bold transition-colors flex items-center gap-3">
            <Globe size={18} /> Idioma
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-8">
          {/* Appearance */}
          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Apariencia</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Modo Oscuro</p>
                  <p className="text-xs text-slate-500">Cambia entre tema claro y oscuro</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button className="p-2 bg-white rounded-lg shadow-sm text-[#023E8A]">
                    <Sun size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <Moon size={18} />
                  </button>
                </div>
              </div>
              <div className="h-px bg-slate-50" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Tamaño de Fuente</p>
                  <p className="text-xs text-slate-500">Ajusta la legibilidad del sistema</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option>Pequeño</option>
                  <option selected>Mediano</option>
                  <option>Grande</option>
                </select>
              </div>
            </div>
          </div>

          {/* System */}
          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Sistema y Almacenamiento</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sincronización Móvil</p>
                    <p className="text-xs text-slate-500">Mantén tus datos actualizados en todos tus dispositivos</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Copia de Seguridad</p>
                    <p className="text-xs text-slate-500">Última copia realizada hace 2 horas</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors">
                  Respaldar Ahora
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-8 rounded-[40px] border border-red-100 shadow-sm bg-red-50/10">
            <h3 className="text-lg font-bold text-red-600 mb-6">Zona de Peligro</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Borrar Caché del Sistema</p>
                  <p className="text-xs text-slate-500">Elimina archivos temporales para liberar espacio</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 size={16} /> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
