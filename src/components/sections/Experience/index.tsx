import styles from './Experience.module.css'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { experiences } from '../../../data/experience'
import SectionContainer from '../../ui/SectionContainer'
import Badge from '../../ui/Badge'

export default function Experience() {
  const ref = useGsapStaggerReveal<HTMLDivElement>(`.${styles.entry}`, { stagger: 0.15 })

  return (
    <SectionContainer id="experience" number="03" title="Experience">
      <div ref={ref} className={styles.timeline}>
        {experiences.map((exp, i) => (
          <div key={exp.company} className={styles.entry}>
            <div className={styles.header}>
              <h3 className={styles.role}>{exp.role}</h3>
              <span className={styles.dates}>
                {exp.startDate} – {exp.endDate ?? 'Present'}
              </span>
            </div>
            <p className={styles.company}>{exp.company}</p>
            <div className={styles.bullets}>
              {exp.description.map((bullet, j) => (
                <p key={j} className={styles.bullet}>
                  <span className={styles.bulletIcon}>▹</span>
                  {bullet}
                </p>
              ))}
            </div>
            <div className={styles.techRow}>
              {exp.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}
