import React, { useState, useEffect, useMemo } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import {
  Users, AlertTriangle, CalendarClock, Wallet, Search, ChevronDown,
  Download, RefreshCw, MessageCircle, Mail, MapPin, DollarSign,
  ClipboardCheck, X, Loader2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Helpers de formato (Bogotá / COP)
// ─────────────────────────────────────────────────────────────
const todayBogotaISO = () => {
  const now = new Date();
  const bogota = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const y = bogota.getFullYear();
  const m = String(bogota.getMonth() + 1).padStart(2, '0');
  const d = String(bogota.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysISO = (isoDate, days) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const formatDateBogota = (dateStr, withTime = false) => {
  if (!dateStr) return null;
  const raw = String(dateStr);

  // Fecha pura sin hora (ej. next_action_date "2026-08-25"): formatear directo,
  // sin pasar por Date/timeZone para evitar el corrimiento de -5h a medianoche UTC.
  const plainDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (plainDateMatch) {
    const [, y, m, d] = plainDateMatch;
    return `${d}/${m}/${y}`;
  }

  let isoStr = raw;
  if (!isoStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoStr)) {
    isoStr += 'Z';
  }
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return raw;
  const opts = withTime
    ? { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    : { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' };
  return d.toLocaleString('es-CO', opts);
};

const formatCOP = (val) => {
  if (!val || isNaN(val) || val <= 0) return '—';
  return `$ ${Math.round(val).toLocaleString('es-CO')}`;
};

const getInitials = (contact) => {
  const f = (contact.first_name || '').trim();
  const l = (contact.last_name || '').trim();
  if (f || l) return `${f[0] || ''}${l[0] || ''}`.toUpperCase() || '?';
  return (contact.phone || '?').slice(-2);
};

const cleanPhoneForWhatsapp = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
};

// Clasifica el interés en 1 de los 3 buckets comerciales del negocio
const classifyProject = (interestProduct) => {
  const s = (interestProduct || '').toLowerCase();
  if (s.includes('flex home') || s.includes('flex_home')) return 'Flex Home';
  if (s.includes('cápsula') || s.includes('capsula') || s.includes('glamping')) return 'Cápsulas Living';
  return 'Por Definir';
};

const PROJECT_BADGE_STYLES = {
  'Flex Home': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
  'Cápsulas Living': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30',
  'Por Definir': 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/30'
};

// Determina la urgencia visual del próximo seguimiento pactado (next_action_date es YYYY-MM-DD)
const getUrgency = (nextActionDate, today) => {
  if (!nextActionDate) return 'SIN_FECHA';
  const clean = String(nextActionDate).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return 'SIN_FECHA';
  if (clean < today) return 'VENCIDO';
  if (clean === today) return 'HOY';
  return 'FUTURO';
};

const URGENCY_STYLES = {
  VENCIDO: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30',
  HOY: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  FUTURO: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  SIN_FECHA: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30'
};

const URGENCY_DOT = {
  VENCIDO: 'bg-red-500',
  HOY: 'bg-amber-500',
  FUTURO: 'bg-emerald-500',
  SIN_FECHA: 'bg-slate-400'
};

const URGENCY_LABEL = {
  VENCIDO: 'Vencido',
  HOY: 'Hoy',
  FUTURO: 'Programado',
  SIN_FECHA: 'Sin fecha'
};

export default function ExecutiveFollowUpView() {
  const contacts = useChatStore(state => state.contacts);
  const fetchContacts = useChatStore(state => state.fetchContacts);
  const agents = useChatStore(state => state.agents);
  const fetchAgents = useChatStore(state => state.fetchAgents);
  const loading = useChatStore(state => state.loading);
  const stages = useKanbanStore(state => state.stages);
  const fetchStages = useKanbanStore(state => state.fetchStages);

  const [search, setSearch] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState('TODOS');
  const [projectFilter, setProjectFilter] = useState('TODOS');
  const [urgencyFilter, setUrgencyFilter] = useState('TODOS');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchAgents();
    fetchStages();
  }, []);

  const today = useMemo(() => todayBogotaISO(), []);
  const weekLimit = useMemo(() => addDaysISO(today, 7), [today]);

  const stageMap = useMemo(() => {
    const map = {};
    (stages || []).forEach(s => { map[s.id] = s.name; });
    return map;
  }, [stages]);

  // ── Enriquecimiento de cada fila con campos derivados ──
  const enrichedRows = useMemo(() => {
    return (contacts || []).map(c => {
      const note = c.last_bitacora_note || null;
      const nextActionDate = note?.next_action_date || null;
      const urgency = getUrgency(nextActionDate, today);
      const quoted = c.quoted_value && c.quoted_value > 0 ? c.quoted_value : (c.estimated_budget || 0);
      return {
        ...c,
        __urgency: urgency,
        __nextActionDate: nextActionDate,
        __quotedEffective: quoted,
        __project: classifyProject(c.interest_product),
        __stageName: stageMap[c.pipeline_stage_id] || c.advisor_status || 'Sin Etapa',
        __observations: note?.content || c.qualification_notes || '',
        __lastContactDate: c.last_message_time || c.created_at,
        __lastContactChannel: c.last_message_sender ? (c.last_message_sender === 'contact' || c.last_message_sender === 'CONTACT' ? 'Cliente' : 'Asesor/IA') : null
      };
    });
  }, [contacts, today, stageMap]);

  // ── KPIs Gerenciales ──
  const kpis = useMemo(() => {
    let vencidos = 0, hoy = 0, pipelineTotal = 0;
    enrichedRows.forEach(r => {
      if (r.__urgency === 'VENCIDO') vencidos++;
      if (r.__urgency === 'HOY') hoy++;
      pipelineTotal += r.__quotedEffective || 0;
    });
    return {
      total: enrichedRows.length,
      vencidos,
      hoy,
      pipelineTotal
    };
  }, [enrichedRows]);

  // ── Filtros combinados ──
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrichedRows.filter(r => {
      if (term) {
        const haystack = `${r.first_name || ''} ${r.last_name || ''} ${r.phone || ''} ${r.email || ''} ${r.lot_city || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (advisorFilter === 'SIN_ASIGNAR' && r.assigned_user_id) return false;
      if (advisorFilter !== 'TODOS' && advisorFilter !== 'SIN_ASIGNAR' && String(r.assigned_user_id) !== String(advisorFilter)) return false;
      if (projectFilter !== 'TODOS' && r.__project !== projectFilter) return false;
      if (urgencyFilter === 'VENCIDOS' && r.__urgency !== 'VENCIDO') return false;
      if (urgencyFilter === 'HOY' && r.__urgency !== 'HOY') return false;
      if (urgencyFilter === 'ESTA_SEMANA' && !(r.__nextActionDate && r.__nextActionDate >= today && r.__nextActionDate <= weekLimit)) return false;
      if (urgencyFilter === 'SIN_PROXIMO_PASO' && r.__urgency !== 'SIN_FECHA') return false;
      return true;
    });
  }, [enrichedRows, search, advisorFilter, projectFilter, urgencyFilter, today, weekLimit]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchContacts();
    setIsRefreshing(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Fecha Ingreso', 'Nombre', 'Telefono', 'Correo', 'Ciudad', 'Proyecto',
      'Ultimo Contacto', 'Proximo Seguimiento', 'Valor Propuesta (COP)', 'Estado', 'Observaciones', 'Asesor'
    ];
    const escapeCsv = (val) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = filteredRows.map(r => [
      formatDateBogota(r.created_at) || '',
      `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      r.phone || '',
      r.email || '',
      r.lot_city || '',
      r.__project,
      formatDateBogota(r.__lastContactDate) || '',
      r.__nextActionDate ? formatDateBogota(r.__nextActionDate) : 'Sin fecha',
      r.__quotedEffective || 0,
      r.__stageName,
      (r.__observations || '').replace(/\n/g, ' '),
      r.assigned_user_name || 'Sin Asignar'
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seguimiento_comercial_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-slate-50 dark:bg-navy-950 transition-colors duration-300 font-sans">
      {/* ═══ Cabecera ═══ */}
      <div className="shrink-0 px-4 sm:px-6 pt-5 pb-3 border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Seguimiento Comercial
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Control Gerencial de Prospectos & Auditoría de Asesores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 shadow-md shadow-gold-500/20 transition-all active:scale-[0.97] cursor-pointer"
              title="Exportar a Excel (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* ═══ Cinta de KPIs Gerenciales ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <KpiCard
            icon={<Users className="w-4 h-4" />}
            label="Total Prospectos"
            value={kpis.total}
            accent="text-navy-700 dark:text-slate-100"
            bg="bg-slate-100 dark:bg-navy-800"
          />
          <KpiCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Seguimientos Vencidos"
            value={kpis.vencidos}
            accent="text-red-600 dark:text-red-400"
            bg="bg-red-500/10 border border-red-500/20"
            pulse={kpis.vencidos > 0}
          />
          <KpiCard
            icon={<CalendarClock className="w-4 h-4" />}
            label="Compromisos Hoy"
            value={kpis.hoy}
            accent="text-amber-600 dark:text-amber-400"
            bg="bg-amber-500/10 border border-amber-500/20"
          />
          <KpiCard
            icon={<Wallet className="w-4 h-4" />}
            label="Pipeline Total Cotizado"
            value={`${formatCOP(kpis.pipelineTotal)} COP`}
            accent="text-gold-600 dark:text-gold-400"
            bg="bg-gold-500/10 border border-gold-500/20"
            isMoney
          />
        </div>

        {/* ═══ Barra de Filtros y Búsqueda ═══ */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono, correo o ciudad..."
              className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-navy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
            />
          </div>

          <SelectFilter
            value={advisorFilter}
            onChange={setAdvisorFilter}
            options={[
              { value: 'TODOS', label: '👔 Todos los Asesores' },
              ...(agents || []).map(a => ({ value: String(a.id), label: a.full_name })),
              { value: 'SIN_ASIGNAR', label: 'Sin Asignar' }
            ]}
          />

          <SelectFilter
            value={projectFilter}
            onChange={setProjectFilter}
            options={[
              { value: 'TODOS', label: '🏡 Todos los Proyectos' },
              { value: 'Flex Home', label: 'Flex Home' },
              { value: 'Cápsulas Living', label: 'Cápsulas Living' },
              { value: 'Por Definir', label: 'Por Definir' }
            ]}
          />

          <SelectFilter
            value={urgencyFilter}
            onChange={setUrgencyFilter}
            options={[
              { value: 'TODOS', label: '🚨 Toda Urgencia' },
              { value: 'VENCIDOS', label: 'Vencidos' },
              { value: 'HOY', label: 'Para Hoy' },
              { value: 'ESTA_SEMANA', label: 'Esta Semana' },
              { value: 'SIN_PROXIMO_PASO', label: 'Sin Próximo Paso' }
            ]}
          />

          {(search || advisorFilter !== 'TODOS' || projectFilter !== 'TODOS' || urgencyFilter !== 'TODOS') && (
            <button
              onClick={() => { setSearch(''); setAdvisorFilter('TODOS'); setProjectFilter('TODOS'); setUrgencyFilter('TODOS'); }}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all cursor-pointer"
            >
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}

          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-auto whitespace-nowrap">
            {filteredRows.length} de {enrichedRows.length} prospectos
          </span>
        </div>
      </div>

      {/* ═══ Tabla de Datos de Alta Densidad ═══ */}
      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
        {loading && enrichedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-bold">Cargando prospectos...</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 p-8 text-center">
            <Users className="w-10 h-10 opacity-40" />
            <span className="text-sm font-bold">No hay prospectos que coincidan con estos filtros.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-sans">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 dark:bg-navy-900 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-navy-700">
                <th className="px-3 py-2.5 whitespace-nowrap">Fecha Ingreso</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Cliente</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Teléfono</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Correo</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Ciudad</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Proyecto</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Último Contacto</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Próximo Seguimiento</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Valor Propuesta</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Estado</th>
                <th className="px-3 py-2.5 whitespace-nowrap min-w-[220px]">Observaciones</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Asesor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredRows.map(row => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedLead(row)}
                  className="text-xs text-slate-700 dark:text-slate-200 hover:bg-gold-500/5 dark:hover:bg-navy-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {formatDateBogota(row.created_at) || '—'}
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <div className="w-7 h-7 rounded-full bg-navy-800 dark:bg-navy-700 border border-gold-500/30 text-gold-400 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                        {getInitials(row)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white truncate max-w-[140px]">
                        {`${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Sin Nombre'}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px]">{row.phone}</span>
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsapp(row.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir chat de WhatsApp"
                        className="w-5 h-5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 transition-all"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap max-w-[160px] truncate">
                    {row.email ? (
                      <span className="text-[11px]">{row.email}</span>
                    ) : (
                      <span className="text-[11px] italic text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> No registrado
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {row.lot_city || '—'}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${PROJECT_BADGE_STYLES[row.__project]}`}>
                      {row.__project}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateBogota(row.__lastContactDate) || '—'}
                    {row.__lastContactChannel && (
                      <div className="text-[9.5px] uppercase font-bold text-slate-400 dark:text-slate-500">{row.__lastContactChannel}</div>
                    )}
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${URGENCY_STYLES[row.__urgency]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOT[row.__urgency]}`}></span>
                      {row.__nextActionDate ? formatDateBogota(row.__nextActionDate) : URGENCY_LABEL[row.__urgency]}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                      {row.__quotedEffective > 0 && <DollarSign className="w-3 h-3 text-gold-500 shrink-0" />}
                      {formatCOP(row.__quotedEffective)}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap max-w-[140px] truncate text-[11px] font-semibold">
                    {row.__stageName}
                  </td>

                  <td className="px-3 py-2.5 max-w-[240px]">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {row.__observations ? row.__observations.slice(0, 140) : <span className="italic text-slate-400">Sin observaciones</span>}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      row.assigned_user_id
                        ? 'bg-navy-800/10 dark:bg-navy-700 text-navy-800 dark:text-slate-200 border border-navy-700/20'
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {row.assigned_user_name || 'Sin Asignar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ Ficha 360° al hacer clic en una fila ═══ */}
      {selectedLead && (
        <LeadFichaModal360
          contact={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRefresh={() => fetchContacts()}
        />
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, accent, bg, pulse, isMoney }) {
  return (
    <div className={`rounded-2xl px-3.5 py-3 flex items-center gap-3 ${bg} transition-all`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent} ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {label}
        </p>
        <p className={`font-black leading-tight ${accent} ${isMoney ? 'text-sm sm:text-base' : 'text-lg'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl pl-3 pr-7 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-navy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  );
}
