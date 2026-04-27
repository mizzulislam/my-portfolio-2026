import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useMotionValue,
  useMotionTemplate,
} from "motion/react";

export function InteractiveGrid({ isDark }: { isDark: boolean }) {
  const mouseX = useMotionValue(-500); // Start off-screen
  const mouseY = useMotionValue(-500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate position relative to container
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.touches[0].clientX - rect.left);
      mouseY.set(e.touches[0].clientY - rect.top);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("touchmove", handleGlobalTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Reactive glowing grid - Sharp, focused glow with extra neon bloom */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black, transparent),
            linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)
          `,
          maskImage: useMotionTemplate`
            radial-gradient(280px circle at ${mouseX}px ${mouseY}px, black, transparent),
            linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)
          `,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          opacity: isDark ? 0.6 : 0.3,
          filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))",
        }}
      />
    </div>
  );
}
import {
  CheckCircle2,
  GraduationCap,
  School,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Calculator,
  Layers,
  Table,
  FileText,
  Presentation,
  BarChart3,
  Database,
  FileDigit,
  Shield,
  Globe,
  Rocket,
  Award,
  ExternalLink,
  MessageSquare,
  Brain,
  Search,
  Zap,
  Lightbulb,
  Trophy,
  Medal,
  FileBadge,
  Users,
  Clock,
  Cpu,
  Folder,
  FolderOpen,
  X,
} from "lucide-react";

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

import {
  SectionHeaderProps,
  EducationCardProps,
  ExperienceRoadmapProps,
  ProjectFoldersProps,
  TechnicalToolsProps,
  SoftSkillsGridProps,
  CertZoomCarouselProps,
  Milestone,
  ProjectItem,
  TechnicalTool,
  SoftSkill,
  HardSkill,
  CertCategory,
  CertDescriptions,
  CertItem,
} from "../types";

export function SectionHeader({
  title,
  subTitle,
  icon: Icon,
  isDark,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-16 w-full px-4">
      <h2
        className={`text-2xl md:text-4xl font-extrabold mb-3 flex flex-wrap items-center justify-center gap-2.5 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
      >
        {Icon && <Icon className="text-blue-500 shrink-0" size={32} />}
        <span>{title}</span>
      </h2>
      <div className="h-1.5 w-24 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] mb-4"></div>
      {subTitle && (
        <p
          className={`max-w-2xl text-sm md:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {subTitle}
        </p>
      )}
    </div>
  );
}

export function AnimatedCounter({
  to,
  duration = 2,
}: {
  to: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (value) => setCount(Math.floor(value)),
      });
      return () => controls.stop();
    } else {
      setCount(0);
    }
  }, [isInView, to, duration]);
  return <span ref={ref}>{count}</span>;
}

export function EducationCard({
  edu,
  idx,
  labels,
  isDark,
}: EducationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: isDark
          ? "0 0 30px rgba(59, 130, 246, 0.15)"
          : "0 15px 40px rgba(0,0,0,0.1)",
      }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ delay: idx * 0.1, duration: 0.5 }}
      className={`border rounded-[2.5rem] overflow-hidden backdrop-blur-xl group hover:border-blue-500/30 transition-all duration-500 shadow-xl ${isDark ? "bg-slate-900/50 border-white/10" : "bg-white/80 border-slate-200"}`}
    >
      <div className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between gap-5 md:gap-4 mb-8 items-start">
          <div className="flex items-start gap-4 w-full md:w-auto flex-1">
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all overflow-hidden bg-white ${isDark ? "border-white/10" : "border-slate-200 shadow-sm"}`}
            >
              {edu.logo ? (
                <img
                  src={edu.logo}
                  alt={edu.institution}
                  className="w-full h-full object-contain p-1.5 md:p-2"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600">
                  {edu.id === "sma" ? (
                    <School size={20} className="md:w-6 md:h-6" />
                  ) : (
                    <GraduationCap size={20} className="md:w-6 md:h-6" />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <h3
                className={`text-lg md:text-xl font-bold transition-colors mb-1 ${isDark ? "text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-300" : "text-slate-900 group-hover:text-blue-600"}`}
              >
                {edu.institution}
              </h3>
              <p
                className={`${isDark ? "text-slate-300" : "text-slate-600"} font-medium text-[11px] md:text-sm`}
              >
                {edu.degree}
              </p>
            </div>
          </div>

          {/* Period and GPA: Side-by-side on mobile, stacked on tablet/desktop */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-2 md:gap-1.5 shrink-0">
            <span
              className={`inline-block px-3 py-1 border rounded-full text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? "bg-white/5 border-white/10 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"}`}
            >
              {edu.period}
            </span>
            {edu.gpa && (
              <p
                className={`text-[10px] font-bold uppercase tracking-tighter md:pr-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                GPA:{" "}
                <span className={isDark ? "text-white" : "text-slate-900"}>
                  {edu.gpa}
                </span>
              </p>
            )}
          </div>
        </div>
        <ul className="space-y-3 mb-8">
          {edu.details.map((detail: string, i: number) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm leading-relaxed"
            >
              <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-1" />
              <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                {detail}
              </span>
            </li>
          ))}
        </ul>
        {edu.courses && (
          <div
            className={`border-t pt-6 ${isDark ? "border-white/5" : "border-slate-100"}`}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 font-bold text-sm hover:text-blue-500 transition-colors group/btn ${isDark ? "text-white" : "text-slate-900"}`}
            >
              <BookOpen size={18} className="text-blue-500" />
              <span>{labels.coursesBtn}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                className="text-slate-500 group-hover/btn:text-blue-500"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-6">
                    {edu.courses.map((course: string, i: number) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] md:text-xs font-medium transition-all uppercase tracking-wide ${isDark ? "bg-white/5 border-white/5 text-slate-400 hover:bg-blue-600/10" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-blue-50"}`}
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                        {course}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ExperienceRoadmap({ labels, isDark }: ExperienceRoadmapProps) {
  const milestones = labels.milestones || [];
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, margin: "-100px" });

  return (
    <div
      className="relative w-full pb-8 pt-2 px-4 flex flex-col items-center bg-transparent overflow-hidden"
      ref={containerRef}
    >
      {/* Background Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* MOBILE CONTENT (Vertical) */}
      <div className="block md:hidden w-full relative">
        {/* Pulsing Central Fiber-Optic Line (Vertical) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-800/50 -translate-x-1/2">
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className="w-full bg-gradient-to-b from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]"
          />
        </div>

        <div className="w-full space-y-16 relative z-10 py-6">
          {milestones.map((m: Milestone, i: number) => {
            const NodeIcon = m.icon;
            const isLeft = i % 2 === 0;

            return (
              <div
                key={i}
                className={`relative flex items-center w-full px-2 ${isLeft ? "justify-start" : "justify-end"}`}
              >
                {/* Milestone Platform */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: i * 0.1,
                  }}
                  className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30"
                >
                  <div className="w-8 h-8 rotate-45 rounded-md border-2 flex items-center justify-center bg-slate-950 border-blue-600/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                    <NodeIcon size={12} className="text-blue-400 -rotate-45" />
                  </div>
                </motion.div>

                {/* Card */}
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -15 : 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl border border-white/5 bg-[#161B22]/90 backdrop-blur-xl w-[42%] relative flex flex-col items-start ${isLeft ? "mr-10" : "ml-10"}`}
                >
                  {/* Arrow for mobile */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#161B22] border-white/5 rotate-45 ${isLeft ? "-right-[7px] border-t border-r" : "-left-[7px] border-l border-b"}`}
                  />

                  <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-1 font-mono text-left">
                    {m.year}
                  </span>
                  <div className="h-[1px] w-6 bg-blue-600/40 mb-2" />
                  <p className="text-[10px] font-medium text-white leading-tight text-left line-clamp-3">
                    {m.event}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PC & TABLET CONTENT (Horizontal) */}
      <div className="hidden md:block w-full relative overflow-x-auto no-scrollbar pb-10 pt-2">
        <div className="min-w-[1250px] h-[550px] relative flex flex-col justify-center px-16">
          {/* Horizontal Fiber-Optic Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-800/40 -translate-y-1/2">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 2.8, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]"
            />
          </div>

          <div className="flex justify-between items-center w-full relative z-10">
            {milestones.map((m: Milestone, i: number) => {
              const NodeIcon = m.icon;
              const isUp = i % 2 === 0;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center relative group w-48"
                >
                  {/* Milestone Card (Zig-Zag) */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-64 ${isUp ? "bottom-[calc(100%+32px)]" : "top-[calc(100%+32px)]"}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: isUp ? 20 : -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="p-6 rounded-2xl border border-white/5 bg-[#161B22]/90 backdrop-blur-2xl shadow-2xl relative transition-all duration-300 group-hover:border-blue-500/30 min-h-[150px] flex flex-col items-start justify-start"
                    >
                      {/* Arrow indicator */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#161B22] border-white/5 rotate-45 ${isUp ? "bottom-[-9px] border-r border-b" : "top-[-9px] border-l border-t"}`}
                      />

                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2 font-mono tracking-tighter text-left">
                        {m.year}
                      </span>
                      <div className="h-[2px] w-10 bg-blue-600/40 mb-3" />
                      <p className="text-sm font-medium text-white leading-relaxed text-left whitespace-normal line-clamp-3 overflow-hidden">
                        {m.event}
                      </p>
                    </motion.div>
                  </div>

                  {/* Central Node Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 12,
                      delay: i * 0.05,
                    }}
                    className="relative z-30"
                  >
                    <div className="w-14 h-14 rotate-45 rounded-xl border-4 flex items-center justify-center transition-all bg-slate-950 border-blue-600/70 shadow-[0_0_20px_rgba(37,99,235,0.2)] group-hover:border-blue-400 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]">
                      <NodeIcon
                        size={20}
                        className="text-blue-400 -rotate-45"
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative FinTech Shapes */}
      <div className="absolute top-10 right-[10%] w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-cyan-600/5 rounded-full blur-3xl"></div>
    </div>
  );
}

export function ProjectFolders({
  projects,
  isDark,
  labels,
}: ProjectFoldersProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 px-4">
      {/* Folder Tab Navigation */}
      <div className="flex items-end overflow-x-auto no-scrollbar pt-6 pb-[1px] mx-5 px-1">
        {projects.map((project: ProjectItem, idx: number) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={project.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View details for project: ${project.title}`}
              className={`relative flex-shrink-0 flex flex-col group transition-all duration-300 mr-1.5 ${
                isActive ? "z-20" : "z-10"
              }`}
            >
              {/* The "Tab" Shape */}
              <div
                className={`px-4 md:px-7 py-2.5 md:py-3.5 rounded-t-xl md:rounded-t-2xl relative transition-all duration-500 ${
                  isActive
                    ? "bg-gradient-to-t from-[#0B0E14] to-[#1E293B] border-t-2 border-l border-r border-[#3b82f6]/50 shadow-[0_-8px_20px_rgba(37,99,235,0.12)] scale-[1.02] -translate-y-[2px]"
                    : "bg-[#161B22]/60 border-t border-l border-r border-white/5 opacity-60 hover:opacity-100 hover:bg-[#161B22]/100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-mono text-[9px] md:text-[10px] font-bold transition-colors duration-300 ${isActive ? "text-blue-500" : "text-slate-500"}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[9px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                  >
                    {project.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-blue-500/10 blur-2xl pointer-events-none z-0"
                  />
                )}

                {/* Visual Connection Overlay (only for active) to bridge the border gap */}
                {isActive && (
                  <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-[#0B0E14] z-30" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Folder Body Container - Softened corners */}
      <div
        className={`relative w-full rounded-tl-3xl rounded-tr-3xl rounded-b-3xl border transition-all duration-700 min-h-[500px] flex items-center ${
          isDark
            ? "bg-[#0B0E14] border-[#3b82f6]/30 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),0_0_35px_rgba(37,99,235,0.1)]"
            : "bg-white border-slate-200 shadow-2xl shadow-blue-500/10"
        } p-6 md:p-14 overflow-hidden`}
      >
        {/* Project Image */}
        {activeProject.image && (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-tl-3xl rounded-tr-3xl rounded-b-3xl">
            <img
              src={activeProject.image}
              alt={activeProject.title}
              className="w-full h-full object-cover opacity-30"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/95 via-[#0B0E14]/80 to-[#0B0E14]/60" />
          </div>
        )}

        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-600/[0.04] to-transparent z-[1]" />
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-blue-600/[0.04] to-transparent z-[1]" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeIndex}-${labels.criticalOutputs}`}
            initial={{ opacity: 0, x: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.4 },
            }}
            className="relative z-10 w-full"
          >
            <div className="space-y-12 text-left w-full">
              {/* Header & Description - Category Badge moved above title */}
              <div className="space-y-8 w-full">
                <div className="flex flex-col items-start gap-4">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-2xl border border-white/10 -translate-y-2"
                  >
                    {activeProject.category}
                  </motion.span>

                  <div className="space-y-6 w-full">
                    <h2
                      className={`text-2xl md:text-[43px] font-black tracking-tighter leading-tight text-left ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {activeProject.title}
                    </h2>
                    <p
                      className={`text-[13px] md:text-[17px] font-medium leading-relaxed text-left text-pretty w-full ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {activeProject.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Deliverables Section - translatable label */}
              <div className="space-y-6 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600/50 rounded-full" />
                  <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em] text-left">
                    {labels?.criticalOutputs || "Critical Outputs"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {activeProject.details.map((detail: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 + 0.3 }}
                      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-white/[0.04] border-white/5 hover:bg-white/[0.08]"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50"
                      }`}
                    >
                      <CheckCircle2
                        size={18}
                        className="text-blue-500 shrink-0 mt-0.5"
                      />
                      <p className="text-[11px] md:text-sm font-bold tracking-tight text-left leading-snug">
                        {detail}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Link positioned bottom right */}
              <div className="pt-8 flex justify-end transform -translate-y-3 md:translate-y-0 md:translate-x-4">
                <motion.a
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  href={activeProject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-7 md:px-9 py-3.5 md:py-4 rounded-2xl font-black text-[8.5px] md:text-[10.5px] tracking-[0.2em] uppercase transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
                >
                  {labels?.launchArchive || "Launch Archive"}{" "}
                  <ExternalLink
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface SkillLogoBoxProps {
  skill: TechnicalTool | SoftSkill | HardSkill;
  isDark: boolean;
  type: "tech" | "soft" | "hard";
  beamX?: number | null;
  parentRef?: React.RefObject<HTMLDivElement | null> | null;
}

export function SkillLogoBox({
  skill,
  isDark,
  type,
  beamX = null,
  parentRef = null,
}: SkillLogoBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const cachedX = useRef<number | null>(null);

  // Cache position on mount and resize instead of every mouse move
  useEffect(() => {
    const updateCache = () => {
      if (type === "tech" && boxRef.current && parentRef?.current) {
        const boxRect = boxRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();
        cachedX.current = (boxRect.left + boxRect.right) / 2 + window.scrollX;
      }
    };

    updateCache();
    window.addEventListener("resize", updateCache);
    return () => window.removeEventListener("resize", updateCache);
  }, [type, parentRef]);

  useEffect(() => {
    if (type !== "tech" || beamX === null || cachedX.current === null) {
      setIsRevealed(false);
      return;
    }
    const distance = Math.abs(cachedX.current - beamX);
    const revealed = distance < 55;
    if (revealed !== isRevealed) {
      setIsRevealed(revealed);
    }
  }, [beamX, type, isRevealed]);

  const getStyle = (
    name: string | TechnicalTool | SoftSkill | HardSkill,
    skillType: string,
  ) => {
    const skillName = typeof name === "object" ? name.name : name;
    const n = skillName.toLowerCase();

    if (skillType === "tech") {
      if (n.includes("excel") || n.includes("spreadsheet"))
        return { icon: Table, color: "#10b981" };
      if (n.includes("word")) return { icon: FileText, color: "#3b82f6" };
      if (n.includes("powerpoint") || n.includes("presentation"))
        return { icon: Presentation, color: "#f97316" };
      if (n.includes("myob") || n.includes("zahir"))
        return { icon: Calculator, color: "#6366f1" };
      if (n.includes("google")) return { icon: Globe, color: "#ef4444" };
      if (n.includes("spss") || n.includes("e-views") || n.includes("stata"))
        return { icon: BarChart3, color: "#a855f7" };
      if (n.includes("python")) return { icon: FileDigit, color: "#3b82f6" };
      if (n.includes("office")) return { icon: Layers, color: "#ea4335" };
      return { icon: Cpu, color: "#94a3b8" };
    }

    // Soft Skills specific mapping
    if (skillType === "soft") {
      if (n.includes("communicat") || n.includes("komunikasi"))
        return { icon: MessageSquare, color: "#6366f1" };
      if (n.includes("critical") || n.includes("berpikir kritis"))
        return { icon: Brain, color: "#a855f7" };
      if (n.includes("detail") || n.includes("berorientasi detail"))
        return { icon: Search, color: "#10b981" };
      if (n.includes("fast") || n.includes("pembelajar cepat"))
        return { icon: Zap, color: "#f59e0b" };
      if (n.includes("problem") || n.includes("penyelesaian masalah"))
        return { icon: Lightbulb, color: "#eab308" };
      if (n.includes("team") || n.includes("kerja sama tim"))
        return { icon: Users, color: "#3b82f6" };
      if (n.includes("time") || n.includes("manajemen waktu"))
        return { icon: Clock, color: "#f43f5e" };
      if (n.includes("ethic") || n.includes("etika kerja"))
        return { icon: ShieldCheck, color: "#64748b" };
    }

    if (skillType === "hard") {
      if (n.includes("tax")) return { icon: ShieldCheck, color: "#f59e0b" };
      if (n.includes("finance") || n.includes("statement"))
        return { icon: TrendingUp, color: "#3b82f6" };
      if (n.includes("accounting") || n.includes("bookkeeping"))
        return { icon: Calculator, color: "#10b981" };
      return { icon: Layers, color: "#6366f1" };
    }
    if (n.includes("excel")) return { icon: Table, color: "#217346" };
    if (n.includes("word")) return { icon: FileText, color: "#2B579A" };
    if (n.includes("powerpoint"))
      return { icon: Presentation, color: "#D24726" };
    if (n.includes("spss")) return { icon: BarChart3, color: "#cf102d" };
    if (n.includes("stata")) return { icon: Database, color: "#004a87" };
    if (n.includes("myob")) return { icon: FileDigit, color: "#612d87" };
    if (n.includes("zahir")) return { icon: CheckCircle2, color: "#107c10" };
    return { icon: Globe, color: "#3b82f6" };
  };
  const style = getStyle(skill, type);
  const IconComponent = style.icon;

  if (type === "tech") {
    const tool = skill; // in this case skill is the object {name, logo}
    return (
      <div
        ref={boxRef}
        className="flex flex-col items-center group relative cursor-default perspective-1000"
      >
        <motion.div
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          whileHover={{ rotateY: 180 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-14 h-14 md:w-16 md:h-16 relative"
        >
          {/* Front Face: Icon */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl flex items-center justify-center p-3 border transition-all duration-300 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200 shadow-sm"
            }`}
            style={{ color: style.color }}
          >
            <IconComponent size={28} />
          </div>

          {/* Back Face: Original Logo Photo */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl flex items-center justify-center p-2 border transition-all duration-300 overflow-hidden rotate-y-180 ${
              isDark
                ? "bg-white border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-white border-blue-400 shadow-md"
            }`}
          >
            {(tool as TechnicalTool).logo ? (
              <img
                src={(tool as TechnicalTool).logo}
                alt={(tool as TechnicalTool).name}
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <IconComponent size={28} />
            )}
          </div>
        </motion.div>
        <div className="h-6 mt-1 flex items-center justify-center overflow-visible">
          <span
            className={`text-[9px] font-bold text-center whitespace-nowrap transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
              isRevealed || isDark
                ? "translate-y-0 opacity-100 text-blue-400"
                : "text-blue-600"
            }`}
          >
            {tool.name}
          </span>
        </div>
      </div>
    );
  }

  if (type === "soft") {
    return (
      <motion.div
        whileHover={{ x: 3 }}
        className="flex items-center gap-3 p-1 transition-all duration-300"
      >
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <IconComponent size={18} style={{ color: style.color }} />
        </div>
        <span
          className={`text-xs font-bold tracking-tight transition-colors ${isDark ? "text-slate-200" : "text-slate-800"}`}
        >
          {skill.name}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 h-full ${isDark ? "bg-slate-900/40 border-white/5 hover:border-blue-500/40 hover:bg-slate-800/60" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400"}`}
    >
      <div
        className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${style.color}20`,
          border: `1px solid ${style.color}40`,
        }}
      >
        <IconComponent size={20} style={{ color: style.color }} />
      </div>
      <span
        className={`text-[10px] md:text-[11px] font-bold uppercase tracking-tight leading-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}
      >
        {skill.name}
      </span>
    </motion.div>
  );
}

export function UFOScanner({
  isDark,
  mouseX,
  mouseY,
  isHovering,
}: {
  isDark: boolean;
  mouseX: number;
  mouseY: number;
  isHovering: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        opacity: { duration: 0.4 },
        scale: { type: "spring", stiffness: 200, damping: 15 },
      }}
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="absolute z-[100] pointer-events-none w-14 h-3.5"
    >
      <div className="relative">
        {/* Very Slim UFO Body */}
        <div
          className={`w-14 h-3.5 rounded-full relative ${isDark ? "bg-slate-200" : "bg-slate-400"} shadow-xl border-b border-slate-500/50`}
        >
          {/* Aerodynamic Cockpit */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-3 bg-cyan-400/50 rounded-t-full border border-cyan-200/40 backdrop-blur-sm"></div>

          {/* Compact LEDs */}
          <div className="flex justify-around items-center h-full px-1.5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="w-0.5 h-0.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.9)] animate-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}
              ></div>
            ))}
          </div>

          {/* Micro Emitter */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-white/90 blur-[0.5px]"></div>
        </div>

        {/* Dynamic Broadening Beam */}
        <motion.div
          style={{
            clipPath: "polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)",
            background:
              "linear-gradient(to bottom, rgba(56, 189, 248, 0.35) 0%, rgba(56, 189, 248, 0.08) 60%, transparent 100%)",
          }}
          className="w-56 h-[420px] absolute top-[10px] left-1/2 -translate-x-1/2 -z-10 blur-[2px]"
        />
      </div>
    </motion.div>
  );
}

export function TechnicalCarousel({
  tools,
  isDark,
  isScannerActive,
  globalMouseX,
}: {
  tools: TechnicalTool[];
  isDark: boolean;
  isScannerActive: boolean;
  globalMouseX: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // We'll pass the globalMouseX directly since we can handle the relative
  // calculation more efficiently inside SkillLogoBox or via transforms
  return (
    <div
      ref={containerRef}
      className={`relative select-none min-h-[250px] w-full flex flex-col items-center justify-start transition-all duration-700 ${isScannerActive ? "cursor-crosshair" : "cursor-default"}`}
    >
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-4 place-items-center gap-y-10 gap-x-6 relative z-20 w-full max-w-4xl mx-auto">
        {tools.map((tool: TechnicalTool, idx: number) => (
          <SkillLogoBox
            key={idx}
            skill={tool}
            isDark={isDark}
            type="tech"
            beamX={isScannerActive ? globalMouseX : null}
            parentRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}

const IconMap: Record<
  string,
  ComponentType<{ size?: number; className?: string }>
> = {
  Award,
  Trophy,
  Medal,
  Users,
  FileBadge,
};

import { ComponentType } from "react";

export function CertCategoryCarousel({
  categories,
  descriptions,
  isDark,
  viewCertBtnText,
  seeMoreBtnText,
}: {
  categories: CertCategory[];
  descriptions: CertDescriptions;
  isDark: boolean;
  viewCertBtnText: string;
  seeMoreBtnText: string;
}) {
  const [index, setIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [zoomedItemIndex, setZoomedItemIndex] = useState<number | null>(null);
  const [activeSubItemIndex, setActiveSubItemIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const windowWidth = useWindowWidth();

  const scrollToIndex = (idx: number) => {
    if (scrollRef.current) {
      const itemWidth =
        scrollRef.current.scrollWidth / activeCategory.items.length;
      scrollRef.current.scrollTo({
        left: idx * itemWidth,
        behavior: "smooth",
      });
      setActiveSubItemIndex(idx);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const itemWidth =
        scrollRef.current.scrollWidth / activeCategory.items.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      if (newIndex !== activeSubItemIndex) {
        setActiveSubItemIndex(newIndex);
      }
    }
  };

  const next = () => {
    setExpandedId(null);
    setActiveSubItemIndex(0);
    setIndex((prev) => (prev + 1) % categories.length);
  };
  const prev = () => {
    setExpandedId(null);
    setActiveSubItemIndex(0);
    setIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const activeCategory = categories[index];

  const nextZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomedItemIndex !== null) {
      setZoomedItemIndex((zoomedItemIndex + 1) % activeCategory.items.length);
    }
  };

  const prevZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomedItemIndex !== null) {
      setZoomedItemIndex(
        (zoomedItemIndex - 1 + activeCategory.items.length) %
          activeCategory.items.length,
      );
    }
  };

  const categoryBackgrounds: Record<string, string> = {
    appreciation: "/assets/certificates/appreciation-bangkit-2024.webp",
    completion: "/assets/certificates/completion-google-ai-professional.webp",
    committee: "/assets/certificates/committee-hmps-koordinator.webp",
    competency: "/assets/certificates/competency-piranha-brevet.webp",
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Category Slider Container */}
      <div className="relative w-full h-[320px] md:h-[420px] flex items-center justify-center overflow-visible py-10">
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-2 md:px-4 z-30 -translate-y-1/2 pointer-events-none max-w-6xl mx-auto w-full">
          <button
            onClick={prev}
            className={`p-3 rounded-full border pointer-events-auto transition-all ${isDark ? "bg-slate-800 border-white/10 text-white hover:bg-blue-600" : "bg-white border-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white"}`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className={`p-3 rounded-full border pointer-events-auto transition-all ${isDark ? "bg-slate-800 border-white/10 text-white hover:bg-blue-600" : "bg-white border-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white"}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center justify-center relative w-full h-full">
          <AnimatePresence initial={false}>
            {categories.map((cat: CertCategory, i: number) => {
              const isActive = i === index;
              const diff = i - index;
              let offset = diff;
              if (diff > 2) offset -= categories.length;
              if (diff < -2) offset += categories.length;

              const isVisible = Math.abs(offset) <= 1;
              if (!isVisible) return null;

              const Icon = IconMap[cat.icon] || Award;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1.15 : 0.85,
                    x: offset * (windowWidth < 768 ? 160 : 380),
                    zIndex: isActive ? 20 : 10,
                    filter: isActive ? "blur(0px)" : "blur(2px)",
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className={`absolute w-[240px] md:w-[320px] p-6 md:p-10 rounded-[2.5rem] border flex flex-col items-center text-center transition-all duration-300 overflow-hidden ${
                    isActive
                      ? isDark
                        ? "bg-slate-900 border-blue-500/50 shadow-[0_0_40px_rgba(255,255,255,0.1),0_0_30px_rgba(59,130,246,0.3)]"
                        : "bg-white border-blue-400 shadow-[0_0_40px_rgba(255,255,255,0.8),0_0_30px_rgba(59,130,246,0.2)]"
                      : isDark
                        ? "bg-slate-900/50 border-white/10"
                        : "bg-white border-slate-200"
                  }`}
                >
                  {/* Background Image with Glass Blur */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={categoryBackgrounds[cat.id]}
                      alt=""
                      className={`w-full h-full object-cover opacity-[0.90                                                                                                                                                                                                                                                                                                                                                                                                              ] blur-[2px] transition-transform duration-700 ${isActive ? "scale-110" : "scale-100"}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 ${isDark ? "bg-gradient-to-b from-transparent to-slate-900/40" : "bg-gradient-to-b from-transparent to-white/40"}`}
                    />
                  </div>

                  <div
                    className={`relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border mb-6 transition-all ${
                      isActive
                        ? isDark
                          ? "bg-blue-500/20 border-blue-400 text-blue-400"
                          : "bg-blue-50 border-blue-200 text-blue-600 shadow-lg"
                        : isDark
                          ? "bg-slate-800 border-white/5 text-slate-500"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon size={isActive ? 36 : 28} />
                  </div>

                  <h4
                    className={`relative z-10 text-base md:text-lg font-bold mb-5 tracking-tight leading-tight ${isDark && isActive ? "text-white" : isActive ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {cat.name}
                  </h4>

                  {isActive && (
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === cat.id ? null : cat.id)
                      }
                      className="relative z-10 text-blue-500 text-[6.5px] md:text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 hover:gap-3 transition-all group py-2"
                    >
                      {seeMoreBtnText}
                      <motion.div
                        animate={{ rotate: expandedId === cat.id ? 180 : 0 }}
                      >
                        <ChevronDown size={12} />
                      </motion.div>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded Details Section */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl overflow-hidden px-4"
          >
            <div
              className={`p-8 md:p-14 rounded-[3.5rem] border backdrop-blur-xl mt-4 mb-20 ${isDark ? "bg-slate-900/80 border-white/10 shadow-2xl" : "bg-white/95 border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"}`}
            >
              <div className="px-0 md:px-0">
                <div className="flex gap-3 md:gap-3 items-stretch mb-10 md:mb-16 md:pl-2">
                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "circOut" }}
                    style={{ originY: 0 }}
                    className={`w-0.5 md:w-1.5 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0 bg-blue-600 -ml-1 md:ml-0`}
                  />
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className={`text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed text-left font-medium opacity-90 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    {descriptions[expandedId as keyof CertDescriptions] || ""}
                  </motion.p>
                </div>
              </div>

              {/* Swipeable Carousel / Gallery */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-3 gap-6 md:gap-10 overflow-x-auto md:overflow-x-visible no-scrollbar snap-x snap-mandatory px-2 pb-6 -mx-4 md:mx-0"
              >
                {activeCategory.items.map((item: CertItem, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                    whileHover={{ y: -10 }}
                    onClick={() => setZoomedItemIndex(idx)}
                    className={`group relative aspect-[4/3] w-[85%] sm:w-[60%] md:w-auto flex-shrink-0 snap-center rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${isDark ? "border-white/10 bg-slate-800" : "border-slate-200 bg-slate-50 shadow-md"}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end items-start p-4 md:p-5 text-left md:group-hover:translate-y-0 translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      <div className="transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-500 w-full">
                        <h5 className="text-white text-[10px] sm:text-xs md:text-sm font-bold leading-tight tracking-normal capitalize line-clamp-2 px-1">
                          {item.title}
                        </h5>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Swipe Indicator - Mobile Only */}
              <div className="flex md:hidden justify-center gap-2 mt-6 pb-2">
                {activeCategory.items.map((_: CertItem, i: number) => {
                  const isActive = i === activeSubItemIndex;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => scrollToIndex(i)}
                      whileHover={{
                        scale: 1.2,
                        backgroundColor: "#3b82f6",
                      }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: isActive ? 1.2 : 1,
                        width: isActive ? 16 : 6,
                        backgroundColor: isActive
                          ? "#3b82f6"
                          : isDark
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.1)",
                        opacity: isActive ? 1 : 0.5,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="h-1.5 rounded-full cursor-pointer transition-all"
                      title={activeCategory.items[i].title}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedItemIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/95 backdrop-blur-xl"
            onClick={() => setZoomedItemIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-7xl w-full max-h-full flex items-center justify-center group/modal-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons */}
              <button
                onClick={prevZoom}
                className="absolute left-2 md:left-6 p-3 md:p-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white hover:bg-blue-600 hover:border-blue-500 transition-all z-[120] shadow-2xl"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={nextZoom}
                className="absolute right-2 md:right-6 p-3 md:p-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-white hover:bg-blue-600 hover:border-blue-500 transition-all z-[120] shadow-2xl"
              >
                <ChevronRight size={28} />
              </button>

              <div className="w-full h-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] bg-slate-900 group/modal relative">
                {/* Close Button - Moved inside the box edge */}
                <button
                  onClick={() => setZoomedItemIndex(null)}
                  className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 hover:border-red-500 transition-all z-[130] group/close"
                >
                  <X
                    size={24}
                    className="group-hover/close:rotate-90 transition-transform duration-500"
                  />
                </button>

                <img
                  src={activeCategory.items[zoomedItemIndex].image}
                  alt={
                    activeCategory.items[zoomedItemIndex].title || "Certificate"
                  }
                  className="w-full h-auto max-h-[80vh] md:max-h-[85vh] object-contain mx-auto"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Modal Caption */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto min-w-[280px] max-w-[90%] px-6 py-3 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl flex flex-col items-center">
                  <div className="h-1 w-10 bg-blue-500 rounded-full mb-2.5 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                  <h6 className="text-white font-bold text-[10px] md:text-sm tracking-wide capitalize text-center leading-tight">
                    {activeCategory.items[zoomedItemIndex].title}
                  </h6>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CertZoomCarousel({
  items,
  isDark,
  viewCertBtnText,
}: CertZoomCarouselProps) {
  const [index, setIndex] = useState(0);
  const windowWidth = useWindowWidth();
  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  return (
    <div className="relative w-full py-10 flex flex-col items-center overflow-hidden bg-blue-500/5 rounded-3xl mt-4">
      <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-7xl px-4">
        <button
          onClick={prev}
          className={`p-2 rounded-full border z-20 ${isDark ? "bg-slate-800 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"} hover:bg-blue-600 hover:text-white transition-all`}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center justify-center relative w-full h-[220px] md:h-[450px]">
          <AnimatePresence initial={false}>
            {items.map((cert: CertItem, i: number) => {
              const isCenter = i === index;
              const isVisible =
                Math.abs(i - index) <= 1 ||
                (index === 0 && i === items.length - 1) ||
                (index === items.length - 1 && i === 0);
              if (!isVisible) return null;
              const offset = i - index;
              const xValue = offset * (windowWidth < 768 ? 160 : 380);
              return (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.4,
                    scale: isCenter ? 1.15 : 0.85,
                    x: xValue,
                    zIndex: isCenter ? 10 : 5,
                  }}
                  className="absolute w-[200px] md:w-[450px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900"
                >
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent flex flex-col justify-end items-start p-4 md:p-6 text-left">
                    <h5 className="text-white text-[9px] md:text-sm font-bold leading-tight mb-0 capitalize tracking-normal">
                      {cert.title}
                    </h5>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <button
          onClick={next}
          className={`p-2 rounded-full border z-20 ${isDark ? "bg-slate-800 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"} hover:bg-blue-600 hover:text-white transition-all`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
