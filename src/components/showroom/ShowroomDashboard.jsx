import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import {
  Building,
  Search,
  Users,
  FileText,
  Printer,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  MessageCircle,
} from 'lucide-react';

const WhatsAppIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const isVipAttendee = (item) => {
  const notes = (item.notes || '').toLowerCase();
  return (
    notes.includes('vip') ||
    notes.includes('lista de espera') ||
    (item.client_type || '').includes('Empresa')
  );
};

const getShortNotes = (notes = '') => {
  let shortNotes = notes.replace(/\[Meta Ads Atribución\]:.*\n?/, '').trim();
  if (shortNotes.length > 60) {
    shortNotes = `${shortNotes.substring(0, 60)}...`;
  }
  return shortNotes;
};

const getWhatsAppUrl = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '#';
};

const getTelUrl = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `tel:+${digits}` : '#';
};

const touchBtnBase =
  'inline-flex items-center justify-center gap-2 font-bold rounded-xl border transition-all active:scale-[0.98] min-h-[48px] px-4 text-xs sm:text-sm';

export const ShowroomDashboard = () => {
  const [attendees, setAttendees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [day, setDay] = useState('all');
  const [modality, setModality] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [clientType, setClientType] = useState('all');
  const [hourRange, setHourRange] = useState('all');

  const [selectedItem, setSelectedItem] = useState(null);

  const chatStore = useChatStore();

  const handleOpenChat = (item) => {
    if (!item || !item.id) return;
    chatStore.setActiveTab('chats');
    chatStore.fetchMessages(item.id);
    setSelectedItem(null);
  };

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const API_URL =
    import.meta.env.VITE_API_URL ||
    (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
  const JSON_URL = `${API_URL.replace('/api/v1', '')}/showroom-citas-json`;

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const response = await fetch(JSON_URL);
      if (!response.ok) throw new Error('Error al obtener la información del showroom');
      const data = await response.json();
      setAttendees(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const searchVal = search.toLowerCase().trim();

    const res = attendees.filter((item) => {
      if (!item) return false;
      const matchesSearch =
        !searchVal ||
        (item.name || '').toLowerCase().includes(searchVal) ||
        String(item.phone || '').includes(searchVal) ||
        (item.city || '').toLowerCase().includes(searchVal) ||
        (item.notes || '').toLowerCase().includes(searchVal);

      const matchesDay = day === 'all' || (item.day || '').includes(day);
      const matchesModality =
        modality === 'all' || (item.modality || '').toLowerCase().includes(modality.toLowerCase());
      const matchesOrigin =
        origin === 'all' || (item.origin || '').toLowerCase().includes(origin.toLowerCase());
      const matchesType =
        clientType === 'all' ||
        (item.client_type || '').toLowerCase().includes(clientType.toLowerCase());

      let matchesHour = true;
      if (hourRange === 'mañana') {
        matchesHour = (item.hour_num || 0) < 12;
      } else if (hourRange === 'tarde') {
        matchesHour = (item.hour_num || 0) >= 12;
      }

      return matchesSearch && matchesDay && matchesModality && matchesOrigin && matchesType && matchesHour;
    });

    setFiltered(res);
  }, [search, day, modality, origin, clientType, hourRange, attendees]);

  const statTotal = filtered.length;
  const statPresencial = filtered.filter((x) => (x?.modality || '').includes('Presencial')).length;
  const statVirtual = filtered.filter((x) => (x?.modality || '').includes('Virtual')).length;
  const statLote = filtered.filter((x) => (x?.has_lote || '').includes('Sí')).length;

  const handlePrint = () => {
    window.print();
  };

  const renderStatusBadges = (item) => (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.reconfirmed && (
        <span
          className="bg-gold-500/15 border border-gold-500/30 text-gold-400 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 print:border-black print:text-black"
          title="Asistencia Confirmada"
        >
          <span>✓</span>
          <span>Confirmado</span>
        </span>
      )}
      {isVipAttendee(item) && (
        <span className="bg-gold-500/15 border border-gold-500/30 text-gold-400 font-bold px-2 py-1 rounded-lg text-[10px] print:border-black print:text-black">
          VIP
        </span>
      )}
    </div>
  );

  const renderAttendeeActions = (item, layout = 'row') => (
    <div className={`flex ${layout === 'stack' ? 'flex-col' : 'flex-wrap'} gap-2 print:hidden`}>
      <button
        type="button"
        onClick={() => setSelectedItem(item)}
        className={`${touchBtnBase} flex-1 bg-navy-800 hover:bg-navy-700 text-slate-100 border-navy-700`}
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span>Abrir Ficha</span>
      </button>
      <a
        href={getTelUrl(item.phone)}
        className={`${touchBtnBase} flex-1 bg-navy-900 hover:bg-navy-800 text-gold-400 border-gold-500/30`}
      >
        <Phone className="w-4 h-4 shrink-0" />
        <span>Llamar</span>
      </a>
      <a
        href={getWhatsAppUrl(item.phone)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${touchBtnBase} flex-1 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 border-gold-500/40 shadow-md shadow-gold-500/15`}
      >
        <WhatsAppIcon className="w-4 h-4 shrink-0" />
        <span>WhatsApp</span>
      </a>
    </div>
  );

  const inputClass =
    'bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm min-h-[48px] focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 print:bg-white print:text-black transition-colors duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-200 dark:border-navy-700 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-gold-500" />
            ANCLA Special Projects <span className="text-gold-500">Showroom</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Listado Interactivo y Fichas de Asistentes Confirmados (28 y 29 de Julio)
          </p>
        </div>
        <div className="flex items-center gap-2.5 mt-4 md:mt-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-3 rounded-xl bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 active:scale-95 transition-all shadow-sm min-h-[48px] min-w-[48px] flex items-center justify-center"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>
      </header>

      <div className="hidden print:block mb-6 border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold text-black">🏠 Reporte de Asistentes Showroom Armenia</h1>
        <p className="text-xs text-slate-600 mt-1">ANCLA Special Projects | Fecha de Evento: 28 y 29 de Julio de 2026</p>
        <p className="text-xs text-slate-600 font-bold mt-1">Registros Filtrados: {filtered.length} asistentes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
        {[
          { label: 'Total Filtrados', value: statTotal, suffix: 'contactos', accent: 'before:bg-gold-500' },
          { label: 'Presenciales Showroom', value: statPresencial, suffix: 'visitas', accent: 'before:bg-emerald-500' },
          { label: 'Asesorías Virtuales', value: statVirtual, suffix: 'llamadas', accent: 'before:bg-sky-500' },
          { label: 'Clientes con Lote', value: statLote, suffix: 'lotes', accent: 'before:bg-gold-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-lg before:absolute before:top-0 before:left-0 before:w-1 before:h-full ${stat.accent}`}
          >
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</h3>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 flex items-baseline gap-1">
              {stat.value}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-4 md:p-5 mb-6 shadow-sm dark:shadow-xl print:hidden transition-colors">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-gold-500" />
          <span>Filtros y Búsqueda Dinámica</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Buscador Cliente',
              node: (
                <input
                  type="text"
                  placeholder="Nombre, tel, notas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={inputClass}
                />
              ),
            },
            {
              label: 'Día',
              node: (
                <select value={day} onChange={(e) => setDay(e.target.value)} className={inputClass}>
                  <option value="all">Todos los días</option>
                  <option value="Martes 28 de Julio">Martes 28 de Julio</option>
                  <option value="Miércoles 29 de Julio">Miércoles 29 de Julio</option>
                </select>
              ),
            },
            {
              label: 'Modalidad',
              node: (
                <select value={modality} onChange={(e) => setModality(e.target.value)} className={inputClass}>
                  <option value="all">Todas las modalidades</option>
                  <option value="Presencial">Presencial (Showroom)</option>
                  <option value="Virtual">Virtual (Llamada/Meet)</option>
                </select>
              ),
            },
            {
              label: 'Origen Campaña',
              node: (
                <select value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass}>
                  <option value="all">Todos los orígenes</option>
                  <option value="Meta">Campaña Meta Ads</option>
                  <option value="Directa">Campaña Directa / Orgánico</option>
                </select>
              ),
            },
            {
              label: 'Perfil Cliente',
              node: (
                <select value={clientType} onChange={(e) => setClientType(e.target.value)} className={inputClass}>
                  <option value="all">Todos los perfiles</option>
                  <option value="Natural">Persona Natural</option>
                  <option value="Empresa">Empresario / Inversionista</option>
                </select>
              ),
            },
            {
              label: 'Jornada',
              node: (
                <select value={hourRange} onChange={(e) => setHourRange(e.target.value)} className={inputClass}>
                  <option value="all">Todas las horas</option>
                  <option value="mañana">Mañana (Antes 12 PM)</option>
                  <option value="tarde">Tarde (12 PM en adelante)</option>
                </select>
              ),
            },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {field.label}
              </label>
              {field.node}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl print:border-none print:shadow-none transition-colors">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-navy-700 flex justify-between items-center print:border-b-2 print:border-black print:px-0">
          <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-white print:text-black flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-500 print:hidden" />
            Asistentes al Evento
          </h2>
          <span className="bg-gold-500/15 border border-gold-500/30 text-gold-400 font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wider print:hidden">
            {filtered.length} REGISTROS ENCONTRADOS
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cargando asistentes en tiempo real...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 text-xs font-semibold">
            ⚠️ {error}
            <button
              type="button"
              onClick={fetchData}
              className="block mx-auto mt-4 text-gold-500 underline hover:text-gold-400 min-h-[48px]"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No se encontraron clientes confirmados con los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="lg:hidden p-4 space-y-4 max-h-[calc(100vh-290px)] overflow-y-auto pb-32 print:hidden">
              {filtered.map((item) => {
                const shortNotes = getShortNotes(item.notes);
                const vip = isVipAttendee(item);

                return (
                  <article
                    key={item.contact_id}
                    className={`rounded-2xl border p-4 shadow-sm ${
                      vip || item.reconfirmed
                        ? 'bg-navy-800/80 dark:bg-navy-800 border-gold-500/30'
                        : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-base">{item.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            ID #{item.contact_id} · {item.phone}
                          </p>
                        </div>
                        {renderStatusBadges(item)}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            item.day.includes('Martes')
                              ? 'bg-navy-900 border-navy-700 text-slate-200'
                              : 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                          }`}
                        >
                          {item.day.includes('Martes') ? 'Martes 28' : 'Miércoles 29'} · {item.time}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            item.modality.includes('Presencial')
                              ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                              : 'bg-navy-700/50 border-navy-700 text-slate-300'
                          }`}
                        >
                          {item.modality.includes('Presencial') ? 'Presencial' : 'Virtual'}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            item.has_lote.includes('Sí')
                              ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                              : 'bg-navy-900 border-navy-700 text-slate-400'
                          }`}
                        >
                          {item.has_lote.includes('Sí') ? 'Sí, Lote' : 'Buscando'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                          <span>{item.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                          <span>{item.client_type.includes('Empresa') ? 'Empresario' : 'Natural'}</span>
                        </div>
                      </div>

                      {shortNotes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{shortNotes}</p>
                      )}

                      {renderAttendeeActions(item, 'stack')}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-290px)] w-full table-scroll pb-32 print:block print:max-h-none print:overflow-visible">
              <table className="w-full border-collapse text-left print:table">
                <thead>
                  <tr className="print:border-b-2 print:border-black">
                    {[
                      'Cliente',
                      'Día / Hora',
                      'Modalidad',
                      'Campaña Origen',
                      'Perfil',
                      'Lote',
                      'Propósito / Ciudad',
                      'Acciones',
                    ].map((col) => (
                      <th
                        key={col}
                        className="bg-slate-50 dark:bg-navy-950/50 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-navy-700 print:text-black print:bg-transparent"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const shortNotes = getShortNotes(item.notes);

                    return (
                      <tr
                        key={item.contact_id}
                        className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors border-b border-slate-200 dark:border-navy-700/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-white text-sm print:text-black">{item.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600">
                              ID #{item.contact_id} | {item.phone}
                            </span>
                            {renderStatusBadges(item)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-block w-fit px-2 py-0.5 rounded text-[9px] font-bold border ${
                                item.day.includes('Martes')
                                  ? 'bg-navy-900 border-navy-700 text-slate-200'
                                  : 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                              } print:border-black print:text-black print:bg-transparent`}
                            >
                              {item.day.includes('Martes') ? 'Martes 28' : 'Miércoles 29'}
                            </span>
                            <span className="font-bold text-slate-700 dark:text-white text-xs print:text-black">{item.time}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              item.modality.includes('Presencial')
                                ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                                : 'bg-navy-700/50 border-navy-700 text-slate-300'
                            } print:border-black print:text-black print:bg-transparent`}
                          >
                            {item.modality.includes('Presencial') ? 'Presencial' : 'Virtual'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              item.origin.includes('Meta')
                                ? 'bg-sky-500/10 border-sky-500/25 text-sky-400'
                                : 'bg-navy-800 border-navy-700 text-slate-400'
                            } print:border-black print:text-black print:bg-transparent`}
                          >
                            {item.origin.includes('Meta') ? 'Form Meta Ads' : 'Directa / Orgánico'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              item.client_type.includes('Empresa')
                                ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                                : 'bg-navy-800 border-navy-700 text-slate-300'
                            } print:border-black print:text-black print:bg-transparent`}
                          >
                            {item.client_type.includes('Empresa') ? 'Empresario' : 'Natural'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              item.has_lote.includes('Sí')
                                ? 'bg-gold-500/15 border-gold-500/30 text-gold-400'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            } print:border-black print:text-black`}
                          >
                            {item.has_lote.includes('Sí') ? 'Sí, Lote' : 'Buscando'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-white text-xs print:text-black">{item.city}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 print:text-slate-600">{item.purpose}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 print:hidden">
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">{shortNotes || 'Sin notas.'}</span>
                            {renderAttendeeActions(item)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="h-16 print:hidden" />
          </>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[1000] p-0 sm:p-4 transition-all print:hidden">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Ficha Técnica de Cliente</h3>
                <div className="mt-1.5">{renderStatusBadges(selectedItem)}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl font-bold cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div className="border-b border-slate-200 dark:border-navy-700 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Información Básica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Nombre Completo</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Teléfono WhatsApp</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">+{selectedItem.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Correo Electrónico</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      {selectedItem.email}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Ciudad / Procedencia</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      {selectedItem.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-navy-700 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Detalles de Reserva</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Día de Visita</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.day}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Hora Agendada</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.time}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Modalidad Cita</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.modality}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Origen Tráfico</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.origin}</span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 dark:border-navy-700 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Perfil Comercial de Proyecto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Tipo de Lote</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.has_lote}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Propósito Comercial</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.purpose}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Perfil de Cliente</span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{selectedItem.client_type}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Notas Completas / Formulario</h4>
                <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 p-4 rounded-2xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedItem.notes || 'Sin notas adicionales.'}
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-5 py-4 border-t border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950/50 shrink-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <a
                  href={getTelUrl(selectedItem.phone)}
                  className={`${touchBtnBase} sm:min-w-[140px] bg-navy-800 hover:bg-navy-700 text-slate-100 border-navy-700`}
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>Llamar</span>
                </a>
                <a
                  href={getWhatsAppUrl(selectedItem.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${touchBtnBase} sm:min-w-[160px] bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 border-gold-500/40 shadow-md shadow-gold-500/15`}
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleOpenChat({ ...selectedItem, id: selectedItem.contact_id })}
                  className={`${touchBtnBase} sm:min-w-[200px] bg-navy-900 hover:bg-navy-800 text-gold-400 border-gold-500/30`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Abrir Chat en el CRM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .table-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(217, 119, 6, 0.35);
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 119, 6, 0.55);
        }
        .dark .table-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .dark .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.35);
        }
        .dark .table-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.55);
        }

        @media print {
          div.w-\\[64px\\],
          div.w-16,
          .print\\:hidden,
          button,
          header {
            display: none !important;
          }
          .flex-1 {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .table-scroll {
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>
    </div>
  );
};
