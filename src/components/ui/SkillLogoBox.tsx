import React, { useState, useRef, useEffect } from "react";
import { motion, MotionValue } from "motion/react";
import {
  CheckCircle2,
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
  Globe,
  MessageSquare,
  Brain,
  Search,
  Zap,
  Lightbulb,
  Users,
  Clock,
  Cpu,
} from "lucide-react";
import { SoftSkill, HardSkill, TechnicalTool } from "@/src/types";

interface SkillLogoBoxProps {
  skill: TechnicalTool | SoftSkill | HardSkill;
  isDark: boolean;
  type: "tech" | "soft" | "hard";
  beamX?: MotionValue<number> | null
  parentRef?: React.RefObject<HTMLDivElement | null> | null;
}

export function SkillLogoBox({
  skill, isDark, type, beamX = null, parentRef = null,
}: SkillLogoBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Hanya berlaku untuk type tech dengan beamX aktif
    if (type !== "tech" || beamX === null) {
      setIsRevealed(false);
      return;
    }

    const checkReveal = (val: number) => {
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const boxCenterX = (rect.left + rect.right) / 2;
      const distance = Math.abs(boxCenterX - val);
      setIsRevealed(distance < 60);
    };

    // Subscribe ke perubahan MotionValue
    const unsubscribe = beamX.on("change", checkReveal);

    // Cek posisi saat ini juga
    checkReveal(beamX.get());

    return () => unsubscribe();
  }, [beamX, type]);

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