import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, Sparkles, Sun, Wind, Layers, ShieldCheck, CheckCircle2, 
  Download, Send, ArrowRight, Check, Share2, Eye, Palette, 
  Clock, MapPin, Phone, User, Flame, Droplet, Zap, Wrench,
  AlertCircle, ChevronDown, ChevronUp, Copy, Moon, Home, ExternalLink
} from 'lucide-react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');

export const FACADE_THEMES = {
  'NEGRO_INDUSTRIAL': {
    id: 'NEGRO_INDUSTRIAL',
    name: 'Negro Industrial & Madera Teka (RAL 9005)',
    primaryColor: '#0f172a',
    accentColor: '#b45309',
    frameColor: '#020617',
    glassTint: '#38bdf8',
    badge: '⚫ Negro Industrial',
    description: 'Acero galvanizado mate industrial con paneles de madera teka tecnológica resistente a intemperie.'
  },
  'MADERA_TEKA': {
    id: 'MADERA_TEKA',
    name: 'Madera Teka Natural & Grafito',
    primaryColor: '#78350f',
    accentColor: '#1e293b',
    frameColor: '#0f172a',
    glassTint: '#7dd3fc',
    badge: '🟤 Teka Campestre',
    description: 'Estilo campestre bioclimático. Alta calidez visual con revestimiento WPC de exportación.'
  },
  'BLANCO_ARQUITECTONICO': {
    id: 'BLANCO_ARQUITECTONICO',
    name: 'Blanco Arquitectónico & Roble Nórdico',
    primaryColor: '#f8fafc',
    accentColor: '#d97706',
    frameColor: '#334155',
    glassTint: '#bae6fd',
    badge: '⚪ Blanco Nórdico',
    description: 'Minimalismo escandinavo con máxima reflexión solar y aislamiento térmico superior.'
  },
  'GRIS_GRAFITO': {
    id: 'GRIS_GRAFITO',
    name: 'Gris Grafito Anodizado & Low-E Fumé',
    primaryColor: '#334155',
    accentColor: '#10b981',
    frameColor: '#0f172a',
    glassTint: '#34d399',
    badge: '🔘 Gris Grafito',
    description: 'Diseño vanguardista de alta gama con perfiles de aluminio negro y ventanería Low-E reflectiva.'
  }
};

