import { ComponentType } from "react";

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

export interface Skill {
  id?: string;
  name: string;
  category: string;
  logo_url?: string;
  order?: number;
}

export interface SoftSkillDB {
  id?: string;
  name: string;
  name_id?: string;
  order?: number;
}

export interface HardSkillDB {
  id?: string;
  name: string;
  name_id?: string;
  order?: number;
}

export interface TechnicalSkillDB {
  id?: string;
  name: string;
  category?: string;
  logo_url?: string;
  order?: number;
}

export interface TechnicalToolsProps {
  tools: TechnicalTool[];
  isDark: boolean;
  detailText: string;
  globalMouseX?: number;
  isScannerActive?: boolean;
}

export interface SoftSkillsGridProps {
  skills: SoftSkill[];
  isDark: boolean;
}
