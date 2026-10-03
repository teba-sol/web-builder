import type { CSSProperties, ReactNode } from 'react'

export function BrowserFrame({
  src,
  alt = '',
  className = '',
  style,
  children,
  compact,
  chrome = true,
}: {
  src?: string
  alt?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
  compact?: boolean
  chrome?: boolean
}) {
  return (
    <div
      className={`overflow-hidden bg-white shadow-[0_30px_90px_rgba(4,36,92,0.18)] ${className}`}
      style={{ borderRadius: 2, ...style }}
    >
      {chrome && (
        <div className={`flex items-center gap-1.5 border-b border-navy/10 bg-[#eef1f7] ${compact ? 'h-5 px-2' : 'h-7 px-3'}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-navy/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-navy/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
      )}
      {src ? (
        <img src={src} alt={alt} className="block w-full select-none" draggable={false} loading="lazy" />
      ) : (
        children
      )}
    </div>
  )
}
