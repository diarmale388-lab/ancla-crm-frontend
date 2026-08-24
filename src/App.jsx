import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';
import { useThemeStore } from './store/useThemeStore';
import { Sidebar } from './components/layout/Sidebar';
import { ContactList } from './components/chat/ContactList';
import { ChatWindow } from './components/chat/ChatWindow';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';
import AnalyticsView from './components/analytics/AnalyticsView';
import BroadcastView from './components/broadcast/BroadcastView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { ShowroomDashboard } from './components/showroom/ShowroomDashboard';
import { AIApprovalInboxView } from './components/admin/AIApprovalInboxView';
import ProposalPortal from './components/dossier/ProposalPortal';
import { CommercialProposalView } from './components/CommercialProposalView';
import { Bot, Mail, Lock, AlertCircle, Sparkles, User, CheckCircle2, Copy, Check, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

function App() {
  const { isAuthenticated, user, login, loading, error, checkAuth } = useAuthStore();
  const { connectWebSocket, disconnectWebSocket, fetchContacts, selectedContactId, activeTab, setActiveTab, startSilentPolling, stopSilentPolling } = useChatStore();
  const { applyTheme } = useThemeStore();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados para Registro de Invitados (RBAC)
  const [invitationToken, setInvitationToken] = useState(null);
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [invitationError, setInvitationError] = useState(null);
  const [validatingToken, setValidatingToken] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');

  const validateToken = async (token) => {
    setValidatingToken(true);
    setInvitationError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/auth/invitations/validate?token=${token}`);
      const data = await res.json();
      if (res.ok) {
        setInvitationDetails(data);
      } else {
        setInvitationError(data.detail || "El enlace de invitación no es válido, ha expirado o ya fue utilizado.");
      }
    } catch (err) {
      console.error(err);
      setInvitationError("Error al conectar con el servidor de invitaciones.");
    } finally {
      setValidatingToken(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerName.trim() || !registerPassword.trim() || !invitationToken) return;
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/auth/register-invited`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: invitationToken,
          full_name: registerName.trim(),
          password: registerPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRegisterSuccess("¡Registro completado con éxito! Redirigiendo al inicio de sesión...");
        setTimeout(() => {
          // Limpiar parámetros e invitación para volver al Login
          window.history.replaceState({}, document.title, window.location.pathname);
          setInvitationToken(null);
          setInvitationDetails(null);
          setEmail(data.email); // Auto-poblar el email en el login
        }, 3000);
      } else {
        setRegisterError(data.detail || "Error al completar el registro.");
      }
    } catch (err) {
      console.error(err);
      setRegisterError("Error de conexión al servidor.");
    }
  };

  // 1. Inicializar tema (Día/Noche) y verificar sesión activa
  useEffect(() => {
    applyTheme();
    checkAuth();

    // Comprobar si hay token de invitación en la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setInvitationToken(token);
      validateToken(token);
    }
  }, []);

  // 2. Manejo de WebSocket, Polling Silencioso y Contactos cuando está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchContacts();
      connectWebSocket();
      startSilentPolling();

      // Solicitar permiso de notificaciones nativas y verificar estado WebPush
      const store = useChatStore.getState();
      if (store.checkPushSubscriptionStatus) {
        store.checkPushSubscriptionStatus();
      }
      if (store.requestNotificationPermission) {
        store.requestNotificationPermission();
      }

      const handleUserInteraction = () => {
        store.unlockAudioEngine();
      };

      const handleVisibilityOrFocus = () => {
        if (document.visibilityState === 'visible') {
          store.unlockAudioEngine();
          store.reconnectIfDisconnected();
        }
      };

      // Desbloquear motor de audio en cualquier interacción del usuario
      window.addEventListener('click', handleUserInteraction, { passive: true });
      window.addEventListener('touchstart', handleUserInteraction, { passive: true });
      window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
      window.addEventListener('keydown', handleUserInteraction, { passive: true });
      window.addEventListener('focus', handleVisibilityOrFocus, { passive: true });
      document.addEventListener('visibilitychange', handleVisibilityOrFocus, { passive: true });

      return () => {
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('pointerdown', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
        window.removeEventListener('focus', handleVisibilityOrFocus);
        document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      };
    } else if (!isAuthenticated) {
      disconnectWebSocket();
      stopSilentPolling();
    }
  }, [isAuthenticated, user]);

  // 3. Sincronizar clase móvil has-active-chat sólo en pantallas móviles (< 768px)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        document.body.classList.toggle('has-active-chat', !!(activeTab === 'chats' && selectedContactId));
      } else {
        document.body.classList.remove('has-active-chat');
      }
    }
  }, [activeTab, selectedContactId]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  const isConfirmados = 
    window.location.pathname === '/confirmados' || 
    window.location.search.includes('page=confirmados') || 
    window.location.hash === '#/confirmados' || 
    window.location.hash === '#confirmados';

  if (isConfirmados) {
    return <ShowroomDashboard />;
  }

  // Si la ruta contiene ref= o page=propuesta (Portal de cotizaciones de leads), mostrar ProposalPortal
  const isLeadDossier = 
    window.location.search.includes('ref=') || 
    window.location.search.includes('page=propuesta') ||
    window.location.hash.includes('ref=');

  if (isLeadDossier) {
    return <ProposalPortal />;
  }

  // Si la ruta es propuesta, propuesta.html o /propuesta-comercial, renderizar la Propuesta Comercial Interactiva
  const isCommercialProposal = 
    window.location.pathname.toLowerCase().includes('propuesta') || 
    window.location.hash.toLowerCase().includes('propuesta') ||
    window.location.search.toLowerCase().includes('propuesta');

  if (isCommercialProposal) {
    return <CommercialProposalView />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none">
        {/* Luces volumétricas decorativas de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-navy-700/30 rounded-full blur-[120px] pointer-events-none"></div>

        {invitationToken ? (
          /* Registro de Invitado */
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-2xl z-10 text-slate-800">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/10">
                <User className="w-8 h-8 text-white font-bold" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Registro de Asesor
              </h1>
              <p className="text-xs text-slate-500 mt-1">Completa tus datos para activar tu cuenta</p>
            </div>

            {validatingToken && (
              <div className="flex flex-col items-center py-6">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-slate-500">Validando invitación...</p>
              </div>
            )}

            {invitationError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{invitationError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 text-xs font-bold mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-gold-600" />
                <span>{registerSuccess}</span>
              </div>
            )}

            {invitationDetails && !registerSuccess && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl mb-2">
                  <p className="text-[11px] text-purple-700 font-medium">
                    Invitación asignada a: <strong>{invitationDetails.email}</strong>
                  </p>
                  <p className="text-[10px] text-purple-500">
                    Rol: <span className="uppercase font-bold">{invitationDetails.role}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Escribe tu nombre y apellido"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Elige una contraseña segura"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] text-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completar Registro</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* =========================================================================
             LOGIN MASTERPIECE: 2 EXPERIENCIAS ADAPTATIVAS (DESKTOP DUAL-TONE & MOBILE NATIVE)
             ========================================================================= */
          <div className="w-full max-w-sm md:max-w-4xl bg-white rounded-[28px] md:rounded-[36px] border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10 transition-all duration-300">
            
            {/* LADO IZQUIERDO: HERO BRANDING ARQUITECTÓNICO (En Desktop md+) */}
            <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white border-r border-white/10">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold-500/15 rounded-full blur-3xl pointer-events-none"></div>
              
              <div>
                {/* Logotipo Vectorial de Alta Definición y Gran Escala para Fondo Oscuro */}
                <div className="flex items-center space-x-4 mb-7 select-none">
                  <img 
                    src="/ancla_icon_only.png" 
                    alt="ANCLA" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-2xl flex-shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none font-sans">
                      ANCLA
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black tracking-[0.3em] text-white uppercase leading-none mt-2 font-sans">
                      SPECIAL PROJECTS
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10.5px] font-extrabold tracking-wider uppercase mb-3.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gestión Comercial Inteligente</span>
                </span>

                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  Arquitectura & Casas Modulares de Alta Gama
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Plataforma integral de calificación de leads, agendamiento de asesorías y seguimiento comercial.
                </p>
              </div>

              {/* Badges de Valor en Desktop */}
              <div className="flex flex-col space-y-2.5 my-5">
                <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Fabricación & Ensamble 48h</h4>
                    <p className="text-[10px] text-slate-400">Modelos Flex Home y Cápsulas Living</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <div className="w-7 h-7 rounded-lg bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Sofi AI 2.0 (Autopiloto)</h4>
                    <p className="text-[10px] text-slate-400">Atención y calificación multicanal 24/7</p>
                  </div>
                </div>
              </div>

              {/* Base del Hero */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>Acceso Seguro SSL</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">v2.5.0</span>
              </div>
            </div>

            {/* LADO DERECHO (Y VISTA COMPLETA EN MÓVIL) */}
            <div className="md:col-span-7 flex flex-col justify-center bg-white">
              
              {/* CABECERA EXCLUSIVA PARA MÓVIL: Limpia, Blanca, Elegante y Proporcional */}
              <div className="flex md:hidden bg-white pt-6 pb-2 px-6 flex-col items-center text-center">
                <div className="flex items-center space-x-3.5 mb-2 select-none">
                  <img 
                    src="/ancla_icon_only.png" 
                    alt="ANCLA" 
                    className="w-12 h-12 object-contain drop-shadow-sm flex-shrink-0"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black tracking-tight text-slate-900 leading-none font-sans">
                      ANCLA
                    </span>
                    <span className="text-[9px] font-black tracking-[0.26em] text-slate-700 uppercase leading-none mt-1 font-sans">
                      SPECIAL PROJECTS
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-500">Portal Comercial & Arquitectura Modular</p>
              </div>

              {/* CUERPO DEL FORMULARIO */}
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-sm mx-auto">
                  
                  <div className="mb-5 text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Iniciar Sesión
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Ingresa con tu usuario o correo asignado.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-700 animate-shake">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                      <span className="text-xs font-bold">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        Usuario o Correo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="diarmale388, liliana, asesor o correo"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-base sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-0.5"
                          title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-gold-500/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer mt-4"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>INGRESAR AL CRM</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Footer de Firma Ejecutiva León FX */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-400">
                    <span className="text-[10px] font-black tracking-wider uppercase">By:</span>
                    <img 
                      src="/leon_fx_logo.png" 
                      alt="León FX" 
                      className="w-4 h-4 object-contain"
                    />
                    <span className="text-xs font-black text-slate-800 tracking-tight">León FX</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-white overflow-hidden w-screen transition-colors duration-300">
      {/* Sidebar de navegación */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Panel de Contenido Principal */}
      <div className={`flex-1 flex h-full min-h-0 overflow-hidden ${activeTab === 'chats' && selectedContactId ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        {activeTab === 'chats' && (
          <div className="flex-1 flex h-full min-h-0 overflow-hidden relative chat-main-container">
            {/* Lista de Chats (Panel Izquierdo - Full width en móvil, 28%-360px en PC/Tablet) */}
            <div className={`contacts-container ${selectedContactId ? 'hidden md:block' : 'block'} w-full md:w-[28%] lg:w-[24%] min-w-0 md:min-w-[280px] md:max-w-[360px] flex-shrink-0 border-r border-slate-200 dark:border-white/5 h-full min-h-0 overflow-hidden`}>
              <ContactList />
            </div>
            
            {/* Ventana de Conversación (Panel Derecho - Full screen en móvil, flex-1 en PC/Tablet) */}
            <div className={`conversation-container ${selectedContactId ? 'block' : 'hidden md:block'} flex-1 min-w-0 h-full min-h-0 overflow-hidden`}>
              <ChatWindow />
            </div>
          </div>
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard />
        )}

        {activeTab === 'agenda' && (
          <CalendarView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'broadcasts' && (
          <BroadcastView />
        )}

        {activeTab === 'console' && (
          <AuditLogsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}

        {activeTab === 'ai_approvals' && (
          <AIApprovalInboxView />
        )}

        {activeTab === 'showroom' && (
          <ShowroomDashboard />
        )}
      </div>
    </div>
  );
}

export default App;
