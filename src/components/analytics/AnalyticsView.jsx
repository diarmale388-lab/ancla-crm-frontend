import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/analytics/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const summary = await res.json();
          setData(summary);
        } else {
          if (res.status === 403) {
            setError("Acceso Restringido: Esta pestaña solo está disponible para usuarios con rol de Administrador.");
          } else {
            setError("Error al cargar los datos de analíticas.");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión al servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 p-6">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-semibold">Cargando métricas del CRM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Métricas e Informes</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{error}</p>
      </div>
    );
  }

  const { funnel, kpis, advisor_performance } = data || {};

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-y-auto transition-colors duration-300">
      {/* Cabecera */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 backdrop-blur-md flex items-center justify-between glass flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <span>Métricas & Rendimiento</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estadísticas generales de retención, efectividad de la IA y desempeño comercial
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Fila 1: KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Leads Totales</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white">{kpis.total_leads}</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Citas Activas</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white">{kpis.active_appointments}</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Tasa de Piloto IA</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white">{kpis.messages.ai_ratio_pct}%</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total Mensajes</span>
              <span className="text-2xl font-black text-slate-850 dark:text-white">{kpis.messages.total}</span>
            </div>
          </div>
        </div>

        {/* Fila 2: Embudo y Efectividad IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Embudo de Conversión (Leads por Stage) */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Embudo del Proceso Comercial</h4>
                <p className="text-[10px] text-slate-400">Distribución actual de prospectos en el pipeline</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col justify-around">
              {funnel.map((stage, idx) => {
                const maxVal = Math.max(...funnel.map(s => s.count), 1);
                const pct = (stage.count / maxVal) * 100;
                
                return (
                  <div key={stage.stage_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{idx + 1}. {stage.stage_name}</span>
                      <span className="font-extrabold">{stage.count} leads</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                          idx === 0 ? 'from-blue-500 to-cyan-400' :
                          idx === 1 ? 'from-indigo-500 to-blue-400' :
                          idx === 2 ? 'from-purple-500 to-indigo-400' :
                          idx === 3 ? 'from-emerald-500 to-teal-400' :
                          'from-emerald-600 to-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efectividad IA (Distribución de Mensajes) */}
          <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl flex flex-col shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Distribución de Mensajes</h4>
            <p className="text-[10px] text-slate-400 mb-6">Comparativa de participación del Piloto IA</p>

            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              {/* Círculo Gráfico SVG */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${kpis.messages.ai_ratio_pct}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{kpis.messages.ai_ratio_pct}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Por la IA</span>
                </div>
              </div>

              {/* Leyenda */}
              <div className="w-full grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 block font-bold">Piloto IA</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.messages.ai} msgs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] text-slate-400 block font-bold">Asesores Humanos</span>
                  <span className="text-sm font-extrabold text-slate-600 dark:text-slate-350">{kpis.messages.human} msgs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 3: Tabla de Rendimiento de Asesores */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Rendimiento Comercial del Equipo</h4>
              <p className="text-[10px] text-slate-400">Leads y citas concretadas por cada asesor</p>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  <th className="py-3 px-2">Asesor</th>
                  <th className="py-3 px-2">Rol</th>
                  <th className="py-3 px-2 text-center">Leads Asignados</th>
                  <th className="py-3 px-2 text-center">Mensajes Enviados</th>
                  <th className="py-3 px-2 text-center">Citas Agendadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02] text-xs font-semibold text-slate-700 dark:text-slate-300">
                {advisor_performance.map((adv) => (
                  <tr key={adv.advisor_id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="py-3 px-2 text-slate-800 dark:text-white font-bold">{adv.full_name}</td>
                    <td className="py-3 px-2 capitalize">{adv.role === 'admin' ? 'Administrador' : 'Asesor'}</td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600 dark:text-sky-400">{adv.assigned_leads}</td>
                    <td className="py-3 px-2 text-center">{adv.sent_messages}</td>
                    <td className="py-3 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">{adv.booked_appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
