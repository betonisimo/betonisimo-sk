"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";

const navLinks = [
  { name: "O nás", href: "/#onas" },
  { name: "Služby", href: "/#sluzby" },
  { name: "Realizácie", href: "/realizacie" },
  { name: "Kontakt", href: "/kontakt" },
  { name: "Vzory", href: "/katalog" },
  { name: "Doplnky", href: "/doplnky" },
  { name: "Blog", href: "/blog" },
];

const Navbar = ({ phone = "0911 640 097", showPhone = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
<nav 
    className="fixed w-full z-50 transition-all duration-300 bg-white/95 shadow-sm py-4" 
    style={{ WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)' }}
  >      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-lg font-bold text-slate-900 sm:text-2xl">
              BETONISSIMO<span className="text-red-600">.SK</span>
            </Link>
          </div>

          {/* Десктопное меню */}
          <div className="hidden items-center gap-3 min-[901px]:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap text-[13px] font-medium text-slate-700 transition-colors hover:text-red-600 xl:text-sm"
              >
                {link.name}
              </Link>
            ))}

            {showPhone && phone && (
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 whitespace-nowrap border-l border-slate-200 pl-3 text-[13px] font-black text-slate-900 transition-colors hover:text-[#dc2626] xl:pl-5 xl:text-sm"
                aria-label={`Zavolať na číslo ${phone}`}
              >
                <Phone size={16} className="text-[#dc2626]" />
                {phone}
              </a>
            )}
          </div>

          {/* Мобильная кнопка */}
          <div className="flex items-center gap-1 min-[901px]:hidden">
            {showPhone && phone && (
              <a
                href={phoneHref}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-black text-slate-900 transition-colors hover:text-[#dc2626] min-[360px]:text-xs sm:text-sm"
                aria-label={`Zavolať na číslo ${phone}`}
              >
                <Phone size={14} className="hidden text-[#dc2626] min-[360px]:block" />
                {phone}
              </a>
            )}

            <button
              type="button"
              className="relative z-[100] p-2 text-slate-700" // Высокий z-index
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Zavrieť menu" : "Otvoriť menu"}
            >
              {/* Вместо сложных анимаций Framer Motion, для теста используй просто иконки */}
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-slate-100 bg-white min-[901px]:hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  {link.name}
                </Link>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
