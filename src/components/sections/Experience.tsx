import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import { SectionHeader, ExperienceRoadmap } from '../UIComponents';

interface ExperienceProps {
  isDark: boolean;
  t: any;
  activeTab: 'work' | 'org';
  setActiveTab: (tab: 'work' | 'org') => void;
  lang: string;
}

export function Experience({ isDark, t, activeTab, setActiveTab, lang }: ExperienceProps) {
  return (
    <section id="experience" className="pt-20 pb-4 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        <SectionHeader title={t.expHeader} subTitle={t.expSub} icon={Briefcase} isDark={isDark} />
        <div className={`p-1 rounded-2xl border flex md:inline-flex mb-8 overflow-x-auto no-scrollbar max-w-full mx-auto ${isDark ? 'bg-slate-900 border-white/5' : 'bg-slate-200 border-slate-300'}`}>
          {['work', 'org'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as 'work' | 'org')} 
              className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {(t.expTabs as any)[tab]}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab + lang + isDark} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full space-y-4 sm:space-y-6 text-left">
            {(activeTab === 'work' ? t.workData : t.orgData).map((item: any, idx: number) => (
              <motion.div 
                key={idx} 
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: isDark ? "0 0 30px rgba(59, 130, 246, 0.15)" : "0 15px 40px rgba(0,0,0,0.1)"
                }}
                className={`group p-5 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-3xl border transition-all shadow-xl ${isDark ? 'bg-slate-900/50 border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-500/30'}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="w-full sm:flex-1">
                    <h3 className={`text-base sm:text-lg md:text-xl font-bold transition-colors mb-0.5 sm:mb-1 ${isDark ? 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-300' : 'text-slate-900 group-hover:text-blue-600'}`}>{item.title}</h3>
                    <p className={`text-[10px] sm:text-xs md:text-sm font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.company || item.category}</p>
                  </div>
                  <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0 sm:ml-auto">
                    <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-mono px-3 py-1 rounded-full border ${isDark ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {item.period || 'Project'}
                    </span>
                    {item.location && (
                      <p className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>
                {item.details ? (
                  <ul className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                    {item.details.map((point: string, i: number) => (
                      <li key={i} className={`flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5 sm:mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`leading-relaxed text-xs sm:text-sm md:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        <div className={`w-full mt-10 border-t pt-10 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <h4 className={`font-bold text-center mb-4 flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Calendar size={18} className="text-blue-500" /> {t.timelineHeader}</h4>
          <ExperienceRoadmap labels={t} isDark={isDark} />
        </div>
      </div>
    </section>
  );
}
