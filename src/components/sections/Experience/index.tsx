
import { experiences } from '../../../data/experience'
import SectionContainer from '../../ui/SectionContainer'
import Badge from '../../ui/Badge'
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component'
import Card from '../../ui/Card'
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
            contentStyle={{ background: 'none', boxShadow: 'none', padding: 0 }}
            contentArrowStyle={{ borderRight: '7px solid var(--accent)' }}
          >
            <Card className="w-full h-full flex flex-col gap-4 p-6" variant="default" hoverable gradientOverlay tilt>
              {/* Role & Company */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-lg md:text-xl text-neutral-900 dark:text-neutral-100 leading-tight">{exp.role}</span>
                <span className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg leading-tight">@ {exp.company}</span>
              </div>
              {/* Date */}
              <div className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                {exp.startDate} – {exp.endDate ?? 'Present'}
              </div>
              {/* Description */}
              <ul className="flex flex-col gap-2 list-disc pl-5 text-neutral-800 dark:text-neutral-200 text-sm md:text-base">
                {exp.description.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                {exp.tech.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Card>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </SectionContainer>
  )
}
