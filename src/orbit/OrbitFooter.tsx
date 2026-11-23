import { links } from './content'
import styles from './OrbitFooter.module.css'

export default function OrbitFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.big} aria-hidden="true">
        Aaron Lee
      </p>
      <div className={styles.row}>
        <p>© {new Date().getFullYear()} Aaron Lee. Designed and built in Singapore.</p>
        <ul>
          <li>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={links.email}>Email</a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
