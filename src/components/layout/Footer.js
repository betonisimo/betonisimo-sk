import Link from "next/link";
import { getContent } from "@/actions/adminActions";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

export default async function Footer() {
  const footerData = await getContent("global", "footer");

  const d = footerData || {
    firma: "BART Complex s.r.o.", show_firma: true,
    adresa: "Novojelčanská 845/63 925 23 Jelka", show_adresa: true,
    ico: "51921979", dic: "2120839974", icdph: "SK2120839974", show_billing: true,
    email1: "info@beton-plotysk.sk", show_email: true,
    tel: "0911 640 097", show_tel: true,
    fb_link: "https://www.facebook.com/bartcomplex", show_fb: true,
    ig_link: "https://www.facebook.com/bartcomplex", show_ig: true,
    show_widget: true
  };

  return (
    <footer className="bg-black text-white border-t border-neutral-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* PREVÁDZKOVATEĽ */}
          {(d.show_firma || d.show_adresa || d.show_billing) && (
            <div className="space-y-6">
              <h4 className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">// Prevádzkovateľ</h4>
              <div className="text-slate-400 text-xs leading-relaxed space-y-4">
                {d.show_firma && <p className="text-white font-black text-sm uppercase tracking-tighter">{d.firma}</p>}
                {d.show_adresa && (
                  <p className="flex items-start gap-3 italic">
                    <MapPin size={14} className="shrink-0 text-neutral-700" />
                    {d.adresa}
                  </p>
                )}
                {d.show_billing && (
                  <div className="pt-4 border-t border-neutral-900 space-y-1 font-mono text-[10px]">
                    {d.show_ico && <p>IČO: {d.ico}</p>}
                    {d.show_dic && <p>DIČ: {d.dic}</p>}
                    {d.show_icdph && <p>IČ DPH: {d.icdph}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KONTAKT */}
          {(d.show_email || d.show_tel) && (
            <div className="space-y-6">
              <h4 className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">// Rýchly kontakt</h4>
              <div className="space-y-6">
                <div className="bg-neutral-900/50 p-4 border-l-2 border-[#dc2626] rounded-[2px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#dc2626] mb-1">Status</p>
                  <p className="text-xs font-bold uppercase tracking-tight">Fungujeme NON-STOP</p>
                </div>
                <div className="space-y-4">
                  {d.show_email && (
                    <a href={`mailto:${d.email1}`} className="flex items-center gap-3 text-xs text-white hover:text-white transition-none cursor-pointer">
                      <Mail size={16} className="text-neutral-700" /> {d.email1}
                    </a>
                  )}
                  {d.show_tel && (
                    <a href={`tel:${d.tel.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-xl font-black tracking-tighter text-white hover:text-white transition-none cursor-pointer">
                      <Phone size={20} className="text-[#dc2626]" /> {d.tel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SOCIÁLNE SIETE */}
          {(d.show_fb || d.show_ig) && (
            <div className="space-y-6">
              <h4 className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">// Sledujte nás</h4>
              <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
                {d.show_fb && (
                  <a href={d.fb_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white hover:text-white transition-none">
                    <span className="p-2 bg-neutral-900 rounded-[2px]"><FacebookIcon /></span>
                    Facebook
                  </a>
                )}
                {d.show_ig && (
                  <a href={d.ig_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white hover:text-white transition-none">
                    <span className="p-2 bg-neutral-900 rounded-[2px]"><InstagramIcon /></span>
                    Instagram
                  </a>
                )}
              </div>
            </div>
          )}

          {/* FB WIDGET */}
          {d.show_widget && (
            <div className="space-y-6">
              <h4 className="text-[#dc2626] text-[10px] font-black uppercase tracking-[0.4em]">// Facebook Feed</h4>
              <div className="bg-neutral-900 border border-neutral-800 p-1 rounded-[2px] overflow-hidden grayscale">
                <iframe
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(d.fb_link)}&tabs=timeline&width=340&height=230&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
                  style={{ width: '100%', height: '230px' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        <div className="pt-12 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest text-center md:text-left leading-relaxed">
            © 2020 - {new Date().getFullYear()} Elite Industrial <br />
            Architectural Concrete Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}