import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { authFieldClass } from './AuthShell'

export function AuthPasswordField({ value, onChange, autoComplete, minLength, hint }: {
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
  hint?: string
}) {
  const [visible, setVisible] = useState(false)
  const inputId = useId()
  const hintId = useId()
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        Password
      </label>
        <div className="relative mt-1.5">
          <input id={inputId} type={visible ? 'text' : 'password'} required minLength={minLength} autoComplete={autoComplete} name="password" value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? hintId : undefined} className={`${authFieldClass} !mt-0 pr-12`} />
          <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible((current) => !current)} className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
      {hint && <p id={hintId} className="mt-2 text-xs font-normal leading-5 text-slate-500">{hint}</p>}
    </div>
  )
}
