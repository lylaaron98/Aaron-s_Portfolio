export type ProjectCategory = 'personal' | 'client';

export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  featured: boolean;
  category: ProjectCategory;
  images?: string[];
}
