"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Состояние для детальных настроек
  const [prefs, setPrefs] = useState({
    analytical: false,
    marketing: false,
  });

  // Избегаем ошибок гидратации Next.js (проверяем localStorage только на клиенте)
  useEffect(() => {
    setHasMounted(true);
    const savedConsent = localStorage.getItem("cookie_consent");
    if (!savedConsent) {
      setIsVisible(true);
    }
  }, []);

  if (!hasMounted || !isVisible) return null;

  // Функция сохранения выбора
  const saveConsent = (consentData) => {
    localStorage.setItem("cookie_consent", JSON.stringify(consentData));
    setIsVisible(false);
    
    // Передаем событие в систему (понадобится для Google Consent Mode на следующем шаге)
    window.dispatchEvent(new Event("cookie_consent_updated"));
  };

  // 1. Принять все cookies
  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytical: true, marketing: true });
  };

  // 2. Отклонить все nepovinné cookies
  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytical: false, marketing: false });
  };

  // 3. Сохранить только выбранные в настройках
  const handleSavePreferences = () => {
    saveConsent({ necessary: true, ...prefs });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950 text-white border-t border-neutral-800 font-sans p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Главный блок с текстом */}
        <div className="flex flex-col gap-2">
          <h5 className="text-sm font-black uppercase tracking-widest text-[#dc2626]">
            // Nastavenie súborov cookies
          </h5>
          <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
            Naša stránka používa cookies na zabezpečenie správneho fungovania, analýzu návštevnosti a personalizáciu reklám.
            Detaily o tom, ako údaje spracúvame, nájdete na stránke{" "}
            <Link href="/cookies" className="text-white underline hover:text-[#dc2626] font-bold">
              Zásady používania cookies
            </Link>.
          </p>
        </div>

        {/* Панель детальных настроек (Preferences) */}
        {showPreferences && (
          <div className="bg-neutral-900 p-4 rounded border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-300">
            
            {/* Необходимые (всегда включены) */}
            <div className="flex items-start gap-3 opacity-60">
              <input type="checkbox" checked disabled className="mt-0.5 w-4 h-4 accent-[#dc2626]" />
              <div>
                <p className="font-bold text-white">Nevyhnutné cookies</p>
                <p className="text-slate-400 text-[11px]">Potrebné pre správne fungovanie webu, nie je možné ich vypnúť.</p>
              </div>
            </div>

            {/* Аналитические */}
            <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => setPrefs(p => ({ ...p, analytical: !p.analytical }))}>
              <input 
                type="checkbox" 
                checked={prefs.analytical} 
                onChange={() => {}} // Обрабатывается кликом по родителю
                className="mt-0.5 w-4 h-4 accent-[#dc2626] cursor-pointer" 
              />
              <div>
                <p className="font-bold text-white">Analytické cookies</p>
                <p className="text-slate-400 text-[11px]">Pomáhajú nám získavať informácie o návštevnosti a používaní stránky.</p>
              </div>
            </div>

            {/* Маркетинговые */}
            <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}>
              <input 
                type="checkbox" 
                checked={prefs.marketing} 
                onChange={() => {}} 
                className="mt-0.5 w-4 h-4 accent-[#dc2626] cursor-pointer" 
              />
              <div>
                <p className="font-bold text-white">Marketingové cookies</p>
                <p className="text-slate-400 text-[11px]">Používané službami tretích strán (Google Ads, Facebook) na personalizáciu reklám.</p>
              </div>
            </div>

          </div>
        )}

        {/* Блок управления / Кнопки */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-900">
          
          {/* Ссылка-переключатель для открытия настроек */}
          <button 
            type="button" 
            onClick={() => setShowPreferences(!showPreferences)} 
            className="text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-white text-left transition-colors"
          >
            {showPreferences ? "✕ Skryť nastavenia" : "⚙ Nastaviť preferencie"}
          </button>

          {/* Основные экшены */}
          <div className="flex flex-wrap items-center gap-3">
            {showPreferences ? (
              // Кнопка сохранения, когда открыты настройки
              <button 
                onClick={handleSavePreferences} 
                className="bg-neutral-800 text-white px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-700 transition-colors rounded-[2px]"
              >
                Uložiť moje nastavenia
              </button>
            ) : (
              // Кнопка отклонения необязательных, когда настройки закрыты
              <button 
                onClick={handleRejectAll} 
                className="border border-neutral-800 text-slate-300 px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors rounded-[2px]"
              >
                Odmietnuť nepovinné
              </button>
            )}

            {/* Главная кнопка — Принять всё */}
            <button 
              onClick={handleAcceptAll} 
              className="bg-[#dc2626] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors rounded-[2px]"
            >
              Prijať všetky cookies
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}