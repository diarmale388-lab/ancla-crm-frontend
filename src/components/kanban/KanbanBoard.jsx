import React, { useEffect } from 'react';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageCircle, User, Phone, ArrowRight, Calendar, Bot } from 'lucide-react';

export const KanbanBoard = () => {
  const { stages, leads, fetchStages, fetchLeads, moveLead, loading, error } = useKanbanStore();
  const { appointments, fetchAppointments } = useCalendarStore();
  const { fetchMessages, setActiveTab, toggleChatbot } = useChatStore();
  const [selectedLeadForModal, setSelectedLeadForModal] = React.useState(null);
  const [internalNotes, setInternalNotes] = React.useState([]);
  const [loadingNotes, setLoadingNotes] = React.useState(false);
  const [newNoteText, setNewNoteText] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);

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

  useEffect(() => {
    if (selectedLeadForModal) {
      loadNotes(selectedLeadForModal.id);
    } else {
      setInternalNotes([]);
      setNewNoteText('');
    }
  }, [selectedLeadForModal]);

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

  useEffect(() => {
    fetchStages();
    fetchLeads();
    fetchAppointments();
  }, []);

  // --- Handlers de Drag & Drop Nativos de HTML5 ---
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId.toString());
    e.currentTarget.classList.add('opacity-45');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-45');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necesario para permitir soltar (drop)
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const leadIdStr = e.dataTransfer.getData('text/plain');
    if (leadIdStr) {
      const leadId = parseInt(leadIdStr, 10);
      moveLead(leadId, targetStageId);
    }
  };

  const getLeadsByStage = (stageId) => {
    return leads.filter((l) => l.pipeline_stage_id === stageId);
  };

  if (loading && stages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Cargando Pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-hidden transition-colors duration-300">
      {/* Cabecera del Pipeline */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 backdrop-blur-md flex items-center justify-between glass">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pipeline Comercial</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Arrastra y suelta tus leads para avanzar de fase en el embudo de ventas</p>
        </div>
        <div>
          <button
            onClick={() => setActiveTab('showroom')}
            className="flex items-center gap-1.5 bg-[#008069] dark:bg-[#00a884] hover:bg-[#006e5a] dark:hover:bg-[#008f70] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>🏠</span>
            <span>Showroom Armenia</span>
          </button>
        </div>
      </div>

      {/* Tablero Kanban */}
      <div className="flex-1 flex overflow-x-auto p-6 space-x-4 items-start select-none">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-80 flex-shrink-0 bg-slate-200/50 dark:bg-slate-900/40 rounded-2xl p-4 flex flex-col max-h-[85vh] border border-slate-200/60 dark:border-white/5 glass-card"
            >
              {/* Header de la columna */}
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {stage.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[150px]">
                {stageLeads.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-300 dark:border-white/5 rounded-xl flex items-center justify-center p-4 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">Arrastra prospectos aquí</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isInstagram = lead.source === 'Instagram' || lead.phone.startsWith('IG-');
                    const fullName = lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.phone;
                    const appointment = appointments.find((a) => a.contact_id === lead.id && a.status === 'CONFIRMED');

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLeadForModal(lead)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer active:cursor-grabbing transition-all duration-300 group space-y-3"
                      >
                        {/* Fila Superior: Nombre + Icono de Canal */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs font-black text-slate-800 dark:text-white leading-snug truncate">
                              {fullName}
                            </h4>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block truncate">{lead.phone}</span>
                            </div>
                          </div>
                          
                          {/* Badge de Canal */}
                          <span className={`p-1 rounded-md text-white flex-shrink-0 ${
                            isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-emerald-500'
                          }`}>
                            {isInstagram ? (
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                              </svg>
                            ) : (
                              <MessageCircle className="w-3 h-3" />
                            )}
                          </span>
                        </div>

                        {/* Vista rápida del último mensaje */}
                        {lead.last_message_content && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 text-[10px] text-slate-550 dark:text-slate-450 leading-snug italic line-clamp-2" title={lead.last_message_content}>
                            "{lead.last_message_content}"
                          </div>
                        )}

                        {/* Cita Agendada */}
                        {appointment && (
                          <div className="flex items-center space-x-1.5 text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
                            <Calendar className="w-3 h-3" />
                            <span className="truncate">
                              Reunión: {new Date(appointment.datetime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        {/* Fila Inferior: Fuente y Piloto de IA */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-white/5 text-[9px]">
                          <div className="flex items-center space-x-1.5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                              {lead.source || 'Orgánico'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {lead.chatbot_enabled ? (
                              <span className="flex items-center space-x-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                                <Bot className="w-2.5 h-2.5" />
                                <span>IA Activa</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                                <User className="w-2.5 h-2.5" />
                                <span>Manual</span>
                              </span>
                            )}
                          </div>
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

      {/* Modal de Detalle de Ficha de Lead */}
      {selectedLeadForModal && (() => {
        const lead = selectedLeadForModal;
        const appointment = appointments.find((a) => a.contact_id === lead.id && a.status === 'CONFIRMED');
        const isInstagram = lead.source === 'Instagram' || lead.phone.startsWith('IG-');
        const fullName = lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.phone;
        const getInitials = (fn, ln) => {
          if (!fn) return '?';
          return `${fn[0]}${ln ? ln[0] : ''}`.toUpperCase();
        };

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Ficha del Prospecto
                </h3>
                <button
                  onClick={() => setSelectedLeadForModal(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Contenido principal scrollable */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                
                {/* Header de contacto: Avatar, Nombre, Teléfono, Canal */}
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border shadow-sm ${
                    isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {getInitials(lead.first_name, lead.last_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                      {fullName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">{lead.phone}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                    isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-emerald-500'
                  }`}>
                    {lead.source || 'WhatsApp'}
                  </span>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                {/* Grid de campos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1">Etapa del Embudo</span>
                    <select
                      value={lead.pipeline_stage_id || ''}
                      onChange={(e) => {
                        const targetStageId = parseInt(e.target.value, 10);
                        moveLead(lead.id, targetStageId);
                        setSelectedLeadForModal(prev => ({ ...prev, pipeline_stage_id: targetStageId }));
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-750 dark:text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      {stages.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-1">Origen del Lead</span>
                    <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {lead.source || 'WhatsApp Orgánico'}
                    </div>
                  </div>
                </div>

                {/* Kill Switch de IA */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5">
                  <div>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 block">Piloto Automático de IA</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-0.5">Permite que la IA califique y agende citas automáticamente</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const nextVal = !lead.chatbot_enabled;
                      await toggleChatbot(lead.id, nextVal);
                      setSelectedLeadForModal(prev => ({ ...prev, chatbot_enabled: nextVal }));
                      fetchLeads(); // Sincroniza estado local del Kanban
                    }}
                    className={`relative inline-flex h-6.5 w-11.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      lead.chatbot_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        lead.chatbot_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Cita programada */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Citas y Reuniones</span>
                  {appointment ? (
                    <div className="flex items-center space-x-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2.5 rounded-xl border border-amber-500/20">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Reunión Agendada: {new Date(appointment.datetime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-xl">
                      No hay citas programadas para este prospecto.
                    </p>
                  )}
                </div>

                {/* Vista rápida del último mensaje */}
                {lead.last_message_content && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Último Mensaje</span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-white/5 text-xs text-slate-650 dark:text-slate-350 italic">
                      "{lead.last_message_content}"
                    </div>
                  </div>
                )}

                {/* Notas Internas (Privadas) */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">📝 Notas Privadas / Internas</span>
                  
                  {/* Lista de notas */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {loadingNotes ? (
                      <p className="text-xs text-slate-400 italic">Cargando notas...</p>
                    ) : internalNotes.length === 0 ? (
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-white/5 rounded-xl">
                        No hay notas privadas guardadas para este cliente.
                      </p>
                    ) : (
                      internalNotes.map((note) => (
                        <div key={note.id} className="p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-550/15 dark:border-amber-500/20 rounded-2xl text-[11px] text-slate-750 dark:text-slate-350 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-amber-600 dark:text-amber-400">
                            <span>✍️ Nota de Asesor</span>
                            <span>{new Date(note.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulario de nueva nota */}
                  <form onSubmit={handleAddNote} className="space-y-2 pt-1.5">
                    <textarea
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Escribe un comentario o nota privada para este cliente..."
                      rows="2"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs text-slate-750 dark:text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder-slate-400"
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingNote || !newNoteText.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-250 dark:disabled:bg-slate-800 disabled:text-slate-400 text-dark-950 font-bold rounded-xl text-[11px] cursor-pointer transition-all active:scale-[0.98] flex items-center space-x-1 shadow-sm"
                      >
                        {savingNote ? 'Guardando...' : '➕ Guardar Nota Privada'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Footer de Acciones */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    fetchMessages(lead.id); // Seleccionar y cargar historial
                    setActiveTab('chats'); // Redirigir al chat
                    setSelectedLeadForModal(null); // Cerrar modal
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold py-2.5 px-4 rounded-2xl text-xs cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 Abrir en Ventana de Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeadForModal(null)}
                  className="py-2.5 px-5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/5 rounded-2xl text-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
