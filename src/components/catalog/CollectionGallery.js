"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ИМПОРТИРУЕМ ПОРТАЛ
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

export default function CollectionGallery({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Нужно для работы портала в Next.js

  const safeImages = images && images.length > 0 ? images : ["/uploads/default.webp"];

  // Указываем, что компонент загрузился на клиенте (чтобы избежать ошибок SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="relative flex-1 bg-slate-200 rounded-[2px] overflow-hidden shadow-2xl cursor-pointer group/main"
        onClick={() => setIsLightboxOpen(true)}
      >
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#dc2626] z-10 opacity-50"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#dc2626] z-10 opacity-50"></div>
        
        <img
          src={safeImages[currentIndex]}
          alt={`${title} - foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/10 transition-colors">
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-[2px] backdrop-blur-sm pointer-events-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2 opacity-100 lg:opacity-0 group-hover/main:opacity-100 transition-opacity z-10">
              <Maximize2 size={14} /> Zväčšiť
            </div>
        </div>

        <div className="absolute top-4 right-4 text-[10px] font-mono font-black text-white/90 tracking-widest bg-black/60 px-3 py-1.5 rounded-[2px] backdrop-blur-sm z-10 pointer-events-none">
          IMG_0{currentIndex + 1}
        </div>
      </div>

      {/* 2. МИНИАТЮРЫ */}
      <div className="h-20 lg:h-24 w-full flex gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`relative h-full aspect-[4/3] rounded-[2px] overflow-hidden shrink-0 transition-all duration-300 ${
              currentIndex === idx 
                ? "scale-[0.98] -0" 
                : "opacity-60  hover:opacity-100 hover:-0"
            }`}
          >
            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            {currentIndex === idx && (
              <div className="absolute inset-0 bg-[#dc2626]/20"></div>
            )}
          </button>
        ))}
      </div>

      {/* ================= 3. ПОЛНОЭКРАННЫЙ LIGHTBOX (PORTAL) ================= */}
      {isLightboxOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center touch-none">
          
          {/* Верхняя панель */}
          <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 pt-safe flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white/70 font-mono text-xs font-black tracking-widest bg-black/50 px-3 py-1 rounded-[2px] backdrop-blur-sm">
              {currentIndex + 1} / {safeImages.length}
            </div>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/10 hover:bg-[#dc2626] text-white p-2 rounded-[2px] transition-colors backdrop-blur-sm"
            >
              <X size={28} />
            </button>
          </div>

          {/* Само фото */}
          <div className="relative w-full h-full flex items-center justify-center p-0 lg:p-12 mt-12 lg:mt-0">
            <img
              src={safeImages[currentIndex]}
              alt={`${title} - fullscreen`}
              className="max-w-full max-h-full object-contain select-none"
            />
          </div>

          {/* Стрелки управления */}
          {safeImages.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-2 lg:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#dc2626] text-white p-3 lg:p-4 rounded-[2px] backdrop-blur-sm transition-colors z-[110]"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={handleNext}
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