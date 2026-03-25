import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Package, AlertTriangle, Edit2, Trash2, RefreshCw, Download, Layers } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, InventoryItem } from '../lib/supabase';
import EditInventoryItem from '../components/Modals/EditInventoryItem';
import CreateInventoryItem from '../components/Modals/CreateInventoryItem';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { TableSkeleton } from '../components/UI/Skeleton';

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: inventory, isLoading, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as InventoryItem[];
    }
  });

  const handleEditSuccess = (updatedItem: InventoryItem) => {
    queryClient.setQueryData(['inventory'], (old: InventoryItem[] | undefined) => {
      if (!old) return [updatedItem];
      return old.map(item => item.id === updatedItem.id ? updatedItem : item);
    });
  };

  const handleCreateSuccess = (newItem: InventoryItem) => {
    queryClient.setQueryData(['inventory'], (old: InventoryItem[] | undefined) => {
      if (!old) return [newItem];
      return [newItem, ...old];
    });
  };

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredInventory = inventory?.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" onClick={() => setOpenMenuId(null)}>
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Inventario</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestión inteligente de farmacia y suministros médicos</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#023E8A] to-[#0077B6] text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-900/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-card overflow-hidden">
        {/* Filters & Search Bar */}
        <div className="p-8 border-b border-slate-100/50 flex flex-col lg:flex-row gap-6 items-center justify-between bg-white/30">
          <div className="relative w-full lg:w-[450px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#023E8A] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, categoría o código..." 
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white/60 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-sm transition-all">
              <Filter size={18} />
              Filtros
            </button>
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white/60 border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-white hover:shadow-sm transition-all">
              <Download size={18} />
              Exportar
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Producto</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Categoría</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Stock</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Precio</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton rows={6} cols={5} />
                  </td>
                </tr>
              ) : filteredInventory?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Package size={40} />
                      </div>
                      <p className="text-slate-500 font-medium">No se encontraron productos en el inventario.</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-[#023E8A] font-bold hover:underline"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory?.map((item) => {
                const isLowStock = item.stock_actual <= item.stock_minimo;
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110",
                          isLowStock ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                          <Package size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{item.nombre}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider">{item.unidad}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold text-lg",
                          isLowStock ? "text-red-600" : "text-slate-900"
                        )}>
                          {item.stock_actual}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold animate-pulse">
                            <AlertTriangle size={12} />
                            BAJO
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Mínimo sugerido: {item.stock_minimo}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-900">
                        ${item.precio_unitario.toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-medium ml-1">MXN</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => setEditingItem(item)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                          title="Editar"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Función de eliminación restringida por seguridad');
                          }}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                          title="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item.id ? null : item.id);
                            }}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                          >
                            <MoreVertical size={20} />
                          </button>
                          {openMenuId === item.id && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                              <div className="px-4 py-2 mb-2 border-b border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opciones</p>
                              </div>
                              <button 
                                onClick={() => toast.info('Función de movimientos en desarrollo')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                              >
                                <Layers size={16} /> Ver Movimientos
                              </button>
                              <button 
                                onClick={() => toast.info('Función de ajuste de stock en desarrollo')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                              >
                                <AlertTriangle size={16} /> Ajustar Stock
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <EditInventoryItem 
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showCreateModal && (
        <CreateInventoryItem 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default InventoryList;
