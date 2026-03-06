import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sukedachi_theme'

function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference) {
  if (preference === 'system') return getSystemPreference()
  return preference
}

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system'
  })

  const isDark = resolveTheme(preference) === 'dark'

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setPreference(p => p) // force re-render
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = useCallback((newPref) => {
    setPreference(newPref)
    localStorage.setItem(STORAGE_KEY, newPref)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return { isDark, preference, setTheme, toggleTheme }
}
