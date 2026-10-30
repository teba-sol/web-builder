import { Moon, Sun } from 'lucide-react'
import { useAuraTheme } from '../../hooks/useAuraTheme'
import './AuraTheme.css'

export function AuraThemeToggle() {
  const { theme, toggleTheme } = useAuraTheme()
  return <button type="button" onClick={toggleTheme} className="aura-theme-toggle" aria-label={theme === 'light' ? 'Switch to the original dark design' : 'Preview the light design'} title={theme === 'light' ? 'Switch to original dark design' : 'Preview light design'} aria-pressed={theme === 'light'}>{theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'light' ? 'Light' : 'Dark'}</span></button>
}