export const PRODUCT_DATA = {
  'CL-13': {
    id: 'CL-13',
    name: 'Cápsula Living CL-13',
    line: 'Cápsulas Living',
    area: 13,
    dimensions: '5.80m x 2.23m x 2.55m',
    folded_dimensions: 'Estructura Monolítica Fija',
    weight_tons: 2.1,
    base_price_cop: 78000000,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Suite modular futurista para proyectos de glamping, ecoturismo y hotelería boutique. Llave en mano con baño de lujo y ventanería curva 270°.',
    specs_highlights: [
      'Carcasa exterior en aluminio aeronáutico ultrarresistente',
      'Ventanales curvos panorámicos 270° con vidrio Low-E',
      'Baño integrado tipo spa con ducha de techo y división de vidrio',
      'Climatización e iluminación inteligente domotizada',
      'Lista para conectar y operar (Plug & Play)',
      'Máxima rentabilidad turística en plataformas como Airbnb'
    ]
  },
  'CL-26': {
    id: 'CL-26',
    name: 'Cápsula Living CL-26',
    line: 'Cápsulas Living',
    area: 26,
    dimensions: '8.95m x 2.23m x 2.55m',
    folded_dimensions: 'Estructura Monolítica Fija',
    weight_tons: 3.6,
    base_price_cop: 148800000,
    bedrooms: 1,
    bathrooms: 1,
    description: 'Cápsula suite presidencial con zona de estar, cocineta equipada, baño tipo spa y terraza perimetral para alta rentabilidad turística.',
    specs_highlights: [
      'Suite presidencial de 26m² con sala lounge y cocineta',
      'Techo panorámico con claraboya eléctrica de apertura',
      'Aislamiento acústico de grado hotelero de lujo',
      'Estructura de aluminio y acero inoxidable anticorrosión',
      'Ideal para suites VIP en fincas y resorts ecológicos',
      'Conexiones rápidas de agua, energía y desagüe'
    ]
  },
  'EXP-36': {
    id: 'EXP-36',
    name: 'Flex Home EXP-36',
    line: 'Flex Home',
    area: 36,
    dimensions: '5.90m x 6.30m x 2.48m',
    folded_dimensions: '5.90m x 2.23m x 2.48m',
    weight_tons: 3.2,
    base_price_cop: 118800000,
    bedrooms: 2,
    bathrooms: 1,
    description: 'Casa modular expandible de despliegue rápido (48 horas). Estructura de acero galvanizado reforzado Q350 con paneles sándwich de alto aislamiento térmico y acústico.',
    specs_highlights: [
      'Estructura antisísmica en acero estructural Q350',
      'Aislamiento termoacústico en poliuretano (PU) 75mm',
      'Ventanería acústica doble vidrio templado Low-E',
      'Piso SPC impermeable alto tráfico acabado madera',
      'Instalaciones eléctricas ocultas 110V/220V bajo norma RETIE',
      'Baño completo equipado con grifería de lujo y división'
    ]
  },
  'EXP-56': {
    id: 'EXP-56',
    name: 'Flex Home EXP-56',
    line: 'Flex Home',
    area: 56,
    dimensions: '11.80m x 6.30m x 2.48m',
    folded_dimensions: '11.80m x 2.23m x 2.48m',
    weight_tons: 4.8,
    base_price_cop: 188000000,
    bedrooms: 3,
    bathrooms: 2,
    description: 'Vivienda modular de amplio formato para proyectos campestres o residenciales premium. 3 habitaciones y 2 baños completos (Precio base sujeto a confirmación final).',
    specs_highlights: [
      'Gran formato 56m² con sala-comedor y cocina integral',
      'Aislamiento superior 100mm PU + lana de roca',
      'Triple alcoba con ventanas panorámicas',
      '2 baños completos con acabados de hotel boutique',
      'Sistema de ensamble express en 48-72 horas',
      'Apta para climas cálidos, fríos y zonas de alta montaña'
    ]
  }
};

