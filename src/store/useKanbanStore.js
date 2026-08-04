import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export const useKanbanStore = create((set, get) => ({
  stages: [],
  leads: [],
  loading: false,
  error: null,

  fetchStages: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/pipeline/stages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener fases del pipeline');

      const data = await response.json();
      set({ stages: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchLeads: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/pipeline/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener leads del pipeline');

      const data = await response.json();
      set({ leads: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  moveLead: async (leadId, targetStageId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const previousLeads = [...get().leads];

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, pipeline_stage_id: targetStageId } : l
      )
    }));

    try {
      const response = await fetch(`${API_URL}/pipeline/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pipeline_stage_id: targetStageId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al actualizar etapa en el servidor');
      }
    } catch (err) {
      set({ leads: previousLeads, error: err.message });
      throw err;
    }
  },

  updateLeadDetails: async (leadId, patchData) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set((state) => ({
      leads: state.leads.map((l) => (l.id === leadId ? { ...l, ...patchData } : l))
    }));

    try {
      const response = await fetch(`${API_URL}/pipeline/leads/${leadId}/details`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        set((state) => ({
          leads: state.leads.map((l) => (l.id === leadId ? updatedLead : l))
        }));
      }
    } catch (err) {
      console.error("Error al actualizar detalles del lead:", err);
    }
  }
}));
