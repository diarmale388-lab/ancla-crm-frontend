import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// Registro de Service Worker para soporte PWA Offline y Rápida Instalación con invalidación forzada
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=1.5.2')
      .then((reg) => {
        reg.update();
        console.log('✅ Service Worker PWA v1.5.2 registrado y actualizado:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Error al registrar Service Worker PWA:', err);
      });
  });
}

// Auto-recuperación ante desincronización de bundles JS (ChunkLoadError / 404 de versión previa)
window.addEventListener('error', (e) => {
  const isChunkError = e?.message?.includes('Failed to fetch dynamically imported module') ||
                       e?.message?.includes('Loading chunk') ||
                       e?.target?.tagName === 'SCRIPT';
  if (isChunkError) {
    const hasReloaded = sessionStorage.getItem('ancla_chunk_reload');
    if (!hasReloaded) {
      sessionStorage.setItem('ancla_chunk_reload', 'true');
      console.warn('🔄 Desincronización de bundle detectada. Recargando versión más reciente...');
      window.location.reload();
    }
  }
}, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
