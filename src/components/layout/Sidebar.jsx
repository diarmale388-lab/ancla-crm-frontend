import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useThemeStore } from '../../store/useThemeStore';
import { 
  MessageSquare, 
  KanbanSquare, 
  Settings, 
  LogOut, 
  Calendar as CalendarIcon,
  Megaphone,
  Sun,
  Moon,
  BarChart3,
  Volume2,
  Terminal,
  Building,
  Download,
  Smartphone,
  X,
  Share
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuthStore();
  const { disconnectWebSocket } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredPrompt = e;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS safari
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowIosPrompt(true);
    }
  };

  const handleLogout = () => {
    disconnectWebSocket();
    logout();
  };

  const { selectedContactId } = useChatStore();

  return (
    <>
      {/* Desktop Vertical Sidebar (>= md) */}
      <div className="desktop-sidebar w-[64px] h-full bg-[#f0f2f5] dark:bg-[#111b21] border-r border-slate-200 dark:border-[#202c33] hidden md:flex flex-col justify-between items-center py-4 flex-shrink-0 z-35 select-none transition-colors duration-300">
      
      {/* Sección Superior de Iconos */}
      <div className="flex flex-col items-center space-y-5 w-full">
        {/* Botón de Chats */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'chats' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('chats');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'chats'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
            {/* Green Badge for Chats Count */}
            <span className="absolute -top-1 -right-1 bg-[#008069] dark:bg-[#00a884] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full scale-90 border border-[#f0f2f5] dark:border-[#111b21]">
              22
            </span>
          </button>
        </div>

        {/* Botón de Kanban Board */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'kanban' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('kanban');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'kanban'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Kanban Pipeline"
          >
            <KanbanSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Agenda & Citas */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'agenda' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('agenda');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'agenda'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Agenda & Citas"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Métricas / Analytics */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'analytics' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('analytics');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'analytics'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Métricas & Informes"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Envíos Masivos / Broadcasts (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'broadcasts' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('broadcasts');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'broadcasts'
                  ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                  : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
              }`}
              title="Envíos Masivos (Broadcasts)"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón de Showroom Armenia */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'showroom' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('showroom');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'showroom'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Showroom Armenia"
          >
            <Building className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sección Inferior (Ajustes, Perfil y Cerrar Sesión) */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Botón Consola CMD / Auditoría (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'console' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('console');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'console'
                  ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                  : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
              }`}
              title="Consola de Diagnóstico (CMD / Logs)"
            >
              <Terminal className="w-5 h-5 text-emerald-500" />
            </button>
          </div>
        )}

        {/* Botón de Ajustes */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'settings' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-[#008069] dark:bg-[#00a884] rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('settings');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'settings'
                ? 'bg-[#e9edef] dark:bg-[#2a3942] text-[#008069] dark:text-[#00a884]'
                : 'text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white'
            }`}
            title="Ajustes"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Botón Instalar App PWA (Mac, iPad, iPhone, Android, Windows) */}
        <button
          onClick={handleInstallClick}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer relative group"
          title="Instalar ANCLA CRM en Mac, iPad, iPhone, Windows o Android"
        >
          <Download className="w-5 h-5 animate-pulse" />
          <div className="absolute left-14 bottom-0 bg-[#111b27] border border-emerald-500/40 text-emerald-300 text-[10px] py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl font-bold">
            Instalar App (Mac / iPad / Móvil)
          </div>
        </button>

        {/* Botón Toggler Día/Noche */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#54656f] dark:text-[#8696a0] hover:bg-[#e9edef] hover:text-[#111b21] dark:hover:bg-[#202c33] dark:hover:text-white transition-all cursor-pointer"
          title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />}
        </button>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#54656f] dark:text-[#8696a0] hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Foto de Perfil / Info de Asesor */}
        <div className="w-9 h-9 rounded-full bg-[#e9edef] dark:bg-[#2a3942] border border-slate-200 dark:border-[#202c33] flex items-center justify-center text-slate-800 dark:text-white text-xs font-bold uppercase shadow-sm relative group cursor-help transition-colors">
          {user ? user.full_name[0] : 'A'}
          <div className="absolute left-14 bottom-0 bg-[#e9edef] dark:bg-[#202c33] border border-slate-200 dark:border-[#222e35] text-slate-800 dark:text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
            <span className="font-bold block">{user ? user.full_name : 'Asesor'}</span>
            <span className="opacity-60 block capitalize">{user ? user.role : 'Rol'}</span>
          </div>
        </div>
      </div>

      {/* Modal Guía Multi-Plataforma para Instalar App PWA (Mac, iPad, iPhone, Android) */}
      {showIosPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-[#111b27] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white text-center">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">Instalar ANCLA CRM como App</h3>
              </div>
              <button onClick={() => setShowIosPrompt(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Puedes instalar el CRM como una aplicación nativa independiente en Mac, iPad, iPhone o Android:
            </p>

            <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-3 text-left text-xs max-h-72 overflow-y-auto custom-scrollbar">
              {/* Opción 1: Mac Chrome */}
              <div className="space-y-1">
                <span className="font-bold text-emerald-400 block">🖥️ En Mac (Google Chrome):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Haz clic en el ícono <strong>Instalar</strong> en la barra de direcciones de Chrome (al lado de la estrella de favoritos) o en el menú <strong>(⋮) ➔ Guardar y compartir ➔ Instalar ANCLA CRM</strong>. Se añadirá directamente a tu <strong>Dock de macOS</strong> y <strong>Launchpad</strong>.
                </p>
              </div>

              {/* Opción 2: iPad / iPhone (Safari) */}
              <div className="border-t border-white/5 pt-2.5 space-y-1">
                <span className="font-bold text-emerald-400 block">📱 En iPad / iPhone (Safari):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Toca el botón <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Compartir</strong> en Safari y selecciona <strong>"Agregar al inicio"</strong>.
                </p>
              </div>

              {/* Opción 3: iPad / iPhone (Chrome) */}
              <div className="border-t border-white/5 pt-2.5 space-y-1">
                <span className="font-bold text-emerald-400 block">🌐 En iPad / iPhone (Google Chrome):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Toca el botón <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Compartir</strong> o los 3 puntos <strong>(...)</strong> y elige <strong>"Agregar a la pantalla principal"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Barra de Navegación Inferior Móvil (Mobile BottomNav WhatsApp-Style) */}
      <div className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#ffffff] dark:bg-[#111b21] border-t border-slate-200 dark:border-[#202c33] z-40 items-center justify-around px-2 shadow-2xl transition-all duration-200 select-none ${
        activeTab === 'chats' && selectedContactId ? 'hidden' : 'flex'
      }`}>
        {/* Pestaña 1: 💬 Chats */}
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all cursor-pointer relative ${
            activeTab === 'chats' ? 'text-[#008069] dark:text-[#00a884] font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-[#008069] dark:bg-[#00a884] text-white text-[8.5px] font-bold px-1.5 py-0.2 rounded-full scale-90">
              22
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-1">Chats</span>
        </button>

        {/* Pestaña 2: 📊 Pipeline (Kanban) */}
        <button
          type="button"
          onClick={() => setActiveTab('kanban')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all cursor-pointer ${
            activeTab === 'kanban' ? 'text-[#008069] dark:text-[#00a884] font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <KanbanSquare className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Pipeline</span>
        </button>

        {/* Pestaña 3: 📅 Citas (Agenda) */}
        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all cursor-pointer ${
            activeTab === 'agenda' ? 'text-[#008069] dark:text-[#00a884] font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Citas</span>
        </button>

        {/* Pestaña 4: 🏠 Showroom */}
        <button
          type="button"
          onClick={() => setActiveTab('showroom')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all cursor-pointer ${
            activeTab === 'showroom' ? 'text-[#008069] dark:text-[#00a884] font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Showroom</span>
        </button>

        {/* Pestaña 5: 👤 Perfil / Ajustes */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'text-[#008069] dark:text-[#00a884] font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Ajustes</span>
        </button>
      </div>
    </>
  );
};
