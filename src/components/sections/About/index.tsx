import styles from './About.module.css'
import { useScrollReveal } from '../../../hooks/useScrollReveal'
import SectionContainer from '../../ui/SectionContainer'

export default function About() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <SectionContainer id="about" number="01" title="About Me">
      <div ref={ref} className={styles.inner}>
        <div className={styles.textBlock}>
          <p>
            Hey! I'm <span className={styles.highlight}>Aaron</span>, a Frontend &amp;
            Full Stack Software Engineer with a Bachelor's in Computer Science (Hons) from
            Goldsmiths, University of London (SIM).
          </p>
          <p>
            I have hands-on experience building scalable web applications using{' '}
            <span className={styles.highlight}>React</span>,{' '}
            <span className={styles.highlight}>Node.js</span>, and{' '}
            <span className={styles.highlight}>SQL</span>. I'm experienced in modernizing
            large-scale legacy workflows and delivering production-ready applications across
            finance, retail, and R&amp;D environments.
          </p>
          <p>
            Most recently, I contributed to large-scale system migration and modernization
            at a global bank. When I'm not coding, I'm exploring Web3, UX design, AI
            applications, and cloud infrastructure.
          </p>
          <ul className={styles.techList}>
            <li>React &amp; Next.js</li>
            <li>TypeScript / JavaScript</li>
            <li>Node.js &amp; Express</li>
            <li>Python &amp; Django</li>
            <li>SQL Server &amp; Oracle</li>
            <li>Docker &amp; Azure DevOps</li>
          </ul>
        </div>
        <div className={styles.imageBlock}>
          <div className={styles.imgWrapper}>
            <div className={styles.imgPlaceholder}>
              <span>Aaron</span>
              <small>Software Engineer</small>
            </div>
            <div className={styles.imgBorder} />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
