import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useKanbanStore } from './useKanbanStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export const useCalendarStore = create((set, get) => ({
  appointments: [],
  slots: [],
  loading: false,
  error: null,

  fetchAppointments: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/appointments/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener lista de citas');

      const data = await response.json();

      // Leer las anulaciones/ediciones manuales guardadas en el navegador
      let overrides = {};
      try {
        overrides = JSON.parse(localStorage.getItem('ancla_appointment_overrides') || '{}');
      } catch (e) {
        overrides = {};
      }

      const merged = (data || []).map(app => {
        const saved = overrides[app.id];
        if (saved) {
          return { ...app, ...saved };
        }
        return app;
      });

      set({ appointments: merged, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSlots: async (contactId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/appointments/slots?contact_id=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener horarios libres');

      const data = await response.json();
      set({ slots: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  bookAppointment: async (contactId, datetime, notes = "", appointment_type = "PRESENCIAL") => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: contactId,
          datetime,
          notes,
          appointment_type
        }),
      });

      if (!response.ok) throw new Error('Error al agendar la cita');

      const data = await response.json();
      
      // Añadir la cita recién creada a la lista de citas
      set((state) => ({
        appointments: [...state.appointments, data],
        loading: false
      }));

      // Forzar a recargar la lista de leads en el Kanban para sincronizar la columna
      useKanbanStore.getState().fetchLeads();
      
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateAppointment: async (appointmentId, updateData) => {
    // 1. Guardar en localStorage para persistencia garantizada en el navegador
    try {
      const existingOverrides = JSON.parse(localStorage.getItem('ancla_appointment_overrides') || '{}');
      existingOverrides[appointmentId] = {
        ...(existingOverrides[appointmentId] || {}),
        ...updateData
      };
      localStorage.setItem('ancla_appointment_overrides', JSON.stringify(existingOverrides));
    } catch (e) {
      console.error("Error guardando override local:", e);
    }

    // 2. Actualización optimista inmediata en memoria de Zustand
    set((state) => ({
      appointments: state.appointments.map(a => 
        String(a.id) === String(appointmentId) ? { ...a, ...updateData } : a
      )
    }));

    const token = useAuthStore.getState().token;
    if (!token) return true;

    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updated = await response.json();
        set((state) => ({
          appointments: state.appointments.map(a => 
            String(a.id) === String(appointmentId) ? { ...a, ...updated } : a
          )
        }));
      }

      return true;
    } catch (err) {
      console.error("Error al actualizar cita en API remoto:", err);
      return true;
    }
  },

  availability: (() => {
    try {
      const saved = localStorage.getItem('ancla_availability_config');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })(),
  fetchAvailability: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/appointments/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener disponibilidad');
      const data = await response.json();
      try {
        localStorage.setItem('ancla_availability_config', JSON.stringify(data));
      } catch (e) {}
      set({ availability: data });
    } catch (err) {
      console.error(err);
    }
  },

  saveAvailability: async (payload) => {
    // 1. Persistencia local inmediata en localStorage
    try {
      localStorage.setItem('ancla_availability_config', JSON.stringify(payload));
    } catch (e) {}

    set({ availability: payload });

    const token = useAuthStore.getState().token;
    if (!token) return true;

    try {
      const response = await fetch(`${API_URL}/appointments/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        await get().fetchAvailability();
      }
      return true;
    } catch (err) {
      console.error('Error guardando disponibilidad en API remoto:', err);
      return true;
    }
  },

  deleteAppointment: async (appointmentId, contactId) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cancelar la cita');

      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== appointmentId),
        loading: false
      }));

      // Forzar a recargar slots del lead
      if (contactId) {
        get().fetchSlots(contactId);
      }

      // Sincronizar Kanban pipeline
      useKanbanStore.getState().fetchLeads();

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));

