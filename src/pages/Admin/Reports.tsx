import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

const data = [
  { name: 'Lun', consultas: 45, pacientes: 30 },
  { name: 'Mar', consultas: 52, pacientes: 35 },
  { name: 'Mie', consultas: 48, pacientes: 32 },
  { name: 'Jue', consultas: 61, pacientes: 40 },
  { name: 'Vie', consultas: 55, pacientes: 38 },
  { name: 'Sab', consultas: 32, pacientes: 20 },
  { name: 'Dom', consultas: 15, pacientes: 10 },
];

const pieData = [
  { name: 'General', value: 400 },
  { name: 'Pediatría', value: 300 },
  { name: 'Ginecología', value: 300 },
  { name: 'Cardiología', value: 200 },
];

const COLORS = ['#023E8A', '#0077B6', '#0096C7', '#00B4D8'];

const Reports = () => {
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(2, 62, 138); // #023E8A
      doc.text('MexiFarm - Reporte de Actividad', 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      // Stats Summary
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('Resumen de Indicadores', 14, 45);
      
      const statsData = [
        ['Indicador', 'Valor', 'Cambio'],
        ['Consultas Totales', '1,284', '+12.5%'],
        ['Pacientes Nuevos', '342', '+8.2%'],
        ['Citas Canceladas', '45', '-2.4%'],
        ['Ingresos Estimados', '$124,500', '+15.3%']
      ];
      
      autoTable(doc, {
        startY: 50,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [2, 62, 138] },
      });
      
      // Weekly Activity
      doc.text('Actividad Semanal', 14, (doc as any).lastAutoTable.finalY + 15);
      
      const weeklyData = [
        ['Día', 'Consultas', 'Pacientes'],
        ...data.map(d => [d.name, d.consultas.toString(), d.pacientes.toString()])
      ];
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [weeklyData[0]],
        body: weeklyData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 119, 182] },
      });
      
      // Specialty Distribution
      doc.text('Distribución por Especialidad', 14, (doc as any).lastAutoTable.finalY + 15);
      
      const distributionData = [
        ['Especialidad', 'Valor', 'Porcentaje'],
        ...pieData.map(p => [p.name, p.value.toString(), `${Math.round((p.value / 1200) * 100)}%`])
      ];
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [distributionData[0]],
        body: distributionData.slice(1),
        theme: 'plain',
        headStyles: { fillColor: [0, 150, 199] },
      });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      doc.save('reporte-mexifarm.pdf');
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reportes y Analíticas</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoreo de indicadores clave de rendimiento (KPIs)</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-slate-200/50">
            <Filter size={18} />
            Filtrar Periodo
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-8 py-4 bg-[#023E8A] text-white rounded-2xl text-sm font-bold hover:bg-[#0047AB] transition-all shadow-xl shadow-blue-900/20 active:scale-95 group"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Consultas Totales', value: '1,284', change: '+12.5%', isUp: true, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Nuevos', value: '342', change: '+8.2%', isUp: true, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Citas Canceladas', value: '45', change: '-2.4%', isUp: false, icon: Calendar, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Ingresos Estimados', value: '$124,500', change: '+15.3%', isUp: true, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl shadow-slate-200/50 hover:shadow-blue-900/10 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Activity Chart */}
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[48px] border border-white/40 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Actividad Semanal</h3>
              <p className="text-sm text-slate-500 font-medium">Comparativa de consultas vs pacientes</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  itemStyle={{fontWeight: 800}}
                  labelStyle={{fontWeight: 900, marginBottom: '8px', color: '#0f172a'}}
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
                <Area 
                  type="monotone" 
                  dataKey="pacientes" 
                  stroke="#00B4D8" 
                  strokeWidth={4} 
                  fillOpacity={0} 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[48px] border border-white/40 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Distribución por Especialidad</h3>
              <p className="text-sm text-slate-500 font-medium">Volumen de atención por área médica</p>
            </div>
          </div>
          <div className="h-[400px] w-full flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                    animationDuration={2000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-64 space-y-6">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-slate-50 hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                    <span className="text-sm font-black text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{Math.round((item.value / 1200) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
