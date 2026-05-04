import { ComponentType } from "react";

export interface Milestone {
  year: string;
  event: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export interface WorkItem {
  id: number | string;
  title: string;
  company: string;
  period: string;
  location: string;
  logo: string;
  details: string[];
}

export interface OrgItem {
  id: number | string;
  title: string;
  company: string;
  period: string;
  location: string;
  logo: string;
  details: string[];
}

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

export interface Experience {
  id?: string;
  company: string;
  role: string;
  type: "work" | "org";
  start_date: string;
  end_date: string;
  location: string;
  logo_url: string;
  details: string[];
  role_id: string;
  company_id: string;
  location_id: string;
  details_id: string[];
  order?: number;
}

export interface ExpTabs {
  work: string;
  org: string;
}

export interface ExperienceRoadmapProps {
  labels: {
    timelineHeader: string;
    milestones: Milestone[];
  };
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
