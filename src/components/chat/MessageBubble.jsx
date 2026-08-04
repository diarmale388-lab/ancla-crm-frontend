import React from 'react';
import { Check, CheckCheck, AlertCircle, Bot, Lock, CornerUpLeft, Forward, Pencil, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';

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
      return <CheckCheck className={`w-3.5 h-3.5 ${status === 'read' ? 'text-sky-400' : 'text-slate-400'}`} />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Error al enviar" />;
    }
    return null;
  };

  const isImage = (message.message_type || '').toLowerCase() === 'image';

  return (
    <div className={`flex w-full mb-3.5 ${isInternalNote ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] rounded-xl shadow-sm relative group transition-all duration-200 border ${
          isImage ? 'p-1' : 'px-4 py-2.5'
        } ${
          isInternalNote
            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 text-amber-800 dark:text-amber-400 w-full rounded-xl text-center'
            : isMe 
              ? isAI 
                ? 'bg-[#efeaff] dark:bg-[#2e1065]/60 border-[#efeaff]/40 dark:border-[#2e1065]/40 text-[#2e1065] dark:text-[#f5f3ff] rounded-tr-none'
                : 'bg-[#d9fdd3] dark:bg-[#005c4b] border-[#d9fdd3] dark:border-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
              : 'bg-white dark:bg-[#202c33] border-white dark:border-[#202c33] text-[#111b21] dark:text-[#f0f2f5] rounded-tl-none'
        }`}
      >
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
          <span className="flex items-center space-x-1 text-[9px] bg-purple-200/50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full w-max mb-1 font-semibold uppercase tracking-wider">
            <Bot className="w-3 h-3" />
            <span>Chatbot IA</span>
          </span>
        )}

        {/* Cita de Respuesta */}
        {isReply && (
          <div className="mb-2 p-2 border-l-4 border-emerald-500/70 bg-black/5 dark:bg-white/5 rounded-r-lg text-[11px] opacity-90 select-none">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[10px]">{replyAuthor}</span>
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
            const mediaUrl = `${baseUrl}/chats/media/${mediaId}`;
            
            const msgTypeLower = (message.message_type || '').toLowerCase();
            
            if (msgTypeLower === 'image') {
              return (
                <div className="relative rounded-lg overflow-hidden max-w-[320px]">
                  <img 
                    src={mediaUrl} 
                    className="max-w-full rounded-lg shadow-sm border border-black/5 cursor-zoom-in hover:brightness-95 transition-all" 
                    alt="Archivo recibido" 
                    onClick={() => onImageClick ? onImageClick(mediaUrl) : window.open(mediaUrl, '_blank')}
                  />
                  {/* Overlay Timestamp for WhatsApp image bubble */}
                  <div className="absolute bottom-1.5 right-1.5 bg-black/40 text-white rounded-full px-2 py-0.5 text-[9px] flex items-center space-x-1 backdrop-blur-sm select-none">
                    <span>{formatTime(message.created_at)}</span>
                    {isMe && getStatusIcon(message.status)}
                  </div>
                </div>
              );
            }
            if (msgTypeLower === 'audio') {
              return (
                <div className="mt-1 min-w-[240px]">
                  <audio src={mediaUrl} controls className="w-full h-8" />
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
              return (
                <div className="mt-1">
                  <a 
                    href={mediaUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-black/10 transition-colors w-max"
                  >
                    <span>📄 Descargar Documento</span>
                  </a>
                </div>
              );
            }
          }
          return <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isInternalNote ? 'font-medium italic' : ''}`}>{cleanDisplayText}</p>;
        })()}

        {/* Timestamp y Status */}
        {!isImage && (
          <div className="flex items-center justify-end space-x-1 mt-1.5 -mb-0.5 select-none">
            <span className="text-[10px] opacity-60 text-slate-400 dark:text-slate-300">
              {formatTime(message.created_at)}
            </span>
            {isMe && !isInternalNote && getStatusIcon(message.status)}
          </div>
        )}

        {/* Panel de Acciones Rápidas en Hover */}
        {!isInternalNote && (
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute ${
            isMe ? 'right-full mr-2' : 'left-full ml-2'
          } top-2 flex items-center space-x-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 shadow-lg z-10 select-none`}>
            {/* Responder */}
            <button 
              onClick={() => onReply(message)} 
              className="p-1 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Responder"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>
            {/* Reenviar */}
            <button 
              onClick={() => onForward(message)} 
              className="p-1 text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Reenviar"
            >
              <Forward className="w-3.5 h-3.5" />
            </button>
            {/* Editar (Solo texto y enviados por mí) */}
            {isMe && (message.message_type || '').toLowerCase() === 'text' && (
              <button 
                onClick={() => onEdit(message)} 
                className="p-1 text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors cursor-pointer"
                title="Editar"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Eliminar */}
            <button 
              onClick={() => onDelete(message.id)} 
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
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
