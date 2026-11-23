/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // index.html already resolved the theme before first paint (stored choice,
  // else the OS preference) and stamped it on <html>. Start from that so the
  // two never disagree.
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Only an explicit toggle is remembered. Persisting the initial value would
  // freeze a visitor to whatever their OS said on their first visit.
  const toggleTheme = useCallback(() => {
    startTransition(() => {
      setTheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark'
        try {
          localStorage.setItem('portfolio-theme', next)
        } catch {
          // Storage can be unavailable (private mode); the toggle still works.
        }
        return next
      })
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
