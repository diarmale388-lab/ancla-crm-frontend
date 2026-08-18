import React, { useState } from 'react';

export const CommercialProposalView = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [units, setUnits] = useState(1);

  const avgPrice = 115000000;
  const avgProfit = 40000000;
  const investment = 8000000;

  const totalRev = units * avgPrice;
  const totalProfit = units * avgProfit;
  const netGain = totalProfit - investment;
  const roi = Math.round((netGain / investment) * 100);

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
              <span>💰 Inversión & ROI</span>
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
                <span className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-200 shadow-xs">🌐 Página Web Comercial (En Construcción)</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-200 shadow-xs">🤖 Sofi AI (Respuesta 24/7 y Audios)</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-white px-3 py-2 rounded-xl border border-slate-300 shadow-xs">🏭 Fábrica China / Asesores</span>
                <span className="text-slate-400">➔</span>
                <span className="bg-amber-50 text-amber-800 px-3 py-2 rounded-xl border border-amber-200 shadow-xs">🏆 Venta de 80 a 150M</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 2: SOLUCIONES DEL CRM Y WEB */}
        {activeTab === 'soluciones' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                2. Necesidades Reales de ANCLA y Cómo las Resuelve el Ecosistema
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cada aspecto operativo y comercial fue diseñado para darle control total a la gerencia y agilidad al equipo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">1. Centralización Total de Clientes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Todos los prospectos y conversaciones de WhatsApp entran a un panel seguro y privado de ANCLA. Ningún contacto se pierde en el celular personal de los asesores.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🛡️ Control absoluto de la base de datos</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">2. Atención 24/7 con Sofi AI</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Responde a cualquier hora de la noche, domingos o festivos en menos de 10 segundos, asegurando que el cliente reciba atención instantánea.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>⚡ Cero clientes perdidos por demora</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">3. Filtro y Calificación de Compradores</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sofi AI indaga de forma natural la ciudad del proyecto, modelo de interés, si ya tiene lote y presupuesto. El asesor solo habla con clientes listos.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🎯 Asesores enfocados solo en prospectos con dinero</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">4. Escucha y Transcripción de Audios</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El sistema escucha las notas de voz de WhatsApp que envían los clientes, las transcribe y las responde de forma inmediata, guardando el resumen en la ficha.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🎙️ Comprensión total de notas de voz</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">5. Ficha 360° y Repositorio de Documentos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Expediente digital por cliente para almacenar cédulas, RUT, planos arquitectónicos, escrituras, comprobantes de pago y especificaciones de acabados.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>📁 Toda la documentación organizada en 1 clic</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">6. Módulo para Fábrica / Proveedores (China)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permite ingresar las especificaciones técnicas del pedido para que la fábrica en China (con perfil especial) reciba la orden, procese el estado y responda en tiempo real.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🏭 Comunicación fluida con fábrica sin correos perdidos</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">7. Equipo Multi-Asesor con Roles Seguros</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Capacidad de agregar nuevos asesores comerciales. La gerencia audita todas las conversaciones y solo los administradores pueden reasignar prospectos.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🔒 Control gerencial y auditoría en vivo</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">8. Envío Rápido de Fichas y Propuestas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envío de catálogos oficiales, fotos de acabados y cotizaciones personalizadas en PDF directamente al WhatsApp del cliente.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>📄 Respuestas comerciales formales en segundos</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">9. Tablero Visual Kanban de Ventas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Organización clara por etapas (Nuevo, En Asesoría, Cita, Propuesta Enviada, En Fabricación, Ganado) con vista en tiempo real.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>📊 Trazabilidad exacta de cada oportunidad</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">10. Sincronización Automática con Meta Ads</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cada persona que llena un anuncio en Facebook/Instagram entra al CRM al instante. (Más de 530 clientes procesados desde julio con este canal).
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>🚀 Cero descarga manual de archivos Excel</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4.5 hover:border-slate-300 transition-all bg-white">
                <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  ✅ Operativo en CRM
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">11. Módulo de Citas y Calendario</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Agenda citas virtuales o visitas a sala de ventas vinculadas a cada asesor, con fecha, hora y recordatorios para asegurar la asistencia.
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span>📅 Cero cruces de agenda o citas olvidadas</span>
                </div>
              </div>

              <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4.5 hover:border-blue-300 transition-all">
                <span className="inline-block bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-2">
                  🌐 Próxima Entrega
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mb-1">12. Página Web Comercial con Sofi Integrada</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vitrina digital de alta velocidad (&lt;1.5s) con catálogo interactivo de casas modulares y asistente Sofi AI para atender tráfico web orgánico y de pauta.
                </p>
                <div className="mt-3 pt-2.5 border-t border-blue-100 text-[11px] font-bold text-blue-700 flex items-center space-x-1.5">
                  <span>🌟 Autoridad de marca y nuevo canal de captación</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CONTENIDO TAB 3: COSTOS FIJOS DE HERRAMIENTAS */}
        {activeTab === 'costos' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                3. Tabla de Costos Fijos de Herramientas e Infraestructura
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Detalle de los servicios tecnológicos que mantienen el sistema activo 24/7.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[11px]">
                    <th className="p-3.5 sm:p-4">Herramienta / Proveedor</th>
                    <th className="p-3.5 sm:p-4">Función en el Ecosistema</th>
                    <th className="p-3.5 sm:p-4">Estado</th>
                    <th className="p-3.5 sm:p-4">Costo Aproximado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>☁️</span>
                      <span>Railway Cloud</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Servidor backend de alta velocidad y Base de Datos PostgreSQL protegida.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">~$35.000 COP / mes</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🌐</span>
                      <span>Hostinger LiteSpeed Cloud</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Hosting de la aplicación web y PWA con CDN de alta velocidad para Colombia.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">~$25.000 COP / mes</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🤖</span>
                      <span>OpenRouter / Gemini / OpenAI</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Motor de Inteligencia Artificial para Sofi AI 2.0 (comprensión, respuestas y audios).</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700 bg-emerald-50/50">~$80.000 COP / mes</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>💬</span>
                      <span>Meta Cloud API (WhatsApp)</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Línea oficial de WhatsApp Business y sincronización automática de formularios de Meta.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-700">Según consumo Meta</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>🔒</span>
                      <span>Dominio & SSL anclaspecialprojects.com</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Dirección web oficial y certificados de seguridad bancaria SSL.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Activo</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-700">~$70.000 COP / año</td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <span>💾</span>
                      <span>Google Drive Cloud Backup</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">Almacenamiento seguro de copias de seguridad de la base de datos y archivos.</td>
                    <td className="p-3.5 sm:p-4"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">Configurado</span></td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-700">Incluido en Google</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              💡 <strong>Nota de Eficiencia:</strong> Gracias a la arquitectura optimizada a la medida, el costo total de herramientas de ANCLA es inferior a <strong>~$150.000 COP mensuales</strong>, frente a plataformas de terceros (como HubSpot o Salesforce) que cobran más de $2.000.000 COP al mes por funcionalidades similares.
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 4: PROPUESTA DE INVERSIÓN Y ROI */}
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
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center space-x-2">
                    <span>📱 1. CRM a la Medida + Sofi AI</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Desarrollo completo del CRM, Kanban, módulo de citas, ficha 360°, módulo para fábrica/China y Sofi AI 2.0 (24/7 con soporte de audios).
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center space-x-2">
                    <span>🌐 2. Página Web Comercial</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Diseño y programación de la vitrina digital interactiva para ANCLA, con catálogo de modelos modulares y Sofi AI integrada.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center space-x-2">
                    <span>📢 3. Manejo de Campañas Meta</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Estrategia, creación y optimización de pauta en Facebook e Instagram ejecutadas hasta el 15 de Agosto (más de 530 leads captados).
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <h4 className="text-sm font-extrabold text-white mb-1.5 flex items-center space-x-2">
                    <span>🎬 4. Edición de Videos</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Producción y edición de piezas audiovisuales comerciales de alta retención para redes sociales ejecutadas hasta el 15 de Agosto.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 p-4 rounded-2xl text-xs text-slate-200">
                💳 <strong>Esquema de Pago:</strong> 50% al inicio ($4.000.000 COP) y 50% contra entrega de la página web comercial conectada al CRM ($4.000.000 COP).
              </div>
            </div>

            {/* CALCULADORA INTERACTIVA DE ROI */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  📈 Demostración Interactiva de Retorno (ROI)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Mueve la barra para ver el impacto financiero vendiendo proyectos modulares de ANCLA:
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">Casas o Cápsulas Modulares Vendidas:</span>
                  <span className="text-lg font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl">
                    {units} unidad(es)
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-lg sm:text-xl font-black text-slate-900 block">
                      ${totalRev.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                      Facturación Generada
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-lg sm:text-xl font-black text-emerald-600 block">
                      ${totalProfit.toLocaleString('es-CO')} COP
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                      Margen de Ganancia Estimado
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-lg sm:text-xl font-black text-teal-600 block">
                      +{roi}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                      Retorno Inversión (ROI)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  *Cálculo basado en un valor promedio de $115.000.000 COP por proyecto modular con un margen promedio del 35%.
                </p>
              </div>

              <div className="text-center pt-2">
                <button 
                  onClick={() => alert('¡Excelente decisión! Por favor confirma por WhatsApp o correo para iniciar de inmediato con la fase de la Página Web Comercial.')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm py-4 px-8 rounded-full shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  🤝 Aceptar Propuesta y Continuar
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      <footer className="max-w-4xl mx-auto text-center px-4 mt-12 text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Propuesta elaborada exclusivamente para <strong>ANCLA Special Projects</strong>.</p>
        <p className="mt-1">Todos los derechos reservados © 2026 • León FX</p>
      </footer>

    </div>
  );
};
