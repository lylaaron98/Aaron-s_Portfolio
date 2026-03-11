import styles from './ShinyText.module.css'
import { cx } from '../../../utils/classNames'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className,
}: ShinyTextProps) {
  return (
    <span
      className={cx(styles.shinyText, disabled && styles.disabled, className)}
      style={{ ['--shiny-duration' as string]: `${speed}s` }}
    >
      {text}
    </span>
  )
}
