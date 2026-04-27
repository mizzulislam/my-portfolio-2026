import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, User, Layers, Terminal, Rocket } from "lucide-react";
import {
  SectionHeader,
  UFOScanner,
  SkillLogoBox,
  TechnicalCarousel,
} from "../UIComponents";
import { Translation } from "../../types";

// Skills punya props tambahan selain isDark & t, jadi kita tulis sendiri
interface SkillsProps {
  isDark: boolean;
  t: Translation; // ← diganti dari any ke Translation
  skillsSectionRef: React.RefObject<HTMLDivElement | null>;
  handleGlobalMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  isTechnicalScannerActive: boolean;
  setIsTechnicalScannerActive: (active: boolean) => void;
  globalMouseX: number;
  globalMouseY: number;
  isSkillsHovering: boolean;
  setIsSkillsHovering: (hovering: boolean) => void;
}

export function Skills({
  isDark,
  t,
  skillsSectionRef,
  handleGlobalMouseMove,
  isTechnicalScannerActive,
  setIsTechnicalScannerActive,
  globalMouseX,
  globalMouseY,
  isSkillsHovering,
  setIsSkillsHovering,
}: SkillsProps) {
  return (
    <section
      id="skills"
      ref={skillsSectionRef}
      onMouseMove={handleGlobalMouseMove}
      onTouchMove={handleGlobalMouseMove}
      onMouseEnter={() => setIsSkillsHovering(true)}
      onMouseLeave={() => setIsSkillsHovering(false)}
      className={`py-12 sm:py-24 transition-colors relative overflow-hidden ${isDark ? "bg-slate-950/50" : "bg-slate-100"}`}
    >
      <AnimatePresence>
        {isTechnicalScannerActive && (
          <UFOScanner
            isDark={isDark}
            mouseX={
              globalMouseX -
              (skillsSectionRef.current?.getBoundingClientRect().left || 0) -
              window.scrollX
            }
            mouseY={globalMouseY}
            isHovering={isSkillsHovering}
          />
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SectionHeader
          title={t.skillsHeader}
          subTitle={t.skillsSub}
          icon={Cpu}
          isDark={isDark}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left items-stretch">
          {/* Soft Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: isDark
                ? "0 0 30px rgba(59, 130, 246, 0.15)"
                : "0 15px 40px rgba(0,0,0,0.1)",
            }}
            viewport={{ once: false }}
            className={`p-8 rounded-[2.5rem] border flex flex-col shadow-xl backdrop-blur-sm h-full ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="h-10 flex items-center gap-3 text-indigo-500 mb-7 shrink-0 -mt-2">
              <User size={24} />
              <h3
                className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Soft Skills
              </h3>
            </div>
            <div className="flex-grow -mt-1">
              <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                {t.softSkills.map((skill: any, idx: number) => (
                  <div key={idx} className={idx % 2 === 0 ? "-ml-2.5" : ""}>
                    <SkillLogoBox
                      skill={skill.name}
                      isDark={isDark}
                      type="soft"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Hard Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: isDark
                ? "0 0 30px rgba(59, 130, 246, 0.15)"
                : "0 15px 40px rgba(0,0,0,0.1)",
            }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className={`p-8 rounded-[2.5rem] border flex flex-col items-start shadow-xl backdrop-blur-sm h-full ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="h-10 flex items-center gap-3 text-blue-500 mb-7 shrink-0 -mt-2">
              <Layers size={24} />
              <h3
                className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Hard Skills
              </h3>
            </div>
            <div className="w-full flex-grow -mt-0">
              <div className="flex flex-wrap justify-start items-start gap-3 sm:gap-4">
                {t.hardSkills.map((skill: any, idx: number) => (
                  <motion.span
                    key={idx}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: isDark
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(59, 130, 246, 0.1)",
                    }}
                    className={`px-4 py-2 md:px-3 md:py-1.5 lg:px-5 lg:py-2.5 rounded-full text-[10px] md:text-[0.7rem] lg:text-xs font-bold border transition-colors cursor-default ${
                      isDark
                        ? "bg-white/5 border-white/10 text-slate-300 hover:text-blue-400 hover:border-blue-500/50"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-400"
                    }`}
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Technical Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: isDark
                ? "0 0 30px rgba(59, 130, 246, 0.15)"
                : "0 15px 40px rgba(0,0,0,0.1)",
            }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
            className={`p-8 rounded-[2.5rem] border flex flex-col shadow-xl backdrop-blur-sm h-full md:col-span-2 lg:col-span-1 ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200"}`}
          >
            <div className="h-10 flex items-center justify-between mb-2 shrink-0 -mt-2">
              <div className="flex items-center gap-3 text-emerald-500">
                <Terminal size={24} />
                <h3
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Technical Skills
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  setIsTechnicalScannerActive(!isTechnicalScannerActive)
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                  isTechnicalScannerActive
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : isDark
                      ? "bg-white/5 border-white/10 text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
                title={
                  isTechnicalScannerActive
                    ? "Deactivate Scanner"
                    : "Activate Scanner"
                }
              >
                <Rocket
                  size={18}
                  className={isTechnicalScannerActive ? "animate-pulse" : ""}
                />
              </motion.button>
            </div>
            <div className="flex-grow pt-1">
              <TechnicalCarousel
                tools={t.technicalTools}
                isDark={isDark}
                isScannerActive={isTechnicalScannerActive}
                globalMouseX={globalMouseX}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
