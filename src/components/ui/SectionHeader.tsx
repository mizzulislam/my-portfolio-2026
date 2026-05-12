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
} from "../../types";

import { TextReveal } from "./TextReveal";

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
        <TextReveal>{title}</TextReveal>
      </h2>
      <div className="h-1.5 w-24 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] mb-4"></div>
      {subTitle && (
        <div
          className={`max-w-2xl text-sm md:text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {subTitle}
        </div>
      )}
    </div>
  );
}
