import React from 'react';
import { Rocket } from 'lucide-react';
import { SectionHeader, ProjectFolders } from '../UIComponents';

interface ProjectsProps {
  isDark: boolean;
  t: any;
}

export function Projects({ isDark, t }: ProjectsProps) {
  return (
    <section id="projects" className={`pt-8 pb-24 transition-colors ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SectionHeader title={t.projectsHeader} subTitle={t.projectsSub} icon={Rocket} isDark={isDark} />
        <ProjectFolders 
          projects={t.projectsData} 
          isDark={isDark} 
          labels={{ 
            criticalOutputs: t.projectCriticalOutputs, 
            launchArchive: t.launchArchive 
          }} 
        />
      </div>
    </section>
  );
}
