import React, { useState, useMemo } from 'react';
import { 
  X, Building2, Sparkles, Factory, DollarSign, FileText, CheckCircle2, 
  ShieldCheck, ArrowRight, Download, Send, Globe, Sliders, Box, Layers, 
  Sun, Wind, Hammer, Truck, Info, Percent, Calendar, Check, ExternalLink 
} from 'lucide-react';

export const PRODUCT_DATA = {
  'EXP-36': {
    id: 'EXP-36',
    name: 'Flex Home EXP-36',
    line: 'Flex Home',
    area: 36,
    dimensions: '5.90m x 6.30m x 2.48m',
    folded_dimensions: '5.90m x 2.23m x 2.48m',
    weight_tons: 3.2,
    base_price: 18500,
    bedrooms: 2,
    bathrooms: 1,
    description: 'Casa modular expandible de despliegue rápido (48 horas). Estructura de acero galvanizado reforzado Q350 con paneles sándwich de alto aislamiento.',
    image: '/images/flex_home_36.jpg',
    container_capacity: '2 unidades por Contenedor 40HC',
    specs_zh: {
      structure: 'Q350高强度热镀锌轻钢主体结构',
      insulation: '75mm阻燃聚氨酯(PU)夹芯保温板 (导热系数 ≤ 0.022 W/m·K)',
      exterior: '仿木纹氟碳金属烤漆板 / 工业黑磨砂面板',
      windows: '5mm+9A+5mm双层钢化Low-E中空隔音玻璃断桥铝窗',
      flooring: '6mm高级锁扣SPC石塑防水耐磨地板',
      electrical: '110V/220V双电压隐藏式阻燃电线 (符合RETIE标准)',
      plumbing: 'PEX食品级冷热水管及快装排水系统',
      shipping: '40尺高柜海运集装箱 (单柜可装2套)'
    }
  },
  'EXP-56': {
    id: 'EXP-56',
    name: 'Flex Home EXP-56',
    line: 'Flex Home',
    area: 56,
    dimensions: '11.80m x 6.30m x 2.48m',
    folded_dimensions: '11.80m x 2.23m x 2.48m',
    weight_tons: 4.8,
    base_price: 29800,
    bedrooms: 3,
    bathrooms: 2,
    description: 'Vivienda modular de amplio formato para proyectos campestres o residenciales premium. Máxima habitabilidad y acabados de lujo.',
    image: '/images/flex_home_56.jpg',
    container_capacity: '1 unidad completa + Kit Deck por Contenedor 40HC',
    specs_zh: {
      structure: 'Q350特重型热镀锌轻钢框架 (抗震8级/抗风12级)',
      insulation: '100mm高密度聚氨酯(PU) + 玻璃丝绵复合隔音层',
      exterior: '德系木纹复合挂板 + 哑光深灰金属幕墙板',
      windows: '6mm+12A+6mm三玻两腔Low-E断桥超静音系统窗',
      flooring: '8mm高档SPC地暖专用石塑地板',
      electrical: '全屋智能拓扑电路 (支持110V/220V双路控制)',
      plumbing: 'PEX-b防冻高压给水管 + 静音消音PVC排水',
      shipping: '40尺高柜集装箱 (单柜容纳1整套+露台套件)'
    }
  },
  'CL-13': {
    id: 'CL-13',
    name: 'Cápsula Living CL-13',
    line: 'Cápsulas Living',
    area: 13,
    dimensions: '5.80m x 2.23m x 2.55m',
    folded_dimensions: 'Estructura Monolítica Fija',
    weight_tons: 2.1,
    base_price: 14200,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Suite modular futurista para proyectos de glamping, ecoturismo y hotelería boutique. Llave en mano con baño de lujo y ventanería curva.',
    image: '/images/capsula_13.jpg',
    container_capacity: '2 unidades por Contenedor 40HC',
    specs_zh: {
      structure: '航空级铝合金外壳 + 镀锌钢底盘一体成型',
      insulation: '75mm聚氨酯整体发泡保温层 (全天候极寒/炎热适用)',
      exterior: '航空铝材氟碳烤漆曲面外壳 (带全景天窗)',
      windows: '270度环形全景超白双层钢化Low-E隔热玻璃',
      flooring: '游艇级防腐实木复合地板',
      electrical: '智能客控集成系统 (语音/App控制灯光与空调)',
      plumbing: '一体式预制干湿分离卫浴系统',
      shipping: '40尺高柜海运集装箱 (单柜可装2台)'
    }
  },
  'CL-26': {
    id: 'CL-26',
    name: 'Cápsula Living CL-26',
    line: 'Cápsulas Living',
    area: 26,
    dimensions: '8.95m x 2.23m x 2.55m',
    folded_dimensions: 'Estructura Monolítica Fija',
    weight_tons: 3.6,
    base_price: 24500,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Cápsula suite presidencial con zona de estar, cocineta equipada, baño tipo spa y terraza perimetral para alta rentabilidad turística.',
    image: '/images/capsula_26.jpg',
    container_capacity: '1 unidad por Contenedor 40HC',
    specs_zh: {
      structure: '高强度航空铝曲面壳体 + 加厚重型镀锌钢主底盘',
      insulation: '100mm无缝聚氨酯闭孔发泡层 + 航空隔热膜',
      exterior: '太空银/曜石黑双色阳极氧化铝板幕墙',
      windows: '电动全景天窗 + 270度超大落地中空Low-E钢化弧形窗',
      flooring: '豪华防水耐磨PVC-SPC木纹游艇甲板',
      electrical: '五星级酒店级智能房控主机 + 氛围RGB灯带',
      plumbing: '豪华整体集成卫浴 (智能马桶+恒温淋浴系统)',
      shipping: '40尺高柜特种装载 (单柜装运1台)'
    }
  }
};

