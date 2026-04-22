import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Calendar, CheckCircle2, Users } from 'lucide-react';
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div className="flex items-start gap-4 w-full md:w-auto flex-1">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all overflow-hidden ${isDark ? 'bg-white border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                      {item.logo ? (
                        <img src={item.logo} alt={item.company || item.category} className="w-full h-full object-contain p-1.5 md:p-2" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>
                          {activeTab === 'work' ? <Briefcase size={20} className="md:w-6 md:h-6" /> : <Users size={20} className="md:w-6 md:h-6" />}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className={`text-lg md:text-xl font-bold transition-colors mb-1 ${isDark ? 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-300' : 'text-slate-900 group-hover:text-blue-600'}`}>{item.title}</h3>
                      <p className={`text-[11px] md:text-sm font-semibold capitalize ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.company || item.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-2 md:gap-1.5 shrink-0">
                    <span className={`inline-block px-3 py-1 border rounded-full text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                      {item.period || 'Project'}
                    </span>
                    {item.location && (
                      <p className={`text-[10px] font-bold uppercase tracking-tighter md:pr-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
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
