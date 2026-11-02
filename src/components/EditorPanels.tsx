import { Children, isValidElement, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function EditorPanel({ children }: { title: string; children: ReactNode }) {
  return <>{children}</>
}

/** Keep the existing forms mounted so switching sections preserves local editing state. */
export function EditorPanels({ children }: { children: ReactNode }) {
  const panels = Children.toArray(children).filter(
    (child) => isValidElement<{ title: string }>(child) && typeof child.props.title === 'string',
  )
  const [selected, setSelected] = useState('Hero')
  const scroller = useRef<HTMLDivElement>(null)
  const titles = panels.map((panel) => isValidElement<{ title: string }>(panel) ? panel.props.title : '')
  // A page or optional section can be disabled while the editor is open.
  const active = titles.includes(selected) ? selected : titles[0]
  const index = titles.indexOf(active)

  const choose = (title: string) => {
    setSelected(title)
    scroller.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="editor-section" className="text-sm font-semibold text-slate-900">Edit your website</label>
          <span className="text-xs text-slate-500">{index + 1} / {panels.length}</span>
        </div>
        <select
          id="editor-section"
          value={active}
          onChange={(event) => choose(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {titles.map((title) => <option key={title} value={title}>{title}</option>)}
        </select>
        <div className="flex items-center justify-between gap-3">
          <button type="button" disabled={index <= 0} onClick={() => choose(titles[index - 1])} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40">
            <ChevronLeft size={14} /> Previous
          </button>
          <button type="button" disabled={index >= titles.length - 1} onClick={() => choose(titles[index + 1])} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
        {panels.map((panel, i) => (
          <div key={titles[i]} hidden={titles[i] !== active}>{panel}</div>
        ))}
      </div>
    </div>
  )
}
