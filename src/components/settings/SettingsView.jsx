import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Bot, Key, Check, AlertCircle, Save, Upload, Trash2, FileText, Image as ImageIcon, Video, Plus, Sparkles, BookOpen, Mail, Calendar, Link, Unlink, UserPlus, Smartphone, Download, Share, X } from 'lucide-react';

export const SettingsView = () => {
  const { 
    chatbotPrompt, 
    geminiApiKey, 
    documents,
    quickReplies,
    hasPdfTemplate,
    pdfTemplateFilename,
    googleClientId,
    googleClientSecret,
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpPassword,
    smtpSenderEmail,
    smtpSenderName,
    googleConnected,
    googleExpiry,
    fetchChatbotSettings, 
    saveChatbotSettings, 
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    fetchQuickReplies,
    saveQuickReplies,
    fetchPdfTemplateStatus,
    uploadPdfTemplate,
    uploadWhatsappProfilePhoto,
    fetchGoogleClientSettings,
    saveGoogleClientSettings,
    fetchGoogleAuthStatus,
    disconnectGoogle,
    fetchSmtpSettings,
    saveSmtpSettings,
    testSmtpConnection,
    loading, 
    error, 
    success 
  } = useSettingsStore();
  
  const [localPrompt, setLocalPrompt] = useState('');
  const [localApiKey, setLocalApiKey] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [templateUploading, setTemplateUploading] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState('');
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profilePhotoSuccess, setProfilePhotoSuccess] = useState('');
  const [profilePhotoError, setProfilePhotoError] = useState('');

  // Estados para Invitación de Asesores (RBAC)
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('asesor');
  const [generatedLink, setGeneratedLink] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [showPwaModal, setShowPwaModal] = useState(false);

  const handleInstallPwa = async () => {
    if (window.__deferredPrompt) {
      window.__deferredPrompt.prompt();
      const { outcome } = await window.__deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.__deferredPrompt = null;
      }
    } else {
      setShowPwaModal(true);
    }
  };

  const handleGenerateInvitation = async (e) => {
    if (e) e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    setGeneratedLink('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'}/auth/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole })
      });
      const data = await res.json();
      if (res.ok) {
        const registerUrl = `${window.location.origin}/register?token=${data.token}`;
        setGeneratedLink(registerUrl);
        setInviteSuccess("¡Enlace de registro generado con éxito! Expira en 24 horas.");
        setInviteEmail('');
      } else {
        setInviteError(data.detail || "Error al generar la invitación.");
      }
    } catch (err) {
      console.error(err);
      setInviteError("Error de conexión al servidor.");
    } finally {
      setInviting(false);
    }
  };

  // Estados del recortador de imágenes (Canvas Cropper)
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [originalFile, setOriginalFile] = useState(null);

  // Estados locales para Google Client ID/Secret y SMTP
  const [localGoogleClientId, setLocalGoogleClientId] = useState('');
  const [localGoogleClientSecret, setLocalGoogleClientSecret] = useState('');
  
  const [localSmtpHost, setLocalSmtpHost] = useState('');
  const [localSmtpPort, setLocalSmtpPort] = useState('587');
  const [localSmtpUsername, setLocalSmtpUsername] = useState('');
  const [localSmtpPassword, setLocalSmtpPassword] = useState('');
  const [localSmtpSenderEmail, setLocalSmtpSenderEmail] = useState('');
  const [localSmtpSenderName, setLocalSmtpSenderName] = useState('');
  
  const [testEmailDestination, setTestEmailDestination] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestSuccess, setSmtpTestSuccess] = useState('');
  const [smtpTestError, setSmtpTestError] = useState('');
  const [googleStatusMsg, setGoogleStatusMsg] = useState('');

  // Estado local para administrar respuestas rápidas
  const [localQuickReplies, setLocalQuickReplies] = useState([]);

  useEffect(() => {
    fetchChatbotSettings();
    fetchDocuments();
    fetchQuickReplies();
    fetchPdfTemplateStatus();
    fetchGoogleClientSettings();
    fetchGoogleAuthStatus();
    fetchSmtpSettings();

    // Comprobar parámetros de retorno de Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    const oauthCode = params.get('code');
    const oauthState = params.get('state');

    if (oauthCode && oauthState) {
      setGoogleStatusMsg('Vinculando cuenta de Google...');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://ancla-crm-backend-production.up.railway.app/api/v1';
      fetch(`${apiUrl}/google-auth/exchange-code?code=${encodeURIComponent(oauthCode)}&state=${encodeURIComponent(oauthState)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setGoogleStatusMsg('¡Cuenta de Google conectada exitosamente!');
            fetchGoogleAuthStatus();
          } else {
            setGoogleStatusMsg(`Error al conectar: ${data.message || 'Fallo de autenticación'}`);
          }
          window.history.replaceState({}, document.title, '/settings');
          setTimeout(() => setGoogleStatusMsg(''), 6000);
        })
        .catch(err => {
          setGoogleStatusMsg('Error de comunicación con el servidor.');
          window.history.replaceState({}, document.title, '/settings');
          setTimeout(() => setGoogleStatusMsg(''), 6000);
        });
    } else if (params.get('google_auth') === 'success') {
      setGoogleStatusMsg('¡Cuenta de Google conectada exitosamente!');
      window.history.replaceState({}, document.title, '/settings');
      setTimeout(() => setGoogleStatusMsg(''), 5000);
    } else if (params.get('google_auth') === 'error') {
      const err = params.get('error_msg') || 'Error desconocido';
      setGoogleStatusMsg(`Error al conectar con Google: ${err}`);
      window.history.replaceState({}, document.title, '/settings');
      setTimeout(() => setGoogleStatusMsg(''), 7000);
    }
  }, []);

  // Sincronizar el estado local con el store de Zustand al cargar
  useEffect(() => {
    setLocalPrompt(chatbotPrompt);
    setLocalApiKey(geminiApiKey);
  }, [chatbotPrompt, geminiApiKey]);

  useEffect(() => {
    setLocalGoogleClientId(googleClientId);
    setLocalGoogleClientSecret(googleClientSecret);
  }, [googleClientId, googleClientSecret]);

  useEffect(() => {
    setLocalSmtpHost(smtpHost);
    setLocalSmtpPort(smtpPort);
    setLocalSmtpUsername(smtpUsername);
    setLocalSmtpPassword(smtpPassword);
    setLocalSmtpSenderEmail(smtpSenderEmail);
    setLocalSmtpSenderName(smtpSenderName);
  }, [smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSenderEmail, smtpSenderName]);

  useEffect(() => {
    if (quickReplies) {
      setLocalQuickReplies(quickReplies);
    }
  }, [quickReplies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveChatbotSettings(localPrompt, localApiKey);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const res = await uploadDocument(file);
    setUploading(false);

    if (res && res.status === 'success') {
      setUploadSuccess(`¡Archivo '${file.name}' analizado y guardado con éxito!`);
      fetchDocuments(); // Recargar lista
      setTimeout(() => setUploadSuccess(''), 3000);
    }
  };

  // Manejadores para el paneo y zoom de imagen (Cropper)
  const handleCropperMouseDown = (e) => {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleCropperMouseMove = (e) => {
    if (!isPanning) return;
    setPanX(e.clientX - panStart.x);
    setPanY(e.clientY - panStart.y);
  };

  const handleCropperMouseUp = () => {
    setIsPanning(false);
  };

  const handleCropperTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsPanning(true);
    setPanStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
  };

  const handleCropperTouchMove = (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - panStart.x);
    setPanY(e.touches[0].clientY - panStart.y);
  };

  const handleCropSave = () => {
    if (!originalFile || !cropImageSrc) return;

    const img = new Image();
    img.src = cropImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 640; // Tamaño estándar para foto de perfil de Meta/WhatsApp
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Limpiar fondo a blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Math de mapeo de escala de previsualización 300px a canvas 640px
      const baseScale = Math.min(300 / img.width, 300 / img.height);
      const factor = size / 300;

      const drawWidth = img.width * baseScale * cropZoom * factor;
      const drawHeight = img.height * baseScale * cropZoom * factor;

      const drawX = (size - drawWidth) / 2 + (panX * factor);
      const drawY = (size - drawHeight) / 2 + (panY * factor);

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], originalFile.name, { type: 'image/jpeg' });
        
        setProfilePhotoUploading(true);
        setProfilePhotoSuccess('');
        setProfilePhotoError('');
        setShowCropper(false);

        const res = await uploadWhatsappProfilePhoto(croppedFile);
        setProfilePhotoUploading(false);

        if (res && res.status === 'success') {
          setProfilePhotoSuccess("¡Foto de perfil oficial actualizada con éxito en WhatsApp!");
          setTimeout(() => setProfilePhotoSuccess(''), 5000);
        } else {
          setProfilePhotoError("No se pudo actualizar la foto de perfil en Meta.");
          setTimeout(() => setProfilePhotoError(''), 5000);
        }
      }, 'image/jpeg', 0.9);
    };
  };

  const handleAddQuickReply = () => {
    const newId = localQuickReplies.length > 0 ? Math.max(...localQuickReplies.map(r => r.id)) + 1 : 1;
    setLocalQuickReplies([
      ...localQuickReplies,
      { id: newId, title: 'Nueva Plantilla', content: 'Escribe el mensaje aquí...' }
    ]);
  };

  const handleUpdateQuickReply = (id, field, value) => {
    setLocalQuickReplies(prev => 
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
  };

  const handleDeleteQuickReply = (id) => {
    setLocalQuickReplies(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveQuickReplies = async () => {
    await saveQuickReplies(localQuickReplies);
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'Imagen') return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (fileType === 'Audio/Video') return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-dark-950 overflow-hidden transition-colors duration-300">
      {/* Cabecera */}
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-dark-900/90 backdrop-blur-md flex items-center justify-between glass">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ajustes del Sistema</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configura las reglas de entrenamiento del chatbot de IA, los parámetros de la API y las plantillas.</p>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Tarjeta de Instalación PWA en Dispositivo Móvil / Escritorio */}
          <div className="bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span>Instalar App en tu Dispositivo</span>
                  <span className="text-[10px] bg-emerald-500 text-white font-mono px-2 py-0.2 rounded-full font-bold">PWA</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Ejecuta el CRM a pantalla completa como una App nativa en tu iPhone, iPad, Android, Windows o Mac.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallPwa}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>📱 Instalar App en Inicio</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tarjeta de entrenamiento de la IA */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Entrenamiento de la IA (Chatbot)</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Instrucciones de comportamiento, FAQs, catálogo y reglas de negocio del chatbot.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Prompt del Sistema / Instrucciones Personalizadas
                </label>
                <textarea
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  placeholder="Ej: Somos una consultoría de marketing. Ofrecemos auditoría gratis. La llamada dura 15 min. No atendemos los fines de semana. Precios desde $99..."
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 min-h-[140px] transition-colors"
                  required
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                  Cualquier detalle sobre tus servicios, horarios, precios o políticas que ingreses aquí será leído por la IA para contestar preguntas por WhatsApp.
                </span>
              </div>
            </div>

            {/* Tarjeta de llaves de API */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Credenciales de la IA de Google</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Llave de API secreta de Google Gemini para motorizar las respuestas de la IA.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs">
                <Check className="w-4 h-4" />
                <span>¡Configuración y entrenamiento de Google Gemini guardados con éxito!</span>
              </div>
            )}

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3 px-6 rounded-xl shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading && !uploading ? 'Guardando...' : 'Guardar Entrenamiento'}</span>
              </button>
            </div>

          </form>

          {/* NUEVA SECCIÓN: RESPUESTAS RÁPIDAS (PLANTILLAS) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Respuestas Rápidas (Plantillas de Mensaje)</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Define las plantillas de texto permitidas para que tus asesores las inyecten con 1 solo clic en el chat.</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAddQuickReply}
                className="text-xs text-blue-600 dark:text-sky-400 hover:text-blue-500 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir plantilla</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {localQuickReplies.map((reply) => (
                <div 
                  key={reply.id} 
                  className="p-4 rounded-xl border border-slate-150 dark:border-white/5 bg-slate-50 dark:bg-dark-950/20 flex items-start space-x-3 animate-fade-in"
                >
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Título de la plantilla (ej: Ficha FLEX HOME)"
                      value={reply.title}
                      onChange={(e) => handleUpdateQuickReply(reply.id, 'title', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none"
                    />
                    <textarea
                      placeholder="Texto de la plantilla..."
                      value={reply.content}
                      onChange={(e) => handleUpdateQuickReply(reply.id, 'content', e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 min-h-[60px] focus:outline-none"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteQuickReply(reply.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-150 dark:hover:bg-white/5 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveQuickReplies}
                className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Plantillas</span>
              </button>
            </div>
          </div>

          {/* BASE DE CONOCIMIENTO MULTIMODAL (RAG) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Base de Conocimiento de Google RAG</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Sube PDFs, catálogos en Imagen, audios o videos para que Gemini los analice y aprenda.</p>
                </div>
              </div>
            </div>

            {/* Selector de Archivos (Drag & Drop UI) */}
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/20 relative group hover:border-emerald-500/50 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.mp3,.mp4,.wav,.m4a"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 mb-2 transition-colors" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {uploading ? 'Procesando y extrayendo texto con la visión de Google Gemini...' : 'Haz clic o arrastra un archivo aquí'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Soporta PDF, PNG, JPG, TXT, MP3, MP4 (Max 15MB)
              </p>
            </div>

            {/* Mensaje de éxito de subida */}
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs">
                <Check className="w-4 h-4" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Listado de Documentos subidos */}
            <div className="space-y-2 mt-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Archivos de Conocimiento Activos</h4>
              
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-950/10 rounded-xl">
                  No hay archivos subidos aún. Sube tu primer archivo para empezar a entrenar al super agente con Google.
                </p>
              ) : (
                <div className="grid gap-2">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5 animate-fade-in"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-4">
                            {doc.filename}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            Tipo: {doc.file_type} • Subido el {new Date(doc.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex-shrink-0"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NUEVA TARJETA: PLANTILLA DE HOJA MEMBRETADA PDF (AISLADA DE LA IA) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Plantilla de Hoja Membretada PDF (Propuestas)</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Sube el PDF corporativo oficial de ANCLA para usar de fondo y membrete en las propuestas de la IA.</p>
              </div>
            </div>

            {/* Selector de Archivo Exclusivo */}
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/20 relative group hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setTemplateUploading(true);
                  const res = await uploadPdfTemplate(file);
                  setTemplateUploading(false);
                  if (res && res.status === 'success') {
                    setTemplateSuccess("¡Hoja membretada corporativa subida con éxito!");
                    setTimeout(() => setTemplateSuccess(""), 4000);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={templateUploading}
              />
              <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 mb-2 transition-colors" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {templateUploading ? 'Subiendo y configurando membrete...' : 'Haz clic o arrastra tu PDF membretado corporativo'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Soporta archivos en formato PDF (.pdf)
              </p>
            </div>

            {templateSuccess && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-sky-400 text-xs font-bold flex items-center space-x-1.5 animate-bounce">
                <Check className="w-4 h-4" />
                <span>{templateSuccess}</span>
              </div>
            )}

            {/* Estado de la plantilla activa */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Estado del Membrete</h4>
              {hasPdfTemplate ? (
                <div className="flex items-center justify-between p-3 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/20 animate-fade-in">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                    <span className="text-xs font-bold text-blue-600 dark:text-sky-400">
                      {pdfTemplateFilename || 'proposal_template.pdf'} (Activo)
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                    Listo para fusionar
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-950/10 rounded-xl">
                  No hay hoja membretada activa. Las propuestas se generarán en un PDF corporativo estándar en blanco.
                </p>
              )}
            </div>
          </div>

          {/* Tarjeta de foto de perfil comercial de WhatsApp */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Foto de Perfil Comercial de WhatsApp</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Sube una nueva foto de perfil oficial para que la vean tus clientes en WhatsApp.</p>
              </div>
            </div>

            {/* Selector de Archivo de Foto de Perfil */}
            <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/20 relative group hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setOriginalFile(file);
                  
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropImageSrc(reader.result);
                    setCropZoom(1);
                    setPanX(0);
                    setPanY(0);
                    setShowCropper(true);
                  };
                  reader.readAsDataURL(file);
                  
                  // Limpiar input file para que permita re-subir el mismo archivo
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={profilePhotoUploading}
              />
              <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 mb-2 transition-colors" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {profilePhotoUploading ? 'Subiendo y actualizando foto oficial en Meta...' : 'Haz clic o arrastra tu foto de perfil aquí'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Formatos soportados: PNG, JPG, JPEG (Max 5MB)
              </p>
            </div>

            {profilePhotoSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>{profilePhotoSuccess}</span>
              </div>
            )}

            {profilePhotoError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center space-x-1.5 animate-fade-in">
                <AlertCircle className="w-4 h-4" />
                <span>{profilePhotoError}</span>
              </div>
            )}
          </div>

          {/* NUEVA TARJETA: CREDENCIALES DE GOOGLE OAUTH (ADMINISTRACIÓN GLOBAL) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Credenciales Globales de Google App (OAuth)</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Configura el Client ID y Client Secret globales de la app en Google Cloud Console.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={localGoogleClientId}
                  onChange={(e) => setLocalGoogleClientId(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  value={localGoogleClientSecret}
                  onChange={(e) => setLocalGoogleClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={async () => {
                  await saveGoogleClientSettings(localGoogleClientId, localGoogleClientSecret);
                }}
                className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Credenciales Google</span>
              </button>
            </div>
          </div>

          {/* NUEVA TARJETA: VINCULACIÓN INDIVIDUAL GOOGLE OAUTH2 (ASESORES) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Tu Cuenta de Google (Calendario & Drive)</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Sincroniza tus agendamientos de citas comerciales y subida de reportes con tu cuenta real de Google.</p>
              </div>
            </div>

            {googleStatusMsg && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 font-semibold ${googleStatusMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                {googleStatusMsg.startsWith('Error') ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>{googleStatusMsg}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-dark-950/20 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full ${googleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {googleConnected ? 'Estado: Conectado a Google Workspace' : 'Estado: Desconectado de Google'}
                  </span>
                  {googleConnected && googleExpiry && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Token expira: {new Date(googleExpiry).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>
              </div>

              {googleConnected ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('¿Estás seguro que deseas desconectar tu cuenta de Google?')) {
                      await disconnectGoogle();
                    }
                  }}
                  className="flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 px-3.5 py-2 rounded-xl transition-all font-semibold border border-transparent hover:border-red-500/10"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                      const apiUrl = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8001/api/v1' : 'https://ancla-crm-backend-production.up.railway.app/api/v1');
                      const res = await fetch(`${apiUrl}/google-auth/authorize`, {
                        headers: {
                          'Authorization': `Bearer ${useAuthStore.getState().token}`
                        }
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.detail || 'Fallo al iniciar autorización');
                      }
                      const data = await res.json();
                      const targetUrl = data.authorization_url || data.url;
                      if (targetUrl) {
                        window.location.href = targetUrl;
                      } else {
                        throw new Error('No se recibió la URL de autorización de Google.');
                      }
                    } catch (err) {
                      setGoogleStatusMsg(`Error: ${err.message}`);
                      alert(`Error: ${err.message}`);
                    }
                  }}
                  className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white px-4 py-2 rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Conectar Cuenta de Google</span>
                </button>
              )}
            </div>
          </div>

          {/* NUEVA TARJETA: SERVIDOR DE CORREO SMTP */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Configuración de Servidor de Correo SMTP</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Configure los datos de su servidor de correo para despachar las propuestas comerciales en PDF por email.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Servidor SMTP Host
                </label>
                <input
                  type="text"
                  value={localSmtpHost}
                  onChange={(e) => setLocalSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Puerto SMTP
                </label>
                <input
                  type="text"
                  value={localSmtpPort}
                  onChange={(e) => setLocalSmtpPort(e.target.value)}
                  placeholder="587 o 465"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Usuario SMTP
                </label>
                <input
                  type="text"
                  value={localSmtpUsername}
                  onChange={(e) => setLocalSmtpUsername(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Contraseña SMTP (o App Password)
                </label>
                <input
                  type="password"
                  value={localSmtpPassword}
                  onChange={(e) => setLocalSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email de Remitente
                </label>
                <input
                  type="email"
                  value={localSmtpSenderEmail}
                  onChange={(e) => setLocalSmtpSenderEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Nombre de Remitente
                </label>
                <input
                  type="text"
                  value={localSmtpSenderName}
                  onChange={(e) => setLocalSmtpSenderName(e.target.value)}
                  placeholder="ANCLA Special Projects"
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={async () => {
                  await saveSmtpSettings({
                    host: localSmtpHost,
                    port: localSmtpPort,
                    username: localSmtpUsername,
                    password: localSmtpPassword,
                    sender_email: localSmtpSenderEmail,
                    sender_name: localSmtpSenderName
                  });
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold py-2 px-5 rounded-xl shadow-md text-xs active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Configuración SMTP</span>
              </button>
            </div>

            {/* SECCIÓN INTERNA: PROBAR CONEXIÓN SMTP */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Probar Envío de Correo</h4>
              
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={testEmailDestination}
                  onChange={(e) => setTestEmailDestination(e.target.value)}
                  placeholder="correo-prueba@destinatario.com"
                  className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500/50"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!testEmailDestination) {
                      alert("Por favor ingrese un correo de destino.");
                      return;
                    }
                    setSmtpTesting(true);
                    setSmtpTestSuccess('');
                    setSmtpTestError('');
                    const ok = await testSmtpConnection(testEmailDestination);
                    setSmtpTesting(false);
                    if (ok) {
                      setSmtpTestSuccess("¡Correo de prueba despachado con éxito! Revisa tu bandeja de entrada.");
                      setTimeout(() => setSmtpTestSuccess(''), 6000);
                    } else {
                      setSmtpTestError("Error al enviar correo de prueba. Verifique sus datos y credenciales SMTP.");
                      setTimeout(() => setSmtpTestError(''), 6000);
                    }
                  }}
                  disabled={smtpTesting}
                  className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 transition-all flex items-center space-x-1.5"
                >
                  {smtpTesting ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Probar Envío</span>
                  )}
                </button>
              </div>

              {smtpTestSuccess && (
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>{smtpTestSuccess}</span>
                </div>
              )}

              {smtpTestError && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-1.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{smtpTestError}</span>
                </div>
              )}
            </div>
          </div>

          {/* GESTIÓN DE INVITACIONES (Solo visible para administrador) */}
          {useAuthStore.getState().user?.role === 'admin' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-slate-800 dark:text-white mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Invitar Nuevos Asesores (RBAC)</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Genera un enlace de registro seguro para invitar asesores o administradores a unirse a la plataforma.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerateInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Correo Electrónico del Invitado
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ejemplo@anclaspecialprojects.com"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Rol Asignado
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                  >
                    <option value="asesor">Asesor Comercial</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full flex items-center justify-center space-x-1.5 text-xs bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white py-3 px-4 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {inviting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Generar Enlace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {inviteSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1.5">
                  <Check className="w-4 h-4" />
                  <span>{inviteSuccess}</span>
                </div>
              )}

              {inviteError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{inviteError}</span>
                </div>
              )}

              {generatedLink && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-2">
                  <label className="block text-[10px] text-purple-600 dark:text-purple-400 uppercase font-black tracking-wider">
                    Enlace de Registro Exclusivo:
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      onClick={(e) => e.target.select()}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        alert("¡Enlace copiado al portapapeles!");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      Copiar Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal de Recorte de Imagen (Canvas Cropper) */}
          {showCropper && (
            <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="w-full max-w-md bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Ajustar Foto de Perfil</h3>
                  <button
                    onClick={() => setShowCropper(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contenedor del Preview con Máscara Circular */}
                <div 
                  onMouseDown={handleCropperMouseDown}
                  onMouseMove={handleCropperMouseMove}
                  onMouseUp={handleCropperMouseUp}
                  onMouseLeave={handleCropperMouseUp}
                  onTouchStart={handleCropperTouchStart}
                  onTouchMove={handleCropperTouchMove}
                  onTouchEnd={handleCropperMouseUp}
                  className="w-[300px] h-[300px] bg-slate-950 overflow-hidden relative rounded-2xl cursor-grab active:cursor-grabbing border border-slate-200 dark:border-white/10 select-none"
                >
                  <img
                    src={cropImageSrc}
                    alt="Previsualización de recorte"
                    className="absolute max-w-none origin-center"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${cropZoom})`,
                      maxHeight: '300px',
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* Máscara de recortado de WhatsApp (Circular) */}
                  <div className="absolute inset-0 rounded-full border-[40px] border-slate-950/60 pointer-events-none"></div>
                  <div className="absolute inset-0 border-2 border-dashed border-emerald-500/80 rounded-full pointer-events-none"></div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3.5 text-center">
                  Arrastra la foto para encuadrar. Usa la barra de abajo para hacer zoom.
                </p>

                {/* Control de Zoom */}
                <div className="w-full mt-4 flex items-center space-x-3">
                  <span className="text-[10px] font-bold text-slate-400">1x</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 bg-slate-100 dark:bg-slate-800 rounded-lg h-1.5 cursor-pointer focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400">3x</span>
                </div>

                {/* Acciones */}
                <div className="w-full flex space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={handleCropSave}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
                  >
                    Recortar y Guardar
                  </button>
                    <button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-all active:scale-[0.98]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Modal Guía para Instalar PWA Manualmente */}
          {showPwaModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
              <div className="bg-[#111b27] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-white text-center">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Instalar App en tu Celular</h3>
                  </div>
                  <button onClick={() => setShowPwaModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Para instalar la app oficial en tu dispositivo y usarla a pantalla completa:
                </p>

                <div className="p-3.5 bg-black/40 rounded-2xl border border-white/5 space-y-3 text-left text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">📱 En iPhone / iPad (Safari):</span>
                    <p className="text-slate-300 text-[11px]">
                      Toca el botón <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Compartir</strong> y luego pulsa <strong>"Agregar al inicio"</strong>.
                    </p>
                  </div>
                  <div className="border-t border-white/5 pt-2">
                    <span className="font-bold text-emerald-400 block mb-1">🤖 En Android / Chrome:</span>
                    <p className="text-slate-300 text-[11px]">
                      Toca los 3 puntos (⋮) en la esquina superior y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPwaModal(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
