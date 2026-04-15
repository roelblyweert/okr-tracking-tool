import { useState, useEffect } from 'react'

export function useTheme() {
  // Trust the class the inline FOUC script already set on <html> — avoids
  // re-reading storage and diverging from the pre-paint decision.
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage may be blocked (private mode, strict privacy) — theme still works in memory
    }
  }, [theme])

  function toggleTheme() {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}
