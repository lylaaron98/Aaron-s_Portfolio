/**
 * Joins class names, filtering out falsy values.
 * Lightweight alternative to the `clsx` library.
 *
 * @example
 * cx(styles.card, isActive && styles.active, 'extra-class')
 */
export function cx(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(' ')
}
