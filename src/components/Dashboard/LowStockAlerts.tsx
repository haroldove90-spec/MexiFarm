import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, ChevronRight, MoreVertical, ShoppingCart } from 'lucide-react';
import { InventoryItem, supabase } from '../../lib/supabase';

const LowStockAlerts = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .lt('stock_actual', 'stock_minimo') // stock_actual < stock_minimo
        .order('stock_actual', { ascending: true });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchLowStockItems();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Alertas de Stock Bajo</h3>
          <div className="w-8 h-8 bg-slate-50 rounded-lg animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-slate-50 rounded w-1/3 animate-pulse" />
              </div>
              <div className="w-16 h-6 bg-slate-50 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-red-50 flex items-center justify-between bg-red-50/30">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="font-bold text-slate-900">Alertas de Stock Bajo</h3>
        </div>
        <button className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
      <div className="divide-y divide-red-50">
        {items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Todo el inventario está en niveles óptimos</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-red-50/30 transition-colors flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                <Package size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{item.categoria}</span>
                  <span className="w-1 h-1 bg-red-200 rounded-full" />
                  <span className="text-[10px] text-slate-400">Mín: {item.stock_minimo} {item.unidad}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-red-600 leading-none">{item.stock_actual}</p>
                <p className="text-[10px] text-red-400 mt-1 uppercase font-bold tracking-tighter">{item.unidad}</p>
              </div>
              <ChevronRight size={16} className="text-red-200 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
            </div>
          ))
        )}
      </div>
      <div className="p-4 bg-red-50/30 border-t border-red-50">
        <button className="w-full py-2 text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
          <ShoppingCart size={14} />
          Generar Orden de Compra
        </button>
      </div>
    </div>
  );
};

export default LowStockAlerts;
