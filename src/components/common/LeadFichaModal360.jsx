import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Phone, Mail, MapPin, Building2, DollarSign, Calendar as CalendarIcon, 
  FileText, Check, MessageSquare, AlertCircle, Clock, Send, ShieldCheck, Flame, 
  User, CheckCircle2, FileUp, ExternalLink, HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

const QUALIFICATION_LEVELS = [
  { id: 'VIP', label: 'VIP Alta Intención', icon: '🚀', color: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40' },
  { id: 'HOT', label: 'Caliente (Cita/Claro)', icon: '🟢', color: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40' },
  { id: 'WARM', label: 'Tibio (En Evaluación)', icon: '🟡', color: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40' },
  { id: 'COLD', label: 'Frío (Primer Contacto)', icon: '🔴', color: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/40' },
  { id: 'DISCARDED', label: 'Descartado / Sin Presupuesto', icon: '⏸️', color: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/40' }
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

  const handleAddBitacoraNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      const res = await fetch(`${API_URL}/chats/${contact.id}/bitacora`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note_type: newNoteType,
          content: newNoteContent,
          author_name: "Liliana / Asesor"
        })
      });
      if (res.ok) {
        setNewNoteContent('');
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

  const toggleAdvisorTag = async (tag) => {
    try {
      const res = await fetch(`${API_URL}/chats/${contact.id}/advisor-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          advisor_status: tag,
          mode: "toggle"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisorStatus(data.advisor_status);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error al actualizar estatus de asesor:", err);
    }
  };

  const isTagSelected = (tag) => {
    return (advisorStatus || '').split(',').map(t => t.strip ? t.strip() : t.trim()).includes(tag);
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

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <a
              href={`https://wa.me/${contact.phone.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir WhatsApp</span>
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

          {/* Bloque 0: Clasificación Comercial 1-Clic del Lead */}
          <div className="bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-emerald-500" />
              <span>Clasificación Comercial del Prospecto (Maduración 1-Clic)</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {QUALIFICATION_LEVELS.map((lvl) => {
                const isSelected = qualificationLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setQualificationLevel(lvl.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${lvl.color} shadow-md scale-[1.02] ring-2 ring-emerald-500/50`
                        : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{lvl.icon}</span>
                    <span className="truncate">{lvl.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloque 1: Dossier de Requerimientos Técnicos (Auto-Extracción IA) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Requerimientos del Proyecto & Ficha Técnica 360°</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Sofi AI Verified
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

          {/* Bloque 2: Evaluación & Control de Atención 1-Clic del Asesor */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Control de Atención & Evaluación de Viabilidad Comercial</span>
            </span>

            {/* Acciones 1-Clic */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => toggleAdvisorTag('CONTACT_MADE')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isTagSelected('CONTACT_MADE')
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black shadow-sm'
                    : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>📞/💻 Contacto Realizado</span>
              </button>

              <button
                type="button"
                onClick={() => toggleAdvisorTag('SHOWROOM_VISITED')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isTagSelected('SHOWROOM_VISITED')
                    ? 'bg-teal-500/20 border-teal-500 text-teal-800 dark:text-teal-300 font-black shadow-sm'
                    : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>🏢 Visitó Showroom</span>
              </button>

              <button
                type="button"
                onClick={() => toggleAdvisorTag('QUOTATION_SENT')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isTagSelected('QUOTATION_SENT')
                    ? 'bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 font-black shadow-sm'
                    : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>📑 Propuesta Enviada</span>
              </button>

              <button
                type="button"
                onClick={() => toggleAdvisorTag('NO_ANSWER')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  isTagSelected('NO_ANSWER')
                    ? 'bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300 font-black shadow-sm'
                    : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>🟡 Sin Respuesta</span>
              </button>
            </div>

            {/* Selectores de Viabilidad */}
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

          {/* Bloque 4: Bitácora de Atención Comercial (Historial de Notas del Asesor) */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-950/40 border border-slate-200/80 dark:border-white/10 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Bitácora de Atención Comercial & Seguimiento del Asesor</span>
            </span>

            {/* Formulario de entrada rápida de nota */}
            <form onSubmit={handleAddBitacoraNote} className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value)}
                  className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="LLAMADA">📞 Llamada Telefónica</option>
                  <option value="VIRTUAL">💻 Asesoría Virtual (Meet)</option>
                  <option value="SHOWROOM">🏢 Visita Showroom Armenia</option>
                  <option value="SEGUIMIENTO">📝 Nota Interna de Seguimiento</option>
                </select>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={2}
                  placeholder="Escribe notas de la atención (ej: cliente confirma lote plano en Nemocón, le interesa casa de 120m2, enviar propuesta el lunes)..."
                  className="flex-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Lista cronológica de notas guardadas */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {bitacoraNotes.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-3">No hay notas registradas aún en la bitácora.</p>
              ) : (
                bitacoraNotes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {n.note_type}
                        </span>
                        <span>{n.author_name}</span>
                      </span>
                      <span>{new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-pre-line">
                      {n.content}
                    </p>
                  </div>
                ))
              )}
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
