import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Languages, Volume2, VolumeX } from 'lucide-react';

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  lang: 'en' | 'id';
  setLang: (lang: 'en' | 'id') => void;
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  t: any;
  navEnKeys: string[];
}

export function Sidebar({
  isMenuOpen,
  setIsMenuOpen,
  isDark,
  setIsDark,
  lang,
  setLang,
  toggleMusic,
  isMusicPlaying,
  t,
  navEnKeys
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed top-0 left-0 h-full w-4/5 max-sm:w-[85%] z-[70] p-8 lg:hidden shadow-2xl flex flex-col transition-colors ${isDark ? 'bg-[#020617] border-r border-white/5' : 'bg-white border-r border-slate-200'}`}>
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">IZ</div>
                <span className={`font-bold tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Menu</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-xl ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'}`}><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-6 mb-auto">
              {t.nav.map((item: string, idx: number) => (
                <a key={idx} href={`#${navEnKeys[idx]}`} onClick={() => setIsMenuOpen(false)} className={`text-xl font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>{item}</a>
              ))}
            </div>
            <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex gap-4">
                <button onClick={() => setIsDark(!isDark)} className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 border ${isDark ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-slate-50 border-slate-200 text-indigo-600'}`}>
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setLang(lang === 'en' ? 'id' : 'en')} className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                  <Languages size={20} /><span className="font-bold">{lang === 'en' ? 'ID' : 'EN'}</span>
                </button>
                <button onClick={toggleMusic} className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 border ${isDark ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-slate-50 border-slate-200 text-blue-600'}`}>
                  {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-center font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20">{t.contactBtn}</a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
