import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  MessageSquare,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const FUNNEL_BAR_CLASSES = [
  'from-navy-700 to-navy-600',
  'from-slate-600 to-slate-500',
  'from-slate-500 to-slate-400',
  'from-slate-400 to-slate-300',
  'from-navy-600 to-slate-500',
];

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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 p-6">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-semibold">Cargando métricas del CRM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/15 text-gold-500 flex items-center justify-center mb-4 border border-gold-500/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Métricas e Informes</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{error}</p>
      </div>
    );
  }

  const { funnel, kpis, advisor_performance } = data || {};
  const funnelTotal = funnel?.reduce((sum, s) => sum + s.count, 0) || 1;
  const maxFunnelVal = Math.max(...(funnel?.map(s => s.count) || [1]), 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-navy-950 overflow-y-auto transition-colors duration-300">
      {/* Cabecera */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/95 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            <span>Métricas & Rendimiento</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estadísticas generales de retención, efectividad de la IA y desempeño comercial
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Fila 1: KPIs Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center flex-shrink-0 border border-gold-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide block">Leads Totales</span>
              <span className="text-2xl font-black text-gold-500 tabular-nums">{kpis.total_leads}</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-navy-800 text-slate-300 flex items-center justify-center flex-shrink-0 border border-navy-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide block">Citas Activas</span>
              <span className="text-2xl font-black text-gold-500 tabular-nums">{kpis.active_appointments}</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gold-500/15 text-gold-500 flex items-center justify-center flex-shrink-0 border border-gold-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide block">Tasa de Piloto IA</span>
              <span className="text-2xl font-black text-gold-500 tabular-nums">{kpis.messages.ai_ratio_pct}%</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-navy-800 text-slate-300 flex items-center justify-center flex-shrink-0 border border-navy-700">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide block">Total Mensajes</span>
              <span className="text-2xl font-black text-gold-500 tabular-nums">{kpis.messages.total}</span>
            </div>
          </div>
        </div>

        {/* Fila 2: Embudo y Efectividad IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Embudo de Conversión (Leads por Stage) */}
          <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Embudo del Proceso Comercial</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribución actual de prospectos en el pipeline</p>
              </div>
              <TrendingUp className="w-4 h-4 text-gold-500" />
            </div>

            <div className="space-y-5 flex-1 flex flex-col justify-around">
              {funnel.map((stage, idx) => {
                const barPct = (stage.count / maxFunnelVal) * 100;
                const sharePct = ((stage.count / funnelTotal) * 100).toFixed(1);

                return (
                  <div key={stage.stage_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 gap-2">
                      <span className="truncate">{idx + 1}. {stage.stage_name}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gold-500 font-bold tabular-nums">{sharePct}%</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium tabular-nums">{stage.count} leads</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-navy-800 h-4 rounded-full overflow-hidden border border-slate-200/80 dark:border-navy-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${FUNNEL_BAR_CLASSES[idx % FUNNEL_BAR_CLASSES.length]}`}
                        style={{ width: `${Math.max(barPct, stage.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Efectividad IA (Distribución de Mensajes) */}
          <div className="p-5 sm:p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl flex flex-col shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Distribución de Mensajes</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Comparativa de participación del Piloto IA</p>

            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              {/* Círculo Gráfico SVG */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-navy-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-gold-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${kpis.messages.ai_ratio_pct}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-gold-500 tabular-nums">{kpis.messages.ai_ratio_pct}%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Por la IA</span>
                </div>
              </div>

              {/* Leyenda */}
              <div className="w-full grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/30">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold mb-0.5">Piloto IA</span>
                  <span className="text-sm font-extrabold text-gold-500 tabular-nums">{kpis.messages.ai} msgs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-bold mb-0.5">Asesores Humanos</span>
                  <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300 tabular-nums">{kpis.messages.human} msgs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila 3: Tabla de Rendimiento de Asesores */}
        <div className="p-5 sm:p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Rendimiento Comercial del Equipo</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leads y citas concretadas por cada asesor</p>
            </div>
            <UserCheck className="w-4 h-4 text-gold-500" />
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-700 text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-2">Asesor</th>
                  <th className="py-3 px-2">Rol</th>
                  <th className="py-3 px-2 text-center">Leads Asignados</th>
                  <th className="py-3 px-2 text-center">Mensajes Enviados</th>
                  <th className="py-3 px-2 text-center">Citas Agendadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {advisor_performance.map((adv) => (
                  <tr key={adv.advisor_id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="py-3 px-2 text-slate-800 dark:text-white font-bold">{adv.full_name}</td>
                    <td className="py-3 px-2 capitalize text-slate-600 dark:text-slate-400">{adv.role === 'admin' ? 'Administrador' : 'Asesor'}</td>
                    <td className="py-3 px-2 text-center font-bold text-gold-500 tabular-nums">{adv.assigned_leads}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{adv.sent_messages}</td>
                    <td className="py-3 px-2 text-center font-bold text-gold-500 tabular-nums">{adv.booked_appointments}</td>
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
