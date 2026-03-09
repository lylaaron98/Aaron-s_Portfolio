import styles from './Skills.module.css'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { skillCategories } from '../../../data/skills'
import SectionContainer from '../../ui/SectionContainer'
import Card from '../../ui/Card'

export default function Skills() {
  const ref = useGsapStaggerReveal<HTMLDivElement>(`.${styles.card}`, { stagger: 0.12 })

  return (
    <SectionContainer id="skills" background="navy-light" number="02" title="Skills &amp; Technologies">
      <div ref={ref} className={styles.grid}>
        {skillCategories.map((cat, i) => (
          <Card
            key={cat.title}
            variant="navy"
            topAccent
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{cat.icon}</span>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
            </div>
            <ul className={styles.skillList}>
              {cat.skills.map((skill) => (
                <li key={skill} className={styles.skillItem}>
                  <span className={styles.bullet}>▹</span>
                  {skill}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