export default function AnclaTechnicalDossier({ isOpen, onClose, contact, onSaveDossier }) {
  if (!isOpen) return null;

  // Estados de Pestañas Principales
  const [activeTab, setActiveTab] = useState('comercial'); // 'comercial', 'personalizacion', 'china_spec'
  const [selectedModelId, setSelectedModelId] = useState('EXP-36');

  // Estados Financieros y Opcionales
  const [deckArea, setDeckArea] = useState(15); // m²
  const [includeDeck, setIncludeDeck] = useState(true);
  const [includeSolar, setIncludeSolar] = useState(false);
  const [acUnits, setAcUnits] = useState(1);
  const [includeSpcFloor, setIncludeSpcFloor] = useState(true);
  const [freightDistanceKm, setFreightDistanceKm] = useState(250); // km desde puerto/bodega a lote
  const [discountPercent, setDiscountPercent] = useState(0);

  // Estados de Personalización
  const [exteriorColor, setExteriorColor] = useState('Negro Industrial & Madera Teka');
  const [interiorFinish, setInteriorFinish] = useState('Paneles Termoacústicos Blanco Nórdico');
  const [floorStyle, setFloorStyle] = useState('Roble Escandinavo SPC 6mm');
  const [smartHomePack, setSmartHomePack] = useState('Tuya Smart Pack (Iluminación + Clima + Cerradura Digital)');

  const currentModel = PRODUCT_DATA[selectedModelId] || PRODUCT_DATA['EXP-36'];

  // Cálculos Financieros en Tiempo Real (USD)
  const calculations = useMemo(() => {
    const base = currentModel.base_price;
    const deckTotal = includeDeck ? deckArea * 85 : 0;
    const solarTotal = includeSolar ? 4200 : 0;
    const acTotal = acUnits * 750;
    const floorTotal = includeSpcFloor ? currentModel.area * 18 : 0;
    const freightTotal = 800 + (freightDistanceKm * currentModel.weight_tons * 0.18);
    
    const subtotal = base + deckTotal + solarTotal + acTotal + floorTotal + freightTotal;
    const discountAmount = subtotal * (discountPercent / 100);
    const totalUSD = subtotal - discountAmount;

    const deposit60 = totalUSD * 0.60;
    const balance40 = totalUSD * 0.40;

    return {
      base,
      deckTotal,
      solarTotal,
      acTotal,
      floorTotal,
      freightTotal,
      subtotal,
      discountAmount,
      totalUSD,
      deposit60,
      balance40
    };
  }, [selectedModelId, includeDeck, deckArea, includeSolar, acUnits, includeSpcFloor, freightDistanceKm, discountPercent]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0f172a] border border-[#334155] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Corporativo ANCLA */}
        <div className="p-5 border-b border-[#334155] bg-[#0b0f19] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg font-black">
              ⚓
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  DOSSIER TÉCNICO & COMERCIAL UNIFICADO
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  USD TABULAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ANCLA Special Projects • {contact ? `Cliente: ${contact.first_name || ''} ${contact.last_name || ''}` : 'Ficha Técnica Oficial'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de 3 Pestañas Principales */}
        <div className="flex bg-[#0b0f19] px-5 pt-2 border-b border-[#334155] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('comercial')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'comercial'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1. Dossier Comercial & Cotizador USD</span>
          </button>

          <button
            onClick={() => setActiveTab('personalizacion')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'personalizacion'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Personalizaciones & Acabados</span>
          </button>

          <button
            onClick={() => setActiveTab('china_spec')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'china_spec'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>3. China Spec Sheet (工厂制造规范)</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          
          {/* ========================================================================= */}
          {/* PESTAÑA 1: DOSSIER COMERCIAL & COTIZADOR USD */}
          {/* ========================================================================= */}
          {activeTab === 'comercial' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Selector de Modelos del Portafolio */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Seleccionar Modelo Portafolio ANCLA:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.values(PRODUCT_DATA).map((p) => {
                    const isSelected = selectedModelId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedModelId(p.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#1e293b] border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                            : 'bg-[#1e293b]/50 border-[#334155] hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {p.id}
                            </span>
                            <span className="text-xs font-black text-emerald-400 tabular-nums font-mono">
                              ${p.base_price.toLocaleString()} USD
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{p.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{p.area}m² • {p.bedrooms} Hab, {p.bathrooms} Baño</p>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-700/50">
                          📐 {p.dimensions}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 2 Columnas: Configurador Opcionales & Resumen Financiero */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Columna Izquierda: Opcionales Dinámicos (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1e293b] border border-[#334155] space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Configurador de Opcionales & Transporte</span>
                    </span>

                    {/* Opcional 1: Deck Sintético WPC */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-[#334155]">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={includeDeck}
                            onChange={(e) => setIncludeDeck(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-white">Deck Exterior Sintético WPC</span>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-6">Madera tecnológica de alta resistencia ($85 USD/m²)</p>
                      </div>
                      {includeDeck && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="5"
                            max="80"
                            value={deckArea}
                            onChange={(e) => setDeckArea(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 bg-[#1e293b] border border-[#334155] rounded-lg px-2 py-1 text-xs font-mono text-center text-white"
                          />
                          <span className="text-xs text-slate-400">m²</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums min-w-[70px] text-right">
                            +${calculations.deckTotal.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Opcional 2: Kit Solar Off-Grid */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-[#334155]">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={includeSolar}
                            onChange={(e) => setIncludeSolar(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            <span>Kit Solar Off-Grid 3kWp Híbrido</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 pl-6">Paneles monocristalinos + Inversor + Batería LiFePO4</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                        {includeSolar ? '+$4,200 USD' : '$0'}
                      </span>
                    </div>

                    {/* Opcional 3: Climatización Inverter */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a] border border-[#334155]">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-blue-400" />
                          <span>Aire Acondicionado Inverter 12,000 BTU</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Alta eficiencia energética ($750 USD/unidad)</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={acUnits}
                          onChange={(e) => setAcUnits(parseInt(e.target.value))}
                          className="bg-[#1e293b] border border-[#334155] rounded-lg px-2 py-1 text-xs text-white font-mono"
                        >
                          <option value="0">0 Unidades</option>
                          <option value="1">1 Unidad (+$750)</option>
                          <option value="2">2 Unidades (+$1,500)</option>
                          <option value="3">3 Unidades (+$2,250)</option>
                        </select>
                      </div>
                    </div>

                    {/* Opcional 4: Flete Dinámico */}
                    <div className="p-3 rounded-xl bg-[#0f172a] border border-[#334155] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-teal-400" />
                          <span>Flete Terrestre & Maniobra a Sitio</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
                          +${Math.round(calculations.freightTotal).toLocaleString()} USD
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-[11px] text-slate-400">Distancia Estimada:</span>
                        <input
                          type="range"
                          min="50"
                          max="800"
                          step="25"
                          value={freightDistanceKm}
                          onChange={(e) => setFreightDistanceKm(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-xs font-mono font-bold text-white min-w-[50px] text-right">{freightDistanceKm} km</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Columna Derecha: Tarjeta de Liquidación Financiera USD (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-emerald-500/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-[#334155] pb-3">
                      <span className="text-xs font-black uppercase text-slate-400">Liquidación Comercial</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        Valores en USD
                      </span>
                    </div>

                    {/* Desglose de Líneas */}
                    <div className="space-y-2 text-xs font-medium">
                      <div className="flex justify-between text-slate-300">
                        <span>Modelo {currentModel.name}:</span>
                        <span className="font-mono tabular-nums">${calculations.base.toLocaleString()} USD</span>
                      </div>
                      {includeDeck && (
                        <div className="flex justify-between text-slate-300">
                          <span>Deck Sintético ({deckArea}m²):</span>
                          <span className="font-mono tabular-nums">+${calculations.deckTotal.toLocaleString()} USD</span>
                        </div>
                      )}
                      {includeSolar && (
                        <div className="flex justify-between text-slate-300">
                          <span>Kit Solar 3kWp:</span>
                          <span className="font-mono tabular-nums">+${calculations.solarTotal.toLocaleString()} USD</span>
                        </div>
                      )}
                      {acUnits > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>A.A. Inverter ({acUnits}x):</span>
                          <span className="font-mono tabular-nums">+${calculations.acTotal.toLocaleString()} USD</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-300">
                        <span>Flete & Logística ({freightDistanceKm} km):</span>
                        <span className="font-mono tabular-nums">+${Math.round(calculations.freightTotal).toLocaleString()} USD</span>
                      </div>

                      {/* Descuento Comercial */}
                      <div className="pt-2 border-t border-[#334155] flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Percent className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs text-rose-300">Descuento Especial:</span>
                        </div>
                        <select
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(parseFloat(e.target.value))}
                          className="bg-[#0f172a] border border-[#334155] rounded px-2 py-0.5 text-xs text-rose-300 font-mono"
                        >
                          <option value="0">0%</option>
                          <option value="3">3% (-${Math.round(calculations.subtotal * 0.03).toLocaleString()})</option>
                          <option value="5">5% (-${Math.round(calculations.subtotal * 0.05).toLocaleString()})</option>
                          <option value="8">8% (-${Math.round(calculations.subtotal * 0.08).toLocaleString()})</option>
                        </select>
                      </div>
                    </div>

                    {/* Total Final */}
                    <div className="pt-3 border-t-2 border-emerald-500/40 flex items-center justify-between">
                      <span className="text-sm font-black text-white">TOTAL PROPUESTA:</span>
                      <span className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                        ${Math.round(calculations.totalUSD).toLocaleString()} USD
                      </span>
                    </div>

                    {/* Hitos de Pago 60 / 40 */}
                    <div className="p-3 rounded-xl bg-[#0b0f19] border border-[#334155] space-y-2 text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Hitos de Pago de Fabricación:
                      </span>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-300">60% Anticipo (Inicio Producción):</span>
                        <span className="font-bold text-amber-400 tabular-nums">
                          ${Math.round(calculations.deposit60).toLocaleString()} USD
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-300">40% Balanza (Contra Entrega):</span>
                        <span className="font-bold text-teal-400 tabular-nums">
                          ${Math.round(calculations.balance40).toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: PERSONALIZACIONES & ACABADOS */}
          {/* ========================================================================= */}
          {activeTab === 'personalizacion' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-[#1e293b] border border-[#334155] space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Especificaciones de Diseño & Acabados Personalizados</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                      1. Color y Acabado de Fachada Exterior:
                    </label>
                    <select
                      value={exteriorColor}
                      onChange={(e) => setExteriorColor(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-white font-semibold"
                    >
                      <option value="Negro Industrial & Madera Teka">Negro Industrial & Madera Teka</option>
                      <option value="Blanco Nórdico Minimalista & Roble">Blanco Nórdico Minimalista & Roble</option>
                      <option value="Gris Grafito Mate & Aluminio Anodizado">Gris Grafito Mate & Aluminio Anodizado</option>
                      <option value="Verde Bosque & Madera Natural">Verde Bosque & Madera Natural (Glamping)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                      2. Acabado de Muros Interiores:
                    </label>
                    <select
                      value={interiorFinish}
                      onChange={(e) => setInteriorFinish(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-white font-semibold"
                    >
                      <option value="Paneles Termoacústicos Blanco Cálido">Paneles Termoacústicos Blanco Cálido</option>
                      <option value="Revestimiento Textura Madera Clara">Revestimiento Textura Madera Clara</option>
                      <option value="Acabado Mármol Calacatta (Zonas Húmedas)">Acabado Mármol Calacatta (Zonas Húmedas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                      3. Tipo de Piso SPC (Alto Tráfico 6mm):
                    </label>
                    <select
                      value={floorStyle}
                      onChange={(e) => setFloorStyle(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-white font-semibold"
                    >
                      <option value="Roble Escandinavo SPC 6mm">Roble Escandinavo SPC 6mm (Vetas Claras)</option>
                      <option value="Nogal Rústico Oscuro SPC 6mm">Nogal Rústico Oscuro SPC 6mm</option>
                      <option value="Gris Cemento Microcemento SPC">Gris Cemento Microcemento SPC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                      4. Paquete de Domótica & Smart Home:
                    </label>
                    <select
                      value={smartHomePack}
                      onChange={(e) => setSmartHomePack(e.target.value)}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-xs text-white font-semibold"
                    >
                      <option value="Tuya Smart Pack (Iluminación + Clima + Cerradura Digital)">Tuya Smart Pack (Iluminación + Clima + Cerradura Digital)</option>
                      <option value="Estándar Tradicional (Interruptores de Lujo)">Estándar Tradicional (Interruptores de Lujo)</option>
                      <option value="Hospitality Hotelero (Keycard + Ahorro Energía)">Hospitality Hotelero (Keycard + Ahorro Energía)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0f172a] border border-[#334155] text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">Resumen de Personalización para Fábrica:</span>
                  <p className="mt-1">
                    Fachada: <strong className="text-white">{exteriorColor}</strong> | Muros: <strong className="text-white">{interiorFinish}</strong> | Piso: <strong className="text-white">{floorStyle}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: CHINA SPEC SHEET TRILINGÜE (ES / EN / 中文) */}
          {/* ========================================================================= */}
          {activeTab === 'china_spec' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-[#1e293b] border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#334155] pb-3">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      CHINA FACTORY TECHNICAL SPECIFICATION • 工厂制造规范
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                    REF: ANCLA-CN-{currentModel.id}
                  </span>
                </div>

                {/* Tabla Trilingüe de Especificaciones */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-[#0f172a] text-[10px] font-black uppercase text-slate-400 border-b border-[#334155]">
                        <th className="p-3 w-1/4">Componente (Español)</th>
                        <th className="p-3 w-1/3">International Spec (English)</th>
                        <th className="p-3 w-5/12 font-sans">中国工厂制造标准 (Chinese)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/60 text-[11px]">
                      
                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">1. Estructura Principal</td>
                        <td className="p-3 text-slate-300 font-mono">Galvanized Steel Frame Q350 Standard</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.structure}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">2. Aislamiento Térmico</td>
                        <td className="p-3 text-slate-300 font-mono">PU Sandwich Panel (λ ≤ 0.022 W/m·K)</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.insulation}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">3. Fachada Exterior</td>
                        <td className="p-3 text-slate-300 font-mono">Fluorocarbon Coating / Composite Cladding</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.exterior}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">4. Ventanería & Puertas</td>
                        <td className="p-3 text-slate-300 font-mono">Double Tempered Low-E 5+9A+5mm Glass</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.windows}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">5. Sistema de Pisos</td>
                        <td className="p-3 text-slate-300 font-mono">High-Traffic SPC Click Flooring</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.flooring}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">6. Instalación Eléctrica</td>
                        <td className="p-3 text-slate-300 font-mono">Dual 110V/220V RETIE Standard Certified</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.electrical}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">7. Plomería & Drenaje</td>
                        <td className="p-3 text-slate-300 font-mono">PEX High-Pressure Hot/Cold Water System</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.plumbing}</td>
                      </tr>

                      <tr className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-200">8. Cubicaje de Embarque</td>
                        <td className="p-3 text-slate-300 font-mono">40ft High Cube Container (40HC)</td>
                        <td className="p-3 text-emerald-400 font-medium">{currentModel.specs_zh.shipping}</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-[#0f172a] border border-[#334155] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Control de Calidad en Fábrica: 100% de pruebas de estanqueidad y soldadura certificadas.</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Contenedor: {currentModel.container_capacity}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Acciones Ejecutivas */}
        <div className="p-4 border-t border-[#334155] bg-[#0b0f19] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span>Propuesta Activa: </span>
            <strong className="text-white">{currentModel.name}</strong> • Total: <strong className="text-emerald-400 font-mono">${Math.round(calculations.totalUSD).toLocaleString()} USD</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#334155] text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSaveDossier) {
                  onSaveDossier({
                    modelId: currentModel.id,
                    modelName: currentModel.name,
                    totalUSD: calculations.totalUSD,
                    deposit60: calculations.deposit60,
                    balance40: calculations.balance40,
                    exteriorColor,
                    interiorFinish,
                    floorStyle
                  });
                }
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-lg flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar & Aplicar al Expediente</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
