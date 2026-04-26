import { getContent } from "@/actions/adminActions";
import KontaktClient from "@/components/contact/KontaktClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminKontaktPage() {
  const dbData = await getContent("kontakt", "informacie");

  const defaultData = {
    firma: "BART Complex s.r.o.",
    show_firma: true,
    adresa: "Novojelčanská 845/63 925 23 Jelka",
    show_adresa: true,
    ico: "51921979",
    show_ico: true,
    dic: "2120839974",
    show_dic: true,
    icdph: "SK2120839974",
    show_icdph: true,
    tel: "0911 640 097",
    show_tel: true,
    email: "info@beton-plotysk.sk",
    show_email: true,
    map_link: "", 
    show_map: true
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans">
      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-10">
        
        {/* Кнопка возврата в панель управления */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 shadow-sm border border-slate-200">
          <Link 
            href="/admin/editor" 
            className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#d90416] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
            Späť do Dashboardu
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d90416]">
            Mode: Live_Editor_Active
          </div>
        </div>

        {/* Здесь editMode всегда TRUE, потому что мы внутри защищенной админки */}
        <div className="border border-slate-200 shadow-2xl">
          <KontaktClient 
            editMode={true} 
            initialData={dbData || defaultData} 
          />
        </div>
      </div>
    </div>
  );
}