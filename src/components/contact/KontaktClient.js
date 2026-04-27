"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "@/actions/adminActions";
import ContactForm from "./ContactForm";
import { Building2, Phone, Mail, Eye, EyeOff, Loader2, Settings2, X, Plus } from "lucide-react";

// Дефолтные значения пусты, чтобы форма брала данные только из админки
const DEFAULT_OPTIONS = {
  vyska: "",
  prevedenie: "",
  beton: "",
  farba: ""
};

export default function KontaktClient({ editMode, initialData, formOptions = {} }) {
  const router = useRouter(); // Добавили роутер для сброса кэша
  const [data, setData] = useState(initialData);
  
  // Объединяем дефолтные значения с теми, что пришли из базы
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...formOptions });
  const [isSaving, setIsSaving] = useState(false);

  // Обновляем стейт, если пропсы изменились
  useEffect(() => {
    setOptions({ ...DEFAULT_OPTIONS, ...formOptions });
  }, [formOptions]);

  const syncData = async (updatedData) => {
    setIsSaving(true);
    try {
      await saveContent("kontakt", "informacie", updatedData);
      router.refresh(); // Принудительно обновляем данные
    } catch (err) {
      console.error("Chyba:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const syncOptions = async (updatedOptions) => {
    setIsSaving(true);
    try {
      await saveContent("kontakt", "form_options", updatedOptions);
      router.refresh(); // Принудительно обновляем данные
    } catch (err) {
      console.error("Chyba:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = (field, event) => {
    const newValue = event.target.innerText;
    if (newValue !== data[field]) {
      const updatedData = { ...data, [field]: newValue };
      setData(updatedData);
      syncData(updatedData);
    }
  };

  const handleToggle = (field) => {
    const updatedData = { ...data, [field]: !data[field] };
    setData(updatedData);
    syncData(updatedData);
  };

  const handleOptionChange = (field, value) => {
    // 1. Сначала формируем новые данные
    const updatedOptions = { ...options, [field]: value };
    
    // 2. Обновляем визуал (стейт React)
    setOptions(updatedOptions);
    
    // 3. Отправляем в базу данных (теперь это законно, т.к. вне сеттера)
    syncOptions(updatedOptions);
  };

  const editProps = (field) => {
    if (!editMode) return {};
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => handleBlur(field, e),
      className: "hover:bg-white/10 p-1 rounded transition-colors outline-none focus:ring-1 focus:ring-white/50 cursor-text inline-block min-w-[30px]"
    };
  };

  const AdminToggle = ({ field, label }) => {
    if (!editMode) return null;
    const active = data[field];
    return (
      <button 
        onClick={() => handleToggle(field)}
        className={`flex items-center gap-2 mb-1 px-2 py-1 rounded-[2px] transition-all ${active ? 'bg-white/10 text-white' : 'bg-black/20 text-white/40'}`}
      >
        {active ? <Eye size={10} /> : <EyeOff size={10} />}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  // --- КОМПОНЕНТ ДЛЯ УДОБНОГО РЕДАКТИРОВАНИЯ ТЕГОВ ---
  const OptionEditor = ({ label, field }) => {
    const currentString = options[field] || "";
    // Разбиваем строку по запятым и очищаем от пробелов
    const tags = currentString.split(",").map(t => t.trim()).filter(Boolean);
    const [inputValue, setInputValue] = useState("");

    const addTag = (e) => {
      e?.preventDefault();
      if (!inputValue.trim()) return;
      
      const newTags = [...tags, inputValue.trim()];
      handleOptionChange(field, newTags.join(", "));
      setInputValue("");
    };

    const removeTag = (indexToRemove) => {
      const newTags = tags.filter((_, idx) => idx !== indexToRemove);
      handleOptionChange(field, newTags.join(", "));
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag();
      }
    };

    return (
      <div className="bg-white p-4 border border-slate-200 rounded-[2px] shadow-sm flex flex-col h-full">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
          {label}
        </label>
        
        {/* Список тегов */}
        <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1.5 rounded-[2px] flex items-center gap-2 group transition-colors hover:bg-slate-200">
              {tag}
              <button type="button" onClick={() => removeTag(idx)} className="text-slate-400 hover:text-red-600 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-[10px] text-slate-400 italic">Žiadne možnosti...</span>
          )}
        </div>

        {/* --- ИСПРАВЛЕННЫЙ АДАПТИВНЫЙ БЛОК ИНПУТА И КНОПКИ --- */}
        <div className="flex flex-col 2xl:flex-row gap-2 mt-auto pt-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nová možnosť..."
            className="flex-1 w-full min-w-0 text-xs p-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-[2px] outline-none focus:border-[#dc2626] transition-colors shadow-sm"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!inputValue.trim()}
            className="shrink-0 w-full 2xl:w-auto justify-center bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-[2px] text-[10px] font-bold uppercase transition-colors hover:bg-[#dc2626] flex items-center gap-1"
          >
            <Plus size={14} /> Pridať
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <main className={`flex-1 flex flex-col items-center px-4 ${editMode ? 'pt-10' : 'pt-[max(120px,8vw)]'} pb-20 transition-all duration-500`}>
        
        <div className="w-full max-w-6xl bg-white flex flex-col lg:flex-row shadow-2xl rounded-none overflow-hidden min-h-fit lg:min-h-[700px] border border-slate-200">
          
          <div className="flex-[1.4] p-8 sm:p-10 lg:p-14 flex flex-col justify-center order-2 lg:order-1 bg-white relative">
            
            {editMode && (
              <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-[2px] shadow-inner">
                <div className="flex items-center gap-2 mb-6 text-[#dc2626]">
                   <Settings2 size={16} />
                   <h3 className="text-[10px] font-black uppercase tracking-widest">// Nastavenie formulára</h3>
                </div>
                
                {/* НОВАЯ УДОБНАЯ СЕТКА С ТЕГАМИ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <OptionEditor label="Výšky plotu" field="vyska" />
                  <OptionEditor label="Prevedenie" field="prevedenie" />
                  <OptionEditor label="Druh betónu" field="beton" />
                  <OptionEditor label="Farby" field="farba" />
                </div>
              </div>
            )}

            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase leading-none">
              Nezáväzný dopyt
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 italic">// Získajte_cenovú_ponuku</p>
            
            <ContactForm options={options} />
          </div>

          <div className="flex-1 bg-[#d90416] text-white p-8 sm:p-12 flex flex-col justify-between order-1 lg:order-2 gap-12 relative">
            
            {isSaving && (
              <div className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                <Loader2 size={10} className="animate-spin" /> Syncing_Data
              </div>
            )}

            <div className="space-y-6">
              <Building2 size={40} className="opacity-90 mb-4" />
              
              <div className="space-y-6">
                <div className={!data.show_firma && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_firma" label="Viditeľnosť: Firma" />
                  {(data.show_firma || editMode) && (
                    <p {...editProps("firma")} className={`font-black text-3xl leading-none uppercase tracking-tighter ${editProps("firma").className}`}>{data.firma}</p>
                  )}
                </div>

                <div className={!data.show_adresa && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_adresa" label="Viditeľnosť: Adresa" />
                  {(data.show_adresa || editMode) && (
                    <p {...editProps("adresa")} className={`text-base opacity-90 font-medium leading-snug uppercase tracking-tight ${editProps("adresa").className}`}>{data.adresa}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-8 space-y-4 border-t border-white/20">
                <div className={!data.show_ico && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_ico" label="IČO" />
                  {(data.show_ico || editMode) && (
                    <p className="text-[11px] font-mono opacity-80 uppercase tracking-widest">IČO: <span {...editProps("ico")}>{data.ico}</span></p>
                  )}
                </div>

                <div className={!data.show_dic && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_dic" label="DIČ" />
                  {(data.show_dic || editMode) && (
                    <p className="text-[11px] font-mono opacity-80 uppercase tracking-widest">DIČ: <span {...editProps("dic")}>{data.dic}</span></p>
                  )}
                </div>

                <div className={!data.show_icdph && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_icdph" label="IČ DPH" />
                  {(data.show_icdph || editMode) && (
                    <p className="text-[11px] font-mono opacity-80 uppercase tracking-widest">IČ DPH: <span {...editProps("icdph")}>{data.icdph}</span></p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className={!data.show_tel && editMode ? 'opacity-40' : ''}>
                <AdminToggle field="show_tel" label="Telefón" />
                {(data.show_tel || editMode) && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone size={14} className="opacity-60" />
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Hotline</h4>
                    </div>
                    <p {...editProps("tel")} className={`text-2xl font-black tracking-tighter ${editProps("tel").className}`}>{data.tel}</p>
                  </div>
                )}
              </div>

              <div className={!data.show_email && editMode ? 'opacity-40' : ''}>
                <AdminToggle field="show_email" label="E-mail" />
                {(data.show_email || editMode) && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail size={14} className="opacity-60" />
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Official_Email</h4>
                    </div>
                    <p {...editProps("email")} className={`text-xl font-bold border-b border-white/20 pb-1 tracking-tight break-all ${editProps("email").className}`}>{data.email}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}