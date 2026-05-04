export interface Project {
  id?: string;
  title: string;
  title_id: string;
  description: string;
  desc_id: string;
  category: string;
  category_id: string;
  image_url: string;
  github_url: string;
  live_url: string;
  tags: string[];
  tags_id: string[];
  order: number;
}

export interface ProjectItem {
  id: number | string;
  title: string;
  category: string;
  desc: string;
  details: string[];
  image: string;
  link: string;
}

export interface ProjectFoldersProps {
  projects: ProjectItem[];
  isDark: boolean;
  labels: {
    projectCriticalOutputs: string;
    criticalOutputs: string;
    viewProjectBtn: string;
    launchArchive: string;
  };
}
