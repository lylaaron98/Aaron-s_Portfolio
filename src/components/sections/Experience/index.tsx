import { experiences } from '../../../data/experience'
import SectionContainer from '../../ui/SectionContainer'
import Badge from '../../ui/Badge'
import Card from '../../ui/Card'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import styles from './Experience.module.css'

/**
 * A plain two-column timeline: dates on a rail, the role card beside them.
 * Replaces react-vertical-timeline-component, whose alternating layout left
 * half the desktop width empty and whose global stylesheet had to be fought.
 */
export default function Experience() {
  const listRef = useGsapStaggerReveal<HTMLOListElement>(`.${styles.item}`)

  return (
    <SectionContainer id="experience" number="03" title="Experience" meta="timeline">
      <ol ref={listRef} className={styles.timeline}>
        {experiences.map((exp) => (
          <li key={`${exp.company}-${exp.startDate}`} className={styles.item}>
            <div className={styles.when}>
              <span className={styles.dot} aria-hidden="true" />
              <time className={styles.date}>
                {exp.startDate} – {exp.endDate ?? 'Present'}
              </time>
            </div>

            <Card className={styles.card} variant="default" hoverable gradientOverlay>
              <h3 className={styles.role}>{exp.role}</h3>
              <p className={styles.company}>{exp.company}</p>
              <ul className={styles.bullets}>
                {exp.description.map((bullet) => (
                  <li className={styles.bullet} key={bullet}>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className={styles.tech}>
                {exp.tech.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </SectionContainer>
  )
}
