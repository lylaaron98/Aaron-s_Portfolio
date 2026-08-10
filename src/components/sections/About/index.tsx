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
    <SectionContainer id="about" title="About Me">
      <div className={styles.inner}>
        <div className={styles.textBlock}>
          <p>
            Hey! I'm <span className={styles.highlight}>Aaron</span>, a software engineer with
            production experience across banking, government, sustainability, and Japanese
            enterprise clients, and a Bachelor's in Computer Science (Hons) from Goldsmiths,
            University of London (SIM).
          </p>
          <p>
            At <span className={styles.highlight}>Mizuho Bank</span> I modernized mission-critical
            treasury systems, moving legacy VB.Net and Oracle applications onto a{' '}
            <span className={styles.highlight}>React</span>,{' '}
            <span className={styles.highlight}>TypeScript</span>, Node.js, and SQL Server
            architecture. Before that I delivered JTC's real-time land bidding platform on
            WebSocket infrastructure, cutting frontend load time by over 30%.
          </p>
          <p>
            I'm now working independently on applied AI product engineering — computer vision and
            OCR pipelines in <span className={styles.highlight}>Python</span> and{' '}
            <span className={styles.highlight}>FastAPI</span>, AR/VR prototypes in Unity, and
            full-stack applications deployed on AWS and Firebase. I like owning a feature end to
            end, from ERD and REST API design through to a performant, accessible frontend.
          </p>
          <ul className={styles.techList}>
            <li>React &amp; Next.js</li>
            <li>TypeScript / JavaScript</li>
            <li>Python &amp; FastAPI</li>
            <li>OpenCV &amp; OCR</li>
            <li>Node.js &amp; Express</li>
            <li>AWS &amp; Azure DevOps</li>
          </ul>
        </div>
        <div className={styles.imageBlock}>
          <ProfileCard
            avatarUrl="/assets/photo_2026-03-14_21-35-16.jpg"
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
