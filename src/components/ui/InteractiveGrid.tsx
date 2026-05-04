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
