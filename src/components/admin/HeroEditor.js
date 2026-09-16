"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { saveContent, uploadImageAction } from "@/actions/adminActions";
import { Save, Image as ImageIcon, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import HeroFeatureIcon, { HERO_FEATURE_ICON_NAMES } from "@/components/shared/HeroFeatureIcon";

const DEFAULT_HERO_DATA = {
  subtitle: "Tradičná slovenská kvalita // Od 2009",
  show_subtitle: true,
  title_white: "PRÉMIOVÉ",
  title_red: "BETÓNOVÉ",
  title_end: "PLOTY",
  description: "Zvyšujeme hodnotu vašej nehnuteľnosti plotmi, ktoré vydržia generácie.",
  bg_image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070",
  cta1_text: "Prezrieť katalógu",
  cta1_link: "/katalog",
  show_cta1: true,
  cta2_text: "Cenová ponuka",
  cta2_link: "/kontakt",
  show_cta2: true,
};

function normalizeDescriptionItems(data) {
  if (Array.isArray(data.description_items) && data.description_items.length > 0) {
    return data.description_items.map((item) => ({
      text: typeof item === "string" ? item : item?.text || "",
      icon: typeof item === "object" && item?.icon ? item.icon : "CheckCircle",
    }));
  }

  return [
    {
      text: data.description || DEFAULT_HERO_DATA.description,
      icon: "ShieldCheck",
    },
  ];
}

function createInitialData(dbData) {
  const data = { ...DEFAULT_HERO_DATA, ...(dbData || {}) };

  return {
    ...data,
    description_items: normalizeDescriptionItems(data),
  };
}

function Toggle({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
        <div className={`w-8 h-4 rounded-full transition-colors ${checked ? "bg-[#dc2626]" : "bg-slate-200"}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? "translate-x-4" : ""}`}></div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${checked ? "text-slate-900" : "text-slate-400"}`}>
        {label}
      </span>
    </label>
  );
}

export default function HeroEditor({ dbData }) {
  const [data, setData] = useState(() => createInitialData(dbData));

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Обработка текстовых полей и чекбоксов
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDescriptionItemChange = (index, field, value) => {
    setData((current) => ({
      ...current,
      description_items: current.description_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addDescriptionItem = () => {
    setData((current) => ({
      ...current,
      description_items: [
        ...current.description_items,
        { text: "", icon: "CheckCircle" },
      ],
    }));
  };

  const removeDescriptionItem = (index) => {
    setData((current) => ({
      ...current,
      description_items: current.description_items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  // Загрузка изображения через наш новый экшен
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImageAction(formData);
      if (res.success) {
        setData((prev) => ({ ...prev, bg_image: res.url }));
      } else {
        alert("Chyba pri nahrávaní: " + res.error);
      }
    } catch (err) {
      alert("Systémová chyba pri nahrávaní.");
    } finally {
      setUploading(false);
    }
  };

  // Сохранение всего конфига в базу
  const handleSave = async () => {
    const descriptionItems = data.description_items
      .map((item) => ({ text: item.text.trim(), icon: item.icon || "CheckCircle" }))
      .filter((item) => item.text.length > 0);

    if (descriptionItems.length === 0) {
      alert("Pridajte aspoň jeden hlavný bod.");
      return;
    }

    const payload = {
      ...data,
      description_items: descriptionItems,
      description: descriptionItems.map((item) => item.text).join(" "),
    };

    setLoading(true);
    try {
      const res = await saveContent("domov", "hero", payload);
      if (res.success) {
        setData(payload);
        alert("Hero sekcia bola úspešne aktualizovaná.");
      } else {
        alert("Hero sekciu sa nepodarilo uložiť: " + (res.error || "Neznáma chyba"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ЛЕВАЯ КОЛОНКА: ТЕКСТЫ И КНОПКИ */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Подзаголовок */}
          <div className="space-y-4">
            <Toggle name="show_subtitle" label="Horný podnadpis" checked={data.show_subtitle} onChange={handleChange} />
            <input 
              name="subtitle" 
              value={data.subtitle} 
              onChange={handleChange} 
              className="w-full bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent focus:border-[#dc2626] outline-none transition-all" 
            />
          </div>

          {/* Главный заголовок (3 части) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Biela časť</label>
               <input name="title_white" value={data.title_white} onChange={handleChange} className="w-full bg-slate-50 p-3 text-sm font-black outline-none border-b border-slate-200 focus:border-black" />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-[#dc2626] uppercase tracking-widest">Červená časť</label>
               <input name="title_red" value={data.title_red} onChange={handleChange} className="w-full bg-slate-50 p-3 text-sm font-black text-[#dc2626] outline-none border-b border-[#dc2626] focus:border-[#dc2626]" />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Koniec nadpisu</label>
               <input name="title_end" value={data.title_end} onChange={handleChange} className="w-full bg-slate-50 p-3 text-sm font-black outline-none border-b border-slate-200 focus:border-black" />
            </div>
          </div>

          {/* Hlavné body */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hlavné body</p>
                <p className="mt-2 text-xs text-slate-500">Každý bod má vlastný text a voliteľnú ikonu.</p>
              </div>
              <button
                type="button"
                onClick={addDescriptionItem}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dc2626]"
              >
                <Plus size={14} /> Pridať bod
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.description_items.map((item, index) => (
                <div key={index} className="border border-slate-200 bg-slate-50 p-4 rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Bod {String(index + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDescriptionItem(index)}
                      disabled={data.description_items.length === 1}
                      className="p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label={`Odstrániť bod ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-[48px_1fr] gap-3">
                    <div className="flex h-12 w-12 items-center justify-center bg-[#dc2626] text-white rounded-[2px]">
                      <HeroFeatureIcon name={item.icon} size={22} strokeWidth={1.8} />
                    </div>
                    <select
                      value={item.icon}
                      onChange={(event) => handleDescriptionItemChange(index, "icon", event.target.value)}
                      className="w-full bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-700 outline-none border border-slate-200 focus:border-[#dc2626]"
                      aria-label={`Ikona bodu ${index + 1}`}
                    >
                      {HERO_FEATURE_ICON_NAMES.map((iconName) => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={item.text}
                    onChange={(event) => handleDescriptionItemChange(index, "text", event.target.value)}
                    rows={2}
                    placeholder="Text hlavného bodu..."
                    className="w-full resize-none bg-white p-3 text-sm font-medium leading-relaxed outline-none border border-slate-200 focus:border-[#dc2626]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки (CTA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
             <div className="space-y-4">
                <Toggle name="show_cta1" label="Tlačidlo 1 (Primary)" checked={data.show_cta1} onChange={handleChange} />
                <input name="cta1_text" placeholder="Text tlačidla" value={data.cta1_text} onChange={handleChange} className="w-full bg-slate-50 p-3 text-[10px] font-bold uppercase outline-none" />
                <input name="cta1_link" placeholder="Link (napr. /realizacie)" value={data.cta1_link} onChange={handleChange} className="w-full bg-slate-100 p-2 text-[9px] font-mono outline-none" />
             </div>
             <div className="space-y-4">
                <Toggle name="show_cta2" label="Tlačidlo 2 (Outline)" checked={data.show_cta2} onChange={handleChange} />
                <input name="cta2_text" placeholder="Text tlačidla" value={data.cta2_text} onChange={handleChange} className="w-full bg-slate-50 p-3 text-[10px] font-bold uppercase outline-none" />
                <input name="cta2_link" placeholder="Link (napr. /kontakt)" value={data.cta2_link} onChange={handleChange} className="w-full bg-slate-100 p-2 text-[9px] font-mono outline-none" />
             </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ЗАГРУЗКА ИЗОБРАЖЕНИЯ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2px] space-y-5 shadow-2xl relative overflow-hidden">
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -rotate-45 translate-x-10 -translate-y-10"></div>
            
            <div className="flex items-center justify-between text-[#dc2626] relative z-10">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Background_Asset</span>
              </div>
              {uploading && <Loader2 size={16} className="animate-spin" />}
            </div>

            {/* Зона загрузки / Превью */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className="relative aspect-video w-full bg-black rounded-[2px] overflow-hidden border border-white/10 cursor-pointer group"
            >
              <Image
                src={data.bg_image}
                alt="Hero Preview" 
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className={`object-cover transition-opacity duration-700 ${uploading ? "opacity-20" : "opacity-50 group-hover:opacity-70"}`}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className={`p-4 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-500 ${uploading ? 'bg-white/10' : 'bg-white/5 group-hover:bg-[#dc2626] group-hover:scale-110'}`}>
                  {uploading ? <Loader2 className="animate-spin text-white" /> : <Upload size={24} className="text-white" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">
                  {uploading ? "Nahrávam..." : "Zmeniť pozadie"}
                </span>
              </div>
            </div>

            {/* Скрытый инпут */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="space-y-2 relative z-10">
               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Aktuálna URL cesta</label>
               <input 
                  name="bg_image" 
                  value={data.bg_image} 
                  readOnly
                  className="w-full bg-white/5 border border-white/10 p-3 text-[9px] text-slate-400 font-mono outline-none" 
                />
            </div>
          </div>
        </div>

      </div>

      {/* ФУТЕР РЕДАКТОРА С КНОПКОЙ */}
      <div className="pt-10 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={loading || uploading}
          className="group relative flex items-center gap-4 bg-slate-900 text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#dc2626] transition-all duration-500 rounded-[2px] disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {loading ? "Prebieha zápis..." : "Uložiť Hero konfiguráciu"}
        </button>
      </div>
    </div>
  );
}
