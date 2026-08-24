import React, { useEffect, useState } from 'react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import { Calendar as CalendarIcon, Clock, User, Plus, Check, AlertCircle, X, Settings, Trash2, ChevronLeft, ChevronRight, Download, MessageCircle, MapPin, DollarSign, Building, Phone, Mail, ExternalLink, ShieldCheck, Sparkles, PhoneCall, Video, Building2, CheckCircle2, Save, FileText, Coffee } from 'lucide-react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEK_DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export const CalendarView = () => {
  const { 
    appointments, 
    slots, 
    availability,
    fetchAppointments, 
    fetchSlots, 
    fetchAvailability,
    saveAvailability,
    bookAppointment, 
    updateAppointment,
    deleteAppointment,
    loading, 
    error 
  } = useCalendarStore();
  const { leads, fetchLeads, updateContact360Details, logAdvisorStatus } = useKanbanStore();
  const { user } = useAuthStore();
  const isAdmin = String(user?.role || '').toLowerCase().includes('admin');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidaySlots, setHolidaySlots] = useState('');
  const [holidayMsg, setHolidayMsg] = useState('');
  const [selectedLeadForFicha, setSelectedLeadForFicha] = useState(null);
  const [selectedApptForFicha, setSelectedApptForFicha] = useState(null);
  
  // Estados para Ficha 360° editable
  const [editEmail, setEditEmail] = useState('');
  const [editLotCity, setEditLotCity] = useState('');
  const [editLotStatus, setEditLotStatus] = useState('');
  const [editInterestProduct, setEditInterestProduct] = useState('');
  const [editPreferredMethod, setEditPreferredMethod] = useState('');
  const [editClientType, setEditClientType] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [advisorStatusMsg, setAdvisorStatusMsg] = useState('');

  useEffect(() => {
    if (selectedLeadForFicha) {
      setEditEmail(selectedLeadForFicha.email || '');
      setEditLotCity(selectedLeadForFicha.lot_city || '');
      setEditLotStatus(selectedLeadForFicha.lot_status || 'Sí, ya tengo');
      setEditInterestProduct(selectedLeadForFicha.interest_product || 'Vivienda Propia o Campestre');
      setEditPreferredMethod(selectedLeadForFicha.preferred_contact_method || 'Llamada telefónica tradicional');
      setEditClientType(selectedLeadForFicha.client_type || 'Persona Natural');
      setEditBudget(selectedLeadForFicha.estimated_budget || '');
      const activeNotes = selectedLeadForFicha.qualification_notes || selectedLeadForFicha.notes || (selectedApptForFicha && selectedApptForFicha.notes) || '';
      setEditNotes(activeNotes);
    }
  }, [selectedLeadForFicha, selectedApptForFicha]);

  // Estados de Calendario Mensual Grande
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mobileCalendarTab, setMobileCalendarTab] = useState('agenda'); // 'agenda' | 'month'
  const dayRefs = React.useRef({});

  // Auto-scroll la cinta horizontal de días al día seleccionado (ej: Día 14 de Agosto)
  useEffect(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const targetEl = dayRefs.current[dateStr];
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 150);
    }
  }, [selectedDate, currentMonth]);
  
  // Estados para agendar
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentType, setAppointmentType] = useState('PRESENCIAL');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalitySaved, setModalitySaved] = useState(false);
  const [showAllDays, setShowAllDays] = useState(false);

  useEffect(() => {
    if (!showAddModal) {
      setShowAllDays(false);
    }
  }, [showAddModal]);

  // Estado local para configuración separada de Presencial y Virtual
  const [configModality, setConfigModality] = useState('PRESENCIAL'); // 'PRESENCIAL' | 'VIRTUAL'
  const [presencialConfig, setPresencialConfig] = useState({
    days: [],
    slot_duration: 60,
    buffer_time: 0
  });
  const [virtualConfig, setVirtualConfig] = useState({
    days: [],
    slot_duration: 30,
    buffer_time: 0
  });

  const DAYS_OF_WEEK_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const normalizeTimeTo24h = (val) => {
    if (!val) return '09:00';
    const str = String(val).toLowerCase().trim();
    const isPM = str.includes('p. m.') || str.includes('pm') || str.includes('p.m.');
    const isAM = str.includes('a. m.') || str.includes('am') || str.includes('a.m.');
    const clean = str.replace(/[^0-9:]/g, '').trim();
    const parts = clean.split(':');
    let h = parseInt(parts[0] || '9', 10);
    let m = parseInt(parts[1] || '0', 10);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Inicializar configuración local de disponibilidad para ambas modalidades
  useEffect(() => {
    if (showConfigModal && availability) {
      const buildDays = (modalityData, defaultStart, defaultEnd, defaultSatEnd) => {
        const rawDays = modalityData?.days || (Array.isArray(modalityData) ? modalityData : []);
        return DAYS_OF_WEEK_NAMES.map((name, index) => {
          const foundDay = rawDays.find(a => a.day_of_week === index);
          if (foundDay && foundDay.intervals && foundDay.intervals.length > 0) {
            return {
              day_of_week: index,
              name,
              enabled: true,
              intervals: foundDay.intervals.map(i => ({
                start_time: normalizeTimeTo24h(i.start_time),
                end_time: normalizeTimeTo24h(i.end_time)
              }))
            };
          }
          if (foundDay && foundDay.intervals && foundDay.intervals.length === 0) {
            return {
              day_of_week: index,
              name,
              enabled: false,
              intervals: [{ start_time: defaultStart, end_time: defaultEnd }]
            };
          }
          // Fallback inteligente inicial
          if (index < 5) {
            return {
              day_of_week: index,
              name,
              enabled: true,
              intervals: [
                { start_time: defaultStart, end_time: '12:30' },
                { start_time: '14:00', end_time: defaultEnd }
              ]
            };
          }
          if (index === 5) {
            return {
              day_of_week: 5,
              name: 'Sábado',
              enabled: true,
              intervals: [{ start_time: defaultStart, end_time: defaultSatEnd }]
            };
          }
          return {
            day_of_week: 6,
            name: 'Domingo',
            enabled: false,
            intervals: [{ start_time: '09:00', end_time: '13:00' }]
          };
        });
      };

      const pres = availability.presencial || {};
      const virt = availability.virtual || {};

      setPresencialConfig({
        days: buildDays(pres, '09:30', '17:00', '13:00'),
        slot_duration: Number(pres.slot_duration) || 60,
        buffer_time: 0
      });

      setVirtualConfig({
        days: buildDays(virt, '10:00', '17:00', '12:00'),
        slot_duration: Number(virt.slot_duration) || 30,
        buffer_time: 0
      });
    }
  }, [showConfigModal, availability]);

  const getCurrentModalityConfig = () => configModality === 'PRESENCIAL' ? presencialConfig : virtualConfig;
  
  const updateCurrentModality = (callback) => {
    if (configModality === 'PRESENCIAL') {
      setPresencialConfig(callback);
    } else {
      setVirtualConfig(callback);
    }
  };

  const toggleDayLocal = (dayIndex) => {
    updateCurrentModality(prev => ({
      ...prev,
      days: prev.days.map(d => d.day_of_week === dayIndex ? { ...d, enabled: !d.enabled } : d)
    }));
  };

  const addIntervalLocal = (dayIndex) => {
    updateCurrentModality(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.day_of_week === dayIndex) {
          const lastInterval = d.intervals[d.intervals.length - 1];
          const newStart = lastInterval ? lastInterval.end_time : '14:00';
          const newEnd = lastInterval ? '17:00' : '18:00';
          return {
            ...d,
            enabled: true,
            intervals: [...d.intervals, { start_time: newStart, end_time: newEnd }]
          };
        }
        return d;
      })
    }));
  };

  const applyLunchBreakLocal = (dayIndex) => {
    updateCurrentModality(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.day_of_week === dayIndex) {
          const isPres = configModality === 'PRESENCIAL';
          return {
            ...d,
            enabled: true,
            intervals: [
              { start_time: isPres ? '09:30' : '10:00', end_time: '12:30' },
              { start_time: '14:00', end_time: '17:00' }
            ]
          };
        }
        return d;
      })
    }));
  };

  const removeIntervalLocal = (dayIndex, intervalIndex) => {
    updateCurrentModality(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.day_of_week === dayIndex) {
          const filtered = d.intervals.filter((_, idx) => idx !== intervalIndex);
          return {
            ...d,
            enabled: filtered.length > 0,
            intervals: filtered.length > 0 ? filtered : [{ start_time: '09:00', end_time: '17:00' }]
          };
        }
        return d;
      })
    }));
  };

  const updateIntervalTimeLocal = (dayIndex, intervalIndex, field, value) => {
    updateCurrentModality(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.day_of_week === dayIndex) {
          const updated = d.intervals.map((item, idx) => 
            idx === intervalIndex ? { ...item, [field]: value } : item
          );
          return { ...d, intervals: updated };
        }
        return d;
      })
    }));
  };

  const setSlotDuration = (duration) => {
    updateCurrentModality(prev => ({ ...prev, slot_duration: duration }));
  };

  const setBufferTime = (buffer) => {
    updateCurrentModality(prev => ({ ...prev, buffer_time: buffer }));
  };

  useEffect(() => {
    fetchAppointments();
    fetchLeads();
    fetchAvailability();
  }, []);

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      presencial: {
        days: presencialConfig.days.map(d => ({
          day_of_week: d.day_of_week,
          intervals: d.enabled 
            ? (d.intervals || []).map(i => ({
                start_time: normalizeTimeTo24h(i.start_time),
                end_time: normalizeTimeTo24h(i.end_time)
              }))
            : []
        })),
        slot_duration: Number(presencialConfig.slot_duration) || 60,
        buffer_time: 0
      },
      virtual: {
        days: virtualConfig.days.map(d => ({
          day_of_week: d.day_of_week,
          intervals: d.enabled 
            ? (d.intervals || []).map(i => ({
                start_time: normalizeTimeTo24h(i.start_time),
                end_time: normalizeTimeTo24h(i.end_time)
              }))
            : []
        })),
        slot_duration: Number(virtualConfig.slot_duration) || 30,
        buffer_time: 0
      }
    };

    const success = await saveAvailability(payload);
    if (success) {
      setSuccessMsg('¡Horarios de Presencial y Virtual guardados con éxito!');
      setTimeout(() => {
        setSuccessMsg('');
        setShowConfigModal(false);
      }, 1500);
    }
  };

  const getLeadName = (leadId) => {
    const leadsList = Array.isArray(leads) ? leads : [];
    const lead = leadsList.find(l => String(l.id) === String(leadId));
    return lead ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.phone : `Lead #${leadId}`;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadReport = () => {
    const appsList = Array.isArray(appointments) ? appointments : [];
    if (appsList.length === 0) {
      alert("No hay citas programadas para exportar.");
      return;
    }

    // Cabeceras del CSV
    const headers = ["Fecha y Hora", "Cliente", "Teléfono", "Email", "Estado de Cita", "Notas / Detalles"];
    
    // Mapear filas
    const rows = appsList.map(appt => {
      const lead = leads.find(l => l.id === appt.contact_id);
      const clientName = lead ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.phone : "Desconocido";
      const clientPhone = lead ? lead.phone : "";
      const clientEmail = lead ? lead.email || "No provisto" : "";
      
      const formattedDate = new Date(appt.datetime).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return [
        `"${formattedDate}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        `"${clientPhone}"`,
        `"${clientEmail.replace(/"/g, '""')}"`,
        `"${appt.status || 'scheduled'}"`,
        `"${(appt.notes || '').replace(/"/g, '""')}"`
      ];
    });

    // Construir contenido CSV con BOM UTF-8 para Excel
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    
    // Crear enlace de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_citas_showroom_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getApptType = (typeStr, notesStr = '') => {
    const combined = `${typeStr || ''} ${notesStr || ''}`.toUpperCase();
    if (combined.includes('PRESENCIAL') || combined.includes('SHOWROOM') || combined.includes('VISITA')) return 'PRESENCIAL';
    if (combined.includes('LLAMADA') || combined.includes('TELEFON')) return 'LLAMADA';
    return 'VIRTUAL';
  };

  const getModalityBadgeClass = (type) =>
    type === 'PRESENCIAL'
      ? 'bg-gold-500/15 border-gold-500/30 text-gold-400 font-bold'
      : 'bg-navy-700/50 border-navy-600 text-slate-300';

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const appsList = Array.isArray(appointments) ? appointments : [];
    return appsList.filter(app => app.datetime && app.datetime.startsWith(dateStr));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-navy-950 overflow-y-auto md:overflow-hidden transition-colors duration-300">
      {/* CABECERA & CINTA DE DÍAS PEGEDAS (Sticky en Móvil sin espacio desaprovechado / Estática en PC) */}
      <div className="p-3 sm:p-6 border-b border-slate-200 dark:border-navy-700 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md flex flex-col space-y-2.5 flex-shrink-0 select-none sticky top-0 z-30 shadow-xs md:static md:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gold-500" />
              <span>Agenda & Citas</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Control de citas comerciales y horarios agendados por la IA o de forma manual</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-navy-700 transition-all cursor-pointer min-h-[44px]"
                title="Configurar Horarios"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Configurar Horarios</span>
              </button>
            )}

            <button
              onClick={handleDownloadReport}
              className="hidden sm:flex items-center space-x-1.5 bg-gold-500/10 hover:bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-gold-500/30 transition-all cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Reporte</span>
            </button>
            
            <button
              onClick={() => {
                setSelectedSlot('');
                setSelectedLeadId('');
                setShowAddModal(true);
              }}
              className="flex items-center space-x-1 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md shadow-gold-500/20 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN Y CINTA DÍAS MÓVIL (Integrada en la Cabecera Fija para Móviles) */}
        <div className="md:hidden flex flex-col space-y-2 pt-1 border-t border-slate-100 dark:border-navy-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white capitalize">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <div className="flex space-x-1">
              <button 
                type="button" 
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Mes Anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentMonth(new Date());
                  setSelectedDate(new Date());
                }}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px]"
              >
                Hoy
              </button>
              <button 
                type="button" 
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Mes Siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cinta Interactiva Móvil de Días */}
          <div className="flex overflow-x-auto space-x-2 py-1 px-0.5 no-scrollbar">
            {getDaysInMonth(currentMonth).filter(Boolean).map((day) => {
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const dayApps = getAppointmentsForDate(day);
              const isSelected = selectedDate.toDateString() === day.toDateString();
              const isTdy = day.toDateString() === new Date().toDateString();

              return (
                <button
                  key={`mobile-day-${dateStr}`}
                  ref={(el) => (dayRefs.current[dateStr] = el)}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`flex-shrink-0 w-16 min-h-[44px] py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-gold-500 to-gold-600 border-2 border-gold-400 text-navy-950 shadow-md shadow-gold-500/30 scale-105 font-black ring-2 ring-gold-500/20'
                      : isTdy
                        ? 'bg-gold-500/15 border-2 border-gold-500/50 text-gold-600 dark:text-gold-400 font-bold'
                        : 'bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-navy-600'
                  }`}
                >
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider ${isSelected ? 'text-navy-900' : 'text-slate-600 dark:text-slate-300'}`}>
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span className={`text-sm font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                    {day.getDate()}
                  </span>
                  {dayApps.length > 0 ? (
                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-navy-950 text-gold-400 font-black' : 'bg-gold-500/20 text-gold-700 dark:text-gold-300'
                    }`}>
                      {dayApps.length} citas
                    </span>
                  ) : (
                    <span className="text-[8px] opacity-0">-</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda de modalidades — visible en móvil/tablet */}
          <div className="flex md:hidden flex-wrap items-center gap-1.5 text-[10px] font-bold pt-0.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30 min-h-[32px]">
              <span className="w-2 h-2 rounded-full bg-gold-500"></span>
              <span>🏢 Presencial (Showroom)</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-navy-700/50 text-slate-300 border border-navy-600 min-h-[32px]">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>💻 Virtual</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-navy-700/50 text-slate-300 border border-navy-600 min-h-[32px]">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span>📞 Llamada</span>
            </span>
          </div>
        </div>
      </div>

      {/* VISTA UNIFICADA MÓVIL Y ESCRITORIO */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-50 dark:bg-navy-950">
        
        {/* LADO IZQUIERDO: CALENDARIO MENSUAL DESKTOP (Solo visible en PC md:block) */}
        <div className="hidden md:flex md:flex-1 p-3.5 sm:p-6 overflow-y-auto flex-col bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-700 shrink-0">
            <div className="w-full max-w-4xl mx-auto flex flex-col">
              
              {/* Navegación del Mes & Controles */}
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center space-x-2">
                  <CalendarIcon className="w-4.5 h-4.5 text-gold-500" />
                  <span className="capitalize">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                </h3>

                {/* Leyenda Explicativa de Colores */}
                <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30">
                    <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                    <span>🏢 Presencial (Showroom Guatavita)</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-700/50 text-slate-300 border border-navy-600">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>💻 Virtual</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-700/50 text-slate-300 border border-navy-600">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>📞 Llamada</span>
                  </span>
                </div>
                
                <div className="flex space-x-1.5">
                  <button 
                    type="button" 
                    onClick={handlePrevMonth}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Mes Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(new Date());
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px]"
                  >
                    Hoy
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNextMonth}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Mes Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Días de la semana (Desktop) */}
              <div className="hidden md:grid grid-cols-7 gap-2 text-center mb-2">
                {WEEK_DAYS.map((d) => (
                  <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase py-2">{d}</span>
                ))}
              </div>

              {/* Cuadrícula de días (Desktop) */}
              <div className="hidden md:grid grid-cols-7 gap-2 sm:gap-2.5 flex-1 min-h-[410px]">
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/20 dark:bg-navy-950/40 rounded-2xl border border-transparent w-full min-h-[44px]"></div>;
                  
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                  const dayApps = getAppointmentsForDate(day);
                  const isSelected = selectedDate.toDateString() === day.toDateString();
                  const isTdy = day.toDateString() === new Date().toDateString();

                  // Conteo exacto por modalidad
                  const presencialCount = dayApps.filter(a => getApptType(a.appointment_type, a.notes) === 'PRESENCIAL').length;
                  const virtualCount = dayApps.filter(a => getApptType(a.appointment_type, a.notes) === 'VIRTUAL').length;
                  const llamadaCount = dayApps.filter(a => getApptType(a.appointment_type, a.notes) === 'LLAMADA').length;

                  return (
                    <button
                      key={`day-${dateStr}`}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-[105px] relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-gold-500/15 via-gold-500/10 to-transparent border-2 border-gold-500 text-slate-900 dark:text-gold-200 shadow-xl shadow-gold-500/10 scale-[1.01] z-10'
                          : isTdy
                            ? 'bg-gradient-to-br from-gold-500/10 via-navy-800/50 to-transparent border-2 border-gold-500/50 text-slate-800 dark:text-gold-200 shadow-md'
                            : 'bg-white dark:bg-navy-800 border-slate-200/80 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:border-gold-500/40 hover:shadow-lg'
                      }`}
                    >
                      {/* Encabezado del día: Número y Insignia Pequeña de # Citas */}
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs sm:text-sm font-black tracking-tight flex items-center justify-center ${
                          isTdy 
                            ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 px-2 py-0.5 rounded-lg shadow-sm text-[11px]' 
                            : isSelected
                              ? 'text-gold-600 dark:text-gold-400 text-sm font-black'
                              : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {day.getDate()}
                        </span>

                        {/* Insignia Pequeña Elegante de # Citas Totales */}
                        {dayApps.length > 0 && (
                          <span className={`text-[8.5px] sm:text-[9.5px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                            isSelected 
                              ? 'bg-gold-600 text-navy-950' 
                              : 'bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-600'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                            <span>{dayApps.length} {dayApps.length === 1 ? 'cita' : 'citas'}</span>
                          </span>
                        )}
                      </div>

                      {/* Indicador Ejecutivo 100% Completo y Visible en Cualquier Dispositivo */}
                      {dayApps.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1 w-full flex-1 justify-end">
                          <div className="flex flex-col gap-0.5 w-full">
                            {presencialCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-black bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>🏢</span>
                                  <span className="truncate">Presencial</span>
                                </span>
                                <span className="bg-gold-600 text-navy-950 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
                                  {presencialCount}
                                </span>
                              </div>
                            )}

                            {virtualCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-bold bg-navy-700/50 text-slate-300 border border-navy-600 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>💻</span>
                                  <span className="truncate">Virtual</span>
                                </span>
                                <span className="bg-navy-600 text-slate-200 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
                                  {virtualCount}
                                </span>
                              </div>
                            )}

                            {llamadaCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-bold bg-navy-700/50 text-slate-300 border border-navy-600 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>📞</span>
                                  <span className="truncate">Llamada</span>
                                </span>
                                <span className="bg-navy-600 text-slate-200 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
                                  {llamadaCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LADO DERECHO / INFERIOR MÓVIL: LISTADO INTEGRADOR DE CITAS DEL DÍA SELECCIONADO */}
          <div className="w-full md:w-96 bg-slate-50/80 dark:bg-navy-950 p-4 sm:p-6 pb-36 md:pb-6 flex flex-col overflow-y-auto md:overflow-y-auto">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Citas Programadas</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1 capitalize">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
            </div>

            {/* Listado de citas para la fecha seleccionada */}
            <div className="space-y-3">
              {(() => {
                const dayApps = getAppointmentsForDate(selectedDate);
                if (dayApps.length === 0) {
                  return (
                    <div className="p-5 border border-dashed border-slate-200 dark:border-navy-700 rounded-2xl text-center bg-white/50 dark:bg-navy-900/40">
                      <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">No hay citas agendadas para este día.</p>
                    </div>
                  );
                }
                return dayApps.map((app) => {
                  const lead = (leads || []).find(l => l.id === app.contact_id);
                  return (
                    <div
                      key={app.id}
                      onClick={async () => {
                        if (lead) {
                          try {
                            const res = await api.get(`/contacts/${lead.id}`);
                            setSelectedLeadForFicha(res.data);
                          } catch {
                            setSelectedLeadForFicha(lead);
                          }
                          setSelectedApptForFicha(app);
                        }
                      }}
                      className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 p-4 rounded-2xl shadow-sm flex items-start space-x-3.5 group relative cursor-pointer hover:border-gold-500/40 hover:shadow-md hover:scale-[1.01] transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gold-500/10 dark:bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white truncate group-hover:text-gold-500 transition-colors">
                            {getLeadName(app.contact_id)}
                          </h4>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                            Ver Ficha ➔
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] mt-1.5 flex-wrap gap-y-1">
                          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>A las {formatTime(app.datetime)}</span>
                          </div>
                          {(() => {
                            const sideType = getApptType(app.appointment_type, app.notes);
                            return (
                              <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] border ${getModalityBadgeClass(sideType)}`}>
                                {sideType === 'PRESENCIAL' ? '🏢 PRESENCIAL (SHOWROOM)' : sideType === 'LLAMADA' ? '📞 LLAMADA TELEFÓNICA' : '💻 VIRTUAL (MEET)'}
                              </span>
                            );
                          })()}
                        </div>
                        {app.notes && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-navy-950/60 p-2 rounded-xl italic">
                            "{app.notes}"
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm("¿Estás seguro de cancelar esta cita?")) {
                            await deleteAppointment(app.id);
                            fetchAppointments();
                          }
                        }}
                        className="absolute top-2 right-2 min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-navy-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer z-10 flex items-center justify-center"
                        title="Cancelar Cita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Botones para Configurar Horario Excepcional y Agendar Cita */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-700 mt-5 space-y-2">
            {isAdmin && (
              <button
                onClick={() => setShowHolidayModal(true)}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold py-2.5 px-4 rounded-xl border border-amber-500/30 text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Settings className="w-4 h-4 text-amber-500" />
                <span>⚙️ Configurar Horario Excepcional / Festivo</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedSlot('');
                setSelectedLeadId('');
                setShowAddModal(true);
              }}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-bold py-3 px-4 rounded-xl shadow-md shadow-gold-500/20 text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar en este día</span>
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Modal de Horario Excepcional / Festivo */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 shadow-2xl transition-all duration-300 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-700 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Horario Excepcional para Fecha Específica</span>
                </h3>
                <p className="text-xs text-gold-600 dark:text-gold-400 font-extrabold mt-0.5 capitalize">
                  {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
              💡 Si esta fecha es un <strong>día festivo en Colombia</strong> (como el 17 de Agosto) o un día especial y deseas atender a clientes, define los horarios permitidos. Sofi AI y el CRM ofrecerán exclusivamente las horas ingresadas aquí.
            </div>

            {holidayMsg && (
              <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{holidayMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Opciones Rápidas de Habilitación
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHolidaySlots('10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM')}
                  className="p-2.5 rounded-xl border text-xs font-semibold text-left bg-gold-50 dark:bg-gold-500/10 border-gold-200 text-gold-700 hover:bg-gold-50 transition-all cursor-pointer"
                >
                  🟢 Jornada Mañana (10:00 AM - 12:00 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setHolidaySlots('02:00 PM, 02:30 PM, 03:00 PM, 04:00 PM, 05:00 PM')}
                  className="p-2.5 rounded-xl border text-xs font-semibold text-left bg-blue-50 dark:bg-blue-500/10 border-blue-200 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  🟢 Jornada Tarde (02:00 PM - 05:00 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setHolidaySlots('10:00 AM, 11:00 AM, 12:00 PM, 02:00 PM, 03:00 PM, 04:00 PM')}
                  className="p-2.5 rounded-xl border text-xs font-semibold text-left bg-purple-50 dark:bg-purple-500/10 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all cursor-pointer"
                >
                  🟢 Día Completo Estándar
                </button>
                <button
                  type="button"
                  onClick={() => setHolidaySlots('')}
                  className="p-2.5 rounded-xl border text-xs font-semibold text-left bg-red-50 dark:bg-red-500/10 border-red-200 text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                >
                  🔴 Mantener Cerrado (Día Festivo)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 mt-3">
                  Franjas Permitidas (Separadas por Coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 10:00 AM, 11:30 AM, 02:00 PM"
                  value={holidaySlots}
                  onChange={(e) => setHolidaySlots(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-navy-700">
              <button
                type="button"
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveHolidayOverride(holidaySlots)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Horario Excepcional</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamiento Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl p-6 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gold-500" />
                <span>Agendar Cita Comercial</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center mb-3 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4">
                {/* Seleccionar Lead */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Seleccionar Prospecto (Lead)</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-gold-500/50"
                    required
                  >
                    <option value="">-- Elige un prospecto --</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() || lead.phone : lead.phone} ({lead.source || 'WhatsApp'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Tipo de Atención */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Modalidad de Atención</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-gold-500/50"
                    required
                  >
                    <option value="PRESENCIAL">🏢 Visita Presencial en Showroom Armenia</option>
                    <option value="VIRTUAL">💻 Asesoría Virtual (Google Meet / Zoom)</option>
                    <option value="LLAMADA">📞 Llamada Telefónica Comercial</option>
                  </select>
                </div>

                {/* Seleccionar Fecha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fecha de la Reunión</label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(new Date(e.target.value + 'T00:00:00'));
                      }
                    }}
                    className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-gold-500/50"
                    required
                  />
                </div>

                {/* Slots de Horas */}
                {selectedLeadId && (() => {
                  const targetDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                  
                  const groupSlotsByDate = (slotsList) => {
                    const groups = {};
                    (slotsList || []).forEach(slot => {
                      if (!slot.datetime) return;
                      const dateStr = slot.datetime.split('T')[0];
                      if (!groups[dateStr]) groups[dateStr] = [];
                      groups[dateStr].push(slot);
                    });
                    return groups;
                  };

                  const grouped = groupSlotsByDate(slots);
                  const daySlots = grouped[targetDateStr] || [];

                  const morningSlots = daySlots.filter(s => {
                    const timePart = s.datetime.split('T')[1];
                    const hour = parseInt(timePart.split(':')[0], 10);
                    return hour < 12;
                  });

                  const afternoonSlots = daySlots.filter(s => {
                    const timePart = s.datetime.split('T')[1];
                    const hour = parseInt(timePart.split(':')[0], 10);
                    return hour >= 12;
                  });

                  if (loading) {
                    return (
                      <div className="flex items-center space-x-2 py-2">
                        <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-400">Calculando horas libres del asesor...</span>
                      </div>
                    );
                  }

                  if (!showAllDays) {
                    return (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Horarios para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowAllDays(true)}
                            className="text-[10px] text-gold-600 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                          >
                            Ver otros días
                          </button>
                        </div>
                        {daySlots.length === 0 ? (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                            No hay horas libres para este día. Intenta seleccionando otra fecha arriba o haz clic en "Ver otros días".
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {morningSlots.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">☀️ Mañana (AM)</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {morningSlots.map((slot) => (
                                    <button
                                      key={slot.datetime}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-gold-500 border-gold-500 text-navy-950 shadow-sm'
                                          : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
                                      }`}
                                    >
                                      {slot.formatted_time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {afternoonSlots.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">🌙 Tarde (PM)</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {afternoonSlots.map((slot) => (
                                    <button
                                      key={slot.datetime}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-gold-500 border-gold-500 text-navy-950 shadow-sm'
                                          : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
                                      }`}
                                    >
                                      {slot.formatted_time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Todos los horarios libres
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAllDays(false)}
                          className="text-[10px] text-gold-600 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                        >
                          Filtrar por día seleccionado
                        </button>
                      </div>

                      {slots.length === 0 ? (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                          No hay slots disponibles en los próximos 7 días para este asesor.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                          {Object.keys(grouped).map((dateStr) => {
                            const dateObj = new Date(dateStr + 'T00:00:00');
                            const formattedHeader = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                            return (
                              <div key={dateStr} className="space-y-1.5 border-b border-slate-100 dark:border-navy-700 pb-2.5 last:border-b-0">
                                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider capitalize">{formattedHeader}</h5>
                                <div className="grid grid-cols-3 gap-2">
                                  {grouped[dateStr].map(slot => (
                                    <button
                                      key={slot.datetime}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-gold-500 border-gold-500 text-navy-950 shadow-sm'
                                          : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
                                      }`}
                                    >
                                      {slot.formatted_time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Notas / Detalles */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notas / Detalles</label>
                  <textarea
                    placeholder="Escribe detalles sobre la llamada comercial..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-gold-500/50 min-h-[80px]"
                  />
                </div>

                {/* Opciones de Sincronización e Email */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-navy-700">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sync_gcal"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-gold-600 dark:bg-navy-800 focus:ring-gold-500 cursor-pointer"
                    />
                    <label htmlFor="sync_gcal" className="text-xs font-semibold text-slate-600 dark:text-slate-500 cursor-pointer select-none">
                      Sincronizar con Google Calendar
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="send_email_notif"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-gold-600 dark:bg-navy-800 focus:ring-gold-500 cursor-pointer"
                    />
                    <label htmlFor="send_email_notif" className="text-xs font-semibold text-slate-600 dark:text-slate-500 cursor-pointer select-none">
                      Enviar propuesta y aviso por correo
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedSlot}
                  className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-semibold py-3.5 px-4 rounded-xl shadow-md shadow-gold-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Agendar Cita
                </button>
              </form>
            )}
          </div>
        </div>
      )}



      {/* Modal de Configuración de Horarios de Disponibilidad (Separado por Presencial y Virtual) */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-900/50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                    Configurar Horarios de Disponibilidad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Horarios independientes para Visitas Showroom y Asesorías Virtuales / Llamadas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-navy-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gold-500/15 text-gold-500 flex items-center justify-center mb-3.5 animate-bounce">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">¡Horarios Actualizados!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfigSubmit} className="flex flex-col flex-1 min-h-0">
                
                {/* Selector de Pestañas de Modalidad */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-navy-700 bg-slate-100/50 dark:bg-navy-950/40 shrink-0">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 dark:bg-navy-800/80 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setConfigModality('PRESENCIAL')}
                      className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
                        configModality === 'PRESENCIAL'
                          ? 'bg-white dark:bg-gold-600 text-gold-700 dark:text-navy-950 shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-gold-500 dark:text-gold-200" />
                      <span>🏢 Showroom Guatavita (Presencial)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigModality('VIRTUAL')}
                      className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
                        configModality === 'VIRTUAL'
                          ? 'bg-white dark:bg-navy-700 text-slate-800 dark:text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Video className="w-4 h-4 text-slate-500 dark:text-slate-200" />
                      <span>💻 Virtual & Llamadas</span>
                    </button>
                  </div>

                  {/* Banner Explicativo de la Modalidad */}
                  <div className={`mt-3 p-3 rounded-2xl border text-xs flex items-start space-x-2.5 ${
                    configModality === 'PRESENCIAL'
                      ? 'bg-gold-500/10 dark:bg-navy-950/40 border-gold-500/30 dark:border-gold-500/20 text-gold-800 dark:text-gold-300'
                      : 'bg-navy-800/50 dark:bg-navy-800/50 border-navy-600 text-slate-300'
                  }`}>
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        {configModality === 'PRESENCIAL' ? 'Atención en Showroom Armenia (Encargado Presencial)' : 'Atención Virtual / Google Meet & Llamadas (Liliana León)'}
                      </span>
                      <p className="opacity-90 leading-relaxed text-[11px]">
                        {configModality === 'PRESENCIAL'
                          ? 'Sofi AI consultará estos horarios exclusivamente cuando el cliente elija visitar la sala de ventas física en Armenia.'
                          : 'Sofi AI consultará estos horarios cuando el cliente solicite una videollamada por Google Meet o una llamada telefónica comercial.'}
                      </p>
                    </div>
                  </div>

                  {/* Control de Duración de Cita */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-navy-700">
                    <div className="bg-white dark:bg-navy-800/80 p-3 rounded-xl border border-slate-200 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gold-500" />
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                            Duración por cita:
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Espaciado exacto entre cada cita disponible
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {[15, 30, 45, 60, 90].map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setSlotDuration(dur)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                              getCurrentModalityConfig().slot_duration === dur
                                ? 'bg-gold-600 text-navy-950 shadow-xs'
                                : 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-600'
                            }`}
                          >
                            {dur} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Días e Intervalos (Scrollable) */}
                <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
                  {(getCurrentModalityConfig().days || []).map((d) => (
                    <div
                      key={d.day_of_week}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        d.enabled
                          ? 'bg-white dark:bg-navy-800/60 border-slate-200 dark:border-navy-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-navy-900/40 border-slate-200/60 dark:border-navy-700 opacity-75'
                      }`}
                    >
                      {/* Cabecera del Día */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`day_check_${configModality}_${d.day_of_week}`}
                            checked={d.enabled}
                            onChange={() => toggleDayLocal(d.day_of_week)}
                            className="w-4.5 h-4.5 rounded-md border-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`day_check_${configModality}_${d.day_of_week}`}
                            className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center space-x-2"
                          >
                            <span>{d.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              d.enabled 
                                ? 'bg-gold-500/15 dark:bg-navy-950/40 text-gold-700 dark:text-gold-400' 
                                : 'bg-slate-200 dark:bg-navy-700 text-slate-500'
                            }`}>
                              {d.enabled ? 'Laborable' : 'Cerrado'}
                            </span>
                          </label>
                        </div>

                        {d.enabled && (
                          <div className="flex items-center space-x-2">
                            {/* Botón Rápido de Almuerzo */}
                            <button
                              type="button"
                              onClick={() => applyLunchBreakLocal(d.day_of_week)}
                              className="text-[11px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                              title="Configura automáticamente turno mañana y turno tarde excluyendo el almuerzo"
                            >
                              <span>🥪 + Almuerzo</span>
                            </button>

                            {/* Botón Añadir Bloque Manual */}
                            <button
                              type="button"
                              onClick={() => addIntervalLocal(d.day_of_week)}
                              className="text-[11px] bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 dark:hover:bg-navy-600 text-gold-600 dark:text-gold-400 font-bold px-2.5 py-1 rounded-xl transition-all flex items-center space-x-1 cursor-pointer min-h-[36px]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Bloque</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bloques de Horas */}
                      {d.enabled ? (
                        <div className="mt-3 pl-7 space-y-2">
                          {(d.intervals || []).map((interval, idx) => (
                            <div key={idx} className="flex items-center space-x-2 animate-fade-in">
                              <span className="text-[10px] font-bold text-slate-400 uppercase w-12">
                                Bloque {idx + 1}:
                              </span>
                              <input
                                type="time"
                                value={(() => {
                                  const val = interval.start_time || '09:00';
                                  if (val.includes('a. m.') || val.includes('p. m.') || val.includes('AM') || val.includes('PM')) {
                                    const isPM = /p\.?\s*m\.?/i.test(val) || /pm/i.test(val);
                                    const clean = val.replace(/[^0-9:]/g, '').trim();
                                    const parts = clean.split(':');
                                    let h = parseInt(parts[0] || '9', 10);
                                    let m = parseInt(parts[1] || '0', 10);
                                    if (isPM && h < 12) h += 12;
                                    if (!isPM && h === 12) h = 0;
                                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                  }
                                  return val;
                                })()}
                                onChange={(e) => updateIntervalTimeLocal(d.day_of_week, idx, 'start_time', e.target.value)}
                                className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono font-bold"
                              />
                              <span className="text-xs text-slate-400 font-bold">a</span>
                              <input
                                type="time"
                                value={(() => {
                                  const val = interval.end_time || '17:00';
                                  if (val.includes('a. m.') || val.includes('p. m.') || val.includes('AM') || val.includes('PM')) {
                                    const isPM = /p\.?\s*m\.?/i.test(val) || /pm/i.test(val);
                                    const clean = val.replace(/[^0-9:]/g, '').trim();
                                    const parts = clean.split(':');
                                    let h = parseInt(parts[0] || '17', 10);
                                    let m = parseInt(parts[1] || '0', 10);
                                    if (isPM && h < 12) h += 12;
                                    if (!isPM && h === 12) h = 0;
                                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                  }
                                  return val;
                                })()}
                                onChange={(e) => updateIntervalTimeLocal(d.day_of_week, idx, 'end_time', e.target.value)}
                                className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono font-bold"
                              />
                              
                              {(d.intervals || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIntervalLocal(d.day_of_week, idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                                  title="Eliminar este bloque"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-7 mt-1.5 text-xs text-slate-400 italic">No disponible para agendamiento</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Fijo con Botón Guardar */}
                <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all cursor-pointer min-h-[44px]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all text-xs sm:text-sm flex items-center space-x-2 cursor-pointer min-h-[44px]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Horarios de Ambas Modalidades</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica 360° del Cliente al hacer clic en cualquier Cita */}
      {selectedLeadForFicha && (
        <LeadFichaModal360
          contact={selectedLeadForFicha}
          onClose={() => {
            setSelectedLeadForFicha(null);
            setSelectedApptForFicha(null);
          }}
          onRefresh={fetchLeads}
        />
      )}
    </div>
  );
};
