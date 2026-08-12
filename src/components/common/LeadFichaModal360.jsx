import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Phone, Mail, MapPin, Building2, DollarSign, Calendar as CalendarIcon, 
  FileText, Check, MessageSquare, AlertCircle, Clock, Send, ShieldCheck, Flame, 
  User, CheckCircle2, FileUp, ExternalLink, HelpCircle, RefreshCw, MessageCircle, 
  Factory, FolderLock, UserCheck, Activity, Layers, ArrowUpRight, Upload
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import ChinaSpecSheetModal from '../showroom/ChinaSpecSheetModal';
import AnclaTechnicalDossier from './AnclaTechnicalDossier';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

const QUALIFICATION_LEVELS = [
  { id: 'VIP', label: 'VIP Alta Intención', icon: '🚀' },
  { id: 'HOT', label: 'Caliente (Cita Lista)', icon: '🟢' },
  { id: 'WARM', label: 'Tibio (En Evaluación)', icon: '🟡' },
  { id: 'COLD', label: 'Frío (Primer Contacto)', icon: '🔵' },
  { id: 'DISCARDED', label: 'Descartado / Pausado', icon: '⚪' }
];

const CALL_RESULTS = [
  { id: 'INTERESTED', label: 'Contestó / Interesado', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'RESCHEDULE', label: 'Solicitó Reagendar', icon: '📅', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  { id: 'NO_ANSWER', label: 'Sin Respuesta / Buzón', icon: '🔴', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  { id: 'SHOWROOM_CONFIRMED', label: 'Confirmó Showroom', icon: '🏢', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30' },
  { id: 'QUOTATION_REQUESTED', label: 'Solicitó Cotización PDF', icon: '📄', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  { id: 'REJECTED', label: 'Descartado / Sin Presupuesto', icon: '❌', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30' }
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

  // Pestaña Activa: 'perfil', 'resumen_ia', 'documentacion'
  const [activeTab, setActiveTab] = useState('perfil');

  // Estados Formulario Ficha 360°
  const [firstName, setFirstName] = useState(contact.first_name || '');
  const [lastName, setLastName] = useState(contact.last_name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [lotCity, setLotCity] = useState(contact.lot_city || '');
  const [lotStatus, setLotStatus] = useState(contact.lot_status || 'Sí, ya tengo');
  const [interestProduct, setInterestProduct] = useState(contact.interest_product || 'Flex Home EXP-36');
  const [clientType, setClientType] = useState(contact.client_type || 'Persona Natural');
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

  // Acabados y Personalización (Pestaña 3)
  const [exteriorColor, setExteriorColor] = useState('Negro Mate Industrial (RAL 9005)');
  const [interiorWalls, setInteriorWalls] = useState('Paneles Termoacústicos Blancos 75mm');
  const [flooringType, setFlooringType] = useState('PVC SPC Alto Tráfico Vetas Madera');

  // Documentos en Bóveda Legal & Custodia
  const [docCedulaUrl, setDocCedulaUrl] = useState(contact.doc_cedula_url || '');
  const [docEscrituraUrl, setDocEscrituraUrl] = useState(contact.doc_escritura_url || '');
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
        else if (docKey === 'escritura') setDocEscrituraUrl(fileUrl);
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
          author_name: "Liliana / Asesor"
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
          proposal_notes: proposalNotes
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fade-in font-sans">
      
      {/* Contenedor Principal con Dual Theme: #f8fafc en Claro / #0b0f19 en Oscuro */}
      <div className="bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#334155] rounded-3xl w-full max-w-5xl h-[92vh] max-h-[880px] flex flex-col shadow-2xl overflow-hidden text-[#0f172a] dark:text-[#f8fafc] transition-colors">
        
        {/* 1. HEADER COMPACTO & ACCIONES RÁPIDAS (Paneles: #f1f5f9 / #0f172a) */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f1f5f9] dark:bg-[#0f172a] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
              {contact.first_name ? contact.first_name[0].toUpperCase() : 'C'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-base font-black text-[#0f172a] dark:text-[#f8fafc] truncate">
                  {contact.first_name || 'Prospecto'} {contact.last_name || ''}
                </h3>
                <span className="text-[10px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ID #{contact.id}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {contact.source || 'Meta Ads'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono tabular-nums">
                <span>📱 {contact.phone}</span>
                {contact.lot_city && <span className="font-sans">• 📍 {contact.lot_city}</span>}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-y-1.5">
            <button
              type="button"
              onClick={handleOpenCrmChat}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat CRM</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDossierModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dossier COP</span>
            </button>

            <button
              type="button"
              onClick={() => setShowChinaSpecs(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Ficha China</span>
            </button>

            <a
              href={`https://wa.me/${String(contact?.phone || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center space-x-1 transition-all"
              title="Abrir en WhatsApp Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>Web</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. BARRA DE 3 PESTAÑAS PRINCIPALES (ZERO SCROLL CHAOS) */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex items-center space-x-1 shrink-0">
          {[
            { id: 'perfil', label: 'Perfil & Requerimientos', icon: UserCheck },
            { id: 'resumen_ia', label: 'Resumen IA & Historial', icon: Sparkles },
            { id: 'documentacion', label: 'Documentación & Bóveda', icon: FolderLock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs font-black flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. CONTENIDO DEL MODAL (3 PESTAÑAS ESTRUCTURADAS) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ==================================================================== */}
          {/* PESTAÑA 1: PERFIL & REQUERIMIENTOS                                   */}
          {/* ==================================================================== */}
          {activeTab === 'perfil' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Bloque 1A: Selector Segmentado Unificado de Clasificación Comercial */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Clasificación Comercial 1-Clic</span>
                </span>
                
                {/* Selector Segmentado Unificado */}
                <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl flex gap-1">
                  {QUALIFICATION_LEVELS.map((lvl) => {
                    const isSelected = qualificationLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setQualificationLevel(lvl.id)}
                        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-white dark:bg-[#182235] text-[#0f172a] dark:text-[#f8fafc] shadow-xs ring-1 ring-emerald-500/40 font-extrabold' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span>{lvl.icon}</span>
                        <span className="truncate">{lvl.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bloque 1B: Grid de 2 Columnas para Datos de Contacto y Terreno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Columna Izquierda: Información de Contacto & Terreno */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-3.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Datos de Contacto & Terreno</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Apellido</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="Apellido"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-mono tabular-nums font-bold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="573001234567"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-semibold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Ubicación del Lote</label>
                      <input
                        type="text"
                        value={lotCity}
                        onChange={(e) => setLotCity(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-semibold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="Ej: Nemocón / Armenia"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Estado del Lote</label>
                      <select
                        value={lotStatus}
                        onChange={(e) => setLotStatus(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                      >
                        <option value="Sí, ya tengo">Sí, ya tengo lote propio</option>
                        <option value="Buscando Lote">Buscando Lote / Terreno</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Modelo, Presupuesto & Cotización */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-3.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Modelo & Evaluación Financiera</span>
                  </span>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Modelo de Interés</label>
                    <select
                      value={interestProduct}
                      onChange={(e) => setInterestProduct(e.target.value)}
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                    >
                      <option value="Flex Home EXP-36">Flex Home EXP-36 (36m² - $78.500.000 COP)</option>
                      <option value="Flex Home EXP-56">Flex Home EXP-56 (56m² - $126.500.000 COP)</option>
                      <option value="Cápsula Living CL-13">Cápsula Living CL-13 (13m² - $59.800.000 COP)</option>
                      <option value="Cápsula Living CL-26">Cápsula Living CL-26 (26m² - $104.000.000 COP)</option>
                      <option value="Glamping & Turismo">Glamping & Turismo Modular</option>
                      <option value="Llave en Mano">Llave en Mano (Proyecto Completo)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Presupuesto ($ COP)</label>
                      <input
                        type="number"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-mono tabular-nums font-bold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="Ej: 150000000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Valor Cotizado ($ COP)</label>
                      <input
                        type="number"
                        value={quotedValue}
                        onChange={(e) => setQuotedValue(e.target.value)}
                        className="w-full bg-white dark:bg-[#182235] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono tabular-nums font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                        placeholder="Ej: 78500000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Enlace / URL Propuesta PDF</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={proposalPdfUrl}
                        onChange={(e) => setProposalPdfUrl(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-semibold text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500"
                        placeholder="https://anclaspecialprojects.com/cotizacion.pdf"
                      />
                      {proposalPdfUrl && (
                        <a
                          href={proposalPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 hover:bg-emerald-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bloque 1C: Selectores de Viabilidad Comercial */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">¿Respondió al Contacto?</label>
                    <select
                      value={contactResponseStatus}
                      onChange={(e) => setContactResponseStatus(e.target.value)}
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
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
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
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
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
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
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingAiSummary ? 'animate-spin' : ''}`} />
                    <span>{generatingAiSummary ? 'Analizando Chat...' : 'Actualizar Resumen IA'}</span>
                  </button>
                </div>

                <div className="text-xs font-medium text-[#0f172a] dark:text-[#f8fafc] whitespace-pre-line leading-relaxed bg-white dark:bg-[#182235] p-4 rounded-xl border border-purple-500/20 shadow-inner">
                  {qualificationNotes || (
                    <span className="text-slate-400 italic">
                      Presiona "Actualizar Resumen IA" para analizar la conversación de WhatsApp y generar los puntos clave de este cliente.
                    </span>
                  )}
                </div>
              </div>

              {/* Bloque 2B: Registro Interactivo de Atención (Bitácora Pro) */}
              <form onSubmit={handleAddBitacoraNote} className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
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
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          newNoteType === t.id
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 font-black shadow-sm'
                            : 'bg-white dark:bg-[#182235] border-slate-200 dark:border-[#2e3b52] text-slate-600 dark:text-slate-300 hover:bg-slate-100'
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
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          callResult === res.id
                            ? `${res.color} shadow-sm ring-1 ring-emerald-500/50 scale-[1.01]`
                            : 'bg-white dark:bg-[#182235] border-slate-200 dark:border-[#2e3b52] text-slate-600 dark:text-slate-300 hover:bg-slate-100'
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
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
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
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc] cursor-pointer"
                    >
                      {NEXT_ACTIONS.map(act => (
                        <option key={act.id} value={act.id}>{act.icon} {act.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Notas Detalladas</label>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    placeholder="Escribe detalles clave de la atención..."
                    className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl p-3 text-xs font-medium text-[#0f172a] dark:text-[#f8fafc] focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar Nota en Bitácora</span>
                  </button>
                </div>
              </form>

              {/* Bloque 2C: Historial Cronológico de Atenciones */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Historial de Bitácora ({bitacoraNotes.length})
                </span>

                {bitacoraNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-[#334155]">
                    No hay atenciones registradas aún para este prospecto.
                  </p>
                ) : (
                  bitacoraNotes.map((n) => {
                    const resObj = CALL_RESULTS.find(r => r.id === n.call_result);
                    const objObj = OBJECTIONS.find(o => o.id === n.detected_objection);
                    const nextObj = NEXT_ACTIONS.find(a => a.id === n.next_action);

                    return (
                      <div key={n.id} className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] space-y-2 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {n.note_type}
                            </span>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {n.author_name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-slate-400">
                            {new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
                          <p className="text-xs text-[#0f172a] dark:text-[#f8fafc] font-medium whitespace-pre-line pt-1">
                            {n.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* PESTAÑA 3: DOCUMENTACIÓN & BÓVEDA DE CUSTODIA                         */}
          {/* ==================================================================== */}
          {activeTab === 'documentacion' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Bóveda de Documentos Legales y Pagos */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Bóveda de Documentación Legal & Custodia</span>
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-400">
                    4 Archivos Estándar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'cedula', label: 'Documento Identidad (Cédula/RUT)', icon: FileText, color: 'text-blue-500', url: docCedulaUrl },
                    { key: 'escritura', label: 'Escrituras / Certificado Lote', icon: FileText, color: 'text-purple-500', url: docEscrituraUrl },
                    { key: 'comprobante', label: 'Comprobante Anticipo 50%', icon: FileText, color: 'text-emerald-500', url: docComprobanteUrl },
                    { key: 'contrato', label: 'Contrato de Compraventa ANCLA', icon: FileText, color: 'text-amber-500', url: docContratoUrl }
                  ].map((doc) => {
                    const DocIcon = doc.icon;
                    const isUploading = uploadingDoc === doc.key;
                    const hasDoc = !!doc.url;

                    return (
                      <div key={doc.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] gap-2 shadow-xs">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <DocIcon className={`w-4 h-4 ${doc.color} shrink-0`} />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">{doc.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {hasDoc ? '✅ Documento cargado en servidor' : 'Pendiente de adjuntar'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                          {hasDoc && (
                            <a
                              href={doc.url.startsWith('http') ? doc.url : `${API_URL}/media/${doc.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center space-x-1 transition-all"
                              title="Ver / Descargar archivo"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Ver</span>
                            </a>
                          )}

                          <label className={`px-2.5 py-1 rounded-xl font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-all ${
                            isUploading 
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' 
                              : hasDoc 
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
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
                  })}
                </div>
              </div>

              {/* Personalizaciones y Acabados de Fábrica */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] shadow-sm space-y-3.5">
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
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Muros Interiores</label>
                    <input
                      type="text"
                      value={interiorWalls}
                      onChange={(e) => setInteriorWalls(e.target.value)}
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Pisos Interiores</label>
                    <input
                      type="text"
                      value={flooringType}
                      onChange={(e) => setFlooringType(e.target.value)}
                      className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f8fafc]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. FOOTER CON BOTÓN ESMERALDA Y NOTIFICACIÓN */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-[#f1f5f9] dark:bg-[#0f172a] flex items-center justify-between shrink-0">
          <div>
            {savedSuccess && (
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>¡Ficha Técnica 360° Guardada con Éxito!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cerrar
            </button>
            
            {/* Botón Principal Guardar en Verde Esmeralda */}
            <button
              type="button"
              onClick={handleSave360}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-2 disabled:opacity-50"
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
