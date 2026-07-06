import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import type { SiteContent, TemplateId } from '../types'
import { defaultContent, templateDefaults } from '../data/defaults'
import { clearSavedSite, loadSavedSite, saveSite } from '../utils/storage'

type ListKey = 'stats' | 'services' | 'steps' | 'testimonials' | 'faqs' | 'team' | 'galleryImages'

interface WebsiteContextValue {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
  selectTemplate: (id: TemplateId) => void
  setColorScheme: (schemeId: string) => void
  updateContent: (updates: Partial<SiteContent>) => void
  updateListItem: (
    list: ListKey,
    index: number,
    field: string,
    value: string,
  ) => void
  reset: () => void
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null)

function getInitialState(): {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
} {
  const saved = loadSavedSite()
  if (saved) {
    return {
      templateId: saved.templateId,
      content: saved.content,
      colorSchemeId: saved.colorSchemeId,
    }
  }
  return { templateId: null, content: defaultContent, colorSchemeId: '' }
}

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [templateId, setTemplateId] = useState<TemplateId | null>(() => getInitialState().templateId)
  const [content, setContent] = useState<SiteContent>(() => getInitialState().content)
  const [colorSchemeId, setColorSchemeId] = useState<string>(() => getInitialState().colorSchemeId)

  useEffect(() => {
    if (templateId) saveSite(templateId, content, colorSchemeId || getDefaultColorSchemeId(templateId))
  }, [templateId, content, colorSchemeId])

  const selectTemplate = (id: TemplateId) => {
    setTemplateId(id)
    setContent({ ...templateDefaults[id] })
    setColorSchemeId(getDefaultColorSchemeId(id))
  }

  const setColorScheme = (schemeId: string) => {
    setColorSchemeId(schemeId)
  }

  const updateContent = (updates: Partial<SiteContent>) => {
    setContent((prev) => ({ ...prev, ...updates }))
  }

  const updateListItem = (list: ListKey, index: number, field: string, value: string) => {
    setContent((prev) => {
      if (list === 'galleryImages') {
        const images = [...prev.galleryImages]
        images[index] = value
        return { ...prev, galleryImages: images }
      }
      const items = [...prev[list]] as unknown as Array<Record<string, string>>
      items[index] = { ...items[index], [field]: value }
      return { ...prev, [list]: items as unknown as (typeof prev)[typeof list] }
    })
  }

  const reset = () => {
    setTemplateId(null)
    setContent(defaultContent)
    setColorSchemeId('')
    clearSavedSite()
  }

  return (
    <WebsiteContext.Provider
      value={{
        templateId,
        content,
        colorSchemeId,
        selectTemplate,
        setColorScheme,
        updateContent,
        updateListItem,
        reset,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  )
}

export function useWebsite() {
  const ctx = useContext(WebsiteContext)
  if (!ctx) throw new Error('useWebsite must be used within WebsiteProvider')
  return ctx
}