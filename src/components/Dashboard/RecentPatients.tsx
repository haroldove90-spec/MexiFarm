import React from 'react';
import { User, ChevronRight, MoreVertical } from 'lucide-react';
import { Patient, supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Skeleton } from '../UI/Skeleton';

const RecentPatients = () => {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['recent-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-3 w-1/3 rounded-lg" />
            </div>
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50/50">
      {patients.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin registros recientes</p>
        </div>
      ) : (
        patients.map((patient) => (
          <Link 
            key={patient.id} 
            to={`/pacientes/${patient.id}/historial`}
            className="p-6 hover:bg-white/40 transition-all flex items-center gap-4 group cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#023E8A]/5 to-[#023E8A]/10 rounded-2xl flex items-center justify-center text-[#023E8A] group-hover:bg-[#023E8A] group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-[#023E8A]/20 z-10">
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0 z-10">
              <p className="text-sm font-black text-slate-900 truncate group-hover:text-[#023E8A] transition-colors">{patient.nombre}</p>
              <div className="flex items-center gap-2 mt-1 opacity-60">
                <span className="text-[10px] font-black text-[#023E8A] uppercase tracking-widest">{patient.curp}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500">{patient.fecha_nacimiento}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-[#023E8A] transition-all group-hover:translate-x-1 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#023E8A]/0 to-[#023E8A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        ))
      )}
    </div>
  );
};

export default RecentPatients;
