import React from "react";
import { motion } from "motion/react";
import {
  Zap,
  ExternalLink,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Mail,
} from "lucide-react";
import { InteractiveGrid, TextReveal } from "../ui";
import { AIRobot } from "../Visuals";
import { SectionProps } from "../../types";

// SectionProps sudah berisi { isDark: boolean; t: Translation }
// Tidak perlu tulis ulang — cukup pakai alias dari types.ts
type HeroProps = SectionProps;

export function Hero({ isDark, t }: HeroProps) {
  return (
    <section
      id="hero"
      className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-6 sm:px-10 md:px-20 min-h-[90vh] flex items-center justify-center overflow-hidden relative"
    >
      <InteractiveGrid isDark={isDark} />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 w-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          className="flex-1 text-center lg:text-left z-10 w-full"
        >
          <div
            className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold mb-6 tracking-widest uppercase shadow-xl ${isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"}`}
          >
            <Zap size={14} /> {t.badge}
          </div>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight ${isDark ? "text-white drop-shadow-2xl" : "text-slate-900"}`}
          >
            <TextReveal delay={0.2} className="uppercase block justify-center lg:justify-start">MUHAMMAD IZZUL ISLAM</TextReveal>
          </h1>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl mb-8 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start items-center">
            <div className="flex gap-4 w-full sm:w-auto">
              {/*
                PERBAIKAN: href="#" diganti dengan path ke file CV.
                Letakkan file CV Anda di folder public/ dengan nama
                "CV-Muhammad-Izzul-Islam.pdf" agar link ini berfungsi.
                download="..." = nama file saat user menyimpannya.
              */}
              <a
                href="/CV-Muhammad-Izzul-Islam.pdf"
                target="_blank"
                rel="noreferrer"
                aria-label="Lihat CV Muhammad Izzul Islam dalam format PDF"
                className={`font-bold px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors group shadow-xl text-xs sm:text-base flex-1 sm:flex-none ${isDark ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-black"}`}
              >
                {t.downloadBtn}{" "}
                <ExternalLink
                  size={18}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>

              {/* Hire Me Button - Mobile Only */}
              <a
                href="#contact"
                className={`font-bold px-4 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-colors group shadow-xl text-xs sm:text-base flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white md:hidden`}
              >
                <Mail size={18} />
                <span>{t.contactBtn}</span>
              </a>
            </div>

            <div className="flex gap-3 sm:gap-4 w-full justify-between sm:justify-start sm:w-auto max-sm:px-2">
              {/* PERBAIKAN: aria-label ditambahkan pada setiap ikon sosmed */}
              <a
                href="https://linkedin.com/in/mizzulislam"
                target="_blank"
                rel="noreferrer"
                aria-label="Kunjungi profil LinkedIn Muhammad Izzul Islam"
                className={`w-14 h-14 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"}`}
              >
                <Linkedin size={22} className="text-blue-500" />
              </a>
              <a
                href="https://www.instagram.com/m.izulislm/"
                target="_blank"
                rel="noreferrer"
                aria-label="Kunjungi profil Instagram Muhammad Izzul Islam"
                className={`w-14 h-14 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"}`}
              >
                <Instagram size={22} className="text-blue-500" />
              </a>
              <a
                href="https://www.youtube.com/@izzulzul8749"
                target="_blank"
                rel="noreferrer"
                aria-label="Kunjungi channel YouTube Muhammad Izzul Islam"
                className={`w-14 h-14 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"}`}
              >
                <Youtube size={22} className="text-blue-500" />
              </a>
              <a
                href="https://github.com/mizzulislam"
                target="_blank"
                rel="noreferrer"
                aria-label="Kunjungi profil GitHub Muhammad Izzul Islam"
                className={`w-14 h-14 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"}`}
              >
                <Github size={22} className="text-blue-500" />
              </a>
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
