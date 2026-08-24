import { create } from 'zustand';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Usuario o contraseña incorrectos');
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('Respuesta inválida del servidor');
      }

      localStorage.setItem('token', data.access_token);
      set({ token: data.access_token, isAuthenticated: true, loading: false, error: null });
      
      // Intentar obtener el perfil sin bloquear el login si hay lag de red
      get().fetchProfile();
      return true;
    } catch (err) {
      set({ error: err.message, loading: false, isAuthenticated: false });
      return false;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
    } catch (e) {}
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 400) {
        console.warn("Token expirado o usuario inactivo (401/400). Cerrando sesión.");
        get().logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        set({ user: data, isAuthenticated: true, loading: false });
      }
    } catch (err) {
      console.warn("Lag o micro-interrupción de red en celular. Manteniendo sesión activa:", err);
      // En celulares, mantener la sesión activa aunque falle la red momentáneamente
      set({ loading: false, isAuthenticated: true });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
      await get().fetchProfile();
    } else {
      set({ isAuthenticated: false, user: null });
    }
  }
}));
