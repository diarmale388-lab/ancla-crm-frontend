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
      set({ appointments: data, loading: false });
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
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Error al actualizar cita');
      const updated = await response.json();

      set((state) => ({
        appointments: state.appointments.map(a => a.id === appointmentId ? { ...a, ...updated } : a)
      }));

      return true;
    } catch (err) {
      console.error("Error al actualizar cita:", err);
      return false;
    }
  },

  availability: [],
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
      set({ availability: data });
    } catch (err) {
      console.error(err);
    }
  },

  saveAvailability: async (days) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/appointments/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days }),
      });
      if (!response.ok) throw new Error('Error al guardar disponibilidad');
      
      // Recargar localmente
      await get().fetchAvailability();
      return true;
    } catch (err) {
      console.error(err);
      return false;
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

