import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export default function SpecialAppointmentBanner({ contact, onActionSuccess }) {
  if (!contact) return null;

  const token = useAuthStore(state => state.token);
  const currentUser = useAuthStore(state => state.user);
  const isAdmin = currentUser?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [showCounterPicker, setShowCounterPicker] = useState(false);
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('18:30');
  const [statusMessage, setStatusMessage] = useState('');

  // Detectar si el contacto tiene una solicitud de cita especial pendiente
  const schedulingState = String(contact.scheduling_state || '').toUpperCase();
  const isSpecialPending = schedulingState.includes('SPECIAL_REQUEST') || schedulingState.includes('NOCTURNA') || schedulingState.includes('ESPECIAL');

  if (!isSpecialPending && !showCounterPicker) return null;

  const handleApprove = async (selectedDatetime) => {
    try {
      setLoading(true);
      const dt = selectedDatetime || contact.proposed_datetime || new Date().toISOString();
      const res = await fetch(`${API_URL}/chats/${contact.id}/special-request/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datetime: dt,
          appointment_type: 'VIRTUAL',
          user_id: 3, // Liliana León
          notes: 'Cita Extraordinaria VIP Aprobada en 1 Clic'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`✅ Cita confirmada para el ${data.datetime}`);
        useChatStore.getState().fetchContacts(true);
        useChatStore.getState().fetchMessages(contact.id, true);
        if (onActionSuccess) onActionSuccess(`🎉 ¡Cita Aprobada con Liliana León (${data.datetime}) y Confirmación Enviada!`);
      }
    } catch (err) {
      console.error('Error aprobando cita:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterDate) return;
    try {
      setLoading(true);
      const fullIso = `${counterDate}T${counterTime}:00`;
      const res = await fetch(`${API_URL}/chats/${contact.id}/special-request/counter-offer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposed_datetime: fullIso,
          notes: 'Contrapropuesta enviada por Liliana León'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`🗓️ Contrapropuesta enviada: ${data.proposed_datetime}`);
        setShowCounterPicker(false);
        useChatStore.getState().fetchContacts(true);
        useChatStore.getState().fetchMessages(contact.id, true);
        if (onActionSuccess) onActionSuccess(`🗓️ Propuesta de horario (${data.proposed_datetime}) enviada al cliente.`);
      }
    } catch (err) {
      console.error('Error enviando contrapropuesta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('¿Deseas declinar la solicitud extraordinaria y sugerir horarios regulares de oficina?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/chats/${contact.id}/special-request/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Agenda completa' })
      });

      if (res.ok) {
        setStatusMessage('❌ Solicitud declinada amablemente.');
        useChatStore.getState().fetchContacts(true);
        useChatStore.getState().fetchMessages(contact.id, true);
        if (onActionSuccess) onActionSuccess('❌ Solicitud declinada. Se notificó amablemente al cliente.');
      }
    } catch (err) {
      console.error('Error declinando solicitud:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-3.5 mt-2.5 mb-1.5 p-3.5 rounded-2xl bg-gradient-to-r from-gold-500/15 via-navy-900/10 to-gold-500/10 border-2 border-amber-500/30 dark:border-amber-400/30 shadow-md animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Encabezado VIP */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              🌙 Solicitud de Cita Extraordinaria VIP (Fuera de Horario)
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Cliente: <strong className="text-slate-700 dark:text-slate-200">{contact.first_name || contact.phone}</strong> • Requiere autorización de <strong>Liliana León</strong>
            </span>
          </div>
        </div>

        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
          Visto Bueno
        </span>
      </div>

      {/* Botones de Acción Rápida (1 Clic) */}
      {!showCounterPicker ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Botón Aceptar */}
          <button
            type="button"
            disabled={loading || !isAdmin}
            onClick={() => handleApprove()}
            className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 active:bg-navy-950 text-white text-xs font-black flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Procesando...' : '✅ Aceptar Cita VIP'}</span>
          </button>

          {/* Botón Proponer Otra Hora */}
          <button
            type="button"
            disabled={loading || !isAdmin}
            onClick={() => setShowCounterPicker(true)}
            className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>🗓️ Proponer Otra Fecha/Hora</span>
          </button>

          {/* Botón Declinar */}
          <button
            type="button"
            disabled={loading || !isAdmin}
            onClick={handleDecline}
            className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Declinar</span>
          </button>

          {!isAdmin && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-auto">
              🔒 Solo Liliana / Admin pueden autorizar
            </span>
          )}
        </div>
      ) : (
        /* Formulario Inline de Contrapropuesta */
        <form onSubmit={handleCounterOffer} className="pt-2 border-t border-amber-500/20 space-y-2 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Proponer nuevo espacio:</span>
            <input
              type="date"
              required
              value={counterDate}
              onChange={(e) => setCounterDate(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white"
            />
            <select
              value={counterTime}
              onChange={(e) => setCounterTime(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="18:00">06:00 PM</option>
              <option value="18:30">06:30 PM</option>
              <option value="19:00">07:00 PM</option>
              <option value="19:30">07:30 PM</option>
              <option value="09:00">09:00 AM (Sábado)</option>
              <option value="10:00">10:00 AM (Sábado)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-black shadow-xs cursor-pointer"
            >
              {loading ? 'Enviando...' : 'Enviar Propuesta al Cliente'}
            </button>
            <button
              type="button"
              onClick={() => setShowCounterPicker(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {statusMessage && (
        <div className="mt-2 text-xs font-bold text-gold-600 dark:text-gold-400 flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
