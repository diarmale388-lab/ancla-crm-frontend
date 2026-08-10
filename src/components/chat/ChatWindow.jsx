import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import { MessageBubble } from './MessageBubble';
import { Send, Bot, WifiOff, MessageCircle, Sparkles, User, Phone, Mail, Calendar, Check, ChevronDown, BookOpen, Clock, Lock, Trash2, ShieldAlert, ArrowLeft, CornerUpLeft, Forward, Pencil, X, Download, Smile, Paperclip, Upload, Search } from 'lucide-react';

export const ChatWindow = () => {
  const { 
    selectedContactId, 
    setSelectedContactId,
    contacts, 
    messages, 
    agents,
    sendMessage, 
    sendMediaMessage,
    toggleChatbot,
    updateContactStage,
    sendProposalWithAi,
    assignContact,
    fetchAgents,
    typingContacts,
    wsConnected,
    deleteMessage,
    editMessage,
    deleteContact,
    updateContactDetails
  } = useChatStore();

  const { 
    slots, 
    appointments,
    fetchSlots, 
    bookAppointment, 
    fetchAppointments: listAppointments,
    deleteAppointment,
    loading: calLoading 
  } = useCalendarStore();

  const { 
    quickReplies, 
    fetchQuickReplies 
  } = useSettingsStore();

  const { 
    stages, 
    fetchStages 
  } = useKanbanStore();

  const currentUser = useAuthStore(state => state.user);

  const [inputMessage, setInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiTriggering, setAiTriggering] = useState(false);
  
  // Notas Internas vs WhatsApp
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [noteCategory, setNoteCategory] = useState('general');

  // Ficha 360° Modal & Pestañas del Panel Derecho (Lead, Cotizador, Agenda)
  const [showFichaModal360, setShowFichaModal360] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState('lead'); // 'lead', 'cotizador', 'agenda'

  // Buscador de mensajes tipo WhatsApp (dentro del chat)
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [msgSearchTerm, setMsgSearchTerm] = useState('');

  // Estados para acciones de mensajes (WhatsApp)
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedContactId) return;
    
    let mediaType = 'document';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }
    
    await sendMediaMessage(selectedContactId, file, mediaType);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !selectedContactId) return;

    let mediaType = 'document';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('audio/')) {
      mediaType = 'audio';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }
    
    await sendMediaMessage(selectedContactId, file, mediaType);
  };

  // Lista ordenada de imágenes en el chat actual para navegación del visor (lightbox)
  const chatImages = (messages || [])
    .filter(msg => {
      const typeLower = (msg.message_type || '').toLowerCase();
      return typeLower === 'image' && msg.content.includes('[Media ID:');
    })
    .map(msg => {
      const match = msg.content.match(/\[Media ID:\s*([^\]]+)\]/);
      return match ? `${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/media/${match[1]}` : null;
    })
    .filter(Boolean);

  // Fecha seleccionada para agendamiento rápido
  const [selectedBookingDate, setSelectedBookingDate] = useState('');

  // Estados para Timeline de Actividades y Notas Internas
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchActivities = async () => {
    if (!selectedContactId) return;
    setLoadingActivities(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${selectedContactId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error loading lead activities:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleAddNoteSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newNote.trim() || !selectedContactId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${selectedContactId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note: newNote.trim() })
      });
      if (res.ok) {
        setNewNote('');
        fetchActivities();
      }
    } catch (err) {
      console.error("Error adding internal note:", err);
    }
  };

  // Control de visibilidad del panel lateral derecho (responsivo)
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowRightSidebar(false);
      } else {
        setShowRightSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cotizador Personalizado & Propuesta PDF (ANCLA Special Projects)
  const [proposalModel, setProposalModel] = useState('FLEX HOME 56m²');
  const [proposalBasePrice, setProposalBasePrice] = useState(25000);
  const [proposalExtraDeck, setProposalExtraDeck] = useState(true);
  const [proposalExtraSolar, setProposalExtraSolar] = useState(false);
  const [proposalExtraClima, setProposalExtraClima] = useState(true);
  const [proposalFreightCity, setProposalFreightCity] = useState('');
  const [proposalFreightCost, setProposalFreightCost] = useState(800);
  const [proposalDiscount, setProposalDiscount] = useState(5);
  const [proposalPaymentTerms, setProposalPaymentTerms] = useState('60% Anticipo, 40% contra entrega');
  const [proposalNotes, setProposalNotes] = useState('Garantía estructural de 5 años. Transporte e instalación incluidos.');

  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [pdfPath, setPdfPath] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const [recipientEmail, setRecipientEmail] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleGenerateCustomProposal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedContactId) return;

    setProposalLoading(true);
    setProposalError('');
    setProposalSuccess('');
    setPdfUrl('');
    setPdfPath('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/proposals/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_id: selectedContactId,
          model_name: proposalModel,
          base_price: parseFloat(proposalBasePrice),
          extra_deck: proposalExtraDeck,
          deck_cost: 3500,
          extra_solar: proposalExtraSolar,
          solar_cost: 2800,
          extra_clima: proposalExtraClima,
          clima_cost: 1200,
          freight_city: proposalFreightCity || 'Por definir',
          freight_cost: parseFloat(proposalFreightCost),
          discount_pct: parseFloat(proposalDiscount),
          payment_terms: proposalPaymentTerms,
          custom_notes: proposalNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProposalSuccess(`¡Propuesta generada por $${data.total_final.toLocaleString()} USD!`);
        setPdfPath(data.file_path);
        setPdfUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}${data.download_url}`);
        const currentActive = contacts.find((c) => c.id === selectedContactId);
        if (currentActive?.email) {
          setRecipientEmail(currentActive.email);
        }
        fetchActivities();
      } else {
        setProposalError(data.detail || "Error al generar la propuesta.");
      }
    } catch (err) {
      console.error(err);
      setProposalError("Error de conexión al servidor.");
    } finally {
      setProposalLoading(false);
    }
  };

  const handleSendEmailProposal = async (e) => {
    if (e) e.preventDefault();
    if (!recipientEmail || !pdfPath) return;

    setEmailSending(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/proposals/send_email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_id: selectedContactId,
          recipient_email: recipientEmail,
          proposal_pdf_path: pdfPath,
          custom_meeting_notes: meetingNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEmailSuccess("¡Correo despachado con éxito! La IA redactó el cuerpo adaptado a la reunión.");
        fetchActivities();
      } else {
        setEmailError(data.detail || "Error al despachar el correo.");
      }
    } catch (err) {
      console.error(err);
      setEmailError("Error de conexión al servidor.");
    } finally {
      setEmailSending(false);
    }
  };

  const [showTemplates, setShowTemplates] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('Cita agendada de forma rápida desde el panel de Chat.');
  const [successBooking, setSuccessBooking] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalDateStr, setSelectedCalDateStr] = useState('');
  const [selectedCalTime, setSelectedCalTime] = useState('10:00');

  const messagesEndRef = useRef(null);

  const activeContact = contacts.find((c) => c.id === selectedContactId);
  const isTyping = typingContacts[selectedContactId];

  // Citas agendadas de este contacto en particular
  const contactAppointments = appointments.filter(
    (app) => app.contact_id === selectedContactId && app.status === 'CONFIRMED'
  );

  // Auto-scroll inteligente: solo desplaza si el usuario está cerca del fondo o al cambiar de contacto
  const chatContainerRef = useRef(null);
  const prevContactIdRef = useRef(null);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    const isNewContact = prevContactIdRef.current !== selectedContactId;
    prevContactIdRef.current = selectedContactId;

    if (isNewContact) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      return;
    }

    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, selectedContactId]);

  // Cargar información lateral y plantillas
  useEffect(() => {
    if (selectedContactId) {
      fetchSlots(selectedContactId);
      fetchQuickReplies();
      fetchStages();
      fetchAgents();
      listAppointments();
      fetchActivities();
      setSuccessBooking('');
      setPdfUrl('');
      setProposalSuccess('');
      setIsInternalNote(false);
    }
  }, [selectedContactId]);

  // Inicializar fecha seleccionada de agendamiento cuando se cargan los slots
  useEffect(() => {
    if (slots && slots.length > 0) {
      const dates = Array.from(new Set(slots.map(s => s.datetime.split('T')[0]))).sort();
      if (dates.length > 0 && !dates.includes(selectedBookingDate)) {
        setSelectedBookingDate(dates[0]);
      }
    } else {
      setSelectedBookingDate('');
    }
  }, [slots]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    
    let finalContent = inputMessage.trim();

    if (editingMessage) {
      await editMessage(editingMessage.id, finalContent);
      setEditingMessage(null);
      setInputMessage('');
      return;
    }

    if (replyingTo) {
      const authorName = replyingTo.sender_type === 'user' ? 'Asesor' : 
                         replyingTo.sender_type === 'ai' ? 'Chatbot' : 'Cliente';
      // Limpiar prefijos de citas anteriores para evitar anidaciones infinitas y cortar a 60 caracteres
      const cleanSnippet = replyingTo.content.replace(/^>.*?\n\n/s, '').slice(0, 60);
      finalContent = `> En respuesta a ${authorName}: "${cleanSnippet}"\n\n${finalContent}`;
      setReplyingTo(null);
    }
    
    if (isInternalNote && noteCategory !== 'general') {
      const categoryLabels = {
        urgente: '🚨 [URGENTE]',
        comercial: '💼 [COMERCIAL]',
        soporte: '🔧 [SOPORTE]'
      };
      finalContent = `${categoryLabels[noteCategory]} ${finalContent}`;
    }

    sendMessage(selectedContactId, finalContent, isInternalNote);
    setInputMessage('');
    setAiSuggestion('');
    setShowTemplates(false);
    setIsInternalNote(false);
    setNoteCategory('general');
  };

  const triggerAiSuggestion = async () => {
    if (!activeContact) return;
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${selectedContactId}/copilot`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.suggestion);
      } else {
        setAiSuggestion("¿Te gustaría agendar una llamada de 15 minutos para ver los detalles técnicos de la FLEX HOME?");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setInputMessage(aiSuggestion);
      setAiSuggestion('');
    }
  };

  const handleTriggerAiResponse = async () => {
    if (!activeContact || aiTriggering) return;
    setAiTriggering(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/chats/${activeContact.id}/trigger-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchContacts();
        fetchMessages(activeContact.id);
      } else {
        const errData = await res.json();
        alert("Error al forzar la IA: " + (errData.detail || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error forzando respuesta de la IA:", err);
      alert("Error de conexión al forzar la IA.");
    } finally {
      setAiTriggering(false);
    }
  };

  // Reemplazo de Variables Inteligentes en Respuestas Rápidas
  const handleQuickReplySelect = (text) => {
    let replacedText = text;
    if (activeContact) {
      const clientName = activeContact.first_name || 'cliente';
      replacedText = replacedText.replace(/\{\{\s*cliente\s*\}\}/gi, clientName);
    }
    if (currentUser) {
      const agentName = currentUser.full_name || 'asesor';
      replacedText = replacedText.replace(/\{\{\s*vendedor\s*\}\}/gi, agentName);
    }
    setInputMessage(replacedText);
    setShowTemplates(false);
  };

  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const WEEK_DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); 
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPast = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    if (!date || isPast(date)) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setSelectedCalDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleConfirmCalendarBooking = () => {
    if (!selectedCalDateStr || !selectedCalTime) return;
    handleBookFast(`${selectedCalDateStr}T${selectedCalTime}:00`);
    setShowCalendarModal(false);
  };

  const handleBookFast = async (datetime) => {
    const success = await bookAppointment(selectedContactId, datetime, appointmentNotes);
    if (success) {
      setSuccessBooking('¡Cita agendada con éxito!');
      fetchSlots(selectedContactId);
      listAppointments();
      setTimeout(() => setSuccessBooking(''), 3000);
    }
  };

  const handleCancelAppointment = async (appId) => {
    const success = await deleteAppointment(appId, selectedContactId);
    if (success) {
      listAppointments();
    }
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    setProposalLoading(true);
    setProposalSuccess('');
    setPdfUrl('');
    const res = await sendProposalWithAi(selectedContactId, proposalModel, proposalExtras, proposalDiscount);
    setProposalLoading(false);
    if (res && res.status === 'success') {
      setProposalSuccess('¡Propuesta enviada por Email y WhatsApp!');
      setPdfUrl(res.pdf_url);
      setProposalExtras('');
      setProposalDiscount(0);
    }
  };

  if (!selectedContactId || !activeContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#0b141a] text-slate-600 dark:text-slate-300 select-none border-l border-slate-200 dark:border-[#222e35] h-full transition-colors duration-300">
        <div className="flex flex-col items-center max-w-md text-center space-y-7">
          {/* Premium Corporate Logo branding */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-80 h-auto p-4 bg-transparent animate-fade-in">
              <img 
                src="/logo_ancla.png" 
                className="w-full h-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen" 
                alt="ANCLA Special Projects" 
              />
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2"></div>
          </div>

          {/* Text Descriptions */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans tracking-wide">
              ANCLA Special Projects CRM
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
              Gestiona leads, coordina llamadas comerciales, agenda reuniones rápidas y envía cotizaciones profesionales asistidas por IA.
            </p>
          </div>

          {/* Bottom actions */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/5 w-full flex items-center justify-center space-x-12 text-[12px] font-bold text-slate-500 dark:text-slate-400">
            <button 
              onClick={() => alert("Función: Selecciona un chat de la lista izquierda para comenzar a redactar y enviar propuestas comerciales.")} 
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Gestión de Documentos</span>
            </button>
            
            <button 
              onClick={() => {
                const phone = prompt("Ingresa el número de teléfono del contacto (ej: +57...):");
                if (phone) {
                  alert("Agregando contacto: " + phone);
                }
              }} 
              className="flex items-center space-x-2 hover:text-[#00a884] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#667781]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <span>Añadir contacto</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 dark:bg-dark-950 relative">
      
      {/* 2/3: Ventana de Chat Principal */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 flex flex-col h-full bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-white/5 overflow-hidden relative"
      >
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-600/10 dark:bg-emerald-500/25 border-4 border-dashed border-emerald-500 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none animate-fade-in">
            <Upload className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Arrastra y suelta tu archivo aquí para enviarlo</p>
          </div>
        )}
        
        {/* Header del Chat */}
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            {/* Botón de Atrás (solo móvil/tablet) */}
            <button
              onClick={() => setSelectedContactId(null)}
              className="md:hidden p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mr-2.5 active:scale-95 transition-all cursor-pointer"
              title="Volver a los chats"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* Avatar del contacto en el Header */}
            <div className="relative mr-3 flex-shrink-0">
              {activeContact.avatar_url ? (
                <img 
                  src={activeContact.avatar_url} 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                  alt="Perfil"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#dfe5e7] dark:bg-slate-700 flex items-end justify-center overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0 select-none">
                  <svg className="w-7 h-7 text-[#a9b7be] dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {activeContact.first_name ? `${activeContact.first_name} ${activeContact.last_name || ''}`.trim() : activeContact.phone}
                </h3>
                {activeContact.qualification_level && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold border ${
                    activeContact.qualification_level === 'potencial' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                    activeContact.qualification_level === 'explorador' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                    'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                  }`}>
                    {activeContact.qualification_level === 'potencial' ? '🟢 Potencial' : activeContact.qualification_level === 'explorador' ? '🟡 Explorador' : '🔴 Curioso'}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>{activeContact.interest_product ? `Interés: ${activeContact.interest_product}` : 'ANCLA Special Projects'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Re-asignación Rápida de Vendedor (Escondida en pantallas extra pequeñas para ahorrar espacio) */}
            <div className="hidden xs:flex items-center space-x-1.5 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <select
                value={activeContact.assigned_user_id || ''}
                onChange={(e) => assignContact(activeContact.id, e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-slate-600 dark:text-slate-350 focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="">Sin Asignar</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                ))}
              </select>
            </div>

            {/* Piloto Automático Switch */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-50 dark:bg-white/5 px-2.5 sm:py-1.5 py-1 rounded-xl border border-slate-200 dark:border-white/5">
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline text-[10px] font-bold text-slate-600 dark:text-slate-300">Piloto IA</span>
              <input
                type="checkbox"
                checked={activeContact.chatbot_enabled}
                onChange={(e) => toggleChatbot(activeContact.id, e.target.checked)}
                className="w-8 h-4 rounded-full bg-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Botón para Forzar Respuesta de IA */}
            <button
              type="button"
              onClick={handleTriggerAiResponse}
              disabled={aiTriggering}
              className={`flex items-center space-x-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                aiTriggering 
                  ? 'bg-emerald-700/50 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer'
              }`}
              title="Fuerza a Sofi IA a responder ahora mismo al último mensaje del cliente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sofi: Responder</span>
            </button>

            {/* Botón Eliminar Chat / Borrar conversación */}
            <button
              onClick={async () => {
                if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el chat con ${activeContact.first_name || activeContact.phone}? Esta acción borrará todo su historial.`)) {
                  const success = await deleteContact(activeContact.id);
                  if (success) {
                    alert("Chat eliminado correctamente.");
                  }
                }
              }}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Eliminar Chat y Borrar Conversación"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Botón para buscar mensajes en la conversación (Tipo WhatsApp) */}
            <button
              onClick={() => {
                setShowMsgSearch(!showMsgSearch);
                if (showMsgSearch) setMsgSearchTerm('');
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                showMsgSearch
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title="Buscar mensajes en esta conversación"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Botón para alternar panel derecho */}
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                showRightSidebar
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title={showRightSidebar ? "Ocultar Detalles" : "Mostrar Detalles"}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buscador de mensajes tipo WhatsApp (dentro del chat) */}
        {showMsgSearch && (
          <div className="bg-[#f0f2f5] dark:bg-[#111b21] px-4 py-2.5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between animate-fade-in shadow-inner z-10">
            <div className="relative flex-1 mr-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#667781]" />
              <input
                type="text"
                placeholder="Buscar mensaje en este chat..."
                value={msgSearchTerm}
                onChange={(e) => setMsgSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-white dark:bg-[#202c33] border border-slate-300 dark:border-white/10 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 dark:text-white placeholder-[#667781] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {msgSearchTerm && (
                <button
                  onClick={() => setMsgSearchTerm('')}
                  className="absolute right-2.5 top-2 text-[#667781] hover:text-[#3b4a54] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => { setShowMsgSearch(false); setMsgSearchTerm(''); }}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Mensajes del Chat */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95 bg-[radial-gradient(#e5ddd5_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          {(msgSearchTerm.trim() ? messages.filter(m => (m.content || '').toLowerCase().includes(msgSearchTerm.trim().toLowerCase())) : messages).map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onImageClick={setLightboxUrl}
              onReply={setReplyingTo}
              onForward={setForwardingMessage}
              onEdit={(m) => {
                setEditingMessage(m);
                setInputMessage(m.content);
              }}
              onDelete={deleteMessage}
            />
          ))}

          {msgSearchTerm.trim() && messages.filter(m => (m.content || '').toLowerCase().includes(msgSearchTerm.trim().toLowerCase())).length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-dark-900/60 rounded-2xl border border-slate-200/60 dark:border-white/5 mx-auto max-w-sm my-10 backdrop-blur-sm">
              <Search className="w-10 h-10 mb-2.5 text-slate-400 opacity-60" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No se encontraron resultados</p>
              <p className="text-xs text-slate-500 mt-0.5">No hay mensajes que coincidan con &ldquo;{msgSearchTerm}&rdquo; en esta conversación.</p>
            </div>
          )}

          {/* Animación "IA Redactando..." */}
          {isTyping && (
            <div className="flex justify-start items-end space-x-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-350 max-w-[70%] border border-emerald-500/10">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="italic font-medium">IA de ANCLA está redactando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias de copiloto */}
        {aiSuggestion && (
          <div className="p-3 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-t border-emerald-500/20 animate-fade-in flex items-center justify-between">
            <div className="flex items-start space-x-2 min-w-0 pr-4">
              <Bot className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Sugerencia del Copiloto</span>
                <p className="text-xs text-slate-700 dark:text-slate-350 italic truncate">"{aiSuggestion}"</p>
              </div>
            </div>
            <button
              onClick={applyAiSuggestion}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Input y Panel de Respuestas Rápidas */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900 relative">
          
          {/* Popover de Respuestas Rápidas */}
          {showTemplates && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-20 p-3 space-y-2 animate-fade-in max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1 mb-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Plantillas con Etiquetas Inteligentes</span>
                </h4>
                <span className="text-[8px] text-slate-400 bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                  Autocompleta: {"{{cliente}}"} y {"{{vendedor}}"}
                </span>
              </div>
              {quickReplies.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-1">No hay plantillas configuradas en Ajustes.</p>
              ) : (
                <div className="grid gap-1.5">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() => handleQuickReplySelect(reply.content)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs text-slate-770 dark:text-slate-300 border border-slate-100 dark:border-white/5 transition-all"
                    >
                      <span className="font-bold text-blue-600 dark:text-sky-400 block mb-0.5">{reply.title}</span>
                      <span className="truncate block opacity-85">{reply.content}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Popover de Emojis */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-4 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-20 p-3.5 animate-fade-in max-w-[260px] w-full">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1.5 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emojis del Asesor</span>
                <button 
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2 text-xl select-none">
                {["😀", "😂", "🤣", "😍", "👍", "🙏", "❤️", "🔥", "👏", "🎉", "🚀", "💡", "💼", "🚨", "📞", "✉️", "🤝", "🏡"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputMessage(prev => prev + emoji);
                    }}
                    className="hover:scale-125 transition-transform duration-100 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-white/5 text-center cursor-pointer active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicadores de Edición o Respuesta */}
          {editingMessage && (
            <div className="mb-2 p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-350 flex items-center justify-between animate-fade-in shadow-sm">
              <span className="flex items-center space-x-1.5 font-semibold">
                <Pencil className="w-3.5 h-3.5 animate-pulse" />
                <span>Editando tu mensaje anterior...</span>
              </span>
              <button 
                type="button"
                onClick={() => {
                  setEditingMessage(null);
                  setInputMessage('');
                }}
                className="p-1 hover:bg-amber-500/20 rounded transition-colors text-amber-700 dark:text-amber-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {replyingTo && (
            <div className="mb-2 p-2 px-3 rounded-xl bg-blue-500/10 border border-blue-300 dark:border-blue-550/20 text-xs text-blue-850 dark:text-blue-350 flex items-center justify-between animate-fade-in shadow-sm">
              <span className="flex items-center space-x-1.5 min-w-0 pr-4 font-semibold">
                <CornerUpLeft className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Respondiendo a: "{replyingTo.content.replace(/^>.*?\n\n/s, '').slice(0, 60)}"</span>
              </span>
              <button 
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-blue-550/20 rounded transition-colors text-blue-705 dark:text-blue-400 flex-shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Selector de modo de mensaje (Enviar WhatsApp vs Nota Interna) */}
          <div className="flex items-center space-x-1.5 mb-3 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-max border border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsInternalNote(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                !isInternalNote
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/5'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              <span>Enviar WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInternalNote(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                isInternalNote
                  ? 'bg-amber-500 text-white shadow-sm border border-amber-400/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Nota Interna (Privada)</span>
            </button>
          </div>

          {/* Card premium interactivo de Nota Interna */}
          {isInternalNote && (
            <div className="mb-3.5 p-4 bg-gradient-to-tr from-amber-500/10 to-amber-600/5 border border-amber-300 dark:border-amber-500/20 rounded-2xl animate-fade-in space-y-3 shadow-sm shadow-amber-500/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Redactando Nota de: {currentUser?.full_name || 'Asesor'}</span>
                </span>
                <span className="text-[9px] font-bold text-amber-700 dark:text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  🔒 Privado para el equipo
                </span>
              </div>
              
              {/* Categorías de Nota (Pills) */}
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Clasificación:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'general', label: 'General', style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/5' },
                    { id: 'urgente', label: '🚨 Urgente', style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-550/20' },
                    { id: 'comercial', label: '💼 Comercial', style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-550/20' },
                    { id: 'soporte', label: '🔧 Soporte', style: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-550/20' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNoteCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-[0.97] ${
                        noteCategory === cat.id
                          ? cat.id === 'urgente' ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-550/20' :
                            cat.id === 'comercial' ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-650/20' :
                            cat.id === 'soporte' ? 'bg-orange-550 text-white border-orange-600 shadow-sm shadow-orange-600/20' :
                            'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm border-transparent'
                          : `${cat.style} hover:opacity-90`
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center space-x-2">
            
            {/* Botón de Plantillas */}
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2.5 rounded-xl border transition-all ${
                showTemplates 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title="Respuestas Rápidas"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Botón de Emojis */}
            {!isInternalNote && (
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2.5 rounded-xl border transition-all ${
                  showEmojiPicker 
                    ? 'bg-amber-500 border-amber-550 text-white shadow-md animate-pulse'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
                title="Insertar Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            )}

            {/* Botón de Adjuntar Archivo */}
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer active:scale-95"
              title="Adjuntar Imagen, Audio o PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />

            <input
              type="text"
              placeholder={isInternalNote ? "Escribe una nota interna para el equipo (Privada)..." : "Escribe un mensaje de WhatsApp..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                isInternalNote 
                  ? 'bg-amber-500/5 border-amber-300 focus:border-amber-500 text-slate-800 dark:text-amber-100'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-855 dark:text-white focus:border-emerald-500/50'
              }`}
            />

            {/* Copiloto disparador */}
            {!isInternalNote && (
              <button
                type="button"
                onClick={triggerAiSuggestion}
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                title="Copiloto de IA"
              >
                <Bot className={`w-4 h-4 ${aiLoading ? 'animate-spin text-emerald-500' : ''}`} />
              </button>
            )}

            <button
              type="submit"
              className={`p-2.5 rounded-xl text-white shadow-md transition-all ${
                isInternalNote 
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3/3: Panel Lateral Derecho - Ficha de Contacto & Herramientas (320px) */}
      <div 
        className={`flex flex-col border-l border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 transition-all ${
          showRightSidebar ? 'flex animate-fade-in' : 'hidden'
        } lg:relative absolute right-0 top-0 w-80 sm:w-88 h-full z-20 shadow-2xl lg:shadow-none`}
      >
        {/* Header Fijo Sticky (Avatar, Nombre, Matriz 1-Clic y 3 Pestañas Superiores) */}
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Ficha & Herramientas</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowRightSidebar(false)}
              className="xl:hidden p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 cursor-pointer transition-all"
              title="Cerrar Detalles"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Resumen Fijo de Contacto */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="relative flex-shrink-0">
              {activeContact.avatar_url ? (
                <img src={activeContact.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10" alt="Avatar" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {activeContact.first_name ? activeContact.first_name[0] : 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {activeContact.first_name ? `${activeContact.first_name} ${activeContact.last_name || ''}`.trim() : activeContact.phone}
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                  #{activeContact.id}
                </span>
              </div>
              <span className="text-[10.5px] text-slate-400 font-mono block truncate">{activeContact.phone}</span>
            </div>
          </div>

          {/* ⚡ Matriz de Control de Atención Asesor (1-Clic) */}
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={async () => {
                const newStatus = await useKanbanStore.getState().logAdvisorStatus(activeContact.id, 'CONTACT_MADE', '', 'toggle');
                if (typeof newStatus === 'string') {
                  useChatStore.setState(state => ({
                    activeContact: state.activeContact ? { ...state.activeContact, advisor_status: newStatus } : null,
                    contacts: state.contacts.map(c => c.id === activeContact.id ? { ...c, advisor_status: newStatus } : c)
                  }));
                }
                useChatStore.getState().fetchContacts();
              }}
              className={`p-1.5 rounded-lg text-[9.5px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                (activeContact.advisor_status || '').includes('CONTACT_MADE') || (activeContact.advisor_status || '').includes('CONNECTED')
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
              }`}
              title="Contacto Realizado"
            >
              <span>📞 Cont.</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const newStatus = await useKanbanStore.getState().logAdvisorStatus(activeContact.id, 'SHOWROOM_VISITED', '', 'toggle');
                if (typeof newStatus === 'string') {
                  useChatStore.setState(state => ({
                    activeContact: state.activeContact ? { ...state.activeContact, advisor_status: newStatus } : null,
                    contacts: state.contacts.map(c => c.id === activeContact.id ? { ...c, advisor_status: newStatus } : c)
                  }));
                }
                useChatStore.getState().fetchContacts();
              }}
              className={`p-1.5 rounded-lg text-[9.5px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                (activeContact.advisor_status || '').includes('SHOWROOM_VISITED')
                  ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
              }`}
              title="Visita Showroom"
            >
              <span>🏢 Showr.</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const newStatus = await useKanbanStore.getState().logAdvisorStatus(activeContact.id, 'QUOTATION_SENT', '', 'toggle');
                if (typeof newStatus === 'string') {
                  useChatStore.setState(state => ({
                    activeContact: state.activeContact ? { ...state.activeContact, advisor_status: newStatus } : null,
                    contacts: state.contacts.map(c => c.id === activeContact.id ? { ...c, advisor_status: newStatus } : c)
                  }));
                }
                useChatStore.getState().fetchContacts();
              }}
              className={`p-1.5 rounded-lg text-[9.5px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                (activeContact.advisor_status || '').includes('QUOTATION_SENT')
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
              }`}
              title="Propuesta Enviada"
            >
              <span>📄 Prop.</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const newStatus = await useKanbanStore.getState().logAdvisorStatus(activeContact.id, 'NO_ANSWER', '', 'toggle');
                if (typeof newStatus === 'string') {
                  useChatStore.setState(state => ({
                    activeContact: state.activeContact ? { ...state.activeContact, advisor_status: newStatus } : null,
                    contacts: state.contacts.map(c => c.id === activeContact.id ? { ...c, advisor_status: newStatus } : c)
                  }));
                }
                useChatStore.getState().fetchContacts();
              }}
              className={`p-1.5 rounded-lg text-[9.5px] font-bold flex flex-col items-center justify-center border transition-all cursor-pointer ${
                (activeContact.advisor_status || '').includes('NO_ANSWER')
                  ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
              }`}
              title="Sin Respuesta"
            >
              <span>🔴 Sin Rpta</span>
            </button>
          </div>

          {/* 3 Pestañas Superiores de Navegación */}
          <div className="flex bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRightSidebarTab('lead')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                rightSidebarTab === 'lead'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              👤 Lead
            </button>
            <button
              type="button"
              onClick={() => setRightSidebarTab('cotizador')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                rightSidebarTab === 'cotizador'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              📄 Cotizador
            </button>
            <button
              type="button"
              onClick={() => setRightSidebarTab('agenda')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                rightSidebarTab === 'agenda'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              📅 Agenda
            </button>
          </div>
        </div>

        {/* Contenido de la Pestaña Activa con Scroll Limpio */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* PESTAÑA 1: 👤 LEAD (Atribución, Formulario y Sofi AI Score) */}
          {rightSidebarTab === 'lead' && (
            <div className="space-y-4 animate-fade-in">
              {/* Botón Maestro Verde a Ficha 360° */}
              <button
                type="button"
                onClick={() => setShowFichaModal360(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer border border-emerald-500/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Abrir Ficha Técnica Comercial 360°</span>
              </button>

              {/* Atribución Meta Ads & Origen */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Atribución & Origen</span>
                  <span className="text-[9px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-bold">Meta Ads</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {activeContact.source || 'Meta Ads (Campañas Digitales)'}
                </p>
              </div>

              {/* Datos de Terreno & Ubicación */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Terreno Propio</span>
                  <select
                    value={
                      (activeContact.lot_status || '').toLowerCase().includes('sí') || 
                      (activeContact.lot_status || '').toLowerCase().includes('si') || 
                      (activeContact.lot_status || '').toLowerCase().includes('tengo') || 
                      (activeContact.lot_status || '').toLowerCase().includes('propio')
                        ? 'Sí, ya tengo'
                        : (activeContact.lot_status || '').toLowerCase().includes('buscando')
                        ? 'Buscando terreno'
                        : 'Por definir'
                    }
                    onChange={(e) => updateContactDetails(activeContact.id, { lot_status: e.target.value })}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-200 font-bold px-2 py-1 rounded-lg cursor-pointer"
                  >
                    <option value="Por definir">Por definir</option>
                    <option value="Sí, ya tengo">Sí, ya tengo</option>
                    <option value="Buscando terreno">Buscando terreno</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ubicación / Ciudad</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCity = prompt("Ubicación / Municipio del Lote:", activeContact.lot_city || '');
                      if (newCity !== null) {
                        await updateContactDetails(activeContact.id, { lot_city: newCity.trim() });
                      }
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{activeContact.lot_city || 'Por definir'}</span>
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Selector de Etapa Kanban */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Etapa Comercial</span>
                <select
                  value={activeContact.pipeline_stage_id || ''}
                  onChange={(e) => updateContactStage(activeContact.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="">Sin Asignar</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: 📄 COTIZADOR (Motor de PDF y Propuestas Comercial) */}
          {rightSidebarTab === 'cotizador' && (
            <div className="space-y-4 animate-fade-in">
              <form onSubmit={handleGenerateCustomProposal} className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Cotizador Rápido de Casas Modulares</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Modelo de Portafolio</label>
                  <select
                    value={proposalModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProposalModel(val);
                      if (val.includes('56m²')) setProposalBasePrice(25000);
                      else if (val.includes('36m²')) setProposalBasePrice(18500);
                      else if (val.includes('13m²')) setProposalBasePrice(9800);
                      else if (val.includes('26m²')) setProposalBasePrice(15200);
                      else if (val.includes('Frío')) setProposalBasePrice(14000);
                      else if (val.includes('Bodega')) setProposalBasePrice(45000);
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="FLEX HOME 56m²">Flex Home 56m² (Casa Expandible)</option>
                    <option value="FLEX HOME 36m²">Flex Home 36m² (Casa Expandible)</option>
                    <option value="Cápsula LINVIG 13m²">Cápsula Linvig 13m² (Glamping)</option>
                    <option value="Cápsula LINVIG 26m²">Cápsula Linvig 26m² (Glamping Suite)</option>
                    <option value="Llave en Mano">Llave en Mano (Proyecto Integral)</option>
                    <option value="Cuarto Frío Copeland Inverter">Cuarto Frío Modular Copeland</option>
                    <option value="Bodega Galvanizada 1000m²">Bodega Estructural Galvanizada</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Precio Base ($USD)</label>
                    <input
                      type="number"
                      value={proposalBasePrice}
                      onChange={(e) => setProposalBasePrice(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Descuento (%)</label>
                    <input
                      type="number"
                      value={proposalDiscount}
                      onChange={(e) => setProposalDiscount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Switches de Adicionales */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Deck Sintético Exterior</span>
                    <input type="checkbox" checked={proposalExtraDeck} onChange={(e) => setProposalExtraDeck(e.target.checked)} className="rounded text-emerald-600" />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Kit Solar Off-Grid</span>
                    <input type="checkbox" checked={proposalExtraSolar} onChange={(e) => setProposalExtraSolar(e.target.checked)} className="rounded text-emerald-600" />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Climatización A.A.</span>
                    <input type="checkbox" checked={proposalExtraClima} onChange={(e) => setProposalExtraClima(e.target.checked)} className="rounded text-emerald-600" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Ciudad Flete</label>
                    <input
                      type="text"
                      placeholder="ej. Cajicá, Armenia"
                      value={proposalFreightCity}
                      onChange={(e) => setProposalFreightCity(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Flete ($USD)</label>
                    <input
                      type="number"
                      value={proposalFreightCost}
                      onChange={(e) => setProposalFreightCost(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={proposalLoading}
                  className="w-full bg-brand-emerald hover:bg-brand-emeraldHover text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                >
                  {proposalLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generar & Enviar Propuesta/PDF</span>
                    </>
                  )}
                </button>
              </form>

              {/* Formulario de Despacho de Correo redactado por IA */}
              {pdfPath && (
                <div className="space-y-2.5 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enviar Email (Redacción Sofi AI)</span>
                  </span>

                  <form onSubmit={handleSendEmailProposal} className="space-y-2">
                    <input
                      type="email"
                      required
                      placeholder="Correo del cliente (ej. cliente@empresa.com)"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-bold"
                    />
                    <textarea
                      rows="2"
                      placeholder="Notas clave tomadas en la llamada..."
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 resize-none"
                    ></textarea>

                    <button
                      type="submit"
                      disabled={emailSending}
                      className="w-full bg-brand-purple hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      {emailSending ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>Despachar Correo con PDF</span>}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 3: 📅 AGENDA (Citas, Historial y Agendador Rápido) */}
          {rightSidebarTab === 'agenda' && (
            <div className="space-y-4 animate-fade-in">
              <button
                type="button"
                onClick={() => setShowCalendarModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Cita en Calendario</span>
              </button>

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Citas Programadas ({contactAppointments.length})</span>
                {contactAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 rounded-xl">
                    No hay citas activas para este prospecto.
                  </p>
                ) : (
                  contactAppointments.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">{app.type || 'Asesoría Comercial'}</span>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-mono block">
                          {new Date(app.datetime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(app.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Cancelar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Calendario Flotante Premium */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Lado Izquierdo: El Calendario Mensual */}
            <div className="flex-1 p-5 border-r border-slate-100 dark:border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </h3>
                <div className="flex space-x-1">
                  <button 
                    type="button" 
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-550 dark:text-slate-450 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-550 dark:text-slate-450 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEK_DAYS.map((d) => (
                  <span key={d} className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase py-1">{d}</span>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {getDaysInMonth(calendarMonth).map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                  
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                  const isSel = selectedCalDateStr === dateStr;
                  const isPst = isPast(day);
                  const isTdy = isToday(day);

                  return (
                    <button
                      key={`day-${dateStr}`}
                      type="button"
                      disabled={isPst}
                      onClick={() => handleDateSelect(day)}
                      className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer active:scale-95 ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border-emerald-500'
                          : isPst
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : isTdy
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-750 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {isTdy && !isSel && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-1"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lado Derecho: Horas y Confirmación */}
            <div className="w-full md:w-64 p-5 bg-slate-50 dark:bg-slate-950/20 flex flex-col justify-between max-h-[400px] md:max-h-none overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider block">Cliente</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeContact.first_name ? `${activeContact.first_name} ${activeContact.last_name || ''}`.trim() : activeContact.phone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider block">Fecha Seleccionada</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedCalDateStr ? (
                      new Date(selectedCalDateStr + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    ) : (
                      <span className="text-red-500 italic">Ninguna seleccionada</span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-black tracking-wider block mb-1.5">Seleccionar Hora</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((t) => {
                      const isTimeSel = selectedCalTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedCalTime(t)}
                          className={`py-1.5 rounded-lg text-[11px] font-bold text-center border transition-all cursor-pointer ${
                            isTimeSel
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/10'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 mt-4 border-t border-slate-200 dark:border-white/5 flex-shrink-0">
                <button
                  type="button"
                  disabled={!selectedCalDateStr}
                  onClick={handleConfirmCalendarBooking}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-emerald-500/10"
                >
                  Agendar Cita
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-205 dark:bg-white/5 dark:hover:bg-white/10 text-slate-550 dark:text-slate-450 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Visor de imágenes (Lightbox) estilo WhatsApp */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between select-none animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white bg-black/40">
            <span className="text-xs font-bold text-slate-350">Visualizador de Archivos</span>
            <div className="flex items-center space-x-3">
              <a 
                href={lightboxUrl} 
                download 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Descargar imagen"
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={() => setLightboxUrl(null)} 
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo principal con controles de navegación */}
          <div className="flex-1 flex items-center justify-between px-4 sm:px-10 relative">
            {/* Flecha Izquierda */}
            {chatImages.length > 1 && (
              <button 
                onClick={() => {
                  const idx = chatImages.indexOf(lightboxUrl);
                  const prevIdx = idx > 0 ? idx - 1 : chatImages.length - 1;
                  setLightboxUrl(chatImages[prevIdx]);
                }}
                className="p-3.5 rounded-full bg-white/5 hover:bg-white/15 text-white cursor-pointer active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Imagen Principal */}
            <div className="max-w-[85%] max-h-[80vh] flex items-center justify-center">
              <img 
                src={lightboxUrl} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-zoom-in" 
                alt="Vista previa" 
              />
            </div>

            {/* Flecha Derecha */}
            {chatImages.length > 1 && (
              <button 
                onClick={() => {
                  const idx = chatImages.indexOf(lightboxUrl);
                  const nextIdx = idx < chatImages.length - 1 ? idx + 1 : 0;
                  setLightboxUrl(chatImages[nextIdx]);
                }}
                className="p-3.5 rounded-full bg-white/5 hover:bg-white/15 text-white cursor-pointer active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Carrusel de Miniaturas en el Bottom */}
          {chatImages.length > 1 && (
            <div className="flex items-center justify-center p-4 bg-black/60 border-t border-white/5 space-x-2 overflow-x-auto">
              {chatImages.map((imgUrl, i) => {
                const isActive = imgUrl === lightboxUrl;
                return (
                  <img 
                    key={i}
                    src={imgUrl} 
                    onClick={() => setLightboxUrl(imgUrl)}
                    className={`w-12 h-12 object-cover rounded-md cursor-pointer transition-all border-2 ${
                      isActive ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50 hover:opacity-85'
                    }`}
                    alt="Miniatura"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal para Reenviar Mensaje */}
      {forwardingMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Forward className="w-4 h-4 text-blue-500" />
                <span>Reenviar mensaje</span>
              </h3>
              <button 
                onClick={() => setForwardingMessage(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-150 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400 italic max-h-20 overflow-y-auto">
              Mensaje a reenviar: "{forwardingMessage.content.slice(0, 100)}{forwardingMessage.content.length > 100 ? '...' : ''}"
            </div>
            
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Selecciona un contacto para reenviar:</span>
            
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
              {contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    sendMessage(c.id, forwardingMessage.content, false);
                    setForwardingMessage(null);
                    alert(`Mensaje reenviado a ${c.first_name || c.phone} con éxito!`);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-emerald-500 transition-colors">
                      {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.phone}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.phone}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    Enviar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica Comercial 360° */}
      {showFichaModal360 && activeContact && (
        <LeadFichaModal360
          contact={activeContact}
          onClose={() => setShowFichaModal360(false)}
          onRefresh={() => useChatStore.getState().fetchContacts()}
        />
      )}
    </div>
  );
}
