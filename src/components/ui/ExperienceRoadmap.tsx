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
import { ExperienceRoadmapProps, Milestone } from "@/src/types";

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