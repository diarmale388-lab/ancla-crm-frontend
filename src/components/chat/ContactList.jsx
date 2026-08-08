import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Search, MessageCircle, Bot, AlertCircle, Play, Sparkles, User, X, ArrowLeft } from 'lucide-react';

export const ContactList = () => {
  const { contacts, selectedContactId, fetchMessages, loading, error, fetchContacts } = useChatStore();
  const { triggerDemoSimulation } = useSettingsStore();
  const currentUser = useAuthStore(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  
  // Filtro de estado de IA
  const [activeFilter, setActiveFilter] = useState('all');

  const handleStartDemo = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimMessage('Iniciando...');
    const ok = await triggerDemoSimulation();
    if (ok) {
      setSimMessage('Simulando leads...');
      const interval = setInterval(() => {
        fetchContacts();
      }, 4000);
      
      setTimeout(() => {
        clearInterval(interval);
        setSimulating(false);
        setSimMessage('');
        fetchContacts();
      }, 95000);
    } else {
      setSimulating(false);
      setSimMessage('Error');
      setTimeout(() => setSimMessage(''), 3000);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    // 1. Filtrar por estado del chatbot
    if (activeFilter === 'ia' && !c.chatbot_enabled) return false;
    if (activeFilter === 'human' && c.chatbot_enabled) return false;

    // 2. Filtrar por término de búsqueda y contenido de mensajes (Tipo WhatsApp)
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const lastMsg = (c.last_message_content || '').toLowerCase();
    const notes = (c.qualification_notes || '').toLowerCase();
    return fullName.includes(query) || phone.includes(query) || email.includes(query) || lastMsg.includes(query) || notes.includes(query);
  });

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    let timeStr = String(isoString);
    const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(timeStr);
    if (!hasTimeZone) {
      timeStr = timeStr + 'Z';
    }
    const date = new Date(timeStr);
    return date.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return 'C';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <div className="w-full bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-white/5 flex flex-col h-full transition-colors duration-300">
      
      {/* WhatsApp Web Header Section (Theme Aware) */}
      <div className="bg-[#f0f2f5] dark:bg-[#111b21] px-4 pt-5 pb-2 flex flex-col space-y-3.5 flex-shrink-0 select-none border-b border-slate-200 dark:border-white/5">
        
        {/* Brand Logo and Action Icons */}
        <div className="flex items-center justify-between">
          <img 
            src="/logo_ancla.png" 
            alt="ANCLA Special Projects" 
            className="h-10 w-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen select-none"
          />
          <div className="flex items-center space-x-5 text-[#54656f]">
            <button 
              onClick={() => {
                const phone = prompt("Ingresa el número de teléfono del nuevo contacto (con indicativo de país, ej. +57...):");
                if (phone) {
                  alert("Abriendo nuevo chat con " + phone);
                }
              }}
              className="hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
              title="Nuevo Chat"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button 
              onClick={() => alert("Menú de opciones de WhatsApp Business")}
              className="hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
              title="Menú"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Buscador de Chats */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#667781]" />
          <input
            type="text"
            placeholder="Buscar chat o contenido de mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f0f2f5] dark:bg-[#202c33] border-none rounded-lg pl-11 pr-8 py-2 text-[13px] text-[#3b4a54] dark:text-white placeholder-[#667781] focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-[#667781] hover:text-[#3b4a54] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros de Mensajes al estilo WhatsApp Web */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#e8fae6] text-[#008069]'
                : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e1e3e6]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('ia')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer ${
              activeFilter === 'ia'
                ? 'bg-[#e8fae6] text-[#008069]'
                : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e1e3e6]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Piloto IA</span>
          </button>
          <button
            onClick={() => setActiveFilter('human')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1 cursor-pointer ${
              activeFilter === 'human'
                ? 'bg-[#e8fae6] text-[#008069]'
                : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e1e3e6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Humano</span>
          </button>
          <button
            onClick={() => alert("Filtros adicionales")}
            className="bg-[#f0f2f5] text-[#54656f] hover:bg-[#e1e3e6] p-1 rounded-full cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center p-8 space-x-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-400">Cargando chats...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 mb-2 opacity-60" />
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <p className="text-sm">No se encontraron chats</p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;
            const initials = getInitials(contact.first_name, contact.last_name);
            const isInstagram = contact.source === 'Instagram' || contact.phone.startsWith('IG-');

              return (
                <div
                  key={contact.id}
                  onClick={() => fetchMessages(contact.id)}
                  className={`py-2 px-3 flex items-center space-x-2.5 cursor-pointer transition-all duration-200 border-l-4 ${
                    isSelected 
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-emerald-500' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/30'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {contact.avatar_url ? (
                      <img 
                        src={contact.avatar_url} 
                        className="w-9.5 h-9.5 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                        alt={initials}
                      />
                    ) : (
                      <div className="w-9.5 h-9.5 rounded-full bg-[#dfe5e7] dark:bg-slate-700 flex items-end justify-center overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0 select-none">
                        <svg className="w-8 h-8 text-[#a9b7be] dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    {/* Icono de Canal (WhatsApp / Instagram) */}
                    <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-white border ${
                      isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-emerald-500'
                    } border-white dark:border-dark-900`}>
                      {isInstagram ? (
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      ) : (
                        <MessageCircle className="w-2.5 h-2.5" />
                      )}
                    </span>
                  </div>

                  {/* Info del Contacto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold truncate leading-tight flex items-center gap-1.5 ${
                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        <span className="truncate">{contact.first_name ? `${contact.first_name} ${contact.last_name || ''}` : contact.phone}</span>
                        <span className="text-[9px] font-mono text-slate-400 font-semibold px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/5 flex-shrink-0">#{contact.id}</span>
                      </h3>
                      <div className="flex flex-col items-end justify-center">
                        <span className={`text-[9px] ${
                          contact.last_message_sender === 'contact' && !isSelected 
                            ? 'text-emerald-500 font-bold' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {formatMessageTime(contact.last_message_time)}
                        </span>
                        {contact.last_message_sender === 'contact' && !isSelected && (
                          <span className="w-2 h-2 mt-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" title="Mensaje pendiente" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex-1 pr-2 leading-tight">
                        {contact.last_message_content || 'Sin mensajes aún'}
                      </p>
                      <div className="flex items-center space-x-1">
                        {contact.qualification_level && (
                          <span 
                            className={`text-[8px] px-1 py-0.5 rounded-full font-extrabold ${
                              contact.qualification_level === 'potencial' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              contact.qualification_level === 'explorador' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                              'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20'
                            }`}
                            title={`Lead ${contact.qualification_level}`}
                          >
                            {contact.qualification_level === 'potencial' ? '🟢 Potencial' : contact.qualification_level === 'explorador' ? '🟡 Explorador' : '🔴 Curioso'}
                          </span>
                        )}

                        {contact.interest_product && (
                          <span 
                            className="bg-blue-500/10 text-blue-600 dark:text-sky-400 text-[8px] px-1 py-0.5 rounded-full font-bold border border-blue-500/20 truncate max-w-[65px]"
                            title={`Interés: ${contact.interest_product}`}
                          >
                            {contact.interest_product}
                          </span>
                        )}

                        {/* Indicador de Estado del Chatbot de IA */}
                        {contact.chatbot_enabled && (
                          <span 
                            className="flex items-center space-x-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] px-1 py-0.5 rounded-full font-medium"
                            title="Chatbot de IA Activo"
                          >
                            <Bot className="w-2 h-2" />
                            <span>IA</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
          })
        )}
      </div>
    </div>
  );
};
