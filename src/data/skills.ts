import type { SkillCategory } from '../types/skill'

export const skillCategories: SkillCategory[] = [
  {
    title: 'Languages',
    icon: '💻',
    skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Java', 'C++', 'C#', 'VB.Net', 'VBA'],
  },
  {
    title: 'Frameworks & Libraries',
    icon: '🎨',
    skills: ['Next.js', 'ReactJS', 'Node.js', 'Express.js', 'TailwindCSS', 'Ant Design', 'Django', 'TensorFlow'],
  },
  {
    title: 'DevOps & Tools',
    icon: '🛠️',
    skills: ['Git', 'GitLab', 'Azure DevOps', 'Docker', 'Kubernetes', 'Webpack', 'Boomi Integration', 'JIRA'],
  },
  {
    title: 'Databases',
    icon: '🗄️',
    skills: ['Microsoft SQL Server', 'Oracle Database', 'MySQL'],
  },
]
