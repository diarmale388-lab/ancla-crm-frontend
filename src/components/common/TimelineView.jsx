import React from 'react';
import { Clock, Phone, FileText, CheckCircle2, MessageSquare, Sparkles, User, Calendar } from 'lucide-react';

export default function TimelineView({ activities = [], bitacoraNotes = [] }) {
  // Combinar actividades del sistema y notas de bitácora en una sola línea de tiempo ordenada por fecha descendente
  const combinedTimeline = [
    ...activities.map(a => ({
      id: `act-${a.id}`,
      type: a.activity_type || 'system',
      title: a.activity_type === 'internal_note' ? 'Nota Interna' : a.activity_type === 'stage_change' ? 'Cambio de Etapa' : 'Actividad CRM',
      description: a.description,
      author: a.user_name || 'Sistema',
      date: new Date(a.created_at),
      icon: a.activity_type === 'internal_note' ? '📝' : a.activity_type === 'stage_change' ? '🔄' : '⚡',
      badgeColor: 'badge-pending'
    })),
    ...bitacoraNotes.map(b => ({
      id: `bit-${b.id}`,
      type: b.note_type || 'LLAMADA',
      title: `Bitácora Pro 360°: ${b.note_type || 'Atención Comercial'}`,
      description: b.content,
      author: b.created_by_name || 'Asesor Comercial',
      date: new Date(b.created_at),
      icon: b.note_type === 'LLAMADA' ? '📞' : b.note_type === 'COTIZACION' ? '📄' : '🏢',
      badgeColor: 'badge-success'
    }))
  ].sort((a, b) => b.date - a.date);

  if (combinedTimeline.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-2xl">
        <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No hay eventos registrados en la línea de tiempo.</p>
        <p className="text-[11px] text-slate-400 mt-1">Las llamadas, notas comerciales y cotizaciones aparecerán ordenadas cronológicamente aquí.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-3 pl-4 space-y-4 py-2">
      {combinedTimeline.map((event) => (
        <div key={event.id} className="relative group animate-fade-in">
          {/* Icono flotante en la línea */}
          <div className="absolute -left-[25px] top-1 w-6 h-6 rounded-full bg-white dark:bg-dark-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] shadow-sm">
            {event.icon}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
                <span>{event.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">por {event.author}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {event.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
