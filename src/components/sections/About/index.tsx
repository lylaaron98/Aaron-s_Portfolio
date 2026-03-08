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
            Hey! I'm <span className={styles.highlight}>Aaron</span>, a passionate Frontend &amp;
            Fullstack Software Engineer with a love for crafting seamless digital experiences
            across web and mobile platforms.
          </p>
          <p>
            I specialize in building fast, scalable, and beautiful applications using modern
            technologies like <span className={styles.highlight}>React</span>,{' '}
            <span className={styles.highlight}>TypeScript</span>, and{' '}
            <span className={styles.highlight}>React Native</span>. From pixel-perfect UIs to
            robust backend APIs, I enjoy every layer of the stack.
          </p>
          <p>
            When I'm not coding, I'm exploring the latest in tech, contributing to open source,
            or thinking about how great design can shape user behavior. I believe software
            should be accessible, inclusive, and a joy to use.
          </p>
          <ul className={styles.techList}>
            <li>React &amp; React Native</li>
            <li>TypeScript / JavaScript</li>
            <li>Node.js &amp; Express</li>
            <li>Python</li>
            <li>PostgreSQL &amp; MongoDB</li>
            <li>AWS &amp; Firebase</li>
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
