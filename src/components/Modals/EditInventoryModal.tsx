import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Package, AlertTriangle } from 'lucide-react';
import { InventoryItem, supabase } from '../../lib/supabase';

const inventorySchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  categoria: z.enum(['Antibiótico', 'Analgésico', 'Material de curación', 'Otro']),
  stock_actual: z.number().min(0, 'El stock no puede ser negativo'),
  stock_minimo: z.number().min(1, 'El stock mínimo debe ser al menos 1'),
  unidad: z.string().min(1, 'La unidad es requerida'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface EditInventoryModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ item, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      categoria: item.categoria,
      stock_actual: item.stock_actual,
      stock_minimo: item.stock_minimo,
      unidad: item.unidad,
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          nombre: data.nombre,
          descripcion: data.descripcion,
          categoria: data.categoria,
          stock_actual: data.stock_actual,
          stock_minimo: data.stock_minimo,
          unidad: data.unidad,
        })
        .eq('id', item.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Error al actualizar el inventario');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#48CAE4]/10 rounded-xl flex items-center justify-center text-[#48CAE4]">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Editar Producto</h2>
              <p className="text-xs text-slate-500 mt-1">Gestión de stock e inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nombre del Medicamento/Insumo</label>
            <input
              {...register('nombre')}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              placeholder="Ej. Amoxicilina 500mg"
            />
            {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Categoría</label>
              <select
                {...register('categoria')}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm appearance-none"
              >
                <option value="Antibiótico">Antibiótico</option>
                <option value="Analgésico">Analgésico</option>
                <option value="Material de curación">Material de curación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Unidad</label>
              <input
                {...register('unidad')}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.unidad ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
                placeholder="Ej. Caja, Ampolleta, Frasco"
              />
              {errors.unidad && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.unidad.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Stock Actual</label>
              <input
                type="number"
                {...register('stock_actual', { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.stock_actual ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.stock_actual && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.stock_actual.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                {...register('stock_minimo', { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.stock_minimo ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.stock_minimo && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.stock_minimo.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Descripción</label>
            <textarea
              {...register('descripcion')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm resize-none"
              placeholder="Notas adicionales sobre el producto..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-[#023E8A] hover:bg-[#0077B6] shadow-lg shadow-[#023E8A]/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Actualizar Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;
