import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// Registro de Service Worker para soporte PWA Offline y Rápida Instalación con invalidación forzada
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=1.0.1')
      .then((reg) => {
        reg.update();
        console.log('✅ Service Worker PWA v1.0.1 registrado y actualizado:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Error al registrar Service Worker PWA:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
