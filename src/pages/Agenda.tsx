import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { CardSkeleton } from '../components/UI/Skeleton';
import AddPatientForm from '../components/Patients/AddPatientForm';

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  fecha_hora: string;
  motivo: string;
  estado: 'Programada' | 'Completada' | 'Cancelada';
  paciente?: {
    nombre: string;
  };
}

interface Patient {
  id: string;
  nombre: string;
}

const Agenda = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00',
    motivo: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [appointmentsRes, patientsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            *,
            paciente:patients(nombre)
          `)
          .order('fecha_hora', { ascending: true }),
        supabase
          .from('patients')
          .select('id, nombre')
          .order('nombre')
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (patientsRes.error) throw patientsRes.error;

      setAppointments(appointmentsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateClick = (arg: any) => {
    setNewAppointment({
      ...newAppointment,
      fecha: format(arg.date, 'yyyy-MM-dd'),
      hora: format(arg.date, 'HH:mm')
    });
    setShowModal(true);
  };

  const handleEventClick = (arg: any) => {
    const apt = appointments.find(a => a.id === arg.event.id);
    if (apt) {
      toast.info(`Cita: ${apt.paciente?.nombre}\nMotivo: ${apt.motivo}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debe iniciar sesión para programar citas');
      return;
    }

    try {
      const fechaHora = `${newAppointment.fecha}T${newAppointment.hora}:00`;
      
      // Ensure profile exists for demo user
      if (user.id === '00000000-0000-0000-0000-000000000001') {
        const { data: profileExists } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (!profileExists) {
          await supabase.from('profiles').insert([{
            id: user.id,
            full_name: 'Dra. Hilda Martínez',
            role: 'especialista',
            especialidad: 'Medicina General'
          }]);
        }
      }

      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: newAppointment.patient_id,
          doctor_id: user.id,
          fecha_hora: fechaHora,
          motivo: newAppointment.motivo,
          estado: 'Programada'
        }]);

      if (error) throw error;

      toast.success('Cita programada con éxito');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error('Error al programar cita: ' + error.message);
    }
  };

  const events = appointments.map(apt => ({
    id: apt.id,
    title: apt.paciente?.nombre || 'Paciente',
    start: apt.fecha_hora,
    backgroundColor: apt.estado === 'Completada' ? '#10b981' : apt.estado === 'Cancelada' ? '#ef4444' : '#023E8A',
    borderColor: 'transparent',
    extendedProps: { motivo: apt.motivo }
  }));

  const filteredAppointments = appointments.filter(apt => 
    apt.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.fecha_hora);
    const today = startOfToday();
    return format(aptDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CardSkeleton className="h-[700px]" />
          </div>
          <div className="space-y-6">
            <CardSkeleton className="h-[300px]" />
            <CardSkeleton className="h-[350px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Agenda Médica</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestiona tus citas y horarios de consulta</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => fetchData()}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#023E8A] text-white rounded-2xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-xl shadow-blue-900/20 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Nueva Cita
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Calendar Section */}
        <div className="w-full">
          <div className="bg-white/70 backdrop-blur-xl p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={esLocale}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                minHeight="650px"
                selectable={true}
                nowIndicator={true}
                dayMaxEvents={true}
                slotMinTime="07:00:00"
                slotMaxTime="21:00:00"
                themeSystem="standard"
                expandRows={true}
                handleWindowResize={true}
                aspectRatio={1.35}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Section (Now below calendar for full width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today's Summary */}
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Hoy</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                {format(new Date(), 'dd MMM', { locale: es })}
              </span>
            </div>
            
            <div className="space-y-4">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className="group p-4 bg-white/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Clock size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{apt.paciente?.nombre}</p>
                        <p className="text-xs font-bold text-slate-500 mt-0.5">
                          {format(parseISO(apt.fecha_hora), 'hh:mm a')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          apt.estado === 'Completada' ? 'bg-emerald-500' : 
                          apt.estado === 'Cancelada' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        {apt.estado === 'Programada' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/pacientes');
                              toast.info('Seleccione al paciente para iniciar la consulta');
                            }}
                            className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            ATENDER
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="text-slate-300" size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No hay citas para hoy</p>
                </div>
              )}
            </div>
          </div>

          {/* Search & Upcoming */}
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-6">Próximas Citas</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.slice(0, 10).map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {format(parseISO(apt.fecha_hora), 'MMM', { locale: es })}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {format(parseISO(apt.fecha_hora), 'dd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{apt.paciente?.nombre}</p>
                      <p className="text-xs font-bold text-slate-500">{apt.motivo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm font-bold text-slate-400 py-4">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Nueva Cita</h2>
                <p className="text-sm text-slate-500 font-medium">Completa los detalles de la consulta</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-black text-slate-700">Paciente</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingPatient(true)}
                    className="text-xs font-bold text-[#023E8A] hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Nuevo Paciente
                  </button>
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    required
                    value={newAppointment.patient_id}
                    onChange={(e) => setNewAppointment({...newAppointment, patient_id: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="">Seleccionar paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-1">Fecha</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      required
                      value={newAppointment.fecha}
                      onChange={(e) => setNewAppointment({...newAppointment, fecha: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-1">Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="time"
                      required
                      value={newAppointment.hora}
                      onChange={(e) => setNewAppointment({...newAppointment, hora: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Motivo de Consulta</label>
                <textarea
                  required
                  rows={3}
                  value={newAppointment.motivo}
                  onChange={(e) => setNewAppointment({...newAppointment, motivo: e.target.value})}
                  placeholder="Ej: Revisión general, seguimiento..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#023E8A] text-white rounded-2xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingPatient && (
        <AddPatientForm 
          onClose={() => setIsAddingPatient(false)}
          onSuccess={() => {
            fetchData();
            toast.success('Paciente registrado correctamente');
          }}
        />
      )}

      <style>{`
        .calendar-container .fc {
          --fc-border-color: #f1f5f9;
          --fc-daygrid-event-dot-width: 8px;
          --fc-event-border-color: transparent;
          --fc-today-bg-color: #f8fafc;
          font-family: inherit;
        }
        .calendar-container .fc-header-toolbar {
          margin-bottom: 2rem !important;
        }
        .calendar-container .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 900 !important;
          color: #0f172a;
          text-transform: capitalize;
        }
        .calendar-container .fc-button {
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          color: #64748b !important;
          font-weight: 700 !important;
          font-size: 0.875rem !important;
          padding: 0.6rem 1.2rem !important;
          border-radius: 12px !important;
          text-transform: capitalize !important;
          box-shadow: none !important;
          transition: all 0.2s !important;
        }
        .calendar-container .fc-button:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        .calendar-container .fc-button-active {
          background: #023E8A !important;
          color: #fff !important;
          border-color: #023E8A !important;
        }
        .calendar-container .fc-col-header-cell {
          padding: 1rem 0 !important;
          background: #f8fafc;
          border: none !important;
        }
        .calendar-container .fc-col-header-cell-cushion {
          font-size: 0.75rem !important;
          font-weight: 800 !important;
          color: #94a3b8 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none !important;
        }
        .calendar-container .fc-daygrid-day {
          border-color: #f1f5f9 !important;
          min-height: 120px !important;
        }
        .calendar-container .fc-daygrid-day-frame {
          min-height: 120px !important;
        }
        .calendar-container .fc-daygrid-day-number {
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          color: #64748b !important;
          padding: 0.75rem !important;
          text-decoration: none !important;
        }
        .calendar-container .fc-daygrid-body {
          width: 100% !important;
        }
        .calendar-container .fc-scrollgrid {
          border: none !important;
        }
        .calendar-container .fc-scrollgrid-section-header > td {
          border: none !important;
        }
        .calendar-container .fc-event {
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          margin: 2px 4px !important;
          cursor: pointer !important;
          transition: transform 0.2s !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
        }
        .calendar-container .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        }
        @media (max-width: 768px) {
          .calendar-container .fc-daygrid-day {
            min-height: 80px !important;
          }
          .calendar-container .fc-daygrid-day-frame {
            min-height: 80px !important;
          }
          .calendar-container .fc-toolbar {
            flex-direction: column;
            gap: 1rem;
          }
          .calendar-container .fc-toolbar-title {
            font-size: 1.1rem !important;
          }
          .calendar-container .fc-button {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.75rem !important;
          }
          .calendar-container .fc-header-toolbar {
            margin-bottom: 1rem !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Agenda;
