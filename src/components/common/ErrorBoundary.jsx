import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary ha capturado una excepción:", error, errorInfo);
    
    // Telemetría Sentry / Registro Remoto si está disponible
    if (window.Sentry && typeof window.Sentry.captureException === 'function') {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#111b27] border border-white/10 rounded-3xl p-7 shadow-2xl space-y-5 text-center">
            
            {/* Medallón / Logo ANCLA */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                Recuperación del Sistema
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                El CRM interceptó un comportamiento inesperado. Tus datos y sesiones en el servidor están protegidos.
              </p>
            </div>

            {/* Error Snippet Colapsado */}
            {this.state.error && (
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-left text-[11px] font-mono text-rose-300/80 overflow-x-auto max-h-24">
                {String(this.state.error.message || this.state.error)}
              </div>
            )}

            {/* Botones de Acción Inmediata */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar / Recargar Interfaz</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Limpiar Caché Local & Restaurar</span>
              </button>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              ANCLA Special Projects LATAM • CRM v2.0
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
