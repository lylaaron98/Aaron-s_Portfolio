import { experiences } from '../../data/experience'
import { projects } from '../../data/projects'
import { projectDemoRoute } from '../../constants/routes'

/**
 * The concepts reuse the live site's data, so every draft shows real content
 * and the employer anonymisation carries over unchanged.
 */

const SECTOR: Record<string, string> = {
  'GovTech Singapore (Hybrid)': 'Public sector',
  'Freelance (project-based), Remote': 'Applied AI',
  'Corporate Bank, Singapore': 'Banking',
  'Capgemini, Singapore': 'Consulting',
  'Univers (Envision Group), Singapore': 'Sustainability',
  'Daiso Singapore': 'Retail',
  'International Data Corporation (IDC), Singapore': 'Research',
}

export const roles = experiences.map((exp, index) => ({
  ...exp,
  id: `role-${index}`,
  year: exp.startDate.split(' ').pop() ?? '',
  period: `${exp.startDate} — ${exp.endDate ?? 'Present'}`,
  /** Company without the trailing location, for tight layouts. */
  org: exp.company.split(',')[0].replace(/\s*\(.*\)\s*$/, '').trim(),
  sector: SECTOR[exp.company] ?? 'Engineering',
}))

export type Role = (typeof roles)[number]

const COVERS: Record<string, string> = {
  'Property Website Builder & Agent CRM': '/assets/property_website_builder/landing-hero.webp',
  'AI Architectural Drawing Platform': '/assets/ai_drawing_platform/restoration-pipeline.webp',
  'Workforce Scheduling Platform': '/assets/workforce_scheduling/schedule-calendar.webp',
  'DeFi Portfolio Dashboard': '/assets/defi_dashboard/wallet-desk.webp',
  'AI Chatbot Assistant': encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211104.webp'),
  'Lifestyle App': '/assets/lifestyle_app/screens.webp',
}

export const featuredProjects = projects
  .filter((project) => COVERS[project.title])
  .map((project) => ({
    ...project,
    cover: COVERS[project.title],
    href: projectDemoRoute(project.title),
  }))

export const skillGroups = [
  { title: 'Frontend', items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GSAP', 'TanStack Query', 'Zustand'] },
  { title: 'Backend', items: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'DynamoDB', 'WebSockets'] },
  { title: 'Cloud & AI', items: ['AWS CDK', 'Lambda', 'ECS', 'AWS Bedrock', 'RAG', 'OpenCV', 'Claude Vision'] },
]

export const links = {
  github: 'https://github.com/lylaaron98',
  linkedin: 'https://linkedin.com/in/aaron-lee-b832431b3',
  email: 'mailto:lyl.aaron.98@gmail.com',
  resume: '/aaron-lee-resume.pdf',
}

export const intro =
  'I build interfaces people rely on: treasury systems for a bank, live bidding for a government agency, and citizen-facing services at GovTech. React and TypeScript up front, Python and AWS behind them, and applied AI where it earns its place.'
