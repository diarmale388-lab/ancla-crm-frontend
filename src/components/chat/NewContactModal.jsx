import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, MapPin, Building2, User, Layers, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export default function NewContactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const token = useAuthStore(state => state.token);
  const currentUser = useAuthStore(state => state.user);
  const { fetchContacts, fetchMessages } = useChatStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [lotStatus, setLotStatus] = useState('Por definir');
  const [lotCity, setLotCity] = useState('');
  const [interestProduct, setInterestProduct] = useState('Por definir');
  const [clientType, setClientType] = useState('Por definir');
  const [assignedUserId, setAssignedUserId] = useState(currentUser?.id || 4);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      alert("Por favor ingresa al menos el Nombre y el Teléfono del nuevo cliente.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/chats/create-contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          lot_status: lotStatus,
          lot_city: lotCity.trim(),
          interest_product: interestProduct,
          client_type: clientType,
          assigned_user_id: assignedUserId
        })
      });

      if (res.ok) {
        const newContact = await res.json();
        await fetchContacts();
        if (newContact && newContact.id) {
          fetchMessages(newContact.id);
        }
        onClose();
      } else {
        const errData = await res.json();
        alert(`Error al crear cliente: ${errData.detail || 'Verifica los datos'}`);
      }
    } catch (err) {
      console.error("Error creando contacto manual:", err);
      alert("Ocurrió un error de conexión al guardar el nuevo cliente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-[#334155] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 dark:text-white transition-colors">
        
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">Agregar Nuevo Cliente</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Creación manual de prospecto en CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                placeholder="Ej: Carlos"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500"
                placeholder="Ej: Calvache"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Teléfono Celular *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                placeholder="573001234567"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          {/* 4 Pilares de Liliana */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-[#334155] space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Diagnóstico Inicial (Requerimientos ANCLA)</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">🏞️ Terreno / Lote</label>
                <select
                  value={lotStatus}
                  onChange={(e) => setLotStatus(e.target.value)}
                  className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <option value="Sí, ya tengo">✅ Sí, ya tiene lote</option>
                  <option value="Buscando Lote">🟡 Buscando lote</option>
                  <option value="En Negociación">⏳ En negociación</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">📍 Municipio Obra</label>
                <input
                  type="text"
                  value={lotCity}
                  onChange={(e) => setLotCity(e.target.value)}
                  className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-1.5 text-xs font-bold"
                  placeholder="Ej: Armenia / Nemocón"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">🏗️ Modelo Interés</label>
                <select
                  value={interestProduct}
                  onChange={(e) => setInterestProduct(e.target.value)}
                  className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <option value="Por definir">❓ Por definir</option>
                  <option value="Flex Home EXP-36">Flex Home EXP-36 ($118.8M)</option>
                  <option value="Flex Home EXP-56">Flex Home EXP-56 ($188M)</option>
                  <option value="Cápsula Living CL-13">Cápsula CL-13 ($78M)</option>
                  <option value="Cápsula Living CL-26">Cápsula CL-26 ($148.8M)</option>
                  <option value="Glamping & Turismo">Glamping & Turismo</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">💼 Perfil Cliente</label>
                <select
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className="w-full bg-white dark:bg-[#182235] border border-slate-200 dark:border-[#2e3b52] rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <option value="Por definir">❓ Por definir</option>
                  <option value="Persona Natural">🏠 Persona Natural</option>
                  <option value="Empresario">🏢 Empresario</option>
                  <option value="Inversionista">💼 Inversionista</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">👤 Asesor Comercial Asignado</label>
            <select
              value={assignedUserId || ''}
              onChange={(e) => setAssignedUserId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 cursor-pointer"
            >
              <option value="4">Asesor Comercial ANCLA (asesor@anclaspecialprojects.com)</option>
              <option value="3">Liliana León (Directora Comercial)</option>
              <option value="5">Super Admin (diarmale388)</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              {saving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Crear Cliente</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
