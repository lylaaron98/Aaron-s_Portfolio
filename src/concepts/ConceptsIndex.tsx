import { CONCEPTS } from './shared/ConceptSwitcher'
import styles from './ConceptsIndex.module.css'

export default function ConceptsIndex() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Portfolio redesign · drafts for review</p>
        <h1 className={styles.title}>Three directions</h1>
        <p className={styles.lede}>
          Each draft uses the real content from the live site. Scroll through each one, especially the work
          experience timeline, then pick the direction to build out. Motion switches off when your system asks for
          reduced motion.
        </p>
      </header>
      <ol className={styles.list}>
        {CONCEPTS.map((concept) => (
          <li key={concept.slug}>
            <a className={`${styles.card} ${styles[concept.slug]}`} href={`/concepts/${concept.slug}`}>
              <span className={styles.letter} aria-hidden="true">
                {concept.letter}
              </span>
              <span className={styles.cardBody}>
                <span className={styles.tag}>{concept.tagline}</span>
                <span className={styles.name}>{concept.name}</span>
                <span className={styles.summary}>{concept.summary}</span>
              </span>
              <span className={styles.go} aria-hidden="true">
                View →
              </span>
            </a>
          </li>
        ))}
      </ol>
      <p className={styles.back}>
        <a href="/">← Back to the current site</a>
      </p>
    </main>
  )
}
