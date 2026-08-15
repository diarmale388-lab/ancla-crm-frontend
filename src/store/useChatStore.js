import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
const WS_URL = import.meta.env.VITE_WS_URL || (isLocal ? 'ws://localhost:8001/ws' : 'wss://ancla-crm-backend-production.up.railway.app/ws');

export const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  agents: [],
  selectedContactId: null,
  wsConnected: false,
  loading: false,
  error: null,
  socket: null,
  typingContacts: {}, // Guarda los IDs de los contactos donde la IA está escribiendo: { contact_id: boolean }
  activeTab: 'chats',
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
      set({ contacts: data, loading: false });
    } catch (err) {
      if (!isSilent) set({ error: err.message, loading: false });
    }
  },

  fetchMessages: async (contactId, isSilent = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (!isSilent) set({ selectedContactId: contactId, loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/chats/${contactId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener el historial');

      const data = await response.json();
      set({ messages: data, loading: false });
    } catch (err) {
      if (!isSilent) set({ error: err.message, loading: false });
    }
  },

  pollingIntervalId: null,

  // Polling silencioso de respaldo cada 3.5 segundos para garantizar 100% de actualización sin F5
  startSilentPolling: () => {
    const existing = get().pollingIntervalId;
    if (existing) clearInterval(existing);

    const interval = setInterval(() => {
      get().fetchContacts(true);
      const activeId = get().selectedContactId;
      if (activeId) {
        get().fetchMessages(activeId, true);
      }
    }, 3500);

    set({ pollingIntervalId: interval });
  },

  stopSilentPolling: () => {
    const existing = get().pollingIntervalId;
    if (existing) clearInterval(existing);
    set({ pollingIntervalId: null });
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
      set({ socket: ws });
      let pingInterval = null;

      ws.onopen = () => {
        console.log('WebSocket bidireccional conectado exitosamente a:', wsUrl);
        set({ wsConnected: true });

        // Heartbeat Ping cada 25 segundos para evitar desconexión por inactividad
        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong' || event.data === 'ping') return;

        try {
          const payload = JSON.parse(event.data);
          const { event: eventName, data } = payload;

        if (eventName === 'message_received' || eventName === 'new_message') {
          // 🎵 REPRODUCIR CHIME AUDIBLE ROBUSTO ESTILO WHATSAPP Y EMITIR NOTIFICACIÓN PUSH
          const isFromContact = data.sender_type === 'contact' || data.sender_type === 'CONTACT';
          
          if (isFromContact) {
            get().playNotificationChime();
            
            // Emitir Notificación de Escritorio / Celular (Windows, Android, iOS PWA)
            const senderName = data.contact_name || 'Nuevo Prospecto';
            const msgBody = data.content || 'Ha enviado un mensaje nuevo';

            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                try {
                  new Notification(`💬 ANCLA CRM: ${senderName}`, {
                    body: msgBody,
                    icon: '/ancla_app_icon_192.png',
                    tag: `msg_${data.contact_id}_${data.id}`,
                    renotify: true
                  });
                } catch (notifErr) {
                  console.warn('Error al emitir notificación nativa:', notifErr);
                }
              }
            }
          }

          // Desactivar el estado typing al recibir la respuesta
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

          // Actualización instantánea de la lista lateral y reordenamiento al primer lugar
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
            get().fetchContacts();
          }

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
      console.warn('WebSocket desconectado. Intentando reconectar en 2s...');
      set({ wsConnected: false, socket: null });
      setTimeout(() => {
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (isAuth) {
          get().connectWebSocket();
        }
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error('Error en conexión WebSocket:', err);
      ws.close();
    };
    } catch (wsErr) {
      console.error('Excepción al instanciar WebSocket:', wsErr);
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

  playNotificationChime: () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!window._crmAudioCtx) {
        window._crmAudioCtx = new AudioCtx();
      }

      const ctx = window._crmAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 🔔 Tono Dual WhatsApp Premium: C5 (523.25 Hz) -> G5 (783.99 Hz)
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

      // Tono 2: Nota aguda cristalina G5 (783.99 Hz)
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
      console.warn('Error al reproducir pitido de notificación:', audioErr);
    }
  },

  requestNotificationPermission: async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          get().playNotificationChime();
          new Notification('💬 ANCLA CRM', {
            body: '¡Notificaciones de audio y banners activadas con éxito!',
            icon: '/ancla_app_icon_192.png'
          });
        }
      } else if (Notification.permission === 'granted') {
        get().playNotificationChime();
      }
    }
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, wsConnected: false });
    }
  }
}));
