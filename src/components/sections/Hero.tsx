import React from 'react';
import { motion } from 'motion/react';
import { Zap, Download, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import { InteractiveGrid } from '../UIComponents';
import { AIRobot } from '../Visuals';

interface HeroProps {
  isDark: boolean;
  t: any;
}

export function Hero({ isDark, t }: HeroProps) {
  return (
    <section id="hero" className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-6 sm:px-10 md:px-20 min-h-[90vh] flex items-center justify-center overflow-hidden relative">
      <InteractiveGrid isDark={isDark} />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 w-full">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} className="flex-1 text-center lg:text-left z-10 w-full">
          <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold mb-6 tracking-widest uppercase shadow-xl ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}><Zap size={14} /> {t.badge}</div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight ${isDark ? 'text-white drop-shadow-2xl' : 'text-slate-900'}`}>
            <span className="uppercase block">MUHAMMAD IZZUL ISLAM</span>
          </h1>
          <p className={`text-sm sm:text-base md:text-lg lg:text-xl mb-8 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.heroDesc}</p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a href="#" className={`font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center gap-2 transition-colors group shadow-xl text-sm sm:text-base ${isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'}`}>
              {t.downloadBtn} <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            </a>
            <div className="flex gap-3 sm:gap-4">
              <a href="https://linkedin.com/in/mizzulislam" target="_blank" rel="noreferrer" className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}><Linkedin size={18} className="text-blue-500" /></a>
              <a href="https://www.instagram.com/m.izulislm/" target="_blank" rel="noreferrer" className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}><Instagram size={18} className="text-blue-500" /></a>
              <a href="https://www.youtube.com/@izzulzul8749" target="_blank" rel="noreferrer" className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}><Youtube size={18} className="text-blue-500" /></a>
              <a href="https://github.com/mizzulislam" target="_blank" rel="noreferrer" className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}><Github size={18} className="text-blue-500" /></a>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: false }} 
          className="flex-1 flex justify-center relative w-full overflow-visible transition-transform duration-500"
        >
          <AIRobot isDark={isDark} />
        </motion.div>
      </div>
    </section>
  );
}
