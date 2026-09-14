import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { saveProjectDraft } from '../api/projects'
import type { ProjectResponse } from '../api/types'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import { getDefaultLayoutVariantId } from '../data/layoutVariants'
import { brandColorsFromScheme } from '../templates/cloneTheme'
import {
  CUSTOM_COLOR_SCHEME_ID,
  applyAppearanceToContent,
  type EditorAppearance,
} from '../data/pickTemplate'
import type { PageVisibility, SiteContent, TemplateId, ToggleableSection } from '../types'
import { defaultContent, getEditorContent } from '../data/defaults'
import {
  createEmptyListItem,
  LIST_MAX_COUNT,
  LIST_MIN_COUNT,
  type ContentListKey,
} from '../data/listDefaults'
import { buildSiteDocument } from '../siteDocument/io'
import type { SiteDocument } from '../siteDocument/types'
import { sanitizeContentLinks } from '../utils/linkResolver'
import { migrateContent } from '../utils/migrateContent'
import { clearSavedSite, loadSavedSite, saveSite } from '../utils/storage'

interface WebsiteContextValue {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
  layoutVariantId: string
  projectId: string | null
  canExport: boolean
  canCloudSave: boolean
  entitlementStatus: ProjectResponse['entitlementStatus'] | null
  selectTemplate: (id: TemplateId, appearance?: EditorAppearance | null) => void
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
  restoreSite: (document: SiteDocument) => void
  bindProject: (project: ProjectResponse) => void
  markProjectPaid: () => void
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
      content: migrateContent(saved.content, saved.templateId),
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
  const [projectId, setProjectId] = useState<string | null>(null)
  const [canExport, setCanExport] = useState(false)
  const [canCloudSave, setCanCloudSave] = useState(false)
  const [entitlementStatus, setEntitlementStatus] = useState<ProjectResponse['entitlementStatus'] | null>(null)
  const skipNextCloudSave = useRef(false)

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

  useEffect(() => {
    if (!projectId || !canCloudSave || !templateId) return
    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false
      return
    }
    const handle = window.setTimeout(() => {
      const document = buildSiteDocument(templateId, content, colorSchemeId, layoutVariantId)
      saveProjectDraft(projectId, {
        name: content.businessName || templateId,
        colorSchemeId,
        layoutVariantId,
        document,
      }).catch(() => {
        /* keep localStorage fallback */
      })
    }, 2500)
    return () => window.clearTimeout(handle)
  }, [projectId, canCloudSave, templateId, content, colorSchemeId, layoutVariantId])

  const selectTemplate = (id: TemplateId, appearance?: EditorAppearance | null) => {
    setTemplateId(id)
    const defaults = sanitizeContentLinks({ ...getEditorContent(id) })
    if (appearance) {
      const applied = applyAppearanceToContent(id, defaults, appearance)
      setContent(applied.content)
      setColorSchemeId(applied.colorSchemeId || getDefaultColorSchemeId(id))
    } else {
      const schemeId = getDefaultColorSchemeId(id)
      setContent({ ...defaults, ...brandColorsFromScheme(id, schemeId) })
      setColorSchemeId(schemeId)
    }
    setLayoutVariantId(getDefaultLayoutVariantId(id))
  }

  const setColorScheme = (schemeId: string) => {
    setColorSchemeId(schemeId)
    if (!templateId || schemeId === CUSTOM_COLOR_SCHEME_ID) return
    const brand = brandColorsFromScheme(templateId, schemeId)
    setContent((prev) => ({ ...prev, ...brand }))
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

  const restoreSite = (document: SiteDocument) => {
    setTemplateId(document.templateId)
    setContent(sanitizeContentLinks(migrateContent(document.content, document.templateId)))
    setColorSchemeId(document.colorSchemeId || getDefaultColorSchemeId(document.templateId))
    setLayoutVariantId(document.layoutVariantId || getDefaultLayoutVariantId(document.templateId))
  }

  const bindProject = (project: ProjectResponse) => {
    skipNextCloudSave.current = true
    setProjectId(project.id)
    setCanExport(project.canExport)
    setCanCloudSave(project.canCloudSave)
    setEntitlementStatus(project.entitlementStatus)
    const document = project.document as SiteDocument | null
    if (document && document.content) {
      restoreSite(document)
      return
    }
    if (project.templateId) {
      setTemplateId(project.templateId)
      setColorSchemeId(project.colorSchemeId || getDefaultColorSchemeId(project.templateId))
      setLayoutVariantId(project.layoutVariantId || getDefaultLayoutVariantId(project.templateId))
    }
  }

  const markProjectPaid = () => {
    setCanExport(true)
    setCanCloudSave(true)
    setEntitlementStatus('PAID')
  }

  const reset = () => {
    setTemplateId(null)
    setContent(defaultContent)
    setColorSchemeId('')
    setLayoutVariantId('')
    setProjectId(null)
    setCanExport(false)
    setCanCloudSave(false)
    setEntitlementStatus(null)
    clearSavedSite()
  }

  return (
    <WebsiteContext.Provider
      value={{
        templateId,
        content,
        colorSchemeId,
        layoutVariantId,
        projectId,
        canExport,
        canCloudSave,
        entitlementStatus,
        selectTemplate,
        setColorScheme,
        setLayoutVariant,
        updateContent,
        updateListItem,
        addListItem,
        removeListItem,
        toggleSectionVisibility,
        togglePageVisibility,
        restoreSite,
        bindProject,
        markProjectPaid,
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