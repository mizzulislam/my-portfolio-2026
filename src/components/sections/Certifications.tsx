import React from 'react';
import { Award } from 'lucide-react';
import { SectionHeader, CertCategoryCarousel } from '../UIComponents';

interface CertificationsProps {
  isDark: boolean;
  t: any;
}

export function Certifications({ isDark, t }: CertificationsProps) {
  return (
    <section id="certifications" className={`py-24 transition-colors overflow-hidden ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SectionHeader title={t.certHeader} subTitle={t.certSub} icon={Award} isDark={isDark} />
        <CertCategoryCarousel 
          categories={t.certsCategories} 
          descriptions={t.certDescriptions}
          isDark={isDark} 
          viewCertBtnText={t.viewCertBtn}
          seeMoreBtnText={t.seeMoreBtn}
        />
      </div>
    </section>
  );
}
