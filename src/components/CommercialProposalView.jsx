import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageSquare, Send, Sparkles, X, MessageCircle, Clock, User } from 'lucide-react';

export const CommercialProposalView = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  
  // Estado para modal de comentarios por ítem
  const [activeCommentItem, setActiveCommentItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  
  // savedComments es un objeto donde cada key tiene un ARRAY de comentarios acumulativos:
  // { 'sol-1': [ { id, author, text, date }, ... ] }
  const [savedComments, setSavedComments] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'https://ancla-crm-backend-production.up.railway.app/api/v1';

  // Cargar comentarios acumulativos desde localStorage y servidor
  useEffect(() => {
    try {
      const local = localStorage.getItem('ancla_proposal_comments_v2');
      if (local) {
        setSavedComments(JSON.parse(local));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const openCommentModal = (itemKey, itemTitle) => {
    setActiveCommentItem({ key: itemKey, title: itemTitle });
    setCommentText('');
    setCommentSuccess('');
  };

  const handleSaveComment = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || !activeCommentItem) return;

    setSavingComment(true);
    setCommentSuccess('');

    const newCommentObj = {
      id: Date.now(),
      author: authorName.trim() || 'Equipo ANCLA',
      text: commentText.trim(),
      date: new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    };

    const existingList = savedComments[activeCommentItem.key] || [];
    const updatedList = [...existingList, newCommentObj];

    const newCommentsState = {
      ...savedComments,
      [activeCommentItem.key]: updatedList
    };

    setSavedComments(newCommentsState);
    try {
      localStorage.setItem('ancla_proposal_comments_v2', JSON.stringify(newCommentsState));
    } catch (e) {}

    // Enviar a la API del CRM
    try {
      await fetch(`${API_URL}/proposals/public/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_key: activeCommentItem.key,
          item_title: activeCommentItem.title,
          comment: commentText.trim(),
          author: authorName.trim() || 'Equipo ANCLA'
        })
      });
    } catch (err) {
      console.log("Nota guardada localmente:", err);
    }

    setSavingComment(false);
    setCommentSuccess('¡Observación agregada exitosamente!');
    setCommentText('');
    setTimeout(() => {
      setCommentSuccess('');
    }, 1500);
  };

  const handleSendAllCommentsViaWhatsApp = () => {
    const keys = Object.keys(savedComments);
    if (keys.length === 0) {
      alert('Aún no has agregado ningún comentario u observación.');
      return;
    }

    let text = `*OBSERVACIONES Y COMENTARIOS - PROPUESTA ANCLA*\n\n`;
    let count = 1;
    keys.forEach((k) => {
      const list = savedComments[k];
      if (list && list.length > 0) {
        list.forEach((item) => {
          text += `*${count}. ${item.author} (${item.date}):*\n"${item.text}"\n\n`;
          count++;
        });
      }
    });

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/573105748805?text=${encoded}`, '_blank');
  };

  // Contar total de comentarios acumulados en todos los ítems
  const totalCommentsCount = Object.values(savedComments).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16 selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER HERO */}
      <header className="bg-gradient-to-br from-slate-950 via-[#07171d] to-[#042921] text-white px-5 pt-12 pb-16 rounded-b-[36px] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-5">
            <span>✨ PROPUESTA COMERCIAL & SOLUCIÓN INTEGRAL</span>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            <img 
              src="/ancla_icon_only.png" 
              alt="ANCLA" 
              className="w-14 h-14 object-contain drop-shadow-xl" 
            />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              ANCLA Special Projects
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-medium mb-6 leading-relaxed">
            Implementación del Ecosistema Integral de Ventas: <strong>CRM a la Medida + Inteligencia Artificial Sofi 2.0 + Página Web Comercial + Pauta y Contenido</strong>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-left">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">ANCLA Special Projects</span>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inversión Paquete</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5 block">8.000.000 COP</span>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Periodo Pauta/Video</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">Hasta 15 Agosto 2026</span>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vigencia Oferta</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">14 Días Calendario</span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* BARRA DE COMENTARIOS ACUMULADOS */}
        {totalCommentsCount > 0 && (
          <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap gap-2 items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hay {totalCommentsCount} observación(es) registrada(s) en la propuesta.</span>
            </div>
            <button
              onClick={handleSendAllCommentsViaWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Enviar observaciones por WhatsApp</span>
            </button>
          </div>
        )}

        {/* TABS DE NAVEGACIÓN */}
        <div className="-mt-6 relative z-20 mb-8">
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'resumen'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>📊 Resumen Ejecutivo</span>
            </button>

            <button
              onClick={() => setActiveTab('soluciones')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'soluciones'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🧩 Soluciones del CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('costos')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'costos'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🛠️ Herramientas & Costos</span>
            </button>

            <button
              onClick={() => setActiveTab('propuesta')}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'propuesta'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>💰 Inversión y Acuerdo</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO TAB 1: RESUMEN EJECUTIVO */}
        {activeTab === 'resumen' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                1. El Contexto de Negocio de ANCLA
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Un modelo diseñado para captar y cerrar clientes de alto valor (80 a 150 millones de COP por proyecto modular).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl">
                <h4 className="text-rose-700 font-extrabold text-sm mb-2 flex items-center space-x-2">
                  <span>⚠️ El Riesgo de Perder 1 Solo Cliente</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Si un cliente interesado en una casa modular de <strong>$80 a $150 millones</strong> escribe por WhatsApp y nadie le responde rápido, se va con la competencia. Perder 1 solo lead representa una fuga de hasta $150.000.000 COP.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                <h4 className="text-emerald-800 font-extrabold text-sm mb-2 flex items-center space-x-2">
                  <span>✅ El Ahorro Frente a Personal Externo</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contratar a un programador ($3.5M/mes), un especialista de pauta ($2.5M/mes) y atención de chats ($2.0M/mes) le costaría a ANCLA <strong>$96.000.000 COP al año (8 millones/mes)</strong> sin ser dueños del software.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-slate-900 mb-3">
                Flujo de Ventas Automatizado de ANCLA:
              </h3>
              <div className="flex flex-wrap gap-2.5 items-center justify-center text-xs font-bold text-slate-700 text-center">
                <span className="bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-xs">📢 Anuncios Meta (Facebook/Insta)</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-300 shadow-xs">🤖 CRM & Sofi AI 24/7 (Ó Web Comercial)</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-xs">🏭 Fábrica China / Asesores</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-amber-50 text-amber-800 px-3 py-2 rounded-xl border border-amber-200 shadow-xs">🏆 Venta de 80 a 150M</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 2: SOLUCIONES DEL CRM Y WEB (CON COMENTARIOS ACUMULATIVOS) */}
        {activeTab === 'soluciones' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                2. Necesidades Reales de ANCLA y Cómo las Resuelve el Ecosistema
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Puedes dejar observaciones en cualquier solución. Cada comentario se guarda con su autor y fecha.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {[
                { key: 'sol-1', title: '1. Centralización Total de Clientes', status: '✅ Operativo en CRM', desc: 'Todos los prospectos y conversaciones de WhatsApp entran a un panel seguro y privado de ANCLA. Ningún contacto se pierde en el celular personal de los asesores.', benefit: '🛡️ Control absoluto de la base de datos' },
                { key: 'sol-2', title: '2. Atención 24/7 con Sofi AI', status: '✅ Operativo en CRM', desc: 'Responde a cualquier hora de la noche, domingos o festivos en menos de 10 segundos, asegurando que el cliente reciba atención instantánea.', benefit: '⚡ Cero clientes perdidos por demora' },
                { key: 'sol-3', title: '3. Filtro y Calificación de Compradores', status: '✅ Operativo en CRM', desc: 'Sofi AI indaga de forma natural la ciudad del proyecto, modelo de interés, si ya tiene lote y presupuesto. El asesor solo habla con clientes listos.', benefit: '🎯 Asesores enfocados solo en prospectos con dinero' },
                { key: 'sol-4', title: '4. Escucha y Transcripción de Audios', status: '✅ Operativo en CRM', desc: 'El sistema escucha las notas de voz de WhatsApp que envían los clientes, las transcribe y las responde de forma inmediata, guardando el resumen en la ficha.', benefit: '🎙️ Comprensión total de notas de voz' },
                { key: 'sol-5', title: '5. Ficha 360° y Repositorio de Documentos', status: '✅ Operativo en CRM', desc: 'Expediente digital por cliente para almacenar cédulas, RUT, planos arquitectónicos, escrituras, comprobantes de pago y especificaciones de acabados.', benefit: '📁 Toda la documentación organizada en 1 clic' },
                { key: 'sol-6', title: '6. Módulo para Fábrica / Proveedores (China)', status: '✅ Operativo en CRM', desc: 'Permite ingresar las especificaciones técnicas del pedido para que la fábrica en China (con perfil especial) reciba la orden, procese el estado y responda en tiempo real.', benefit: '🏭 Comunicación fluida con fábrica sin correos perdidos' },
                { key: 'sol-7', title: '7. Equipo Multi-Asesor con Roles Seguros', status: '✅ Operativo en CRM', desc: 'Capacidad de agregar nuevos asesores comerciales. La gerencia audita todas las conversaciones y solo los administradores pueden reasignar prospectos.', benefit: '🔒 Control gerencial y auditoría en vivo' },
                { key: 'sol-8', title: '8. Envío Rápido de Fichas y Propuestas', status: '✅ Operativo en CRM', desc: 'Envío de catálogos oficiales, fotos de acabados y cotizaciones personalizadas en PDF directamente al WhatsApp del cliente.', benefit: '📄 Respuestas comerciales formales en segundos' },
                { key: 'sol-9', title: '9. Tablero Visual Kanban de Ventas', status: '✅ Operativo en CRM', desc: 'Organización clara por etapas (Nuevo, En Asesoría, Cita, Propuesta Enviada, En Fabricación, Ganado) con vista en tiempo real.', benefit: '📊 Trazabilidad exacta de cada oportunidad' },
                { key: 'sol-10', title: '10. Sincronización Automática con Meta Ads', status: '✅ Operativo en CRM', desc: 'Cada persona que llena un anuncio en Facebook/Instagram entra al CRM al instante. (Más de 530 clientes procesados desde julio con este canal).', benefit: '🚀 Cero descarga manual de archivos Excel' },
                { key: 'sol-11', title: '11. Módulo de Citas y Calendario', status: '✅ Operativo en CRM', desc: 'Agenda citas virtuales o visitas a sala de ventas vinculadas a cada asesor, con fecha, hora y recordatorios para asegurar la asistencia.', benefit: '📅 Cero cruces de agenda o citas olvidadas' },
                { key: 'sol-12', title: '12. Página Web Comercial con Sofi Integrada', status: '🌐 Próxima Entrega', desc: 'Vitrina digital de alta velocidad (<1.5s) con catálogo interactivo de casas modulares y asistente Sofi AI para atender tráfico web orgánico y de pauta.', benefit: '🌟 Autoridad de marca y nuevo canal de captación', isNext: true }
              ].map((item) => {
                const commentList = savedComments[item.key] || [];
                const hasComments = commentList.length > 0;
                return (
                  <div key={item.key} className={`border rounded-2xl p-4.5 transition-all bg-white relative flex flex-col justify-between ${item.isNext ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${item.isNext ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          {item.status}
                        </span>

                        <button
                          onClick={() => openCommentModal(item.key, item.title)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 cursor-pointer ${hasComments ? 'bg-amber-50 border-amber-300 text-amber-900 font-extrabold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          title="Dejar un comentario o sugerencia"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{hasComments ? `Comentarios (${commentList.length}) ✍️` : 'Comentar'}</span>
                        </button>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>

                    <div>
                      {/* Lista de comentarios acumulativos */}
                      {hasComments && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
                          {commentList.map((comm) => (
                            <div key={comm.id} className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium">
                              <div className="flex justify-between items-center text-[9.5px] font-bold text-amber-800 mb-0.5">
                                <span>👤 {comm.author}</span>
                                <span>🕒 {comm.date}</span>
                              </div>
                              <p className="italic">"{comm.text}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`mt-3 pt-2.5 border-t text-[11px] font-bold flex items-center space-x-1.5 ${item.isNext ? 'border-blue-100 text-blue-700' : 'border-slate-100 text-emerald-700'}`}>
                        <span>{item.benefit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* CONTENIDO TAB 3: COSTOS FIJOS DE HERRAMIENTAS (SIMPLIFICADO Y CLARO) */}
        {activeTab === 'costos' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  3. Tabla de Costos Fijos de Herramientas e Infraestructura
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Servicios directos en la nube que mantienen el CRM y la Página Web activos 24/7.
                </p>
              </div>
              <button
                onClick={() => openCommentModal('costos-infra', 'Costos Fijos e Infraestructura')}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comentar sobre costos</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[11px]">
                    <th className="p-3.5 sm:p-4">Servicio / Infraestructura</th>
                    <th className="p-3.5 sm:p-4">Función en el Ecosistema</th>
                    <th className="p-3.5 sm:p-4">Estado</th>
                    <th className="p-3.5 sm:p-4">Costo Fijo Mensual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🖥️</span>
                      <span>Servidor Cloud de Alta Velocidad (VPS)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Aloja el CRM, la base de datos segura y la futura Página Web con respuesta en milisegundos.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">~$40.000 COP / mes</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🤖</span>
                      <span>Motor de Inteligencia Artificial (Sofi AI 2.0)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Atención 24/7, respuestas sobre arquitectura modular y transcripción de notas de voz.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">~$100.000 COP / mes</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>💬</span>
                      <span>Línea Oficial WhatsApp Business (Meta API)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Recepción y envío de mensajes oficiales y sincronización de clientes potenciales de anuncios.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-700">Según consumo Meta</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🔒</span>
                      <span>Dominio & Seguridad SSL (anclaspecialprojects.com)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Dirección web oficial y certificados de seguridad web cifrada.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-700">~$70.000 COP / año</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>💾</span>
                      <span>Copias de Seguridad en la Nube (Google Drive)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Respaldos automáticos y continuos de toda la información comercial de ANCLA.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Configurado</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700">Incluido en Google</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              💡 <strong>Eficiencia de Costos:</strong> Al contar con un sistema desarrollado 100% a la medida, ANCLA solo asume los costos directos de consumo de servidores e inteligencia artificial (<strong>~$140.000 COP mensuales</strong>), sin pagar licencias costosas por usuario ni mensualidades a intermediarios.
            </div>

            {savedComments['costos-infra'] && savedComments['costos-infra'].length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Observaciones registradas en Costos:</span>
                {savedComments['costos-infra'].map((comm) => (
                  <div key={comm.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                    <div className="flex justify-between text-[10px] font-bold text-amber-800 mb-0.5">
                      <span>👤 {comm.author}</span>
                      <span>🕒 {comm.date}</span>
                    </div>
                    <p className="italic">"{comm.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 4: PROPUESTA DE INVERSIÓN */}
        {activeTab === 'propuesta' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* CAJA DE INVERSIÓN */}
            <div className="bg-gradient-to-br from-slate-950 via-[#041d1a] to-[#02271d] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10 mb-6">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Propuesta Comercial de Valor</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Ecosistema Integral ANCLA</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">Solución tecnológica completa y gestión publicitaria especializada.</p>
                </div>
                <div className="sm:text-right">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">8.000.000 COP</div>
                  <span className="text-xs text-slate-400 font-bold block mt-1">Inversión Total del Paquete</span>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-white mb-4">¿Qué incluye este valor de 8.000.000 COP?</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                        <span>📱 1. CRM a la Medida + Sofi AI</span>
                      </h4>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        $4.500.000 COP
                      </span>
                    </div>
                    <span className="inline-block text-[9.5px] font-bold text-emerald-400 mb-2 uppercase">✅ Activo Entregado y Operativo</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Desarrollo completo del CRM, Kanban, módulo de citas, ficha 360°, módulo para fábrica/China, Sofi AI 2.0 (24/7 con soporte de audios) y el tiempo dedicado a responder y operar los chats en los primeros días de lanzamiento.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                        <span>🌐 2. Página Web Comercial</span>
                      </h4>
                      <span className="text-[10px] font-black text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                        $1.000.000 COP
                      </span>
                    </div>
                    <span className="inline-block text-[9.5px] font-bold text-blue-400 mb-2 uppercase">🌐 Fase en Desarrollo y Despliegue</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Diseño y programación de la vitrina digital interactiva para ANCLA, con catálogo de modelos modulares y Sofi AI integrada.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                        <span>📢 3. Manejo de Campañas Meta</span>
                      </h4>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        $1.500.000 COP
                      </span>
                    </div>
                    <span className="inline-block text-[9.5px] font-bold text-emerald-400 mb-2 uppercase">✅ Ejecutado hasta 15 de Agosto</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Estrategia, creación y optimización de pauta en Facebook e Instagram ejecutadas hasta el 15 de Agosto (más de 530 leads captados).
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                        <span>🎬 4. Edición de Videos</span>
                      </h4>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        $1.000.000 COP
                      </span>
                    </div>
                    <span className="inline-block text-[9.5px] font-bold text-emerald-400 mb-2 uppercase">✅ Ejecutado hasta 15 de Agosto</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Producción y edición de piezas audiovisuales comerciales de alta retención para redes sociales ejecutadas hasta el 15 de Agosto.
                    </p>
                  </div>
                </div>
              </div>

              {/* RESUMEN DE VALORES Y ESQUEMA DE PAGO */}
              <div className="bg-white/10 border border-white/15 p-5 rounded-2xl text-xs text-slate-200 space-y-3">
                <div className="flex flex-wrap justify-between items-center pb-2.5 border-b border-white/10 text-xs font-bold text-slate-300">
                  <span>Desglose: CRM ($4.5M) + Web ($1.0M) + Pauta y Videos ($2.5M)</span>
                  <span className="text-emerald-400 font-extrabold text-sm">= $8.000.000 COP</span>
                </div>

                <div className="space-y-1.5">
                  <div className="font-extrabold text-white text-xs mb-1">💳 Esquema de Pago por Hitos de Entrega:</div>
                  <div className="flex items-start space-x-2">
                    <span className="font-black text-emerald-400">• 50% ($4.000.000 COP):</span>
                    <span>Por los <strong>activos ya entregados y en operación</strong>: CRM a la medida con Sofi AI 2.0, gestión de marketing/pauta en Meta Ads y edición de videos ejecutados hasta el 15 de Agosto.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-black text-blue-400">• 50% ($4.000.000 COP):</span>
                    <span><strong>Fase Final:</strong> Contra entrega, revisión y aprobación de la <strong>Página Web Comercial</strong> conectada al CRM.</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8">
                <button 
                  onClick={() => setShowThankYouModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base py-4 px-10 rounded-full shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  🤝 Aceptar Propuesta y Continuar
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL DE COMENTARIOS / OBSERVACIONES ACUMULATIVAS */}
      {activeCommentItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observación sobre:</span>
                <h3 className="text-base font-extrabold text-slate-900">{activeCommentItem.title}</h3>
              </div>
              <button 
                onClick={() => setActiveCommentItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Historial de comentarios previos en este ítem */}
            {savedComments[activeCommentItem.key] && savedComments[activeCommentItem.key].length > 0 && (
              <div className="mb-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">Comentarios agregados ({savedComments[activeCommentItem.key].length}):</span>
                {savedComments[activeCommentItem.key].map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>👤 {c.author}</span>
                      <span>🕒 {c.date}</span>
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveComment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">¿Quién escribe? (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Liliana / Equipo ANCLA"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Escribe tu nueva observación o sugerencia:</label>
                <textarea
                  rows="3"
                  placeholder="Escribe aquí cualquier ajuste, duda o comentario sobre este punto..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              {commentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{commentSuccess}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCommentItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={savingComment}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingComment ? 'Guardando...' : 'Agregar Observación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROFESIONAL DE AGRADECIMIENTO Y CONFIRMACIÓN */}
      {showThankYouModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-950 via-[#071916] to-[#03231b] text-white rounded-3xl max-w-lg w-full p-7 sm:p-9 shadow-2xl border border-emerald-500/40 relative text-center">
            
            <button 
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              ¡Muchas Gracias por su Confianza!
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Es un verdadero honor trabajar con el equipo de <strong>ANCLA Special Projects</strong> en el desarrollo de este ecosistema. 
              <br /><br />
              Con el CRM ya operativo y los más de 530 prospectos procesados, estamos listos para construir la <strong>Página Web Comercial</strong> y consolidar a ANCLA como el referente número uno en arquitectura modular de alta gama.
            </p>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left mb-6 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Próximos Pasos Inmediatos:</span>
              <p className="text-xs text-slate-200">1. Formalización del primer hito de entrega ($4.000.000 COP).</p>
              <p className="text-xs text-slate-200">2. Entrega de fotos, renders y modelos para la nueva página web.</p>
              <p className="text-xs text-slate-200">3. Lanzamiento y conexión final en producción.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/573105748805?text=Hola,%20hemos%20revisado%20la%20propuesta%20comercial%20de%20ANCLA%20y%20deseamos%20continuar%20con%20la%20fase%20de%20la%20P%C3%A1gina%20Web."
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmar por WhatsApp</span>
              </a>

              <button
                onClick={() => setShowThankYouModal(false)}
                className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-3.5 px-5 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      <footer className="max-w-4xl mx-auto text-center px-4 mt-12 text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Propuesta elaborada exclusivamente para <strong>ANCLA Special Projects</strong>.</p>
        <p className="mt-1">Todos los derechos reservados © 2026 • León FX</p>
      </footer>

    </div>
  );
};
