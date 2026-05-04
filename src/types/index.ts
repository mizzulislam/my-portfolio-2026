import { ComponentType } from "react";

export * from "./message";
export * from "./project";
export * from "./experience";
export * from "./certification";
export * from "./skill";
export * from "./aboutPhoto";

export interface SectionProps {
  isDark: boolean;
  t: Translation;
}

export interface NavbarProps extends SectionProps {
  scrolled: boolean;
  setIsDark: (dark: boolean) => void;
  lang: "en" | "id";
  setLang: (lang: "en" | "id") => void;
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  setIsMenuOpen: (open: boolean) => void;
  navEnKeys: string[];
}

export interface SidebarProps extends SectionProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  setIsDark: (dark: boolean) => void;
  lang: "en" | "id";
  setLang: (lang: "en" | "id") => void;
  toggleMusic: () => void;
  isMusicPlaying: boolean;
  navEnKeys: string[];
}

export interface SectionHeaderProps {
  title: string;
  subTitle: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  isDark: boolean;
}

export interface Translation {
  nav: string[];
  contactBtn: string;
  badge: string;
  heroDesc: string;
  downloadBtn: string;
  aboutHeader: string;
  aboutSub: string;
  aboutText: string;
  stat1: string;
  stat2: string;
  eduHeader: string;
  eduSub: string;
  coursesBtn: string;
  eduData: import("./experience").EduItem[];
  expTabs: import("./experience").ExpTabs;
  expHeader: string;
  expSub: string;
  workData: import("./experience").WorkItem[];
  orgData: import("./experience").OrgItem[];
  timelineHeader: string;
  milestones: import("./experience").Milestone[];
  projectsHeader: string;
  projectsSub: string;
  projectCriticalOutputs: string;
  launchArchive: string;
  viewProjectBtn: string;
  projectsData: import("./project").ProjectItem[];
  skillsHeader: string;
  skillsSub: string;
  technicalDetailText: string;
  hardSkills: import("./skill").HardSkill[];
  softSkills: import("./skill").SoftSkill[];
  technicalTools: import("./skill").TechnicalTool[];
  certHeader: string;
  certSub: string;
  seeMoreBtn: string;
  certDescriptions: import("./certification").CertDescriptions;
  viewCertBtn: string;
  certsCategories: import("./certification").CertCategory[];
  contactHeader: string;
  contactSub: string;
  contactDetailsTitle: string;
  formName: string;
  formLastName: string;
  formEmail: string;
  formMsg: string;
  formBtn: string;
  formLoading?: string;
  formSuccess?: string;
  collectionLabel?: string;
  certsEarnedLabel?: string;
}