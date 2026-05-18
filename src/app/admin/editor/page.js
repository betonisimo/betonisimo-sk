import { prisma } from "@/lib/prisma";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import Reviews from "@/components/home/Reviews";
import EditorHeader from "@/components/admin/EditorHeader";
import { getContent } from "@/actions/adminActions";
import { getReviewsAction } from "@/actions/reviewActions";
import Benefits from "@/components/shared/Benefits";
import DeleteAllCollectionsBtn from "@/components/admin/DeleteAllCollectionsBtn";
import FooterEditor from "@/components/admin/FooterEditor";
import HeroEditor from "@/components/admin/HeroEditor"; 

export default async function EditorPage() {
  const footerData = await getContent("global", "footer");
  const heroData = await getContent("domov", "hero");
  const collections = await prisma.collection.findMany({ orderBy: { id: 'asc' } });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  const approvedReviews = await getReviewsAction();

  const aboutData = await getContent("domov", "domov-o-nas");
  const servicesData = await getContent("domov", "domov-sluzby");
  const reviewsData = await getContent("domov", "domov-recenzie");
  const benefitsData = await getContent("global", "vyhody");

  // Вспомогательный компонент для заголовка секции в стиле Elite Industrial
  const SectionHeader = ({ title, subtitle, actions }) => (
    <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
      <div className="border-l-4 border-[#dc2626] pl-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">{actions}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-40 flex flex-col font-sans text-slate-900">
      <EditorHeader title="INDUSTRIAL_CONTROL_PANEL" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-16 space-y-24 w-full">
        
        {/* --- HERO SECTION EDITOR --- */}
        <div id="hero-admin" className="bg-white rounded-[2px] shadow-xl overflow-hidden">
          <SectionHeader 
            title="Hero Configuration" 
            subtitle="// Gateway_Visuals / Identity_System" 
          />
          <div className="p-8 md:p-10">
            <HeroEditor dbData={heroData || undefined} />
          </div>
        </div>
        {/* --- SEKCIA: KOLEKCIE --- */}
        <div id="kolekcie" className="bg-white rounded-[2px] shadow-xl overflow-hidden group">
          <SectionHeader 
            title="Kolekcie Plotov" 
            subtitle="// Database_Management / Catalogue_V1" 
            actions={
              <>
                <DeleteAllCollectionsBtn />
                <a href="/admin/collections/new" className="px-8 py-4 bg-[#dc2626] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all duration-300 rounded-[2px] shadow-lg">
                  + Novy katalog
                </a>
              </>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
            {collections.map((col) => (
              <div key={col.id} className="bg-white p-6 flex items-center justify-between group/item hover:bg-slate-50 transition-colors duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16  group-hover/item:-0 transition-all duration-700 bg-cover bg-center rounded-[2px] border border-slate-100" style={{ backgroundImage: col.mainImage ? `url('${col.mainImage}')` : 'none' }}></div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{col.title}</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-1 uppercase tracking-widest">ID: {col.slug}</p>
                  </div>
                </div>
                <a href={`/admin/collections/${col.id}`} className="px-5 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#dc2626] transition-all rounded-[2px]">
                  Edit
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* --- SEKCIA: REALIZÁCIE --- */}
        <div id="realizacie" className="bg-white rounded-[2px] shadow-xl overflow-hidden">
          <SectionHeader 
            title="Portfólio Projektov" 
            subtitle="// Field_Log / Works_2024" 
            actions={
              <a href="/admin/projects/new" className="px-8 py-4 bg-[#dc2626] text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all duration-300 rounded-[2px] shadow-lg">
                + Pridať realizáciu
              </a>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white p-6 flex items-center justify-between group/item hover:bg-slate-50 transition-colors duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16  group-hover/item:-0 transition-all duration-700 bg-cover bg-center rounded-[2px] border border-slate-100" style={{ backgroundImage: proj.mainImage ? `url('${proj.mainImage}')` : 'none' }}></div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{proj.title}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{proj.location || "// Location_Undefined"}</p>
                  </div>
                </div>
                <a href={`/admin/projects/${proj.id}`} className="px-5 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#dc2626] transition-all rounded-[2px]">
                  Edit
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* --- SEKCIA: RECENZIE --- */}
        <div id="recenzie-admin" className="bg-white rounded-[2px] shadow-xl overflow-hidden">
          <SectionHeader 
            title="Recenzie Klientov" 
            subtitle="// User_Feedback / Moderation_Panel" 
            actions={
              <div className="flex gap-3">
                <a href="/admin/reviews" className="px-6 py-4 border-2 border-slate-900 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all rounded-[2px]">
                  Moderovať
                </a>
              
              </div>
            }
          />
          <div className="bg-slate-50 border-t border-slate-100">
             <Reviews editMode={true} dbData={reviewsData || undefined} approvedReviews={approvedReviews} />
          </div>
        </div>

        {/* --- SEKCIA: VÝHODY --- */}
        <div className="bg-white rounded-[2px] shadow-xl overflow-hidden">
           <div className="p-8 md:p-10">
              <div className="mb-12 border-l-4 border-[#dc2626] pl-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">Globálne Výhody</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">// System_Benefits / Core_Specs</p>
              </div>
              <Benefits editMode={true} dbData={benefitsData || undefined} />
           </div>
        </div>

        {/* --- OSTATNÉ EDITORY (About & Services) --- */}
        <div className="space-y-32">
          <div className="bg-white rounded-[2px] shadow-xl overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Section_Editor // About</span>
               <div className="w-12 h-1 bg-[#dc2626]"></div>
            </div>
            <About editMode={true} dbData={aboutData || undefined} />
          </div>
          
          <div className="bg-white rounded-[2px] shadow-xl overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Section_Editor // Services</span>
               <div className="w-12 h-1 bg-[#dc2626]"></div>
            </div>
            <Services editMode={true} dbData={servicesData || undefined} />
          </div>
        </div>
      </div>

      {/* --- FOOTER EDITOR --- */}
      <div id="footer-admin" className="mt-40 bg-white border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <SectionHeader 
            title="Firemné Údaje" 
            subtitle="// Global_Footer / Contacts_&_Links" 
          />
          <div className="p-8 md:p-12">
            <FooterEditor dbData={footerData || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}