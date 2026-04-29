"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "O nás", href: "/#onas" },
    { name: "Služby", href: "/#sluzby" },
    { name: "Realizácie", href: "/realizacie" },
    { name: "Kontakt", href: "/kontakt" },
    // { name: "admin", href: "/admin" },
  ];

  return (
<nav 
    className="fixed w-full z-50 transition-all duration-300 bg-white/95 shadow-sm py-4" 
    style={{ WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)' }}
  >      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-slate-900">
              BETONISSIMO<span className="text-red-600">.SK</span>
            </Link>
          </div>

          {/* Десктопное меню */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-red-600"
              >
                {link.name}
              </Link>
            ))}

          </div>

          {/* Мобильная кнопка */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="relative z-[100] p-2 text-slate-700" // Высокий z-index
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
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
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
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

