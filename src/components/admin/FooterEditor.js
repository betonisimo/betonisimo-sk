"use client";
import { useState } from "react";
import { saveContent } from "@/actions/adminActions";
import { Save } from "lucide-react";

export default function FooterEditor({ dbData }) {
  const defaults = {
    firma: "BART Complex s.r.o.", show_firma: true,
    adresa: "Novojelčanská 845/63 925 23 Jelka", show_adresa: true,
    ico: "51921979", show_ico: true,
    dic: "2120839974", show_dic: true,
    icdph: "SK2120839974", show_icdph: true,
    email1: "info@beton-plotysk.sk", show_email: true,
    tel: "0911 640 097", show_tel: true,
    fb_link: "https://www.facebook.com/", show_fb: true,
    ig_link: "https://www.instagram.com/", show_ig: true,
    yt_link: "https://www.youtube.com/", show_yt: false,
    tiktok_link: "https://www.tiktok.com/", show_tiktok: false,
    show_widget: true
  };

  // Мы объединяем дефолты и данные из БД, чтобы новые ключи (YT, TikTok) всегда имели значение
  const [data, setData] = useState({ ...defaults, ...(dbData || {}) });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveContent("global", "footer", data);
      alert("Konfigurácia bola úspešne uložená.");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ name, label, checked }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" name={name} checked={checked || false} onChange={handleChange} className="sr-only" />
        <div className={`w-8 h-4 rounded-full transition-colors ${checked ? 'bg-[#dc2626]' : 'bg-slate-200'}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${checked ? 'text-slate-900' : 'text-slate-400'}`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="space-y-12 font-sans bg-white p-8 rounded-[2px] shadow-inner border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* FIRMA A SÍDLO */}
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Základné údaje</h4>
          <div className="space-y-4">
             <Toggle name="show_firma" label="Názov firmy" checked={data.show_firma} />
             <input name="firma" value={data.firma || ""} onChange={handleChange} className="w-full bg-slate-50 p-3 text-xs font-bold uppercase rounded-[2px] border-b-2 border-transparent focus:border-[#dc2626] outline-none" />
          </div>
          <div className="space-y-4">
             <Toggle name="show_adresa" label="Adresa sídla" checked={data.show_adresa} />
             <input name="adresa" value={data.adresa || ""} onChange={handleChange} className="w-full bg-slate-50 p-3 text-xs font-bold uppercase rounded-[2px] border-b-2 border-transparent focus:border-[#dc2626] outline-none" />
          </div>
        </div>

        {/* FAKTURAČNÉ ÚDAJE */}
        <div className="space-y-6 bg-slate-50/50 p-4 rounded-[2px] border border-slate-100">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Fakturačné údaje</h4>
          <div className="space-y-3">
            <Toggle name="show_ico" label="IČO" checked={data.show_ico} />
            <input name="ico" value={data.ico || ""} onChange={handleChange} className="w-full bg-white p-2 text-[10px] font-mono border-b border-slate-100 outline-none focus:border-black" />
          </div>
          <div className="space-y-3">
            <Toggle name="show_dic" label="DIČ" checked={data.show_dic} />
            <input name="dic" value={data.dic || ""} onChange={handleChange} className="w-full bg-white p-2 text-[10px] font-mono border-b border-slate-100 outline-none focus:border-black" />
          </div>
          <div className="space-y-3">
            <Toggle name="show_icdph" label="IČ DPH" checked={data.show_icdph} />
            <input name="icdph" value={data.icdph || ""} onChange={handleChange} className="w-full bg-white p-2 text-[10px] font-mono border-b border-slate-100 outline-none focus:border-black" />
          </div>
        </div>

        {/* KONTAKTY */}
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rýchly kontakt</h4>
          <div className="space-y-4">
            <Toggle name="show_email" label="Primárny Email" checked={data.show_email} />
            <input name="email1" value={data.email1 || ""} onChange={handleChange} className="w-full bg-slate-50 p-3 text-xs font-bold rounded-[2px] border-b-2 border-transparent focus:border-[#dc2626] outline-none" />
          </div>
          <div className="space-y-4">
            <Toggle name="show_tel" label="Telefónne číslo" checked={data.show_tel} />
            <input name="tel" value={data.tel || ""} onChange={handleChange} className="w-full bg-slate-50 p-3 text-sm font-black rounded-[2px] border-b-2 border-transparent focus:border-[#dc2626] outline-none" />
          </div>
        </div>

        {/* SOCIÁLNE SIETE */}
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sociálne siete</h4>
          <div className="space-y-4">
            <Toggle name="show_fb" label="Facebook" checked={data.show_fb} />
            <input name="fb_link" value={data.fb_link || ""} onChange={handleChange} className="w-full bg-slate-50 p-2 text-[10px] rounded-[2px] outline-none" />
          </div>
          <div className="space-y-4">
            <Toggle name="show_ig" label="Instagram" checked={data.show_ig} />
            <input name="ig_link" value={data.ig_link || ""} onChange={handleChange} className="w-full bg-slate-50 p-2 text-[10px] rounded-[2px] outline-none" />
          </div>
          <div className="space-y-4">
            <Toggle name="show_yt" label="YouTube" checked={data.show_yt} />
            <input name="yt_link" value={data.yt_link || ""} onChange={handleChange} className="w-full bg-slate-50 p-2 text-[10px] rounded-[2px] outline-none" />
          </div>
          <div className="space-y-4">
            <Toggle name="show_tiktok" label="TikTok" checked={data.show_tiktok} />
            <input name="tiktok_link" value={data.tiktok_link || ""} onChange={handleChange} className="w-full bg-slate-50 p-2 text-[10px] rounded-[2px] outline-none" />
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Toggle name="show_widget" label="Aktívny FB Feed" checked={data.show_widget} />
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-slate-900 text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#dc2626] transition-all duration-500 rounded-[2px] disabled:opacity-50 flex items-center gap-4"
        >
          <Save size={16} /> {loading ? "Prebieha zápis..." : "Uložiť zmeny"}
        </button>
      </div>
    </div>
  );
}