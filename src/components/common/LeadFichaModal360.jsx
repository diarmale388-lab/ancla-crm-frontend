import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Phone, Mail, MapPin, Building2, DollarSign, Calendar as CalendarIcon, 
  FileText, Check, MessageSquare, AlertCircle, Clock, Send, ShieldCheck, Flame, 
  User, CheckCircle2, FileUp, ExternalLink, HelpCircle, RefreshCw, MessageCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import TimelineView from './TimelineView';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

const QUALIFICATION_LEVELS = [
  { id: 'VIP', label: 'VIP Alta Intención', icon: '🚀', color: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40' },
  { id: 'HOT', label: 'Caliente (Cita/Claro)', icon: '🟢', color: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' },
  { id: 'WARM', label: 'Tibio (En Evaluación)', icon: '🟡', color: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40' },
  { id: 'COLD', label: 'Frío (Primer Contacto)', icon: '🔴', color: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40' },
  { id: 'DISCARDED', label: 'Descartado / Sin Presupuesto', icon: '⏸️', color: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/40' }
];

const CALL_RESULTS = [
  { id: 'INTERESTED', label: 'Contestó / Interesado', icon: '🟢', color: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' },
  { id: 'RESCHEDULE', label: 'Solicitó Reagendar', icon: '📅', color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30' },
  { id: 'NO_ANSWER', label: 'Sin Respuesta / Buzón', icon: '🔴', color: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30' },
  { id: 'SHOWROOM_CONFIRMED', label: 'Confirmó Showroom', icon: '🏢', color: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30' },
  { id: 'QUOTATION_REQUESTED', label: 'Solicitó Cotización PDF', icon: '📄', color: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30' },
  { id: 'REJECTED', label: 'Descartado / Sin Presupuesto', icon: '❌', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30' }
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

  // Estados Locales Formulario Ficha 360°
  const [firstName, setFirstName] = useState(contact.first_name || '');
  const [lastName, setLastName] = useState(contact.last_name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [lotCity, setLotCity] = useState(contact.lot_city || '');
  const [lotStatus, setLotStatus] = useState(contact.lot_status || 'Sí, ya tengo');
  const [interestProduct, setInterestProduct] = useState(contact.interest_product || 'Vivienda Propia o Campestre');
  const [clientType, setClientType] = useState(contact.client_type || 'Persona Natural');
  const [preferredMethod, setPreferredMethod] = useState(contact.preferred_contact_method || 'Llamada telefónica');
  const [estimatedBudget, setEstimatedBudget] = useState(contact.estimated_budget || '');
  const [qualificationLevel, setQualificationLevel] = useState(contact.qualification_level || 'WARM');
  const [qualificationNotes, setQualificationNotes] = useState(contact.qualification_notes || '');
  const [advisorStatus, setAdvisorStatus] = useState(contact.advisor_status || '');

  // Nuevos Campos Extendidos Ficha Técnica 360°
  const [commercialViability, setCommercialViability] = useState(contact.commercial_viability || 'HIGH');
  const [hasConfirmedBudget, setHasConfirmedBudget] = useState(contact.has_confirmed_budget ?? true);
  const [contactResponseStatus, setContactResponseStatus] = useState(contact.contact_response_status || 'ANSWERED');
  const [quotedValue, setQuotedValue] = useState(contact.quoted_value || '');
  const [proposalPdfUrl, setProposalPdfUrl] = useState(contact.proposal_pdf_url || '');
  const [proposalNotes, setProposalNotes] = useState(contact.proposal_notes || '');

  // Bitácora de Atención Comercial
  const [bitacoraNotes, setBitacoraNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState('LLAMADA');
  const [loadingBitacora, setLoadingBitacora] = useState(false);

  // Generando resumen con Sofi AI
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  // Notificación de éxito
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar notas de la bitácora al abrir
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

  // Estados Bitácora Comercial Pro 360°
  const [callResult, setCallResult] = useState('INTERESTED');
  const [constructionTimeline, setConstructionTimeline] = useState('1_TO_3_MONTHS');
  const [detectedObjection, setDetectedObjection] = useState('NONE');
  const [nextAction, setNextAction] = useState('RECALL');
  const [nextActionDate, setNextActionDate] = useState('');

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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Encabezado Maestro de la Ficha Técnica 360° */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-dark-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-md">
              {contact.first_name ? contact.first_name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  {contact.first_name || 'Prospecto'} {contact.last_name || ''}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  ID #{contact.id}
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {contact.source || 'Meta Ads'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <span>📱 {contact.phone}</span>
                {contact.lot_city && <span>• 📍 {contact.lot_city}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
            {/* BOTÓN 1: IR AL CHAT DENTRO DEL CRM */}
            <button
              type="button"
              onClick={handleOpenCrmChat}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 Ir al Chat en CRM</span>
            </button>

            {/* BOTÓN 2: ABRIR WHATSAPP WEB */}
            <a
              href={`https://wa.me/${contact.phone.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 flex items-center space-x-1.5 transition-all"
              title="Abrir en WhatsApp Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>Web</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* Bloque 0: Resumen Ejecutivo Inteligente del Chat (Sofi AI Summary) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/10 via-indigo-900/5 to-slate-900/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-950/40 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Resumen Inteligente del Chat (Generado por Sofi AI)</span>
              </span>

              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={generatingAiSummary}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {generatingAiSummary ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{generatingAiSummary ? 'Analizando Chat...' : '🤖 Actualizar Resumen IA'}</span>
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed bg-white/80 dark:bg-dark-900/80 p-4 rounded-xl border border-purple-500/20 shadow-inner">
              {qualificationNotes || (
                <span className="text-slate-400 italic">
                  Presiona "🤖 Actualizar Resumen IA" para analizar la conversación de WhatsApp de este cliente y generar un resumen ejecutivo en 4 viñetas clave.
                </span>
              )}
            </div>
          </div>

          {/* Bloque 1: Clasificación Comercial & Evaluación de Viabilidad (Sin Repeticiones) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-emerald-500" />
              <span>Clasificación Comercial 1-Clic & Evaluación de Viabilidad</span>
            </span>

            {/* Clasificación 1-Clic */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUALIFICATION_LEVELS.map((lvl) => {
                const isSelected = qualificationLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setQualificationLevel(lvl.id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${lvl.color} shadow-md scale-[1.02] ring-2 ring-emerald-500/50`
                        : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>{lvl.icon}</span>
                    <span className="truncate">{lvl.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Selectores de Viabilidad Comercial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">¿Respondió al Contacto?</label>
                <select
                  value={contactResponseStatus}
                  onChange={(e) => setContactResponseStatus(e.target.value)}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="ANSWERED">🟢 Sí respondió / Atendido</option>
                  <option value="NO_ANSWER">🟡 Sin respuesta / Envió buzón</option>
                  <option value="BUSY">🔴 Ocupado / Reagendar luego</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">¿Tiene Presupuesto Confirmado?</label>
                <select
                  value={hasConfirmedBudget ? 'true' : 'false'}
                  onChange={(e) => setHasConfirmedBudget(e.target.value === 'true')}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="true">✅ Sí, cuenta con presupuesto verificado</option>
                  <option value="false">❌ No / En definición de crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Viabilidad Comercial (¿Continuar?)</label>
                <select
                  value={commercialViability}
                  onChange={(e) => setCommercialViability(e.target.value)}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="HIGH">🟢 Alta Viabilidad (Seguimiento Prioritario)</option>
                  <option value="MEDIUM">🟡 En Seguimiento (Interés medio)</option>
                  <option value="LOW">🔴 Baja Viabilidad (Poco interés/presupuesto)</option>
                  <option value="CLOSED">⏹️ Cerrar Lead / Descartado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bloque 2: Dossier de Requerimientos Técnicos del Proyecto */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Requerimientos del Proyecto & Perfil del Cliente</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Ubicación del Lote (Ciudad/Depto)</label>
                <input
                  type="text"
                  value={lotCity}
                  onChange={(e) => setLotCity(e.target.value)}
                  placeholder="Ej: Nemocón, Cundinamarca / Armenia"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Estado del Lote / Terreno</label>
                <select
                  value={lotStatus}
                  onChange={(e) => setLotStatus(e.target.value)}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Sí, ya tengo">Sí, ya tengo lote propio</option>
                  <option value="Buscando Lote">Buscando Lote / Terreno</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Modelo / Proyecto de Interés</label>
                <select
                  value={interestProduct}
                  onChange={(e) => setInterestProduct(e.target.value)}
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Vivienda Propia o Campestre">Vivienda Propia o Campestre</option>
                  <option value="Glamping, Hotelería o Turismo">Glamping, Hotelería o Turismo</option>
                  <option value="Flex Home">Flex Home (Modular)</option>
                  <option value="Cápsula Living">Cápsula Living</option>
                  <option value="Llave en Mano">Llave en Mano (Proyecto Integral)</option>
                  <option value="Oficina / Local Comercial">Oficina / Local Comercial</option>
                  <option value="Casa de Campo Personalizada">Casa de Campo Personalizada</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Presupuesto Estimado ($ COP)</label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder="Ej: 150000000"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Módulo de Cotizaciones, Propuestas PDF & Valor Comercial */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
              <FileUp className="w-4 h-4 text-emerald-500" />
              <span>Gestión de Cotización Comercial & Propuesta PDF</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Valor Cotizado ($ COP)</label>
                <input
                  type="number"
                  value={quotedValue}
                  onChange={(e) => setQuotedValue(e.target.value)}
                  placeholder="Ej: 185000000"
                  className="w-full bg-white dark:bg-dark-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-black text-emerald-800 dark:text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Enlace / URL de la Propuesta PDF</label>
                <input
                  type="url"
                  value={proposalPdfUrl}
                  onChange={(e) => setProposalPdfUrl(e.target.value)}
                  placeholder="https://anclaspecialprojects.com/cotizacion-386.pdf"
                  className="w-full bg-white dark:bg-dark-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {proposalPdfUrl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-dark-900 border border-emerald-500/20">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Documento de Cotización PDF listo para enviar al cliente</span>
                </span>
                <a
                  href={proposalPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <span>Ver PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Bloque 4: Bitácora Comercial Pro 360° (Entrada Interactiva 1-Clic & Timeline) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Bitácora Comercial Pro 360° & Registro de Atención (1-Clic)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Interactive Advisor Log
              </span>
            </div>

            {/* Formulario Interactivo con Micro-Chips */}
            <form onSubmit={handleAddBitacoraNote} className="space-y-4 p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-white/5 shadow-sm">
              
              {/* Selector Modo de Atención */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">1. Tipo / Canal de Atención</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'LLAMADA', label: '📞 Llamada Telefónica' },
                    { id: 'VIRTUAL', label: '💻 Asesoría Virtual (Meet)' },
                    { id: 'SHOWROOM', label: '🏢 Visita Showroom Armenia' },
                    { id: 'SEGUIMIENTO', label: '📝 Nota de Seguimiento' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewNoteType(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        newNoteType === t.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-dark-950 border-slate-900 font-black shadow'
                          : 'bg-slate-50 dark:bg-dark-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector Resultado de la Atención (1-Clic) */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">2. Resultado de la Atención (1-Clic)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CALL_RESULTS.map(res => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setCallResult(res.id)}
                      className={`p-2 rounded-xl border text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        callResult === res.id
                          ? `${res.color} shadow-sm ring-2 ring-emerald-500/40 scale-[1.01]`
                          : 'bg-slate-50 dark:bg-dark-950/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{res.icon}</span>
                      <span className="truncate">{res.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2 Columnas: Tiempo de Construcción & Objeción Detectada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {/* Tiempo de Construcción */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">3. Tiempo Estimado para Construir</label>
                  <select
                    value={constructionTimeline}
                    onChange={(e) => setConstructionTimeline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                  >
                    {TIMELINES.map(tl => (
                      <option key={tl.id} value={tl.id}>{tl.icon} {tl.label}</option>
                    ))}
                  </select>
                </div>

                {/* Objeción Detectada */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">4. Objeción / Freno Detectado</label>
                  <select
                    value={detectedObjection}
                    onChange={(e) => setDetectedObjection(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                  >
                    {OBJECTIONS.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.icon} {obj.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2 Columnas: Próxima Acción & Fecha de Recordatorio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">5. Próximo Paso / Compromiso</label>
                  <select
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                  >
                    {NEXT_ACTIONS.map(act => (
                      <option key={act.id} value={act.id}>{act.icon} {act.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">📅 Fecha/Hora Recordatorio (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Anotaciones Específicas Libres */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">6. Anotaciones Clave de la Atención (Libre)</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={2}
                  placeholder="Escribe detalles importantes (ej: cliente confirma terreno plano en Nemocón, le interesa casa de 120m2 con 3 alcobas y deck sintético)..."
                  className="w-full bg-slate-50 dark:bg-dark-950/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>💾 Registrar Atención en Bitácora Pro 360°</span>
                </button>
              </div>

            </form>

            {/* Timeline Ejecutivo de Notas Guardadas */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Historial Cronológico de Atenciones</span>
              
              {bitacoraNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-white dark:bg-dark-900 rounded-xl border border-slate-200/60 dark:border-white/5">
                  No hay atenciones ni notas registradas aún en la bitácora.
                </p>
              ) : (
                bitacoraNotes.map((n) => {
                  const resObj = CALL_RESULTS.find(r => r.id === n.call_result);
                  const timeObj = TIMELINES.find(t => t.id === n.construction_timeline);
                  const objObj = OBJECTIONS.find(o => o.id === n.detected_objection);
                  const nextObj = NEXT_ACTIONS.find(a => a.id === n.next_action);

                  return (
                    <div key={n.id} className="p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10 space-y-2.5 shadow-sm">
                      {/* Cabecera Tarjeta Timeline */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                            {n.note_type === 'LLAMADA' ? '📞 Llamada' : n.note_type === 'VIRTUAL' ? '💻 Virtual Meet' : n.note_type === 'SHOWROOM' ? '🏢 Showroom' : '📝 Nota'}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {n.author_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Badges Estructurados (1-Clic Data) */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold">
                        {resObj && (
                          <span className={`px-2 py-0.5 rounded-md border ${resObj.color}`}>
                            {resObj.icon} {resObj.label}
                          </span>
                        )}
                        {timeObj && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            {timeObj.icon} {timeObj.label}
                          </span>
                        )}
                        {objObj && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {objObj.icon} {objObj.label}
                          </span>
                        )}
                      </div>

                      {/* Próxima Acción & Recordatorio */}
                      {(nextObj || n.next_action_date) && (
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span>🔔 Próximo Paso:</span>
                            <span>{nextObj ? `${nextObj.icon} ${nextObj.label}` : 'Seguimiento'}</span>
                          </span>
                          {n.next_action_date && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-white">
                              📅 {new Date(n.next_action_date).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contenido Texto Libre */}
                      {n.content && (
                        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed pt-1">
                          {n.content}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bloque 4: Bóveda de Documentos del Expediente (Cédula/RUT, Escrituras, Pagos, Contratos) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bóveda de Documentos & Archivos del Expediente</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Documento Identidad (Cédula/RUT)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Sin Adjuntar</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Escrituras / Certificado Lote</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Sin Adjuntar</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Comprobante de Pago / Anticipo</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Sin Adjuntar</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Contrato de Compraventa ANCLA</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">Sin Adjuntar</span>
              </div>
            </div>
          </div>

          {/* Bloque 5: Personalizaciones del Cliente (Especificaciones de Diseño) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Personalizaciones & Acabados del Cliente</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Color Fachada Exterior</label>
                <input
                  type="text"
                  placeholder="ej. Negro Industrial / Madera Teka"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Acabado Muros Interiores</label>
                <input
                  type="text"
                  placeholder="ej. Paneles Blancos Termoacústicos"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Tipo de Piso</label>
                <input
                  type="text"
                  placeholder="ej. PVC SPC Vetas Madera"
                  className="w-full bg-white dark:bg-dark-900 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer del Modal con Botones Guardar y Notificaciones */}
        <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-dark-950/80 flex items-center justify-between">
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave360}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-2"
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

      </div>
    </div>
  );
}
