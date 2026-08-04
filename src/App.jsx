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
import { Bot, Mail, Lock, AlertCircle, Sparkles, User, CheckCircle2 } from 'lucide-react';

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        {invitationToken ? (
          /* Registro de Invitado */
          <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl glass transition-colors duration-300">
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
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 mt-3 font-semibold">Validando invitación...</span>
              </div>
            )}

            {invitationError && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{invitationError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setInvitationToken(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            )}

            {invitationDetails && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="p-3.5 bg-purple-500/5 border border-purple-500/10 rounded-xl text-xs space-y-1 text-left">
                  <p className="text-slate-500 dark:text-slate-405 font-medium">
                    Invitación válida para: <strong className="text-purple-600 dark:text-purple-400">{invitationDetails.email}</strong>
                  </p>
                  <p className="text-slate-500 dark:text-slate-405">
                    Rol asignado: <span className="font-extrabold capitalize">{invitationDetails.role === 'admin' ? 'Administrador' : 'Asesor Comercial'}</span>
                  </p>
                </div>

                {registerError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2.5 text-red-600 dark:text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                {registerSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2.5 text-emerald-600 dark:text-emerald-450 text-xs">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 animate-bounce" />
                    <span>{registerSuccess}</span>
                  </div>
                )}

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
          /* Login Card */
          <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl glass transition-colors duration-300">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/10">
                <Bot className="w-8 h-8 text-dark-950 font-bold" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white dark:bg-gradient-to-r dark:from-white dark:to-slate-400 dark:bg-clip-text dark:text-transparent">
                Antigravity CRM
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ingresa tus credenciales para continuar</p>
              <div className="mt-2.5 p-2 px-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] font-semibold text-emerald-700 dark:text-emerald-350">
                🔑 Acceso Admin: <span className="font-bold">admin@crm.com</span> | Pass: <span className="font-bold">adminpassword</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-600 dark:text-red-400 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="ejemplo@crm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Seed Admin Helper Tip */}
            <div className="mt-8 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Tip: Credenciales de administrador por defecto:
                <br />
                <code className="text-emerald-500 dark:text-emerald-400 font-semibold mt-1 block">admin@crm.com / adminpassword</code>
              </p>
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
      <div className="flex-1 flex h-full overflow-hidden">
        {activeTab === 'chats' && (
          <div className="flex-1 flex h-full overflow-hidden relative">
            {/* Lista de Chats (Panel Izquierdo) */}
            <div className={`${selectedContactId ? 'hidden md:block' : 'block'} w-full md:w-[26%] lg:w-[22%] min-w-[240px] max-w-[330px] flex-shrink-0 border-r border-slate-200 dark:border-white/5 h-full overflow-hidden`}>
              <ContactList />
            </div>
            
            {/* Ventana de Conversación (Panel Derecho) */}
            <div className={`${selectedContactId ? 'block' : 'hidden md:block'} flex-1 h-full overflow-hidden`}>
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
