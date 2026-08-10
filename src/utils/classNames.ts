/**
 * The single class-name joiner.
 *
 * There used to be two: `cx` here (6 consumers) and `cn` in lib/utils.ts
 * (1 consumer), the latter wrapping clsx + tailwind-merge. tailwind-merge only
 * earns its keep when you are overriding conflicting Tailwind utilities across
 * a component boundary — the one call site that used it passed CSS-module
 * classes, which never conflict. So there is one implementation now, and `cn`
 * is kept as an alias so the Tailwind-flavoured call sites read naturally.
 */
export type ClassValue = string | number | false | null | undefined

export function cx(...classes: ClassValue[]): string {
  let out = ''
  for (const cls of classes) {
    if (!cls && cls !== 0) continue
    out = out ? `${out} ${cls}` : String(cls)
  }
  return out
}

/** Alias of {@link cx}. Reads better alongside Tailwind utility strings. */
export const cn = cx

export default cx
