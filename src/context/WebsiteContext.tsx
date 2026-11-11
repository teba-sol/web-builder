import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
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
import { clearPreviewSite, clearSavedSite, loadSavedSite, saveSite } from '../utils/storage'

interface WebsiteContextValue {
  templateId: TemplateId | null
  content: SiteContent
  colorSchemeId: string
  layoutVariantId: string
  projectId: string | null
  canExport: boolean
  canCloudSave: boolean
  canEdit: boolean
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
  bindProject: (project: ProjectResponse, preserveContent?: boolean) => void
  hasUnsavedChanges: boolean
  discardChanges: () => void
  clearProject: () => void
  markProjectPaid: () => void
  persistNow: (project?: ProjectResponse) => Promise<void>
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
  const [canEdit, setCanEdit] = useState(true)
  const [entitlementStatus, setEntitlementStatus] = useState<ProjectResponse['entitlementStatus'] | null>(null)
  const snapshot = JSON.stringify({ templateId, content, colorSchemeId, layoutVariantId })
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot)
  const hasUnsavedChanges = snapshot !== savedSnapshot

  const discardChanges = () => {
    const saved = JSON.parse(savedSnapshot)
    setTemplateId(saved.templateId)
    setContent(saved.content)
    setColorSchemeId(saved.colorSchemeId)
    setLayoutVariantId(saved.layoutVariantId)
    clearPreviewSite()
    if (projectId && saved.templateId) {
      saveSite(saved.templateId, saved.content, saved.colorSchemeId, saved.layoutVariantId)
    } else {
      clearSavedSite()
    }
  }

  const clearProject = useCallback(() => {
    setProjectId(null)
    setCanExport(false)
    setCanCloudSave(false)
    setCanEdit(true)
    setEntitlementStatus(null)
  }, [])

  const selectTemplate = useCallback((id: TemplateId, appearance?: EditorAppearance | null) => {
    clearProject()
    clearPreviewSite()
    setTemplateId(id)
    const defaults = sanitizeContentLinks({ ...getEditorContent(id) })
    const schemeId = getDefaultColorSchemeId(id)
    const applied = appearance
      ? applyAppearanceToContent(id, defaults, appearance)
      : { content: { ...defaults, ...brandColorsFromScheme(id, schemeId) }, colorSchemeId: schemeId }
    const nextScheme = applied.colorSchemeId || schemeId
    const nextLayout = getDefaultLayoutVariantId(id)
    setContent(applied.content)
    setColorSchemeId(nextScheme)
    setLayoutVariantId(nextLayout)
    setSavedSnapshot(JSON.stringify({ templateId: id, content: applied.content, colorSchemeId: nextScheme, layoutVariantId: nextLayout }))
  }, [clearProject])

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

  const restoreSite = useCallback((document: SiteDocument) => {
    clearPreviewSite()
    const nextContent = sanitizeContentLinks(migrateContent(document.content, document.templateId))
    const nextScheme = document.colorSchemeId || getDefaultColorSchemeId(document.templateId)
    const nextLayout = document.layoutVariantId || getDefaultLayoutVariantId(document.templateId)
    setTemplateId(document.templateId)
    setContent(nextContent)
    setColorSchemeId(nextScheme)
    setLayoutVariantId(nextLayout)
    setSavedSnapshot(JSON.stringify({ templateId: document.templateId, content: nextContent, colorSchemeId: nextScheme, layoutVariantId: nextLayout }))
  }, [])

  const bindProject = useCallback((project: ProjectResponse, preserveContent = false) => {
    setProjectId(project.id)
    setCanExport(project.canExport)
    setCanCloudSave(project.canCloudSave)
    setCanEdit(project.canEdit)
    setEntitlementStatus(project.entitlementStatus)
    if (preserveContent) return
    const document = project.document as SiteDocument | null
    if (document && document.content) {
      restoreSite(document)
      return
    }
    if (project.templateId) {
      const nextScheme = project.colorSchemeId || getDefaultColorSchemeId(project.templateId)
      const nextLayout = project.layoutVariantId || getDefaultLayoutVariantId(project.templateId)
      const nextContent = sanitizeContentLinks({ ...getEditorContent(project.templateId), ...brandColorsFromScheme(project.templateId, nextScheme) })
      setTemplateId(project.templateId)
      setContent(nextContent)
      setColorSchemeId(nextScheme)
      setLayoutVariantId(nextLayout)
      setSavedSnapshot(JSON.stringify({ templateId: project.templateId, content: nextContent, colorSchemeId: nextScheme, layoutVariantId: nextLayout }))
    }
  }, [restoreSite])

  const markProjectPaid = () => {
    setCanExport(true)
    setCanCloudSave(true)
    setEntitlementStatus('PAID')
  }

  const persistNow = async (project?: ProjectResponse) => {
    const targetId = project?.id ?? projectId
    if (!targetId || !templateId) throw new Error('No project to save')
    if (!(project?.canCloudSave ?? canCloudSave)) throw new Error('Save is locked until this website is unlocked')
    const savingSnapshot = snapshot
    const document = buildSiteDocument(templateId, content, colorSchemeId, layoutVariantId)
    await saveProjectDraft(targetId, {
      name: content.businessName || templateId,
      colorSchemeId,
      layoutVariantId,
      document,
    })
    setSavedSnapshot(savingSnapshot)
    clearPreviewSite()
    saveSite(templateId, content, colorSchemeId, layoutVariantId)
  }

  const reset = () => {
    setTemplateId(null)
    setContent(defaultContent)
    setColorSchemeId('')
    setLayoutVariantId('')
    clearProject()
    setSavedSnapshot(JSON.stringify({ templateId: null, content: defaultContent, colorSchemeId: '', layoutVariantId: '' }))
    clearPreviewSite()
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
        canEdit,
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
        clearProject,
        hasUnsavedChanges,
        discardChanges,
        markProjectPaid,
        persistNow,
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