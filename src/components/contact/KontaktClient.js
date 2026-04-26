"use client";
import { useState } from "react";
import { saveContent } from "@/actions/adminActions";
import ContactForm from "./ContactForm";
import EditorHeader from "@/components/admin/EditorHeader";
import { Building2, Phone, Mail, Eye, EyeOff, Save, Loader2 } from "lucide-react";

export default function KontaktClient({ editMode, initialData }) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const syncData = async (updatedData) => {
    setIsSaving(true);
    try {
      await saveContent("kontakt", "informacie", updatedData);
    } catch (err) {
      console.error("Chyba pri ukladaní:", err);
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* 1. OPRAVA: Header sa zobrazí len ak nie sme v hlbokom admin menu (voliteľné) */}
      {/* Ak máš v admin/kontakt/page.js vlastnú navigáciu, toto môžeš úplne vymazať */}
      {/* {editMode && <EditorHeader title="Kontakt_Control_Panel" />} */}

      <main className={`flex-1 flex flex-col items-center px-4 
        ${editMode ? 'pt-10' : 'pt-[max(120px,8vw)]'} pb-20 transition-all duration-500`}>
        
        <div className="w-full max-w-5xl bg-white flex flex-col lg:flex-row shadow-2xl rounded-none overflow-hidden min-h-fit lg:min-h-[700px] border border-slate-200">
          
          {/* L'AVÁ ČASŤ: FORMULÁR */}
          <div className="flex-[1.4] p-8 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-center order-2 lg:order-1 bg-white">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase leading-none">
              Napíšte nám
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12 italic">// Kontaktný_Protokol_v1</p>
            <ContactForm />
          </div>

          {/* PRAVÁ ČASŤ: KREDENCIÁLY (ČERVENÝ BLOK) */}
          <div className="flex-1 bg-[#d90416] text-white p-8 sm:p-12 lg:p-12 xl:p-14 flex flex-col justify-between order-1 lg:order-2 gap-12 relative">
            
            {/* Indikátor ukladania (Technický look) */}
            {isSaving && (
              <div className="absolute top-6 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                <Loader2 size={10} className="animate-spin" /> Syncing_Data
              </div>
            )}

            <div className="space-y-6">
              <Building2 size={40} className="opacity-90 mb-4" />
              
              <div className="space-y-6">
                {/* FIRMA */}
                <div className={!data.show_firma && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_firma" label="Viditeľnosť: Firma" />
                  {(data.show_firma || editMode) && (
                    <p {...editProps("firma")} className={`font-black text-3xl leading-none uppercase tracking-tighter ${editProps("firma").className}`}>
                      {data.firma}
                    </p>
                  )}
                </div>

                {/* ADRESA */}
                <div className={!data.show_adresa && editMode ? 'opacity-40' : ''}>
                  <AdminToggle field="show_adresa" label="Viditeľnosť: Adresa" />
                  {(data.show_adresa || editMode) && (
                    <p {...editProps("adresa")} className={`text-base opacity-90 font-medium leading-snug uppercase tracking-tight ${editProps("adresa").className}`}>
                      {data.adresa}
                    </p>
                  )}
                </div>
              </div>
              
              {/* BILLING INFO */}
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

            {/* DIRECT CONTACTS */}
            <div className="space-y-10">
              <div className={!data.show_tel && editMode ? 'opacity-40' : ''}>
                <AdminToggle field="show_tel" label="Telefón" />
                {(data.show_tel || editMode) && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone size={14} className="opacity-60" />
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Hotline</h4>
                    </div>
                    <p {...editProps("tel")} className={`text-2xl font-black tracking-tighter ${editProps("tel").className}`}>
                      {data.tel}
                    </p>
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
                    <p {...editProps("email")} className={`text-xl font-bold border-b border-white/20 pb-1 tracking-tight break-all ${editProps("email").className}`}>
                      {data.email}
                    </p>
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