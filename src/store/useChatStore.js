import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
const WS_URL = import.meta.env.VITE_WS_URL || (isLocal ? 'ws://localhost:8001/ws' : 'wss://ancla-crm-backend-production.up.railway.app/ws');

// Helper para convertir clave pública VAPID de base64url a Uint8Array requerido por PushManager
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  agents: [],
  selectedContactId: null,
  wsConnected: false,
  loading: false,
  error: null,
  messagesError: null,
  socket: null,
  typingContacts: {}, // Guarda los IDs de los contactos donde la IA está escribiendo: { contact_id: boolean }
  activeTab: 'chats',
  pushPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  isPushSubscribed: false,
  isPushLoading: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedContactId: (id) => set({ selectedContactId: id }),

  fetchContacts: async (isSilent = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (!isSilent) set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/chats/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener los contactos');

      const data = await response.json();
      set({ contacts: data, loading: false, error: null });
    } catch (err) {
      if (!isSilent) set({ error: err.message, loading: false });
    }
  },

  fetchMessages: async (contactId, isSilent = false) => {
    const token = useAuthStore.getState().token;
    if (!token || !contactId) return;

    if (!isSilent) set({ selectedContactId: contactId, loading: true, messagesError: null });
    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        set({ messages: [], loading: false });
        return;
      }

      const data = await response.json();
      
      // Detección de mensajes nuevos entrantes durante el polling de respaldo
      if (isSilent && Array.isArray(data)) {
        const prevMessages = get().messages || [];
        if (prevMessages.length > 0 && data.length > prevMessages.length) {
          const prevLastId = prevMessages[prevMessages.length - 1]?.id || 0;
          const newIncoming = data.filter(
            (m) => m.id > prevLastId && (m.sender_type === 'contact' || m.sender_type === 'CONTACT')
          );
          if (newIncoming.length > 0) {
            get().playNotificationChime();
          }
        }
      }

      set({ messages: Array.isArray(data) ? data : [], loading: false, messagesError: null });
    } catch (err) {
      if (!isSilent) set({ messagesError: err.message, loading: false });
    }
  },

  pollingIntervalId: null,

  stopSilentPolling: () => {
    const existing = get().pollingIntervalId;
    if (existing) {
      clearInterval(existing);
      set({ pollingIntervalId: null });
    }
  },

  sendMessage: async (contactId, content, isInternalNote = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const channelType = isInternalNote ? 'system' : 'whatsapp';

    try {
      // Optimistic Update en la UI
      const tempId = Date.now();
      const tempMsg = {
        id: tempId,
        contact_id: contactId,
        sender_type: 'user',
        channel: channelType,
        message_type: 'text',
        content: content,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      set((state) => ({
        messages: state.selectedContactId === contactId ? [...state.messages, tempMsg] : state.messages
      }));

      const response = await fetch(`${API_URL}/chats/${contactId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          channel: channelType
        })
      });

      if (!response.ok) throw new Error('Error al enviar el mensaje');

      const data = await response.json();

      // Reemplazar mensaje temporal con el del servidor
      set((state) => ({
        messages: state.messages.map((m) => m.id === tempId ? data : m)
      }));

      get().updateContactLastMessage(contactId, content, data.created_at);

      // Si la IA está activa y no es nota interna, activar temporalmente la animación de escribiendo
      const contact = get().contacts.find(c => c.id === contactId);
      if (contact && contact.chatbot_enabled && !isInternalNote) {
        set((state) => ({
          typingContacts: { ...state.typingContacts, [contactId]: true }
        }));
        setTimeout(() => {
          set((state) => ({
            typingContacts: { ...state.typingContacts, [contactId]: false }
          }));
        }, 3000);
      }

    } catch (err) {
      console.error('Error al enviar el mensaje:', err);
    }
  },

  sendMediaMessage: async (contactId, file, mediaType) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const tempId = Date.now();
      const tempMsg = {
        id: tempId,
        contact_id: contactId,
        sender_type: 'user',
        channel: 'whatsapp',
        message_type: mediaType,
        content: `[Cargando ${mediaType === 'image' ? 'imagen' : mediaType === 'audio' ? 'audio' : 'documento'}...]`,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      set((state) => ({
        messages: state.selectedContactId === contactId ? [...state.messages, tempMsg] : state.messages
      }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', mediaType);

      const response = await fetch(`${API_URL}/chats/${contactId}/send-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al enviar el archivo');

      const data = await response.json();

      set((state) => ({
        messages: state.messages.map((m) => m.id === tempId ? data : m)
      }));

      get().updateContactLastMessage(contactId, `[Archivo: ${file.name}]`, data.created_at);

    } catch (err) {
      console.error('Error al enviar el archivo:', err);
    }
  },

  updateContactLastMessage: (contactId, content, createdAt) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              last_message: content,
              last_message_time: createdAt,
            }
          : c
      )
    }));
  },

  toggleChatbot: async (contactId, enabled) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/toggle-chatbot`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatbot_enabled: enabled })
      });

      if (!response.ok) throw new Error('Error al alternar el chatbot');

      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, chatbot_enabled: enabled } : c
        )
      }));

    } catch (err) {
      console.error('Error alternando chatbot:', err);
    }
  },

  triggerAiResponse: async (contactId) => {
    const token = useAuthStore.getState().token;
    if (!token || !contactId) return false;

    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/trigger-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al forzar la IA');
      }

      // Activar optimísticamente chatbot_enabled en la lista de contactos
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, chatbot_enabled: true } : c
        )
      }));

      // Refrescar mensajes e historial
      get().fetchContacts(true);
      get().fetchMessages(contactId, true);
      return true;
    } catch (err) {
      console.error('Error al forzar respuesta de Sofi IA:', err);
      throw err;
    }
  },

  deleteContact: async (contactId) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/chats/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar chat');

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== contactId),
        selectedContactId: state.selectedContactId === contactId ? null : state.selectedContactId,
        messages: state.selectedContactId === contactId ? [] : state.messages
      }));
      return true;
    } catch (err) {
      console.error('Error eliminando contacto:', err);
      return false;
    }
  },

  updateContactStage: async (contactId, stageId) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/pipeline/leads/${contactId}/stage`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pipeline_stage_id: parseInt(stageId, 10) })
      });

      if (!response.ok) throw new Error('Error al actualizar fase del lead');

      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, pipeline_stage_id: stageId } : c
        )
      }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  sendProposalWithAi: async (contactId, modelName, extras, discount) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/settings/send-proposal/${contactId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_name: modelName,
          extras: extras,
          discount: parseInt(discount, 10) || 0
        })
      });

      if (!response.ok) throw new Error('Error al enviar la propuesta con IA');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  fetchAgents: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/chats/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener agentes');
      const data = await response.json();
      set({ agents: data });
    } catch (err) {
      console.error(err);
    }
  },

  assignContact: async (contactId, userId) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigned_user_id: userId ? parseInt(userId, 10) : null })
      });

      if (!response.ok) throw new Error('Error al asignar contacto');

      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, assigned_user_id: userId } : c
        )
      }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  updateContactDetails: async (contactId, updatedFields) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/details`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) throw new Error('Error al actualizar contacto');

      const data = await response.json();
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId ? { ...c, ...updatedFields } : c
        )
      }));
      return true;
    } catch (err) {
      console.error('Error al actualizar contacto:', err);
      return false;
    }
  },

  lastHeartbeat: Date.now(),
  watchdogIntervalId: null,

  connectWebSocket: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    let existingSocket = get().socket;
    if (existingSocket && (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const defaultHost = isLocal ? 'localhost:8001/api/v1/chats/ws' : 'ancla-crm-backend-production.up.railway.app/api/v1/chats/ws';
    const customWsHost = import.meta.env.VITE_WS_URL ? import.meta.env.VITE_WS_URL.replace(/^wss?:\/\//, '') : null;
    const wsHost = customWsHost || defaultHost;
    const wsUrl = `${wsProtocol}//${wsHost}?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);
      set({ socket: ws, lastHeartbeat: Date.now() });
      let pingInterval = null;

      ws.onopen = () => {
        console.log('WebSocket bidireccional conectado exitosamente a:', wsUrl);
        set({ wsConnected: true, lastHeartbeat: Date.now() });
        // El WebSocket ya es la fuente de verdad en tiempo real: detener el
        // polling de respaldo si estaba activo por una desconexión previa.
        get().stopSilentPolling();

        // Heartbeat Ping cada 5 segundos para mantener la conexión viva y detectar caídas rápidamente
        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 5000);
      };

      // Watchdog de salud de conexión cada 2.5s: si no hay respuesta en 5s, activa polling delta
      if (!get().watchdogIntervalId) {
        const watchdog = setInterval(() => {
          const now = Date.now();
          const lastHb = get().lastHeartbeat || 0;
          const isConnected = get().wsConnected && ws && ws.readyState === WebSocket.OPEN;

          if (!isConnected || (now - lastHb > 6000)) {
            // Asegurar que el polling delta de respaldo esté activo
            if (!get().pollingIntervalId) {
              get().startSilentPolling();
            }
            // Intentar reconectar el WebSocket si está cerrado
            if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
              get().connectWebSocket();
            }
          }
        }, 2500);
        set({ watchdogIntervalId: watchdog });
      }

      ws.onmessage = (event) => {
        set({ lastHeartbeat: Date.now() });
        if (event.data === 'pong' || event.data === 'ping') return;

        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data } = payload;

        if (eventName === 'message_received' || eventName === 'new_message') {
          // ⚡ 1. ACTUALIZACIÓN DE ESTADO Y RENDERIZADO EN PANTALLA INSTANTÁNEO (0ms de latencia)
          set((state) => ({
            typingContacts: { ...state.typingContacts, [data.contact_id]: false }
          }));

          const activeContactId = get().selectedContactId;
          if (activeContactId && String(activeContactId) === String(data.contact_id)) {
            set((state) => {
              const exists = state.messages.some((m) => m.id === data.id);
              return {
                messages: exists ? state.messages : [...state.messages, data]
              };
            });
          }

          // Actualización e instantánea reordenación de la lista de chats en primer lugar
          const currentContacts = get().contacts;
          const targetIndex = currentContacts.findIndex((c) => String(c.id) === String(data.contact_id));
          if (targetIndex !== -1) {
            const updatedContact = {
              ...currentContacts[targetIndex],
              last_message: data.content,
              last_message_time: data.created_at || new Date().toISOString()
            };
            const remaining = currentContacts.filter((c) => String(c.id) !== String(data.contact_id));
            set({ contacts: [updatedContact, ...remaining] });
          } else {
            get().fetchContacts(true);
          }

          // 🎵 2. EJECUCIÓN ASÍNCRONA NO BLOQUEANTE DE SONIDO Y NOTIFICACIÓN PUSH (En hilo secundario sin afectar la UI)
          setTimeout(() => {
            const isFromContact = data.sender_type === 'contact' || data.sender_type === 'CONTACT';
            if (isFromContact) {
              get().playNotificationChime();
              
              const senderName = data.contact_name
                || (data.contact && `${data.contact.first_name || ''} ${data.contact.last_name || ''}`.trim())
                || 'Nuevo Prospecto';
              const msgBody = data.content || 'Ha enviado un mensaje nuevo a ANCLA CRM';

              // Notificación en Service Worker (Barra de estado superior en celulares Android, iOS y PC)
              // Usa navigator.serviceWorker.ready en vez de .controller para funcionar desde la primera carga
              if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                  reg.showNotification(`💬 ${senderName}`, {
                    body: msgBody,
                    icon: '/ancla_app_icon_192.png',
                    badge: '/notification-badge.png',
                    vibrate: [200, 100, 200, 100, 200],
                    tag: `msg_${data.contact_id}`,
                    renotify: true,
                    data: { url: '/' }
                  });
                }).catch(swErr => {
                  console.warn('SW notification fallback:', swErr);
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`💬 ${senderName}`, {
                      body: msgBody,
                      icon: '/ancla_app_icon_192.png',
                      tag: `msg_${data.contact_id}`
                    });
                  }
                });
              }

              // Globo Rojo Badge API
              if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
                try {
                  const currentUnread = (get().contacts || []).filter(c => c.unread_count > 0).length + 1;
                  navigator.setAppBadge(currentUnread);
                } catch (badgeErr) {
                  console.warn('App Badge error:', badgeErr);
                }
              }
            }
          }, 0);

        } else if (eventName === 'message_sent') {
          const activeContactId = get().selectedContactId;
          if (activeContactId && String(activeContactId) === String(data.contact_id)) {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === data.id ? { ...m, status: data.status, external_message_id: data.external_message_id } : m
              )
            }));
          }
          get().updateContactLastMessage(data.contact_id, data.content, data.created_at);

        } else if (eventName === 'contact_details_updated') {
          set((state) => ({
            contacts: state.contacts.map((c) =>
              c.id === data.contact_id ? { ...c, ...data } : c
            )
          }));

        } else if (eventName === 'chatbot_toggled') {
          set((state) => ({
            contacts: state.contacts.map((c) =>
              c.id === data.contact_id ? { ...c, chatbot_enabled: data.chatbot_enabled } : c
            )
          }));
        } else if (eventName === 'lead_stage_updated') {
          import('./useKanbanStore').then(({ useKanbanStore }) => {
            useKanbanStore.setState((state) => ({
              leads: state.leads.map((l) =>
                l.id === data.contact_id ? { ...l, pipeline_stage_id: data.pipeline_stage_id } : l
              )
            }));
          }).catch(err => console.error("Error al importar useKanbanStore:", err));
        } else if (eventName === 'contact_assigned') {
          set((state) => ({
            contacts: state.contacts.map((c) =>
              c.id === data.contact_id ? { ...c, assigned_user_id: data.assigned_user_id } : c
            )
          }));
        } else if (eventName === 'appointment_deleted') {
          // Si la cita borrada coincide con el contacto activo, refrescar slots
          const activeId = get().selectedContactId;
          if (activeId === data.contact_id) {
            import('./useCalendarStore').then(({ useCalendarStore }) => {
              useCalendarStore.getState().fetchSlots(activeId);
            });
          }
        } else if (eventName === 'agent_mentioned') {
          const messageText = `📢 ¡Mención! ${data.author_name} te mencionó en el lead ${data.contact_name}: "${data.content}"`;
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('CRM Omnicanal - Mención de Asesor', {
              body: messageText,
              icon: '/favicon.ico'
            });
          } else {
            alert(messageText);
          }
        } else if (eventName === 'message_deleted') {
          const activeContactId = get().selectedContactId;
          if (activeContactId === data.contact_id) {
            set((state) => ({
              messages: state.messages.filter((m) => m.id !== data.id)
            }));
          }
          get().fetchContacts();
        } else if (eventName === 'message_edited') {
          const activeContactId = get().selectedContactId;
          if (activeContactId === data.contact_id) {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === data.id ? { ...m, content: data.content, created_at: data.created_at } : m
              )
            }));
          }
          get().fetchContacts();
        }
      } catch (err) {
        console.error('Error procesando trama de WebSocket:', err);
      }
    };

    ws.onclose = () => {
      console.warn('WebSocket desconectado. Activando polling delta de respaldo e intentando reconectar...');
      set({ wsConnected: false, socket: null });
      get().startSilentPolling();
      setTimeout(() => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (isAuth) {
          get().connectWebSocket();
        }
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error('Error en conexión WebSocket. Activando polling delta de respaldo...');
      get().startSilentPolling();
      ws.close();
    };
    } catch (wsErr) {
      console.error('Excepción al instanciar WebSocket:', wsErr);
      get().startSilentPolling();
    }
  },

  deleteMessage: async (messageId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/chats/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al borrar el mensaje');
    } catch (err) {
      console.error(err);
    }
  },

  editMessage: async (messageId, content) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/chats/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Error al editar el mensaje');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // 🔊 Desbloqueador Global de Motores de Audio (Web Audio API + HTML5 Audio)
  unlockAudioEngine: () => {
    try {
      // 1. Desbloquear Web Audio API Context
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!window._crmAudioCtx) {
          window._crmAudioCtx = new AudioCtx();
        }
        if (window._crmAudioCtx.state === 'suspended') {
          window._crmAudioCtx.resume().catch(() => {});
        }
      }

      // 2. Pre-cargar instancia HTML5 Audio
      if (typeof window !== 'undefined' && !window._crmAudioElement) {
        const audio = new Audio('/notification.wav');
        audio.preload = 'auto';
        audio.volume = 1.0;
        window._crmAudioElement = audio;
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }
  },

  // 🔄 Reconexión reactiva instantánea al cambiar visibilidad o enfocar ventana
  reconnectIfDisconnected: () => {
    const socket = get().socket;
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      console.log('🔄 Reconectando WebSocket tras reanudar foco/visibilidad...');
      get().connectWebSocket();
    }
    get().fetchContacts(true);
    const activeId = get().selectedContactId;
    if (activeId) {
      get().fetchMessages(activeId, true);
    }
  },

  // 🔔 Reproductor Híbrido Garantizado (HTML5 WAV + Sintetizador Web Audio API)
  playNotificationChime: async () => {
    // Canal 1: Reproducción directa HTML5 Audio
    try {
      if (typeof window !== 'undefined') {
        if (!window._crmAudioElement) {
          window._crmAudioElement = new Audio('/notification.wav');
        }
        const audio = window._crmAudioElement.cloneNode();
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    } catch (e) {
      // Fallback a oscilador sintetizado
    }

    // Canal 2: Sintetizador Web Audio API (Chime de doble tono cristalino)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!window._crmAudioCtx) {
        window._crmAudioCtx = new AudioCtx();
      }

      const ctx = window._crmAudioCtx;
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // Tono 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const osc1Sub = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = 'sine';
      osc1Sub.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1Sub.frequency.setValueAtTime(1046.50, now);
      
      gain1.gain.setValueAtTime(0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      osc1.connect(gain1);
      osc1Sub.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc1.start(now);
      osc1Sub.start(now);
      osc1.stop(now + 0.18);
      osc1Sub.stop(now + 0.18);

      // Tono 2: G5 (783.99 Hz)
      const osc2 = ctx.createOscillator();
      const osc2Sub = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.type = 'sine';
      osc2Sub.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.12);
      osc2Sub.frequency.setValueAtTime(1567.98, now + 0.12);
      
      gain2.gain.setValueAtTime(1.0, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc2.connect(gain2);
      osc2Sub.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.start(now + 0.12);
      osc2Sub.start(now + 0.12);
      osc2.stop(now + 0.45);
      osc2Sub.stop(now + 0.45);

    } catch (audioErr) {
      console.warn('Web Audio synthesis error:', audioErr);
    }
  },

  // 🔔 1. Verificar estado actual de la suscripción WebPush en el navegador
  checkPushSubscriptionStatus: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const currentPermission = Notification.permission;
    set({ pushPermission: currentPermission });

    if ('serviceWorker' in navigator && 'PushManager' in window && currentPermission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        set({ isPushSubscribed: !!sub });
      } catch (e) {
        console.warn('Error verificando suscripción Push:', e);
      }
    }
  },

  // 🔔 2. Suscripción Nativa WebPush (VAPID) para Android, iOS (PWA 16.4+) y PC
  subscribeToPushNotifications: async (interactive = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, message: 'Usuario no autenticado' };

    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return { success: false, message: 'Este navegador no soporta notificaciones WebPush.' };
    }

    set({ isPushLoading: true });
    try {
      // A. Solicitar permiso al usuario
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
        set({ pushPermission: permission });
      }

      if (permission !== 'granted') {
        set({ isPushLoading: false, isPushSubscribed: false });
        return {
          success: false,
          permission,
          message: permission === 'denied'
            ? 'Notificaciones bloqueadas en el navegador. Por favor habilítalas en Ajustes del Sitio.'
            : 'Permiso de notificaciones no concedido.'
        };
      }

      // B. Obtener Clave Pública VAPID del Backend
      const vapidRes = await fetch(`${API_URL}/notifications/vapid-public-key`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!vapidRes.ok) throw new Error('No se pudo obtener la clave VAPID pública.');
      const vapidData = await vapidRes.json();
      const vapidPublicKey = vapidData.public_key;

      // C. Obtener el Service Worker y crear la suscripción VAPID fresca
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      const applicationServerKey = urlB64ToUint8Array(vapidPublicKey);

      // Si existía una suscripción previa del navegador, la renovamos para asegurar la sincronización con PostgreSQL
      if (subscription) {
        try {
          await subscription.unsubscribe();
        } catch (unsubErr) {
          console.warn('Renovando suscripción previa:', unsubErr);
        }
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // D. Enviar la suscripción a PostgreSQL para que el backend la asocie al asesor
      const subJson = subscription.toJSON();
      const saveRes = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth
          },
          user_agent: navigator.userAgent
        })
      });

      if (!saveRes.ok) throw new Error('Error al registrar dispositivo en la base de datos.');

      set({ isPushSubscribed: true, pushPermission: 'granted', isPushLoading: false });
      get().playNotificationChime();

      if (interactive) {
        // Enviar notificación local de bienvenida
        registration.showNotification('🚀 ANCLA CRM - Notificaciones Activas', {
          body: '¡Excelente! Ahora recibirás alertas en tiempo real incluso con la pantalla apagada o la app cerrada.',
          icon: '/ancla_app_icon_192.png',
          badge: '/notification-badge.png',
          vibrate: [200, 100, 200, 100, 200],
          tag: 'ancla_welcome_push'
        });
      }

      return { success: true, message: '¡Dispositivo registrado exitosamente para notificaciones en segundo plano!' };
    } catch (err) {
      console.error('Error suscribiendo a WebPush:', err);
      set({ isPushLoading: false });
      return { success: false, message: err.message || 'Error durante la suscripción push.' };
    }
  },

  // 🔔 3. Enviar notificación Push de prueba desde el backend
  sendTestPushNotification: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, message: 'No autenticado' };

    try {
      const response = await fetch(`${API_URL}/notifications/test-push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error enviando push de prueba:', err);
      return { status: 'error', message: err.message };
    }
  },

  // Polling silencioso de respaldo: única definición (evita duplicidad/carreras).
  // Solo debe operar como red de seguridad mientras el WebSocket esté caído;
  // en cuanto la conexión en tiempo real se restablece (ws.onopen ->
  // stopSilentPolling), este intervalo se detiene automáticamente.
  startSilentPolling: () => {
    if (get().pollingIntervalId) return;
    const token = useAuthStore.getState().token;
    if (!token) return;

    const interval = setInterval(() => {
      // Salvaguarda adicional: si el WebSocket ya está activo, no tiene
      // sentido seguir consultando por polling; se detiene a sí mismo.
      if (get().wsConnected) {
        get().stopSilentPolling();
        return;
      }

      get().fetchContacts(true);
      const activeId = get().selectedContactId;
      if (activeId) {
        get().fetchMessages(activeId, true);
      }
    }, 3000);

    set({ pollingIntervalId: interval });
  },

  requestNotificationPermission: async () => {
    await get().subscribeToPushNotifications(false);
  },

  disconnectWebSocket: () => {
    const { socket, pollingIntervalId, watchdogIntervalId } = get();
    if (socket) {
      socket.close();
    }
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    if (watchdogIntervalId) clearInterval(watchdogIntervalId);
    set({ socket: null, wsConnected: false, pollingIntervalId: null, watchdogIntervalId: null });
  }
}));

