import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectFoldersProps, ProjectItem } from "@/src/types";

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
                    ? isDark
                      ? "bg-gradient-to-t from-[#0B0E14] to-[#1E293B] border-t-2 border-l border-r border-[#3b82f6]/50 shadow-[0_-8px_20px_rgba(37,99,235,0.12)] scale-[1.02] -translate-y-[2px]"
                      : "bg-gradient-to-t from-white to-slate-50 border-t-2 border-l border-r border-blue-500/30 shadow-[0_-8px_20px_rgba(37,99,235,0.08)] scale-[1.02] -translate-y-[2px]"
                    : isDark
                      ? "bg-[#161B22]/60 border-t border-l border-r border-white/5 opacity-60 hover:opacity-100 hover:bg-[#161B22]/100"
                      : "bg-slate-200/60 border-t border-l border-r border-slate-300 opacity-60 hover:opacity-100 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-mono text-[9px] md:text-[10px] font-bold transition-colors duration-300 ${isActive ? "text-blue-500" : "text-slate-500"}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[9px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${isActive ? (isDark ? "text-white" : "text-slate-900") : (isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-400 group-hover:text-slate-600")}`}
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
                  <div className={`absolute -bottom-[2px] left-0 right-0 h-[4px] z-30 ${isDark ? "bg-[#0B0E14]" : "bg-white"}`} />
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
            <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-r from-[#0B0E14]/95 via-[#0B0E14]/80 to-[#0B0E14]/60" : "bg-gradient-to-r from-white/95 via-white/80 to-white/60"}`} />
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

              {/* Action Links positioned bottom right */}
              <div className="pt-8 flex justify-end items-center gap-4 transform -translate-y-3 md:translate-y-0 md:translate-x-4">
                {activeProject.id && (
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={`/project/${activeProject.id}`}
                      className="group inline-flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-7 md:px-9 py-3.5 md:py-4 rounded-2xl font-black text-[8.5px] md:text-[10.5px] tracking-[0.2em] uppercase transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
                    >
                      {labels?.caseStudyBtn || "Lihat Selengkapnya"}{" "}
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </motion.div>
                )}

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