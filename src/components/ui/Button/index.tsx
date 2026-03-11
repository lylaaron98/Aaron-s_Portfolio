import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import styles from './Button.module.css'
import { cx } from '../../../utils/classNames'

type ButtonVariant = 'primary' | 'secondary'

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type ButtonAsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

type ButtonProps = (ButtonAsButton | ButtonAsAnchor) & {
  variant?: ButtonVariant
}

export default function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cx(
    styles.btn,
    variant === 'primary' ? styles.primary : styles.secondary,
    className
  )

  if (props.as === 'a') {
    const { as, ...anchorProps } = props as ButtonAsAnchor
    void as
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { as, ...buttonProps } = props as ButtonAsButton
  void as
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
