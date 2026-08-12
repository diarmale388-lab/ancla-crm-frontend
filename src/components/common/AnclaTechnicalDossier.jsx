import React, { useState, useMemo } from 'react';
import { 
  X, Building2, Sparkles, Factory, DollarSign, FileText, CheckCircle2, 
  ShieldCheck, ArrowRight, Download, Send, Globe, Sliders, Box, Layers, 
  Sun, Wind, Hammer, Truck, Info, Percent, Calendar, Check, ExternalLink,
  Copy, Share2, Eye, Palette
} from 'lucide-react';

export const FACADE_THEMES = {
  'NEGRO_INDUSTRIAL': {
    id: 'NEGRO_INDUSTRIAL',
    name: 'Negro Industrial & Madera Teka (RAL 9005)',
    primaryColor: '#1e293b',
    accentColor: '#b45309',
    frameColor: '#0f172a',
    glassTint: '#0284c7',
    badge: '⚫ Negro Industrial',
    description: 'Acabado contemporáneo en acero mate industrial con paneles de madera teka tecnológica resistente a intemperie.'
  },
  'MADERA_TEKA': {
    id: 'MADERA_TEKA',
    name: 'Madera Teka Natural & Grafito',
    primaryColor: '#92400e',
    accentColor: '#334155',
    frameColor: '#1e293b',
    glassTint: '#38bdf8',
    badge: '🟤 Teka Campestre',
    description: 'Ideal para proyectos campestres y bioclimáticos. Alta calidez visual con revestimiento WPC de exportación.'
  },
  'BLANCO_ARQUITECTONICO': {
    id: 'BLANCO_ARQUITECTONICO',
    name: 'Blanco Arquitectónico & Roble Nórdico',
    primaryColor: '#f1f5f9',
    accentColor: '#d97706',
    frameColor: '#475569',
    glassTint: '#67e8f9',
    badge: '⚪ Blanco Nórdico',
    description: 'Estilo escandinavo minimalista con máxima reflexión solar y aislamiento térmico superior.'
  },
  'GRIS_GRAFITO': {
    id: 'GRIS_GRAFITO',
    name: 'Gris Grafito Anodizado & Vidrio Low-E Fumé',
    primaryColor: '#334155',
    accentColor: '#10b981',
    frameColor: '#0f172a',
    glassTint: '#059669',
    badge: '🔘 Gris Grafito',
    description: 'Diseño vanguardista de alta gama con perfiles de aluminio negro y ventanería Low-E reflectiva.'
  }
};

