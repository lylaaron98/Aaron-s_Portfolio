import { useLayoutEffect, useRef } from "react";
import { experiences } from "../../../data/experience";
import Badge from "../../ui/Badge";
import SectionContainer from "../../ui/SectionContainer";
import { gsap, ScrollTrigger, MOTION_OK } from "../../../orbit/motion";
import styles from "./Experience.module.css";

const SECTOR: Record<string, string> = {
  "Government Agency, Singapore": "Public sector",
  "Freelance (project-based), Remote": "Applied AI",
  "Corporate Bank, Singapore": "Banking",
  "Capgemini, Singapore": "Consulting",
  "Univers (Envision Group), Singapore": "Sustainability",
  "Daiso Singapore": "Retail",
  "International Data Corporation (IDC), Singapore": "Research",
};

const roles = experiences.map((exp) => ({
  ...exp,
  year: exp.startDate.split(" ").pop() ?? "",
  sector: SECTOR[exp.company] ?? "Engineering",
}));

/**
 * Vertical career timeline. A rail runs down the page and fills with the
 * brand gradient as you scroll; each role's node lights up when the fill
 * reaches it, and its card slides in from the side. Dates sit on the left on
 * wide screens and above the card on phones. Reduced motion shows it all
 * fully drawn.
 */
export default function Experience() {
  const list = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const el = list.current!;
    const mm = gsap.matchMedia(el);

    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        `.${styles.fill}`,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.4,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(`.${styles.item}`, el).forEach((item) => {
        gsap.from(item.querySelector(`.${styles.card}`), {
          opacity: 0,
          x: 48,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
        });
        gsap.from(item.querySelector(`.${styles.when}`), {
          opacity: 0,
          y: 16,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
        });
        // The node lights as the rail's fill passes it.
        ScrollTrigger.create({
          trigger: item,
          start: "top 60%",
          toggleClass: { targets: item, className: styles.reached },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <SectionContainer
      id="experience"
      number="03"
      title="Experience"
      meta="timeline"
    >
      <div className={styles.wrap}>
        <span className={styles.rail} aria-hidden="true">
          <span className={styles.fill} />
        </span>
        <ol ref={list} className={styles.timeline}>
          {roles.map((role, index) => (
            <li
              key={`${role.company}-${role.startDate}`}
              className={`${styles.item} ${styles.reachedStatic}`}
            >
              <div className={styles.when}>
                <span className={styles.year} aria-hidden="true">
                  {role.year}
                </span>
                <time className={styles.date}>
                  {role.startDate} – {role.endDate ?? "Present"}
                </time>
                <span className={styles.sector}>{role.sector}</span>
              </div>

              <span className={styles.node} aria-hidden="true">
                {index === 0 && !role.endDate ? (
                  <span className={styles.pulse} />
                ) : null}
              </span>

              <article className={styles.card}>
                <h3 className={styles.role}>{role.role}</h3>
                <p className={styles.company}>{role.company}</p>
                <ul className={styles.bullets}>
                  {role.description.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className={styles.tech}>
                  {role.tech.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </SectionContainer>
  );
}
