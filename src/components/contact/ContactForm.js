"use client";
import { useState, useEffect, useId } from "react";
import { sendContactEmail } from "@/actions/emailActions";
import Link from "next/link"; 
export default function ContactForm({ options = {}, headingLevel = 2 }) {
  const SpecificationHeading = headingLevel === 3 ? "h3" : "h2";
  const formId = useId();
  const fieldId = (name) => `${formId}-${name}`;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [customFields, setCustomFields] = useState({
    vyska: false,
    prevedenie: false,
    beton: false,
    farba: false
  });

  // ЖЕСТКАЯ ФУНКЦИЯ: Если в админке пусто — возвращаем пустой список (никаких дефолтов)
  const parseOpts = (str) => typeof str === 'string' && str.trim() !== '' ? str.split(",").map(s => s.trim()).filter(Boolean) : [];

  const optVyska = parseOpts(options.vyska);
  const optPrevedenie = parseOpts(options.prevedenie);
  const optBeton = parseOpts(options.beton);
  const optFarba = parseOpts(options.farba);

  const handleSelectChange = (e, field) => {
    if (e.target.value === "custom") {
      setCustomFields(prev => ({ ...prev, [field]: true }));
    }
  };

  const cancelCustom = (field) => {
    setCustomFields(prev => ({ ...prev, [field]: false }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const form = event.currentTarget;
    try {
      const result = await sendContactEmail(new FormData(form));
      if (result?.success) {
        setStatus('success');
        form.reset();
        setCustomFields({ vyska: false, prevedenie: false, beton: false, farba: false });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  // if (status === 'success') {
  //   return (
  //     <div className="py-10 text-center animate-in fade-in duration-500">
  //       <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">✓</div>
  //       <h3 className="text-xl font-bold text-slate-900 mb-2">Dopyt bol odoslaný</h3>
  //       <p className="text-slate-500 text-sm">Budeme vás kontaktovať s cenovou ponukou v čo najkratšom čase.</p>
  //       <button type="button" onClick={() => setStatus(null)} className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
  //         Poslať ďalší dopyt
  //       </button>
  //     </div>
  //   );
  // }
  useEffect(() => {
    if (status === 'success' && options.analyticsScripts) {
      try {
        // Ищем маркер в строке из админки
        const parts = options.analyticsScripts.split("<!--Event snippet-->");
        if (parts.length > 1) {
          // Вытаскиваем только чистый скрипт конверсии
          const conversionRaw = parts[1];

          // Очищаем от тегов <script> и </script>, чтобы вытащить чистый JS код
          const jsCode = conversionRaw
            .replace(/<script[^>]*>/gi, "")
            .replace(/<\/script>/gi, "");

          // Динамически выполняем этот код в браузере
          const launchConversion = new Function(jsCode);
          launchConversion();
        }
      } catch (err) {
        console.error("Ошибка запуска скрипта конверсии из админки:", err);
      }
    }
  }, [status, options.analyticsScripts]);

  // Блок успешного экрана
  if (status === 'success') {
    return (
      <div className="py-10 text-center animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">✓</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Dopyt bol odoslaný</h3>
        <p className="text-slate-500 text-sm">Budeme vás kontaktovať s cenovou ponukou v čo najkratšom čase.</p>
        <button type="button" onClick={() => setStatus(null)} className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
          Poslať ďalší dopyt
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-8">
      {status === 'error' && <p role="alert" className="text-sm font-bold text-red-700">Dopyt sa nepodarilo odoslať. Skúste to znova alebo nás kontaktujte telefonicky.</p>}
      <div className="space-y-5">
        <div className="space-y-1">
          <label htmlFor={fieldId("name")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meno a priezvisko</label>
          <input id={fieldId("name")} name="name" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor={fieldId("email")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
            <input id={fieldId("email")} name="email" type="email" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
          </div>
          <div className="space-y-1">
            <label htmlFor={fieldId("phone")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefón</label>
            <input id={fieldId("phone")} name="phone" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
          </div>
        </div>
      </div>

      <div className="space-y-5 border-t border-slate-100 pt-6">
        <SpecificationHeading className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc2626] mb-2">{"// Špecifikácia oplotenia"}</SpecificationHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor={fieldId("dlzka")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dĺžka oplotenia (bežné metre)</label>
            <input id={fieldId("dlzka")} name="dlzka" type="text" placeholder="napr. 25m" className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
          </div>

          <div className="space-y-1">
            <label htmlFor={fieldId("vyska")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Výška oplotenia</label>
            {!customFields.vyska ? (
              <select id={fieldId("vyska")} name="vyska" defaultValue="" onChange={(e) => handleSelectChange(e, 'vyska')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optVyska.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input id={fieldId("vyska")} name="vyska" autoFocus placeholder="Zadajte vlastnú výšku..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('vyska')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor={fieldId("prevedenie")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prevedenie</label>
            {!customFields.prevedenie ? (
              <select id={fieldId("prevedenie")} name="prevedenie" defaultValue="" onChange={(e) => handleSelectChange(e, 'prevedenie')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optPrevedenie.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input id={fieldId("prevedenie")} name="prevedenie" autoFocus placeholder="Zadajte prevedenie..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('prevedenie')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor={fieldId("druhBetonu")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Druh betónu</label>
            {!customFields.beton ? (
              <select id={fieldId("druhBetonu")} name="druhBetonu" defaultValue="" onChange={(e) => handleSelectChange(e, 'beton')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optBeton.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input id={fieldId("druhBetonu")} name="druhBetonu" autoFocus placeholder="Zadajte druh betónu..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('beton')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor={fieldId("farba")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Farebné prevedenie</label>
            {!customFields.farba ? (
              <select id={fieldId("farba")} name="farba" defaultValue="" onChange={(e) => handleSelectChange(e, 'farba')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optFarba.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input id={fieldId("farba")} name="farba" autoFocus placeholder="Zadajte farbu..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('farba')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor={fieldId("miesto")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Miesto montáže (Mesto / Obec)</label>
            <input id={fieldId("miesto")} name="miesto" type="text" placeholder="napr. Bratislava" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-6">
        <label htmlFor={fieldId("message")} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Špeciálne požiadavky / Vaša správa</label>
        <textarea id={fieldId("message")} name="message" rows={3} placeholder="Máte ďalšie otázky?" className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent resize-none text-slate-900 font-medium" />
      </div>

      {/* Текст согласия с обработкой данных и ссылкой на GDPR */}
      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="gdpr_consent"
          name="gdprConsent"
          required
          className="w-4 h-4 mt-0.5 accent-[#dc2626] cursor-pointer border-slate-300 rounded text-[#dc2626] focus:ring-[#dc2626]"
        />
        <label htmlFor="gdpr_consent" className="text-xs text-slate-500 font-medium leading-relaxed cursor-pointer select-none">
          Súhlasím so spracovaním osobných údajov za účelom vybavenia mojej požiadavky. Oboznámil/-a som sa so{" "}
          <Link href="/gdpr" target="_blank" className="text-[#dc2626] underline hover:text-black transition-colors font-bold">
            Zásadami ochrany osobných údajov
          </Link>.
        </label>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#dc2626] transition-colors disabled:opacity-50">
          {loading ? "Odosielam..." : "Odoslať nezáväzný dopyt"}
        </button>
      </div>
    </form>
  );
}
