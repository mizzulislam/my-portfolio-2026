/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { translations } from './constants';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { IntroLoader } from './components/layout/IntroLoader';
import { CustomCursor } from './components/layout/CustomCursor';

// Section Components
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Education } from './components/sections/Education';
import { Experience } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { Certifications } from './components/sections/Certifications';
import { Contact } from './components/sections/Contact';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [lang, setLang] = useState<'en' | 'id'>('id');
  const [isDark, setIsDark] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'work' | 'org'>('work');
  const [scrolled, setScrolled] = useState(false);
  const [isTechnicalScannerActive, setIsTechnicalScannerActive] = useState(false);
  const [globalMouseX, setGlobalMouseX] = useState(0);
  const [globalMouseY, setGlobalMouseY] = useState(0);
  const [isSkillsHovering, setIsSkillsHovering] = useState(false);
  const skillsSectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const t = translations[lang];
  const navEnKeys = ['about', 'education', 'experience', 'projects', 'skills', 'certifications'];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showIntro]);

  const handleGlobalMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (skillsSectionRef.current) {
      const rect = skillsSectionRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setGlobalMouseX(clientX + window.scrollX);
      setGlobalMouseY(clientY - rect.top);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) { 
      audioRef.current.pause(); 
    } else { 
      audioRef.current.play().catch(() => {}); 
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden font-sans transition-colors duration-500 md:cursor-none ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <AnimatePresence>
        {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <audio 
        ref={audioRef} 
        loop 
        src="src/assets/portfolio/perunggu-gemilang.mp3"
      />
      
      <CustomCursor isDark={isDark} />

      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isDark={isDark}
        setIsDark={setIsDark}
        lang={lang}
        setLang={setLang}
        toggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        t={t}
        navEnKeys={navEnKeys}
      />

      <Navbar 
        scrolled={scrolled}
        isDark={isDark}
        setIsDark={setIsDark}
        lang={lang}
        setLang={setLang}
        toggleMusic={toggleMusic}
        isMusicPlaying={isMusicPlaying}
        setIsMenuOpen={setIsMenuOpen}
        t={t}
        navEnKeys={navEnKeys}
      />

      <main>
        <Hero isDark={isDark} t={t} />
        <About isDark={isDark} t={t} />
        <Education isDark={isDark} t={t} />
        <Experience 
          isDark={isDark} 
          t={t} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
        />
        <Projects isDark={isDark} t={t} />
        <Skills 
          isDark={isDark}
          t={t}
          skillsSectionRef={skillsSectionRef}
          handleGlobalMouseMove={handleGlobalMouseMove}
          isTechnicalScannerActive={isTechnicalScannerActive}
          setIsTechnicalScannerActive={setIsTechnicalScannerActive}
          globalMouseX={globalMouseX}
          globalMouseY={globalMouseY}
          isSkillsHovering={isSkillsHovering}
          setIsSkillsHovering={setIsSkillsHovering}
        />
        <Certifications isDark={isDark} t={t} />
        <Contact isDark={isDark} t={t} />
      </main>

      <Footer isDark={isDark} />

      {/* Music Notifier at Bottom Right */}
      <AnimatePresence>
        {isMusicPlaying && (
          <div className="fixed bottom-6 right-6 z-[100]">
            <MusicPlayingIndicator isDark={isDark} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MusicPlayingIndicator({ isDark }: { isDark: boolean }) {
  return (
    <div className={`px-5 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-2xl ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'}`}>
      <div className="flex gap-0.5 items-end h-4">
        {[0.4, 0.7, 0.3, 0.9, 0.5].map((h, i) => (
          <div 
            key={i} 
            className="w-0.5 bg-blue-500 rounded-full animate-music-bar"
            style={{ 
              animationDelay: `${i * 0.1}s`,
              height: `${h * 100}%`
            }}
          />
        ))}
      </div>
      <div className="flex flex-col">
        <span className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Now Playing
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          Perunggu - Gemilang
        </span>
      </div>
    </div>
  );
}
