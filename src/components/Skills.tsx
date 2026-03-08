import styles from './Skills.module.css'
import { useScrollReveal } from '../hooks/useScrollReveal'

const skillCategories = [
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

export default function Skills() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section id="skills" className={styles.skills}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <span className={styles.num}>02.</span> Skills &amp; Technologies
          <span className={styles.line} />
        </h2>
        <div ref={ref} className={styles.grid}>
          {skillCategories.map((cat, i) => (
            <div
              key={cat.title}
              className={styles.card}
              style={{ transitionDelay: `${i * 0.1}s` }}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
