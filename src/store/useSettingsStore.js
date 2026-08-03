import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://ancla-crm-backend-production.up.railway.app/api/v1';

export const useSettingsStore = create((set, get) => ({
  chatbotPrompt: '',
  geminiApiKey: '',
  loading: false,
  error: null,
  success: false,
  quickReplies: [],
  googleClientId: '',
  googleClientSecret: '',
  smtpHost: '',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
  smtpSenderEmail: '',
  smtpSenderName: '',
  googleConnected: false,
  googleExpiry: null,

  fetchChatbotSettings: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/settings/chatbot`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener configuraciones del chatbot');

      const data = await response.json();
      set({ 
        chatbotPrompt: data.chatbot_prompt, 
        geminiApiKey: data.gemini_api_key, 
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  saveChatbotSettings: async (chatbotPrompt, geminiApiKey) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null, success: false });
    try {
      const response = await fetch(`${API_URL}/settings/chatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbot_prompt: chatbotPrompt,
          gemini_api_key: geminiApiKey
        }),
      });

      if (!response.ok) throw new Error('Error al guardar entrenamiento de la IA');

      set({ 
        chatbotPrompt, 
        geminiApiKey, 
        loading: false, 
        success: true 
      });
      setTimeout(() => set({ success: false }), 2000);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  documents: [],
  fetchDocuments: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/settings/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener documentos');
      const data = await response.json();
      set({ documents: data });
    } catch (err) {
      console.error(err);
    }
  },

  uploadDocument: async (file) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/settings/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir el archivo');
      }

      const data = await response.json();
      set({ loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  deleteDocument: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/settings/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar documento');

      set((state) => ({
        documents: state.documents.filter(d => d.id !== id)
      }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  triggerDemoSimulation: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/settings/run-demo-simulation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchQuickReplies: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/settings/quick-replies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener respuestas rápidas');
      const data = await response.json();
      set({ quickReplies: data });
    } catch (err) {
      console.error(err);
    }
  },

  saveQuickReplies: async (replies) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/settings/quick-replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replies)
      });

      if (!response.ok) throw new Error('Error al guardar respuestas rápidas');

      set({ quickReplies: replies, loading: false, success: true });
      setTimeout(() => set({ success: false }), 2000);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  hasPdfTemplate: false,
  pdfTemplateFilename: null,

  fetchPdfTemplateStatus: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/settings/pdf-template-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener estado de plantilla PDF');
      const data = await response.json();
      set({ 
        hasPdfTemplate: data.has_template,
        pdfTemplateFilename: data.filename
      });
    } catch (err) {
      console.error(err);
    }
  },

  uploadPdfTemplate: async (file) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/settings/upload-pdf-template`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir la plantilla PDF');
      }

      const data = await response.json();
      set({ 
        hasPdfTemplate: true,
        pdfTemplateFilename: 'proposal_template.pdf',
        loading: false 
      });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  uploadWhatsappProfilePhoto: async (file) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/settings/whatsapp-profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la foto de perfil en Meta');
      }

      const data = await response.json();
      set({ loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  fetchGoogleClientSettings: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/settings/google-client`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener ajustes de cliente de Google');
      const data = await response.json();
      set({
        googleClientId: data.client_id,
        googleClientSecret: data.client_secret
      });
    } catch (err) {
      console.error(err);
    }
  },

  saveGoogleClientSettings: async (clientId, clientSecret) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/settings/google-client`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret
        })
      });
      if (!response.ok) throw new Error('Error al guardar credenciales de Google');
      set({
        googleClientId: clientId,
        googleClientSecret: clientSecret,
        loading: false,
        success: true
      });
      setTimeout(() => set({ success: false }), 2000);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  fetchGoogleAuthStatus: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/google-auth/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener estado de Google OAuth');
      const data = await response.json();
      set({
        googleConnected: data.connected,
        googleExpiry: data.expiry
      });
    } catch (err) {
      console.error(err);
    }
  },

  disconnectGoogle: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    try {
      const response = await fetch(`${API_URL}/google-auth/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al desconectar Google');
      set({
        googleConnected: false,
        googleExpiry: null
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchSmtpSettings: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/settings/smtp`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al obtener configuración SMTP');
      const data = await response.json();
      set({
        smtpHost: data.host,
        smtpPort: data.port,
        smtpUsername: data.username,
        smtpPassword: data.password,
        smtpSenderEmail: data.sender_email,
        smtpSenderName: data.sender_name
      });
    } catch (err) {
      console.error(err);
    }
  },

  saveSmtpSettings: async (settings) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/settings/smtp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Error al guardar configuración SMTP');
      set({
        smtpHost: settings.host,
        smtpPort: settings.port,
        smtpUsername: settings.username,
        smtpPassword: settings.password,
        smtpSenderEmail: settings.sender_email,
        smtpSenderName: settings.sender_name,
        loading: false,
        success: true
      });
      setTimeout(() => set({ success: false }), 2000);
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  testSmtpConnection: async (email) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/settings/test-smtp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      set({ loading: false });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Fallo en la conexión SMTP');
      }
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));
