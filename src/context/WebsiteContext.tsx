import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import { getDefaultLayoutVariantId } from '../data/layoutVariants'
import type { PageVisibility, SiteContent, TemplateId, ToggleableSection } from '../types'
import { defaultContent, templateDefaults } from '../data/defaults'
import {
  createEmptyListItem,
  LIST_MAX_COUNT,
  LIST_MIN_COUNT,
  type ContentListKey,
} from '../data/listDefaults'
import { sanitizeContentLinks } from '../utils/linkResolver'
import { clearSavedSite, loadSavedSite, saveSite } from '../utils/storage'

interface WebsiteContextValue {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
  layoutVariantId: string
  selectTemplate: (id: TemplateId) => void
  setColorScheme: (schemeId: string) => void
  setLayoutVariant: (variantId: string) => void
  updateContent: (updates: Partial<SiteContent>) => void
  updateListItem: (
    list: ContentListKey,
    index: number,
    field: string,
    value: string,
  ) => void
  addListItem: (list: ContentListKey) => void
  removeListItem: (list: ContentListKey, index: number) => void
  toggleSectionVisibility: (section: ToggleableSection) => void
  togglePageVisibility: (page: keyof PageVisibility) => void
  reset: () => void
}

const WebsiteContext = createContext<WebsiteContextValue | null>(null)

function getInitialState(): {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
  layoutVariantId: string
} {
  const saved = loadSavedSite()
  if (saved) {
    return {
      templateId: saved.templateId,
      content: saved.content,
      colorSchemeId: saved.colorSchemeId,
      layoutVariantId: saved.layoutVariantId,
    }
  }
  return { templateId: null, content: defaultContent, colorSchemeId: '', layoutVariantId: '' }
}

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const [templateId, setTemplateId] = useState<TemplateId | null>(() => getInitialState().templateId)
  const [content, setContent] = useState<SiteContent>(() => getInitialState().content)
  const [colorSchemeId, setColorSchemeId] = useState<string>(() => getInitialState().colorSchemeId)
  const [layoutVariantId, setLayoutVariantId] = useState<string>(() => getInitialState().layoutVariantId)

  useEffect(() => {
    if (templateId) {
      saveSite(
        templateId,
        content,
        colorSchemeId || getDefaultColorSchemeId(templateId),
        layoutVariantId || getDefaultLayoutVariantId(templateId),
      )
    }
  }, [templateId, content, colorSchemeId, layoutVariantId])

  const selectTemplate = (id: TemplateId) => {
    setTemplateId(id)
    setContent(sanitizeContentLinks({ ...templateDefaults[id] }))
    setColorSchemeId(getDefaultColorSchemeId(id))
    setLayoutVariantId(getDefaultLayoutVariantId(id))
  }

  const setColorScheme = (schemeId: string) => {
    setColorSchemeId(schemeId)
  }

  const setLayoutVariant = (variantId: string) => {
    setLayoutVariantId(variantId)
  }

  const updateContent = (updates: Partial<SiteContent>) => {
    setContent((prev) => ({ ...prev, ...updates }))
  }

  const updateListItem = (list: ContentListKey, index: number, field: string, value: string) => {
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

  const addListItem = (list: ContentListKey) => {
    setContent((prev) => {
      const current = prev[list] as unknown[]
      if (current.length >= LIST_MAX_COUNT) return prev
      const item = createEmptyListItem(list)
      return { ...prev, [list]: [...current, item] as typeof prev[typeof list] }
    })
  }

  const removeListItem = (list: ContentListKey, index: number) => {
    setContent((prev) => {
      const current = [...prev[list]] as unknown[]
      if (current.length <= LIST_MIN_COUNT[list]) return prev
      current.splice(index, 1)
      return { ...prev, [list]: current as typeof prev[typeof list] }
    })
  }

  const toggleSectionVisibility = (section: ToggleableSection) => {
    setContent((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [section]: !prev.sectionVisibility[section],
      },
    }))
  }

  const togglePageVisibility = (page: keyof PageVisibility) => {
    setContent((prev) => ({
      ...prev,
      pageVisibility: {
        ...prev.pageVisibility,
        [page]: !prev.pageVisibility[page],
      },
    }))
  }

  const reset = () => {
    setTemplateId(null)
    setContent(defaultContent)
    setColorSchemeId('')
    setLayoutVariantId('')
    clearSavedSite()
  }

  return (
    <WebsiteContext.Provider
      value={{
        templateId,
        content,
        colorSchemeId,
        layoutVariantId,
        selectTemplate,
        setColorScheme,
        setLayoutVariant,
        updateContent,
        updateListItem,
        addListItem,
        removeListItem,
        toggleSectionVisibility,
        togglePageVisibility,
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