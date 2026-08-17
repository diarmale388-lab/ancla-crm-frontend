import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Search, MessageCircle, Bot, AlertCircle, Play, Sparkles, User, X, ArrowLeft, UserPlus, Sun, Moon, MoreVertical, LogOut, RefreshCw, Bell, Volume2, Check } from 'lucide-react';
import NewContactModal from './NewContactModal';

export const ContactList = () => {
  const { contacts, selectedContactId, fetchMessages, loading, error, fetchContacts } = useChatStore();
  const { triggerDemoSimulation } = useSettingsStore();
  const { user: currentUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [readContactIds, setReadContactIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ancla_read_contacts') || '{}');
    } catch {
      return {};
    }
  });

  // Guardar lectura de contacto cuando se selecciona
  useEffect(() => {
    if (selectedContactId) {
      setReadContactIds(prev => {
        const next = { ...prev, [selectedContactId]: Date.now() };
        try {
          localStorage.setItem('ancla_read_contacts', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [selectedContactId]);

  const isStandalone = typeof window !== 'undefined' && (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  );

  const [deferredPrompt, setDeferredPrompt] = useState(typeof window !== 'undefined' ? window.__deferredPrompt : null);

  // Garantizar que los contactos se carguen al montar el componente en celulares
  useEffect(() => {
    fetchContacts();
  }, [currentUser?.id]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
    if (promptEvent && promptEvent.prompt) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') window.__deferredPrompt = null;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("📲 Para instalar ANCLA CRM en tu celular:\n\n• En Android (Chrome): Toca los 3 puntos del navegador arriba a la derecha y presiona 'Instalar aplicación' o 'Agregar a pantalla de inicio'.\n\n• En iPhone (Safari): Toca el botón Compartir abajo en el centro y presiona 'Agregar a inicio'.");
    }
  };
  
  // Filtro de estado: 'all', 'unread', 'ia', 'human', 'potencial', 'explorador', 'curioso', 'whatsapp', 'instagram'
  const [activeFilter, setActiveFilter] = useState('all');

  const isContactUnread = (c) => {
    if (!c || c.last_message_sender !== 'contact') return false;
    if (selectedContactId === c.id) return false;
    const lastRead = readContactIds[c.id];
    if (!lastRead) return true;
    const msgTime = new Date(c.last_message_time).getTime();
    return msgTime > lastRead;
  };

  const unreadCount = contacts.filter(isContactUnread).length;

  const filteredContacts = contacts.filter((c) => {
    // 0. Aislamiento RBAC por Rol: Asesores comerciales sólo ven sus contactos asignados
    const userRole = String(currentUser?.role || '').toLowerCase();
    const userEmail = String(currentUser?.email || '').toLowerCase();
    const userName = String(currentUser?.full_name || '').toLowerCase();
    const isAdmin = !currentUser || userRole === 'admin' || userRole.includes('admin') || userEmail.includes('diarmale388') || userEmail.includes('liliana') || userName.includes('diarmale388') || userName.includes('liliana') || currentUser?.id === 5 || currentUser?.id === 3 || currentUser?.id === 6;
    if (currentUser && !isAdmin && c.assigned_user_id && c.assigned_user_id !== currentUser.id) {
      return false;
    }

    // 1. Filtrar por estado / filtros rápidos
    if (activeFilter === 'unread' && !isContactUnread(c)) return false;
    if (activeFilter === 'ia' && !c.chatbot_enabled) return false;
    if (activeFilter === 'human' && c.chatbot_enabled) return false;
    if (activeFilter === 'potencial' && c.qualification_level !== 'potencial') return false;
    if (activeFilter === 'explorador' && c.qualification_level !== 'explorador') return false;
    if (activeFilter === 'curioso' && c.qualification_level !== 'curioso') return false;
    if (activeFilter === 'whatsapp' && (c.source === 'Instagram' || String(c.phone).startsWith('IG-'))) return false;
    if (activeFilter === 'instagram' && !(c.source === 'Instagram' || String(c.phone).startsWith('IG-'))) return false;

    // 2. Filtrar por término de búsqueda (Nombre, Teléfono, Email, #ID, Mensaje o Ciudad)
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const cleanQuery = query.replace('#', '');
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const email = (c.email || '').toLowerCase();
    const lastMsg = (c.last_message_content || '').toLowerCase();
    const notes = (c.qualification_notes || '').toLowerCase();
    const idStr = String(c.id || '');
    const city = (c.lot_city || '').toLowerCase();

    return fullName.includes(query) || 
           phone.includes(query) || 
           cleanPhone.includes(cleanQuery) || 
           idStr === cleanQuery || 
           idStr.includes(cleanQuery) || 
           email.includes(query) || 
           city.includes(query) || 
           lastMsg.includes(query) || 
           notes.includes(query);
  });

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    let timeStr = String(isoString);
    const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(timeStr);
    if (!hasTimeZone) {
      timeStr = timeStr + 'Z';
    }
    const date = new Date(timeStr);
    const now = new Date();
    
    // Fechas en zona horaria Colombia
    const dBogota = new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const nBogota = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    
    const dDay = new Date(dBogota.getFullYear(), dBogota.getMonth(), dBogota.getDate());
    const nDay = new Date(nBogota.getFullYear(), nBogota.getMonth(), nBogota.getDate());
    
    const diffDays = Math.round((nDay.getTime() - dDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7 && diffDays > 0) {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return dayNames[dBogota.getDay()];
    } else {
      const day = String(dBogota.getDate()).padStart(2, '0');
      const month = String(dBogota.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${String(dBogota.getFullYear()).slice(-2)}`;
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName) return 'C';
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  return (
    <div className="w-full bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-white/5 flex flex-col h-full transition-colors duration-300">
      
      {/* WhatsApp Web Header Section (Theme Aware) */}
      <div className="bg-[#f0f2f5] dark:bg-[#111b21] px-4 pt-4 pb-3 flex flex-col space-y-3 flex-shrink-0 select-none border-b border-slate-200 dark:border-white/5">
        
        {/* Brand Logo and Action Icons */}
        <div className="flex items-center justify-between">
          <img 
            src="/logo_ancla.png" 
            alt="ANCLA Special Projects" 
            className="h-10 w-auto object-contain mix-blend-multiply dark:invert dark:mix-blend-screen select-none"
          />

          <div className="flex items-center space-x-2 text-[#54656f] dark:text-slate-300 relative">
            
            {/* BOTÓN PROMINENTE DE INSTALAR APP EN MÓVIL (Únicamente visible en navegador móvil si NO está instalada aún) */}
            {!isStandalone && (
              <button
                onClick={handleInstallApp}
                className="md:hidden flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[10.5px] font-extrabold px-2.5 py-1.5 rounded-full shadow-md active:scale-95 transition-all cursor-pointer mr-1"
                title="Instalar App ANCLA CRM en tu Celular"
              >
                <span>📲 Instalar App</span>
              </button>
            )}

            {/* Botón Activar / Probar Notificaciones de Audio e Icono en Barra Superior en Celular */}
            <button
              onClick={async () => {
                const store = useChatStore.getState();
                if (store.subscribeToPushNotifications) {
                  const success = await store.subscribeToPushNotifications();
                  if (success && store.sendTestPushNotification) {
                    store.sendTestPushNotification();
                  }
                } else if (store.requestNotificationPermission) {
                  store.requestNotificationPermission();
                }
              }}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
              title="Activar Notificaciones Push VAPID en Celular (Pantalla Bloqueada)"
            >
              <Bell className="w-5 h-5 animate-bounce" />
            </button>

            {/* 1. Botón Cambiar Tema Día / Noche (Visible sólo en Móvil para evitar duplicar con el Sidebar de PC) */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400 cursor-pointer transition-colors"
              title={theme === 'dark' ? 'Cambiar a Modo Día (Claro)' : 'Cambiar a Modo Noche (Oscuro)'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* 2. Botón Agregar Cliente */}
            <button 
              onClick={() => setShowNewContactModal(true)}
              className="hover:bg-slate-200 dark:hover:bg-slate-800 p-1.5 rounded-full cursor-pointer transition-colors text-emerald-600 dark:text-emerald-400"
              title="Agregar Nuevo Cliente / Prospecto"
            >
              <UserPlus className="w-5 h-5" />
            </button>

            {/* 3. Botón Menú Opciones Móvil (3 Puntos) */}
            <button 
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="hover:bg-slate-200 dark:hover:bg-slate-800 p-1.5 rounded-full cursor-pointer transition-colors relative"
              title="Menú de Opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Menú Desplegable Flotante */}
            {showMenuDropdown && (
              <div className="absolute right-0 top-9 w-56 bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in font-sans">
                {!isStandalone && (
                  <button
                    onClick={() => {
                      handleInstallApp();
                      setShowMenuDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-black flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <span className="text-sm">📲</span>
                    <span>Instalar App en Celular</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    toggleTheme();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>{theme === 'dark' ? 'Modo Día (Claro)' : 'Modo Noche (Oscuro)'}</span>
                </button>

                <button
                  onClick={() => {
                    fetchContacts();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <span>Refrescar Prospectos</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowMenuDropdown(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold flex items-center space-x-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión ({currentUser?.first_name || 'Usuario'})</span>
                </button>
              </div>
            )}
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

        {/* Filtros de Mensajes al estilo WhatsApp Web (Responsive PC & Celular) */}
        <div className="relative">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-300/40 dark:border-emerald-500/30'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#8696a0] hover:bg-[#e1e3e6] dark:hover:bg-[#2a3942]'
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === 'unread' ? 'all' : 'unread')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-300/40 dark:border-emerald-500/30'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#8696a0] hover:bg-[#e1e3e6] dark:hover:bg-[#2a3942]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>No leídos</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === 'ia' ? 'all' : 'ia')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer ${
                activeFilter === 'ia'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-300/40 dark:border-emerald-500/30'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#8696a0] hover:bg-[#e1e3e6] dark:hover:bg-[#2a3942]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Piloto IA</span>
              <span className="sm:hidden">IA</span>
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === 'human' ? 'all' : 'human')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1 cursor-pointer ${
                activeFilter === 'human'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-300/40 dark:border-emerald-500/30'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#8696a0] hover:bg-[#e1e3e6] dark:hover:bg-[#2a3942]'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Humano</span>
            </button>

            {/* Botón Flecha Desplegable con Filtros Inteligentes */}
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-1.5 rounded-full cursor-pointer transition-all ${
                showFilterDropdown || ['potencial', 'explorador', 'curioso', 'whatsapp', 'instagram'].includes(activeFilter)
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#f0f2f5] dark:bg-[#202c33] text-[#54656f] dark:text-[#8696a0] hover:bg-[#e1e3e6] dark:hover:bg-[#2a3942]'
              }`}
              title="Filtros Avanzados (Calificación y Canales)"
            >
              <svg className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: showFilterDropdown ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Menú Flotante de Filtros Avanzados */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-9 w-52 bg-white dark:bg-[#111b21] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in font-sans text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5">
                Calificación del Lead
              </div>
              <button
                onClick={() => { setActiveFilter('potencial'); setShowFilterDropdown(false); }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg font-bold flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
              >
                <span>🟢 Potencial / Caliente</span>
                {activeFilter === 'potencial' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setActiveFilter('explorador'); setShowFilterDropdown(false); }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg font-bold flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300"
              >
                <span>🟡 Explorador</span>
                {activeFilter === 'explorador' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setActiveFilter('curioso'); setShowFilterDropdown(false); }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                <span>🔴 Curioso / Inicial</span>
                {activeFilter === 'curioso' && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="px-2 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5">
                Canal de Origen
              </div>
              <button
                onClick={() => { setActiveFilter('whatsapp'); setShowFilterDropdown(false); }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg font-bold flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              >
                <span>💬 WhatsApp</span>
                {activeFilter === 'whatsapp' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => { setActiveFilter('instagram'); setShowFilterDropdown(false); }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg font-bold flex items-center justify-between hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
              >
                <span>📸 Instagram</span>
                {activeFilter === 'instagram' && <Check className="w-3.5 h-3.5" />}
              </button>

              {activeFilter !== 'all' && (
                <button
                  onClick={() => { setActiveFilter('all'); setShowFilterDropdown(false); }}
                  className="w-full mt-1.5 px-2.5 py-1.5 text-center rounded-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px]"
                >
                  Restablecer Filtros
                </button>
              )}
            </div>
          )}
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
            if (!contact) return null;
            const isSelected = selectedContactId === contact.id;
            const initials = getInitials(contact.first_name, contact.last_name);
            const isInstagram = contact.source === 'Instagram' || (contact.phone && String(contact.phone).startsWith('IG-'));

              return (
                <div
                  key={contact.id}
                  onClick={() => fetchMessages(contact.id)}
                  className={`py-3 px-3.5 sm:py-2.5 sm:px-3 flex items-center space-x-3 cursor-pointer transition-all duration-200 border-l-4 ${
                    isSelected 
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-emerald-500' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/30'
                  }`}
                >
                  {/* Avatar (Estilo WhatsApp Nativo) */}
                  <div className="relative flex-shrink-0">
                    {contact.avatar_url ? (
                      <img 
                        src={contact.avatar_url} 
                        className="w-11 h-11 sm:w-9.5 sm:h-9.5 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                        alt={initials}
                      />
                    ) : (
                      <div className="w-11 h-11 sm:w-9.5 sm:h-9.5 rounded-full bg-[#dfe5e7] dark:bg-slate-700 flex items-end justify-center overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0 select-none">
                        <svg className="w-9 h-9 sm:w-8 sm:h-8 text-[#a9b7be] dark:text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    {/* Icono de Canal (WhatsApp / Instagram) */}
                    <span className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white border ${
                      isInstagram ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-emerald-500'
                    } border-white dark:border-dark-900`}>
                      {isInstagram ? (
                        <svg className="w-3 h-3 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      ) : (
                        <MessageCircle className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
                      )}
                    </span>
                  </div>

                  {/* Info del Contacto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm sm:text-xs font-bold truncate leading-tight flex items-center gap-1.5 ${
                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        <span className="truncate">{contact.first_name ? `${contact.first_name} ${contact.last_name || ''}` : contact.phone}</span>
                        <span className="text-[9px] font-mono text-slate-400 font-semibold px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-white/5 flex-shrink-0">#{contact.id}</span>
                      </h3>
                      <div className="flex flex-col items-end justify-center">
                        <span className={`text-[10px] sm:text-[9px] ${
                          isContactUnread(contact) 
                            ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                            : 'text-slate-400 dark:text-slate-500 font-medium'
                        }`}>
                          {formatMessageTime(contact.last_message_time)}
                        </span>
                        {isContactUnread(contact) && (
                          <span className="mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white shadow-xs flex items-center justify-center animate-pulse" title="Mensaje pendiente">
                            1
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1 sm:mt-0.5">
                      <p className="text-xs sm:text-[11px] text-slate-500 dark:text-slate-400 truncate flex-1 pr-2 leading-tight">
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

      {/* Modal para Crear Nuevo Cliente Manualmente */}
      <NewContactModal 
        isOpen={showNewContactModal} 
        onClose={() => setShowNewContactModal(false)} 
      />
    </div>
  );
};
