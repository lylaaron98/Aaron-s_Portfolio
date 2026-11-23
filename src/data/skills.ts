import type { SkillCategory } from '../types/skill'

// Trimmed to what a reviewer should take away: the daily stack first, then the
// tools shipped with. Icons are matched by exact name in the Skills section and
// only where the brand mark is the real one, so nothing borrows a wrong logo.
export const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend',
    icon: '🎨',
    skills: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'Ant Design', 'TanStack Query', 'Redux Toolkit', 'Zustand', 'GSAP', 'HTML & CSS'],
  },
  {
    title: 'Backend & APIs',
    icon: '⚙️',
    skills: ['Node.js', 'Express', 'Python', 'FastAPI', 'Django', 'REST APIs', 'WebSockets', 'Fastify', 'Supabase', 'Prisma', 'Zod'],
  },
  {
    title: 'Data',
    icon: '🗄️',
    skills: ['PostgreSQL', 'DynamoDB', 'SQL Server', 'Oracle', 'MySQL', 'MongoDB'],
  },
  {
    title: 'Applied AI',
    icon: '🧠',
    skills: ['AWS Bedrock', 'RAG', 'Agents & function calling', 'MCP', 'OpenCV', 'Tesseract OCR', 'Claude Vision', 'OpenAI APIs'],
  },
  {
    title: 'Cloud & Delivery',
    icon: '☁️',
    skills: ['AWS', 'AWS CDK', 'Docker', 'GitLab CI', 'GitHub Actions', 'Azure DevOps', 'CloudWatch', 'Vercel', 'Firebase'],
  },
  {
    title: 'Quality & Tools',
    icon: '🧪',
    skills: ['Vitest', 'Playwright', 'Cypress', 'SonarQube', 'Git', 'Figma', 'Unity'],
  },
  {
    title: 'Also shipped with',
    icon: '🧰',
    skills: ['C++', 'Java', 'C#', 'VB.Net', 'React Native', 'Expo'],
  },
]
