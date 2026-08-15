import React, { useEffect, useState } from 'react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import { Calendar as CalendarIcon, Clock, User, Plus, Check, AlertCircle, X, Settings, Trash2, ChevronLeft, ChevronRight, Download, MessageCircle, MapPin, DollarSign, Building, Phone, Mail, ExternalLink, ShieldCheck, Sparkles, PhoneCall, Video, Building2, CheckCircle2, Save, FileText } from 'lucide-react';

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
  const { setActiveTab, fetchMessages } = useChatStore();

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

  // Estado local para intervalos múltiples
  const [localAvailability, setLocalAvailability] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchLeads();
    fetchAvailability();
  }, []);

  // Inicializar configuración local de disponibilidad (intervalos múltiples)
  useEffect(() => {
    if (showConfigModal && availability) {
      const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const config = daysOfWeek.map((name, index) => {
        const foundDay = availability.find(a => a.day_of_week === index);
        
        return {
          day_of_week: index,
          name,
          enabled: foundDay ? foundDay.intervals.length > 0 : false,
          intervals: foundDay && foundDay.intervals.length > 0 
            ? foundDay.intervals 
            : [{ start_time: '09:00', end_time: '17:00' }]
        };
      });
      setLocalAvailability(config);
    }
  }, [showConfigModal, availability]);

  // Cargar slots libres cuando cambia el lead seleccionado
  useEffect(() => {
    if (selectedLeadId) {
      fetchSlots(selectedLeadId);
      setSelectedSlot('');
    }
  }, [selectedLeadId]);

  // Cargar disponibilidad de horario excepcional/festivo para la fecha seleccionada
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const token = useAuthStore.getState().token;
      
      fetch(`${API_URL}/appointments/holiday-override/${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setHolidaySlots(data.slots || ''))
        .catch(() => setHolidaySlots(''));
    }
  }, [selectedDate, showHolidayModal]);

  const handleSaveHolidayOverride = async (slotsToSave) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const token = useAuthStore.getState().token;

    try {
      const res = await fetch(`${API_URL}/appointments/holiday-override/${dateStr}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slots: slotsToSave })
      });
      if (res.ok) {
        setHolidayMsg('¡Horario excepcional guardado con éxito!');
        setTimeout(() => {
          setHolidayMsg('');
          setShowHolidayModal(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Error guardando horario excepcional:', err);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeadId || !selectedSlot) return;

    const success = await bookAppointment(
      parseInt(selectedLeadId, 10),
      selectedSlot,
      notes,
      appointmentType
    );

    if (success) {
      setSuccessMsg('¡Cita agendada con éxito!');
      setTimeout(() => {
        setSuccessMsg('');
        setShowAddModal(false);
        setSelectedLeadId('');
        setSelectedSlot('');
        setAppointmentType('PRESENCIAL');
        setNotes('');
        fetchAppointments(); // Recargar citas
      }, 1500);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    
    const daysPayload = localAvailability.map(d => ({
      day_of_week: d.day_of_week,
      intervals: d.enabled ? d.intervals : []
    }));

    const success = await saveAvailability(daysPayload);
    if (success) {
      setSuccessMsg('¡Horarios guardados con éxito!');
      setTimeout(() => {
        setSuccessMsg('');
        setShowConfigModal(false);
      }, 1500);
    }
  };

  const toggleDayLocal = (index) => {
    setLocalAvailability(prev => 
      prev.map(d => d.day_of_week === index ? { ...d, enabled: !d.enabled } : d)
    );
  };

  const addIntervalLocal = (dayIndex) => {
    setLocalAvailability(prev => 
      prev.map(d => {
        if (d.day_of_week === dayIndex) {
          const lastInterval = d.intervals[d.intervals.length - 1];
          const newStart = lastInterval ? lastInterval.end_time : '14:00';
          const newEnd = lastInterval ? '17:00' : '18:00';
          return {
            ...d,
            intervals: [...d.intervals, { start_time: newStart, end_time: newEnd }]
          };
        }
        return d;
      })
    );
  };

  const removeIntervalLocal = (dayIndex, intervalIndex) => {
    setLocalAvailability(prev => 
      prev.map(d => {
        if (d.day_of_week === dayIndex) {
          const filtered = d.intervals.filter((_, idx) => idx !== intervalIndex);
          return {
            ...d,
            enabled: filtered.length > 0 ? d.enabled : false,
            intervals: filtered.length > 0 ? filtered : [{ start_time: '09:00', end_time: '17:00' }]
          };
        }
        return d;
      })
    );
  };

  const updateIntervalTimeLocal = (dayIndex, intervalIndex, field, value) => {
    setLocalAvailability(prev => 
      prev.map(d => {
        if (d.day_of_week === dayIndex) {
          const updated = d.intervals.map((item, idx) => 
            idx === intervalIndex ? { ...item, [field]: value } : item
          );
          return { ...d, intervals: updated };
        }
        return d;
      })
    );
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-y-auto md:overflow-hidden transition-colors duration-300">
      {/* CABECERA & CINTA DE DÍAS PEGEDAS (Sticky en Móvil sin espacio desaprovechado / Estática en PC) */}
      <div className="p-3 sm:p-6 border-b border-slate-200 dark:border-white/5 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md flex flex-col space-y-2.5 flex-shrink-0 select-none sticky top-0 z-30 shadow-xs md:static md:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              <span>Agenda & Citas</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Control de citas comerciales y horarios agendados por la IA o de forma manual</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
              title="Configurar Horarios"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">Configurar Horarios</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer"
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
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN Y CINTA DÍAS MÓVIL (Integrada en la Cabecera Fija para Móviles) */}
        <div className="md:hidden flex flex-col space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-white capitalize">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <div className="flex space-x-1">
              <button 
                type="button" 
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
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
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-750 dark:text-slate-250 cursor-pointer active:scale-95 transition-all"
              >
                Hoy
              </button>
              <button 
                type="button" 
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
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
                  className={`flex-shrink-0 w-15 py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-2 border-emerald-400 text-white shadow-md shadow-emerald-500/30 scale-105 font-black ring-2 ring-emerald-500/20'
                      : isTdy
                        ? 'bg-blue-500/15 border-2 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[9.5px] uppercase font-bold tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span className={`text-sm font-black my-0.5 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                    {day.getDate()}
                  </span>
                  {dayApps.length > 0 ? (
                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-white text-emerald-700 font-black' : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
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
        </div>
      </div>

      {/* VISTA UNIFICADA MÓVIL Y ESCRITORIO */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-50 dark:bg-dark-950">
        
        {/* LADO IZQUIERDO: CALENDARIO MENSUAL DESKTOP (Solo visible en PC md:block) */}
        <div className="hidden md:flex md:flex-1 p-3.5 sm:p-6 overflow-y-auto flex-col bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-white/5 shrink-0">
            <div className="w-full max-w-4xl mx-auto flex flex-col">
              
              {/* Navegación del Mes & Controles */}
              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white flex items-center space-x-2">
                  <CalendarIcon className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="capitalize">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                </h3>

                {/* Leyenda Explicativa de Colores */}
                <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-bold text-slate-600 dark:text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>🏢 Presencial</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/30">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>💻 Virtual</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>📞 Llamada</span>
                  </span>
                </div>
                
                <div className="flex space-x-1.5">
                  <button 
                    type="button" 
                    onClick={handlePrevMonth}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
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
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-750 dark:text-slate-250 cursor-pointer active:scale-95 transition-all"
                  >
                    Hoy
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNextMonth}
                    className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
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
                  if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/20 dark:bg-white/[0.01] rounded-2xl border border-transparent w-full min-h-[105px] sm:min-h-[125px]"></div>;
                  
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
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer min-h-[105px] sm:min-h-[125px] relative overflow-hidden group ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-xl shadow-emerald-500/10 scale-[1.01] z-10'
                          : isTdy
                            ? 'bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent border-2 border-blue-500 text-blue-950 dark:text-blue-200 shadow-md'
                            : 'bg-white dark:bg-dark-900/90 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:shadow-lg'
                      }`}
                    >
                      {/* Encabezado del día: Número y Insignia Pequeña de # Citas */}
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs sm:text-sm font-black tracking-tight flex items-center justify-center ${
                          isTdy 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-lg shadow-sm text-[11px]' 
                            : isSelected
                              ? 'text-emerald-700 dark:text-emerald-400 text-sm font-black'
                              : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {day.getDate()}
                        </span>

                        {/* Insignia Pequeña Elegante de # Citas Totales */}
                        {dayApps.length > 0 && (
                          <span className={`text-[8.5px] sm:text-[9.5px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                            isSelected 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{dayApps.length} {dayApps.length === 1 ? 'cita' : 'citas'}</span>
                          </span>
                        )}
                      </div>

                      {/* Indicador Ejecutivo 100% Completo y Visible en Cualquier Dispositivo */}
                      {dayApps.length > 0 && (
                        <div className="mt-1 flex flex-col gap-1 w-full flex-1 justify-end">
                          <div className="flex flex-col gap-0.5 w-full">
                            {presencialCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-black bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>🏢</span>
                                  <span className="truncate">Presencial</span>
                                </span>
                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
                                  {presencialCount}
                                </span>
                              </div>
                            )}

                            {virtualCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-black bg-blue-500/15 text-blue-950 dark:text-blue-200 border border-blue-500/30 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>💻</span>
                                  <span className="truncate">Virtual</span>
                                </span>
                                <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
                                  {virtualCount}
                                </span>
                              </div>
                            )}

                            {llamadaCount > 0 && (
                              <div className="w-full px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9.5px] font-black bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border border-indigo-500/30 flex items-center justify-between gap-1 shadow-2xs">
                                <span className="truncate flex items-center gap-1">
                                  <span>📞</span>
                                  <span className="truncate">Llamada</span>
                                </span>
                                <span className="bg-indigo-600 text-white px-1.5 py-0.2 rounded-full text-[8px] sm:text-[8.5px] font-mono font-black flex-shrink-0">
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
          <div className="w-full md:w-96 bg-slate-50/80 dark:bg-dark-950 p-4 sm:p-6 pb-36 md:pb-6 flex flex-col overflow-y-auto md:overflow-y-auto">
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
                    <div className="p-5 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-center bg-white/50 dark:bg-dark-900/10">
                      <CalendarIcon className="w-8 h-8 text-slate-355 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-450 dark:text-slate-500 italic">No hay citas agendadas para este día.</p>
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
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm flex items-start space-x-3.5 group relative cursor-pointer hover:border-emerald-500/50 hover:shadow-md hover:scale-[1.01] transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                            {getLeadName(app.contact_id)}
                          </h4>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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
                              <span className={`px-2.5 py-0.5 rounded-full font-black text-[9.5px] ${
                                sideType === 'PRESENCIAL' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' :
                                sideType === 'LLAMADA' ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30' :
                                'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30'
                              }`}>
                                {sideType === 'PRESENCIAL' ? '🏢 PRESENCIAL (SHOWROOM)' : sideType === 'LLAMADA' ? '📞 LLAMADA TELEFÓNICA' : '💻 VIRTUAL (MEET)'}
                              </span>
                            );
                          })()}
                        </div>
                        {app.notes && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl italic">
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
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
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
            <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-5 space-y-2">
            <button
              onClick={() => setShowHolidayModal(true)}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold py-2.5 px-4 rounded-xl border border-amber-500/30 text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span>⚙️ Configurar Horario Excepcional / Festivo</span>
            </button>

            <button
              onClick={() => {
                setSelectedSlot('');
                setSelectedLeadId('');
                setShowAddModal(true);
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Horario Excepcional para Fecha Específica</span>
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5 capitalize">
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
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
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
                  className="p-2.5 rounded-xl border text-xs font-semibold text-left bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
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
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-white/5">
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-md flex items-center space-x-1.5 cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
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
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
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
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50"
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
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
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
                                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
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
                              <div key={dateStr} className="space-y-1.5 border-b border-slate-100 dark:border-white/5 pb-2.5 last:border-b-0">
                                <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider capitalize">{formattedHeader}</h5>
                                <div className="grid grid-cols-3 gap-2">
                                  {grouped[dateStr].map(slot => (
                                    <button
                                      key={slot.datetime}
                                      type="button"
                                      onClick={() => setSelectedSlot(slot.datetime)}
                                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                                        selectedSlot === slot.datetime
                                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
                  />
                </div>

                {/* Opciones de Sincronización e Email */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sync_gcal"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-emerald-605 dark:bg-slate-800 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="sync_gcal" className="text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer select-none">
                      Sincronizar con Google Calendar
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="send_email_notif"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-emerald-605 dark:bg-slate-800 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="send_email_notif" className="text-xs font-semibold text-slate-600 dark:text-slate-450 cursor-pointer select-none">
                      Enviar propuesta y aviso por correo
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedSlot}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agendar Cita
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuración de Horarios / Disponibilidad (Múltiples Intervalos) */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                <span>Configurar Horarios de Disponibilidad</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Activa los días laborables. Puedes agregar múltiples intervalos de horas por día para excluir tus horas de almuerzo y descansos.
                </p>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {localAvailability.map((d) => (
                    <div 
                      key={d.day_of_week} 
                      className="p-4 rounded-2xl border border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-dark-950/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={d.enabled}
                            onChange={() => toggleDayLocal(d.day_of_week)}
                            className="w-4.5 h-4.5 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {d.name}
                          </span>
                        </div>
                        
                        {d.enabled && (
                          <button
                            type="button"
                            onClick={() => addIntervalLocal(d.day_of_week)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir bloque</span>
                          </button>
                        )}
                      </div>

                      {d.enabled ? (
                        <div className="space-y-2 pl-7">
                          {(d.intervals || []).map((interval, idx) => (
                            <div key={idx} className="flex items-center space-x-2 animate-fade-in">
                              <input
                                type="time"
                                value={interval.start_time}
                                onChange={(e) => updateIntervalTimeLocal(d.day_of_week, idx, 'start_time', e.target.value)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                              />
                              <span className="text-xs text-slate-400">a</span>
                              <input
                                type="time"
                                value={interval.end_time}
                                onChange={(e) => updateIntervalTimeLocal(d.day_of_week, idx, 'end_time', e.target.value)}
                               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                              />
                              
                              {(d.intervals || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIntervalLocal(d.day_of_week, idx)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                  title="Eliminar bloque"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-7 text-xs text-slate-400 italic">No disponible</div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all mt-4"
                >
                  Guardar Horarios
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuración de Horarios / Disponibilidad (Múltiples Intervalos) */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                <span>Configurar Horarios de Disponibilidad</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Activa los días laborables. Puedes agregar múltiples intervalos de horas por día para excluir tus horas de almuerzo y descansos.
                </p>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {localAvailability.map((d) => (
                    <div 
                      key={d.day_of_week} 
                      className="p-4 rounded-2xl border border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-dark-950/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={d.enabled}
                            onChange={() => toggleDayLocal(d.day_of_week)}
                            className="w-4.5 h-4.5 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {d.name}
                          </span>
                        </div>
                        
                        {d.enabled && (
                          <button
                            type="button"
                            onClick={() => addIntervalLocal(d.day_of_week)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir bloque</span>
                          </button>
                        )}
                      </div>

                      {d.enabled ? (
                        <div className="space-y-2 pl-7">
                          {(d.intervals || []).map((interval, idx) => (
                            <div key={idx} className="flex items-center space-x-2 animate-fade-in">
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
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                              />
                              <span className="text-xs text-slate-400">a</span>
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
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                              />
                              
                              {(d.intervals || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIntervalLocal(d.day_of_week, idx)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                  title="Eliminar bloque"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pl-7 text-xs text-slate-400 italic">No disponible</div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md active:scale-[0.98] transition-all mt-4"
                >
                  Guardar Horarios
                </button>
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
