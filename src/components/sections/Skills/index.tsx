import styles from './Skills.module.css'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { skillCategories } from '../../../data/skills'
import SectionContainer from '../../ui/SectionContainer'
import Card from '../../ui/Card'
import type { ComponentType } from 'react'
import {
  SiHtml5, SiJavascript, SiTypescript, SiPython, SiMysql,
  SiCplusplus, SiDotnet,
  SiNextdotjs, SiReact, SiNodedotjs, SiExpress, SiTailwindcss,
  SiAntdesign, SiDjango, SiTensorflow,
  SiGit, SiGitlab, SiDocker, SiKubernetes, SiWebpack, SiJira,
  SiMongodb,
} from 'react-icons/si'
import { DiCss3, DiJava, DiMsqlServer } from 'react-icons/di'
import { FaDatabase } from 'react-icons/fa'
import { VscAzureDevops } from 'react-icons/vsc'
import { SiSharp } from 'react-icons/si'

const skillIconMap: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  'HTML': SiHtml5,
  'CSS': DiCss3,
  'JavaScript': SiJavascript,
  'TypeScript': SiTypescript,
  'Python': SiPython,
  'SQL': SiMysql,
  'Java': DiJava,
  'C++': SiCplusplus,
  'C#': SiSharp,
  'VB.Net': SiDotnet,
  'VBA': SiDotnet,
  'Next.js': SiNextdotjs,
  'ReactJS': SiReact,
  'React Bits': SiReact,
  'shadcn/ui': SiReact,
  'React Icons': SiReact,
  'React Three Fiber': SiReact,
  'Node.js': SiNodedotjs,
  'Express.js': SiExpress,
  'TailwindCSS': SiTailwindcss,
  'Ant Design': SiAntdesign,
  'Django': SiDjango,
  'TensorFlow': SiTensorflow,
  'Git': SiGit,
  'GitLab': SiGitlab,
  'Azure DevOps': VscAzureDevops,
  'Docker': SiDocker,
  'Kubernetes': SiKubernetes,
  'Webpack': SiWebpack,
  'Boomi Integration': SiDotnet,
  'JIRA': SiJira,
  'Microsoft SQL Server': DiMsqlServer,
  'Oracle Database': FaDatabase,
  'MySQL': SiMysql,
  'MongoDB': SiMongodb,
}

export default function Skills() {
  const ref = useGsapStaggerReveal<HTMLDivElement>(`.${styles.card}`, { stagger: 0.12 })

  return (
    <SectionContainer id="skills" background="navy-light" title="Skills &amp; Technologies">
      <div ref={ref} className={styles.grid}>
        {skillCategories.map((cat) => (
          <Card
            key={cat.title}
            variant="navy"
            topAccent
            tilt
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
            </div>
            <div className={styles.skillList}>
              {cat.skills.map((skill) => {
                const Icon = skillIconMap[skill]
                return (
                  <div key={skill} className={styles.skillBall} title={skill}>
                    {Icon ? <Icon size={28} color="var(--white)" /> : <span className={styles.fallbackText}>{skill}</span>}
                    <span className={styles.skillLabel}>{skill}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
