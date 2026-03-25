import React from 'react';
import { Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../UI/Skeleton';

const InventoryAlerts = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) throw error;
      // Filter items where stock_actual <= stock_minimo
      return (data || []).filter(item => item.stock_actual <= item.stock_minimo)
        .sort((a, b) => a.stock_actual - b.stock_actual);
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-3 w-1/3 rounded-lg" />
            </div>
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-16 h-16 bg-emerald-50/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100/50">
          <Package size={32} className="text-emerald-400" />
        </div>
        <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Inventario Saludable</p>
        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest opacity-60">Todos los productos tienen stock suficiente</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50/50">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="p-6 hover:bg-white/40 transition-all flex items-center gap-4 group relative overflow-hidden"
        >
          <div className="w-12 h-12 bg-red-50/50 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-red-500/20 z-10">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1 min-w-0 z-10">
            <p className="text-sm font-black text-slate-900 truncate group-hover:text-red-600 transition-colors uppercase tracking-tight">{item.nombre}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Stock Bajo
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                Mín: {item.stock_minimo} {item.unidad}
              </span>
            </div>
          </div>
          <div className="text-right z-10">
            <p className="text-xl font-black text-red-600 leading-none tracking-tighter">{item.stock_actual}</p>
            <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">{item.unidad}</p>
          </div>
          <button className="p-2.5 hover:bg-white rounded-xl text-slate-300 hover:text-[#023E8A] transition-all duration-300 hover:shadow-sm z-10">
            <ShoppingCart size={18} />
          </button>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ))}
    </div>
  );
};

export default InventoryAlerts;
