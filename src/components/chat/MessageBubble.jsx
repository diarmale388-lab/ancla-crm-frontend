import React, { useState } from 'react';
import { Check, CheckCheck, AlertCircle, Bot, Lock, CornerUpLeft, Forward, Pencil, Trash2, FileText, Download, FileSpreadsheet, MoreHorizontal } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { buildAuthenticatedMediaUrl } from '../../utils/media';

export const MessageBubble = ({ message, onImageClick, onReply, onForward, onEdit, onDelete }) => {
  const isMe = message.sender_type === 'user' || message.sender_type === 'ai';
  const isAI = message.sender_type === 'ai';
  const isInternalNote = message.channel === 'system';
  
  const agents = useChatStore(state => state.agents);
  const senderAgent = agents.find(a => a.id === message.sender_id);
  const senderName = senderAgent ? senderAgent.full_name : 'Asesor';

  const formatTime = (isoString) => {
    if (!isoString) return '';
    let timeStr = String(isoString);
    const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(timeStr);
    if (!hasTimeZone) {
      timeStr = timeStr + 'Z';
    }
    const date = new Date(timeStr);
    return date.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const parseNoteContent = (content) => {
    if (!content || typeof content !== 'string') {
      return { hasCategory: false, text: content || '' };
    }
    const prefixRegex = /^(🚨 \[URGENTE\]|💼 \[COMERCIAL\]|🔧 \[SOPORTE\])\s*/i;
    const match = content.match(prefixRegex);
    if (match) {
      const prefix = match[1].toUpperCase();
      const cleanText = content.replace(prefixRegex, '');
      let label = 'General';
      let badgeStyle = 'bg-slate-500/20 text-slate-700 dark:text-slate-300';
      
      if (prefix.includes('URGENTE')) {
        label = '🚨 Urgente';
        badgeStyle = 'bg-red-500/25 text-red-700 dark:text-red-400 border border-red-300/20';
      } else if (prefix.includes('COMERCIAL')) {
        label = '💼 Comercial';
        badgeStyle = 'bg-blue-500/25 text-blue-700 dark:text-blue-400 border border-blue-300/20';
      } else if (prefix.includes('SOPORTE')) {
        label = '🔧 Soporte';
        badgeStyle = 'bg-orange-500/25 text-orange-700 dark:text-orange-400 border border-orange-300/20';
      }
      return { hasCategory: true, label, badgeStyle, text: cleanText };
    }
    return { hasCategory: false, text: content };
  };

  const noteInfo = parseNoteContent(message.content);
  const displayText = isInternalNote ? noteInfo.text : message.content;

  // Parseo de citas de respuesta de WhatsApp
  const replyRegex = /^>\s*En\s*respuesta\s*a\s*([^:]+):\s*"([^"]+)"\n\n([\s\S]*)$/i;
  const replyMatch = !isInternalNote && message.content ? message.content.match(replyRegex) : null;
  const isReply = !!replyMatch;
  const replyAuthor = isReply ? replyMatch[1] : '';
  const replyText = isReply ? replyMatch[2] : '';
  const cleanDisplayText = isReply ? replyMatch[3] : displayText;

  const getStatusIcon = (status) => {
    if (status === 'sent') {
      return <Check className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (status === 'delivered' || status === 'read') {
      return <CheckCheck className={`w-3.5 h-3.5 ${status === 'read' ? 'text-gold-400' : 'text-slate-400'}`} />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Error al enviar" />;
    }
    return null;
  };

  const isReaction = (message.content || '').includes('[Mensaje de tipo: reaction]');
  const isImage = (message.message_type || '').toLowerCase() === 'image';
  const [showMobileActions, setShowMobileActions] = useState(false);

  const mobileActionBtn = (onClick, icon, title, className = '') => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); setShowMobileActions(false); }}
      className={`p-1.5 rounded-md text-slate-400 hover:text-gold-600 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors cursor-pointer ${className}`}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );

  if (isReaction) {
    return (
      <div className="flex w-full mb-2 justify-center">
        <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 text-[10.5px] font-medium px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-xs select-none">
          <span>👍 Reacción de WhatsApp recibida</span>
          <span className="text-[9px] opacity-70 ml-1">{formatTime(message.created_at)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-3.5 ${isInternalNote ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[88%] md:max-w-[70%] rounded-2xl shadow-sm relative group transition-all duration-200 ${
          isImage ? 'p-1' : 'px-3.5 py-2 md:px-4 md:py-2.5'
        } ${
          isInternalNote
            ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 w-full text-center'
            : isMe 
              ? 'bg-slate-100/90 border border-slate-200 text-slate-900 border-l-2 border-l-gold-500/80 dark:bg-navy-800 dark:text-slate-100 dark:border-navy-700 dark:border-l-gold-500/60'
              : 'bg-white border border-slate-200/80 text-slate-800 dark:bg-navy-900 dark:text-slate-200 dark:border-navy-700/60'
        }`}
      >
        {/* Menú contextual móvil (discreto, dentro de la burbuja) */}
        {!isInternalNote && (
          <div className="md:hidden absolute top-1 right-1 z-10">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowMobileActions((v) => !v); }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100/90 dark:hover:bg-navy-700/80 transition-colors cursor-pointer"
              title="Acciones del mensaje"
              aria-label="Acciones del mensaje"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMobileActions && (
              <div className="absolute top-full right-0 mt-0.5 flex items-center gap-0.5 bg-white/95 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg p-0.5 shadow-md backdrop-blur-sm">
                {mobileActionBtn(() => onReply(message), <CornerUpLeft className="w-3.5 h-3.5" />, 'Responder')}
                {mobileActionBtn(() => onForward(message), <Forward className="w-3.5 h-3.5" />, 'Reenviar')}
                {isMe && (message.message_type || '').toLowerCase() === 'text' &&
                  mobileActionBtn(() => onEdit(message), <Pencil className="w-3.5 h-3.5" />, 'Editar')}
                {mobileActionBtn(() => onDelete(message.id), <Trash2 className="w-3.5 h-3.5" />, 'Eliminar', 'hover:text-red-500 hover:bg-red-500/10')}
              </div>
            )}
          </div>
        )}

        {/* Etiqueta de Nota Interna */}
        {isInternalNote && (
          <div className="flex flex-col items-center justify-center mb-2 space-y-1">
            <span className="flex items-center justify-center space-x-1 text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5 animate-pulse" />
              <span>Nota de: {senderName}</span>
            </span>
            {noteInfo.hasCategory && (
              <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${noteInfo.badgeStyle}`}>
                {noteInfo.label}
              </span>
            )}
          </div>
        )}

        {/* Etiqueta del remitente de IA */}
        {isAI && (
          <span className="flex items-center space-x-1 text-[11px] font-semibold tracking-wide bg-gold-500/10 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-full w-max mb-1 uppercase border border-gold-500/20">
            <Bot className="w-3 h-3" />
            <span>Chatbot IA</span>
          </span>
        )}

        {/* Cita de Respuesta */}
        {isReply && (
          <div className="mb-2 p-2 border-l-4 border-gold-500/60 bg-slate-50 dark:bg-white/5 rounded-r-lg text-[11px] select-none">
            <span className="font-bold text-gold-600 dark:text-gold-400 block text-[10px]">{replyAuthor}</span>
            <span className="truncate block italic text-slate-500 dark:text-slate-400 mt-0.5">"{replyText}"</span>
          </div>
        )}

        {/* Mensaje de texto o archivo multimedia */}
        {(() => {
          const mediaIdMatch = message.content.match(/\[Media ID:\s*([^\]]+)\]/);
          if (mediaIdMatch) {
            const mediaId = mediaIdMatch[1];
            const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const baseUrl = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
            const mediaUrl = buildAuthenticatedMediaUrl(`${baseUrl}/chats/media/${mediaId}`);
            
            const msgTypeLower = (message.message_type || '').toLowerCase();
            
            if (msgTypeLower === 'image') {
              return (
                <div className="relative rounded-lg overflow-hidden w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] bg-slate-900/10 flex items-center justify-center select-none group/img">
                  <img 
                    src={mediaUrl} 
                    className="w-full h-full object-cover rounded-lg cursor-zoom-in hover:scale-105 transition-transform duration-300 ease-out" 
                    alt="Foto de WhatsApp" 
                    loading="lazy"
                    onClick={() => onImageClick ? onImageClick(mediaUrl) : window.open(mediaUrl, '_blank')}
                  />
                  {/* Sombreado inferior sutil para legibilidad de hora estilo WhatsApp */}
                  <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none rounded-b-lg" />
                  
                  {/* Overlay Timestamp for WhatsApp image bubble */}
                  <div className="absolute bottom-1.5 right-2 text-white text-[10px] font-semibold flex items-center space-x-1 select-none pointer-events-none drop-shadow-md">
                    <span>{formatTime(message.created_at)}</span>
                    {isMe && getStatusIcon(message.status)}
                  </div>
                </div>
              );
            }
            if (msgTypeLower === 'audio') {
              return (
                <div className="mt-1 min-w-[240px] rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-navy-700 dark:bg-navy-900">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[11px] font-semibold tracking-wide uppercase text-gold-600 dark:text-gold-500">Nota de voz</span>
                  </div>
                  <audio src={mediaUrl} controls className="w-full h-8 accent-gold-500" />
                </div>
              );
            }
            if (msgTypeLower === 'video') {
              return (
                <div className="mt-1 max-w-[280px]">
                  <video 
                    src={mediaUrl} 
                    controls 
                    className="max-w-full rounded-lg shadow-sm border border-black/10" 
                  />
                </div>
              );
            }
            if (msgTypeLower === 'document') {
              let docName = 'Documento Adjunto';
              try {
                if (cleanDisplayText && !cleanDisplayText.startsWith('http') && !cleanDisplayText.startsWith('[')) {
                  docName = cleanDisplayText;
                } else if (mediaUrl) {
                  const urlParts = mediaUrl.split('?')[0].split('/');
                  const rawName = urlParts[urlParts.length - 1];
                  if (rawName) docName = decodeURIComponent(rawName);
                }
              } catch (e) {}

              const isPdf = docName.toLowerCase().endsWith('.pdf') || (mediaUrl && mediaUrl.toLowerCase().includes('.pdf'));
              const isExcel = docName.toLowerCase().endsWith('.xlsx') || docName.toLowerCase().endsWith('.xls');

              return (
                <div className="mt-1 max-w-[280px]">
                  <a 
                    href={mediaUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center space-x-3 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 p-2.5 rounded-xl border border-black/10 dark:border-white/10 transition-all group/doc"
                  >
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      {isPdf ? <FileText className="w-5 h-5" /> : isExcel ? <FileSpreadsheet className="w-5 h-5 text-gold-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block group-hover/doc:text-gold-500 transition-colors">
                        {docName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium block">
                        {isPdf ? 'Documento PDF' : isExcel ? 'Hoja de Cálculo' : 'Archivo adjunto'} • Clic para ver
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover/doc:text-gold-500 shrink-0" />
                  </a>
                </div>
              );
            }
          }
          return <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isInternalNote ? 'font-medium italic' : isMe ? 'text-slate-900 dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'}`}>{cleanDisplayText}</p>;
        })()}

        {/* Timestamp y Status */}
        {!isImage && (
          <div className="flex items-center justify-end space-x-1 mt-1.5 -mb-0.5 select-none">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatTime(message.created_at)}
            </span>
            {isMe && !isInternalNote && getStatusIcon(message.status)}
          </div>
        )}

        {/* Panel de Acciones Rápidas en Hover (solo desktop) */}
        {!isInternalNote && (
          <div className={`hidden md:flex opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 absolute ${
            isMe ? 'right-full mr-2' : 'left-full ml-2'
          } top-2 items-center space-x-1 bg-white dark:bg-navy-800 border border-navy-700 rounded-xl p-1.5 shadow-lg z-10 select-none`}>
            {/* Responder */}
            <button 
              onClick={() => onReply(message)} 
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-lg transition-colors cursor-pointer"
              title="Responder"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>
            {/* Reenviar */}
            <button 
              onClick={() => onForward(message)} 
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-lg transition-colors cursor-pointer"
              title="Reenviar"
            >
              <Forward className="w-3.5 h-3.5" />
            </button>
            {/* Editar (Solo texto y enviados por mí) */}
            {isMe && (message.message_type || '').toLowerCase() === 'text' && (
              <button 
                onClick={() => onEdit(message)} 
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-lg transition-colors cursor-pointer"
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Eliminar */}
            <button 
              onClick={() => onDelete(message.id)} 
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
