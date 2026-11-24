import styles from './About.module.css'
import SectionContainer from '../../ui/SectionContainer'
import ProfileCard from '../../ui/ProfileCard/ProfileCard'
import { scrollToSection } from '../../../utils/smoothScroll'
import { useLowPerformanceMode, useMediaQuery, usePrefersReducedMotion } from '../../../hooks/useMediaQuery'

export default function About() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const lowPerformanceMode = useLowPerformanceMode()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const isDesktop = useMediaQuery('(min-width: 901px)')
  const enableProfileTilt = hasFinePointer && isDesktop && !prefersReducedMotion && !lowPerformanceMode

  return (
    <SectionContainer id="about" number="01" title="About" meta="profile">
      <div className={styles.inner}>
        <div className={styles.textBlock}>
          <p>
            Hey! I'm <span className={styles.highlight}>Aaron</span>, a full stack engineer in
            Singapore with a BSc (Hons) in Computer Science from Goldsmiths, University of London.
          </p>
          <p>
            I've shipped for a <span className={styles.highlight}>corporate bank</span>, government
            agencies and Japanese enterprise clients. Today I build citizen-facing products for a{' '}
            <span className={styles.highlight}>government agency</span>, from{' '}
            <span className={styles.highlight}>React</span> frontends to AI agents on{' '}
            <span className={styles.highlight}>AWS Bedrock</span>.
          </p>
          <p>I like owning a feature end to end, from API design to a fast, accessible UI.</p>
          <ul className={styles.techList}>
            <li>React &amp; Next.js</li>
            <li>TypeScript / JavaScript</li>
            <li>Python &amp; FastAPI</li>
            <li>OpenCV &amp; OCR</li>
            <li>Node.js &amp; Express</li>
            <li>AWS &amp; Bedrock</li>
          </ul>
        </div>
        <div className={styles.imageBlock}>
          <ProfileCard
            avatarUrl="/assets/profile.webp"
            name="Aaron"
            title="Software Engineer"
            handle="lylaaron98"
            status="Open to Work"
            contactText="Contact Me"
            showUserInfo
            enableTilt={enableProfileTilt}
            enableMobileTilt={false}
            iconUrl="/assets/iconpattern.svg"
            behindGlowColor="rgba(180, 180, 195, 0.45)"
            behindGlowEnabled={false}
            innerGradient="linear-gradient(145deg, #1e1e28 0%, #2a2a38 100%)"
            onContactClick={() => scrollToSection('contact')}
          />
        </div>
      </div>
    </SectionContainer>
  )
}
