import type { SkillCategory } from '../types/skill'

// Labels are kept short and matched to the icon map in the Skills section — long
// strings fall back to text inside the icon circle and wrap badly.
export const skillCategories: SkillCategory[] = [
  {
    title: 'Languages',
    icon: '💻',
    skills: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Java', 'C#', 'C++', 'HTML', 'CSS', 'VB.Net'],
  },
  {
    title: 'Frontend',
    icon: '🎨',
    skills: [
      'ReactJS',
      'Next.js',
      'TailwindCSS',
      'Ant Design',
      'Shadcn UI',
      'Mantine UI',
      'TanStack Query',
      'Redux Toolkit',
      'Zustand',
      'Context API',
      'GSAP',
    ],
  },
  {
    title: 'Backend & APIs',
    icon: '⚙️',
    skills: [
      'Node.js',
      'Express.js',
      'FastAPI',
      'Django',
      'Supabase',
      'Prisma',
      'REST APIs',
      'WebSockets',
      'JWT Auth',
      'RBAC',
    ],
  },
  {
    title: 'AI & Computer Vision',
    icon: '🧠',
    skills: [
      'OpenAI APIs',
      'Claude Vision',
      'Groq',
      'Prompt Engineering',
      'OpenCV',
      'Hough Transform',
      'Tesseract',
      'PaddleOCR',
      'Hugging Face',
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: '☁️',
    skills: ['AWS', 'AWS Lambda', 'S3 & SQS', 'Aurora', 'Azure DevOps', 'Docker', 'Kubernetes', 'Firebase', 'Vercel', 'CI/CD'],
  },
  {
    title: 'Databases',
    icon: '🗄️',
    skills: ['Microsoft SQL Server', 'Oracle Database', 'MySQL', 'ERD Design'],
  },
  {
    title: 'Testing & Quality',
    icon: '🧪',
    skills: ['Vitest', 'Cypress', 'Playwright', 'Postman', 'SonarQube'],
  },
  {
    title: 'Tools & Practices',
    icon: '🛠️',
    skills: ['Git', 'GitLab', 'Jira', 'Vite', 'Webpack', 'Unity', 'Figma', 'Agile / Scrum'],
  },
]
