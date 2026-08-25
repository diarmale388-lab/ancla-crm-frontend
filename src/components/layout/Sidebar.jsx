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
  ClipboardCheck,
  Download,
  Smartphone,
  X,
  Share,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
  Info,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuthStore();
  const { 
    disconnectWebSocket, 
    pushPermission, 
    isPushSubscribed, 
    isPushLoading, 
    subscribeToPushNotifications, 
    sendTestPushNotification 
  } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState(null);
  const [isTestingPush, setIsTestingPush] = useState(false);

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
      <div className="desktop-sidebar w-[64px] h-full bg-slate-100 dark:bg-navy-900 border-r border-slate-200 dark:border-navy-700 hidden md:flex flex-col justify-between items-center py-4 flex-shrink-0 z-35 select-none transition-colors duration-300">
      
      {/* Sección Superior de Iconos */}
      <div className="flex flex-col items-center space-y-5 w-full">
        {/* Botón de Chats */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'chats' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('chats');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'chats'
                ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
            {/* Badge contador de Chats */}
            <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full scale-90 border border-slate-100 dark:border-navy-900">
              22
            </span>
          </button>
        </div>

        {/* Botón de Kanban Board */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'kanban' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('kanban');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'kanban'
                ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
            }`}
            title="Kanban Pipeline"
          >
            <KanbanSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Agenda & Citas */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'agenda' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('agenda');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'agenda'
                ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
            }`}
            title="Agenda & Citas"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Botón de Métricas / Analytics (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'analytics' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('analytics');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'analytics'
                  ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
              }`}
              title="Métricas & Informes"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón de Envíos Masivos / Broadcasts (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'broadcasts' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('broadcasts');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'broadcasts'
                  ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
              }`}
              title="Envíos Masivos (Broadcasts)"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón de Seguimiento Comercial (Control Gerencial) */}
        <div className="relative w-full flex justify-center group">
          {activeTab === 'showroom' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
          )}
          <button
            onClick={() => {
              setActiveTab('showroom');
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'showroom'
                ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
            }`}
            title="Seguimiento Comercial"
          >
            <ClipboardCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sección Inferior (Ajustes, Perfil y Cerrar Sesión) */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Botón de Bandeja de Aprobación Sofi AI (Solo Admin Diego / Liliana) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'ai_approvals' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 dark:bg-gold-400 rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('ai_approvals');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'ai_approvals'
                  ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
              }`}
              title="Bandeja de Aprobación Sofi AI (Candado 1 & 2)"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón de Ajustes (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <div className="relative w-full flex justify-center group">
            {activeTab === 'settings' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[32px] bg-gold-500 rounded-r-md"></div>
            )}
            <button
              onClick={() => {
                setActiveTab('settings');
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'settings'
                  ? 'bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white'
              }`}
              title="Ajustes"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Botón Instalar App PWA (Mac, iPad, iPhone, Android, Windows) - Oculto si ya está instalada como PWA */}
        {isInstallable && !window.matchMedia('(display-mode: standalone)').matches && (
          <button
            onClick={handleInstallClick}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer relative group"
            title="Instalar ANCLA CRM en Mac, iPad, iPhone, Windows o Android"
          >
            <Download className="w-5 h-5 animate-pulse" />
            <div className="absolute left-14 bottom-0 bg-navy-900 border border-gold-500/40 text-gold-300 text-[10px] py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl font-bold">
              Instalar App (Mac / iPad / Móvil)
            </div>
          </button>
        )}

        {/* Botón Gestor de Notificaciones Push PWA (Android / iOS / PC con pantalla bloqueada) */}
        <button
          onClick={() => setShowPushModal(true)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
            pushPermission === 'granted'
              ? 'text-gold-600 dark:text-gold-400 hover:bg-gold-500/10'
              : 'text-gold-500 hover:bg-gold-500/10 animate-pulse'
          }`}
          title={
            pushPermission === 'granted'
              ? 'Notificaciones Push Activas (Pantalla Bloqueada)'
              : '⚠️ Activar Notificaciones en Celular (Pantalla Bloqueada)'
          }
        >
          <Bell className="w-5 h-5" />
          <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            pushPermission === 'granted' ? 'bg-emerald-500' : 'bg-gold-500 animate-ping'
          }`} />
        </button>

        {/* Botón Toggler Día/Noche */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-navy-900 dark:hover:bg-navy-800 dark:hover:text-white transition-all cursor-pointer"
          title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-gold-500" /> : <Moon className="w-5 h-5 text-navy-700 dark:text-slate-300" />}
        </button>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Foto de Perfil / Info de Asesor */}
        <div className="w-9 h-9 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-bold uppercase shadow-sm relative group cursor-help transition-colors">
          {user ? user.full_name[0] : 'A'}
          <div className="absolute left-14 bottom-0 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
            <span className="font-bold block">{user ? user.full_name : 'Asesor'}</span>
            <span className="opacity-60 block capitalize">{user ? user.role : 'Rol'}</span>
          </div>
        </div>
      </div>

      {/* Modal Gestor y Diagnóstico de Notificaciones Push en Celulares */}
      {showPushModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-5 h-5 text-gold-400 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider">Centro de Notificaciones Push</h3>
              </div>
              <button onClick={() => { setShowPushModal(false); setTestPushStatus(null); }} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado del Permiso */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Permiso en este dispositivo:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  pushPermission === 'granted'
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                    : pushPermission === 'denied'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {pushPermission === 'granted' ? 'Concedido ✅' : pushPermission === 'denied' ? 'Bloqueado ❌' : 'Pendiente ⏳'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Servicio WebPush (VAPID):</span>
                <span className="text-gold-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Conectado (FCM/APNs)
                </span>
              </div>
            </div>

            {/* Explicación de Funcionamiento */}
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <p className="flex items-start gap-1.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Las notificaciones <strong>Push nativas</strong> te alertarán con <strong>sonido y vibración</strong> cada vez que un prospecto escriba a WhatsApp, incluso con la <strong>pantalla del celular apagada o la aplicación cerrada</strong>.
                </span>
              </p>
            </div>

            {/* Resultado de prueba de push */}
            {testPushStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testPushStatus.status === 'success'
                  ? 'bg-gold-500/20 text-gold-200 border border-gold-500/40'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              }`}>
                {testPushStatus.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{testPushStatus.message}</span>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isPushLoading}
                onClick={async () => {
                  const res = await subscribeToPushNotifications(true);
                  if (res) {
                    setTestPushStatus({ status: res.success ? 'success' : 'warning', message: res.message });
                  }
                }}
                className={`w-full py-2.5 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  pushPermission === 'granted'
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    : 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 shadow-gold-500/20'
                }`}
              >
                {isPushLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registrando Dispositivo...
                  </>
                ) : pushPermission === 'granted' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-gold-400" /> Re-sincronizar Suscripción Push
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" /> 🚀 Activar Notificaciones en este Celular
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isTestingPush}
                onClick={async () => {
                  setIsTestingPush(true);
                  setTestPushStatus(null);
                  const res = await sendTestPushNotification();
                  setIsTestingPush(false);
                  if (res) {
                    setTestPushStatus(res);
                  }
                }}
                className="w-full py-2.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTestingPush ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando Push de Prueba...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> 🔔 Enviar Notificación de Prueba a Celulares
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guía Multi-Plataforma para Instalar App PWA (Mac, iPad, iPhone, Android) */}
      {showIosPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white text-center">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-gold-400" />
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
                <span className="font-bold text-gold-400 block">🖥️ En Mac (Google Chrome):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Haz clic en el ícono <strong>Instalar</strong> en la barra de direcciones de Chrome (al lado de la estrella de favoritos) o en el menú <strong>(⋮) ➔ Guardar y compartir ➔ Instalar ANCLA CRM</strong>. Se añadirá directamente a tu <strong>Dock de macOS</strong> y <strong>Launchpad</strong>.
                </p>
              </div>

              {/* Opción 2: iPad / iPhone (Safari) */}
              <div className="border-t border-white/5 pt-2.5 space-y-1">
                <span className="font-bold text-gold-400 block">📱 En iPad / iPhone (Safari):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Toca el botón <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Compartir</strong> en Safari y selecciona <strong>"Agregar al inicio"</strong>.
                </p>
              </div>

              {/* Opción 3: iPad / iPhone (Chrome) */}
              <div className="border-t border-white/5 pt-2.5 space-y-1">
                <span className="font-bold text-gold-400 block">🌐 En iPad / iPhone (Google Chrome):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Toca el botón <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Compartir</strong> o los 3 puntos <strong>(...)</strong> y elige <strong>"Agregar a la pantalla principal"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosPrompt(false)}
              className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Barra de Navegación Inferior Móvil */}
      <div className={`mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-700 z-40 items-center justify-around px-2 shadow-2xl transition-all duration-200 select-none ${
        activeTab === 'chats' && selectedContactId ? 'hidden' : 'flex'
      }`}>
        {/* Pestaña 1: 💬 Chats */}
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 transition-all cursor-pointer relative ${
            activeTab === 'chats' ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-gold-500 text-navy-950 text-[8.5px] font-bold px-1.5 py-0.2 rounded-full scale-90">
              22
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-1">Chats</span>
        </button>

        {/* Pestaña 2: 📊 Pipeline (Kanban) */}
        <button
          type="button"
          onClick={() => setActiveTab('kanban')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 transition-all cursor-pointer ${
            activeTab === 'kanban' ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <KanbanSquare className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Pipeline</span>
        </button>

        {/* Pestaña 3: 📅 Citas (Agenda) */}
        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 transition-all cursor-pointer ${
            activeTab === 'agenda' ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Citas</span>
        </button>

        {/* Pestaña 4: 📋 Seguimiento Comercial */}
        <button
          type="button"
          onClick={() => setActiveTab('showroom')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 transition-all cursor-pointer ${
            activeTab === 'showroom' ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Seguimiento</span>
        </button>

        {/* Pestaña 5: 👤 Perfil / Ajustes (Solo Admin) */}
        {(user?.role === 'admin' || user?.role === 'ADMIN') && (
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 transition-all cursor-pointer ${
              activeTab === 'settings' ? 'text-gold-600 dark:text-gold-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Ajustes</span>
          </button>
        )}
      </div>
    </>
  );
};
