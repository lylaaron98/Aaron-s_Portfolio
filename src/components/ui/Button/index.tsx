import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'
import { cx } from '../../../utils/classNames'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

type ButtonProps = (ButtonAsButton | ButtonAsAnchor) & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
}

const SIZES: Record<ButtonSize, string | undefined> = {
  sm: styles.sm,
  md: undefined,
  lg: styles.lg,
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cx(styles.btn, VARIANTS[variant], SIZES[size], className)

  if (props.as === 'a') {
    const { as: _as, ...anchorProps } = props as ButtonAsAnchor
    void _as
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { as: _as, type, ...buttonProps } = props as ButtonAsButton
  void _as
  return (
    // Default to type="button". Without it these submit any form they sit in,
    // which is exactly the wrong default for a "View my work" scroll trigger.
    <button className={classes} type={type ?? 'button'} {...buttonProps}>
      {children}
    </button>
  )
}
