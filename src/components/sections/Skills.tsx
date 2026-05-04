import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  MotionValue,
  useTransform,
} from "motion/react";
import { Cpu, User, Layers, Terminal, Rocket } from "lucide-react";
import {
  SectionHeader,
  UFOScanner,
  SkillLogoBox,
  TechnicalCarousel,
} from "../UIComponents";
import {
  Translation,
  SoftSkill,
  HardSkill,
  Skill,
  SoftSkillDB,
  HardSkillDB,
} from "../../types";
import { supabase } from "../../lib/supabase";

interface SkillsProps {
  isDark: boolean;
  t: Translation;
  skillsSectionRef: React.RefObject<HTMLDivElement | null>;
  handleGlobalMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  isTechnicalScannerActive: boolean;
  setIsTechnicalScannerActive: (active: boolean) => void;
  globalMouseX: MotionValue<number>;
  globalMouseY: MotionValue<number>;
  isSkillsHovering: boolean;
  setIsSkillsHovering: (hovering: boolean) => void;
  lang: string;
}

export function Skills({
  isDark, t, lang,
  skillsSectionRef, handleGlobalMouseMove,
  isTechnicalScannerActive, setIsTechnicalScannerActive,
  globalMouseX, globalMouseY,
  isSkillsHovering, setIsSkillsHovering,
}: SkillsProps) {
  const [softSkillsDB, setSoftSkillsDB] = useState<SoftSkillDB[]>([]);
  const [hardSkillsDB, setHardSkillsDB] = useState<HardSkillDB[]>([]);
  const [techToolsDB, setTechToolsDB] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const [softRes, hardRes, techRes] = await Promise.all([
          supabase
            .from("soft_skills")
            .select("*")
            .order("order", { ascending: true }),
          supabase
            .from("hard_skills")
            .select("*")
            .order("order", { ascending: true }),
          supabase
            .from("skills")
            .select("*")
            .order("order", { ascending: true }),
        ]);
        if (softRes.data && softRes.data.length > 0)
          setSoftSkillsDB(softRes.data);
        if (hardRes.data && hardRes.data.length > 0)
          setHardSkillsDB(hardRes.data);
        if (techRes.data && techRes.data.length > 0)
          setTechToolsDB(techRes.data);
      } catch (err) {
        console.error("Skills fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSkills();
  }, []);

  // Gunakan data DB jika ada, fallback ke constants
  const softSkills =
    softSkillsDB.length > 0
      ? softSkillsDB.map((s: any) => ({
          ...s,
          name: lang === "id" && s.name_id ? s.name_id : s.name,
        }))
      : t.softSkills;

  const hardSkills =
    hardSkillsDB.length > 0
      ? hardSkillsDB.map((s: any) => ({
          ...s,
          name: lang === "id" && s.name_id ? s.name_id : s.name,
        }))
      : t.hardSkills;
  const techTools =
    techToolsDB.length > 0
      ? techToolsDB.map((s: any) => ({
          name: lang === "id" && s.name_id ? s.name_id : s.name,
          logo: s.logo_url || "",
        }))
      : t.technicalTools;

  const ufoX = useTransform(
    globalMouseX instanceof Object && "get" in globalMouseX
      ? globalMouseX
      : ({ get: () => globalMouseX, on: () => () => {} } as any),
    (val: number) =>
      val -
      (skillsSectionRef.current?.getBoundingClientRect().left || 0) -
      window.scrollX,
  );

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
            key="ufo-scanner"
            isDark={isDark}
            mouseX={ufoX}
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left items-stretch">
            {/* ── Soft Skills Card ── */}
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
              <div className="h-12 flex items-center gap-3 text-indigo-500 mb-6 shrink-0">
                <User size={24} />
                <h3
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Soft Skills
                </h3>
              </div>
              <div className="flex-grow -mt-1">
                <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                  {softSkills.map((skill: any, idx: number) => (
                    <div key={idx} className={idx % 2 === 0 ? "-ml-2.5" : ""}>
                      <SkillLogoBox skill={skill} isDark={isDark} type="soft" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Hard Skills Card ── */}
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
              <div className="h-12 flex items-center gap-3 text-blue-500 mb-6 shrink-0">
                <Layers size={24} />
                <h3
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Hard Skills
                </h3>
              </div>
              <div className="w-full flex-grow">
                <div className="flex flex-wrap justify-start items-start gap-3 sm:gap-4">
                  {hardSkills.map((skill: any, idx: number) => (
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

            {/* ── Technical Skills Card ── */}
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
              <div className="h-12 flex items-center gap-3 mb-6 shrink-0">
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
              <div className="flex-grow overflow-hidden">
                <div className="max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Kita asumsikan TechnicalCarousel berisi grid ikon */}
                  <TechnicalCarousel
                    tools={techTools}
                    isDark={isDark}
                    isScannerActive={isTechnicalScannerActive}
                    globalMouseX={globalMouseX}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
