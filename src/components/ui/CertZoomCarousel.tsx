import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CertZoomCarouselProps, CertItem } from "@/src/types";

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