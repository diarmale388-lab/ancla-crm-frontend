import React, { useState } from 'react';
import { X, Factory, Ship, ShieldCheck, Download, FileText, CheckCircle2, AlertTriangle, Paperclip } from 'lucide-react';

export default function ChinaSpecSheetModal({ isOpen, onClose, contact, deal }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'logistics'
  const [containerNumber, setContainerNumber] = useState('TCNU9482019-40HC');
  const [factoryStatus, setFactoryStatus] = useState('IN_PRODUCTION'); // 'ORDERED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPED'

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-dark-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-800 dark:text-white">Ficha Técnica de Exportación (China Factory Spec Sheet)</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Bilingüe ES/EN</span>
              </div>
              <p className="text-xs text-slate-400">Orden de producción consolidada para compras & logística en fábrica.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-950/40 p-1 border-b border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'specs' ? 'bg-white dark:bg-dark-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            🏭 Especificaciones Técnicas de Fábrica
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
              activeTab === 'logistics' ? 'bg-white dark:bg-dark-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            🚢 Documentación Logística & Contenedor
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {activeTab === 'specs' && (
            <div className="space-y-4 animate-fade-in">
              {/* Cajas de especificaciones bilingües */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-500">1. Structure / Estructura</span>
                  <p className="font-bold text-slate-800 dark:text-white">Galvanized Steel Frame (Q350 Steel Standard)</p>
                  <p className="text-[11px] text-slate-400">Estructura principal de acero galvanizado con tratamiento anticorrosivo industrial.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-500">2. Insulation / Aislamiento Térmico</span>
                  <p className="font-bold text-slate-800 dark:text-white">PU Sandwich Panel 75mm / Polyurethane Core</p>
                  <p className="text-[11px] text-slate-400">Panel sándwich de poliuretano de alta densidad para máxima eficiencia climática.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-500">3. Glazing / Ventanería Panorámica</span>
                  <p className="font-bold text-slate-800 dark:text-white">Double Tempered Glass 5mm+9A+5mm Low-E</p>
                  <p className="text-[11px] text-slate-400">Vidrio templado termoacústico con protección radiación UV.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-500">4. Shipping Volume / Volumen</span>
                  <p className="font-bold text-slate-800 dark:text-white">40ft High Cube Container (40HC)</p>
                  <p className="text-[11px] text-slate-400">Capacidad de embarque directo de fábrica a puerto marítimo.</p>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Estado de Producción & Número de Contenedor</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Estado de Fábrica:</label>
                    <select
                      value={factoryStatus}
                      onChange={(e) => setFactoryStatus(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value="ORDERED">📝 Orden Confirmada / Pagada</option>
                      <option value="IN_PRODUCTION">🏭 En Proceso de Ensamblaje</option>
                      <option value="QUALITY_CHECK">🔍 Control de Calidad en Fábrica</option>
                      <option value="SHIPPED">🚢 Embarcado en Contenedor (En Tránsito)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Serial Contenedor 40HC:</label>
                    <input
                      type="text"
                      value={containerNumber}
                      onChange={(e) => setContainerNumber(e.target.value)}
                      className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Archivos adjuntos de logística */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">Bóveda Logística de Importación</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Packing_List_Export_ANCLA.pdf</span>
                    </span>
                    <button className="text-emerald-500 font-bold hover:underline">Descargar</button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Factory_Inspection_Certificate.pdf</span>
                    </span>
                    <button className="text-emerald-500 font-bold hover:underline">Descargar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
}
