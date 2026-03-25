import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill, 
  Save, 
  Search, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import { supabase, Patient, InventoryItem } from '../../lib/supabase';
import { cn } from '../../lib/utils';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

const consultationSchema = z.object({
  // Triaje
  peso: z.number().min(0.1, 'Ingrese un peso válido'),
  estatura: z.number().min(0.1, 'Ingrese una estatura válida'),
  temperatura: z.number().min(30).max(45),
  presion: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato de presión inválido (Ej. 120/80)'),
  
  // Nota Clínica
  diagnostico: z.string().min(5, 'El diagnóstico es obligatorio'),
  plan_tratamiento: z.string().min(5, 'El plan de tratamiento es obligatorio'),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface PrescribedMedication {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  entregado_en_clinica: boolean;
}

interface ConsultationWorkflowProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

const ConsultationWorkflow: React.FC<ConsultationWorkflowProps> = ({ patient, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [medications, setMedications] = useState<PrescribedMedication[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      temperatura: 36.5,
    }
  });

  const peso = watch('peso');
  const estatura = watch('estatura');
  const [imc, setImc] = useState<number | null>(null);

  useEffect(() => {
    if (peso && estatura) {
      const heightInMeters = estatura / 100;
      const calculatedImc = peso / (heightInMeters * heightInMeters);
      setImc(parseFloat(calculatedImc.toFixed(1)));
    } else {
      setImc(null);
    }
  }, [peso, estatura]);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('nombre', { ascending: true });
    if (data) setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleLoadSampleInventory = async () => {
    setLoadingInventory(true);
    try {
      const sampleMeds = [
        { nombre: 'Amoxicilina 500mg', categoria: 'Antibiótico', stock_actual: 50, stock_minimo: 10, precio_unitario: 150, unidad: 'Caja' },
        { nombre: 'Paracetamol 500mg', categoria: 'Analgésico', stock_actual: 100, stock_minimo: 20, precio_unitario: 50, unidad: 'Caja' },
        { nombre: 'Ibuprofeno 400mg', categoria: 'Analgésico', stock_actual: 80, stock_minimo: 15, precio_unitario: 80, unidad: 'Caja' },
        { nombre: 'Loratadina 10mg', categoria: 'Otro', stock_actual: 60, stock_minimo: 10, precio_unitario: 120, unidad: 'Caja' },
        { nombre: 'Metformina 850mg', categoria: 'Otro', stock_actual: 40, stock_minimo: 10, precio_unitario: 200, unidad: 'Caja' },
        { nombre: 'Omeprazol 20mg', categoria: 'Otro', stock_actual: 90, stock_minimo: 15, precio_unitario: 110, unidad: 'Caja' },
        { nombre: 'Salbutamol Spray', categoria: 'Otro', stock_actual: 25, stock_minimo: 5, precio_unitario: 350, unidad: 'Frasco' },
        { nombre: 'Diclofenaco Gel', categoria: 'Analgésico', stock_actual: 30, stock_minimo: 5, precio_unitario: 180, unidad: 'Tubo' }
      ];

      const { error } = await supabase.from('inventory').insert(sampleMeds);
      if (error) throw error;
      
      toast.success('Inventario de muestra cargado');
      fetchInventory();
    } catch (err: any) {
      toast.error('Error al cargar inventario: ' + err.message);
    } finally {
      setLoadingInventory(false);
    }
  };

  const addMedication = (item: InventoryItem) => {
    if (medications.find(m => m.id === item.id)) return;
    setMedications([...medications, {
      id: item.id,
      nombre: item.nombre,
      dosis: '',
      frecuencia: '',
      duracion: '',
      entregado_en_clinica: false
    }]);
    setSearchTerm('');
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const updateMedication = (id: string, field: keyof PrescribedMedication, value: any) => {
    setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const [isSuccess, setIsSuccess] = useState(false);
  const [savedConsultation, setSavedConsultation] = useState<any>(null);

  const handleExportPDF = (consultation: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateStr = format(new Date(), "PPPP", { locale: es });

    // Header
    doc.setFillColor(2, 62, 138);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MEXIFARM', 20, 25);
    doc.setFontSize(10);
    doc.text(`RECETA MÉDICA - ${dateStr.toUpperCase()}`, 20, 32);

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Paciente: ${patient.nombre}`, 20, 55);
    doc.text(`CURP: ${patient.curp}`, 20, 62);

    // Details Table
    autoTable(doc, {
      startY: 70,
      head: [['Sección', 'Detalles']],
      body: [
        ['Diagnóstico', consultation.diagnostico],
        ['Signos Vitales', `Peso: ${consultation.signos_vitales.peso}kg | Talla: ${consultation.signos_vitales.estatura}cm | IMC: ${consultation.signos_vitales.imc}`],
        ['Prescripción', consultation.receta_json?.map((m: any) => `${m.nombre}: ${m.dosis} - ${m.frecuencia} (${m.duracion})`).join('\n') || 'Sin medicamentos'],
        ['Plan de Tratamiento', consultation.plan_tratamiento],
      ],
      theme: 'grid',
      headStyles: { fillColor: [2, 62, 138] },
      styles: { fontSize: 10, cellPadding: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    doc.save(`Receta_${patient.nombre.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const onSubmit = async (data: ConsultationFormData) => {
    console.log('Submitting consultation form...', data);
    setError(null);
    try {
      // Get user from auth session or demo mode
      let userId: string;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userId = user.id;
      } else {
        // Check for demo mode
        const demoRole = localStorage.getItem('demo_role');
        if (demoRole) {
          userId = '00000000-0000-0000-0000-000000000001';
          
          // Ensure demo profile exists in the database
          const { data: profileExists } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();
            
          if (!profileExists) {
            console.log('Creating demo profile...');
            await supabase.from('profiles').insert([{
              id: userId,
              full_name: 'Dra. Hilda Martínez',
              role: 'especialista',
              especialidad: 'Medicina General'
            }]);
          }
        } else {
          throw new Error('No se encontró sesión de usuario. Por favor inicie sesión.');
        }
      }

      console.log('Saving consultation for patient:', patient.id);
      // 1. Save Consultation
      const { data: consultation, error: consError } = await supabase
        .from('consultations')
        .insert([{
          patient_id: patient.id,
          doctor_id: userId,
          diagnostico: data.diagnostico,
          plan_tratamiento: data.plan_tratamiento,
          signos_vitales: {
            peso: data.peso,
            estatura: data.estatura,
            temperatura: data.temperatura,
            presion: data.presion,
            imc: imc
          },
          receta_json: medications
        }])
        .select()
        .single();

      if (consError) {
        console.error('Consultation insert error:', consError);
        throw consError;
      }

      console.log('Consultation saved successfully:', consultation.id);

      // 2. Create Prescription record if there are medications
      if (medications.length > 0) {
        try {
          const { data: prescription, error: presError } = await supabase
            .from('prescriptions')
            .insert([{
              consultation_id: consultation.id,
              medicamentos: medications,
              indicaciones: data.plan_tratamiento,
              estado: 'Pendiente'
            }])
            .select()
            .single();

          if (presError) {
            console.warn('Error creating prescription record, skipping:', presError);
          } else if (prescription) {
            // 3. Create Prescription Fulfillment record
            const { error: fulfillError } = await supabase
              .from('prescription_fulfillment')
              .insert([{
                prescription_id: prescription.id,
                consultation_id: consultation.id,
                status: 'pendiente'
              }]);
            
            if (fulfillError) {
              console.warn('Error creating fulfillment record, skipping:', fulfillError);
            }
          }
        } catch (pErr) {
          console.warn('Prescription flow failed but consultation was saved:', pErr);
        }

        // 4. Subtract stock for items delivered in clinic
        for (const med of medications) {
          if (med.entregado_en_clinica) {
            const item = inventory.find(i => i.id === med.id);
            if (item) {
              console.log(`Subtracting stock for ${item.nombre}...`);
              await supabase
                .from('inventory')
                .update({ stock_actual: Math.max(0, item.stock_actual - 1) })
                .eq('id', med.id);
            }
          }
        }
      }

      console.log('Workflow complete, showing success screen');
      setSavedConsultation(consultation);
      setIsSuccess(true);
      toast.success('Consulta guardada exitosamente');
      onSuccess();
    } catch (err: any) {
      console.error('Error saving consultation:', err);
      const errorMessage = err.message || 'Error al guardar la consulta';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Consulta Guardada!</h2>
          <p className="text-slate-500 mb-8">La información se ha registrado correctamente en el expediente del paciente.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleExportPDF(savedConsultation)}
              className="w-full py-4 bg-[#023E8A] text-white rounded-2xl font-bold hover:bg-[#0077B6] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#023E8A]/20"
            >
              <Download size={20} />
              Descargar Receta PDF
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredInventory = inventory.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#023E8A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#023E8A]/20">
              <Stethoscope size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nueva Consulta</h2>
              <p className="text-xs text-slate-500 mt-1">Paciente: <span className="font-bold text-[#023E8A]">{patient.nombre}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-8 py-4 bg-white border-b border-slate-50 flex items-center justify-between">
          {[
            { id: 1, label: 'Triaje', icon: Activity },
            { id: 2, label: 'Nota Clínica', icon: FileText },
            { id: 3, label: 'Receta', icon: Pill },
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                step === s.id ? "bg-[#023E8A] text-white scale-110" : 
                step > s.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                step === s.id ? "text-slate-900" : "text-slate-400"
              )}>{s.label}</span>
              {s.id < 3 && <div className="w-12 h-px bg-slate-100 mx-2" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="consultation-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Triaje */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Peso (kg)</label>
                    <input 
                      type="number" step="0.1"
                      {...register('peso', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all"
                    />
                    {errors.peso && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.peso.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Estatura (cm)</label>
                    <input 
                      type="number"
                      {...register('estatura', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all"
                    />
                    {errors.estatura && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.estatura.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Temperatura (°C)</label>
                    <input 
                      type="number" step="0.1"
                      {...register('temperatura', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Presión Arterial</label>
                    <input 
                      placeholder="120/80"
                      {...register('presion')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all"
                    />
                    {errors.presion && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.presion.message}</p>}
                  </div>
                </div>

                {imc && (
                  <div className={cn(
                    "p-6 rounded-3xl border flex items-center justify-between",
                    imc < 18.5 ? "bg-blue-50 border-blue-100 text-blue-700" :
                    imc < 25 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                    imc < 30 ? "bg-amber-50 border-amber-100 text-amber-700" :
                    "bg-red-50 border-red-100 text-red-700"
                  )}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70">Índice de Masa Corporal (IMC)</p>
                      <h3 className="text-3xl font-black mt-1">{imc}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {imc < 18.5 ? "Bajo Peso" :
                         imc < 25 ? "Peso Normal" :
                         imc < 30 ? "Sobrepeso" : "Obesidad"}
                      </p>
                      <p className="text-[10px] opacity-70">Cálculo automático</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Nota Clínica */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Diagnóstico (CIE-10)</label>
                  <textarea 
                    rows={3}
                    {...register('diagnostico')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all resize-none"
                    placeholder="Ej. Infección de vías respiratorias superiores (J06.9)"
                  />
                  {errors.diagnostico && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.diagnostico.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Plan de Tratamiento / Notas</label>
                  <textarea 
                    rows={6}
                    {...register('plan_tratamiento')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all resize-none"
                    placeholder="Indicaciones detalladas para el paciente..."
                  />
                  {errors.plan_tratamiento && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.plan_tratamiento.message}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Receta */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar medicamento en inventario..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#023E8A]/10 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto">
                      {filteredInventory.length > 0 ? filteredInventory.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addMedication(item)}
                          className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{item.nombre}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{item.categoria} · Stock: {item.stock_actual}</p>
                          </div>
                          <Plus size={18} className="text-slate-300 group-hover:text-[#023E8A]" />
                        </button>
                      )) : (
                        <div className="p-8 text-center space-y-4">
                          <p className="text-slate-400 text-sm">No se encontraron productos</p>
                          <button
                            type="button"
                            onClick={handleLoadSampleInventory}
                            disabled={loadingInventory}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
                          >
                            {loadingInventory ? 'Cargando...' : 'Cargar medicamentos de muestra'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {medications.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                      <Pill size={40} className="mb-3 opacity-20" />
                      <p className="text-sm">No se han añadido medicamentos a la receta</p>
                    </div>
                  ) : medications.map((med, idx) => (
                    <div key={med.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#023E8A] shadow-sm">
                            <Pill size={16} />
                          </div>
                          <h4 className="font-bold text-slate-900">{med.nombre}</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeMedication(med.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                          placeholder="Dosis (Ej. 500mg)"
                          className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#023E8A]/10"
                          value={med.dosis}
                          onChange={(e) => updateMedication(med.id, 'dosis', e.target.value)}
                        />
                        <input 
                          placeholder="Frecuencia (Ej. c/8h)"
                          className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#023E8A]/10"
                          value={med.frecuencia}
                          onChange={(e) => updateMedication(med.id, 'frecuencia', e.target.value)}
                        />
                        <input 
                          placeholder="Duración (Ej. 7 días)"
                          className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#023E8A]/10"
                          value={med.duracion}
                          onChange={(e) => updateMedication(med.id, 'duracion', e.target.value)}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-[#023E8A] focus:ring-[#023E8A]"
                          checked={med.entregado_en_clinica}
                          onChange={(e) => updateMedication(med.id, 'entregado_en_clinica', e.target.checked)}
                        />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Entregado en clínica (Descontar stock)</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={async () => {
                // Validate current step fields
                let isValid = false;
                if (step === 1) {
                  isValid = await trigger(['peso', 'estatura', 'temperatura', 'presion']);
                } else if (step === 2) {
                  isValid = await trigger(['diagnostico', 'plan_tratamiento']);
                }
                
                if (isValid) {
                  setStep(step + 1);
                } else {
                  toast.error('Por favor complete los campos requeridos correctamente');
                }
              }}
              className="px-8 py-3 rounded-xl font-bold text-white bg-[#023E8A] hover:bg-[#0077B6] shadow-lg shadow-[#023E8A]/20 transition-all text-sm flex items-center gap-2"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              form="consultation-form"
              type="submit"
              disabled={isSubmitting}
              onClick={async (e) => {
                // Check for validation errors before submitting
                const isValid = await trigger();
                if (!isValid) {
                  e.preventDefault();
                  toast.error('Hay errores en el formulario. Por favor revise los pasos anteriores.');
                  // Find first step with error and go there
                  if (errors.peso || errors.estatura || errors.temperatura || errors.presion) {
                    setStep(1);
                  } else if (errors.diagnostico || errors.plan_tratamiento) {
                    setStep(2);
                  }
                }
              }}
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting ? 'Guardando...' : 'Finalizar Consulta'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationWorkflow;
