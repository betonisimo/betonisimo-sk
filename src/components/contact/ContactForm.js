"use client";
import { useState } from "react";
import { sendContactEmail } from "@/actions/emailActions";

export default function ContactForm({ options = {} }) {
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

    const formData = new FormData(event.target);
    const result = await sendContactEmail(formData);

    setLoading(false);
    if (result.success) {
      setStatus('success');
      event.target.reset();
      setCustomFields({ vyska: false, prevedenie: false, beton: false, farba: false });
    } else {
      setStatus('error');
    }
  }

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meno a priezvisko</label>
          <input name="name" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
            <input name="email" type="email" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefón</label>
            <input name="phone" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-bold" />
          </div>
        </div>
      </div>

      <div className="space-y-5 border-t border-slate-100 pt-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc2626] mb-2">// Špecifikácia oplotenia</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dĺžka oplotenia (bežné metre)</label>
            <input name="dlzka" type="text" placeholder="napr. 25m" className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Výška oplotenia</label>
            {!customFields.vyska ? (
              <select name="vyska" defaultValue="" onChange={(e) => handleSelectChange(e, 'vyska')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optVyska.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input name="vyska" autoFocus placeholder="Zadajte vlastnú výšku..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('vyska')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prevedenie</label>
            {!customFields.prevedenie ? (
              <select name="prevedenie" defaultValue="" onChange={(e) => handleSelectChange(e, 'prevedenie')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optPrevedenie.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input name="prevedenie" autoFocus placeholder="Zadajte prevedenie..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('prevedenie')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Druh betónu</label>
            {!customFields.beton ? (
              <select name="druhBetonu" defaultValue="" onChange={(e) => handleSelectChange(e, 'beton')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optBeton.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input name="druhBetonu" autoFocus placeholder="Zadajte druh betónu..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('beton')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Farebné prevedenie</label>
            {!customFields.farba ? (
              <select name="farba" defaultValue="" onChange={(e) => handleSelectChange(e, 'farba')} className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium cursor-pointer">
                <option value="" disabled>Vyberte možnosť...</option>
                {optFarba.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                <option value="custom" className="font-bold text-[#dc2626]">Iné (napíšem vlastné)...</option>
              </select>
            ) : (
              <div className="flex gap-2 items-center">
                <input name="farba" autoFocus placeholder="Zadajte farbu..." required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
                <button type="button" onClick={() => cancelCustom('farba')} className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest px-2">Zrušiť</button>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Miesto montáže (Mesto / Obec)</label>
            <input name="miesto" type="text" placeholder="napr. Bratislava" required className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent text-slate-900 font-medium" />
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Špeciálne požiadavky / Vaša správa</label>
        <textarea name="message" rows={3} placeholder="Máte ďalšie otázky?" className="w-full border-b border-slate-200 py-3 px-1 outline-none focus:border-[#dc2626] transition-colors bg-transparent resize-none text-slate-900 font-medium" />
      </div>

      <div className="pt-4">
        <button type="submit" disabled={loading} className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#dc2626] transition-colors disabled:opacity-50">
          {loading ? "Odosielam..." : "Odoslať nezáväzný dopyt"}
        </button>
      </div>
    </form>
  );
}