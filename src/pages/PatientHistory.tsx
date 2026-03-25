import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Patient, Consultation } from '../lib/supabase';
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Pill, 
  ChevronLeft,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  Edit,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EditConsultationModal from '../components/Modals/EditConsultationModal';
import ConsultationWorkflow from '../components/Consultations/ConsultationWorkflow';
import { Skeleton } from '../components/UI/Skeleton';

const PatientHistorySkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="glass-card p-6 rounded-[32px] h-96">
          <Skeleton className="h-24 w-24 rounded-3xl mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-[32px] h-48" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);

  const { data: patient, isLoading: loadingPatient, refetch: refetchPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id
  });

  const { data: consultations = [], isLoading: loadingConsultations, refetch: refetchConsultations } = useQuery({
    queryKey: ['patient-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Consultation[];
    },
    enabled: !!id
  });

  const handleRefresh = () => {
    refetchPatient();
    refetchConsultations();
  };

  const handleExportPDF = () => {
    if (!patient) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(2, 62, 138); // #023E8A
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MEXIFARM', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EXPEDIENTE CLÍNICO DIGITAL', 20, 32);

    // Patient Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 20, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Campo', 'Información']],
      body: [
        ['Nombre Completo', patient.nombre],
        ['CURP', patient.curp],
        ['Fecha de Nacimiento', patient.fecha_nacimiento],
        ['Alergias', patient.alergias?.join(', ') || 'Ninguna'],
        ['Contacto de Emergencia', patient.contacto_emergencia || 'No registrado'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [2, 62, 138] },
      styles: { fontSize: 10 },
    });

    // Consultations Section
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORIAL DE CONSULTAS', 20, currentY);

    if (consultations.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No hay consultas registradas en el historial.', 20, currentY + 10);
    } else {
      consultations.forEach((consultation, index) => {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        const dateStr = format(new Date(consultation.created_at), "PPPP", { locale: es });
        
        autoTable(doc, {
          startY: currentY + 5,
          head: [[`Consulta #${consultations.length - index} - ${dateStr}`]],
          body: [
            ['Diagnóstico', consultation.diagnostico],
            ['Signos Vitales', `Peso: ${consultation.signos_vitales.peso}kg | Talla: ${consultation.signos_vitales.estatura}cm | IMC: ${consultation.signos_vitales.imc}`],
            ['Prescripción', consultation.receta_json?.map((m: any) => `${m.nombre}: ${m.dosis} - ${m.frecuencia}`).join('\n') || 'Sin medicamentos'],
            ['Plan de Tratamiento', consultation.plan_tratamiento],
          ],
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 5 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')} - Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`Expediente_${patient.nombre.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportSingleConsultation = (consultation: Consultation) => {
    if (!patient) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateStr = format(new Date(consultation.created_at), "PPPP", { locale: es });

    // Header
    doc.setFillColor(2, 62, 138);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MEXIFARM', 20, 25);
    doc.setFontSize(10);
    doc.text(`CONSULTA MÉDICA - ${dateStr.toUpperCase()}`, 20, 32);

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
        ['Prescripción', consultation.receta_json?.map((m: any) => `${m.nombre}: ${m.dosis} - ${m.frecuencia}`).join('\n') || 'Sin medicamentos'],
        ['Plan de Tratamiento', consultation.plan_tratamiento],
      ],
      theme: 'grid',
      headStyles: { fillColor: [2, 62, 138] },
      styles: { fontSize: 10, cellPadding: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    doc.save(`Consulta_${patient.nombre.replace(/\s+/g, '_')}_${format(new Date(consultation.created_at), 'yyyyMMdd')}.pdf`);
  };

  if (loadingPatient || loadingConsultations) {
    return <PatientHistorySkeleton />;
  }

  if (!patient) {
    return (
      <div className="text-center p-12 glass-card rounded-[40px] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-display font-bold text-slate-900">Paciente no encontrado</h2>
        <button 
          onClick={() => navigate('/pacientes')}
          className="mt-4 text-[#023E8A] font-bold hover:underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/pacientes')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Volver a Pacientes
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2 glass-card rounded-xl text-slate-500 hover:bg-white transition-all"
            title="Actualizar"
          >
            <RefreshCw size={20} className={(loadingPatient || loadingConsultations) ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all"
          >
            <Download size={18} />
            Exportar PDF
          </button>
          <button 
            onClick={() => setIsNewConsultationOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#023E8A] text-white rounded-xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-xl shadow-[#023E8A]/20 active:scale-95"
          >
            <Activity size={18} />
            Nueva Consulta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Patient Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#023E8A]/5 to-[#023E8A]/10 rounded-[32px] flex items-center justify-center text-[#023E8A] mb-4 shadow-inner">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900">{patient.nombre}</h2>
              <p className="text-xs font-bold text-[#023E8A] uppercase tracking-[0.2em] mt-2 opacity-70">{patient.curp}</p>
            </div>

            <div className="space-y-6 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fecha de Nacimiento</p>
                <p className="text-sm font-bold text-slate-700">{patient.fecha_nacimiento}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Alergias</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.alergias && patient.alergias.length > 0 ? (
                    patient.alergias.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-100">
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Ninguna reportada</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contacto de Emergencia</p>
                <p className="text-sm font-bold text-slate-700">{patient.contacto_emergencia || 'No registrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Timeline */}
        <div className="lg:col-span-3 space-y-8">
          <header className="px-2">
            <h3 className="text-2xl font-display font-bold text-slate-900">Historial de Consultas</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Cronología de visitas y tratamientos especializados</p>
          </header>

          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-100">
            {consultations.length === 0 ? (
              <div className="glass-card p-16 rounded-[40px] border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={40} className="text-slate-200" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Sin registros aún</h4>
                <p className="text-slate-500 max-w-xs mx-auto">No hay consultas registradas para este paciente en el historial clínico.</p>
              </div>
            ) : (
              consultations.map((consultation) => (
                <div key={consultation.id} className="relative pl-12 group">
                  <div className="absolute left-0 top-2 w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-[#023E8A] z-10 shadow-sm group-hover:border-[#023E8A]/30 transition-colors">
                    <Clock size={18} />
                  </div>
                  
                  <div className="glass-card p-8 rounded-[40px] border border-white/40 shadow-sm hover:shadow-xl hover:shadow-[#023E8A]/5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <span className="text-[10px] font-bold text-[#023E8A] bg-[#023E8A]/5 px-4 py-1.5 rounded-full uppercase tracking-[0.15em] border border-[#023E8A]/10">
                          Consulta Médica
                        </span>
                        <h4 className="text-lg font-display font-bold text-slate-900 mt-4">
                          {format(new Date(consultation.created_at), "PPPP", { locale: es })}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => setEditingConsultation(consultation)}
                          className="p-3 hover:bg-[#023E8A]/5 rounded-2xl text-slate-400 hover:text-[#023E8A] transition-all"
                          title="Editar Consulta"
                        >
                          <Edit size={20} />
                        </button>
                        <button 
                          onClick={() => handleExportSingleConsultation(consultation)}
                          className="p-3 hover:bg-[#023E8A]/5 rounded-2xl text-slate-400 hover:text-[#023E8A] transition-all"
                          title="Exportar Consulta"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Activity size={14} className="text-[#023E8A]" /> Signos Vitales
                          </p>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50/50 p-3 rounded-2xl text-center border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Peso</p>
                              <p className="text-sm font-black text-slate-900">{consultation.signos_vitales.peso} <span className="text-[10px] font-bold text-slate-400">kg</span></p>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-2xl text-center border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Talla</p>
                              <p className="text-sm font-black text-slate-900">{consultation.signos_vitales.estatura} <span className="text-[10px] font-bold text-slate-400">cm</span></p>
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-2xl text-center border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">IMC</p>
                              <p className="text-sm font-black text-slate-900">{consultation.signos_vitales.imc}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnóstico (CIE-10)</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                            {consultation.diagnostico}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Pill size={14} className="text-emerald-600" /> Prescripción
                          </p>
                          <div className="space-y-2.5">
                            {consultation.receta_json && consultation.receta_json.length > 0 ? (
                              consultation.receta_json.map((med: any, idx: number) => (
                                <div key={idx} className="text-xs bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/50">
                                  <p className="font-bold text-emerald-900">{med.nombre}</p>
                                  <p className="text-emerald-600 mt-1 font-medium">{med.dosis} - {med.frecuencia} por {med.duracion}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic bg-slate-50/30 p-3 rounded-2xl border border-slate-100">Sin medicamentos prescritos</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Plan de Tratamiento</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">
                            {consultation.plan_tratamiento}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editingConsultation && (
        <EditConsultationModal 
          consultation={editingConsultation}
          onClose={() => setEditingConsultation(null)}
        />
      )}

      {isNewConsultationOpen && patient && (
        <ConsultationWorkflow 
          patient={patient}
          onClose={() => setIsNewConsultationOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['patient-history', id] });
            setIsNewConsultationOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientHistory;
