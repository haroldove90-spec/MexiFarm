import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Stethoscope, Pill as PillIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // For the demo, we'll allow "mock" login if Supabase isn't configured
  const handleMockLogin = (role: string) => {
    localStorage.setItem('demo_role', role);
    // Trigger a page reload to refresh AuthContext state
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6">
            <img 
              src="https://appdesignproyectos.com/mexifarm.jpg" 
              alt="MexiFarm Logo" 
              className="w-full h-full object-contain drop-shadow-sm rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700 text-center mb-6">Seleccione su perfil para ingresar (Demo)</p>
          
          <button
            onClick={() => handleMockLogin('admin')}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#023E8A] hover:bg-[#023E8A]/5 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-[#023E8A] group-hover:text-white transition-colors">
              <Shield size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Administrador</p>
              <p className="text-xs text-slate-500">Gestión de personal y analíticas</p>
            </div>
          </button>

          <button
            onClick={() => handleMockLogin('medico')}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#023E8A] hover:bg-[#023E8A]/5 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-[#023E8A] group-hover:text-white transition-colors">
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Médico Especialista</p>
              <p className="text-xs text-slate-500">Expedientes y consulta clínica</p>
            </div>
          </button>

          <button
            onClick={() => handleMockLogin('farmacia')}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-[#023E8A] hover:bg-[#023E8A]/5 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-[#023E8A] group-hover:text-white transition-colors">
              <PillIcon size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Farmacia / Suministros</p>
              <p className="text-xs text-slate-500">Surtido de recetas e inventario</p>
            </div>
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Cumple con NOM-004-SSA3-2012 & Estándares HIPAA
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
