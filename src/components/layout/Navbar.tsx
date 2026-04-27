import React from "react";
import {
  Menu,
  Sun,
  Moon,
  Languages,
  Volume2,
  VolumeX,
  Mail,
} from "lucide-react";
import { NavbarProps } from "../../types";

export function Navbar({
  scrolled,
  isDark,
  setIsDark,
  lang,
  setLang,
  toggleMusic,
  isMusicPlaying,
  setIsMenuOpen,
  t,
  navEnKeys,
}: NavbarProps) {
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? (isDark ? "bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-white/80 backdrop-blur-md border-b border-slate-200 py-4") : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-full">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`lg:hidden p-2 rounded-xl border transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-lg sm:text-xl xl:text-2xl tracking-tighter uppercase leading-none ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {t.badge}
            </span>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8 text-sm font-medium px-4">
          {t.nav.map((item: string, idx: number) => (
            <a
              key={idx}
              href={`#${navEnKeys[idx]}`}
              className={`transition-colors uppercase tracking-widest text-[9px] xl:text-[10px] whitespace-nowrap ${isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"}`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full border transition-all ${isDark ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"}`}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "id" : "en")}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] font-bold transition-all group ${isDark ? "bg-white/5 border-white/10 text-slate-300 hover:bg-blue-600 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white"}`}
          >
            <Languages
              size={14}
              className="group-hover:rotate-12 transition-transform"
            />
            <span className="uppercase tracking-widest leading-none">
              {lang === "en" ? "ID" : "EN"}
            </span>
          </button>
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-full border transition-all flex items-center justify-center relative ${isDark ? "bg-white/5 border-white/10 text-blue-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200"}`}
            title="Perunggu - Gemilang"
          >
            {isMusicPlaying ? (
              <Volume2 size={17} className="animate-pulse" />
            ) : (
              <VolumeX size={17} />
            )}
          </button>
          <a
            href="#contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 xl:px-5 py-2 rounded-full transition-all shadow-lg active:scale-95 text-[10px] font-bold uppercase whitespace-nowrap"
          >
            {t.contactBtn}
          </a>
        </div>

        <a
          href="#contact"
          className="lg:hidden bg-blue-600 text-white p-2 rounded-full shadow-lg active:scale-95 flex-shrink-0"
        >
          <Mail size={18} />
        </a>
      </div>
    </nav>
  );
}
