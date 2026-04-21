import React from 'react';
import { GraduationCap } from 'lucide-react';
import { SectionHeader, EducationCard } from '../UIComponents';

interface EducationProps {
  isDark: boolean;
  t: any;
}

export function Education({ isDark, t }: EducationProps) {
  return (
    <section id="education" className={`py-24 relative overflow-hidden ${isDark ? 'bg-slate-950/30' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <SectionHeader title={t.eduHeader} subTitle={t.eduSub} icon={GraduationCap} isDark={isDark} />
        <div className="space-y-8 text-left">
          {t.eduData.map((edu: any, idx: number) => (
            <EducationCard key={idx} edu={edu} idx={idx} labels={t} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}
