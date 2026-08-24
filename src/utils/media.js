import { useAuthStore } from '../store/useAuthStore';

/**
 * Anexa el JWT de la sesión actual como query param (?token=...) a URLs de recursos
 * multimedia servidos por el backend (imágenes, audio, video, documentos, PDFs de
 * propuestas). Estos endpoints ahora exigen autenticación, y como los navegadores no
 * permiten adjuntar el header Authorization en atributos src/href de <img>, <audio>,
 * <video> o <a>, el token se pasa por query string para que sigan funcionando dentro
 * del CRM autenticado.
 *
 * No usar para requests hechos con fetch()/axios: en esos casos siempre se debe preferir
 * el header Authorization estándar.
 */
export function buildAuthenticatedMediaUrl(url) {
  if (!url) return url;
  try {
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    if (!token) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}token=${encodeURIComponent(token)}`;
  } catch (e) {
    return url;
  }
}
