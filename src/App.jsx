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
import ProposalPortal from './components/dossier/ProposalPortal';
import { Bot, Mail, Lock, AlertCircle, Sparkles, User, CheckCircle2, Copy, Check } from 'lucide-react';

function App() {
  const { isAuthenticated, user, login, loading, error, checkAuth } = useAuthStore();
  const { connectWebSocket, disconnectWebSocket, fetchContacts, selectedContactId, activeTab, setActiveTab, startSilentPolling, stopSilentPolling } = useChatStore();
  const { applyTheme } = useThemeStore();
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const isPropuesta = 
    window.location.pathname === '/propuesta' || 
    window.location.search.includes('page=propuesta') || 
    window.location.search.includes('ref=') ||
    window.location.hash === '#/propuesta' || 
    window.location.hash.startsWith('#propuesta') ||
    window.location.hash.startsWith('#/propuesta');

  if (isPropuesta) {
    return <ProposalPortal />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-dark-950 text-slate-800 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Elementos Decorativos Ejecutivos de Fondo */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        {invitationToken ? (
          /* Registro de Invitado */
          <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl transition-colors duration-300">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/10">
                <User className="w-8 h-8 text-white font-bold" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Registro de Asesor
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completa tus datos para activar tu cuenta</p>
            </div>

            {validatingToken && (
              <div className="flex flex-col items-center py-6">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs text-slate-500">Validando invitación...</p>
              </div>
            )}

            {invitationError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{invitationError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{registerSuccess}</span>
              </div>
            )}

            {invitationDetails && !registerSuccess && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30 rounded-2xl mb-2">
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                    Invitación asignada a: <strong>{invitationDetails.email}</strong>
                  </p>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400">
                    Rol: <span className="uppercase font-bold">{invitationDetails.role}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Escribe tu nombre y apellido"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="w-full bg-slate-100 dark:bg-slate-805 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
                  <input
                    type="password"
                    placeholder="Elige una contraseña segura"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    className="w-full bg-slate-100 dark:bg-slate-805 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
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
          /* Login Card de Alta Gama con Logo Imponente & Fondo Blanco de Contraste */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center mb-6 text-center">
              
              {/* Logo Oficial ANCLA Special Projects - Tamaño Grande e Imponente */}
              <div className="w-full max-w-[280px] bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-4 flex items-center justify-center">
                <img 
                  src="/ancla_official_logo.png" 
                  alt="ANCLA Special Projects" 
                  className="w-full h-auto max-h-28 object-contain"
                />
              </div>

              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                ANCLA CRM
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Gestión Comercial & Proyectos Modulares LATAM</p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-600 dark:text-red-400 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">Usuario o Correo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="diarmale388, liliana, asesor o correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer mt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>INICIAR SESIÓN</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer de Firma Ejecutiva León FX */}
            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center space-x-2 text-slate-400 dark:text-slate-500">
              <span className="text-[10px] font-black tracking-wider uppercase">By:</span>
              <img 
                src="/leon_fx_logo.png" 
                alt="León FX" 
                className="w-5 h-5 object-contain"
              />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">León FX</span>
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

        {activeTab === 'showroom' && (
          <ShowroomDashboard />
        )}
      </div>
    </div>
  );
}

export default App;
