import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { InteractiveGrid } from '../UIComponents';

export function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [percent, setPercent] = useState(0);
  const [glitchText, setGlitchText] = useState("SECURE_AUTH");
  const glitches = ["ENCRYPTING...", "DASHBOARD_V2", "FIN_LOGIC", "INITIALIZING", "M_IZZUL_ISLAM", "PORTFOLIO_2026"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 1;
        return next > 100 ? 100 : next;
      });
      if (Math.random() > 0.8) {
        setGlitchText(glitches[Math.floor(Math.random() * glitches.length)]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "circIn" }}
      className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-10 overflow-hidden"
    >
      <InteractiveGrid isDark={true} />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-between items-end mb-6 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-1">System Boot</span>
            <motion.span 
              key={glitchText}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-white/30 font-bold"
            >
              {glitchText}
            </motion.span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/20 font-black uppercase mb-1">Progress</span>
            <span className="text-5xl text-white font-black tabular-nums tracking-tighter">{percent}%</span>
          </div>
        </div>

        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px] relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <motion.div 
                key={i} 
                animate={{ 
                  scaleX: [1, 0.4, 0.8, 1],
                  opacity: [0.1, 0.3, 0.1]
                }} 
                transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, ease: "easeInOut" }} 
                className="h-[1px] bg-blue-500/30 w-full origin-left" 
              />
            ))}
          </div>
          <div className="flex flex-col justify-end items-end gap-2">
             <div className="flex items-center gap-2">
               <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[9px] font-mono text-emerald-500/80 uppercase font-black tracking-widest">Live_Secure</span>
             </div>
             <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">AES-256 Enabled</span>
          </div>
        </div>
      </div>

      <motion.div 
        animate={{ 
          opacity: [0, 0.05, 0, 0.08, 0],
          x: [-5, 5, -3, 6, 0],
        }}
        transition={{ repeat: Infinity, duration: 0.15 }}
        className="absolute inset-0 pointer-events-none bg-blue-500/5 mix-blend-overlay"
      />
    </motion.div>
  );
}
