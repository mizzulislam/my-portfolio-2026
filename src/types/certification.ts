export interface CertItem {
  title: string;
  image: string;
  link: string;
}

export interface CertCategory {
  id: number | string;
  icon: string;
  name: string;
  description: string;
  items: CertItem[];
}

export interface CertDescriptions {
  appreciation: string;
  completion: string;
  committee: string;
  competency: string;
}

export interface CertificationItem {
  id?: string;
  category_id: string;
  title: string;
  title_id: string;
  issuer: string;
  issue_month: string;
  issue_year: string;
  expiry_month: string;
  expiry_year: string;
  credential_id: string;
  image_url: string;
  link: string;
  order: number;
}

export interface CertZoomCarouselProps {
  items: CertItem[];
  isDark: boolean;
  viewCertBtnText: string;
}
