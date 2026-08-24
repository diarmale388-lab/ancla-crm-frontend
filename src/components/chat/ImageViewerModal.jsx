import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const ImageViewerModal = ({ 
  currentUrl, 
  images = [], 
  onClose, 
  onNavigate 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentUrl]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUrl, images, zoom]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.35, 4.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.35, 0.6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDoubleClick = () => {
    if (zoom > 1) {
      handleReset();
    } else {
      setZoom(2.0);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePrev = () => {
    if (!images || images.length <= 1) return;
    const idx = images.indexOf(currentUrl);
    const prevIdx = idx > 0 ? idx - 1 : images.length - 1;
    if (onNavigate) onNavigate(images[prevIdx]);
  };

  const handleNext = () => {
    if (!images || images.length <= 1) return;
    const idx = images.indexOf(currentUrl);
    const nextIdx = idx < images.length - 1 ? idx + 1 : 0;
    if (onNavigate) onNavigate(images[nextIdx]);
  };

  if (!currentUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/90 backdrop-blur-md select-none animate-fade-in"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 text-white z-30">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-black tracking-wide text-slate-200 uppercase">
            Visualizador de Archivos
          </span>
          <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-gold-400 font-bold">
            {Math.round(zoom * 100)}%
          </span>
          {rotation > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {rotation}°
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Alejar (Tecla -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Acercar (Tecla +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Rotar 90° (Tecla R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Restablecer vista 100% (Tecla 0)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/15 mx-1" />

          <a
            href={currentUrl}
            download="whatsapp_imagen.jpg"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-white transition-all cursor-pointer active:scale-95 flex items-center space-x-1.5 text-xs font-bold px-3"
            title="Descargar imagen en alta calidad"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white transition-all cursor-pointer active:scale-95 ml-2"
            title="Cerrar (Tecla Esc)"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas with 100% Centered Layout */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-8 cursor-default"
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrow: Left */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 shadow-2xl backdrop-blur-md cursor-pointer active:scale-95 transition-all"
            title="Imagen anterior (Flecha Izquierda)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Image Container (Strictly Centered) */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={currentUrl}
            alt="Vista de imagen"
            className="max-w-[90vw] max-h-[76vh] object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Navigation Arrow: Right */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 shadow-2xl backdrop-blur-md cursor-pointer active:scale-95 transition-all"
            title="Siguiente imagen (Flecha Derecha)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex items-center justify-center px-4 py-3 bg-black/70 border-t border-white/10 space-x-2.5 overflow-x-auto z-30">
          {images.map((imgUrl, i) => {
            const isActive = imgUrl === currentUrl;
            return (
              <img
                key={i}
                src={imgUrl}
                onClick={() => onNavigate && onNavigate(imgUrl)}
                className={`w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  isActive 
                    ? 'border-gold-500 scale-105 shadow-md shadow-gold-500/20 opacity-100 ring-2 ring-gold-500/30' 
                    : 'border-white/10 opacity-50 hover:opacity-90 hover:scale-100'
                }`}
                alt={`Miniatura ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
