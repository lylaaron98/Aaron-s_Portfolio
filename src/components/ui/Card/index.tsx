import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'
import { cx } from '../../../utils/classNames'

type CardVariant = 'default' | 'navy'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift + glow effect (default: true) */
  hoverable?: boolean
  /** Background variant: 'default' = navy-light, 'navy' = navy */
  variant?: CardVariant
  /** Show a gradient overlay on hover */
  gradientOverlay?: boolean
  /** Show a top-edge gradient line on hover */
  topAccent?: boolean
}

export default function Card({
  hoverable = true,
  variant = 'default',
  gradientOverlay = false,
  topAccent = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        styles.card,
        hoverable && styles.hoverable,
        variant === 'navy' && styles.navy,
        gradientOverlay && styles.gradientOverlay,
        topAccent && styles.topAccent,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
