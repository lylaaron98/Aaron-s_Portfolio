import type { SkillCategory } from '../types/skill'

export const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend',
    icon: '🎨',
    skills: ['React', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3 / SASS', 'Next.js'],
  },
  {
    title: 'Backend',
    icon: '⚙️',
    skills: ['Node.js', 'Express.js', 'Python', 'REST APIs', 'GraphQL', 'WebSockets'],
  },
  {
    title: 'Mobile',
    icon: '📱',
    skills: ['React Native', 'Expo', 'iOS Development', 'Android Development', 'Push Notifications', 'App Store Deploy'],
  },
  {
    title: 'Tools & Cloud',
    icon: '🛠️',
    skills: ['Git & GitHub', 'Docker', 'AWS (EC2, S3)', 'Firebase', 'MongoDB', 'PostgreSQL'],
  },
]
