export type ProjectCategory = 'personal' | 'client';

export interface Project {
  title: string;
  /** One line: the problem and the result. Shown on the card. */
  summary: string;
  /** Up to three concrete points. Shown in the dialog. */
  highlights: string[];
  /** Full write-up. Shown on the project page. */
  description: string;
  tech: string[];
  github: string;
  live: string;
  featured: boolean;
  category: ProjectCategory;
  images?: string[];
  hideLiveDemoCard?: boolean;
}
