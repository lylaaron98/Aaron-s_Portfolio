
import { experiences } from '../../../data/experience'
import SectionContainer from '../../ui/SectionContainer'
import Badge from '../../ui/Badge'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'

export default function Experience() {

  return (
    <SectionContainer id="experience" title="Experience">
      <VerticalTimeline animate={true} lineColor="var(--accent)">
        {experiences.map((exp, i) => (
          <VerticalTimelineElement
            key={i}
            date={`${exp.startDate} – ${exp.endDate ?? 'Present'}`}
            iconStyle={{ background: 'var(--navy)', color: 'var(--accent)' }}
            contentStyle={{ background: 'rgba(192,192,200,0.04)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}
            contentArrowStyle={{ borderRight: '7px solid var(--accent)' }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-2">
              <span className="font-semibold text-base md:text-lg text-neutral-900 dark:text-neutral-100">{exp.role}</span>
              <span className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base">@ {exp.company}</span>
            </div>
            <div className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mb-2">
              {exp.startDate} – {exp.endDate ?? 'Present'}
            </div>
            <ul className="mb-4 list-disc pl-5 text-neutral-800 dark:text-neutral-200 text-sm md:text-base">
              {exp.description.map((bullet, j) => (
                <li key={j}>{bullet}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mb-2">
              {exp.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </SectionContainer>
  )
}
