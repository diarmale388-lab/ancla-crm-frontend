import React, { useState } from 'react';
import { X, Send, Sparkles, Mail, FileText, Check, AlertCircle } from 'lucide-react';

export default function EmailPreviewModal({ isOpen, onClose, contact, pdfPath, initialSubject, initialBody, onConfirmSend }) {
  if (!isOpen || !contact) return null;

  const [subject, setSubject] = useState(initialSubject || `Propuesta Comercial ANCLA Special Projects - ${contact.first_name || 'Estimado Cliente'}`);
  const [body, setBody] = useState(initialBody || `Hola ${contact.first_name || ''},\n\nAdjunto a este correo encontrarás la propuesta comercial personalizada con las especificaciones técnicas del proyecto que conversamos.\n\nQuedamos atentos a tus comentarios para coordinar los siguientes pasos.\n\nAtentamente,\nEquipo Comercial ANCLA Special Projects`);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async () => {
    setSending(true);
    setErrorMsg('');
    try {
      await onConfirmSend({ subject, body, pdfPath, recipientEmail: contact.email });
      setSuccessMsg('¡Correo despachado con éxito!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Error al enviar el correo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col space-y-4 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Previsualización de Correo (Control Humano)</h3>
              <p className="text-xs text-slate-400">Sofi AI redactó este borrador. Revisa o edita el texto antes de enviar.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-bold flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario de Edición */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Destinatario:</label>
            <input
              type="email"
              readOnly
              value={contact.email || ''}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Asunto del Correo:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cuerpo del Correo (Redacción IA):</label>
            <textarea
              rows="6"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {pdfPath && (
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Adjunto: Propuesta_Comercial_ANCLA.pdf</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={sending || !contact.email}
            onClick={handleSend}
            className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-4 h-4" /><span>Confirmar & Despachar Correo</span></>}
          </button>
        </div>

      </div>
    </div>
  );
}
