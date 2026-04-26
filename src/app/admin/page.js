import Link from "next/link";
import { LayoutDashboard, MessageSquare, Phone, Home, Package, Settings, Edit3 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const leadsCount = await prisma.objednavka.count();
  const collections = await prisma.collection.findMany();

  const menuItems = [
    {
      title: "Hlavná stránka",
      desc: "Úprava textov, služieb a recenzií na domovskej stránke",
      icon: <Home size={24} />,
      href: "/admin/editor",
      color: "bg-blue-500"
    },
    {
      title: "Kontakt",
      desc: "Zmena telefónnych čísiel, adries a fakturačných údajov",
      icon: <Phone size={24} />,
      href: "/admin/kontakt",
      color: "bg-red-500"
    }
  ];

  return (
    // UPRAVENÉ: pt-24 pre mobily a md:pt-44 pre PC zabezpečia, že panel nezalezie pod navigáciu
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6 md:pt-44 md:pb-12 md:px-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <LayoutDashboard size={20} />
            <span className="uppercase tracking-widest text-xs font-bold">Administrácia</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            Vitajte v <span className="text-red-600">systéme</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, idx) => {
            const isAnchor = item.href.startsWith("#");
            const Tag = isAnchor ? "a" : Link;

            return (
              <Tag 
                key={idx} 
                href={item.href}
                className="group bg-white p-8 rounded-none border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-600/30 transition-all flex items-start gap-6"
              >
                <div className={`${item.color} text-white p-4 rounded-none shadow-lg group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
}