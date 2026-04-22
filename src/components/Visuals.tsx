import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Square, ChevronLeft, ChevronRight, Coins, TrendingUp } from 'lucide-react';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export function PhotoCarousel({ isDark }: { isDark: boolean }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [viewMode, setViewMode] = useState('carousel'); 
  const windowWidth = useWindowWidth();
  const photos = [ 
    { id: 1, src: "/src/assets/portfolio/izzul-1.png", alt: "Izzul grabbing camera" },
    { id: 2, src: "/src/assets/portfolio/izzul-2.png", alt: "Izzul working with documents" },
    { id: 3, src: "/src/assets/portfolio/izzul-3.png", alt: "Izzul with colleagues" },
    { id: 4, src: "/src/assets/portfolio/izzul-4.jpg", alt: "Izzul passport photo" },
    { id: 5, src: "/src/assets/portfolio/izzul-5.jpeg", alt: "Graduation Side-by-Side" },
  ];
  const imageIndex = Math.abs(page % photos.length);
  const paginate = (newDirection: number) => setPage([page + newDirection, newDirection]);
  
  useEffect(() => {
    if (viewMode === 'carousel') {
      const autoplayTimer = setInterval(() => paginate(1), 3000); 
      return () => clearInterval(autoplayTimer);
    }
  }, [page, viewMode]);

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? (windowWidth < 640 ? 150 : 300) : (windowWidth < 640 ? -150 : -300), opacity: 0, scale: 0.9 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? (windowWidth < 640 ? 150 : 300) : (windowWidth < 640 ? -150 : -300), opacity: 0, scale: 0.9 }),
  };

  return (
    <div className={`relative w-full h-full group overflow-hidden rounded-3xl border ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'} shadow-2xl transition-all duration-500`}>
      <button onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')} className={`absolute top-4 right-4 z-30 p-2 rounded-xl border backdrop-blur-md transition-all ${isDark ? 'bg-black/40 border-white/10 text-white hover:bg-blue-600' : 'bg-white/60 border-slate-300 text-slate-900 hover:bg-blue-600 hover:text-white'}`}>
        {viewMode === 'carousel' ? <LayoutGrid size={18} /> : <Square size={18} />}
      </button>
      <AnimatePresence mode="wait">
        {viewMode === 'carousel' ? (
          <motion.div key="carousel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div key={page} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="absolute inset-0 w-full h-full">
                <img src={photos[imageIndex].src} alt={photos[imageIndex].alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#020617]' : 'from-slate-200'} via-transparent to-transparent opacity-60`}></div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button onClick={() => paginate(-1)} className={`p-2 rounded-full border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-slate-300'} text-blue-600 backdrop-blur-md hover:bg-blue-600 hover:text-white transition-colors shadow-lg`}><ChevronLeft size={20} /></button>
              <button onClick={() => paginate(1)} className={`p-2 rounded-full border ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-slate-300'} text-blue-600 backdrop-blur-md hover:bg-blue-600 hover:text-white transition-colors shadow-lg`}><ChevronRight size={20} /></button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full h-full p-4 overflow-y-auto bg-slate-950/20">
            <div className="grid grid-cols-2 gap-3 pb-4">
              {photos.map((photo, i) => (
                <motion.div key={photo.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="aspect-square rounded-2xl overflow-hidden border border-white/5 relative group/item">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AIRobot({ isDark }: { isDark: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const messages = ["Auto-Compliance", "Tax-Ready", "Fintech Logic"];
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= messages[currentMessage].length) {
        setDisplayText(messages[currentMessage].substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setCurrentMessage((prev) => (prev + 1) % messages.length), 2000); 
      }
    }, 80); 
    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] flex items-center justify-center mb-8 pb-10">
      <div className={`absolute inset-0 rounded-full blur-[80px] animate-pulse ${isDark ? 'bg-blue-600/20' : 'bg-blue-400/10'}`}></div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-full h-full border border-blue-500/10 rounded-full scale-90">
        <motion.div className="absolute -top-6 left-1/2 -translate-x-1/2 p-2.5 sm:p-3 bg-blue-600 rounded-xl shadow-xl z-30"><Coins size={18} className="text-white" /></motion.div>
        <motion.div className="absolute bottom-12 right-0 p-2.5 sm:p-3 bg-emerald-500 rounded-xl shadow-xl z-30"><TrendingUp size={18} className="text-white" /></motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} className={`absolute top-4 -left-4 sm:-left-6 md:-left-12 z-30 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl rounded-bl-none border shadow-2xl backdrop-blur-md flex items-center gap-3 ${isDark ? 'bg-slate-900/90 border-blue-500/30' : 'bg-white/90 border-blue-200'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1"><motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-blue-500" /><motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-blue-500" /></div>
            <span className="text-[6px] sm:text-[7px] font-black text-blue-500 uppercase tracking-widest">Taxologist</span>
          </div>
          <p className={`text-[10px] sm:text-xs font-black tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{displayText}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="inline-block w-[2px] h-3 bg-blue-500 ml-0.5 align-middle" /></p>
        </div>
      </motion.div>
      <motion.div animate={{ rotateX: mousePos.y * -25, rotateY: mousePos.x * 25, y: [0, -20, 0] }} transition={{ rotateX: { type: 'spring', stiffness: 100 }, rotateY: { type: 'spring', stiffness: 100 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} className={`relative z-10 w-44 h-52 sm:w-52 sm:h-60 rounded-[2.5rem] sm:rounded-[3rem] border shadow-2xl flex flex-col items-center p-6 sm:p-8 overflow-hidden backdrop-blur-2xl scale-[0.88] ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-950 border-blue-500/30' : 'bg-gradient-to-br from-slate-50 to-white border-blue-200'}`}>
        <div className={`w-full h-24 sm:h-28 rounded-xl sm:rounded-2xl border flex items-center justify-around px-4 relative overflow-hidden ${isDark ? 'bg-black/60 border-blue-400/20' : 'bg-blue-50/50 border-blue-200'}`}>
          <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-[2px] bg-blue-400/50 shadow-[0_0_10px_rgba(96,165,250,1)] z-0" />
          <motion.div animate={{ x: mousePos.x * 15, y: mousePos.y * 8, scaleY: [1, 1, 0.1, 1] }} transition={{ scaleY: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } }} className="w-5 h-5 bg-blue-400 rounded-full shadow-2xl z-10" />
          <motion.div animate={{ x: mousePos.x * 15, y: mousePos.y * 8, scaleY: [1, 1, 0.1, 1] }} transition={{ scaleY: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] } }} className="w-5 h-5 bg-blue-400 rounded-full shadow-2xl z-10" />
        </div>
        <div className={`mt-10 w-full h-12 rounded-xl p-2 flex items-end gap-1 ${isDark ? 'bg-black/20' : 'bg-blue-50/30'}`}>{[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => (<motion.div key={i} animate={{ height: `${h * 100}%` }} transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }} className="flex-1 bg-blue-500/40 rounded-t-sm" />))}</div>
        <div className="absolute bottom-4 right-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div><span className={`text-[9px] font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>SECURE_V2</span></div>
      </motion.div>
    </div>
  );
}
