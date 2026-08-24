import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useKanbanStore } from '../../store/useKanbanStore';
import { useAuthStore } from '../../store/useAuthStore';
import LeadFichaModal360 from '../common/LeadFichaModal360';
import EmailPreviewModal from '../common/EmailPreviewModal';
import AnclaTechnicalDossier from '../common/AnclaTechnicalDossier';
import SpecialAppointmentBanner from './SpecialAppointmentBanner';
import { MessageBubble } from './MessageBubble';
import { ImageViewerModal } from './ImageViewerModal';
import { buildAuthenticatedMediaUrl } from '../../utils/media';
import { Send, Bot, WifiOff, MessageCircle, Sparkles, User, Phone, Mail, Calendar, Check, ChevronDown, BookOpen, Clock, Lock, Trash2, ShieldAlert, ArrowLeft, CornerUpLeft, Forward, Pencil, X, Download, Smile, Paperclip, Upload, Search, DollarSign, MoreVertical, Bold, Italic, Strikethrough, Code, Copy, Scissors, Clipboard, Video, CheckSquare, Wrench } from 'lucide-react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

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
    updateContactDetails,
    triggerAiResponse
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
  const isAdmin = currentUser?.role === 'admin';

  const [inputMessage, setInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiTriggering, setAiTriggering] = useState(false);
  
  // Notas Internas vs WhatsApp
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [noteCategory, setNoteCategory] = useState('general');

  // Ficha 360° Modal & Pestañas del Panel Derecho (Lead, Cotizador, Agenda)
  const [showFichaModal360, setShowFichaModal360] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
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
  const textareaRef = useRef(null);
  const [showToolbox, setShowToolbox] = useState(true);
  const [toastFeedback, setToastFeedback] = useState('');

  const showToast = (msg) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(''), 2500);
  };

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

  // Helper para generar cabeceras de fecha estilo WhatsApp Web (HOY, AYER, FECHA)
  const getMessageDateHeader = (isoString) => {
    if (!isoString) return '';
    let timeStr = String(isoString);
    const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(timeStr);
    if (!hasTimeZone) timeStr += 'Z';
    const date = new Date(timeStr);
    const now = new Date();

    const dBogota = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const nBogota = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));

    const dDay = new Date(dBogota.getFullYear(), dBogota.getMonth(), dBogota.getDate());
    const nDay = new Date(nBogota.getFullYear(), nBogota.getMonth(), nBogota.getDate());

    const diffDays = Math.round((nDay.getTime() - dDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'HOY';
    if (diffDays === 1) return 'AYER';

    const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    if (diffDays < 7 && diffDays > 0) {
      return `${dayNames[dBogota.getDay()]}, ${dBogota.getDate()} DE ${monthNames[dBogota.getMonth()]}`;
    }
    return `${dBogota.getDate()} DE ${monthNames[dBogota.getMonth()]} DE ${dBogota.getFullYear()}`;
  };

  // Lista ordenada de imágenes en el chat actual para navegación del visor (lightbox)
  const chatImages = (messages || [])
    .filter(msg => (msg.message_type || '').toLowerCase() === 'image')
    .map(msg => {
      const match = (msg.content || '').match(/\[Media ID:\s*([^\]]+)\]/);
      if (match) {
        return buildAuthenticatedMediaUrl(`${API_URL}/chats/media/${match[1]}`);
      }
      if ((msg.content || '').startsWith('http')) return msg.content;
      return null;
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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${selectedContactId}/activities`, {
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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${selectedContactId}/notes`, {
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

  const [showMobileHeaderMenu, setShowMobileHeaderMenu] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setShowRightSidebar(false);
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
  const [proposalPaymentTerms, setProposalPaymentTerms] = useState('50% Anticipo de Fabricación, 50% Balanza Final');
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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/proposals/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_id: selectedContactId,
          model_name: proposalModel,
          base_price: parseFloat(proposalBasePrice) || 78500000,
          extra_deck: proposalExtraDeck,
          deck_cost: 5400000,
          extra_solar: proposalExtraSolar,
          solar_cost: 17800000,
          extra_clima: proposalExtraClima,
          clima_cost: 3200000,
          freight_city: proposalFreightCity || 'Armenia / Eje Cafetero',
          freight_cost: parseFloat(proposalFreightCost) || 3400000,
          discount_pct: parseFloat(proposalDiscount) || 0,
          payment_terms: proposalPaymentTerms || '50% Anticipo de Fabricación / 50% Balanza Final',
          custom_notes: proposalNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProposalSuccess(`¡Propuesta generada por $${(data.total_final || 0).toLocaleString('es-CO')} COP!`);
        setPdfPath(data.file_path);
        setPdfUrl(`${API_URL}${data.download_url}`);
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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/proposals/send_email`, {
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

  // Auto-scroll Inteligente: no interrumpe al asesor si está leyendo mensajes arriba
  const chatContainerRef = useRef(null);
  const prevContactIdRef = useRef(null);
  const prevMsgLengthRef = useRef(messages?.length || 0);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    setShowScrollBottomBtn(false);
    setUnreadBelowCount(0);
  };

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceToBottom < 120) {
      setShowScrollBottomBtn(false);
      setUnreadBelowCount(0);
    } else {
      setShowScrollBottomBtn(true);
    }
  };

  useEffect(() => {
    const isNewContact = prevContactIdRef.current !== selectedContactId;
    prevContactIdRef.current = selectedContactId;

    if (isNewContact) {
      scrollToBottom('auto');
      setShowScrollBottomBtn(false);
      setUnreadBelowCount(0);
      prevMsgLengthRef.current = messages?.length || 0;
      return;
    }

    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    const lastMsg = messages?.[messages?.length - 1];
    const isMe = lastMsg?.sender_type === 'user' || lastMsg?.sender_type === 'USER' || lastMsg?.sender_type === 'ai';

    if (isNearBottom || isMe) {
      scrollToBottom('smooth');
    } else {
      if (messages?.length > prevMsgLengthRef.current) {
        setUnreadBelowCount(prev => prev + 1);
      }
      setShowScrollBottomBtn(true);
    }
    prevMsgLengthRef.current = messages?.length || 0;
  }, [messages?.length, messages?.[messages?.length - 1]?.id, isTyping, selectedContactId]);

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
    
    let finalContent = inputMessage.trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\u202f\u00a0]/g, ' ');

    if (!finalContent.includes('\n') || finalContent.split('\n').length <= 2) {
      finalContent = finalContent.replace(/([.!?])\s{2,}/g, '$1\n\n');
      finalContent = finalContent.replace(/\s*(Link de la reunión:?)\s*/gi, '\n\n*Link de la reunión:*\n');
      finalContent = finalContent.replace(/\s*(Información para unirse a la reunión[^\n]*)\s*/gi, '\n\n$1\n');
      finalContent = finalContent.replace(/\s*(Vínculo a la videollamada:?)\s*/gi, '\n*Vínculo a la videollamada:* ');
      finalContent = finalContent.replace(/\s*(O marca:?)\s*/gi, '\n*O marca:* ');
      finalContent = finalContent.replace(/\s*(Más números de teléfono:?)\s*/gi, '\n*Más números de teléfono:* ');
      finalContent = finalContent.replace(/\s*(Quedo atent[ao]\s+a\s+su\s+conexi[oó]n[^\n.]*\.?)\s*/gi, '\n\n$1\n\n');
      finalContent = finalContent.replace(/\s*(Liliana León[^\n]*)\s*/gi, '\n\n$1\n');
      finalContent = finalContent.replace(/\s*(ANCLA Special Projects)\s*$/gi, '\n$1');
      finalContent = finalContent.replace(/\n{3,}/g, '\n\n').trim();
    }

    if (editingMessage) {
      await editMessage(editingMessage.id, finalContent);
      setEditingMessage(null);
      setInputMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chats/${selectedContactId}/copilot`, {
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
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
          textareaRef.current.focus();
        }
      }, 30);
    }
  };

  const handleTriggerAiResponse = async () => {
    if (!activeContact || aiTriggering) return;
    setAiTriggering(true);
    try {
      await triggerAiResponse(activeContact.id);
    } catch (err) {
      console.error("Error forzando respuesta de la IA:", err);
      alert("Error al forzar la IA: " + (err.message || "Error de conexión"));
    } finally {
      setAiTriggering(false);
    }
  };

  // 🛠️ CAJA DE HERRAMIENTAS WHATSAPP: Pegar, Copiar, Cortar, Seleccionar Todo, Limpiar y Formato
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputMessage((prev) => (prev ? `${prev}\n${text}` : text));
        showToast('📋 ¡Texto pegado con saltos de línea intactos!');
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
            textareaRef.current.focus();
          }
        }, 30);
      } else {
        showToast('⚠️ Portapapeles vacío');
      }
    } catch (err) {
      showToast('⚠️ No se pudo leer el portapapeles directamente. Usa Ctrl+V / Mantén presionado');
    }
  };

  const handleCopyText = () => {
    if (!inputMessage) {
      showToast('⚠️ No hay texto para copiar');
      return;
    }
    navigator.clipboard.writeText(inputMessage);
    showToast('📄 ¡Texto copiado al portapapeles!');
  };

  const handleCutText = () => {
    if (!textareaRef.current || !inputMessage) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    if (selectionStart !== selectionEnd) {
      const selected = value.substring(selectionStart, selectionEnd);
      navigator.clipboard.writeText(selected);
      const newText = value.substring(0, selectionStart) + value.substring(selectionEnd);
      setInputMessage(newText);
    } else {
      navigator.clipboard.writeText(value);
      setInputMessage('');
    }
    showToast('✂️ ¡Texto cortado!');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }, 20);
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      showToast('🔲 ¡Todo seleccionado!');
    }
  };

  const handleClearText = () => {
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    showToast('🧹 ¡Texto borrado!');
  };

  const handleFormatText = (prefix, suffix = prefix) => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    if (selectionStart !== selectionEnd) {
      const selected = value.substring(selectionStart, selectionEnd);
      const formatted = `${prefix}${selected}${suffix}`;
      const newText = value.substring(0, selectionStart) + formatted + value.substring(selectionEnd);
      setInputMessage(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + prefix.length;
          textareaRef.current.selectionEnd = selectionEnd + prefix.length;
          textareaRef.current.focus();
        }
      }, 10);
    } else {
      const newText = value.substring(0, selectionStart) + `${prefix}${suffix}` + value.substring(selectionEnd);
      setInputMessage(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + prefix.length;
          textareaRef.current.selectionEnd = selectionStart + prefix.length;
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const handleInsertMeetTemplate = () => {
    const clientName = activeContact?.first_name ? activeContact.first_name.trim() : 'Sra. Olga';
    const advisorName = currentUser?.full_name || 'Liliana León, Directora Líder';
    const defaultMeetUrl = 'https://meet.google.com/niv-fvrr-ryh';
    
    const template = `Buenos días, ${clientName}.\n\nLe habla ${advisorName} de ANCLA Special Projects.\n\nCon mucho gusto, le comparto por este medio el link de acceso a la videollamada para nuestra asesoría programada.\n\nLink de la reunión:\nPresentación Ancla\nInformación para unirse a la reunión de Google Meet:\n${defaultMeetUrl}\n\nQuedo atenta a su conexión. Será un gusto atenderle y brindarle toda la información sobre nuestros proyectos y soluciones.\n\n${advisorName}\nANCLA Special Projects`;
    
    setInputMessage(template);
    showToast('📹 ¡Plantilla Google Meet insertada con párrafos limpios!');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        textareaRef.current.focus();
      }
    }, 30);
  };

  // Reemplazo de Variables Inteligentes en Respuestas Rápidas (Adaptable por Género)
  const handleQuickReplySelect = (text) => {
    let replacedText = text;
    const clientName = activeContact?.first_name ? activeContact.first_name.trim() : 'Estimado(a)';
    const advisorFullName = currentUser?.full_name || 'Liliana León';
    
    // Detección inteligente de género del asesor
    const firstAdvisorWord = advisorFullName.trim().split(' ')[0].toLowerCase();
    const isFemaleAdvisor = firstAdvisorWord.endsWith('a') || ['liliana', 'olga', 'maria', 'carolina', 'diana', 'patricia', 'sandra', 'martha', 'laura', 'daniela', 'paula', 'sofia', 'claudia', 'valeria'].includes(firstAdvisorWord);
    
    const atentoAtenta = isFemaleAdvisor ? 'atenta' : 'atento';
    const defaultMeetUrl = 'https://meet.google.com/niv-fvrr-ryh';

    replacedText = replacedText
      .replace(/\{\{\s*(cliente|nombre)\s*\}\}/gi, clientName)
      .replace(/\{\{\s*(asesor|vendedor)\s*\}\}/gi, advisorFullName)
      .replace(/\{\{\s*(atento_atenta|genero_asesor|atenta_atento)\s*\}\}/gi, atentoAtenta)
      .replace(/\{\{\s*(link_meet|meet|enlace_meet)\s*\}\}/gi, defaultMeetUrl);

    setInputMessage(replacedText);
    setShowTemplates(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        textareaRef.current.focus();
      }
    }, 30);
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-300 select-none border-l border-slate-200 dark:border-navy-700 h-full transition-colors duration-300">
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
            <div className="w-12 h-1 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full mt-2"></div>
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
              className="flex items-center space-x-2 hover:text-gold-500 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 dark:bg-navy-950 relative w-full">
      
      {/* 2/3: Ventana de Chat Principal */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 min-w-0 min-h-0 flex flex-col h-full bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-700 overflow-hidden relative"
      >
        {isDragging && (
          <div className="absolute inset-0 bg-gold-500/10 dark:bg-gold-500/15 border-4 border-dashed border-gold-500 backdrop-blur-xs flex flex-col items-center justify-center z-30 pointer-events-none animate-fade-in">
            <Upload className="w-12 h-12 text-gold-500 dark:text-gold-400 mb-2 animate-bounce" />
            <p className="text-sm font-bold text-gold-600 dark:text-gold-400">Arrastra y suelta tu archivo aquí para enviarlo</p>
          </div>
        )}
        
        {/* Header del Chat */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950/90 flex items-center justify-between gap-2 select-none">
          <div className="flex items-center min-w-0 flex-1 mr-2 overflow-hidden">
            {/* Botón de Atrás (solo móvil/tablet) */}
            <button
              onClick={() => {
                setSelectedContactId(null);
                if (typeof document !== 'undefined') {
                  document.body.classList.remove('has-active-chat');
                }
              }}
              className="md:hidden p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-500 dark:text-gold-400 mr-2 flex-shrink-0 active:scale-95 transition-all cursor-pointer"
              title="Volver a los chats"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {/* Avatar del contacto en el Header */}
            <div className="relative mr-2.5 flex-shrink-0">
              {activeContact.avatar_url ? (
                <img 
                  src={activeContact.avatar_url} 
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                  alt="Perfil"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-navy-800 flex items-end justify-center overflow-hidden border border-slate-200 dark:border-navy-700 flex-shrink-0 select-none">
                  <svg className="w-7 h-7 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center space-x-1.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate max-w-[130px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[280px]">
                  {activeContact.first_name ? `${activeContact.first_name} ${activeContact.last_name || ''}`.trim() : activeContact.phone}
                </h3>
                {activeContact.qualification_level && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold border shrink-0 hidden sm:inline-block ${
                    activeContact.qualification_level === 'potencial' ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/20' :
                    activeContact.qualification_level === 'explorador' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                    'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                  }`}>
                    {activeContact.qualification_level === 'potencial' ? '🟢 Potencial' : activeContact.qualification_level === 'explorador' ? '🟡 Explorador' : '🔴 Curioso'}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span className="truncate">{activeContact.interest_product ? `Interés: ${activeContact.interest_product}` : 'ANCLA Special Projects'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Botón Destacado Ficha 360° (Siempre visible en 1 clic) */}
            <button
              type="button"
              onClick={() => setShowFichaModal360(true)}
              className="px-2.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-[11px] flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
              title="Abrir Ficha Técnica Comercial 360°"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ficha 360°</span>
            </button>

            {/* MENÚ MÓVIL ESTILO WHATSAPP (Solo en Móvil < md) */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setShowMobileHeaderMenu(!showMobileHeaderMenu)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95"
                title="Más opciones del chat"
              >
                <MoreVertical className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </button>

              {showMobileHeaderMenu && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowMobileHeaderMenu(false)} />
              )}

              {showMobileHeaderMenu && (
                <div className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-fade-in text-xs font-bold text-slate-700 dark:text-slate-200">
                  <button
                    type="button"
                    onClick={() => { setShowMobileHeaderMenu(false); handleTriggerAiResponse(); }}
                    disabled={aiTriggering}
                    className="w-full text-left px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 font-extrabold flex items-center space-x-2.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    <span>Sofi: Forzar Respuesta IA</span>
                  </button>

                  <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-gold-500" />
                      <span>Piloto IA</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeContact.chatbot_enabled}
                      onChange={(e) => toggleChatbot(activeContact.id, e.target.checked)}
                      className="w-7 h-4 accent-gold-500 rounded cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => { setShowMobileHeaderMenu(false); setShowMsgSearch(!showMsgSearch); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center space-x-2.5"
                  >
                    <Search className="w-4 h-4 text-blue-500" />
                    <span>Buscar en este chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowMobileHeaderMenu(false); setShowRightSidebar(!showRightSidebar); }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center space-x-2.5"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>Ver Detalles & Propuestas</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={async () => {
                        setShowMobileHeaderMenu(false);
                        if (window.confirm(`¿Borrar el chat de ${activeContact.first_name || activeContact.phone}?`)) {
                          await deleteContact(activeContact.id);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center space-x-2.5 border-t border-slate-100 dark:border-white/5 pt-2 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar Conversación</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* BOTONES DESPLEGADOS EN ESCRITORIO (Solo en Pantallas Desktop md+) */}
            <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2 shrink-0">
              <div 
                className={`flex items-center space-x-1 bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 max-w-[140px] lg:max-w-[180px] ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                title={!isAdmin ? "Asignación exclusiva de la Dirección Comercial (Liliana León)" : "Asignar Asesor Comercial"}
              >
                <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <select
                  value={activeContact.assigned_user_id || ''}
                  disabled={!isAdmin}
                  onChange={async (e) => {
                    if (!isAdmin) return;
                    const val = e.target.value;
                    const success = await assignContact(activeContact.id, val);
                    if (success) {
                      const ag = agents.find(a => String(a.id) === String(val));
                      const name = ag ? ag.full_name : 'Sin Asignar (Liliana / Admin)';
                      showToast(`✅ Contacto asignado a: ${name}`);
                    }
                  }}
                  className={`bg-transparent border-none text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none truncate appearance-none w-full ${!isAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <option value="">Sin Asignar</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
                <Bot className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hidden lg:inline">Piloto IA</span>
                <input
                  type="checkbox"
                  checked={activeContact.chatbot_enabled}
                  onChange={(e) => toggleChatbot(activeContact.id, e.target.checked)}
                  className="w-7 h-4 rounded-full bg-slate-300 text-gold-600 focus:ring-gold-500 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerAiResponse}
                disabled={aiTriggering}
                className={`flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-sm shrink-0 ${
                  aiTriggering 
                    ? 'bg-navy-800/50 text-white cursor-not-allowed'
                    : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-95 cursor-pointer'
                }`}
                title="Fuerza a Sofi IA a responder ahora mismo al último mensaje del cliente"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sofi: Responder</span>
              </button>

              <button
                onClick={async () => {
                  if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el chat con ${activeContact.first_name || activeContact.phone}?`)) {
                    await deleteContact(activeContact.id);
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Eliminar Chat y Borrar Conversación"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowMsgSearch(!showMsgSearch);
                  if (showMsgSearch) setMsgSearchTerm('');
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  showMsgSearch
                    ? 'bg-gold-500/10 border-gold-500/20 text-gold-600 dark:text-gold-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
                title="Buscar mensajes en esta conversación"
              >
                <Search className="w-4 h-4" />
              </button>

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
        </div>

        {/* Buscador de mensajes tipo WhatsApp (dentro del chat) */}
        {showMsgSearch && (
          <div className="bg-slate-50 dark:bg-navy-950 px-4 py-2.5 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between animate-fade-in shadow-inner z-10">
            <div className="relative flex-1 mr-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar mensaje en este chat..."
                value={msgSearchTerm}
                onChange={(e) => setMsgSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-white dark:bg-navy-800 border border-navy-700/30 dark:border-navy-700 rounded-lg pl-9 pr-8 py-1.5 text-base md:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all"
              />
              {msgSearchTerm && (
                <button
                  onClick={() => setMsgSearchTerm('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
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

        {/* Banner de Autorización VIP para Citas Extraordinarias (Liliana León / Dirección Comercial) */}
        {activeContact && (
          <SpecialAppointmentBanner 
            contact={activeContact} 
            onActionSuccess={(toastMsg) => showToast(toastMsg)} 
          />
        )}

        {/* Mensajes del Chat con Focus Dimming suave al interactuar con el panel lateral */}
        <div 
          ref={chatContainerRef} 
          onScroll={handleChatScroll}
          className={`flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-navy-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#243044_1px,transparent_1px)] [background-size:16px_16px] transition-opacity duration-300 relative ${
            showRightSidebar ? 'lg:opacity-100 opacity-60' : 'opacity-100'
          }`}
        >
          {(() => {
            const list = msgSearchTerm.trim() 
              ? messages.filter(m => (m.content || '').toLowerCase().includes(msgSearchTerm.trim().toLowerCase()))
              : (messages || []);

            // Agrupar mensajes por fecha para sticky header suave estilo WhatsApp Web
            const dateGroups = [];
            let currentHeader = null;
            let currentGroupMsgs = [];

            list.forEach((msg) => {
              const header = getMessageDateHeader(msg.created_at) || 'HOY';
              if (header !== currentHeader) {
                if (currentHeader !== null && currentGroupMsgs.length > 0) {
                  dateGroups.push({ header: currentHeader, msgs: currentGroupMsgs });
                }
                currentHeader = header;
                currentGroupMsgs = [msg];
              } else {
                currentGroupMsgs.push(msg);
              }
            });

            if (currentHeader !== null && currentGroupMsgs.length > 0) {
              dateGroups.push({ header: currentHeader, msgs: currentGroupMsgs });
            }

            return dateGroups.map((group, gIdx) => (
              <div key={group.header + '_' + gIdx} className="space-y-3 relative">
                {/* Cabecera de Fecha Flotante Estilo WhatsApp (Sticky por sección: nunca colisiona) */}
                <div className="sticky top-2 z-10 flex justify-center py-1 select-none pointer-events-none">
                  <span className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md text-slate-600 dark:text-slate-400 text-[10.5px] font-black tracking-wider uppercase px-3 py-1 rounded-lg shadow-sm border border-slate-200/80 dark:border-navy-700">
                    {group.header}
                  </span>
                </div>

                {/* Lista de Mensajes del Día */}
                {group.msgs.map((msg) => (
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
              </div>
            ));
          })()}

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
              <div className="w-8 h-8 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-800 text-slate-100 max-w-[70%] border border-navy-700 border-l-2 border-l-gold-500/60">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="italic font-medium text-slate-300">IA de ANCLA está redactando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Botón Flotante Inteligente "↓ Mensajes nuevos / Ir al final" */}
          {showScrollBottomBtn && (
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className="sticky bottom-3 ml-auto mr-1 px-3.5 py-1.5 rounded-full bg-gold-500/95 hover:bg-gold-400 text-navy-950 text-[11px] font-black shadow-xl flex items-center space-x-1.5 transition-all animate-bounce cursor-pointer border border-gold-400/50 z-30 backdrop-blur-md"
              title="Desplazar al último mensaje"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>{unreadBelowCount > 0 ? `↓ ${unreadBelowCount} mensaje${unreadBelowCount > 1 ? 's' : ''} nuevo${unreadBelowCount > 1 ? 's' : ''}` : '↓ Ir al final'}</span>
            </button>
          )}
        </div>

        {/* BARRA FLOTANTE 'SOFI COPILOTO' CON RESPUESTAS TÉCNICAS 1-CLIC */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-gold-500/10 via-navy-900/5 to-purple-500/10 dark:from-navy-950/40 dark:via-navy-900/25 dark:to-purple-950/30 border-t border-slate-200 dark:border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shadow-inner">
          <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-gold-600 dark:text-gold-400 shrink-0 pr-1 select-none">
            <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
            <span className="hidden sm:inline">Sofi Copiloto:</span>
          </div>

          {[
            {
              id: 'meet_direct',
              label: '📹 Link Google Meet',
              isDynamic: true,
              action: () => {
                const clientName = activeContact?.first_name ? activeContact.first_name.trim() : 'Estimado(a)';
                const advisorFullName = currentUser?.full_name || 'Liliana León';
                const firstAdvisorWord = advisorFullName.trim().split(' ')[0].toLowerCase();
                const isFemaleAdvisor = firstAdvisorWord.endsWith('a') || ['liliana', 'olga', 'maria', 'carolina', 'diana', 'patricia', 'sandra', 'martha', 'laura', 'daniela', 'paula', 'sofia', 'claudia', 'valeria'].includes(firstAdvisorWord);
                const atentoAtenta = isFemaleAdvisor ? 'atenta' : 'atento';

                const text = `Hola ${clientName}, con mucho gusto te comparto el link de acceso a la videollamada para nuestra asesoría programada:\n\n🔗 https://meet.google.com/niv-fvrr-ryh\n\nSolo dale clic para conectarte. ¡Quedo muy ${atentoAtenta} a tu conexión!\n\n${advisorFullName}\nANCLA Special Projects`;
                
                setInputMessage(text);
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
                    textareaRef.current.focus();
                  }
                }, 30);
              }
            },
            {
              id: 'cl13',
              label: '🏕️ Cápsula CL-13 ($78M)',
              text: 'La Cápsula Living CL-13 (13m² | 5.80m x 2.23m) tiene un valor oficial de $78.000.000 COP. Incluye baño tipo hotel de lujo, ventanería panorámica curva 270° y domótica integrada.'
            },
            {
              id: 'cl26',
              label: '🚀 Cápsula CL-26 ($148.8M)',
              text: 'La Cápsula Living CL-26 (26m² | 8.95m x 2.23m) tiene un valor oficial de $148.800.000 COP. Es una suite presidencial con cocineta, baño spa y terraza perimetral.'
            },
            {
              id: 'exp36',
              label: '🏠 Flex Home 36m² ($118.8M)',
              text: 'El modelo Flex Home EXP-36 (36m² | 5.90m x 6.30m) tiene un valor oficial de $118.800.000 COP. Cuenta con estructura de acero galvanizado Q350, 2 habitaciones, 1 baño completo, cocina y aislamiento termoacústico de 75mm.'
            },
            {
              id: 'exp56',
              label: '🏡 Flex Home 56m² (A Medida)',
              text: 'El modelo Flex Home EXP-56 (56m² | 11.80m x 6.30m) cuenta con 3 habitaciones, 2 baños, sala-comedor y sistema de doble expansión hidráulica (Cotización personalizada en showroom).'
            },
            {
              id: 'flete',
              label: '🚚 Flete & Ensamble 48h',
              text: 'El transporte se realiza en camión grúa / cama baja directamente a tu lote y el ensamble completo se ejecuta en tan solo 24 a 48 horas en sitio.'
            },
            {
              id: 'garantia',
              label: '🛡️ Garantía & Aislamiento',
              text: 'Todas nuestras casas modulares cuentan con 5 años de garantía estructural, resistencia sísmica grado 8 y paneles termoacústicos ignífugos de alto rendimiento.'
            },
            {
              id: 'cita',
              label: '📅 Agendar Cita Showroom',
              text: '¿Te gustaría que agendemos una cita virtual por Google Meet o una visita a nuestro Showroom en Armenia para que conozcas los acabados en persona?'
            }
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                if (pill.action) {
                  pill.action();
                } else {
                  setInputMessage(pill.text);
                  setTimeout(() => {
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
                      textareaRef.current.focus();
                    }
                  }, 30);
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 hover:border-gold-500/50 hover:bg-gold-50 dark:hover:bg-gold-500/10 text-[#0f172a] dark:text-[#f8fafc] text-[11px] font-bold shrink-0 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center space-x-1"
              title="Insertar respuesta técnica pre-redactada"
            >
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* Sugerencias contextuales generadas por Sofi AI */}
        {aiSuggestion && (
          <div className="p-3 bg-gradient-to-r from-gold-500/5 to-navy-900/5 border-t border-gold-500/20 animate-fade-in flex items-center justify-between">
            <div className="flex items-start space-x-2 min-w-0 pr-4">
              <Bot className="w-4.5 h-4.5 text-gold-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block">Sugerencia del Copiloto</span>
                <p className="text-xs text-slate-700 dark:text-slate-350 italic truncate">"{aiSuggestion}"</p>
              </div>
            </div>
            <button
              onClick={applyAiSuggestion}
              className="bg-navy-900 hover:bg-navy-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all cursor-pointer"
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Input y Panel de Respuestas Rápidas */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900 relative">
          
          {/* Popover de Respuestas Rápidas (Adaptable por Género y Variables Inteligentes) */}
          {showTemplates && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-20 p-3 space-y-2 animate-fade-in max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1 mb-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Plantillas Inteligentes (Hombre / Mujer)</span>
                </h4>
                <span className="text-[8px] text-slate-400 bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                  Autoadapta: {"{{cliente}}"}, {"{{asesor}}"} y {"{{atento_atenta}}"}
                </span>
              </div>
              <div className="grid gap-1.5">
                {(quickReplies && quickReplies.length > 0 ? quickReplies : [
                  {
                    id: 'd1',
                    title: '📹 Invitación Google Meet (Directa)',
                    content: 'Hola {{cliente}}, con mucho gusto te comparto el link de acceso a la videollamada para nuestra asesoría programada:\n\n🔗 {{link_meet}}\n\nSolo dale clic para conectarte. ¡Quedo muy {{atento_atenta}} a tu conexión!\n\n{{asesor}}\nANCLA Special Projects'
                  },
                  {
                    id: 'd2',
                    title: '📹 Invitación Google Meet (Formal)',
                    content: 'Buenos días, {{cliente}}. Le habla {{asesor}} de ANCLA Special Projects.\n\nCon mucho gusto le comparto el link de acceso a la videollamada para nuestra asesoría programada:\n\n🔗 {{link_meet}}\n\nSolo dele clic para ingresar. Quedo muy {{atento_atenta}} a su conexión. ¡Será un gusto atenderle!\n\n{{asesor}}\nANCLA Special Projects'
                  },
                  {
                    id: 'd3',
                    title: '⚡ Recordatorio Rápido (Enlace Meet)',
                    content: '¡Hola {{cliente}}! Ya estamos listos para nuestra asesoría virtual.\n\nAquí tienes el enlace directo para ingresar a la sala:\n🔗 {{link_meet}}\n\n¡Te espero en la sala!'
                  },
                  {
                    id: 'd4',
                    title: '🏠 Flex Home 36m² ($118.8M)',
                    content: 'El modelo Flex Home EXP-36 (36m² | 5.90m x 6.30m) tiene un valor oficial de $118.800.000 COP. Cuenta con estructura de acero galvanizado Q350, 2 habitaciones, 1 baño completo, cocina y aislamiento termoacústico de 75mm.'
                  },
                  {
                    id: 'd5',
                    title: '🏡 Flex Home 56m² (Personalizada)',
                    content: 'La Casa Expandible FLEX HOME (56 m² | 11.80m x 6.30m) cuenta con 3 habitaciones, 2 baños, sala-comedor y sistema de doble expansión hidráulica (Cotización personalizada en showroom).'
                  },
                  {
                    id: 'd6',
                    title: '📍 Ubicación Showroom Armenia',
                    content: 'Nuestra sala de ventas y showroom de exhibición está ubicada en Armenia, Quindío, sobre la Avenida Centenario, frente a Pan y Miel.\n• Waze: https://waze.com/ul?q=Avenida+Centenario+Armenia+Quindio\n• Google Maps: https://maps.google.com/?q=4.5616751,-75.6455612'
                  }
                ]).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReplySelect(reply.content)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs text-slate-770 dark:text-slate-300 border border-slate-100 dark:border-white/5 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-blue-600 dark:text-sky-400 block mb-0.5">{reply.title}</span>
                    <span className="truncate block opacity-85 text-[11px] whitespace-pre-wrap line-clamp-2">{reply.content}</span>
                  </button>
                ))}
              </div>
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
          <div className="flex items-center space-x-1.5 mb-2.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-max border border-slate-200 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsInternalNote(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                !isInternalNote
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-white/5'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-gold-500" />
              <span>Enviar WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInternalNote(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
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
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-[0.97] cursor-pointer ${
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

          {/* Formulario Principal de Redacción Multilínea (Igual a WhatsApp) */}
          <form onSubmit={handleSend} className="flex items-end space-x-2">
            
            {/* Botón de Plantillas Inteligentes (Todas las Vistas: Móvil y Desktop) */}
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                showTemplates 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title="Plantillas y Respuestas Rápidas"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Botón de Emojis (Todas las Vistas) */}
            {!isInternalNote && (
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`hidden sm:flex p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  showEmojiPicker 
                    ? 'bg-amber-500 border-amber-550 text-white shadow-md animate-pulse'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
                title="Insertar Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            )}

            {/* Botón de Adjuntar Archivo (Siempre Visible) */}
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer active:scale-95 shrink-0"
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

            {/* Campo Multilínea de Texto Expandible (Textarea con autoformato en pegado) */}
            <div className="flex-1 min-w-0 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={
                  isInternalNote 
                    ? "Nota interna privada..." 
                    : "Escribe un mensaje de WhatsApp..."
                }
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
                  }
                }}
                onPaste={(e) => {
                  const pasted = (e.clipboardData || window.clipboardData)?.getData('text');
                  if (!pasted) return;

                  let text = pasted
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    .replace(/[\u202f\u00a0]/g, ' ');

                  if (!text.includes('\n') || text.split('\n').length <= 2) {
                    text = text.replace(/([.!?])\s{2,}/g, '$1\n\n');
                    text = text.replace(/\s*(Link de la reunión:?)\s*/gi, '\n\n*Link de la reunión:*\n');
                    text = text.replace(/\s*(Información para unirse a la reunión[^\n]*)\s*/gi, '\n\n$1\n');
                    text = text.replace(/\s*(Vínculo a la videollamada:?)\s*/gi, '\n*Vínculo a la videollamada:* ');
                    text = text.replace(/\s*(O marca:?)\s*/gi, '\n*O marca:* ');
                    text = text.replace(/\s*(Más números de teléfono:?)\s*/gi, '\n*Más números de teléfono:* ');
                    text = text.replace(/\s*(Quedo atent[ao]\s+a\s+su\s+conexi[oó]n[^\n.]*\.?)\s*/gi, '\n\n$1\n\n');
                    text = text.replace(/\s*(Liliana León[^\n]*)\s*/gi, '\n\n$1\n');
                    text = text.replace(/\s*(ANCLA Special Projects)\s*$/gi, '\n$1');
                    text = text.replace(/\n{3,}/g, '\n\n').trim();
                  }

                  e.preventDefault();
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const current = inputMessage;
                    const newContent = current.substring(0, start) + text + current.substring(end);
                    setInputMessage(newContent);

                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + text.length;
                      textarea.style.height = 'auto';
                      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
                      textarea.focus();
                    }, 20);
                  } else {
                    setInputMessage(text);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    if (window.innerWidth >= 768) {
                      e.preventDefault();
                      handleSend();
                    }
                  }
                }}
                className={`w-full min-h-[44px] max-h-[180px] border rounded-xl px-3.5 py-2.5 text-base md:text-sm leading-relaxed focus:outline-none transition-all resize-none overflow-y-auto ${
                  isInternalNote 
                    ? 'bg-amber-500/5 border-amber-300 focus:border-amber-500 text-slate-800 dark:text-amber-100'
                    : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white focus:border-gold-500/50'
                }`}
              />
            </div>

            {/* Copiloto disparador (Desktop/Tablet) */}
            {!isInternalNote && (
              <button
                type="button"
                onClick={triggerAiSuggestion}
                disabled={aiLoading}
                className="hidden sm:flex p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 shrink-0 cursor-pointer"
                title="Copiloto de IA"
              >
                <Bot className={`w-4 h-4 ${aiLoading ? 'animate-spin text-gold-500' : ''}`} />
              </button>
            )}

            {/* Botón de Enviar Mensaje (SIEMPRE VISIBLE Y HIGHLIGHTED) */}
            <button
              type="submit"
              className={`p-2.5 sm:p-3 rounded-xl text-white shadow-md transition-all shrink-0 active:scale-95 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isInternalNote 
                  ? 'bg-navy-900 hover:bg-navy-800'
                  : 'bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-400 text-navy-950'
              }`}
              title="Enviar Mensaje (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3/3: Panel Lateral Derecho - Ficha de Contacto & Herramientas (Navegación Inline sin Bloqueos de Pantalla) */}
      <div 
        className={`right-sidebar-panel flex-col border-l border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 transition-all h-full overflow-hidden flex-shrink-0 ${
          showRightSidebar 
            ? 'flex w-80 sm:w-88 xl:w-[320px] 2xl:w-[340px] max-w-[90vw] xl:max-w-[340px] h-full shadow-md animate-fade-in' 
            : 'hidden'
        }`}
      >
        {/* Header Fijo Sticky (Avatar, Nombre, Matriz 1-Clic y 3 Pestañas Superiores) */}
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-gold-500" />
              <span>Ficha & Herramientas</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowRightSidebar(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-all"
              title="Cerrar Detalles"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Resumen Fijo de Contacto */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="relative flex-shrink-0">
              {activeContact.avatar_url ? (
                <img src={activeContact.avatar_url} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10" alt="Avatar" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-navy-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {activeContact.first_name ? activeContact.first_name[0] : 'U'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {activeContact.first_name ? `${activeContact.first_name} ${activeContact.last_name || ''}`.trim() : activeContact.phone}
                </span>
                <span className="text-[10px] font-black text-gold-600 dark:text-gold-400 bg-gold-500/10 px-1.5 py-0.5 rounded font-mono">
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
                  ? 'bg-navy-900 border-navy-700 text-white shadow-sm'
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
                  ? 'bg-navy-800 border-navy-700 text-white shadow-sm'
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
                  ? 'bg-navy-900 border-navy-700 text-white shadow-sm'
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
            <div className="space-y-3 animate-fade-in text-[#0f172a] dark:text-[#f8fafc]">
              
              {/* Atribución Meta Ads & Origen */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Atribución & Origen</span>
                  <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">Meta Ads</span>
                </div>
                <p className="text-xs font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                  {activeContact.source || 'Meta Ads (Campañas Digitales)'}
                </p>
              </div>

              {/* Datos de Terreno & Ubicación */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 space-y-2.5 shadow-xs">
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
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-[#0f172a] dark:text-[#f8fafc] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <option value="Por definir">Por definir</option>
                    <option value="Sí, ya tengo">Sí, ya tengo</option>
                    <option value="Buscando terreno">Buscando terreno</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ubicación / Ciudad</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const newCity = prompt("Ubicación / Municipio del Lote:", activeContact.lot_city || '');
                      if (newCity !== null) {
                        await updateContactDetails(activeContact.id, { lot_city: newCity.trim() });
                      }
                    }}
                    className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center space-x-1"
                  >
                    <span>{activeContact.lot_city || 'Por definir'}</span>
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Selector de Etapa Kanban */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 space-y-1.5 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Etapa Comercial</span>
                <select
                  value={activeContact.pipeline_stage_id || ''}
                  onChange={(e) => updateContactStage(activeContact.id, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                >
                  <option value="">Sin Asignar</option>
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Asesor Asignado (Visibilidad Directa) */}
              <div className="p-3 rounded-xl bg-gold-500/10 dark:bg-gold-500/10 border border-gold-500/20 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gold-600 dark:text-gold-400 uppercase font-extrabold tracking-wider block">👤 Asesor Asignado</span>
                  <span className="text-[9px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-1.5 py-0.2 rounded-md">Todos los perfiles</span>
                </div>
                <select
                  value={activeContact.assigned_user_id || ''}
                  onChange={async (e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null;
                    const success = await updateContactDetails(activeContact.id, { assigned_user_id: val });
                    if (success) {
                      const ag = agents.find(a => String(a.id) === String(val));
                      const name = ag ? ag.full_name : 'Sin Asignar (Liliana / Admin)';
                      showToast(`✅ Asesor asignado: ${name}`);
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-gold-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-gold-800 dark:text-gold-200 cursor-pointer focus:outline-none focus:border-gold-500"
                >
                  <option value="">Sin Asignar (Liliana / Admin General)</option>
                  {agents && agents.length > 0 ? (
                    agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name || agent.email} {agent.role ? `(${agent.role})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="3">Liliana León (Directora Comercial)</option>
                      <option value="4">Asesor Comercial ANCLA</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: 📄 COTIZADOR (Motor de Propuestas Comerciales en COP) */}
          {rightSidebarTab === 'cotizador' && (
            <div className="space-y-3.5 animate-fade-in text-[#0f172a] dark:text-[#f8fafc]">
              
              {/* Botón Maestro a Dossier 360° */}
              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-navy-900 hover:bg-navy-800 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <DollarSign className="w-4 h-4" />
                <span>📑 Abrir Dossier & Cotizador COP (3 Pestañas)</span>
              </button>

              <form onSubmit={handleGenerateCustomProposal} className="space-y-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 block">Cotizador Rápido de Chat</span>
                  <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 font-mono">COP</span>
                </div>
                
                {/* Selector de Modelos */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Modelo de Portafolio</label>
                  <select
                    value={proposalModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProposalModel(val);
                      if (val.includes('CL-13') || val.includes('13m²')) setProposalBasePrice(78000000);
                      else if (val.includes('CL-26') || val.includes('26m²')) setProposalBasePrice(148800000);
                      else if (val.includes('EXP-36') || val.includes('36m²')) setProposalBasePrice(118800000);
                      else if (val.includes('EXP-56') || val.includes('56m²')) setProposalBasePrice(188000000);
                      else if (val.includes('Glamping')) setProposalBasePrice(85000000);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                  >
                    <option value="Cápsula Living CL-13">Cápsula Living CL-13 (13m² - $78.000.000 COP)</option>
                    <option value="Cápsula Living CL-26">Cápsula Living CL-26 (26m² - $148.800.000 COP)</option>
                    <option value="Flex Home EXP-36">Flex Home EXP-36 (36m² - $118.800.000 COP)</option>
                    <option value="Flex Home EXP-56">Flex Home EXP-56 (56m² - A Medida / $188.000.000 COP)</option>
                    <option value="Glamping & Turismo">Glamping & Turismo Modular</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Precio Base ($COP)</label>
                    <input
                      type="number"
                      value={proposalBasePrice}
                      onChange={(e) => setProposalBasePrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Descuento (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={proposalDiscount}
                      onChange={(e) => setProposalDiscount(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>
                </div>

                {/* Switches de Adicionales */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Deck Sintético WPC (+ $5.400.000 COP)</span>
                    <input type="checkbox" checked={proposalExtraDeck} onChange={(e) => setProposalExtraDeck(e.target.checked)} className="rounded text-gold-600 w-4 h-4 accent-gold-500 cursor-pointer" />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Kit Solar Off-Grid (+ $17.800.000 COP)</span>
                    <input type="checkbox" checked={proposalExtraSolar} onChange={(e) => setProposalExtraSolar(e.target.checked)} className="rounded text-gold-600 w-4 h-4 accent-gold-500 cursor-pointer" />
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <span>Climatización A.A. (+ $3.200.000 COP)</span>
                    <input type="checkbox" checked={proposalExtraClima} onChange={(e) => setProposalExtraClima(e.target.checked)} className="rounded text-gold-600 w-4 h-4 accent-gold-500 cursor-pointer" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Ciudad Flete</label>
                    <input
                      type="text"
                      placeholder="Armenia / Cajicá"
                      value={proposalFreightCity}
                      onChange={(e) => setProposalFreightCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Flete ($COP)</label>
                    <input
                      type="number"
                      value={proposalFreightCost}
                      onChange={(e) => setProposalFreightCost(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>
                </div>

                {/* Recálculo Dinámico en Vivo */}
                {(() => {
                  const base = parseFloat(proposalBasePrice) || 0;
                  const deck = proposalExtraDeck ? 5400000 : 0;
                  const solar = proposalExtraSolar ? 17800000 : 0;
                  const clima = proposalExtraClima ? 3200000 : 0;
                  const freight = parseFloat(proposalFreightCost) || 0;
                  const subtotal = base + deck + solar + clima + freight;
                  const disc = parseFloat(proposalDiscount) || 0;
                  const totalCOP = subtotal - (subtotal * (disc / 100));

                  return (
                    <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                        <span>Subtotal Cotizado:</span>
                        <span>${Math.round(subtotal).toLocaleString('es-CO')} COP</span>
                      </div>
                      <div className="flex justify-between font-black text-gold-700 dark:text-gold-300 text-xs border-t border-gold-500/20 pt-1">
                        <span>Total Final COP:</span>
                        <span>${Math.round(totalCOP).toLocaleString('es-CO')} COP</span>
                      </div>
                    </div>
                  );
                })()}

                {proposalError && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 font-bold">
                    {proposalError}
                  </div>
                )}

                {proposalSuccess && (
                  <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-600 font-bold">
                    {proposalSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={proposalLoading}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
                >
                  {proposalLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Propuesta PDF</span>
                    </>
                  )}
                </button>
              </form>

              {/* Formulario de Despacho de Correo redactado por IA */}
              {pdfPath && (
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center space-x-1">
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
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#0f172a] dark:text-[#f8fafc] font-bold"
                    />
                    <textarea
                      rows="2"
                      placeholder="Notas clave tomadas en la llamada..."
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#0f172a] dark:text-[#f8fafc] resize-none"
                    ></textarea>

                    <button
                      type="submit"
                      disabled={emailSending}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
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
                          ? 'bg-navy-900 text-white shadow-md shadow-navy-900/25 border-gold-500'
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
                  className="flex-1 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-gold-500/10"
                >
                  Agendar Cita
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Visor de imágenes profesional (Zoom, Pan, Rotate, Navegación y Centrado 100%) */}
      {lightboxUrl && (
        <ImageViewerModal
          currentUrl={lightboxUrl}
          images={chatImages}
          onClose={() => setLightboxUrl(null)}
          onNavigate={(newUrl) => setLightboxUrl(newUrl)}
        />
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
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-gold-500 transition-colors">
                      {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.phone}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.phone}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-lg group-hover:bg-navy-900 group-hover:text-white transition-all shadow-sm">
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

      {/* Modal Dossier Técnico & Comercial Unificado */}
      {showDossierModal && activeContact && (
        <AnclaTechnicalDossier
          isOpen={showDossierModal}
          contact={activeContact}
          onClose={() => setShowDossierModal(false)}
          onSaveDossier={(dossierData) => {
            if (dossierData.modelName) setProposalModel(dossierData.modelName);
            if (dossierData.totalUSD) setProposalBasePrice(dossierData.totalUSD);
            useChatStore.getState().updateContactDetails(activeContact.id, {
              interest_product: dossierData.modelName,
              quoted_value: dossierData.totalUSD,
              proposal_notes: `Dossier: ${dossierData.modelName} ($${Math.round(dossierData.totalUSD).toLocaleString()} USD | 50% Anticipo: $${Math.round(dossierData.deposit50 || dossierData.deposit60).toLocaleString()} USD / 50% Balanza: $${Math.round(dossierData.balance50 || dossierData.balance40).toLocaleString()} USD)`
            });
          }}
        />
      )}

      {/* Toast Feedback Flotante Universal */}
      {toastFeedback && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-navy-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-black animate-fade-in border-2 border-white/20 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />
          <span>{toastFeedback}</span>
        </div>
      )}
    </div>
  );
}
