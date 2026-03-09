import styles from './About.module.css'
import { useGsapReveal } from '../../../hooks/useGsapReveal'
import SectionContainer from '../../ui/SectionContainer'
import ProfileCard from '../../ui/ProfileCard/ProfileCard'
import { scrollToSection } from '../../../utils/smoothScroll'

export default function About() {
  const ref = useGsapReveal<HTMLDivElement>()

  return (
    <SectionContainer id="about" title="About Me">
      <div ref={ref} className={styles.inner}>
        <div className={styles.textBlock}>
          <p>
            Hey! I'm <span className={styles.highlight}>Aaron</span>, a Frontend &amp;
            Full Stack Software Engineer with a Bachelor's in Computer Science (Hons) from
            Goldsmiths, University of London (SIM).
          </p>
          <p>
            I have hands-on experience building scalable web applications using{' '}
            <span className={styles.highlight}>ReactJS</span>,{' '}
            <span className={styles.highlight}>NextJS</span>, and{' '}
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
          <ProfileCard
            avatarUrl="https://avatars.githubusercontent.com/u/lylaaron98"
            name="Aaron"
            title="Software Engineer"
            handle="lylaaron98"
            status="Open to Work"
            contactText="Contact Me"
            showUserInfo
            enableTilt
            enableMobileTilt
            iconUrl="/assets/iconpattern.svg"
            behindGlowColor="rgba(180, 180, 195, 0.45)"
            behindGlowEnabled
            innerGradient="linear-gradient(145deg, #1e1e28 0%, #2a2a38 100%)"
            onContactClick={() => scrollToSection('contact')}
          />
        </div>
      </div>
    </SectionContainer>
  )
}
