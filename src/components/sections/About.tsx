import React from "react";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { SectionHeader, AnimatedCounter } from "../UIComponents";
import { PhotoCarousel } from "../Visuals";
import { SectionProps } from "../../types";

type AboutProps = SectionProps;

export function About({ isDark, t }: AboutProps) {
  return (
    <section
      id="about"
      className={`py-20 transition-colors overflow-hidden ${isDark ? "bg-slate-900/30" : "bg-slate-100"}`}
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SectionHeader
          title={t.aboutHeader}
          subTitle={t.aboutSub}
          icon={User}
          isDark={isDark}
        />
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-stretch text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="flex flex-col justify-between h-full space-y-8"
          >
            <div className="space-y-6">
              <p
                className={`text-sm sm:text-base md:text-[clamp(0.875rem,2vw,1.125rem)] lg:text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-pretty ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {t.aboutText}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:gap-6 mt-auto">
              <div
                className={`p-5 lg:p-6 border rounded-3xl transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <h4 className="text-blue-500 font-black text-2xl lg:text-3xl">
                  <AnimatedCounter to={200} />+
                </h4>
                <p
                  className={`text-xs lg:text-sm font-bold uppercase tracking-widest mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {t.stat1}
                </p>
              </div>
              <div
                className={`p-5 lg:p-6 border rounded-3xl transition-all hover:scale-[1.02] ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <h4 className="text-blue-500 font-black text-2xl lg:text-3xl">
                  <AnimatedCounter to={40} />+
                </h4>
                <p
                  className={`text-xs lg:text-sm font-bold uppercase tracking-widest mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {t.stat2}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="relative aspect-square md:aspect-auto md:min-h-full w-full"
          >
            <PhotoCarousel isDark={isDark} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
