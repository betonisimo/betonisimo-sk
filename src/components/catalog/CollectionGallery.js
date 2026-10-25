"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom"; // ИМПОРТИРУЕМ ПОРТАЛ
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

const ZoomablePhoto = dynamic(() => import("@/components/shared/ZoomablePhoto"), { ssr: false });

export default function CollectionGallery({ images, title, imageAlts = {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages = images && images.length > 0 ? images : ["/og-image.jpg"];

  // Блокируем скролл страницы, когда открыт полноэкранный режим
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isLightboxOpen]);

  // Функции для стрелок
  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  return (
    <div className="h-full flex flex-col gap-4 relative group">
      
      {/* 1. ГЛАВНОЕ ФОТО */}
      <div 
        role="button"
        tabIndex={0}
        aria-label="Zväčšiť fotografiu"
        className="relative flex-1 min-h-0 bg-slate-200 rounded-[2px] overflow-hidden shadow-2xl cursor-pointer group/main"
        onClick={() => setIsLightboxOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
      >
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#dc2626] z-10 opacity-50"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#dc2626] z-10 opacity-50"></div>
        
        <Image fill sizes="(max-width: 1023px) 100vw, 60vw" loading="eager" fetchPriority="high"
          src={safeImages[currentIndex]}
          alt={imageAlts[safeImages[currentIndex]] || `${title} - foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/10 transition-colors">
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-[2px] backdrop-blur-sm pointer-events-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-100 lg:opacity-0 group-hover/main:opacity-100 transition-opacity z-10">
              <Maximize2 size={14} /> Zväčšiť
            </div>
        </div>

      </div>

      {/* 2. МИНИАТЮРЫ */}
      <div className="h-20 lg:h-24 w-full flex gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            aria-label={`Zobraziť fotografiu ${idx + 1}`}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`relative h-full aspect-[4/3] rounded-[2px] overflow-hidden shrink-0 transition-all duration-300 ${
              currentIndex === idx 
                ? "scale-[0.98] -0" 
                : "opacity-60  hover:opacity-100 hover:-0"
            }`}
          >
            <Image fill sizes="128px" src={img} alt={imageAlts[img] || `${title} - foto ${idx + 1}`} className="w-full h-full object-cover" />
            {currentIndex === idx && (
              <div className="absolute inset-0 bg-[#dc2626]/20"></div>
            )}
          </button>
        ))}
      </div>

      {/* ================= 3. ПОЛНОЭКРАННЫЙ LIGHTBOX (PORTAL) ================= */}
      {isLightboxOpen && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Fotografie: ${title}`} className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center touch-none">
          
          {/* Верхняя панель */}
          <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 pt-safe flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white/70 font-mono text-xs font-black tracking-widest bg-black/50 px-3 py-1 rounded-[2px] backdrop-blur-sm">
              {currentIndex + 1} / {safeImages.length}
            </div>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Zavrieť fotografiu"
              className="bg-white/10 hover:bg-[#dc2626] text-white p-2 rounded-[2px] transition-colors backdrop-blur-sm"
            >
              <X size={28} />
            </button>
          </div>

          {/* Само фото */}
          <div className="relative w-full h-full flex items-center justify-center p-0 lg:p-12 mt-12 lg:mt-0">
            <ZoomablePhoto
              key={currentIndex}
              src={safeImages[currentIndex]}
              alt={imageAlts[safeImages[currentIndex]] || `${title} - foto ${currentIndex + 1}`}
            />
          </div>

          {/* Стрелки управления */}
          {safeImages.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                aria-label="Predchádzajúca fotografia"
                className="absolute left-2 lg:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#dc2626] text-white p-3 lg:p-4 rounded-[2px] backdrop-blur-sm transition-colors z-[110]"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={handleNext}
                aria-label="Nasledujúca fotografia"
                className="absolute right-2 lg:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#dc2626] text-white p-3 lg:p-4 rounded-[2px] backdrop-blur-sm transition-colors z-[110]"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>,
        document.body // <- Привязываем модалку прямо к корню документа
      )}
    </div>
  );
}
