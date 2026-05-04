import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  MotionValue,
  animate,
  useInView,
  useMotionValue,
  useMotionTemplate,
} from "motion/react";

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
import { EducationCardProps } from "@/src/types";

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
