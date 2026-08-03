import React from 'react';
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
  Building
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuthStore();
  const { disconnectWebSocket } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    disconnectWebSocket();
    logout();
  };

  return (
    <div className="w-[64px] h-full bg-[#f0f2f5] dark:bg-[#111b21] border-r border-slate-200 dark:border-[#202c33] flex flex-col justify-between items-center py-4 flex-shrink-0 z-35 select-none md:flex transition-colors duration-300">
      
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

        {/* Botón de Envíos Masivos / Broadcasts */}
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
        {/* Botón Consola CMD / Auditoría */}
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
    </div>
  );
};
