import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Package, DollarSign } from 'lucide-react';
import { InventoryItem, supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const inventorySchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  categoria: z.enum(['Antibiótico', 'Analgésico', 'Material de curación', 'Otro']),
  stock_actual: z.number().min(0, 'El stock no puede ser negativo'),
  stock_minimo: z.number().min(1, 'El stock mínimo debe ser al menos 1'),
  precio_unitario: z.number().min(0, 'El precio no puede ser negativo'),
  unidad: z.string().min(1, 'La unidad es requerida'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface CreateInventoryItemProps {
  onClose: () => void;
  onSuccess: (newItem: InventoryItem) => void;
}

const CreateInventoryItem: React.FC<CreateInventoryItemProps> = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: 'Otro',
      stock_actual: 0,
      stock_minimo: 10,
      precio_unitario: 0,
      unidad: 'Pieza',
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const { data: newItem, error } = await supabase
        .from('inventory')
        .insert([{
          nombre: data.nombre,
          descripcion: data.descripcion,
          categoria: data.categoria,
          stock_actual: data.stock_actual,
          stock_minimo: data.stock_minimo,
          precio_unitario: data.precio_unitario,
          unidad: data.unidad,
        }])
        .select()
        .single();

      if (error) throw error;
      
      onSuccess(newItem as InventoryItem);
      toast.success('Producto creado exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      toast.error('Error al crear el producto: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#023E8A]/10 rounded-xl flex items-center justify-center text-[#023E8A]">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nuevo Producto</h2>
              <p className="text-xs text-slate-500 mt-1">Añadir item al inventario</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nombre del Producto</label>
            <input
              {...register('nombre')}
              placeholder="Ej: Paracetamol 500mg"
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.nombre ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
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
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1">
                <DollarSign size={12} /> Precio Unitario (MXN)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('precio_unitario', { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.precio_unitario ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.precio_unitario && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.precio_unitario.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Stock Inicial</label>
              <input
                type="number"
                {...register('stock_actual', { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.stock_actual ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.stock_actual && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.stock_actual.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Stock Mínimo</label>
              <input
                type="number"
                {...register('stock_minimo', { valueAsNumber: true })}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.stock_minimo ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
              />
              {errors.stock_minimo && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.stock_minimo.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Unidad de Medida</label>
            <input
              {...register('unidad')}
              placeholder="Ej: Caja, Frasco, Pieza"
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${errors.unidad ? 'border-red-500' : 'border-slate-100'} focus:ring-2 focus:ring-[#023E8A]/10 transition-all outline-none text-sm`}
            />
            {errors.unidad && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.unidad.message}</p>}
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
              <Save size={18} />
              {isSubmitting ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInventoryItem;
