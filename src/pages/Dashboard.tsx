import React from 'react';
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Pill,
  DollarSign,
  UserPlus,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import RecentPatients from '../components/Dashboard/RecentPatients';
import InventoryAlerts from '../components/Dashboard/InventoryAlerts';
import { CardSkeleton, ChartSkeleton } from '../components/UI/Skeleton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const data = [
  { name: 'Mon', consultas: 12, recetas: 8 },
  { name: 'Tue', consultas: 19, recetas: 14 },
  { name: 'Wed', consultas: 15, recetas: 10 },
  { name: 'Thu', consultas: 22, recetas: 18 },
  { name: 'Fri', consultas: 30, recetas: 25 },
  { name: 'Sat', consultas: 10, recetas: 6 },
  { name: 'Sun', consultas: 4, recetas: 2 },
];

const StatCard = ({ title, value, icon: Icon, progress, color, loading }: any) => (
  <div className="glass-card p-6 rounded-[32px] flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <div className={cn("p-2.5 rounded-xl text-white shadow-lg", color)}>
        <Icon size={18} />
      </div>
    </div>
    
    <div className="mb-4">
      {loading ? (
        <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
      ) : (
        <h3 className="text-3xl font-display font-bold text-slate-900">{value}</h3>
      )}
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
        <span>Progreso Meta</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color.replace('bg-', 'bg-'))} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  </div>
);

const CircularProgress = ({ percentage, label }: { percentage: number, label: string }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          className="text-[#023E8A]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold text-slate-900">{percentage}%</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { role, profile } = useAuth();
  const queryClient = useQueryClient();

  // Queries for stats
  const { data: patientsCount = 0, isLoading: loadingPatients, refetch: refetchPatients } = useQuery({
    queryKey: ['patients-count'],
    queryFn: async () => {
      const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: appointmentsToday = 0, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_hora', `${today}T00:00:00`)
        .lte('fecha_hora', `${today}T23:59:59`);
      return count || 0;
    }
  });

  const { data: pendingPrescriptions = 0, isLoading: loadingPrescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['pending-prescriptions'],
    queryFn: async () => {
      const { count } = await supabase
        .from('prescription_fulfillment')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente');
      return count || 0;
    }
  });

  const { data: lowStockCount = 0, isLoading: loadingLowStock, refetch: refetchLowStock } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      const { data } = await supabase.from('inventory').select('stock_actual, stock_minimo');
      return data?.filter(item => item.stock_actual <= item.stock_minimo).length || 0;
    }
  });

  const handleRefresh = () => {
    refetchPatients();
    refetchAppointments();
    refetchPrescriptions();
    refetchLowStock();
    queryClient.invalidateQueries({ queryKey: ['recent-patients'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
  };

  const isAnyLoading = loadingPatients || loadingAppointments || loadingPrescriptions || loadingLowStock;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-700">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#023E8A] to-[#0077B6] rounded-[40px] p-10 text-white shadow-2xl shadow-[#023E8A]/20">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
              ¡Gestiona tu clínica con precisión de élite!
            </h1>
            <p className="text-white/80 text-lg mb-8 font-medium">
              Monitorea el rendimiento de tus consultas y el crecimiento de tu práctica médica en tiempo real.
            </p>
            <button 
              onClick={() => window.location.href = '/agenda'}
              className="bg-white text-[#023E8A] px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2 group"
            >
              Comenzar Ahora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-20 -bottom-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Profile Growth Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-display font-bold text-slate-900">Evolución de Consultas</h2>
            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-white/20">
              <button className="px-4 py-2 text-xs font-bold text-[#023E8A] bg-white rounded-lg shadow-sm">Semana</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Mes</button>
            </div>
          </div>

          {isAnyLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="glass-card p-8 rounded-[40px] h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Información General</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Tendencia de Pacientes</h3>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#023E8A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#023E8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '16px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consultas" 
                    stroke="#023E8A" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorConsultas)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Analytics Overview Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-slate-900 px-2">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isAnyLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                {role === 'admin' && (
                  <>
                    <StatCard title="Ingresos" value="$128.4K" icon={DollarSign} progress={85} color="bg-[#023E8A]" />
                    <StatCard title="Personal" value="42" icon={Users} progress={92} color="bg-[#48CAE4]" />
                    <StatCard title="Pacientes" value={patientsCount} icon={UserPlus} progress={78} color="bg-indigo-600" loading={loadingPatients} />
                  </>
                )}
                {role === 'especialista' && (
                  <>
                    <StatCard title="Citas Hoy" value={appointmentsToday} icon={Clock} progress={65} color="bg-[#023E8A]" loading={loadingAppointments} />
                    <StatCard title="Pacientes" value={patientsCount} icon={Users} progress={88} color="bg-[#48CAE4]" loading={loadingPatients} />
                    <StatCard title="Recetas" value="856" icon={ClipboardList} progress={72} color="bg-emerald-600" />
                  </>
                )}
                {role === 'farmacia' && (
                  <>
                    <StatCard title="Pendientes" value={pendingPrescriptions} icon={Clock} progress={45} color="bg-amber-500" loading={loadingPrescriptions} />
                    <StatCard title="Surtidas" value="45" icon={CheckCircle2} progress={95} color="bg-emerald-600" />
                    <StatCard title="Stock Bajo" value={lowStockCount} icon={AlertCircle} progress={15} color="bg-red-500" loading={loadingLowStock} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-96 space-y-8">
        {/* Statistics Section */}
        <div className="glass-card p-10 rounded-[40px] flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-bold text-slate-900">Statistics</h3>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw size={20} className={isAnyLoading ? 'animate-spin' : ''} onClick={handleRefresh} />
            </button>
          </div>
          
          <CircularProgress percentage={84} label="Pacientes Satisfechos" />
          
          <div className="mt-10 w-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#023E8A]" />
                <span className="text-sm font-bold text-slate-700">Consultas</span>
              </div>
              <span className="text-sm font-black text-slate-900">1.2K</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#48CAE4]" />
                <span className="text-sm font-bold text-slate-700">Recetas</span>
              </div>
              <span className="text-sm font-black text-slate-900">856</span>
            </div>
          </div>
        </div>

        {/* Recent Patients / Top Follower Section */}
        <div className="glass-card rounded-[40px] overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-slate-900">Pacientes Recientes</h3>
            <button className="text-[#023E8A] hover:text-[#0077B6] transition-colors">
              <Plus size={20} />
            </button>
          </div>
          <RecentPatients />
          <div className="p-6 bg-slate-50/30">
            <button className="w-full py-4 bg-[#023E8A] text-white rounded-2xl font-bold hover:bg-[#0047AB] shadow-xl shadow-[#023E8A]/20 transition-all text-sm">
              Additional Info
            </button>
          </div>
        </div>

        {/* Inventory Alerts for Admin/Farmacia */}
        {(role === 'farmacia' || role === 'admin') && (
          <div className="glass-card p-8 rounded-[40px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-slate-900">Alertas Críticas</h3>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-widest">Inventario</span>
            </div>
            <InventoryAlerts />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
