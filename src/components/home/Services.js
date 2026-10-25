"use client";
import { useState } from "react";
import { saveContent } from "@/actions/adminActions";
import {
  Wrench, Ruler, Calculator, Truck, Paintbrush,
  FileText, ShieldCheck, Hammer, HardHat, CheckCircle, Home, Map
} from "lucide-react";

// Индустриальные иконки с единым стилем (strokeWidth=1.5 для тонких линий)
const iconStyle = { className: "text-[#dc2626]", size: 36, strokeWidth: 1.5 };

const iconLibrary = {
  Ruler: <Ruler {...iconStyle} />,
  Wrench: <Wrench {...iconStyle} />,
  Calculator: <Calculator {...iconStyle} />,
  Truck: <Truck {...iconStyle} />,
  Paintbrush: <Paintbrush {...iconStyle} />,
  FileText: <FileText {...iconStyle} />,
  ShieldCheck: <ShieldCheck {...iconStyle} />,
  Hammer: <Hammer {...iconStyle} />,
  HardHat: <HardHat {...iconStyle} />,
  CheckCircle: <CheckCircle {...iconStyle} />,
  Home: <Home {...iconStyle} />,
  Map: <Map {...iconStyle} />
};

const defaultData = {
  hlavnyNadpis: "Kompletný servis",
  podnadpis: "Od prvého kontaktu až po hotový plot. Všetko pod jednou strechou.",

  s1_titul: "ZAMERANIE PLOTU",
  s1_popis: "Presné zameranie na mieste stavby pre bezchybnú realizáciu.",
  s1_icon: "Ruler",

  s2_titul: "ODBORNÉ PORADENSTVO",
  s2_popis: "Pomôžeme vám vybrať správny typ plotu pre váš pozemok.",
  s2_icon: "Wrench",

  s3_titul: "CENOVÁ KALKULÁCIA",
  s3_popis: "Transparentná cenová ponuka bez skrytých poplatkov.",
  s3_icon: "Calculator",

  s4_titul: "KOMPLETNÁ MONTÁŽ",
  s4_popis: "Profesionálna montáž vrátane výkopových prác a osadenia stĺpov.",
  s4_icon: "Truck",

  s5_titul: "STRIEKANIE A RENOVÁCIA",
  s5_popis: "Obnovíme vzhľad vašich existujúcich betónových plotov.",
  s5_icon: "Paintbrush",

  s6_titul: "OHLASOVACIA POVINNOSŤ",
  s6_popis: "Zabezpečíme všetky potrebné dokumenty pre stavebný úrad.",
  s6_icon: "FileText",
};

// КАРТОЧКА УСЛУГИ (Elite Industrial 2.0)
const ServiceCard = ({ index, titulField, popisField, iconField, content, editMode, getEditableProps, handleIconChange }) => (
  <div className="group relative bg-white p-8 lg:p-12 rounded-[2px] transition-shadow duration-[800ms] hover:shadow-2xl overflow-hidden flex flex-col h-full z-10">

    {/* ИНДЕКС (01, 02...) */}
    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-300 font-black mb-8">
      0<span className="font-mono">{index}</span>
    </div>

    {/* ИКОНКА + ВЫБОР ИКОНКИ (АДМИН) */}
    <div className="mb-8 flex justify-between items-start">
      <div className="transform-gpu transition-transform duration-[800ms] ease-out group-hover:scale-110 group-hover:-translate-y-1">
        {iconLibrary[content[iconField]] || iconLibrary.CheckCircle}
      </div>

      {editMode && (
        <select
          value={content[iconField]}
          onChange={(e) => handleIconChange(iconField, e)}
          className="text-[9px] uppercase font-black tracking-widest bg-slate-50 text-[#dc2626] border-none outline-none focus:ring-1 focus:ring-[#dc2626] rounded-[2px] py-2 px-3 cursor-pointer shadow-sm z-50 relative"
        >
          {Object.keys(iconLibrary).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      )}
    </div>

    {/* ТЕКСТОВАЯ ЧАСТЬ */}
    <h3 {...getEditableProps(titulField)} className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none relative z-10">
      {content[titulField]}
    </h3>

    <p {...getEditableProps(popisField)} className="text-slate-500 leading-relaxed font-medium text-sm flex-1 relative z-10">
      {content[popisField]}
    </p>

    {/* PROGRESS BAR 800ms */}
    <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-[800ms] ease-out z-20"></span>
  </div>
);

export default function Services({ editMode = false, dbData = defaultData }) {
  const [content, setContent] = useState({ ...defaultData, ...dbData });

  const handleBlur = async (field, event) => {
    const newText = event.target.innerText.trim();
    if (newText !== content[field]) {
      const updatedContent = { ...content, [field]: newText };
      setContent(updatedContent);
      await saveContent("domov", "domov-sluzby", updatedContent);
    }
  };

  const handleIconChange = async (field, event) => {
    const newIconName = event.target.value;
    const updatedContent = { ...content, [field]: newIconName };
    setContent(updatedContent);
    await saveContent("domov", "domov-sluzby", updatedContent);
  };

  const getEditableProps = (field) => {
    if (!editMode) return {};
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => handleBlur(field, e),
      className: "outline-none hover:bg-slate-100 focus:bg-slate-100 focus:ring-1 focus:ring-[#dc2626] transition-all rounded-[2px] p-1 -ml-1 cursor-text",
      title: "Kliknite pre úpravu"
    };
  };



  return (
    <section id="sluzby" className={`py-24 lg:py-40 bg-[#f8fafc] font-sans relative ${editMode ? 'ring-2 ring-inset ring-[#dc2626]' : ''}`}>

      {/* ПЛАШКА АДМИНА */}
      {editMode && (
        <div className="absolute top-0 left-0 bg-[#dc2626] text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest z-50 rounded-br-[2px]">
          Admin / Edit Mode
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* HEADER: Архитектурный левый край */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 border-l-4 border-[#dc2626] pl-6 md:pl-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">
                Služby
              </span>
            </div>
            <h2
              {...getEditableProps("hlavnyNadpis")}
              className="text-5xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] break-words"
            >
              {content.hlavnyNadpis}
            </h2>
          </div>
          <p
            {...getEditableProps("podnadpis")}
            className="text-slate-500 text-sm font-medium uppercase tracking-tight max-w-sm leading-relaxed"
          >
            {"// "}{content.podnadpis}
          </p>
        </div>

        {/* СЕТКА БЕЗ БОРДЕРОВ (с gap-6 md:gap-8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="1" titulField="s1_titul" popisField="s1_popis" iconField="s1_icon" />
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="2" titulField="s2_titul" popisField="s2_popis" iconField="s2_icon" />
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="3" titulField="s3_titul" popisField="s3_popis" iconField="s3_icon" />
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="4" titulField="s4_titul" popisField="s4_popis" iconField="s4_icon" />
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="5" titulField="s5_titul" popisField="s5_popis" iconField="s5_icon" />
          <ServiceCard content={content} editMode={editMode} getEditableProps={getEditableProps} handleIconChange={handleIconChange} index="6" titulField="s6_titul" popisField="s6_popis" iconField="s6_icon" />
        </div>
      </div>
    </section>
  );
}
