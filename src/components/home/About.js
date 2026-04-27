"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { saveContent } from "@/actions/adminActions";
import { uploadImage } from "@/actions/uploadActions";

const defaultData = {
  hlavnyNadpis: "Od roku 2009 staviame ploty, ktoré pretrvajú",
  odstavec1: "Pôsobíme na slovenskom trhu od roku 2009. Našou základnou prioritou je spokojnosť zákazníka.",
  odstavec2: "Betónové ploty vyrábame technológiou liatia.",
  odstavec3: "Pôsobíme na Slovensku, v Rakúsku a Poľsku.",
  obrazok: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=2070"
};

export default function About({ editMode = false, dbData = defaultData }) {
  const [content, setContent] = useState({ ...defaultData, ...dbData });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (dbData) setContent({ ...defaultData, ...dbData });
  }, [dbData]);

  const handleBlur = async (field, event) => {
    const newText = event.target.innerText.trim();
    if (newText !== content[field]) {
      const updatedContent = { ...content, [field]: newText };
      setContent(updatedContent);
      await saveContent("domov", "domov-o-nas", updatedContent);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const uploadResult = await uploadImage(formData);
    if (uploadResult.success) {
      const updatedContent = { ...content, obrazok: uploadResult.url };
      setContent(updatedContent);
      await saveContent("domov", "domov-o-nas", updatedContent);
    }
    setIsUploading(false);
  };

  const getEditableProps = (field) => {
    if (!editMode) return {};
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e) => handleBlur(field, e),
      // Индустриальный фокус для полей ввода в админке
      className: "outline-none hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-[#dc2626] transition-all rounded-[2px] p-2 -ml-2",
      title: "Kliknite pre úpravu"
    };
  };

  return (
    <section id="onas" className={`py-24 lg:py-40 bg-white overflow-hidden relative border-t border-slate-200 font-sans ${editMode ? ' ring-inset ring-[#dc2626]' : ''}`}>
      
      {/* ПЛАШКА АДМИНА */}
      {editMode && (
        <div className="absolute top-0 left-0 bg-[#dc2626] text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest z-50 rounded-br-[2px]">
          Admin / Edit Mode
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* ТЕКСТОВАЯ ЧАСТЬ (7 колонок) */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="border-l-4 border-[#dc2626] pl-6 md:pl-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">
                  O spoločnosti
                </span>
              </div>
              <h2 
                {...getEditableProps("hlavnyNadpis")} 
                className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] break-words"
              >
                {content.hlavnyNadpis}
              </h2>
            </div>
            
            <div className="space-y-8 text-sm md:text-base font-medium text-slate-500 uppercase tracking-tight max-w-2xl leading-relaxed pl-1 md:pl-3">
              <p {...getEditableProps("odstavec1")} className="break-words">
                // {content.odstavec1}
              </p>
              
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-[2px] bg-[#dc2626] mt-2.5 shrink-0 rounded-[2px]"></div>
                 <p {...getEditableProps("odstavec2")} className="break-words italic text-slate-700">
                   {content.odstavec2}
                 </p>
              </div>
              
              <p {...getEditableProps("odstavec3")} className="break-words">
                // {content.odstavec3}
              </p>
            </div>
          </div>

          {/* КАРТИНКА (5 колонок) */}
          <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] w-full rounded-[2px] overflow-hidden group shadow-xl">
            
            {/* ТЕХНИЧЕСКИЙ МАРКЕР */}
            <div className="absolute top-6 left-6 text-[10px] font-mono font-bold text-white/70 tracking-widest bg-black/40 px-2 py-1 rounded-[2px] backdrop-blur-sm z-20 transition-colors duration-500 group-hover:bg-[#dc2626] group-hover:text-white">
              REF_ABOUT
            </div>

            {/* ПРОГРЕСС-БАР СНИЗУ */}
            <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#dc2626] group-hover:w-full transition-all duration-[800ms] ease-out z-20"></span>

            {/* ИНТЕРФЕЙС ЗАГРУЗКИ ФОТО (ADMIN) */}
            {editMode && (
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer backdrop-blur-sm"
                >
                   <span className="bg-[#dc2626] text-white text-[10px] uppercase tracking-[0.3em] font-black rounded-[2px] px-8 py-4 shadow-2xl">
                     {isUploading ? "Nahrávam..." : "Vymeniť foto"}
                   </span>
                </div>
            )}
            
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

            {/* ЧИСТАЯ АНИМАЦИЯ: 800ms, scale-100 -> 110, гарантия цвета */}
            <Image
              src={content.obrazok || defaultData.obrazok}
              alt="Elite Industrial About"
              fill
              className={`object-cover filter grayscale scale-100 transition-all duration-[800ms] ease-in-out group-hover:!grayscale-0 group-hover:scale-110 ${isUploading ? 'opacity-30 blur-md' : ''}`}
            />
            
            {/* ГРАДИЕНТ (исчезает при наведении) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-[800ms] group-hover:opacity-20 pointer-events-none z-10"></div>
            
          </div>

        </div>
      </div>
    </section>
  );
}