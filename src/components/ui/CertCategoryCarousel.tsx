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
} from "@/src/types";
import { ComponentType } from "react";

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

export function CertCategoryCarousel({
  categories,
  descriptions,
  isDark,
  viewCertBtnText,
  seeMoreBtnText,
  t,
}: {
  categories: CertCategory[];
  descriptions: CertDescriptions;
  isDark: boolean;
  viewCertBtnText: string;
  seeMoreBtnText: string;
  t: any; // translation function
}) {
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
  const [index, setIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
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

  return (
    <div className="w-full flex flex-col items-center">
      {/* Category Slider Container */}
      <div className="relative w-full h-[320px] md:h-[420px] flex items-center justify-center overflow-visible py-10">
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-0.5 md:px-4 z-30 -translate-y-1/2 pointer-events-none max-w-6xl mx-auto w-full">
          <button
            onClick={prev}
            className={`p-2 md:p-3 rounded-full border pointer-events-auto transition-all ${isDark ? "bg-slate-800 border-white/10 text-white hover:bg-blue-600" : "bg-white border-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white"}`}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={next}
            className={`p-2 md:p-3 rounded-full border pointer-events-auto transition-all ${isDark ? "bg-slate-800 border-white/10 text-white hover:bg-blue-600" : "bg-white border-slate-200 text-slate-800 hover:bg-blue-600 hover:text-white"}`}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
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
                  className={`absolute w-[240px] md:w-[320px] h-[260px] md:h-[320px] rounded-[2.5rem] border flex flex-col items-center justify-center text-center transition-all duration-500 overflow-hidden group ${
                    isActive
                      ? "border-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_30px_rgba(59,130,246,0.2)]"
                      : "border-white/10"
                  }`}
                >
                  {/* 1. Background Image Effect */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={cat.items?.[0]?.image || ""}
                      alt=""
                      className={`w-full h-full object-cover transition-transform duration-1000 ${
                        isActive
                          ? "scale-125 blur-[4px]"
                          : "scale-100 blur-[10px]"
                      } opacity-50`}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${
                        isDark
                          ? "from-slate-900/40 via-slate-900/80 to-slate-900"
                          : "from-white/40 via-white/80 to-white"
                      }`}
                    />
                  </div>

                  {/* 2. Floating Icon Box (DIPERBAIKI: Hapus strokeWidth) */}
                  <div
                    className={`relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center border backdrop-blur-2xl mb-6 transition-all duration-500 ${
                      isActive
                        ? "bg-blue-500/20 border-blue-400/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110"
                        : "bg-white/5 border-white/10 text-slate-500"
                    }`}
                  >
                    {/* Cukup gunakan properti size saja agar tidak error */}
                    <Icon size={isActive ? 32 : 24} />

                    {isActive && (
                      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full z-[-1]" />
                    )}
                  </div>

                  {/* 3. Category Name & Badge */}
                  <div className="relative z-10 px-6">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2 block">
                      {t.collectionLabel || "Collection"}
                    </span>
                    <h4
                      className={`text-lg md:text-2xl font-black tracking-tighter leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      } ${!isActive && "opacity-50"}`}
                    >
                      {cat.name}
                    </h4>

                    <p
                      className={`text-[10px] md:text-xs mt-3 font-medium transition-opacity duration-500 ${
                        isActive ? "text-slate-400 opacity-100" : "opacity-0"
                      }`}
                    >
                      {cat.items?.length || 0}{" "}
                      {t.certsEarnedLabel || "Certificates Earned"}
                    </p>
                  </div>

                  {/* 4. Action Button */}
                  {isActive && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() =>
                        setExpandedId(expandedId === cat.id ? null : cat.id)
                      }
                      className="relative z-10 mt-8 px-6 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                    >
                      {expandedId === cat.id ? "Close Details" : seeMoreBtnText}
                    </motion.button>
                  )}

                  {/* 5. Glass Reflection Shine (Animasi Cahaya Lewat) */}
                  {isActive && (
                    <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: "linear",
                          repeatDelay: 1,
                        }}
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      />
                    </div>
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
