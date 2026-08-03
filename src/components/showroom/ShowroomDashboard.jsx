import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { 
  Building, 
  Search, 
  Calendar as CalendarIcon, 
  Users, 
  FileText, 
  Printer, 
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export const ShowroomDashboard = () => {
  const [attendees, setAttendees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [day, setDay] = useState('all');
  const [modality, setModality] = useState('all');
  const [origin, setOrigin] = useState('all');
  const [clientType, setClientType] = useState('all');
  const [hourRange, setHourRange] = useState('all');

  // Modal de Ficha Técnica
  const [selectedItem, setSelectedItem] = useState(null);

  const chatStore = useChatStore();

  const handleOpenChat = (item) => {
    if (!item || !item.id) return;
    chatStore.setActiveTab('chats');
    chatStore.fetchMessages(item.id);
    setSelectedItem(null);
  };

  // Obtener URL de la API del archivo de configuración
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
  const JSON_URL = API_URL.replace('/api/v1', '') + '/showroom-citas-json';

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
    // Auto-actualizar silenciosamente cada 30 segundos sin parpadeos en pantalla
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Efecto de filtrado reactivo
  useEffect(() => {
    const searchVal = search.toLowerCase().trim();
    
    const res = attendees.filter(item => {
      const matchesSearch = !searchVal || 
        item.name.toLowerCase().includes(searchVal) ||
        item.phone.includes(searchVal) ||
        item.city.toLowerCase().includes(searchVal) ||
        item.notes.toLowerCase().includes(searchVal);
        
      const matchesDay = day === 'all' || (item.day || '').includes(day);
      const matchesModality = modality === 'all' || (item.modality || '').toLowerCase().includes(modality.toLowerCase());
      const matchesOrigin = origin === 'all' || (item.origin || '').toLowerCase().includes(origin.toLowerCase());
      const matchesType = clientType === 'all' || (item.client_type || '').toLowerCase().includes(clientType.toLowerCase());
      
      let matchesHour = true;
      if (hourRange === 'mañana') {
        matchesHour = item.hour_num < 12;
      } else if (hourRange === 'tarde') {
        matchesHour = item.hour_num >= 12;
      }
      
      return matchesSearch && matchesDay && matchesModality && matchesOrigin && matchesType && matchesHour;
    });
    
    setFiltered(res);
  }, [search, day, modality, origin, clientType, hourRange, attendees]);

  // Estadísticas
  const statTotal = filtered.length;
  const statPresencial = filtered.filter(x => x.modality.includes('Presencial')).length;
  const statVirtual = filtered.filter(x => x.modality.includes('Virtual')).length;
  const statLote = filtered.filter(x => x.has_lote.includes('Sí')).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-4 md:p-6 print:bg-white print:text-black transition-colors duration-300">
      
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ANCLA Special Projects <span className="text-purple-600 dark:text-purple-400">Showroom</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Listado Interactivo y Fichas de Asistentes Confirmados (28 y 29 de Julio)
          </p>
        </div>
        <div className="flex items-center gap-2.5 mt-4 md:mt-0">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 border border-slate-250 dark:border-slate-700 active:scale-95 transition-all shadow-sm"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-red-600/10 hover:shadow-red-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar Reporte PDF</span>
          </button>
        </div>
      </header>

      {/* Titulo para Versión de Impresión / PDF */}
      <div className="hidden print:block mb-6 border-b-2 border-black pb-3">
        <h1 className="text-2xl font-bold text-black">🏠 Reporte de Asistentes Showroom Armenia</h1>
        <p className="text-xs text-slate-600 mt-1">ANCLA Special Projects | Fecha de Evento: 28 y 29 de Julio de 2026</p>
        <p className="text-xs text-slate-600 font-bold mt-1">Registros Filtrados: {filtered.length} asistentes</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-columns-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-lg before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-blue-500">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Filtrados</h3>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 flex items-baseline gap-1">
            {statTotal} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">contactos</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-lg before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-emerald-500">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Presenciales Showroom</h3>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 flex items-baseline gap-1">
            {statPresencial} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">visitas</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-lg before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-purple-500">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asesorías Virtuales</h3>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 flex items-baseline gap-1">
            {statVirtual} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">llamadas</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-lg before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-amber-500">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clientes con Lote</h3>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-2 flex items-baseline gap-1">
            {statLote} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">lotes</span>
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 mb-6 shadow-sm dark:shadow-xl print:hidden transition-colors">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Filtros y Búsqueda Dinámica</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buscador Cliente</label>
            <input 
              type="text" 
              placeholder="Nombre, tel, notas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Día</label>
            <select 
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Todos los días</option>
              <option value="Martes 28 de Julio">Martes 28 de Julio</option>
              <option value="Miércoles 29 de Julio">Miércoles 29 de Julio</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modalidad</label>
            <select 
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Todas las modalidades</option>
              <option value="Presencial">Presencial (Showroom)</option>
              <option value="Virtual">Virtual (Llamada/Meet)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Origen Campaña</label>
            <select 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Todos los orígenes</option>
              <option value="Meta">Campaña Meta Ads</option>
              <option value="Directa">Campaña Directa / Orgánico</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perfil Cliente</label>
            <select 
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Todos los perfiles</option>
              <option value="Natural">Persona Natural</option>
              <option value="Empresa">Empresario / Inversionista</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jornada</label>
            <select 
              value={hourRange}
              onChange={(e) => setHourRange(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Todas las horas</option>
              <option value="mañana">Mañana (Antes 12 PM)</option>
              <option value="tarde">Tarde (12 PM en adelante)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenedor de Listado */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl print:border-none print:shadow-none transition-colors">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center print:border-b-2 print:border-black print:px-0">
          <h2 className="text-sm md:text-base font-bold text-slate-850 dark:text-white print:text-black">Asistentes al Evento</h2>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider print:hidden">
            {filtered.length} REGISTROS ENCONTRADOS
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cargando asistentes en tiempo real...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 text-xs font-semibold">
            ⚠️ {error}
            <button onClick={fetchData} className="block mx-auto mt-4 text-purple-650 dark:text-purple-400 underline hover:text-purple-500">Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No se encontraron clientes confirmados con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-290px)] w-full table-scroll pb-32">
            <table className="w-full border-collapse text-left print:table">
              <thead>
                <tr className="print:border-b-2 print:border-black">
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Cliente</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Día / Hora</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Modalidad</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Campaña Origen</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Perfil</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Lote</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black">Propósito / Ciudad</th>
                  <th className="bg-slate-50 dark:bg-black/10 px-5 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 print:text-black print:hidden">Ficha Calificación</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  let shortNotes = item.notes.replace(/\[Meta Ads Atribución\]:.*\n?/, '').trim();
                  if (shortNotes.length > 60) {
                    shortNotes = shortNotes.substring(0, 60) + '...';
                  }

                  return (
                    <tr 
                      key={item.contact_id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-200 dark:border-slate-800/70 md:table-row flex flex-col md:flex-row p-4 md:p-0 mb-4 md:mb-0 border md:border-none rounded-2xl md:rounded-none bg-white/40 dark:bg-slate-800/40 md:bg-transparent shadow-sm md:shadow-none"
                    >
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Cliente">
                        <div className="flex flex-col text-right md:text-left">
                          <span className="font-bold text-slate-800 dark:text-white text-sm print:text-black">{item.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 print:text-slate-600">ID #{item.contact_id} | {item.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Día / Hora">
                        <div className="flex flex-col text-right md:text-left items-end md:items-start">
                          <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.day.includes('Martes') 
                                ? 'bg-slate-200 dark:bg-slate-900 border border-slate-350 dark:border-slate-700 text-slate-700 dark:text-white' 
                                : 'bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-750 dark:text-purple-200'
                            } print:border-black print:text-black print:bg-transparent`}>
                              {item.day.includes('Martes') ? 'Martes 28' : 'Miércoles 29'}
                            </span>
                            {item.reconfirmed && (
                              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[8px] flex items-center gap-0.5 shadow-sm print:border-black print:text-black" title="Asistencia Reconfirmada">
                                <span>✅</span>
                                <span>Reconfirmado</span>
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-750 dark:text-white text-xs mt-1 print:text-black">{item.time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Modalidad">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.modality.includes('Presencial') 
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-650 dark:text-emerald-400' 
                            : 'bg-purple-500/10 border border-purple-500/25 text-purple-650 dark:text-purple-400'
                        } print:border-black print:text-black print:bg-transparent`}>
                          {item.modality.includes('Presencial') ? 'Presencial' : 'Virtual'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Origen">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.origin.includes('Meta') 
                            ? 'bg-blue-500/10 border border-blue-500/25 text-blue-650 dark:text-blue-400' 
                            : 'bg-slate-100 dark:bg-slate-700/50 border border-slate-250 dark:border-slate-650 text-slate-550 dark:text-slate-350'
                        } print:border-black print:text-black print:bg-transparent`}>
                          {item.origin.includes('Meta') ? 'Form Meta Ads' : 'Directa / Orgánico'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Perfil">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.client_type.includes('Empresa') 
                            ? 'bg-amber-500/10 border border-amber-500/25 text-amber-650 dark:text-amber-400' 
                            : 'bg-sky-500/10 border border-sky-500/25 text-sky-655 dark:text-sky-400'
                        } print:border-black print:text-black print:bg-transparent`}>
                          {item.client_type.includes('Empresa') ? 'Empresario' : 'Natural'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Lote">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          item.has_lote.includes('Sí') 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        } print:border-black print:text-black`}>
                          {item.has_lote.includes('Sí') ? 'Sí, Lote' : 'Buscando'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center border-b border-slate-100 dark:border-none" data-label="Ciudad">
                        <div className="flex flex-col text-right md:text-left">
                          <span className="font-bold text-slate-800 dark:text-white text-xs print:text-black">{item.city}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 print:text-slate-600">{item.purpose}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 md:table-cell flex justify-between items-center md:border-none print:hidden" data-label="Calificación">
                        <div className="flex flex-col items-end md:items-start gap-2">
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 text-right md:text-left">{shortNotes || 'Sin notas.'}</span>
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="bg-white hover:bg-slate-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-slate-700 dark:text-purple-400 border border-slate-300 dark:border-purple-500/20 font-bold py-1 px-2.5 rounded-lg text-[10px] active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            📄 Ver Ficha Completa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Espaciador inferior para permitir scroll de cortesía y evitar cortes */}
            <div className="h-16 print:hidden"></div>
          </div>
        )}
      </div>

      {/* MODAL EMERGENTE - FICHA COMPLETA */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 transition-all">
          <div className="bg-white dark:bg-[#151b26] border border-slate-200 dark:border-slate-750 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/10 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Ficha Técnica de Cliente</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
              
              {/* Información Básica */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">👤 Información Básica</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Nombre Completo</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Teléfono WhatsApp</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">+{selectedItem.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Correo Electrónico</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Ciudad / Procedencia</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.city}</span>
                  </div>
                </div>
              </div>

              {/* Reserva */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">🗓️ Detalles de Reserva</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Día de Visita</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.day}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Hora Agendada</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.time}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Modalidad Cita</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.modality}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Origen Tráfico</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.origin}</span>
                  </div>
                </div>
              </div>

              {/* Perfil Comercial */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">📊 Perfil Comercial de Proyecto</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Tipo de Lote</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.has_lote}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Propósito Comercial</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.purpose}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Perfil de Cliente</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{selectedItem.client_type}</span>
                  </div>
                </div>
              </div>

              {/* Notas del Formulario */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">📝 Notas Completas / Formulario</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-700 dark:text-slate-350 leading-relaxed white-space-pre-line">
                  {selectedItem.notes || 'Sin notas adicionales.'}
                </div>
              </div>

            </div>
            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/10 flex justify-end">
              <button 
                onClick={() => handleOpenChat(selectedItem)}
                className="flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black text-xs font-bold py-2 px-4 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer border-none"
              >
                <span>💬</span> Abrir Chat en el CRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales embebidos para impresión y responsividad manual */}
      <style>{`
        /* Personalización de barra de scroll para navegación sin rueda de mouse */
        .table-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 4px;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.4);
        }
        .dark .table-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .dark .table-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .table-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.35);
        }

        @media print {
          /* Ocultar sidebar principal del CRM de React */
          div.w-\\[64px\\], 
          div.w-16,
          .print\\:hidden,
          button,
          header {
            display: none !important;
          }
          /* Expandir contenedor principal al 100% de la hoja */
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
