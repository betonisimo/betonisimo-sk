"use client";
import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export default function ProjectGallery({ images, title }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
        slidesToScroll: 1,
    });
    const [index, setIndex] = useState(-1);

    useEffect(() => {
        if (index >= 0) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [index]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!images || images.length === 0) return null;
    const parsedImages = images.map(img => typeof img === 'string' ? img : img.url);

    const closeLightbox = () => setIndex(-1);
    const showNext = (e) => { e.stopPropagation(); setIndex((prev) => (prev + 1) % parsedImages.length); };
    const showPrev = (e) => { e.stopPropagation(); setIndex((prev) => (prev - 1 + parsedImages.length) % parsedImages.length); };

    return (
        <div className="space-y-8 font-sans">
            {/* HEADER & NAV */}
            <div className="flex items-end justify-between px-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Galéria projektu</h3>
                <div className="flex gap-2">
                    <button onClick={scrollPrev} className="p-3 !rounded-[2px] bg-white text-black shadow-md hover:bg-black hover:text-white transition-colors duration-300 border border-slate-100">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={scrollNext} className="p-3 !rounded-[2px] bg-white text-black shadow-md hover:bg-black hover:text-white transition-colors duration-300 border border-slate-100">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* CAROUSEL (Лента на главной) */}
            <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                <div className="flex -ml-4">
                    {parsedImages.map((src, i) => (
                        <div key={i} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0 pl-4 relative group">
                            <div className="relative aspect-video !rounded-[2px] overflow-hidden shadow-md group-hover:shadow-2xl transition-shadow duration-[800ms] bg-slate-900">
                                <img src={src} alt={`${title} - ${i + 1}`} className="w-full h-full object-cover filter  transition-all duration-[800ms] group-hover:!-0 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-70 transition-opacity duration-[800ms] group-hover:opacity-0" />
                                <button onClick={() => setIndex(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-[800ms] flex items-center justify-center">
                                    <div className="bg-black/60 p-4 !rounded-[2px] border border-white/20 backdrop-blur-sm hover:bg-[#dc2626] transition-all">
                                        <Maximize2 size={24} className="text-white" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL - БЕЗ ОТСТУПОВ (EDGE-TO-EDGE) */}
            {index >= 0 && (
                <div 
                    className="fixed inset-0 z-[99999] bg-black h-[100dvh] w-screen overflow-hidden touch-none animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* КАРТИНКА - АДАПТИВНАЯ ПО ЦЕНТРУ */}
                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-10 md:p-20">
                        <img 
                            src={parsedImages[index]} 
                            alt="Full view" 
                            className="max-w-full max-h-full w-auto h-auto object-contain !rounded-[2px] shadow-2xl animate-zoom-in"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>

                    {/* TOP BAR */}
                    <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-[110] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                        <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-white/70 uppercase pt-2 pointer-events-auto">
                            {title} // {index + 1} / {parsedImages.length}
                        </span>
                        <button onClick={closeLightbox} className="p-4 bg-white/5 hover:bg-[#dc2626] text-white !rounded-[2px] transition-colors backdrop-blur-md pointer-events-auto">
                            <X size={24} />
                        </button>
                    </div>

                    {/* NAV BUTTONS (Desktop) */}
                    <button onClick={showPrev} className="absolute left-10 top-1/2 -translate-y-1/2 p-6 text-white/40 hover:text-white bg-white/5 hover:bg-[#dc2626] !rounded-[2px] backdrop-blur-sm transition-all z-[120] hidden sm:block">
                        <ChevronLeft size={36} />
                    </button>
                    <button onClick={showNext} className="absolute right-10 top-1/2 -translate-y-1/2 p-6 text-white/40 hover:text-white bg-white/5 hover:bg-[#dc2626] !rounded-[2px] backdrop-blur-sm transition-all z-[120] hidden sm:block">
                        <ChevronRight size={36} />
                    </button>

                    {/* NAV BAR (Mobile) - ПРИЖАТА К САМОМУ НИЗУ */}
                    <div className="absolute bottom-0 left-0 w-full p-6 flex sm:hidden justify-between gap-4 bg-gradient-to-t from-black/90 to-transparent z-[130]">
                        <button onClick={showPrev} className="flex-1 py-5 bg-white/10 text-white flex justify-center !rounded-[2px] active:bg-[#dc2626] backdrop-blur-md">
                            <ChevronLeft size={28} />
                        </button>
                        <button onClick={showNext} className="flex-1 py-5 bg-white/10 text-white flex justify-center !rounded-[2px] active:bg-[#dc2626] backdrop-blur-md">
                            <ChevronRight size={28} />
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes zoom-in {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}} />
        </div>
    );
}