import React, { useState, useRef, useEffect } from "react";
import { motion, MotionValue } from "motion/react";

export function UFOScanner({
  isDark,
  mouseX,
  mouseY,
  isHovering,
}: {
  isDark: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
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