const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export default function ProposalPortal() {
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light'
  
  // Parámetros de URL
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const rawRef = urlParams.get('ref') || 'EXP-36';
  const cleanRef = rawRef.replace('ANCLA-', '');
  const modelKey = PRODUCT_DATA[cleanRef] ? cleanRef : 'EXP-36';
  
  const initialTheme = urlParams.get('theme') || 'NEGRO_INDUSTRIAL';
  const contactId = urlParams.get('c') || null;
  const clientName = urlParams.get('n') || 'Cliente Preferencial';
  const clientCity = urlParams.get('city') || 'Armenia / Eje Cafetero';

  // Estados de Personalización y Configuración
  const [selectedModel, setSelectedModel] = useState(modelKey);
  const [facadeKey, setFacadeKey] = useState(FACADE_THEMES[initialTheme] ? initialTheme : 'NEGRO_INDUSTRIAL');
  const [includeDeck, setIncludeDeck] = useState(true);
  const [deckArea, setDeckArea] = useState(15);
  const [includeSolar, setIncludeSolar] = useState(false);
  const [includeAC, setIncludeAC] = useState(true);
  const [acUnits, setAcUnits] = useState(1);
  const [includeSpcFloor, setIncludeSpcFloor] = useState(true);
  const [freightKm, setFreightKm] = useState(150);

  // Estados UI
  const [openAccordion, setOpenAccordion] = useState('cimentacion'); // 'cimentacion', 'hidraulica', 'electrica'
  const [copiedLink, setCopiedLink] = useState(false);
  const startTimeRef = useRef(Date.now());
  const engagedTrackedRef = useRef(false);

  const model = PRODUCT_DATA[selectedModel] || PRODUCT_DATA['EXP-36'];
  const facade = FACADE_THEMES[facadeKey] || FACADE_THEMES['NEGRO_INDUSTRIAL'];

  // Cálculos Financieros Estrictos en COP
  const pricing = useMemo(() => {
    const base = model.base_price_cop;
    const deck = includeDeck ? Number(deckArea) * 360000 : 0;
    const solar = includeSolar ? 17800000 : 0;
    const ac = includeAC ? Number(acUnits) * 3200000 : 0;
    const floor = includeSpcFloor ? model.area * 75000 : 0;
    const freight = 3400000 + (Number(freightKm) * model.weight_tons * 750);
    
    const subtotal = base + deck + solar + ac + floor + freight;
    const total = subtotal;
    const anticipo50 = total * 0.50;
    const balanza50 = total * 0.50;

    return {
      base,
      deck,
      solar,
      ac,
      floor,
      freight,
      subtotal,
      total,
      anticipo50,
      balanza50
    };
  }, [model, includeDeck, deckArea, includeSolar, includeAC, acUnits, includeSpcFloor, freightKm]);

  // Tracking en Tiempo Real
  useEffect(() => {
    // 1. Apertura inicial (0s)
    const trackView = async (seconds = 0) => {
      try {
        await fetch(`${API_URL}/proposals/public/track-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_id: contactId ? parseInt(contactId) : null,
            reference: `ANCLA-${model.id}`,
            duration_seconds: seconds,
            total_cop: pricing.total,
            facade_theme: facade.name,
            client_name: clientName
          })
        });
      } catch (err) {
        // Silent
      }
    };

    trackView(0);

    // 2. Temporizador para alerta de 30 segundos (Lead Caliente)
    const timer = setTimeout(() => {
      if (!engagedTrackedRef.current) {
        engagedTrackedRef.current = true;
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackView(elapsed);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [contactId, model.id, pricing.total, facade.name, clientName]);

  // Generador de Enlace WhatsApp para el Cliente
  const handleWhatsAppAction = () => {
    const phone = "573217545654"; // Línea comercial oficial ANCLA
    const text = `¡Hola Liliana y equipo ANCLA! 👋
He revisado mi propuesta web personalizada para el modelo *${model.name}* (Ref: ANCLA-${model.id}):

🎨 *Acabado Seleccionado:* ${facade.name}
📦 *Adicionales:* ${includeDeck ? `Deck ${deckArea}m²` : ''}${includeSolar ? ' + Kit Solar' : ''}${includeAC ? ` + ${acUnits} A.A.` : ''}
💰 *Inversión Total Estimada:* ${formatCOP(pricing.total)} COP
💳 *Plan 50/50:* Anticipo ${formatCOP(pricing.anticipo50)} COP / Balanza ${formatCOP(pricing.balanza50)} COP

Me gustaría agendar una cita para revisar la viabilidad en mi terreno y proceder con el proyecto. Mi nombre es *${clientName}*.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#0b0f19] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      
      {/* Barra de Navegación Superior Fija */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${themeMode === 'dark' ? 'bg-[#0b0f19]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Medallón de Acero Pulido ANCLA */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight uppercase">ANCLA</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Propuesta Oficial
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Special Projects LATAM • Expediente <span className="font-mono font-bold text-emerald-500">ANCLA-{model.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleCopyShare}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                themeMode === 'dark' 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Copiar enlace de esta propuesta"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? '¡Enlace Copiado!' : 'Compartir'}</span>
            </button>

            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                themeMode === 'dark' 
                  ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' 
                  : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
              }`}
              title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Banner Superior de Bienvenida al Cliente */}
      <div className={`border-b ${themeMode === 'dark' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Propuesta Diseñada Exclusivamente Para:
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{clientName}</h2>
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Terreno: <strong>{clientCity}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Fabricación Express: <strong>48-72 Horas</strong></span>
              </span>
            </div>
          </div>

          {/* Selector Rápido de Modelo */}
          <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white/10 dark:bg-black/40 border border-slate-200 dark:border-white/10 overflow-x-auto">
            {Object.values(PRODUCT_DATA).map((prod) => (
              <button
                key={prod.id}
                onClick={() => setSelectedModel(prod.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedModel === prod.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {prod.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal de la Propuesta */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        
        {/* Bloque Superior: Render Vectorial Interactivo & Especificaciones Clave */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda (7 cols): Visualizador 3D y Render de Fachada */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all relative overflow-hidden ${
              themeMode === 'dark' ? 'bg-[#111827]/80 border-white/10' : 'bg-white border-slate-200'
            }`}>
              
              {/* Badge de Acabado Activo */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  <span>Simulador de Acabado Arquitectónico</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {facade.badge}
                </span>
              </div>

              {/* Render Vectorial Dinámico que Cambia con los Colores del Acabado */}
              <div className="w-full h-72 sm:h-96 rounded-2xl relative flex items-center justify-center p-6 transition-all duration-500 overflow-hidden"
                style={{
                  background: themeMode === 'dark'
                    ? `radial-gradient(circle at center, ${facade.primaryColor}33 0%, #0b0f19 90%)`
                    : `radial-gradient(circle at center, ${facade.primaryColor}22 0%, #f1f5f9 90%)`
                }}
              >
                {/* Iluminación Atmosférica de Fondo */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20" style={{ backgroundColor: facade.accentColor }}></div>
                
                {/* Estructura Vectorial Arquitectónica */}
                <div className="w-full max-w-md aspect-video relative flex flex-col items-center justify-center">
                  
                  {/* Cuerpo Principal del Módulo */}
                  <div 
                    className="w-full h-44 rounded-2xl border-4 shadow-2xl relative flex overflow-hidden transition-all duration-500"
                    style={{ 
                      backgroundColor: facade.primaryColor, 
                      borderColor: facade.frameColor 
                    }}
                  >
                    {/* Panel de Acento / Madera / Grafito */}
                    <div 
                      className="w-1/3 h-full border-r-2 opacity-90 transition-all duration-500 flex flex-col justify-between p-3"
                      style={{ 
                        backgroundColor: facade.accentColor, 
                        borderColor: facade.frameColor 
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="w-full h-1.5 bg-black/20 rounded-full"></div>
                        <div className="w-3/4 h-1.5 bg-black/20 rounded-full"></div>
                        <div className="w-full h-1.5 bg-black/20 rounded-full"></div>
                      </div>
                      <div className="text-[9px] font-black tracking-widest text-white/70 uppercase">
                        ANCLA {model.id}
                      </div>
                    </div>

                    {/* Ventanales Panorámicos Low-E */}
                    <div className="w-2/3 h-full p-3 flex space-x-2">
                      <div 
                        className="flex-1 h-full rounded-xl border-2 shadow-inner relative overflow-hidden transition-all duration-500 flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${facade.glassTint}22`, 
                          borderColor: facade.frameColor 
                        }}
                      >
                        <div className="w-full h-0.5 bg-white/20 absolute top-1/2"></div>
                        <span className="text-[10px] font-bold text-white/50">Low-E</span>
                      </div>
                      <div 
                        className="w-1/3 h-full rounded-xl border-2 shadow-inner relative transition-all duration-500"
                        style={{ 
                          backgroundColor: `${facade.glassTint}33`, 
                          borderColor: facade.frameColor 
                        }}
                      >
                        <div className="w-full h-0.5 bg-white/20 absolute top-1/2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Deck Exterior Opcional Vectorial */}
                  {includeDeck && (
                    <div className="w-[108%] h-7 bg-amber-950 border-t-2 border-amber-700 rounded-b-xl shadow-xl flex items-center justify-around px-4 -mt-1 z-10 animate-fade-in">
                      <div className="w-1 h-full bg-black/30"></div>
                      <div className="w-1 h-full bg-black/30"></div>
                      <div className="w-1 h-full bg-black/30"></div>
                      <div className="w-1 h-full bg-black/30"></div>
                      <span className="text-[9px] font-bold text-amber-200/80">Deck WPC {deckArea}m²</span>
                      <div className="w-1 h-full bg-black/30"></div>
                      <div className="w-1 h-full bg-black/30"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector Interactivo de Acabados */}
              <div className="mt-6 space-y-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Selecciona la Paleta de Fachada Deseada:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.values(FACADE_THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setFacadeKey(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        facadeKey === theme.id
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border shadow-xs" style={{ backgroundColor: theme.primaryColor }}></span>
                        <span className="w-3.5 h-3.5 rounded-full border shadow-xs" style={{ backgroundColor: theme.accentColor }}></span>
                      </div>
                      <p className="text-[11px] font-bold leading-tight truncate">{theme.badge}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                  💡 {facade.description}
                </p>
              </div>
            </div>

            {/* Ficha de Especificaciones de Ingeniería */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              themeMode === 'dark' ? 'bg-[#111827]/80 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center space-x-2 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
                <span>Garantías y Especificaciones Constructivas ({model.name})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {model.specs_highlights.map((spec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha (5 cols): Configurador Financiero 100% en COP & Plan 50/50 */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tarjeta de Cotización Dinámica en COP */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 sticky top-24 ${
              themeMode === 'dark' ? 'bg-[#111827] border-emerald-500/30' : 'bg-white border-emerald-300'
            }`}>
              
              <div className="border-b pb-4 dark:border-white/10">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Configurador Comercial
                </span>
                <h3 className="text-xl font-black">{model.name}</h3>
                <p className="text-xs text-slate-400">Inversión Llave en Mano Personalizable</p>
              </div>

              {/* Opciones Configurables */}
              <div className="space-y-4 text-xs">
                
                {/* Precio Base */}
                <div className="flex justify-between items-center py-1 border-b dark:border-white/5 font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Estructura Base ({model.area}m²):</span>
                  <span className="font-mono text-sm font-black tabular-nums">{formatCOP(pricing.base)}</span>
                </div>

                {/* Toggle Deck WPC */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" 
                        checked={includeDeck} 
                        onChange={(e) => setIncludeDeck(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Deck Exterior WPC</span>
                    </label>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCOP(pricing.deck)}
                    </span>
                  </div>
                  {includeDeck && (
                    <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 text-[11px]">
                      <span className="text-slate-500">Área: <strong>{deckArea} m²</strong></span>
                      <input 
                        type="range" 
                        min="5" 
                        max="40" 
                        step="5"
                        value={deckArea} 
                        onChange={(e) => setDeckArea(e.target.value)}
                        className="w-28 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Toggle Kit Solar */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold">
                    <input 
                      type="checkbox" 
                      checked={includeSolar} 
                      onChange={(e) => setIncludeSolar(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex items-center space-x-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kit Solar Off-Grid (Litio)</span>
                    </span>
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatCOP(pricing.solar)}
                  </span>
                </div>

                {/* Toggle Aire Acondicionado */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" 
                        checked={includeAC} 
                        onChange={(e) => setIncludeAC(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="flex items-center space-x-1">
                        <Wind className="w-3.5 h-3.5 text-blue-500" />
                        <span>A.A. Inverter 12.000 BTU</span>
                      </span>
                    </label>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCOP(pricing.ac)}
                    </span>
                  </div>
                  {includeAC && (
                    <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 text-[11px]">
                      <span className="text-slate-500">Unidades: <strong>{acUnits}</strong></span>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => setAcUnits(num)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              acUnits === num ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-white/10'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Flete e Instalación en Lote */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                      <span>🚚 Flete e Instalación ({freightKm} km)</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCOP(pricing.freight)}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="600" 
                    step="20"
                    value={freightKm} 
                    onChange={(e) => setFreightKm(e.target.value)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Eje Cafetero (50km)</span>
                    <span>Cali / Medellín (250km)</span>
                    <span>Bogotá / Costa (500km+)</span>
                  </div>
                </div>
              </div>

              {/* Total Inversión en Pesos Colombianos (COP) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-emerald-100 uppercase tracking-wider font-bold">
                  <span>Inversión Total Estimada:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">100% COP</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums">
                  {formatCOP(pricing.total)} <span className="text-sm font-sans font-medium text-emerald-200">COP</span>
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-tight">
                  Incluye módulos ensamblados, acabados arquitectónicos, flete terrestre e instalación en sitio.
                </p>
              </div>

              {/* Desglose Plan de Pagos 50% / 50% */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Esquema Financiero Estándar (50% / 50%):
                </span>
                
                <div className="flex items-center justify-between text-xs py-1 border-b dark:border-white/5">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>50% Anticipo de Fabricación:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCOP(pricing.anticipo50)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>50% Balanza Final (Contra Entrega):</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatCOP(pricing.balanza50)}
                  </span>
                </div>
              </div>

              {/* Botón de Conversión WhatsApp Directo */}
              <button
                onClick={handleWhatsAppAction}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Aceptar Propuesta & Agendar Visita</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-slate-400">
                🔒 Propuesta con vigencia comercial garantizada por 15 días hábiles.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque Inferior: Guía Interactiva de Obras Civiles & Requisitos de Terreno */}
        <section className={`p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-6 ${
          themeMode === 'dark' ? 'bg-[#111827]/60 border-white/10' : 'bg-white border-slate-200'
        }`}>
          
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Wrench className="w-4 h-4 text-emerald-500" />
              <span>Guía Técnica para el Cliente</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black">Requisitos de Obras Civiles en Terreno</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Para garantizar una instalación perfecta en 48 horas, tu terreno debe contar con los siguientes puntos de preparación:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Requisito 1: Cimentación */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              openAccordion === 'cimentacion' 
                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                : 'border-slate-200 dark:border-white/5 bg-black/5 dark:bg-white/5'
            }`}>
              <div className="flex items-center space-x-2 text-emerald-500">
                <Layers className="w-5 h-5" />
                <h4 className="font-bold text-sm">1. Cimentación / Dados</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Losa plana o dados de concreto aislados con resistencia <strong>f'c ≥ 21 MPa (3000 PSI)</strong>. Nivelación precisa de apoyo con pernos de anclaje de 5/8".
              </p>
            </div>

            {/* Requisito 2: Conexión Eléctrica */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              openAccordion === 'electrica' 
                ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10' 
                : 'border-slate-200 dark:border-white/5 bg-black/5 dark:bg-white/5'
            }`}>
              <div className="flex items-center space-x-2 text-blue-500">
                <Zap className="w-5 h-5" />
                <h4 className="font-bold text-sm">2. Red Eléctrica (RETIE)</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Acometida bifásica o trifásica 110V/220V con barraje de polo a tierra independiente. Compatible con red pública o sistema solar.
              </p>
            </div>

            {/* Requisito 3: Hidrosanitaria */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              openAccordion === 'hidraulica' 
                ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-500/10' 
                : 'border-slate-200 dark:border-white/5 bg-black/5 dark:bg-white/5'
            }`}>
              <div className="flex items-center space-x-2 text-teal-500">
                <Droplet className="w-5 h-5" />
                <h4 className="font-bold text-sm">3. Agua & Desagüe</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Punto de agua potable de 1/2" con presión mínima de 25 PSI. Descarga de aguas negras de 4" hacia pozo séptico o red de alcantarillado.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Oficial ANCLA Special Projects */}
      <footer className={`mt-16 border-t py-8 text-center text-xs transition-colors ${
        themeMode === 'dark' ? 'border-white/10 bg-[#080c14] text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            ANCLA SPECIAL PROJECTS LATAM • Casas Modulares y Soluciones Arquitectónicas
          </p>
          <p className="text-[11px]">
            Showroom Principal: Avenida Centenario (frente a Pan y Miel), Armenia, Quindío • WhatsApp: +57 321 754 5654
          </p>
          <p className="text-[10px] text-slate-400 pt-2">
            © 2026 ANCLA Special Projects. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