export const PRODUCT_DATA = {
  'EXP-36': {
    id: 'EXP-36',
    name: 'Flex Home EXP-36',
    line: 'Flex Home',
    area: 36,
    dimensions: '5.90m x 6.30m x 2.48m',
    folded_dimensions: '5.90m x 2.23m x 2.48m',
    weight_tons: 3.2,
    base_price_cop: 78500000,
    bedrooms: 2,
    bathrooms: 1,
    description: 'Casa modular expandible de despliegue rápido (48 horas). Estructura de acero galvanizado reforzado Q350 con paneles sándwich de alto aislamiento.',
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
    base_price_cop: 126500000,
    bedrooms: 3,
    bathrooms: 2,
    description: 'Vivienda modular de amplio formato para proyectos campestres o residenciales premium. Máxima habitabilidad y acabados de lujo.',
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
    base_price_cop: 59800000,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Suite modular futurista para proyectos de glamping, ecoturismo y hotelería boutique. Llave en mano con baño de lujo y ventanería curva.',
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
    base_price_cop: 104000000,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Cápsula suite presidencial con zona de estar, cocineta equipada, baño tipo spa y terraza perimetral para alta rentabilidad turística.',
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

export const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
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
  const [freightDistanceKm, setFreightDistanceKm] = useState(150); // km desde puerto/bodega a lote
  const [discountPercent, setDiscountPercent] = useState(0);

  // Estados de Personalización Visual
  const [facadeThemeKey, setFacadeThemeKey] = useState('NEGRO_INDUSTRIAL');
  const [interiorFinish, setInteriorFinish] = useState('Paneles Termoacústicos Blanco Nórdico');
  const [floorStyle, setFloorStyle] = useState('Roble Escandinavo SPC 6mm');
  const [smartHomePack, setSmartHomePack] = useState('Tuya Smart Pack (Iluminación + Clima + Cerradura Digital)');

  // Estado para Link Web de Propuesta
  const [webLinkCopied, setWebLinkCopied] = useState(false);

  const currentModel = PRODUCT_DATA[selectedModelId] || PRODUCT_DATA['EXP-36'];
  const currentFacade = FACADE_THEMES[facadeThemeKey] || FACADE_THEMES['NEGRO_INDUSTRIAL'];

  // Cálculos Financieros en Tiempo Real (COP)
  const calculations = useMemo(() => {
    const base = Number(currentModel.base_price_cop) || 0;
    const safeDeckArea = Number(deckArea) || 0;
    const deckTotal = includeDeck ? safeDeckArea * 360000 : 0;
    const solarTotal = includeSolar ? 17800000 : 0;
    const safeAcUnits = Number(acUnits) || 0;
    const acTotal = safeAcUnits * 3200000;
    const floorTotal = includeSpcFloor ? (Number(currentModel.area) || 0) * 75000 : 0;
    const safeKm = Number(freightDistanceKm) || 0;
    const safeWeight = Number(currentModel.weight_tons) || 1;
    const freightTotal = 3400000 + (safeKm * safeWeight * 750);
    
    const subtotal = base + deckTotal + solarTotal + acTotal + floorTotal + freightTotal;
    const safeDiscount = Number(discountPercent) || 0;
    const discountAmount = subtotal * (safeDiscount / 100);
    const totalCOP = subtotal - discountAmount;
    const deposit50 = totalCOP * 0.50;
    const balance50 = totalCOP * 0.50;

    return {
      base,
      deckTotal,
      solarTotal,
      acTotal,
      floorTotal,
      freightTotal,
      subtotal,
      discountAmount,
      totalCOP,
      totalUSD: totalCOP, // Aliased for compatibility
      deposit50,
      balance50,
      deposit60: deposit50,
      balance40: balance50
    };
  }, [currentModel, includeDeck, deckArea, includeSolar, acUnits, includeSpcFloor, freightDistanceKm, discountPercent]);

  // Generador de Link Web de Propuesta Interactiva
  const generateWebProposalLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anclaspecialprojects.com';
    const contactParam = contact?.id ? `&c=${contact.id}` : '';
    const nameParam = contact?.first_name ? `&n=${encodeURIComponent(contact.first_name)}` : '';
    return `${baseUrl}/propuesta?ref=ANCLA-${currentModel.id}&theme=${facadeThemeKey}&total=${Math.round(calculations.totalCOP)}${contactParam}${nameParam}`;
  };

  const handleCopyWebLink = () => {
    const url = generateWebProposalLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setWebLinkCopied(true);
      setTimeout(() => setWebLinkCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fade-in font-sans">
      
      {/* Contenedor Principal con Dual Theme Enterprise */}
      <div className="bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#334155] rounded-3xl w-full max-w-5xl h-[92vh] max-h-[880px] flex flex-col shadow-2xl overflow-hidden text-[#0f172a] dark:text-[#f8fafc] transition-colors">
        
        {/* Header Corporativo ANCLA */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] dark:border-[#334155] bg-[#f1f5f9] dark:bg-[#0f172a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md font-black text-lg shrink-0">
              ⚓
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-sm font-black text-[#0f172a] dark:text-[#f8fafc] tracking-wide truncate">
                  DOSSIER TÉCNICO & COTIZADOR COP
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                  COP TABULAR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                ANCLA Special Projects • {contact ? `Cliente: ${contact.first_name || ''} ${contact.last_name || ''} (${contact.phone || ''})` : 'Ficha Técnica Oficial'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyWebLink}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
              title="Generar y copiar link web de propuesta interactiva"
            >
              {webLinkCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Globe className="w-3.5 h-3.5 text-purple-500" />}
              <span>{webLinkCopied ? '¡Link Copiado!' : 'Link Propuesta Web'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de 3 Pestañas Principales */}
        <div className="flex bg-white dark:bg-[#0f172a] px-6 border-b border-slate-200 dark:border-[#334155] gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('comercial')}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'comercial'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>1. Dossier Comercial & Cotizador COP</span>
          </button>

          <button
            onClick={() => setActiveTab('personalizacion')}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'personalizacion'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Visualizador 3D & Acabados</span>
          </button>

          <button
            onClick={() => setActiveTab('china_spec')}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
              activeTab === 'china_spec'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>3. China Spec Sheet (工厂制造规范)</span>
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll Limpio */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================================= */}
          {/* PESTAÑA 1: DOSSIER COMERCIAL & COTIZADOR COP */}
          {/* ========================================================================= */}
          {activeTab === 'comercial' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Selector de Modelos del Portafolio */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Seleccionar Modelo del Portafolio ANCLA:
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
                            ? 'bg-emerald-500/5 dark:bg-[#1e293b] border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-white dark:bg-[#1e293b]/50 border-slate-200 dark:border-[#334155] hover:border-slate-400 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {p.id}
                            </span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                              {formatCOP(p.base_price_cop)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#0f172a] dark:text-white mt-1">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{p.area}m² • {p.bedrooms} Hab, {p.bathrooms} Baño</p>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-700/50">
                          📐 {p.dimensions}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fila Dividida: Opciones Configurables (7 Cols) y Tarjeta Financiera (5 Cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Columna Izquierda: Opciones de Adicionales e Ingeniería */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b]/40 border border-slate-200 dark:border-[#334155] space-y-4">
                    <h3 className="text-xs font-black uppercase text-[#0f172a] dark:text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-emerald-500" />
                      <span>Configurador de Adicionales & Obras de Implantación</span>
                    </h3>

                    {/* Deck WPC Sintético */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeDeck}
                            onChange={(e) => setIncludeDeck(e.target.checked)}
                            className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-[#0f172a] dark:text-white">Terraza Exterior en Deck WPC de Exportación</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{formatCOP(calculations.deckTotal)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pl-6">Madera tecnológica de alta resistencia ($360.000 COP/m²)</p>
                      
                      {includeDeck && (
                        <div className="pl-6 pt-2 flex items-center space-x-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Área:</span>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={deckArea}
                            onChange={(e) => setDeckArea(parseInt(e.target.value) || 10)}
                            className="flex-1 accent-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-[#0f172a] dark:text-white min-w-[45px]">{deckArea} m²</span>
                        </div>
                      )}
                    </div>

                    {/* Kit Solar Off-Grid */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSolar}
                          onChange={(e) => setIncludeSolar(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#0f172a] dark:text-white flex items-center space-x-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span>Kit Solar Fotovoltaico Autónomo (3.5 kWp + Litio)</span>
                          </span>
                          <p className="text-[10px] text-slate-400">Inversor híbrido + Batería LiFePO4 de 5kWh</p>
                        </div>
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {includeSolar ? `+${formatCOP(17800000)}` : '$0'}
                      </span>
                    </div>

                    {/* Climatización Inverter */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#0f172a] dark:text-white flex items-center space-x-1.5">
                          <Wind className="w-3.5 h-3.5 text-blue-500" />
                          <span>Aire Acondicionado Inverter 12.000 BTU</span>
                        </span>
                        <p className="text-[10px] text-slate-400">Alta eficiencia energética ($3.200.000 COP/unidad)</p>
                      </div>
                      <select
                        value={acUnits}
                        onChange={(e) => setAcUnits(parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-lg px-2 py-1 text-xs font-bold text-[#0f172a] dark:text-white cursor-pointer"
                      >
                        <option value="0">Sin Climatización</option>
                        <option value="1">1 Unidad (+{formatCOP(3200000)})</option>
                        <option value="2">2 Unidades (+{formatCOP(6400000)})</option>
                        <option value="3">3 Unidades (+{formatCOP(9600000)})</option>
                      </select>
                    </div>

                    {/* Flete & Logística Terrestre */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0f172a] dark:text-white flex items-center space-x-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Flete Terrestre e Instalación en Sitio</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{formatCOP(calculations.freightTotal)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] text-slate-400">Distancia a Lote:</span>
                        <input
                          type="range"
                          min="20"
                          max="800"
                          step="25"
                          value={freightDistanceKm}
                          onChange={(e) => setFreightDistanceKm(parseInt(e.target.value) || 50)}
                          className="flex-1 accent-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-[#0f172a] dark:text-white min-w-[50px] text-right">{freightDistanceKm} km</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Columna Derecha: Tarjeta de Liquidación Financiera COP (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-[#1e293b] dark:to-[#0f172a] border border-emerald-500/30 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Liquidación Comercial</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                        Valores en COP
                      </span>
                    </div>

                    {/* Desglose de Líneas */}
                    <div className="space-y-2 text-xs font-medium">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Modelo {currentModel.name}:</span>
                        <span className="font-mono tabular-nums font-bold">{formatCOP(calculations.base)}</span>
                      </div>
                      {includeDeck && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Deck Sintético ({deckArea}m²):</span>
                          <span className="font-mono tabular-nums">+{formatCOP(calculations.deckTotal)}</span>
                        </div>
                      )}
                      {includeSolar && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Kit Solar 3.5kWp:</span>
                          <span className="font-mono tabular-nums">+{formatCOP(calculations.solarTotal)}</span>
                        </div>
                      )}
                      {acUnits > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>A.A. Inverter ({acUnits}x):</span>
                          <span className="font-mono tabular-nums">+{formatCOP(calculations.acTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Flete & Logística ({freightDistanceKm} km):</span>
                        <span className="font-mono tabular-nums">+{formatCOP(calculations.freightTotal)}</span>
                      </div>

                      {/* Descuento Comercial */}
                      <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Percent className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-xs text-rose-600 dark:text-rose-300 font-bold">Descuento Especial:</span>
                        </div>
                        <select
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-lg px-2 py-0.5 text-xs text-rose-600 dark:text-rose-300 font-mono font-bold"
                        >
                          <option value="0">0%</option>
                          <option value="3">3% (-{formatCOP(calculations.subtotal * 0.03)})</option>
                          <option value="5">5% (-{formatCOP(calculations.subtotal * 0.05)})</option>
                          <option value="8">8% (-{formatCOP(calculations.subtotal * 0.08)})</option>
                        </select>
                      </div>
                    </div>

                    {/* Total Final */}
                    <div className="pt-3 border-t-2 border-emerald-500/40 flex items-center justify-between">
                      <span className="text-sm font-black text-[#0f172a] dark:text-white">TOTAL PROPUESTA:</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                        {formatCOP(calculations.totalCOP)}
                      </span>
                    </div>

                    {/* Hitos de Pago 50 / 50 */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-[#334155] space-y-2 text-xs">
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                        Hitos de Pago de Fabricación (Regla 50/50):
                      </span>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600 dark:text-slate-300">50% Anticipo de Fabricación:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {formatCOP(calculations.deposit50)}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600 dark:text-slate-300">50% Balanza Final (Contra Entrega):</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                          {formatCOP(calculations.balance50)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: VISUALIZADOR 3D & ACABADOS */}
          {/* ========================================================================= */}
          {activeTab === 'personalizacion' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visualizador de Fachada */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Acabado Seleccionado</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {currentFacade.badge}
                      </span>
                    </div>

                    <div className="w-full h-64 rounded-xl border-2 flex items-center justify-center p-4 relative overflow-hidden transition-all duration-300"
                      style={{ 
                        backgroundColor: currentFacade.primaryColor,
                        borderColor: currentFacade.frameColor
                      }}
                    >
                      <div className="w-full max-w-sm aspect-video rounded-xl border-2 shadow-2xl relative flex overflow-hidden"
                        style={{ borderColor: currentFacade.frameColor }}
                      >
                        <div className="w-1/3 h-full border-r-2 flex flex-col justify-between p-2"
                          style={{ backgroundColor: currentFacade.accentColor, borderColor: currentFacade.frameColor }}
                        >
                          <span className="text-[8px] font-black text-white/60">ANCLA MODULAR</span>
                        </div>
                        <div className="w-2/3 h-full p-2 flex space-x-1.5" style={{ backgroundColor: `${currentFacade.glassTint}22` }}>
                          <div className="flex-1 h-full rounded border border-white/20"></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      💡 {currentFacade.description}
                    </p>
                  </div>
                </div>

                {/* Paletas de Selección */}
                <div className="lg:col-span-5 space-y-3">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Seleccionar Paleta de Fachada:
                  </label>
                  {Object.values(FACADE_THEMES).map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setFacadeThemeKey(theme.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                        facadeThemeKey === theme.id
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-white/5 hover:border-slate-300 bg-white dark:bg-[#1e293b]/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 rounded-full border shadow-xs" style={{ backgroundColor: theme.primaryColor }}></span>
                        <span className="w-4 h-4 rounded-full border shadow-xs" style={{ backgroundColor: theme.accentColor }}></span>
                        <span className="text-xs font-bold text-[#0f172a] dark:text-white">{theme.badge}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{theme.description}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: CHINA SPEC SHEET */}
          {/* ========================================================================= */}
          {activeTab === 'china_spec' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-[#334155] space-y-4">
                <div className="flex items-center justify-between border-b dark:border-[#334155] pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-[#0f172a] dark:text-white">Especificaciones de Fabricación en Planta (China)</h3>
                    <p className="text-[11px] text-slate-400">Certificación ISO 9001 / CE / Ensamble Robotizado de Precisión</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono">Q350 STEEL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {Object.entries(currentModel.specs_zh || {}).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">{key}</span>
                      <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer con Acciones Ejecutivas */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#334155] bg-[#f1f5f9] dark:bg-[#0b0f19] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Propuesta Activa: </span>
            <strong className="text-[#0f172a] dark:text-white">{currentModel.name} ({currentFacade.badge})</strong> • Total: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCOP(calculations.totalCOP)} COP</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
                    totalCOP: calculations.totalCOP,
                    totalUSD: calculations.totalCOP,
                    deposit60: calculations.deposit50,
                    balance40: calculations.balance50,
                    exteriorColor: currentFacade.name,
                    interiorFinish,
                    floorStyle
                  });
                }
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
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
