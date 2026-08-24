import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Phone, Mail, MapPin, Building2, DollarSign, Calendar as CalendarIcon, 
  FileText, Check, MessageSquare, AlertCircle, Clock, Send, ShieldCheck, Flame, 
  User, CheckCircle2, FileUp, ExternalLink, HelpCircle, RefreshCw, MessageCircle, 
  Factory, FolderLock, FolderArchive, UserCheck, Activity, Layers, ArrowUpRight, Upload
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import ChinaSpecSheetModal from '../showroom/ChinaSpecSheetModal';
import AnclaTechnicalDossier from './AnclaTechnicalDossier';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

const formatBogotaDateTime = (dateStr) => {
  if (!dateStr) return '';
  let isoStr = String(dateStr);
  if (!isoStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoStr)) {
    isoStr += 'Z';
  }
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

const QUALIFICATION_LEVELS = [
  { id: 'VIP', label: 'VIP Alta Intención', icon: '🚀' },
  { id: 'HOT', label: 'Caliente (Cita Lista)', icon: '🟢' },
  { id: 'WARM', label: 'Tibio (En Evaluación)', icon: '🟡' },
  { id: 'COLD', label: 'Frío (Primer Contacto)', icon: '🔵' },
  { id: 'DISCARDED', label: 'Descartado / Pausado', icon: '⚪' }
];

