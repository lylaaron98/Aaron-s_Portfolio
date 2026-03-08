import type { HTMLAttributes } from 'react'
import styles from './SectionContainer.module.css'
import { cx } from '../../../utils/classNames'

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  id?: string
  background?: 'navy' | 'navy-light'
  /** Section number shown before the title (e.g. "01") */
  number?: string
  /** Section heading text rendered beside the number */
  title?: string
}

export default function SectionContainer({
  id,
  background = 'navy',
  number,
  title,
  className,
  children,
  ...props
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cx(
        styles.section,
        background === 'navy-light' ? styles.bgLight : styles.bgNavy,
        className
      )}
      {...props}
    >
      <div className="container">
        {title && (
          <h2 className={styles.sectionTitle}>
            {number && <span className={styles.num}>{number}.</span>}
            {title}
            <span className={styles.line} />
          </h2>
        )}
        {children}
      </div>
    </section>
  )
}
