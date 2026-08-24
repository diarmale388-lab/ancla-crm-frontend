import React, { useEffect, useState } from 'react';
import { 
  Volume2, 
  Users, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useKanbanStore } from '../../store/useKanbanStore';

export default function BroadcastView() {
  const { stages, fetchStages } = useKanbanStore();
  const [isAdmin, setIsAdmin] = useState(true);

  // Filtros
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(1.5);

  // Estados de ejecución
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchStages();
    // Validar si es administrador
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const me = await res.json();
          if (me.role !== 'admin') {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  // Pre-cargar texto al cambiar de plantilla para hacer el formulario interactivo
  useEffect(() => {
    if (templateName === 'bienvenida_ancla') {
      setMessageText("¡Hola! Te damos la bienvenida a ANCLA Special Projects. ¿En qué podemos ayudarte hoy?");
    } else if (templateName === 'propuesta_ancla') {
      setMessageText("Hola, te escribo para hacer seguimiento sobre la propuesta comercial de la cabaña modular. ¿Pudiste revisarla?");
    } else if (templateName === 'seguimiento_ancla') {
      setMessageText("Hola, notamos que no agendamos la cita para esta semana. ¿Prefieres agendar para el lunes o el martes?");
    } else {
      setMessageText('');
    }
  }, [templateName]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/broadcasts/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message_text: messageText,
          pipeline_stage_id: selectedStage ? parseInt(selectedStage) : null,
          lead_source: selectedSource || null,
          interest_product: selectedInterest || null,
          qualification_level: selectedQualification || null,
          template_name: templateName || null,
          delay_seconds: parseFloat(delaySeconds)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.detail || "Error al iniciar la campaña de difusión.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Envíos Masivos (Broadcasts)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Acceso Restringido: Solo los usuarios con rol de Administrador pueden enviar campañas de difusión masiva.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-y-auto transition-colors duration-300">
      {/* Cabecera */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 backdrop-blur-md flex items-center justify-between glass flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-gold-500 animate-bounce" />
            <span>Difusiones de WhatsApp (Broadcasts)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Envía mensajes masivos filtrando prospectos, con control de tiempos antispam
          </p>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario de Configuración */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl space-y-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Nueva Campaña de Difusión</h4>

            {/* Filtros */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Filtrar por Etapa Kanban</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50"
                >
                  <option value="">-- Todos los Leads --</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Filtrar por Origen/Fuente</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50"
                >
                  <option value="">-- Todos los Orígenes --</option>
                  <option value="WhatsApp">WhatsApp Orgánico</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Manual">Carga Manual</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Interés de Producto (Maduración)</label>
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50 font-medium"
                >
                  <option value="">-- Todos los Productos --</option>
                  <option value="Glamping">Glamping / Cápsulas LINVIG</option>
                  <option value="Flex Home">Flex Home (Casas Expandibles)</option>
                  <option value="Cuartos Fríos">Cuartos Fríos Copeland</option>
                  <option value="Bodegas Industriales">Bodegas Industriales</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Calificación del Lead</label>
                <select
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50 font-medium"
                >
                  <option value="">-- Todos los Niveles --</option>
                  <option value="potencial">🟢 Alta Intención (Potenciales)</option>
                  <option value="explorador">🟡 En Exploración (Nurturing)</option>
                  <option value="curioso">🔴 Inicial / Curiosos</option>
                </select>
              </div>
            </div>

            {/* Plantillas de Meta */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2 flex items-center justify-between">
                <span>Plantilla Aprobada (WhatsApp Cloud API)</span>
                <span className="text-[8px] bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold px-1.5 py-0.5 rounded">Obligatorio si es &gt; 24h</span>
              </label>
              <select
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50"
              >
                <option value="">Ninguno (Texto Libre - Solo contactos recientes)</option>
                <option value="bienvenida_ancla">bienvenida_ancla (Plantilla de Registro)</option>
                <option value="propuesta_ancla">propuesta_ancla (Seguimiento de Propuesta)</option>
                <option value="seguimiento_ancla">seguimiento_ancla (Reactivación de Lead)</option>
              </select>
            </div>

            {/* Cuerpo del Mensaje */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Mensaje a Enviar</label>
              <textarea
                placeholder="Escribe el cuerpo del mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-slate-855 dark:text-slate-250 focus:outline-none focus:border-gold-500/50 leading-relaxed"
                required
              />
            </div>

            {/* Delay Slider Throttling */}
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                <span>Retraso entre mensajes (Segundos)</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">{delaySeconds}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <span className="text-[9px] text-slate-450 dark:text-slate-500 block mt-1">
                🕒 Delays mayores a 1.5s previenen que los algoritmos de detección de SPAM de WhatsApp suspendan tu cuenta.
              </span>
            </div>

            {/* Errores y Resultados */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{result.message}</span>
                </div>
                <div className="pl-6 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <p>• Destinatarios filtrados: <strong>{result.recipient_count} prospectos</strong></p>
                  <p>• Duración estimada de la campaña: <strong>{Math.ceil(result.estimated_duration_seconds / 60)} min</strong></p>
                </div>
              </div>
            )}

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={loading || !messageText.trim()}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Iniciar Campaña de Difusión</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Panel de Lineamientos de Meta */}
        <div className="space-y-4">
          <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-3">
            <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Lineamientos de Meta</span>
            </h5>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>1. Ventana de 24 horas:</strong> Si el prospecto no te ha escrito en las últimas 24 horas, Meta rechazará los mensajes de texto plano. Debes seleccionar una <strong>Plantilla Oficial</strong> aprobada.
              </p>
              <p>
                <strong>2. Límites por SPAM:</strong> WhatsApp monitorea los envíos masivos repentinos. Nuestro despachador cuenta con un <strong>sistema de Throttling</strong> que envía los mensajes espaciados uno a uno.
              </p>
              <p>
                <strong>3. Bloqueos de Cuenta:</strong> Mantén el retraso (delay) por encima de 1.5 segundos para conservar la salud de tu número de teléfono corporativo.
              </p>
            </div>
          </div>

          <div className="p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-3">
            <h5 className="text-xs font-bold text-blue-700 dark:text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 flex-shrink-0 animate-spin" />
              <span>Reporte de Envíos</span>
            </h5>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed">
              El CRM registrará automáticamente cada despacho en la <strong>Línea de Tiempo</strong> individual de cada lead, permitiendo auditar cuándo recibieron el mensaje y si respondieron.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
