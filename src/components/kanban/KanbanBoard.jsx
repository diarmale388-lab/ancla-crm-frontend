import React, { useState, useEffect, useMemo } from 'react';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import ChinaSpecSheetModal from '../showroom/ChinaSpecSheetModal';
import AnclaTechnicalDossier from '../common/AnclaTechnicalDossier';
import { 
  MessageCircle, User, Phone, ArrowRight, Calendar, Bot, 
  Search, Filter, DollarSign, Building, MapPin, TrendingUp, 
  Clock, Sparkles, X, Plus, Edit3, Check, ExternalLink, 
  AlertCircle, RefreshCw, CheckCircle2, ChevronRight, ShieldAlert, 
  Award, Factory, KanbanSquare, List, ArrowUpDown, ChevronDown, 
  ChevronUp, SlidersHorizontal, Flame, AlertTriangle, Eye
} from 'lucide-react';

export const KanbanBoard = () => {
  const { stages, leads, fetchStages, fetchLeads, moveLead, updateLeadDetails, loading, error: storeError } = useKanbanStore();
  const { appointments, fetchAppointments } = useCalendarStore();
  const { fetchMessages, setActiveTab, toggleChatbot } = useChatStore();

  // Selector Dual de Vista: 'kanban' o 'table'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Estados de Filtros en Vivo
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAdvisor, setFilterAdvisor] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterLotStatus, setFilterLotStatus] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('ALL');
  const [filterSpecificDate, setFilterSpecificDate] = useState('');
  const [filterOnlyUrgent, setFilterOnlyUrgent] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Ordenamiento para la Vista Tabla
  const [tableSortColumn, setTableSortColumn] = useState('updated_at');
  const [tableSortDirection, setTableSortDirection] = useState('desc');

  // Modales
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null);
  const [selectedLeadForAppointment, setSelectedLeadForAppointment] = useState(null);
  const [selectedLeadForChinaSpecs, setSelectedLeadForChinaSpecs] = useState(null);
  const [selectedLeadForDossier, setSelectedLeadForDossier] = useState(null);

  // Smart Drag Guards (Transiciones interceptadas)
  const [pendingStageMove, setPendingStageMove] = useState(null);

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
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [activeMobileStageId, setActiveMobileStageId] = useState(null);

  // Edición rápida en Ficha 360°
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    fetchStages();
    fetchLeads();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (stages && stages.length > 0 && !activeMobileStageId) {
      setActiveMobileStageId(stages[0].id);
    }
  }, [stages, activeMobileStageId]);

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

  // Guardar Cita Rápida desde Modal con soporte para Smart Drag Guard
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
        
        // Si venía de un Smart Drag Guard, completar el movimiento de etapa
        if (pendingStageMove && pendingStageMove.leadId === selectedLeadForAppointment.id) {
          await moveLead(pendingStageMove.leadId, pendingStageMove.targetStageId);
          setPendingStageMove(null);
        }
        
        await fetchLeads();
        setTimeout(() => {
          setSelectedLeadForAppointment(null);
          setAppointmentDateTime('');
          setAppointmentNotes('');
          setAppointmentSuccess('');
        }, 1200);
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

  // MÓDULO 1: SEMÁFORO DE SLA & RADAR DE INACTIVIDAD (Con Fallback Seguro a created_at)
  const getLeadSlaStatus = (lead) => {
    // 1. Manejo de Fechas Robusto: last_interaction_at -> last_message_at -> updated_at -> created_at
    const dateStr = lead.last_interaction_at || lead.last_message_at || lead.updated_at || lead.created_at;
    if (!dateStr) {
      return { 
        status: 'GREEN', 
        hours: 0, 
        label: '< 24h', 
        isUrgent: false, 
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
      };
    }

    const parsedDate = new Date(dateStr);
    const validDate = isNaN(parsedDate.getTime()) 
      ? (lead.created_at && !isNaN(new Date(lead.created_at).getTime()) ? new Date(lead.created_at) : new Date())
      : parsedDate;

    const now = new Date();
    const diffHours = Math.max(0, Math.floor((now - validDate) / (1000 * 60 * 60)));

    if (diffHours < 24) {
      return { 
        status: 'GREEN', 
        hours: diffHours, 
        label: diffHours <= 1 ? 'Hace poco' : `${diffHours}h`, 
        isUrgent: false, 
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
      };
    } else if (diffHours <= 48) {
      return { 
        status: 'YELLOW', 
        hours: diffHours, 
        label: `${diffHours}h`, 
        isUrgent: false, 
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
      };
    } else {
      const days = Math.floor(diffHours / 24);
      return { 
        status: 'RED', 
        hours: diffHours, 
        label: `${days}d (>48h)`, 
        isUrgent: true, 
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' 
      };
    }
  };

  // MÓDULO 3: PROBABILIDAD DE CONVERSIÓN IMPLÍCITA DE CADA ETAPA
  const getStageProbability = (stageName = '') => {
    const s = stageName.toLowerCase();
    if (s.includes('primer') || s.includes('nuevo') || s.includes('lead') || s.includes('entrada')) return 15;
    if (s.includes('calific') || s.includes('perfil') || s.includes('contact')) return 30;
    if (s.includes('cita') || s.includes('agend') || s.includes('visita') || s.includes('showroom')) return 55;
    if (s.includes('propuesta') || s.includes('cotiz') || s.includes('dossier')) return 75;
    if (s.includes('negocia') || s.includes('cierre') || s.includes('contrato')) return 90;
    if (s.includes('ganad') || s.includes('vend') || s.includes('firm')) return 100;
    if (s.includes('descart') || s.includes('perdid')) return 0;
    return 35;
  };

  // MÓDULO 2: MANEJADOR DRAG & DROP CON SMART DRAG GUARDS
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.currentTarget.classList.add('opacity-40', 'scale-95', 'rotate-1');
  };

  const handleDragEnd = (e) => {
    setDragOverStageId(null);
    e.currentTarget.classList.remove('opacity-40', 'scale-95', 'rotate-1');
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverStageId(null);
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStageId(null);
    const leadIdStr = e.dataTransfer.getData('text/plain');
    if (!leadIdStr) return;

    const leadId = parseInt(leadIdStr, 10);
    const lead = leads.find(l => l.id === leadId);
    const targetStage = stages.find(s => s.id === targetStageId);
    if (!lead || !targetStage) return;

    // SMART GUARD 1: Si se mueve a 'Cita Agendada' y no tiene cita confirmada
    const isAppointmentStage = (targetStage.name || '').toLowerCase().includes('cita') || 
                               (targetStage.name || '').toLowerCase().includes('agend') ||
                               (targetStage.name || '').toLowerCase().includes('visita') ||
                               (targetStage.name || '').toLowerCase().includes('showroom');
    const hasAppointment = appointments.some(a => a.contact_id === lead.id && a.status === 'CONFIRMED');

    if (isAppointmentStage && !hasAppointment) {
      setPendingStageMove({ leadId, targetStageId });
      setSelectedLeadForAppointment(lead);
      setAppointmentNotes(`Cita para avanzar a etapa: ${targetStage.name}`);
      return;
    }

    // SMART GUARD 2: Si se mueve a 'Propuesta Enviada' y no tiene cotización USD
    const isProposalStage = (targetStage.name || '').toLowerCase().includes('propuesta') || 
                            (targetStage.name || '').toLowerCase().includes('cotiz') ||
                            (targetStage.name || '').toLowerCase().includes('dossier');
    const hasQuotedValue = Number(lead.quoted_value) > 0;

    if (isProposalStage && !hasQuotedValue) {
      setPendingStageMove({ leadId, targetStageId });
      setSelectedLeadForDossier(lead);
      return;
    }

    // Movimiento regular de etapa
    try {
      await moveLead(leadId, targetStageId);
    } catch (err) {
      setToastError(err.message || 'No se pudo mover el prospecto');
      setTimeout(() => setToastError(null), 4500);
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

  // Cantidad de leads en SLA crítico (> 48h)
  const urgentLeadsCount = useMemo(() => {
    return leads.filter(l => getLeadSlaStatus(l).isUrgent).length;
  }, [leads]);

  // Filtrado de Leads en Tiempo Real
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Filtro Maestro de Inactividad SLA
      if (filterOnlyUrgent && !getLeadSlaStatus(l).isUrgent) {
        return false;
      }

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

      // Filtro por Asesor Asignado
      if (filterAdvisor !== 'ALL') {
        if (l.assigned_user_id !== parseInt(filterAdvisor, 10)) {
          return false;
        }
      }

      // Filtro por Tipo de Proyecto
      if (filterProduct !== 'ALL') {
        const prod = (l.interest_product || '').toLowerCase();
        if (!prod.includes(filterProduct.toLowerCase())) {
          return false;
        }
      }

      // Filtro por Estado de Lote
      if (filterLotStatus !== 'ALL') {
        const lot = (l.lot_status || '').toLowerCase();
        if (filterLotStatus === 'Lote Propio') {
          if (!lot.includes('propio') && !lot.includes('sí') && !lot.includes('si') && !lot.includes('tengo')) {
            return false;
          }
        } else if (filterLotStatus === 'Buscando Lote') {
          if (!lot.includes('buscando') && !lot.includes('sin lote') && !lot.includes('no')) {
            return false;
          }
        }
      }

      // Filtro por Rango de Fecha de Creación
      if (filterDateRange !== 'ALL' && l.created_at) {
        const created = new Date(l.created_at);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (filterDateRange === 'TODAY') {
          const leadDate = new Date(created);
          leadDate.setHours(0, 0, 0, 0);
          if (leadDate.getTime() !== now.getTime()) return false;
        } else if (filterDateRange === 'THIS_WEEK') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (created < weekAgo) return false;
        } else if (filterDateRange === 'THIS_MONTH') {
          if (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear()) return false;
        } else if (filterDateRange === 'LAST_30_DAYS') {
          const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (created < thirtyAgo) return false;
        }
      }

      // Filtro por Fecha Específica
      if (filterSpecificDate && l.created_at) {
        const specific = new Date(filterSpecificDate);
        const leadDate = new Date(l.created_at);
        if (
          specific.getFullYear() !== leadDate.getFullYear() ||
          specific.getMonth() !== leadDate.getMonth() ||
          specific.getDate() !== leadDate.getDate()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [leads, searchQuery, filterAdvisor, filterProduct, filterLotStatus, filterDateRange, filterSpecificDate, filterOnlyUrgent]);

  // Lista ordenada para la Vista Tabla
  const sortedTableLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let valA = a[tableSortColumn];
      let valB = b[tableSortColumn];

      if (tableSortColumn === 'name') {
        valA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
        valB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
      } else if (tableSortColumn === 'sla') {
        valA = getLeadSlaStatus(a).hours;
        valB = getLeadSlaStatus(b).hours;
      } else if (tableSortColumn === 'budget') {
        valA = Number(a.estimated_budget) || 0;
        valB = Number(b.estimated_budget) || 0;
      }

      if (valA < valB) return tableSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return tableSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, tableSortColumn, tableSortDirection]);

  // Toggle de ordenamiento en columnas
  const handleSort = (column) => {
    if (tableSortColumn === column) {
      setTableSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortColumn(column);
      setTableSortDirection('asc');
    }
  };

  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(l => l.pipeline_stage_id === stageId);
  };

  // KPIs Totales
  const kpis = useMemo(() => {
    const totalActive = filteredLeads.length;
    const projectedValue = filteredLeads.reduce((acc, l) => acc + (l.estimated_budget || 0), 0);
    const wonLeads = filteredLeads.filter(l => {
      const st = stages.find(s => s.id === l.pipeline_stage_id);
      return st && (st.name.toLowerCase().includes('ganad') || st.name.toLowerCase().includes('cierre') || st.name.toLowerCase().includes('vend'));
    }).length;
    
    const conversionRate = totalActive > 0 ? ((wonLeads / totalActive) * 100).toFixed(1) : 0;
    const confirmedApptsThisMonth = appointments.filter(a => {
      if (a.status !== 'CONFIRMED') return false;
      const apptDate = new Date(a.datetime);
      const now = new Date();
      return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalActive,
      projectedValue,
      wonLeads,
      conversionRate,
      confirmedApptsThisMonth
    };
  }, [filteredLeads, stages, appointments]);

  const formatCOP = (val) => {
    if (!val || isNaN(val)) return '$0 COP';
    return `$${Math.round(val).toLocaleString('es-CO')} COP`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc] overflow-hidden select-none transition-colors duration-300 font-sans">
      
      {/* 1. ENCABEZADO PRINCIPAL & SWITCH DUAL KANBAN / TABLA */}
      {/* 1. ENCABEZADO PRINCIPAL & SWITCH DUAL KANBAN / TABLA (ADAPTATIVO Y COMPACTO EN MÓVIL) */}
      <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md flex flex-col space-y-3 flex-shrink-0 shadow-xs select-none">
        
        {/* Fila 1: Título, Botón Filtros Móvil, Switcher de Vista y Botones de Acción */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md text-slate-950 font-black shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-[#0f172a] dark:text-white tracking-tight flex items-center space-x-1.5 truncate">
                <span>Pipeline 360°</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider hidden sm:inline-block">
                  Linear Style
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                Gestión estratégica, semáforo SLA de inactividad y reglas de arrastre inteligentes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Botón Plegable de Filtros para Celular (< sm) */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(prev => !prev)}
              className="sm:hidden px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>{showMobileFilters ? 'Ocultar' : 'Filtros'}</span>
            </button>

            {/* MÓDULO 4: SELECTOR DUAL DE VISTA (TABLERO KANBAN ↔ TABLA EJECUTIVA) */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl flex items-center space-x-0.5 border border-slate-200 dark:border-white/5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-[#0b0f19] text-[#0f172a] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tablero Kanban"
              >
                <KanbanSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#0b0f19] text-[#0f172a] dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tabla Ejecutiva"
              >
                <List className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>

            <button
              onClick={() => { fetchLeads(); fetchStages(); fetchAppointments(); }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Refrescar datos"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Sección Plegable en Celular: KPIs y Filtros Avanzados */}
        <div className={`${showMobileFilters ? 'block' : 'hidden sm:block'} space-y-3 animate-fade-in`}>
          
          {/* Fila 2: Barra de KPIs en Tiempo Real */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-2.5 sm:p-3 rounded-2xl flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Leads en Embudo</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight font-mono tabular-nums">{kpis.totalActive} prospectos</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-2.5 sm:p-3 rounded-2xl flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Valor Proyectado</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight font-mono tabular-nums truncate block">{formatCOP(kpis.projectedValue)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-2.5 sm:p-3 rounded-2xl flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Citas del Mes</span>
                <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 leading-tight font-mono tabular-nums">{kpis.confirmedApptsThisMonth} agendadas</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-2.5 sm:p-3 rounded-2xl flex items-center space-x-2.5 sm:space-x-3 shadow-xs">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Conversión</span>
                <span className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400 leading-tight font-mono tabular-nums">{kpis.conversionRate}% ({kpis.wonLeads})</span>
              </div>
            </div>
          </div>

          {/* Fila 3: Filtros Avanzados y Botón Maestro de SLA Crítico */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar prospecto, teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFilterOnlyUrgent(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 border ${
                  filterOnlyUrgent
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md font-black ring-2 ring-rose-500/50 animate-pulse'
                    : urgentLeadsCount > 0
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5'
                }`}
                title="Filtrar prospectos sin contacto por más de 48 horas"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${urgentLeadsCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>🚨 Requiere Atención ({urgentLeadsCount})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              <select
                value={filterAdvisor}
                onChange={(e) => setFilterAdvisor(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">👤 Asesores</option>
                {uniqueAdvisors.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">🏗️ Proyecto</option>
                <option value="Flex Home">Flex Home</option>
                <option value="Living">Cápsulas Living</option>
                <option value="Llave en Mano">Llave en Mano</option>
                <option value="Glamping">Glamping</option>
                <option value="Bodega">Bodegas</option>
              </select>

              <select
                value={filterLotStatus}
                onChange={(e) => setFilterLotStatus(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">🗺️ Estado de Lote</option>
                <option value="Lote Propio">Lote Propio</option>
                <option value="Buscando Lote">Buscando Lote</option>
              </select>

              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">📅 Fechas</option>
                <option value="TODAY">📅 Registrados Hoy</option>
                <option value="THIS_WEEK">📅 Esta Semana</option>
                <option value="THIS_MONTH">📅 Este Mes</option>
              </select>

              {(searchQuery || filterAdvisor !== 'ALL' || filterProduct !== 'ALL' || filterLotStatus !== 'ALL' || filterDateRange !== 'ALL' || filterOnlyUrgent) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterAdvisor('ALL');
                    setFilterProduct('ALL');
                    setFilterLotStatus('ALL');
                    setFilterDateRange('ALL');
                    setFilterSpecificDate('');
                    setFilterOnlyUrgent(false);
                  }}
                  className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 2. VISTA CONDICIONAL: TABLERO KANBAN vs TABLA EJECUTIVA */}
      {viewMode === 'kanban' ? (
        
        /* ========================================================================= */
        /* VISTA 1: TABLERO KANBAN CON SELECTOR DE ETAPAS EN MÓVIL Y MINI-DASHBOARDS */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-x-auto p-3 md:p-5 md:space-x-4 space-y-3 md:space-y-0 items-stretch md:items-start custom-scrollbar">
          
          {/* Selector de Pestañas por Etapa (Solo en Móvil < md) */}
          <div className="md:hidden flex overflow-x-auto space-x-2 pb-2 bg-transparent no-scrollbar flex-shrink-0">
            {stages.map((stage) => {
              const count = getLeadsByStage(stage.id).length;
              const isCurrent = (activeMobileStageId || stages[0]?.id) === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveMobileStageId(stage.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{stage.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const stageTotalValue = stageLeads.reduce((acc, l) => acc + (l.estimated_budget || 0), 0);
            const prob = getStageProbability(stage.name);
            const weightedValue = stageTotalValue * (prob / 100);
            const occupancyPct = ((stageLeads.length / Math.max(1, leads.length)) * 100).toFixed(0);
            const isCurrentMobile = (activeMobileStageId || stages[0]?.id) === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-full md:w-80 flex-shrink-0 bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-3.5 flex-col max-h-[calc(100vh-230px)] border transition-all duration-200 ${
                  isCurrentMobile ? 'flex' : 'hidden md:flex'
                } ${
                  dragOverStageId === stage.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-xl shadow-[#10b981]/20 bg-emerald-500/10 dark:bg-emerald-950/40 scale-[1.01]'
                    : 'border-slate-200 dark:border-white/5 shadow-2xs'
                }`}
              >
                {/* MÓDULO 3: CABECERA DE COLUMNA COMO MINI-DASHBOARD */}
                <div className="p-3 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/5 space-y-2 mb-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider truncate">
                      {stage.name}
                    </h3>
                    <span className="text-xs font-extrabold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-mono tabular-nums">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Valor Total + Probabilidad Implícita */}
                  <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      {formatCOP(stageTotalValue)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {prob}% Prob.
                    </span>
                  </div>

                  {/* Barra de Progreso de Volumen Ocupado */}
                  <div className="space-y-1 pt-0.5">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Ponderado: {formatCOP(weightedValue)}</span>
                      <span>{occupancyPct}% vol</span>
                    </div>
                  </div>
                </div>

                {/* Lista de Tarjetas Arrastrables */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] custom-scrollbar">
                  {stageLeads.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-slate-300/70 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-xs text-slate-400 font-semibold">Arrastra prospectos aquí</p>
                      <span className="text-[10px] text-slate-400/60 mt-0.5">Etapa vacía</span>
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const sla = getLeadSlaStatus(lead);
                      const fullName = lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.phone;
                      const appointment = appointments.find((a) => a.contact_id === lead.id && a.status === 'CONFIRMED');

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedLeadForModal(lead)}
                          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 p-3 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group space-y-2 relative overflow-hidden"
                        >
                          {/* MÓDULO 1: RADAR SLA EN ESQUINA DE TARJETA */}
                          <div className="flex items-start justify-between pl-1">
                            <div className="min-w-0 pr-2">
                              <h4 
                                onClick={() => setSelectedLeadForModal(lead)}
                                className="text-xs font-semibold text-slate-900 dark:text-white leading-snug truncate hover:text-emerald-500 cursor-pointer"
                              >
                                {fullName}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums block truncate">
                                {lead.phone}
                              </span>
                            </div>

                            {/* Badge SLA con Semáforo */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border flex items-center space-x-1 ${sla.color}`}>
                                {sla.isUrgent && (
                                  <span className="relative flex h-2 w-2 mr-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                  </span>
                                )}
                                <span>⏱️ {sla.label}</span>
                              </span>
                            </div>
                          </div>

                          {/* Badges de Campaña y Calificación */}
                          <div className="flex flex-wrap items-center gap-1.5 pl-1">
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 truncate max-w-[130px]">
                              {lead.source && (lead.source.includes('Nacional') || lead.source.includes('Virtual')) ? '💻 Cita Virtual' : lead.source || 'Meta Ads'}
                            </span>

                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border flex items-center ${
                              lead.qualification_level === 'VIP' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30 font-extrabold' :
                              lead.qualification_level === 'HOT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-bold' :
                              lead.qualification_level === 'WARM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' :
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                            }`}>
                              {lead.qualification_level === 'VIP' && (
                                <span className="relative flex h-2 w-2 mr-1 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                                </span>
                              )}
                              <span>{lead.qualification_level || 'WARM'}</span>
                            </span>
                          </div>

                          {/* Modelo + Presupuesto Tabular */}
                          <div className="flex items-center justify-between pl-1 pt-1 border-t border-slate-100 dark:border-white/5 text-[11px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                              🏗️ {lead.interest_product || 'Flex Home EXP-36'}
                            </span>
                            <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {lead.estimated_budget ? formatCOP(lead.estimated_budget) : '$18,500 USD'}
                            </span>
                          </div>

                          {/* Cita confirmada badge */}
                          {appointment && (
                            <div className="flex items-center space-x-1.5 text-[9.5px] font-black text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/30">
                              <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">
                                Cita: {new Date(appointment.datetime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {/* Botones en Hover */}
                          <div className="pt-2 border-t border-slate-100 dark:border-white/5 hidden group-hover:flex items-center justify-between gap-1 animate-fade-in transition-all duration-200">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchMessages(lead.id);
                                setActiveTab('chats');
                              }}
                              className="flex-1 py-1 px-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              title="Abrir Chat WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadForAppointment(lead);
                              }}
                              className="flex-1 py-1 px-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              title="Agendar Cita"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Cita</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadForDossier(lead);
                              }}
                              className="py-1 px-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              title="Abrir Dossier Cotizador USD"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Dossier</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadForModal(lead);
                              }}
                              className="py-1 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center cursor-pointer"
                              title="Ver Ficha 360°"
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

      ) : (

        /* ========================================================================= */
        /* VISTA 2: TABLA EJECUTIVA (DENSE DATA GRID)                                */
        /* ========================================================================= */
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0f172a] text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5">
                    <th onClick={() => handleSort('name')} className="p-3.5 cursor-pointer hover:text-emerald-500 transition-colors">
                      <div className="flex items-center space-x-1">
                        <span>Cliente</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3.5">Etapa Pipeline</th>
                    <th onClick={() => handleSort('sla')} className="p-3.5 cursor-pointer hover:text-emerald-500 transition-colors">
                      <div className="flex items-center space-x-1">
                        <span>SLA Inactividad</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3.5">Modelo & Lote</th>
                    <th onClick={() => handleSort('budget')} className="p-3.5 cursor-pointer hover:text-emerald-500 transition-colors">
                      <div className="flex items-center space-x-1">
                        <span>Presupuesto ($COP)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-3.5">Calificación</th>
                    <th className="p-3.5">Asesor</th>
                    <th className="p-3.5 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  {sortedTableLeads.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                        No se encontraron prospectos con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    sortedTableLeads.map((lead) => {
                      const sla = getLeadSlaStatus(lead);
                      const fullName = lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.phone;
                      const currentStage = stages.find(s => s.id === lead.pipeline_stage_id);

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          
                          {/* Cliente */}
                          <td className="p-3.5 font-medium">
                            <div 
                              onClick={() => setSelectedLeadForModal(lead)}
                              className="font-bold text-[#0f172a] dark:text-white hover:text-emerald-500 cursor-pointer truncate max-w-[180px]"
                            >
                              {fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                              {lead.phone} • #{lead.id}
                            </div>
                          </td>

                          {/* Etapa Pipeline con Selector Rápido */}
                          <td className="p-3.5">
                            <select
                              value={lead.pipeline_stage_id || ''}
                              onChange={(e) => moveLead(lead.id, parseInt(e.target.value, 10))}
                              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                            >
                              {stages.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </td>

                          {/* SLA Radar */}
                          <td className="p-3.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border inline-flex items-center space-x-1 ${sla.color}`}>
                              {sla.isUrgent && (
                                <span className="relative flex h-2 w-2 mr-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                              )}
                              <span>⏱️ {sla.label}</span>
                            </span>
                          </td>

                          {/* Modelo & Lote */}
                          <td className="p-3.5 text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate max-w-[150px]">
                              {lead.interest_product || 'Flex Home EXP-36'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              📍 {lead.lot_city || 'Sin ciudad'} ({lead.lot_status || 'Por definir'})
                            </span>
                          </td>

                          {/* Presupuesto */}
                          <td className="p-3.5 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCOP(lead.estimated_budget)}
                          </td>

                          {/* Calificación */}
                          <td className="p-3.5">
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center ${
                              lead.qualification_level === 'VIP' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30 font-extrabold' :
                              lead.qualification_level === 'HOT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 font-bold' :
                              lead.qualification_level === 'WARM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' :
                              'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                            }`}>
                              {lead.qualification_level || 'WARM'}
                            </span>
                          </td>

                          {/* Asesor */}
                          <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-400">
                            {lead.assigned_user_name || 'Sin Asignar'}
                          </td>

                          {/* Acciones */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  fetchMessages(lead.id);
                                  setActiveTab('chats');
                                }}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all"
                                title="Abrir Chat"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedLeadForAppointment(lead)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all"
                                title="Agendar Cita"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedLeadForDossier(lead)}
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-all"
                                title="Dossier Cotizador USD"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedLeadForModal(lead)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                                title="Ficha 360°"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen al pie de la tabla */}
            <div className="p-4 bg-slate-50 dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <div>
                Mostrando <strong className="text-[#0f172a] dark:text-white">{sortedTableLeads.length}</strong> de <strong className="text-[#0f172a] dark:text-white">{leads.length}</strong> prospectos
              </div>
              <div className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                Total Filtrado: {formatCOP(sortedTableLeads.reduce((acc, l) => acc + (l.estimated_budget || 0), 0))}
              </div>
            </div>
          </div>
        </div>

      )}

      {/* SUB-MODALES (Ficha 360°, China Specs, Dossier Cotizador, Cita Rápida) */}
      
      {/* Modal Ficha 360° */}
      {selectedLeadForModal && (
        <LeadFichaModal360
          contact={selectedLeadForModal}
          onClose={() => setSelectedLeadForModal(null)}
          onRefresh={() => {
            fetchLeads();
            fetchStages();
          }}
        />
      )}

      {/* Modal China Spec Sheet */}
      {selectedLeadForChinaSpecs && (
        <ChinaSpecSheetModal
          isOpen={!!selectedLeadForChinaSpecs}
          contact={selectedLeadForChinaSpecs}
          onClose={() => setSelectedLeadForChinaSpecs(null)}
        />
      )}

      {/* Modal Dossier Técnico & Cotizador USD */}
      {selectedLeadForDossier && (
        <AnclaTechnicalDossier
          isOpen={!!selectedLeadForDossier}
          contact={selectedLeadForDossier}
          onClose={() => {
            setSelectedLeadForDossier(null);
            setPendingStageMove(null);
          }}
          onSaveDossier={async (dossierData) => {
            if (selectedLeadForDossier) {
              await updateLeadDetails(selectedLeadForDossier.id, {
                interest_product: dossierData.modelName,
                quoted_value: dossierData.totalUSD,
                proposal_notes: `Dossier: ${dossierData.modelName} ($${Math.round(dossierData.totalUSD).toLocaleString()} USD | 50% Anticipo: $${Math.round(dossierData.deposit50 || dossierData.deposit60).toLocaleString()} USD)`
              });
              
              // Si venía de un Smart Drag Guard a Propuesta Enviada, completar el movimiento
              if (pendingStageMove && pendingStageMove.leadId === selectedLeadForDossier.id) {
                await moveLead(pendingStageMove.leadId, pendingStageMove.targetStageId);
                setPendingStageMove(null);
              }
              
              await fetchLeads();
              setSelectedLeadForDossier(null);
            }
          }}
        />
      )}

      {/* Modal Cita Rápida */}
      {selectedLeadForAppointment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#0f172a] dark:text-[#f8fafc]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Agendar Cita Rápida
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedLeadForAppointment(null);
                  setPendingStageMove(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cliente: <strong className="text-[#0f172a] dark:text-white">{selectedLeadForAppointment.first_name} {selectedLeadForAppointment.last_name || ''}</strong> ({selectedLeadForAppointment.phone})
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
                  className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0f172a] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1.5">
                  Asesor Responsable
                </label>
                <select
                  value={appointmentAdvisorId}
                  onChange={(e) => setAppointmentAdvisorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer"
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
                  className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-[#0f172a] dark:text-white focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={bookingAppointment || !appointmentDateTime}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {bookingAppointment ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirmar & Avanzar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeadForAppointment(null);
                    setPendingStageMove(null);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
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

export default KanbanBoard;
