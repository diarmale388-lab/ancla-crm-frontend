import React, { useEffect, useState } from 'react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useChatStore } from '../../store/useChatStore';
import { Calendar as CalendarIcon, Clock, User, Plus, Check, AlertCircle, X, Settings, Trash2, ChevronLeft, ChevronRight, Download, MessageCircle, MapPin, DollarSign, Building, Phone, Mail, ExternalLink, ShieldCheck } from 'lucide-react';

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
  const { leads, fetchLeads } = useKanbanStore();
  const { setActiveTab, fetchMessages } = useChatStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedLeadForFicha, setSelectedLeadForFicha] = useState(null);
  const [selectedApptForFicha, setSelectedApptForFicha] = useState(null);
  
  // Estados de Calendario Mensual Grande
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-hidden transition-colors duration-300">
      {/* Cabecera */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 backdrop-blur-md flex items-center justify-between glass">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Agenda & Citas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Control de citas comerciales y horarios agendados por la IA o de forma manual</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Reporte</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar Horarios</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedSlot('');
              setSelectedLeadId('');
              setShowAddModal(true);
            }}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Grid del Calendario y Detalle Lateral */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Lado Izquierdo: El Calendario Mensual */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col bg-white dark:bg-dark-900">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
            
            {/* Navegación del Calendario */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                <span>{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              </h3>
              
              <div className="flex space-x-1.5">
                <button 
                  type="button" 
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setCurrentMonth(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-750 dark:text-slate-250 cursor-pointer active:scale-95 transition-all"
                >
                  Hoy
                </button>
                <button 
                  type="button" 
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {WEEK_DAYS.map((d) => (
                <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase py-2">{d}</span>
              ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[280px]">
              {getDaysInMonth(currentMonth).map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/20 dark:bg-white/[0.01] rounded-xl border border-transparent w-full aspect-[1.2]"></div>;
                
                const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                const dayApps = getAppointmentsForDate(day);
                const isSelected = selectedDate.toDateString() === day.toDateString();
                const isTdy = day.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={`day-${dateStr}`}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`w-full p-2 sm:p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer active:scale-95 relative aspect-[1.2] ${
                      isSelected
                        ? 'bg-emerald-600/5 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-md shadow-emerald-600/5'
                        : isTdy
                          ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-50/50 dark:bg-dark-950/20 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-[10px] sm:text-xs font-extrabold ${isTdy ? 'bg-blue-500 text-white w-5 h-5 flex items-center justify-center rounded-full -m-1' : ''}`}>{day.getDate()}</span>
                    
                    {/* Citas del día (Listado clásico premium si caben, o contador en pantallas pequeñas) */}
                    {dayApps.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5 w-full overflow-hidden flex-1 justify-end">
                        <span className="xs:hidden flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-black ml-auto">
                          {dayApps.length}
                        </span>
                        
                        <div className="hidden xs:flex flex-col gap-0.5 w-full">
                          {dayApps.slice(0, 2).map((app) => {
                            const apptType = getApptType(app.appointment_type, app.notes);
                            return (
                              <div 
                                key={app.id} 
                                className={`text-[8px] sm:text-[9.5px] truncate px-1.5 py-0.5 rounded border font-bold block ${
                                  apptType === 'PRESENCIAL' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' :
                                  apptType === 'LLAMADA' ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/30' :
                                  'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30'
                                }`}
                              >
                                {apptType === 'PRESENCIAL' ? '🏢 ' : apptType === 'LLAMADA' ? '📞 ' : '💻 '}{getLeadName(app.contact_id).split(' ')[0]} - {formatTime(app.datetime)}
                              </div>
                            );
                          })}
                          {dayApps.length > 2 && (
                            <span className="text-[7.5px] sm:text-[8px] text-slate-400 dark:text-slate-500 font-extrabold pl-1">
                              + {dayApps.length - 2} más
                            </span>
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

        {/* Lado Derecho: Detalle de Citas del Día Seleccionado */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-dark-900/50 p-6 flex flex-col overflow-y-auto">
          <div className="flex-1 space-y-5">
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
                      onClick={() => {
                        if (lead) {
                          setSelectedLeadForFicha(lead);
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
          </div>

          {/* Botón para Agendar Cita en la Fecha Seleccionada */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-5 flex-shrink-0">
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

      {/* Modal Ficha Técnica 360° del Cliente al hacer clic en cualquier Cita */}
      {selectedLeadForFicha && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera Ficha */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/20">
                  {(selectedLeadForFicha.first_name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center space-x-2">
                    <span>{selectedLeadForFicha.first_name} {selectedLeadForFicha.last_name || ''}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ID #{selectedLeadForFicha.id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2">
                    <span>{selectedLeadForFicha.source || 'Meta Ads'}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedLeadForFicha.lot_city || 'Armenia'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedLeadForFicha(null);
                  setSelectedApptForFicha(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Ficha Técnica */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5">
              
              {/* Resumen de la Cita */}
              {selectedApptForFicha && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block">Cita Confirmada</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block mt-0.5">
                        {new Date(selectedApptForFicha.datetime).toLocaleString('es-CO', {
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {modalitySaved && (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-white animate-fade-in flex items-center space-x-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Guardado!</span>
                      </span>
                    )}
                    <select
                      value={getApptType(selectedApptForFicha.appointment_type, selectedApptForFicha.notes)}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setSelectedApptForFicha(prev => ({ ...prev, appointment_type: newType }));
                      }}
                      className={`text-xs font-black px-3.5 py-2 rounded-xl text-white shadow-sm focus:outline-none cursor-pointer border border-white/20 transition-all ${
                        getApptType(selectedApptForFicha.appointment_type, selectedApptForFicha.notes) === 'PRESENCIAL' ? 'bg-emerald-600 hover:bg-emerald-500' :
                        getApptType(selectedApptForFicha.appointment_type, selectedApptForFicha.notes) === 'LLAMADA' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      <option value="PRESENCIAL" className="bg-slate-900 text-white">🏢 VISITA PRESENCIAL (SHOWROOM)</option>
                      <option value="VIRTUAL" className="bg-slate-900 text-white">💻 ASESORÍA VIRTUAL (MEET/ZOOM)</option>
                      <option value="LLAMADA" className="bg-slate-900 text-white">📞 LLAMADA TELEFÓNICA COMERCIAL</option>
                    </select>

                    <button
                      type="button"
                      onClick={async () => {
                        const currentType = getApptType(selectedApptForFicha.appointment_type, selectedApptForFicha.notes);
                        const ok = await updateAppointment(selectedApptForFicha.id, { 
                          appointment_type: currentType,
                          modality: currentType 
                        });
                        if (ok) {
                          await fetchAppointments();
                          setModalitySaved(true);
                          setTimeout(() => setModalitySaved(false), 2500);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer border border-white/10"
                      title="Guardar modalidad elegida"
                    >
                      <span>💾 Guardar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid 2 Columnas Datos Técnicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block">Datos de Contacto</span>
                  
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{selectedLeadForFicha.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{selectedLeadForFicha.email || 'No provisto'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Ubicación Lote: <strong>{selectedLeadForFicha.lot_city || 'Por definir'}</strong></span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500 block">Detalles del Proyecto</span>
                  
                  <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200">
                    <Building className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Propósito / Modelo: <strong>{selectedLeadForFicha.interest_product || 'Vivienda / Campestre'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <DollarSign className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Presupuesto Estimado: <strong>{selectedLeadForFicha.estimated_budget ? `$${Number(selectedLeadForFicha.estimated_budget).toLocaleString()} COP` : 'Por definir en llamada'}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Estado Lote: <strong>{selectedLeadForFicha.lot_status || 'Sí, ya tengo lote'}</strong></span>
                  </div>
                </div>

              </div>

              {/* Formulario Meta Ads & Respuestas Reales del Cliente */}
              {selectedLeadForFicha.qualification_notes && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Información Recogida en Formulario Meta Ads & Chat</span>
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {selectedLeadForFicha.qualification_notes}
                  </p>
                </div>
              )}

            </div>

            {/* Acciones Modal */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadForFicha(null);
                  setSelectedApptForFicha(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cerrar Ficha
              </button>

              <button
                type="button"
                onClick={() => {
                  const leadId = selectedLeadForFicha.id;
                  setSelectedLeadForFicha(null);
                  setSelectedApptForFicha(null);
                  fetchMessages(leadId);
                  setActiveTab('chats');
                }}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir Chat de WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