const CALL_RESULTS = [
  { id: 'INTERESTED', label: 'Contestó / Interesado', icon: '🟢', color: 'bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-[11px] font-semibold tracking-wide' },
  { id: 'RESCHEDULE', label: 'Solicitó Reagendar', icon: '📅', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-semibold tracking-wide' },
  { id: 'NO_ANSWER', label: 'Sin Respuesta / Buzón', icon: '🔴', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-semibold tracking-wide' },
  { id: 'SHOWROOM_CONFIRMED', label: 'Confirmó Showroom', icon: '🏢', color: 'bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-[11px] font-semibold tracking-wide' },
  { id: 'QUOTATION_REQUESTED', label: 'Solicitó Cotización PDF', icon: '📄', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[11px] font-semibold tracking-wide' },
  { id: 'REJECTED', label: 'Descartado / Sin Presupuesto', icon: '❌', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/30 text-[11px] font-semibold tracking-wide' }
];

const TIMELINES = [
  { id: 'IMMEDIATE', label: 'Inmediato (< 1 Mes)', icon: '⚡' },
  { id: '1_TO_3_MONTHS', label: '1 a 3 Meses', icon: '🗓️' },
  { id: '3_TO_6_MONTHS', label: '3 a 6 Meses', icon: '🏗️' },
  { id: '6_PLUS_MONTHS', label: 'Más de 6 Meses', icon: '⏳' }
];

const OBJECTIONS = [
  { id: 'NONE', label: 'Sin Objeciones / Todo Claro', icon: '✅' },
  { id: 'BUDGET', label: 'Presupuesto / Precio', icon: '💰' },
  { id: 'NO_LOT', label: 'Buscando Terreno / Lote', icon: '🏞️' },
  { id: 'FREIGHT_DISTANCE', label: 'Flete / Distancia', icon: '🚚' },
  { id: 'PERMITS', label: 'Licencias / Permisos', icon: '📑' },
  { id: 'TIMELINE', label: 'Tiempos de Entrega', icon: '⏳' }
];

const NEXT_ACTIONS = [
  { id: 'RECALL', label: 'Volver a Llamar', icon: '📞' },
  { id: 'SEND_QUOTATION', label: 'Enviar Cotización PDF', icon: '📄' },
  { id: 'MEET_VIRTUAL', label: 'Cita Virtual (Meet)', icon: '💻' },
  { id: 'SHOWROOM_VISIT', label: 'Visita Showroom Armenia', icon: '🏢' },
  { id: 'WAIT_CLIENT', label: 'Esperar Respuesta Cliente', icon: '⏳' }
];

export default function LeadFichaModal360({ contact, onClose, onRefresh }) {
  if (!contact) return null;

  const token = useAuthStore(state => state.token);
  const agents = useChatStore(state => state.agents);
  const fetchAgents = useChatStore(state => state.fetchAgents);

  useEffect(() => {
    if (fetchAgents) fetchAgents();
  }, []);

  // Pestaña Activa: 'perfil', 'resumen_ia', 'documentacion'
  const [activeTab, setActiveTab] = useState('perfil');

  const currentUser = useAuthStore(state => state.user);
  const isAdmin = currentUser?.role === 'admin';

  // Estados Formulario Ficha 360°
  const [firstName, setFirstName] = useState(contact.first_name || '');
  const [lastName, setLastName] = useState(contact.last_name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [lotCity, setLotCity] = useState(contact.lot_city || '');
  const [lotStatus, setLotStatus] = useState(contact.lot_status || 'Por definir');
  const [interestProduct, setInterestProduct] = useState(contact.interest_product || 'Por definir');
  const [clientType, setClientType] = useState(contact.client_type || 'Por definir');
  const [preferredMethod, setPreferredMethod] = useState(contact.preferred_contact_method || 'Llamada telefónica');
  const [estimatedBudget, setEstimatedBudget] = useState(contact.estimated_budget || '');
  const [qualificationLevel, setQualificationLevel] = useState(contact.qualification_level || 'WARM');
  const [qualificationNotes, setQualificationNotes] = useState(contact.qualification_notes || '');
  const [advisorStatus, setAdvisorStatus] = useState(contact.advisor_status || '');

  // Campos Extendidos Ficha Técnica 360°
  const [commercialViability, setCommercialViability] = useState(contact.commercial_viability || 'HIGH');
  const [hasConfirmedBudget, setHasConfirmedBudget] = useState(contact.has_confirmed_budget ?? true);
  const [contactResponseStatus, setContactResponseStatus] = useState(contact.contact_response_status || 'ANSWERED');
  const [quotedValue, setQuotedValue] = useState(contact.quoted_value || '');
  const [proposalPdfUrl, setProposalPdfUrl] = useState(contact.proposal_pdf_url || '');
  const [proposalNotes, setProposalNotes] = useState(contact.proposal_notes || '');
  const [assignedUserId, setAssignedUserId] = useState(contact.assigned_user_id || null);

  // Acabados y Personalización (Pestaña 3)
  const [exteriorColor, setExteriorColor] = useState('Negro Mate Industrial (RAL 9005)');
  const [interiorWalls, setInteriorWalls] = useState('Paneles Termoacústicos Blancos 75mm');
  const [flooringType, setFlooringType] = useState('PVC SPC Alto Tráfico Vetas Madera');

  // Documentos en Bóveda Legal & Custodia
  const [docCedulaUrl, setDocCedulaUrl] = useState(contact.doc_cedula_url || '');
  const [docRutUrl, setDocRutUrl] = useState(contact.doc_rut_url || contact.doc_escritura_url || '');
  const [docCamaraComercioUrl, setDocCamaraComercioUrl] = useState(contact.doc_camara_comercio_url || '');
  const [docRepLegalUrl, setDocRepLegalUrl] = useState(contact.doc_rep_legal_url || '');
  const [docComprobanteUrl, setDocComprobanteUrl] = useState(contact.doc_comprobante_url || '');
  const [docContratoUrl, setDocContratoUrl] = useState(contact.doc_contrato_url || '');
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const handleUploadDocument = async (e, docKey) => {
    const file = e.target.files?.[0];
    if (!file || !contact.id) return;

    setUploadingDoc(docKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', 'document');

      const res = await fetch(`${API_URL}/chats/${contact.id}/send-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const fileUrl = data.media_url || data.content || (data.file_path ? `${API_URL}/media/${data.file_path}` : file.name);
        if (docKey === 'cedula') setDocCedulaUrl(fileUrl);
        else if (docKey === 'rut') setDocRutUrl(fileUrl);
        else if (docKey === 'camara_comercio') setDocCamaraComercioUrl(fileUrl);
        else if (docKey === 'rep_legal') setDocRepLegalUrl(fileUrl);
        else if (docKey === 'comprobante') setDocComprobanteUrl(fileUrl);
        else if (docKey === 'contrato') setDocContratoUrl(fileUrl);
      }
    } catch (err) {
      console.error("Error al subir documento:", err);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Bitácora de Atención Comercial (Pestaña 2)
  const [bitacoraNotes, setBitacoraNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState('LLAMADA');
  const [callResult, setCallResult] = useState('INTERESTED');
  const [constructionTimeline, setConstructionTimeline] = useState('1_TO_3_MONTHS');
  const [detectedObjection, setDetectedObjection] = useState('NONE');
  const [nextAction, setNextAction] = useState('RECALL');
  const [nextActionDate, setNextActionDate] = useState('');
  const [loadingBitacora, setLoadingBitacora] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta dictado por voz automático. Puedes usar el micrófono incorporado en el teclado de tu celular.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewNoteContent(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.start();
    } catch (err) {
      console.error("Error al iniciar dictado por voz:", err);
      setIsListening(false);
    }
  };

  // Estados auxiliares
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChinaSpecs, setShowChinaSpecs] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);

  useEffect(() => {
    fetchBitacora();
  }, [contact.id]);

  const fetchBitacora = async () => {
    try {
      setLoadingBitacora(true);
      const res = await fetch(`${API_URL}/chats/${contact.id}/bitacora`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBitacoraNotes(data || []);
      }
    } catch (err) {
      console.error("Error al cargar bitácora:", err);
    } finally {
      setLoadingBitacora(false);
    }
  };

  const handleOpenCrmChat = () => {
    try {
      const { fetchMessages, setActiveTab } = useChatStore.getState();
      fetchMessages(contact.id);
      setActiveTab('chats');
      if (onClose) onClose();
    } catch (err) {
      console.error("Error abriendo chat en CRM:", err);
    }
  };

  const handleGenerateAiSummary = async () => {
    try {
      setGeneratingAiSummary(true);
      const res = await fetch(`${API_URL}/chats/${contact.id}/ai-summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setQualificationNotes(data.summary);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error generando resumen de IA:", err);
    } finally {
      setGeneratingAiSummary(false);
    }
  };

  const handleAddBitacoraNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim() && !callResult) return;
    try {
      const res = await fetch(`${API_URL}/chats/${contact.id}/bitacora`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note_type: newNoteType,
          call_result: callResult,
          construction_timeline: constructionTimeline,
          detected_objection: detectedObjection,
          next_action: nextAction,
          next_action_date: nextActionDate,
          content: newNoteContent,
          author_name: currentUser?.full_name || (isAdmin ? "Liliana León" : "Asesor Comercial")
        })
      });
      if (res.ok) {
        setNewNoteContent('');
        setNextActionDate('');
        fetchBitacora();
      }
    } catch (err) {
      console.error("Error guardando nota de bitácora:", err);
    }
  };

  const handleSave360 = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/chats/${contact.id}/details`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          lot_city: lotCity,
          lot_status: lotStatus,
          interest_product: interestProduct,
          client_type: clientType,
          preferred_contact_method: preferredMethod,
          estimated_budget: estimatedBudget ? parseFloat(estimatedBudget) : 0,
          qualification_level: qualificationLevel,
          qualification_notes: qualificationNotes,
          advisor_status: advisorStatus,
          commercial_viability: commercialViability,
          has_confirmed_budget: hasConfirmedBudget,
          contact_response_status: contactResponseStatus,
          quoted_value: quotedValue ? parseFloat(quotedValue) : 0,
          proposal_pdf_url: proposalPdfUrl,
          proposal_notes: proposalNotes,
          assigned_user_id: assignedUserId,
          doc_cedula_url: docCedulaUrl,
          doc_rut_url: docRutUrl,
          doc_camara_comercio_url: docCamaraComercioUrl,
          doc_rep_legal_url: docRepLegalUrl,
          doc_comprobante_url: docComprobanteUrl,
          doc_contrato_url: docContratoUrl
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error al guardar la Ficha 360:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-hidden animate-fade-in font-sans">
      
      {/* Toast Flotante Central de Guardado Exitoso */}
      {savedSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] bg-navy-900 text-white px-7 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-black animate-fade-in border-2 border-white/20 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />
          <span>🎉 ¡Ficha Técnica 360° y Asesor Guardados con Éxito!</span>
        </div>
      )}

      {/* Contenedor Principal: full-screen móvil / modal centrado desktop — Paleta ANCLA Navy/Oro */}
      <div className="bg-slate-50 dark:bg-navy-950 border-0 sm:border border-slate-200 dark:border-navy-700 rounded-t-3xl sm:rounded-3xl w-full max-w-5xl h-[96dvh] sm:h-[92vh] max-h-[100dvh] sm:max-h-[880px] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors relative">
        
        {/* Indicador drag handle — bottom-sheet móvil */}
        <div className="sm:hidden flex justify-center pt-2 pb-0 shrink-0">
          <div className="w-10 h-1 rounded-full bg-navy-700" />
        </div>

        {/* 1. HEADER COMPACTO TIPO APP PWA NATIVA (2 FILAS MÁXIMO) */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900 flex flex-col gap-2 shrink-0">
          
          {/* Fila 1: Datos Principales (Izquierda) + Acciones Principales (Derecha) */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-500 text-navy-950 font-black text-xs sm:text-base flex items-center justify-center shadow-sm shrink-0">
                {contact.first_name ? contact.first_name[0].toUpperCase() : 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                    {contact.first_name || 'Prospecto'} {contact.last_name || ''}
                  </h3>
                  <span className="text-[9px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 shrink-0">
                    #{contact.id}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                  📱 {contact.phone}
                </p>
              </div>
            </div>

            {/* Acciones Rápidas Superior Derecho */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenCrmChat}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-bold text-xs flex items-center space-x-1 shadow-sm shadow-gold-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat CRM</span>
              </button>

              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-800 transition-all cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fila 2: Track Único Horizontal con Paleta Neutra Controlada (Regla #3 del Video) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full text-xs font-semibold whitespace-nowrap">
            <span className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-[11px] font-semibold tracking-wide shrink-0">
              🏞️ {lotStatus || 'Buscando Lote'}
            </span>
            {lotCity && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 text-[11px] font-semibold tracking-wide shrink-0">
                📍 {lotCity}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 text-[11px] font-semibold tracking-wide shrink-0">
              🏗️ {interestProduct || 'Flex Home 56m²'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 text-[11px] font-semibold tracking-wide shrink-0">
              💼 {clientType || 'Persona Natural'}
            </span>

            {/* Asesor Selector Pill */}
            <div 
              className="flex items-center space-x-1.5 bg-slate-200/80 dark:bg-navy-800 border border-slate-300/50 dark:border-navy-700 rounded-lg px-2.5 py-1 shrink-0"
              title="Asignar Asesor Comercial (Disponible para todos los perfiles)"
            >
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">👤 Asesor:</span>
              <select
                value={assignedUserId || ''}
                onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none max-w-[150px] truncate cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white">Sin Asignar (Liliana / Admin)</option>
                {agents && agents.length > 0 ? (
                  agents.map((ag) => (
                    <option key={ag.id} value={ag.id} className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white">
                      {ag.full_name || ag.email} {ag.role ? `(${ag.role})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="3" className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white">Liliana León (Directora)</option>
                    <option value="4" className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white">Asesor Comercial ANCLA</option>
                  </>
                )}
              </select>
            </div>

            {/* Botones Secundarios */}
            <button
              type="button"
              onClick={() => setShowDossierModal(true)}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-200/80 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-navy-700 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shrink-0 hover:bg-slate-300 dark:hover:bg-navy-700"
            >
              <DollarSign className="w-3.5 h-3.5 text-gold-500" />
              <span>Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => setShowChinaSpecs(true)}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-200/80 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-navy-700 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shrink-0 hover:bg-slate-300 dark:hover:bg-navy-700"
            >
              <Factory className="w-3.5 h-3.5 text-indigo-400" />
              <span>China</span>
            </button>
          </div>
        </div>

        {/* 2. BARRA DE 3 PESTAÑAS PRINCIPALES (COMPACTA Y SIN SCROLL CHAOS) */}
        <div className="px-3 sm:px-6 border-b border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 flex items-center space-x-1 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'perfil', label: 'Perfil & Requerimientos', icon: User },
            { id: 'resumen_ia', label: 'Resumen IA & Historial', icon: Sparkles },
            { id: 'documentacion', label: 'Documentación & Bóveda', icon: FolderArchive }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] py-3 px-3 sm:px-4 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. CONTENIDO DEL MODAL (CON ESPACIO DE SCROLL PARA QUE NINGÚN CAMPO QUEDE OCULTO TRAS EL FOOTER) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">

          {/* ==================================================================== */}
          {/* PESTAÑA 1: PERFIL & REQUERIMIENTOS                                   */}
          {/* ==================================================================== */}
          {activeTab === 'perfil' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Bloque 1A: Selector Segmentado Unificado de Clasificación Comercial */}
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-gold-500" />
                  <span>Clasificación Comercial 1-Clic</span>
                </span>
                
                {/* Selector Segmentado Unificado (Flex-Wrap Adaptativo de Alta Legibilidad sin Cortes) */}
                <div className="bg-slate-100 dark:bg-navy-800/60 p-1.5 rounded-xl flex flex-wrap gap-1.5">
                  {QUALIFICATION_LEVELS.map((lvl) => {
                    const isSelected = qualificationLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setQualificationLevel(lvl.id)}
                        className={`flex-1 min-w-[65px] sm:min-w-[80px] min-h-[44px] py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-gold-500/50 font-black' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs">{lvl.icon}</span>
                        <span>{lvl.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque 1B: Grid de 2 Columnas para Diagnóstico de Negocio & Evaluación Financiera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Columna Izquierda: LOS 4 PILARES COMERCIALES DE ANCLA (RESPUESTAS DE LILIANA) */}
                <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-gold-500" />
                      <span>Diagnóstico de Proyecto (Pilares ANCLA)</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400">
                      Clave para Cierre
                    </span>
                  </div>

                  {/* Pilar 1: Estado del Lote */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">🏞️ 1. ¿Tiene Terreno / Lote Propio?</label>
                    <select
                      value={lotStatus || 'Por definir'}
                      onChange={(e) => setLotStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-slate-100 cursor-pointer focus:border-gold-500"
                    >
                      <option value="Por definir">❓ Por definir / Sin especificar</option>
                      <option value="Sí, ya tengo">✅ Sí, ya tiene lote propio listo</option>
                      <option value="Buscando Lote">🟡 Buscando lote / terreno en la zona</option>
                      <option value="En Negociación">⏳ En trámite de compra / promesa</option>
                      <option value="Terreno Arrendado">📜 Terreno arrendado / concesión</option>
                    </select>
                  </div>

                  {/* Pilar 2: Municipio de la Obra */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">📍 2. Municipio / Ubicación de la Obra</label>
                    <input
                      type="text"
                      value={lotCity}
                      onChange={(e) => setLotCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500"
                      placeholder="Ej: Armenia, Subachoque, Nemocón, Rionegro, Melgar"
                    />
                  </div>

                  {/* Pilar 3: Modelo de Interés */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">🏗️ 3. Modelo Arquitectónico de Interés</label>
                    <select
                      value={interestProduct || 'Por definir'}
                      onChange={(e) => setInterestProduct(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-slate-100 cursor-pointer focus:border-gold-500"
                    >
                      <option value="Por definir">❓ Por definir / En evaluación</option>
                      <option value="Flex Home EXP-36">🏠 Flex Home EXP-36 (36m² - $118.800.000 COP)</option>
                      <option value="Flex Home EXP-56">🏡 Flex Home EXP-56 (56m² - A Medida / $188.000.000 COP)</option>
                      <option value="Flex Home (Vivienda Modular)">🏡 Flex Home (Vivienda Propia o Campestre)</option>
                      <option value="Cápsula Living CL-13">🏕️ Cápsula Living CL-13 (13m² - $78.000.000 COP)</option>
                      <option value="Cápsula Living CL-26">🚀 Cápsula Living CL-26 (26m² - $148.800.000 COP)</option>
                      <option value="Glamping & Turismo">🌿 Glamping, Hotelería o Turismo Modular</option>
                      <option value="Bodega Industrial">🏢 Bodega Industrial / Estructura Acero</option>
                      {interestProduct && !["Por definir", "Flex Home EXP-36", "Flex Home EXP-56", "Flex Home (Vivienda Modular)", "Cápsula Living CL-13", "Cápsula Living CL-26", "Glamping & Turismo", "Bodega Industrial"].includes(interestProduct) && (
                        <option value={interestProduct}>📌 {interestProduct}</option>
                      )}
                    </select>
                  </div>

                  {/* Pilar 4: Perfil del Cliente / Comprador */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">💼 4. Perfil del Cliente / Comprador</label>
                    <select
                      value={clientType || 'Por definir'}
                      onChange={(e) => setClientType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-black text-slate-900 dark:text-slate-100 cursor-pointer focus:border-gold-500"
                    >
                      <option value="Por definir">❓ Por definir</option>
                      <option value="Persona Natural">🏠 Persona Natural (Vivienda Propia / Campestre)</option>
                      <option value="Empresario">🏢 Empresario / Uso Corporativo / Sede</option>
                      <option value="Inversionista">💼 Inversionista / Desarrollador Turístico</option>
                    </select>
                  </div>
                </div>

                {/* Columna Derecha: Evaluación Financiera & Datos de Contacto */}
                <div className="space-y-4 flex flex-col justify-between">
                  {/* Tarjeta Financiera */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gold-500" />
                      <span>Evaluación Financiera & Cotizaciones ($COP)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Presupuesto ($ COP)</label>
                        <input
                          type="number"
                          value={estimatedBudget}
                          onChange={(e) => setEstimatedBudget(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500"
                          placeholder="Ej: 150000000"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Valor Cotizado ($ COP)</label>
                        <input
                          type="number"
                          value={quotedValue}
                          onChange={(e) => setQuotedValue(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-gold-500/40 rounded-xl px-3 py-2 text-xs font-mono tabular-nums font-black text-gold-600 dark:text-gold-400 focus:outline-none focus:border-gold-500"
                          placeholder="Ej: 78500000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Propuesta PDF (Enlace)</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={proposalPdfUrl}
                          onChange={(e) => setProposalPdfUrl(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500"
                          placeholder="https://anclaspecialprojects.com/cotizacion.pdf"
                        />
                        {proposalPdfUrl && (
                          <a
                            href={proposalPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] px-3 py-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 shadow-sm shadow-gold-500/20"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta de Contacto Directo */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <User className="w-4 h-4 text-gold-500" />
                      <span>Datos Directos del Titular</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Apellido</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bloque 1C: Selectores de Viabilidad Comercial */}
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">¿Respondió al Contacto?</label>
                    <select
                      value={contactResponseStatus}
                      onChange={(e) => setContactResponseStatus(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="ANSWERED">🟢 Sí respondió / Atendido</option>
                      <option value="NO_ANSWER">🟡 Sin respuesta / Buzón</option>
                      <option value="BUSY">🔴 Ocupado / Reagendar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Presupuesto Confirmado</label>
                    <select
                      value={hasConfirmedBudget ? 'true' : 'false'}
                      onChange={(e) => setHasConfirmedBudget(e.target.value === 'true')}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="true">✅ Sí, presupuesto verificado</option>
                      <option value="false">❌ No / En trámite de crédito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Viabilidad de Cierre</label>
                    <select
                      value={commercialViability}
                      onChange={(e) => setCommercialViability(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="HIGH">🟢 Alta Viabilidad (Prioridad)</option>
                      <option value="MEDIUM">🟡 Media (En Evaluación)</option>
                      <option value="LOW">🔴 Baja (Objeción fuerte)</option>
                      <option value="CLOSED">⏹️ Cerrado / Descartado</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* PESTAÑA 2: RESUMEN IA & HISTORIAL CRONOLÓGICO                         */}
          {/* ==================================================================== */}
          {activeTab === 'resumen_ia' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Bloque 2A: Resumen Ejecutivo Sofi AI */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-slate-500/5 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-slate-950/30 border border-purple-500/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Sofi AI Executive Summary</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={generatingAiSummary}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingAiSummary ? 'animate-spin' : ''}`} />
                    <span>{generatingAiSummary ? 'Analizando Chat...' : 'Actualizar Resumen IA'}</span>
                  </button>
                </div>

                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed bg-white dark:bg-navy-800 p-4 rounded-xl border border-purple-500/20 shadow-inner">
                  {qualificationNotes || (
                    <span className="text-slate-400 italic">
                      Presiona "Actualizar Resumen IA" para analizar la conversación de WhatsApp y generar los puntos clave de este cliente.
                    </span>
                  )}
                </div>
              </div>

              {/* Bloque 2B: Registro Interactivo de Atención (Bitácora Pro) */}
              <form onSubmit={handleAddBitacoraNote} className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-gold-500" />
                    <span>Registrar Nueva Atención Comercial</span>
                  </span>
                </div>

                {/* Tipo de Atención */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Canal de Contacto</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'LLAMADA', label: '📞 Llamada' },
                      { id: 'VIRTUAL', label: '💻 Asesoría Virtual' },
                      { id: 'SHOWROOM', label: '🏢 Showroom Armenia' },
                      { id: 'SEGUIMIENTO', label: '📝 Nota Interna' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewNoteType(t.id)}
                        className={`min-h-[44px] p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          newNoteType === t.id
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 font-black shadow-sm'
                            : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resultado 1-Clic */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Resultado de la Llamada</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CALL_RESULTS.map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setCallResult(res.id)}
                        className={`min-h-[44px] p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          callResult === res.id
                            ? `${res.color} shadow-sm ring-1 ring-gold-500/50 scale-[1.01]`
                            : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{res.icon}</span>
                        <span className="truncate">{res.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Objeción y Próxima Acción */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Objeción Detectada</label>
                    <select
                      value={detectedObjection}
                      onChange={(e) => setDetectedObjection(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      {OBJECTIONS.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.icon} {obj.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Próximo Paso / Compromiso</label>
                    <select
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      {NEXT_ACTIONS.map(act => (
                        <option key={act.id} value={act.id}>{act.icon} {act.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Notas Detalladas</label>
                    <button
                      type="button"
                      onClick={handleVoiceDictation}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${
                        isListening 
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/30 hover:bg-gold-500/20'
                      }`}
                      title="Habla a tu micrófono para dictar la nota automáticamente"
                    >
                      <span>🎙️</span>
                      <span>{isListening ? 'Escuchando Voz...' : 'Dictar por Voz'}</span>
                    </button>
                  </div>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    placeholder="Escribe o dicta detalles clave de la llamada o atención..."
                    className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-[44px] px-4 py-2 bg-navy-900 dark:bg-gold-500 hover:bg-navy-800 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar Nota en Bitácora</span>
                  </button>
                </div>
              </form>

              {/* Bloque 2C: Historial Cronológico de Atenciones (Línea de Tiempo Vertical Salesforce/HubSpot) */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Línea de Tiempo & Historial Cronológico ({bitacoraNotes.length} Registros)
                </span>

                {bitacoraNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700">
                    No hay atenciones registradas aún para este prospecto.
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-navy-700">
                    {bitacoraNotes.map((n) => {
                      const resObj = CALL_RESULTS.find(r => r.id === n.call_result);
                      const objObj = OBJECTIONS.find(o => o.id === n.detected_objection);
                      const nextObj = NEXT_ACTIONS.find(a => a.id === n.next_action);

                      return (
                        <div key={n.id} className="relative p-4 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 space-y-2 shadow-sm">
                          {/* Punto conector de la línea de tiempo */}
                          <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-gold-500 border-2 border-white dark:border-navy-950 shadow-xs" />

                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-700 pb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                                {n.note_type}
                              </span>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                👤 {n.author_name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono tabular-nums text-slate-400 font-bold">
                              📅 {formatBogotaDateTime(n.created_at)}
                            </span>
                          </div>

                        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                          {resObj && (
                            <span className={`px-2 py-0.5 rounded-md border ${resObj.color}`}>
                              {resObj.icon} {resObj.label}
                            </span>
                          )}
                          {objObj && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {objObj.icon} {objObj.label}
                            </span>
                          )}
                          {nextObj && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                              {nextObj.icon} {nextObj.label}
                            </span>
                          )}
                        </div>

                        {n.content && (
                          <p className="text-xs text-slate-900 dark:text-slate-100 font-medium whitespace-pre-line pt-1">
                            {n.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* PESTAÑA 3: DOCUMENTACIÓN & BÓVEDA DE CUSTODIA                         */}
          {/* ==================================================================== */}
          {activeTab === 'documentacion' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Bóveda de Documentos Legales y Pagos (Dinámica: Persona Natural vs Jurídica) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-700 pb-3.5">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-gold-500" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                        Bóveda de Documentación Legal & Custodia
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Normativa DIAN y Comercial de Colombia
                      </span>
                    </div>
                  </div>

                  {/* Selector Toggle Persona Natural vs Persona Jurídica */}
                  <div className="flex items-center bg-slate-100 dark:bg-navy-800 p-1 rounded-xl border border-slate-200 dark:border-navy-700 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setClientType('Persona Natural')}
                      className={`min-h-[44px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        clientType !== 'Persona Jurídica' && clientType !== 'Empresa' && clientType !== 'Inversionista'
                          ? 'bg-white dark:bg-gold-500 text-gold-600 dark:text-navy-950 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Persona Natural</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientType('Persona Jurídica')}
                      className={`min-h-[44px] px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        clientType === 'Persona Jurídica' || clientType === 'Empresa' || clientType === 'Inversionista'
                          ? 'bg-white dark:bg-gold-500 text-gold-600 dark:text-navy-950 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Persona Jurídica / Empresa</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Ranuras Dinámicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {(() => {
                    const isJuridica = clientType === 'Persona Jurídica' || clientType === 'Empresa' || clientType === 'Inversionista';
                    
                    const docSlots = isJuridica ? [
                      { key: 'camara_comercio', label: 'Cámara de Comercio (Máx. 30 días)', desc: 'Certificado de Existencia y Rep. Legal', icon: Building2, color: 'text-indigo-500', url: docCamaraComercioUrl },
                      { key: 'rut', label: 'RUT de la Empresa (NIT - DIAN)', desc: 'Régimen tributario y facturación', icon: FileText, color: 'text-purple-500', url: docRutUrl },
                      { key: 'rep_legal', label: 'Cédula Representante Legal', desc: 'Identificación oficial del firmante', icon: User, color: 'text-blue-500', url: docRepLegalUrl },
                      { key: 'comprobante', label: 'Comprobante Anticipo 50%', desc: 'Soporte de pago o transferencia', icon: DollarSign, color: 'text-gold-500', url: docComprobanteUrl },
                      { key: 'contrato', label: 'Contrato de Compraventa ANCLA', desc: 'Documento comercial suscrito', icon: ShieldCheck, color: 'text-amber-500', url: docContratoUrl }
                    ] : [
                      { key: 'cedula', label: 'Documento Identidad (Cédula / CE)', desc: 'Identificación oficial del titular', icon: User, color: 'text-blue-500', url: docCedulaUrl },
                      { key: 'rut', label: 'RUT Actualizado (DIAN)', desc: 'Requisito para Facturación Electrónica', icon: FileText, color: 'text-purple-500', url: docRutUrl },
                      { key: 'comprobante', label: 'Comprobante Anticipo 50%', desc: 'Soporte de pago o transferencia', icon: DollarSign, color: 'text-gold-500', url: docComprobanteUrl },
                      { key: 'contrato', label: 'Contrato de Compraventa ANCLA', desc: 'Documento comercial suscrito', icon: ShieldCheck, color: 'text-amber-500', url: docContratoUrl }
                    ];

                    return docSlots.map((doc) => {
                      const DocIcon = doc.icon;
                      const isUploading = uploadingDoc === doc.key;
                      const hasDoc = !!doc.url;

                      return (
                        <div key={doc.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 gap-2 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-600">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className={`p-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-100 dark:border-navy-700 ${doc.color} shrink-0`}>
                              <DocIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">{doc.label}</span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {hasDoc ? '✅ Documento cargado en custodia' : doc.desc}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                            {hasDoc && (
                              <a
                                href={doc.url.startsWith('http') ? doc.url : `${API_URL}/media/${doc.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="min-h-[44px] px-3 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-[10px] flex items-center space-x-1 transition-all"
                                title="Ver / Descargar archivo"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Ver</span>
                              </a>
                            )}

                            <label className={`min-h-[44px] px-3 py-2 rounded-xl font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-all ${
                              isUploading 
                                ? 'bg-slate-200 dark:bg-navy-800 text-slate-400' 
                                : hasDoc 
                                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300'
                                : 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 shadow-sm shadow-gold-500/20'
                            }`}>
                              <Upload className="w-3 h-3" />
                              <span>{isUploading ? 'Subiendo...' : hasDoc ? 'Reemplazar' : 'Subir'}</span>
                              <input
                                type="file"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => handleUploadDocument(e, doc.key)}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Personalizaciones y Acabados de Fábrica */}
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-sm space-y-3.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Especificaciones de Acabados & Personalización</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Color Fachada Exterior</label>
                    <input
                      type="text"
                      value={exteriorColor}
                      onChange={(e) => setExteriorColor(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Muros Interiores</label>
                    <input
                      type="text"
                      value={interiorWalls}
                      onChange={(e) => setInteriorWalls(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Pisos Interiores</label>
                    <input
                      type="text"
                      value={flooringType}
                      onChange={(e) => setFlooringType(e.target.value)}
                      className="w-full bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. FOOTER CON BOTÓN ESMERALDA Y NOTIFICACIÓN */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900 flex items-center justify-between shrink-0 safe-area-bottom">
          <div>
            {savedSuccess && (
              <span className="text-xs font-black text-gold-600 dark:text-gold-400 flex items-center space-x-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
                <span>¡Ficha Técnica 360° Guardada con Éxito!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-navy-800 transition-all cursor-pointer"
            >
              Cerrar
            </button>
            
            {/* Botón Principal Guardar — Gradiente Dorado ANCLA */}
            <button
              type="button"
              onClick={handleSave360}
              disabled={saving}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all active:scale-95 cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardar Ficha 360°</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SUB-MODALES */}
        {showChinaSpecs && (
          <ChinaSpecSheetModal
            isOpen={showChinaSpecs}
            contact={contact}
            onClose={() => setShowChinaSpecs(false)}
          />
        )}

        {showDossierModal && (
          <AnclaTechnicalDossier
            isOpen={showDossierModal}
            contact={contact}
            onClose={() => setShowDossierModal(false)}
            onSaveDossier={(dossierData) => {
              const valCOP = dossierData.totalCOP || dossierData.totalUSD;
              if (dossierData.modelName) setInterestProduct(dossierData.modelName);
              if (valCOP) setQuotedValue(valCOP);
              if (dossierData.exteriorColor) {
                const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valCOP);
                const dep50 = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valCOP * 0.5);
                setProposalNotes(`Modelo: ${dossierData.modelName} | Total: ${formattedTotal} COP (50% Anticipo: ${dep50} / 50% Balanza: ${dep50}) | Acabados: ${dossierData.exteriorColor}`);
              }
            }}
          />
        )}

      </div>
    </div>
  );
}
