import type { ComponentType } from 'react'
import {
  SiTypescript, SiJavascript, SiReact, SiNextdotjs, SiTailwindcss, SiAntdesign, SiReactquery,
  SiRedux, SiGreensock, SiHtml5, SiNodedotjs, SiExpress, SiPython, SiFastapi, SiDjango,
  SiSocketdotio, SiSupabase, SiPrisma, SiMysql, SiMongodb, SiOpencv, SiAnthropic, SiOpenai,
  SiFirebase, SiPostgresql, SiGitlab, SiFastify, SiZod, SiModelcontextprotocol, SiVercel, SiDocker, SiGithubactions, SiVitest, SiCypress,
  SiSonarqubeserver, SiGit, SiFigma, SiUnity, SiCplusplus, SiOpenjdk, SiDotnet, SiExpo,
} from 'react-icons/si'
import styles from './Skills.module.css'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { skillCategories } from '../../../data/skills'
import SectionContainer from '../../ui/SectionContainer'
import Card from '../../ui/Card'

type Icon = ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>

// Exact brand marks only. A skill without a true logo shows as a plain chip
// rather than borrowing a neighbour's icon.
const skillIcons: Record<string, Icon> = {
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  React: SiReact,
  'React Native': SiReact,
  'Next.js': SiNextdotjs,
  'Tailwind CSS': SiTailwindcss,
  'Ant Design': SiAntdesign,
  'TanStack Query': SiReactquery,
  'Redux Toolkit': SiRedux,
  GSAP: SiGreensock,
  'HTML & CSS': SiHtml5,
  'Node.js': SiNodedotjs,
  Express: SiExpress,
  Python: SiPython,
  FastAPI: SiFastapi,
  Django: SiDjango,
  WebSockets: SiSocketdotio,
  Supabase: SiSupabase,
  Prisma: SiPrisma,
  MySQL: SiMysql,
  MongoDB: SiMongodb,
  OpenCV: SiOpencv,
  'Claude Vision': SiAnthropic,
  'OpenAI APIs': SiOpenai,
  MCP: SiModelcontextprotocol,
  PostgreSQL: SiPostgresql,
  'GitLab CI': SiGitlab,
  'GitHub Actions': SiGithubactions,
  Fastify: SiFastify,
  Zod: SiZod,
  Firebase: SiFirebase,
  Vercel: SiVercel,
  Docker: SiDocker,
  'CI/CD': SiGithubactions,
  Vitest: SiVitest,
  Cypress: SiCypress,
  SonarQube: SiSonarqubeserver,
  Git: SiGit,
  Figma: SiFigma,
  Unity: SiUnity,
  'C++': SiCplusplus,
  Java: SiOpenjdk,
  'VB.Net': SiDotnet,
  'C#': SiDotnet,
  Expo: SiExpo,
}

export default function Skills() {
  const ref = useGsapStaggerReveal<HTMLDivElement>(`.${styles.card}`)

  return (
    <SectionContainer id="skills" number="02" title="Skills" meta="stack">
      <div ref={ref} className={styles.grid}>
        {skillCategories.map((cat) => (
          <Card key={cat.title} variant="navy" topAccent className={styles.card}>
            <h3 className={styles.cardTitle}>{cat.title}</h3>
            <ul className={styles.chips}>
              {cat.skills.map((skill) => {
                const SkillIcon = skillIcons[skill]
                return (
                  <li key={skill} className={styles.chip}>
                    {SkillIcon && <SkillIcon size={15} aria-hidden className={styles.chipIcon} />}
                    {skill}
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
