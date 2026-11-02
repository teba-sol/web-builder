import { useSyncExternalStore } from 'react'

type AuraTheme = 'light' | 'dark'
const key = 'buildoura.marketing-theme-preview'
const eventName = 'buildoura:marketing-theme'
let fallback: AuraTheme = 'light'

function readTheme(): AuraTheme {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* The in-memory choice still works when storage is unavailable. */ }
  return fallback
}

function subscribe(notify: () => void) {
  window.addEventListener(eventName, notify)
  window.addEventListener('storage', notify)
  return () => {
    window.removeEventListener(eventName, notify)
    window.removeEventListener('storage', notify)
  }
}

export function useAuraTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as AuraTheme)
  const toggleTheme = () => {
    fallback = readTheme() === 'light' ? 'dark' : 'light'
    try { window.localStorage.setItem(key, fallback) } catch { /* Use the in-memory fallback. */ }
    window.dispatchEvent(new Event(eventName))
  }
  return { theme, toggleTheme }
}
