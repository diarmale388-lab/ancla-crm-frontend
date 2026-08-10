import React, { useState, useEffect, useMemo } from 'react';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import ChinaSpecSheetModal from '../showroom/ChinaSpecSheetModal';
import { 
  MessageCircle, User, Phone, ArrowRight, Calendar, Bot, 
  Search, Filter, DollarSign, Building, MapPin, TrendingUp, 
  Clock, Sparkles, X, Plus, Edit3, Check, ExternalLink, 
  AlertCircle, RefreshCw, CheckCircle2, ChevronRight, ShieldAlert, Award, Factory
} from 'lucide-react';

export const KanbanBoard = () => {
  const { stages, leads, fetchStages, fetchLeads, moveLead, updateLeadDetails, loading, error: storeError } = useKanbanStore();
  const { appointments, fetchAppointments } = useCalendarStore();
  const { fetchMessages, setActiveTab, toggleChatbot } = useChatStore();

  // Estados de Filtros en Vivo
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAdvisor, setFilterAdvisor] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterLotStatus, setFilterLotStatus] = useState('ALL');

  // Modales
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null);
  const [selectedLeadForAppointment, setSelectedLeadForAppointment] = useState(null);
  const [selectedLeadForChinaSpecs, setSelectedLeadForChinaSpecs] = useState(null);

  // Notas Internas en Modal 360°
  const [internalNotes, setInternalNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Estado Form Cita Rápida
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentAdvisorId, setAppointmentAdvisorId] = useState('');
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState('');
  const [appointmentError, setAppointmentError] = useState('');

  // Notificaciones de Error / Transición
  const [toastError, setToastError] = useState(null);

  // Edición rápida en Ficha 360°
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    fetchStages();
    fetchLeads();
    fetchAppointments();
  }, []);

  // Cargar notas al abrir modal 360°
  useEffect(() => {
    if (selectedLeadForModal) {
      loadNotes(selectedLeadForModal.id);
      setTempBudget(selectedLeadForModal.estimated_budget || '');
    } else {
      setInternalNotes([]);
      setNewNoteText('');
      setEditingBudget(false);
    }
  }, [selectedLeadForModal]);

  const loadNotes = async (contactId) => {
    setLoadingNotes(true);
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${contactId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        const notes = data.filter(m => m.channel === 'system');
        setInternalNotes(notes);
      }
    } catch (err) {
      console.error("Error al cargar notas:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async (e) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim() || !selectedLeadForModal) return;

    setSavingNote(true);
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${selectedLeadForModal.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newNoteText.trim(),
          channel: 'system'
        })
      });
      if (response.ok) {
        setNewNoteText('');
        await loadNotes(selectedLeadForModal.id);
        fetchLeads();
      }
    } catch (err) {
      console.error("Error al guardar nota:", err);
    } finally {
      setSavingNote(false);
    }
  };

  // Guardar Cita Rápida desde Modal
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedLeadForAppointment || !appointmentDateTime) return;
    setBookingAppointment(true);
    setAppointmentError('');
    setAppointmentSuccess('');

    const token = useAuthStore.getState().token;
    const currentUserId = useAuthStore.getState().user?.id || 1;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/appointments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_id: selectedLeadForAppointment.id,
          user_id: appointmentAdvisorId ? parseInt(appointmentAdvisorId, 10) : currentUserId,
          datetime: new Date(appointmentDateTime).toISOString(),
          status: 'CONFIRMED',
          notes: appointmentNotes || 'Cita comercial agendada desde el Kanban 360°'
        })
      });

      if (res.ok) {
        setAppointmentSuccess('¡Cita agendada exitosamente en el calendario!');
        await fetchAppointments();
        await fetchLeads();
        setTimeout(() => {
          setSelectedLeadForAppointment(null);
          setAppointmentDateTime('');
          setAppointmentNotes('');
          setAppointmentSuccess('');
        }, 1500);
      } else {
        const data = await res.json();
        setAppointmentError(data.detail || 'Error al agendar la cita.');
      }
    } catch (err) {
      setAppointmentError('Error de red al agendar la cita.');
    } finally {
      setBookingAppointment(false);
    }
  };

  // Manejador Drag & Drop
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.currentTarget.classList.add('opacity-40', 'scale-95', 'rotate-1');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-40', 'scale-95', 'rotate-1');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData('text/plain');
    if (leadIdStr) {
      const leadId = parseInt(leadIdStr, 10);
      try {
        await moveLead(leadId, targetStageId);
      } catch (err) {
        setToastError(err.message || 'No se pudo mover el lead');
        setTimeout(() => setToastError(null), 4500);
      }
    }
  };

  // Lista de asesores únicos para el filtro
  const uniqueAdvisors = useMemo(() => {
    const advisors = new Map();
    leads.forEach(l => {
      if (l.assigned_user_id && l.assigned_user_name) {
        advisors.set(l.assigned_user_id, l.assigned_user_name);
      }
    });
    return Array.from(advisors.entries());
  }, [leads]);

  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [filterSpecificDate, setFilterSpecificDate] = useState('');

  // Filtrado de Leads en Tiempo Real
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Búsqueda por Texto (Nombre, Apellido, Teléfono, Ciudad)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${l.first_name || ''} ${l.last_name || ''}`.toLowerCase();
        const phone = (l.phone || '').toLowerCase();
        const city = (l.lot_city || '').toLowerCase();
        if (!fullName.includes(q) && !phone.includes(q) && !city.includes(q)) {
          return false;
        }
      }

      // Filtro Asesor
      if (filterAdvisor !== 'ALL') {
        if (filterAdvisor === 'UNASSIGNED') {
          if (l.assigned_user_id) return false;
        } else if (l.assigned_user_id !== parseInt(filterAdvisor, 10)) {
          return false;
        }
      }

      // Filtro Producto
      if (filterProduct !== 'ALL' && l.interest_product !== filterProduct) {
        return false;
      }

      // Filtro Estado Lote
      if (filterLotStatus !== 'ALL' && l.lot_status !== filterLotStatus) {
        return false;
      }

      // Filtro Día Específico
      if (filterSpecificDate && l.created_at) {
        const leadDateStr = new Date(l.created_at).toISOString().split('T')[0];
        if (leadDateStr !== filterSpecificDate) return false;
      }

      // Filtro Rango de Fechas
      if (filterDateRange !== 'ALL' && l.created_at) {
        const leadDate = new Date(l.created_at);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filterDateRange === 'TODAY') {
          if (leadDate < startOfToday) return false;
        } else if (filterDateRange === 'THIS_WEEK') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          if (leadDate < startOfWeek) return false;
        } else if (filterDateRange === 'THIS_MONTH') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (leadDate < startOfMonth) return false;
        } else if (filterDateRange === 'LAST_30_DAYS') {
          const last30Days = new Date(now);
          last30Days.setDate(now.getDate() - 30);
          if (leadDate < last30Days) return false;
        }
      }

      return true;
    });
  }, [leads, searchQuery, filterAdvisor, filterProduct, filterLotStatus, filterDateRange, filterSpecificDate]);

  // Cálculo de KPIs Globales en Tiempo Real
  const kpis = useMemo(() => {
    const totalActive = filteredLeads.length;

    const projectedValue = filteredLeads.reduce((acc, l) => acc + (l.estimated_budget || 0), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const confirmedApptsThisMonth = appointments.filter(a => {
      if (a.status !== 'CONFIRMED') return false;
      const apptDate = new Date(a.datetime);
      return apptDate.getMonth() === currentMonth && apptDate.getFullYear() === currentYear;
    }).length;

    // Buscar etapa de "Ganado"
    const ganadoStage = stages.find(s => s.name === 'Ganado' || s.name === 'Ganado / Cerrado');
    const wonLeads = ganadoStage ? filteredLeads.filter(l => l.pipeline_stage_id === ganadoStage.id).length : 0;
    const conversionRate = totalActive > 0 ? ((wonLeads / totalActive) * 100).toFixed(1) : '0.0';

    return {
      totalActive,
      projectedValue,
      confirmedApptsThisMonth,
      conversionRate,
      wonLeads
    };
  }, [filteredLeads, appointments, stages]);

  // Función Formateadora de Moneda COP (Formato Colombiano)
  const formatCOP = (amount) => {
    if (!amount || isNaN(amount)) return '$ 0 COP';
    if (amount >= 1000000000) {
      // Formato Colombiano: 113.760 Millones ($ 113.760M COP)
      const millones = Math.round(amount / 1000000);
      return `$ ${millones.toLocaleString('es-CO')}M COP`;
    }
    if (amount >= 1000000) {
      const millones = (amount / 1000000).toFixed(0);
      return `$ ${millones}M COP`;
    }
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  // Semáforo de Salud del Lead (Verde <24h, Amarillo 24h-96h, Rojo >96h)
  const getLeadHealth = (lead) => {
    const refTime = lead.last_message_time || lead.updated_at || lead.created_at;
    if (!refTime) return { color: 'bg-emerald-500', text: '< 24h', level: 'green', label: 'Al día' };
    
    const diffHours = (new Date() - new Date(refTime)) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return { color: 'bg-emerald-500 shadow-emerald-500/50', text: '< 24h', level: 'green', label: 'Saludable (<24h)' };
    } else if (diffHours <= 96) {
      return { color: 'bg-amber-500 shadow-amber-500/50', text: `${Math.floor(diffHours / 24)}d`, level: 'yellow', label: 'Atención (1-4d)' };
    } else {
      return { color: 'bg-rose-500 shadow-rose-500/50 animate-pulse', text: `> 4d`, level: 'red', label: 'Estancado (>4d)' };
    }
  };

  // Obtener leads por etapa
  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(l => l.pipeline_stage_id === stageId);
  };

  if (loading && stages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex items-center space-x-3 bg-white dark:bg-dark-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl glass">
          <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Cargando Super-Pipeline Comercial 360°...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-dark-950 overflow-hidden transition-colors duration-300 relative select-none">
      
      {/* Toast de Alerta / Error de Transición */}
      {toastError && (
        <div className="absolute top-4 right-6 z-50 animate-bounce">
          <div className="bg-rose-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-rose-400">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{toastError}</span>
            <button onClick={() => setToastError(null)} className="ml-2 text-rose-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ENCABEZADO Y KPIS EN TIEMPO REAL */}
      <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md glass flex flex-col space-y-4 flex-shrink-0">
        
        {/* Fila Titulo + Botón Showroom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-dark-950 font-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <span>Pipeline Comercial 360°</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                  Liliana León CRM
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Gestión estratégica de prospectos VIP, valor negociado y semáforo comercial en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => { fetchLeads(); fetchStages(); fetchAppointments(); }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
              title="Refrescar datos del Pipeline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('showroom')}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/15 active:scale-95 transition-all cursor-pointer"
            >
              <span>🏠</span>
              <span>Showroom Armenia</span>
            </button>
          </div>
        </div>

        {/* REQUERIMIENTO 1: BARRA DE KPIS EN TIEMPO REAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* KPI 1: Leads Activos */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Leads en Embudo</span>
              <span className="text-base font-black text-slate-900 dark:text-white leading-tight block">{kpis.totalActive} prospectos</span>
            </div>
          </div>

          {/* KPI 2: Valor Proyectado del Embudo ($COP) */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Valor Proyectado ($COP)</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight block">{formatCOP(kpis.projectedValue)}</span>
            </div>
          </div>

          {/* KPI 3: Citas Confirmadas del Mes */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Citas del Mes</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400 leading-tight block">{kpis.confirmedApptsThisMonth} agendadas</span>
            </div>
          </div>

          {/* KPI 4: Tasa de Conversión (%) */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Tasa de Conversión</span>
              <span className="text-base font-black text-purple-600 dark:text-purple-400 leading-tight block">{kpis.conversionRate}% ({kpis.wonLeads} ganados)</span>
            </div>
          </div>

        </div>

        {/* REQUERIMIENTO 2: BARRA DE FILTROS AVANZADOS EN VIVO */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 pt-1">
          
          {/* Búsqueda por Nombre / Teléfono */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre, Teléfono o Ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Filtro Asesor */}
            <select
              value={filterAdvisor}
              onChange={(e) => setFilterAdvisor(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="ALL">👤 Todos los Asesores</option>
              {uniqueAdvisors.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            {/* Filtro Tipo de Proyecto */}
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="ALL">🏗️ Todos los Proyectos</option>
              <option value="Flex Home">Flex Home</option>
              <option value="Living">Living</option>
              <option value="Llave en Mano">Llave en Mano</option>
              <option value="Glamping">Glamping</option>
            </select>

            {/* Filtro Estado de Lote */}
            <select
              value={filterLotStatus}
              onChange={(e) => setFilterLotStatus(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="ALL">🗺️ Estado de Lote</option>
              <option value="Lote Propio">Lote Propio</option>
              <option value="Buscando Lote">Buscando Lote</option>
            </select>

            {/* Filtro Rango de Fechas */}
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="ALL">📅 Rango de Fechas</option>
              <option value="TODAY">📅 Registrados Hoy</option>
              <option value="THIS_WEEK">📅 Esta Semana</option>
              <option value="THIS_MONTH">📅 Este Mes</option>
              <option value="LAST_30_DAYS">📅 Últimos 30 Días</option>
            </select>

            {/* Selector de Día Específico */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-slate-400">Día:</span>
              <input
                type="date"
                value={filterSpecificDate}
                onChange={(e) => setFilterSpecificDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Botón Reset Filtros */}
            {(searchQuery || filterAdvisor !== 'ALL' || filterProduct !== 'ALL' || filterLotStatus !== 'ALL' || filterDateRange !== 'ALL' || filterSpecificDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterAdvisor('ALL');
                  setFilterProduct('ALL');
                  setFilterLotStatus('ALL');
                  setFilterDateRange('ALL');
                  setFilterSpecificDate('');
                }}
                className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-2 rounded-xl hover:bg-rose-500/20 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar Filtros</span>
              </button>
            )}

            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-1 hidden lg:inline">
              Showing {filteredLeads.length} / {leads.length} leads
            </span>
          </div>

        </div>

      </div>

      {/* TABLERO KANBAN DE 6 COLUMNAS CON DRAG & DROP Y PERSISTENCIA NEON DB */}
      <div className="flex-1 flex overflow-x-auto p-5 space-x-4 items-start">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const stageTotalValue = stageLeads.reduce((acc, l) => acc + (l.estimated_budget || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-80 flex-shrink-0 bg-slate-200/60 dark:bg-slate-900/50 rounded-3xl p-3.5 flex flex-col max-h-[calc(100vh-230px)] border border-slate-300/50 dark:border-white/5 glass-card transition-colors"
            >
              {/* Header de Columna */}
              <div className="flex items-center justify-between pb-3 px-1.5 border-b border-slate-300/40 dark:border-white/5 mb-3">
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider truncate flex items-center space-x-1.5">
                    <span>{stage.name}</span>
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {formatCOP(stageTotalValue)}
                  </p>
                </div>
                
                <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shadow-xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lista de Tarjetas Arrastrables */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[160px] custom-scrollbar">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-300/70 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Arrastra prospectos aquí</p>
                    <span className="text-[10px] text-slate-400/60 dark:text-slate-600 mt-1">Columna vacía</span>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const health = getLeadHealth(lead);
                    const isInstagram = lead.source && lead.source.toLowerCase().includes('instagram');
                    const fullName = lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.phone;
                    const appointment = appointments.find((a) => a.contact_id === lead.id && a.status === 'CONFIRMED');

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLeadForModal(lead)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group space-y-3 relative overflow-hidden"
                      >
                        {/* Indicador Lateral de Salud del Lead (Semáforo) */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${health.color}`} title={`Estado: ${health.label}`} />

                        {/* Fila Superior: Nombre, Salud y Canal */}
                        <div className="flex items-start justify-between pl-1">
                          <div className="min-w-0 pr-2">
                            <h4 
                              onClick={() => setSelectedLeadForModal(lead)}
                              className="text-xs font-black text-slate-900 dark:text-white leading-snug truncate hover:text-emerald-500 cursor-pointer"
                            >
                              {fullName}
                            </h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate mt-0.5">
                              📞 {lead.phone}
                            </span>
                          </div>

                          {/* Badge Canal + Semáforo Dot */}
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {/* Semáforo Dot */}
                            <span className={`w-2.5 h-2.5 rounded-full ${health.color}`} title={health.label} />

                            {/* Canal Badge */}
                            <span className={`p-1 rounded-lg text-white ${
                              isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-emerald-500'
                            }`}>
                              {isInstagram ? (
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                              ) : (
                                <MessageCircle className="w-3 h-3" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* REQUERIMIENTO 3: BADGES VISUALES DE COLORES (Ciudad, Proyecto, Presupuesto, Campaña y VIP) */}
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          
                          {/* Badge Lead VIP <5 min (Atender urgente en < 5 minutos) */}
                          {lead.qualification_notes && lead.qualification_notes.includes('[LEAD_VIP_5MIN]') && (
                            <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white border border-rose-400 flex items-center space-x-1 animate-pulse shadow-md" title="Atender en menos de 5 minutos (Quiere ir esta semana y ya tiene lote)">
                              <span>🔥 VIP &lt;5m</span>
                            </span>
                          )}

                          {/* Badge Campaña Local vs Nacional */}
                          {lead.source && (lead.source.includes('Nacional') || lead.source.includes('Virtual')) ? (
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              💻 Cita Virtual
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                              🏡 Showroom Armenia
                            </span>
                          )}

                          {/* Badge Ciudad */}
                          <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center space-x-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{lead.lot_city || 'Armenia'}</span>
                          </span>

                          {/* Badge Proyecto */}
                          <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center space-x-0.5">
                            <Building className="w-2.5 h-2.5" />
                            <span>{lead.interest_product || 'Flex Home'}</span>
                          </span>

                          {/* Badge Presupuesto */}
                          <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center space-x-0.5">
                            <DollarSign className="w-2.5 h-2.5" />
                            <span>{formatCOP(lead.estimated_budget)}</span>
                          </span>

                          {/* Badge Estado Lote */}
                          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {lead.lot_status || 'Lote Propio'}
                          </span>

                        </div>

                        {/* Snippet de Último Mensaje */}
                        {lead.last_message_content && (
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-white/5 text-[10px] text-slate-600 dark:text-slate-400 italic line-clamp-2" title={lead.last_message_content}>
                            "{lead.last_message_content}"
                          </div>
                        )}

                        {/* Badge Cita Confirmada */}
                        {appointment && (
                          <div className="flex items-center space-x-1.5 text-[9.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2.5 py-1.5 rounded-xl border border-amber-500/30">
                            <Calendar className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="truncate">
                              Cita: {new Date(appointment.datetime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        {/* REQUERIMIENTO 3: BOTONES TÁCTILES DE ACCIÓN RÁPIDA */}
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-1 flex-wrap">
                          
                          {/* Botón 1: Abrir Chat WhatsApp */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchMessages(lead.id);
                              setActiveTab('chats');
                            }}
                            className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                            title="Abrir Chat WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Botón 2: Agendar Cita */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadForAppointment(lead);
                            }}
                            className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                            title="Agendar Cita"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Cita</span>
                          </button>

                          {/* Botón 3: Ficha China Spec Sheet */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadForChinaSpecs(lead);
                            }}
                            className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                            title="Ver Ficha Técnica de Exportación China"
                          >
                            <Factory className="w-3 h-3" />
                            <span>China</span>
                          </button>

                          {/* Botón 4: Ver Ficha 360° */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadForModal(lead);
                            }}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center cursor-pointer"
                            title="Ver Ficha Comercial 360°"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL FICHA COMERCIAL 360° COMPLETA */}
      {selectedLeadForModal && (
        <LeadFichaModal360
          contact={selectedLeadForModal}
          onClose={() => setSelectedLeadForModal(null)}
          onRefresh={fetchLeads}
        />
      )}

      {/* MODAL FICHA TÉCNICA EXPORTACIÓN CHINA BILINGÜE */}
      {selectedLeadForChinaSpecs && (
        <ChinaSpecSheetModal
          isOpen={!!selectedLeadForChinaSpecs}
          contact={selectedLeadForChinaSpecs}
          onClose={() => setSelectedLeadForChinaSpecs(null)}
        />
      )}

      {/* MODAL RÁPIDO DE AGENDAR CITA */}
      {selectedLeadForAppointment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Agendar Cita Comercial
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLeadForAppointment(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cliente: <strong className="text-slate-800 dark:text-white">{selectedLeadForAppointment.first_name} {selectedLeadForAppointment.last_name || ''}</strong> ({selectedLeadForAppointment.phone})
            </p>

            {appointmentError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{appointmentError}</span>
              </div>
            )}

            {appointmentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{appointmentSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1.5">
                  Fecha y Hora de la Cita
                </label>
                <input
                  type="datetime-local"
                  value={appointmentDateTime}
                  onChange={(e) => setAppointmentDateTime(e.target.value)}
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1.5">
                  Asesor Responsable
                </label>
                <select
                  value={appointmentAdvisorId}
                  onChange={(e) => setAppointmentAdvisorId(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Mi Usuario Actual</option>
                  {uniqueAdvisors.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1.5">
                  Notas de la Reunión
                </label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Ej. Presentación catálogo Flex Home en Showroom..."
                  rows="2"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={bookingAppointment || !appointmentDateTime}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-dark-950 font-black py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {bookingAppointment ? (
                    <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirmar Cita</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLeadForAppointment(null)}
                  className="py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
