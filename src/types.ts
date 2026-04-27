/**
 * ============================================================
 * types.ts — Semua interface/type untuk proyek portfolio
 * ============================================================
 *
 * KENAPA FILE INI ADA?
 * Sebelumnya banyak komponen menggunakan `t: any` yang membuat
 * TypeScript tidak bisa memeriksa kesalahan pengetikan properti.
 *
 * Dengan interface di bawah ini:
 * ✅ Autocomplete bekerja saat mengetik t.
 * ✅ TypeScript langsung merah jika properti salah tulis
 * ✅ Kode lebih mudah dipahami oleh developer lain
 * ============================================================
 */

import { ComponentType } from "react";

// ─── Data primitif ───────────────────────────────────────────

export interface HardSkill {
  name: string;
  category: string;
}

export interface SoftSkill {
  name: string;
  icon: string;
}

export interface TechnicalTool {
  name: string;
  logo: string;
}

export interface Milestone {
  year: string;
  event: string;
  // icon bisa berupa komponen Lucide
  icon: ComponentType<{ size?: number; className?: string }>;
}

export interface CertDescriptions {
  appreciation: string;
  completion: string;
  committee: string;
  competency: string;
}

export interface ExpTabs {
  work: string;
  org: string;
}

// ─── Data kompleks ───────────────────────────────────────────

export interface EduItem {
  id: number | string;
  institution: string;
  degree: string;
  period: string;
  gpa: string;
  logo: string;
  details: string[];
  courses: string[];
}

export interface WorkItem {
  id: number;
  title: string;
  company: string;
  period: string;
  location: string;
  logo: string;
  details: string[];
}

export interface OrgItem {
  id: number;
  title: string;
  company: string;
  period: string;
  location: string;
  logo: string;
  details: string[];
}

export interface ProjectItem {
  id: number;
  title: string;
  category: string;
  desc: string;
  details: string[];
  image: string;
  link: string;
}

export interface CertItem {
  title: string;
  image: string;
  link: string;
}

export interface CertCategory {
  id: string;
  icon: string;
  name: string;
  description: string;
  items: CertItem[];
}

// ─── Interface utama: objek terjemahan ───────────────────────
/**
 * Translation — interface lengkap untuk objek `t` yang dioper
 * ke semua komponen. Kalau Anda menambah key baru di
 * constants.tsx, tambahkan juga di sini agar TypeScript tahu.
 */
export interface Translation {
  // Navigasi & tombol umum
  nav: string[];
  contactBtn: string;
  badge: string;

  // Hero section
  heroDesc: string;
  downloadBtn: string;

  // About section
  aboutHeader: string;
  aboutSub: string;
  aboutText: string;
  stat1: string;
  stat2: string;

  // Education section
  eduHeader: string;
  eduSub: string;
  coursesBtn: string;
  eduData: EduItem[];

  // Experience section
  expTabs: ExpTabs;
  expHeader: string;
  expSub: string;
  workData: WorkItem[];
  orgData: OrgItem[];

  // Timeline / Roadmap
  timelineHeader: string;
  milestones: Milestone[];

  // Projects section
  projectsHeader: string;
  projectsSub: string;
  projectCriticalOutputs: string;
  launchArchive: string;
  viewProjectBtn: string;
  projectsData: ProjectItem[];

  // Skills section
  skillsHeader: string;
  skillsSub: string;
  technicalDetailText: string;
  hardSkills: HardSkill[];
  softSkills: SoftSkill[];
  technicalTools: TechnicalTool[];

  // Certifications section
  certHeader: string;
  certSub: string;
  seeMoreBtn: string;
  certDescriptions: CertDescriptions;
  viewCertBtn: string;
  certsCategories: CertCategory[];

  // Contact section
  contactHeader: string;
  contactSub: string;
  contactDetailsTitle: string;
  formName: string;
  formLastName: string;
  formEmail: string;
  formMsg: string;
  formBtn: string;
}

// ─── Interface untuk props komponen ──────────────────────────

/** Props dasar yang hampir semua section butuhkan */
export interface SectionProps {
  isDark: boolean;
  t: Translation;
}

/** Props untuk Navbar */
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

/** Props untuk Sidebar */
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

// ─── Interface untuk UIComponents ────────────────────────────

export interface SectionHeaderProps {
  title: string;
  subTitle: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  isDark: boolean;
}

export interface EducationCardProps {
  edu: EduItem;
  idx: number;
  labels: {
    coursesBtn: string;
  };
  isDark: boolean;
}

export interface ExperienceRoadmapProps {
  labels: {
    timelineHeader: string;
    milestones: Milestone[];
  };
  isDark: boolean;
}

export interface ProjectFoldersProps {
  projects: ProjectItem[];
  isDark: boolean;
  labels: {
    projectCriticalOutputs: string;
    criticalOutputs: string; // alias yang dipakai di UIComponents
    viewProjectBtn: string;
    launchArchive: string; // teks tombol "View Project"
  };
}

export interface TechnicalToolsProps {
  tools: TechnicalTool[];
  isDark: boolean;
  detailText: string;
}

export interface SoftSkillsGridProps {
  skills: SoftSkill[];
  isDark: boolean;
}

export interface CertZoomCarouselProps {
  items: CertItem[];
  isDark: boolean;
  viewCertBtnText: string;
}
