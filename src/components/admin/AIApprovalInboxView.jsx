import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  RefreshCw, 
  Lock, 
  HelpCircle,
  Brain,
  MessageSquareQuote
} from 'lucide-react';

export const AIApprovalInboxView = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('PENDING');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovals = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/ai/approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Error al cargar la bandeja de aprobación.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id, updatedData = null) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const payload = updatedData ? {
        topic: updatedData.topic,
        detected_question: updatedData.question,
        official_answer: updatedData.answer
      } : null;

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/ai/approvals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: payload ? JSON.stringify(payload) : undefined
      });
      if (res.ok) {
        setEditingId(null);
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/ai/approvals/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar permanentemente esta directriz?')) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/ai/approvals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTopic.trim() || !newQuestion.trim() || !newAnswer.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/ai/approvals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: newTopic.trim(),
          detected_question: newQuestion.trim(),
          official_answer: newAnswer.trim(),
          source: 'MANUAL_ADMIN'
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTopic('');
        setNewQuestion('');
        setNewAnswer('');
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-dark-950">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Acceso Restringido a Dirección</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          La Bandeja de Aprobación y Curación de Sofi AI (Candado de Seguridad) está reservada exclusivamente para Administradores (Diego Machado y Liliana León).
        </p>
      </div>
    );
  }

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;

  const filteredApprovals = approvals.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-hidden font-sans">
      
      {/* Cabecera Superior */}
      <div className="p-6 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-500/20 via-navy-900/20 to-gold-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Bandeja de Aprobación de Sofi AI
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Candados 1 & 2 Activos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control de calidad y prevención de alucinaciones: Sofi AI solo responderá directrices aprobadas por ti.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all cursor-pointer"
            title="Recargar bandeja"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-gold-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Directriz Oficial</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 py-3 bg-slate-100 dark:bg-dark-900/60 border-b border-slate-200 dark:border-white/5 flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('PENDING')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'PENDING'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendientes de Revisión</span>
          {pendingCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('APPROVED')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'APPROVED'
              ? 'bg-navy-900 text-white shadow-md shadow-gold-500/20'
              : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-gold-50 dark:hover:bg-gold-500/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Directrices Vigentes en Sofi AI ({approvedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('REJECTED')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'REJECTED'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Descartadas ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Todas ({approvals.length})
        </button>
      </div>

      {/* Lista de Tarjetas */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold">Consultando directrices oficiales...</p>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center text-slate-400 mb-3">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No hay directrices en esta sección ({activeFilter})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {activeFilter === 'PENDING' 
                ? '¡Excelente! No tienes temas pendientes por revisar. Sofi AI está operando con las directrices vigentes aprobadas.'
                : 'Puedes proponer nuevas directrices con el botón "+ Nueva Directriz Oficial".'}
            </p>
          </div>
        ) : (
          filteredApprovals.map((item) => {
            const isEditing = editingId === item.id;
            const isPending = item.status === 'PENDING';
            const isApproved = item.status === 'APPROVED';

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-dark-900 border transition-all shadow-sm ${
                  isPending 
                    ? 'border-amber-500/40 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/[0.02] to-transparent' 
                    : isApproved
                      ? 'border-gold-500/30 dark:border-gold-500/20'
                      : 'border-slate-200 dark:border-white/5 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTopic}
                          onChange={(e) => setEditTopic(e.target.value)}
                          className="bg-slate-100 dark:bg-dark-800 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-lg text-xs font-bold"
                        />
                      ) : (
                        `📌 ${item.topic}`
                      )}
                    </span>
                    
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.source === 'LEON_INVESTIGA'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    }`}>
                      {item.source === 'LEON_INVESTIGA' ? '🔍 León Investiga Radar' : '👤 Manual Dirección'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : isApproved
                          ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {isPending ? '⏳ Pendiente' : isApproved ? '✅ En Producción' : '❌ Descartada'}
                    </span>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-slate-50 dark:bg-dark-800/70 rounded-xl border border-slate-200/70 dark:border-white/5">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pregunta / Duda Detectada del Cliente:</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-700 p-2 rounded-lg text-xs font-semibold"
                    />
                  ) : (
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 italic">
                      "{item.detected_question}"
                    </p>
                  )}
                </div>

                <div className="mb-4 p-3.5 bg-gold-500/5 dark:bg-gold-500/[0.03] rounded-xl border border-gold-500/20">
                  <div className="text-[11px] font-bold text-gold-700 dark:text-gold-400 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Respuesta Oficial Autorizada para Sofi AI:</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-slate-700 p-2 rounded-lg text-xs font-medium"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {item.official_answer}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                  <span className="text-[11px] text-slate-400">
                    ID #{item.id} • Registrado el {new Date(item.created_at).toLocaleDateString('es-CO')}
                  </span>

                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleApprove(item.id, { topic: editTopic, question: editQuestion, answer: editAnswer })}
                          disabled={actionLoading === item.id}
                          className="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar y Aprobar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditTopic(item.topic);
                            setEditQuestion(item.detected_question);
                            setEditAnswer(item.official_answer);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer"
                          title="Editar texto de la respuesta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                          title="Eliminar directriz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold cursor-pointer"
                            >
                              Rechazar
                            </button>

                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-4 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-gold-500/20 cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Aprobar para Sofi AI</span>
                            </button>
                          </>
                        )}

                        {!isPending && !isApproved && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={actionLoading === item.id}
                            className="px-3 py-1.5 rounded-lg bg-navy-900/20 border border-gold-500/40 text-gold-600 dark:text-gold-400 hover:bg-navy-900 hover:text-white font-bold cursor-pointer transition-all"
                          >
                            Reactivar y Aprobar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nueva Directriz Oficial para Sofi AI
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tema o Asunto (ej. Pozos Sépticos, Licencias, Paneles Solares)
                </label>
                <input
                  type="text"
                  placeholder="ej. Manejo de Pozos Sépticos en Lotes"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Pregunta o Duda Frecuente del Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej. ¿El pozo séptico está incluido en el valor de la casa?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Respuesta Oficial Autorizada (Lo que Sofi debe responder)
                </label>
                <textarea
                  rows={4}
                  placeholder="ej. Nuestras casas modulares se entregan 100% terminadas de fábrica con instalaciones hidrosanitarias internas listas. La adecuación del pozo séptico en terreno se evalúa y asesora técnicamente con nuestros ingenieros según el tipo de suelo en la Asesoría Virtual."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-gold-500/20 cursor-pointer"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Directriz</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
