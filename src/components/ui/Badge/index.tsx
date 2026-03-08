import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'
import { cx } from '../../../utils/classNames'

type BadgeVariant = 'filled' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export default function Badge({
  variant = 'filled',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(styles.badge, styles[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
