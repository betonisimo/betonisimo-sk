"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { saveContent } from "@/actions/adminActions";
import { submitReview } from "@/actions/reviewActions";
import { usePropDraft } from "@/hooks/usePropDraft";
import {
  Quote, ChevronLeft, ChevronRight, X, Star
} from "lucide-react";

// 1. Убрали Martin K. из дефолтных значений
export default function Reviews({ editMode = false, dbData, approvedReviews = [] }) {
  // Оставляем только заголовок как статический контент
  const [title, setTitle] = usePropDraft(dbData?.title || "Recenzie našich klientov");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const scrollRef = useRef(null);
  const modalRef = useRef(null);

  // Блокировка скролла при открытых модалках
  useEffect(() => {
    if (!expandedReview && !isFormOpen) return;
    const previousFocus = document.activeElement;
    const focusableElements = () => Array.from(modalRef.current?.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]') || [])
      .filter((element) => !element.disabled && element.getClientRects().length);
    focusableElements()[0]?.focus();
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setExpandedReview(null); setIsFormOpen(false); }
      if (event.key === 'Tab') {
        const elements = focusableElements();
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [expandedReview, isFormOpen]);

  // 2. ФИКС: Теперь отображаем ТОЛЬКО отзывы из базы модерации (approvedReviews)
  const displayReviews = useMemo(() => {
    return approvedReviews.map(r => ({
      id: `db-${r.id}`, 
      text: r.text, 
      autor: r.author, 
      mesto: 'Overený zákazník', 
      rating: r.rating || 5
    }));
  }, [approvedReviews]);

  // Сохраняем только заголовок (статические отзывы больше не пишем в БД Content)
  const saveTitle = async (newTitle) => {
    await saveContent("domov", "domov-recenzie", { items: [], title: newTitle });
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target);
      const res = await submitReview(formData);
      if (res.success) {
        alert("Ďakujeme! Vaša recenzia bola odoslaná na schválenie.");
        setIsFormOpen(false);
        e.target.reset();
      } else {
        alert("Chyba: " + (res.error || "Nepodarilo sa odoslať."));
      }
    } catch (err) {
      alert("Chyba pripojenia k serveru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const preventScroll = (e) => e.preventDefault();
  const stopScrollPropagation = (e) => e.stopPropagation();

  return (
    <section className="py-32 bg-[#F2F2F2] text-slate-900 overflow-hidden relative border-t border-slate-200 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 border-l-4 border-[#dc2626] pl-6 md:pl-8">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#dc2626] mb-4 font-black">{"// Customer_Voice"}</p>
            <h2
              contentEditable={editMode}
              suppressContentEditableWarning
              onBlur={editMode ? (e) => { const nt = e.target.innerText; setTitle(nt); saveTitle(nt); } : undefined}
              className="text-4xl md:text-8xl font-black tracking-tighter uppercase outline-none break-words leading-[0.85] text-slate-900"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {!editMode && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-10 py-5 bg-black text-white hover:bg-[#dc2626] transition-colors duration-300 text-[10px] font-black uppercase tracking-[0.3em] rounded-[2px] shadow-xl"
              >
                Pridať recenziu
              </button>
            )}
            <div className="flex gap-2">
              <button aria-label="Predchádzajúce recenzie" onClick={() => scroll('left')} className="p-4 bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-[2px] shadow-md"><ChevronLeft size={20} /></button>
              <button aria-label="Nasledujúce recenzie" onClick={() => scroll('right')} className="p-4 bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-[2px] shadow-md"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>

        {/* SLIDER */}
        <div ref={scrollRef} className="grid grid-flow-col auto-cols-[100%] md:auto-cols-[480px] gap-8 overflow-x-auto snap-x snap-mandatory pb-12 no-scrollbar" style={{ scrollBehavior: 'smooth' }}>
          {displayReviews.length === 0 ? (
             <div className="text-slate-300 font-black uppercase tracking-widest text-xs p-10">Zatiaľ žiadne schválené recenzie</div>
          ) : (
            displayReviews.map((rev) => {
              const isLong = rev.text.length > 160;
              return (
                <div key={rev.id} className="snap-center h-full pt-2">
                  <div className="group bg-white h-full p-10 md:p-12 rounded-[2px] flex flex-col justify-between min-h-[450px] shadow-lg hover:shadow-2xl transition-all duration-[800ms] ease-out hover:-translate-y-2 relative overflow-hidden">
                    <div className="space-y-8 relative z-10">
                      <div className="flex justify-between items-start">
                        <Quote className="text-slate-100 transition-colors duration-500 group-hover:text-red-50" size={56} />
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < (rev.rating || 5) ? "currentColor" : "none"} className={i < (rev.rating || 5) ? "text-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed italic">
                        &quot;{isLong ? rev.text.substring(0, 160) + "..." : rev.text}&quot;
                      </p>
                      {isLong && (
                        <button
                          onClick={() => setExpandedReview(rev)}
                          className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc2626] hover:text-black transition-colors duration-300 w-fit"
                        >
                          Čítať celú skúsenosť
                        </button>
                      )}
                    </div>
                    <div className="pt-10 border-t border-slate-100 mt-10 relative z-10">
                      <div className="font-black text-slate-900 uppercase tracking-widest text-lg">{rev.autor}</div>
                      <div className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.3em] mt-2">{rev.mesto}</div>
                    </div>
                    <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-[800ms] ease-out z-20"></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* МОДАЛЬНЫЕ ОКНА И ФОРМА — ПОЛНОСТЬЮ СОХРАНЕНЫ */}
      {expandedReview && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setExpandedReview(null)} onWheel={preventScroll} onTouchMove={preventScroll}></div>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Detail recenzie" className="relative z-10 w-full max-w-3xl bg-white rounded-[2px] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] border-t-4 border-[#dc2626] overflow-hidden" onWheel={stopScrollPropagation} onTouchMove={stopScrollPropagation}>
            <div className="flex justify-between items-center p-6 md:px-10 border-b border-slate-100 shrink-0 bg-white">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Detail recenzie</div>
              <button aria-label="Zavrieť recenziu" onClick={() => setExpandedReview(null)} className="text-slate-300 hover:text-[#dc2626] transition-colors duration-300"><X size={28} /></button>
            </div>
            <div className="p-6 md:p-10 overflow-y-auto overscroll-contain no-scrollbar bg-slate-50 flex-1">
              <div className="space-y-8">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (<Star key={i} size={20} fill={i < (expandedReview.rating || 5) ? "currentColor" : "none"} />))}
                </div>
                <p className="text-xl md:text-3xl font-medium text-slate-800 leading-relaxed italic break-words">&quot;{expandedReview.text}&quot;</p>
              </div>
            </div>
            <div className="p-6 md:px-10 bg-white border-t border-slate-100 shrink-0">
              <div className="font-black text-slate-900 uppercase tracking-tighter text-xl">{expandedReview.autor}</div>
              <div className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em] mt-1">{expandedReview.mesto}</div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[4000] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity" onClick={() => setIsFormOpen(false)} onWheel={preventScroll} onTouchMove={preventScroll}></div>
          <form ref={modalRef} role="dialog" aria-modal="true" aria-label="Napísať recenziu" onSubmit={handleClientSubmit} onClick={(e) => e.stopPropagation()} onWheel={stopScrollPropagation} onTouchMove={stopScrollPropagation} className="relative z-10 w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white flex flex-col shadow-2xl border-t-4 border-[#dc2626] overflow-hidden rounded-t-[2px] sm:rounded-[2px]">
            <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-[0.85]">Napísať <br /><span className="text-[#dc2626]">Recenziu</span></h3>
              <button aria-label="Zavrieť formulár recenzie" type="button" onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-[#dc2626] transition-colors p-2 -mt-2 -mr-2"><X size={32} /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-10 space-y-8 no-scrollbar bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="review-author" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vaše meno</label>
                  <input id="review-author" name="author" maxLength={100} required placeholder="MENO" className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] text-slate-900 font-medium uppercase transition-all rounded-[2px]" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="review-rating" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hodnotenie</label>
                  <select id="review-rating" name="rating" required className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] text-slate-900 font-black uppercase rounded-[2px] appearance-none">
                    <option value="5">⭐⭐⭐⭐⭐ 5/5</option><option value="4">⭐⭐⭐⭐ 4/5</option><option value="3">⭐⭐⭐ 3/5</option><option value="2">⭐⭐ 2/5</option><option value="1">⭐ 1/5</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="review-city" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lokalita (Mesto)</label>
                <input id="review-city" name="mesto" placeholder="NAPR. BRATISLAVA" className="w-full bg-white border border-slate-200 px-4 py-3 outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] text-slate-900 font-medium uppercase transition-all rounded-[2px]" />
              </div>
              <div className="flex flex-col gap-2 pb-6">
                <label htmlFor="review-text" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vaša skúsenosť</label>
                <textarea id="review-text" name="text" maxLength={5000} required placeholder="NAPÍŠTE NÁM VAŠU SKÚSENOSŤ..." className="w-full bg-white border border-slate-200 p-4 min-h-[140px] outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] text-slate-900 font-medium resize-none rounded-[2px]"></textarea>
              </div>
            </div>
            <div className="p-4 md:p-8 bg-white border-t border-slate-100 flex gap-4 shrink-0">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">Zrušiť</button>
              <button disabled={isSubmitting} type="submit" className="flex-[2] py-4 bg-[#dc2626] text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-900 transition-colors shadow-lg rounded-[2px]">{isSubmitting ? "Odosielam..." : "Odoslať teraz"}</button>
            </div>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
    </section>
  );
}
