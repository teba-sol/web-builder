import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  width: number
  children: ReactNode
}

const frameHtml = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body,#device-preview-root{margin:0;width:100%;height:100%}body{overflow:hidden}</style></head><body><div id="device-preview-root"></div></body></html>'

export function DevicePreviewFrame({ width, children }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState({ width: 0, height: 0 })
  const [frameDocument, setFrameDocument] = useState<Document | null>(null)

  useLayoutEffect(() => {
    const element = container.current!
    const measure = () => {
      const bounds = element.getBoundingClientRect()
      setAvailable({ width: bounds.width, height: bounds.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!frameDocument) return
    let copied: Node[] = []
    const syncStyles = () => {
      copied.forEach((node) => node.parentNode?.removeChild(node))
      copied = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]')).map((node) => {
        const clone = node.cloneNode(true)
        frameDocument.head.appendChild(clone)
        return clone
      })
    }
    syncStyles()
    const observer = new MutationObserver(syncStyles)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true })
    return () => {
      observer.disconnect()
      copied.forEach((node) => node.parentNode?.removeChild(node))
    }
  }, [frameDocument])

  const scale = available.width > 0 ? Math.min(1, available.width / width) : 1
  const height = Math.max(1, available.height / scale)
  const mount = frameDocument?.getElementById('device-preview-root')

  return (
    <div ref={container} className="relative min-h-0 flex-1 overflow-hidden bg-slate-200/50">
      <div className="relative mx-auto h-full bg-white" style={{ width: width * scale }}>
        <iframe
          title={`Website preview at ${width} pixels wide`}
          srcDoc={frameHtml}
          onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width, height, transform: `scale(${scale})` }}
        />
        {mount && createPortal(
          <div className="editor-site-preview relative h-full overflow-y-auto">{children}</div>,
          mount,
        )}
      </div>
    </div>
  )
}
