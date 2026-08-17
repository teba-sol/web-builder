import type { TemplateMeta } from '../types'
import type { TemplateManifest } from './types'
import { manifestToMeta } from './types'
import { validateManifest } from './validate'
import type { TemplateFeature } from './vocab'

const modules = import.meta.glob('./manifests/*.json', { eager: true })

function moduleValue(mod: unknown): unknown {
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return (mod as { default: unknown }).default
  }
  return mod
}

function loadCatalog(): Map<string, TemplateManifest> {
  const map = new Map<string, TemplateManifest>()
  const errors: string[] = []

  for (const [path, mod] of Object.entries(modules)) {
    const result = validateManifest(moduleValue(mod))
    if (!result.ok) {
      errors.push(`${path}:\n  ${result.errors.join('\n  ')}`)
      continue
    }
    if (map.has(result.manifest.id)) {
      errors.push(`${path}: duplicate template id "${result.manifest.id}"`)
      continue
    }
    map.set(result.manifest.id, result.manifest)
  }

  if (errors.length > 0) {
    throw new Error(`Invalid template manifests:\n${errors.join('\n')}`)
  }
  if (map.size === 0) {
    throw new Error('No template manifests found in src/catalog/manifests')
  }

  return map
}

const bundled = loadCatalog()
const imported = new Map<string, TemplateManifest>()
const listeners = new Set<() => void>()
let cachedMeta: TemplateMeta[] | null = null

const IMPORTED_STORAGE_KEY = 'webbuilder-imported-templates'

function notifyCatalog() {
  cachedMeta = null
  for (const listener of listeners) listener()
}

export function subscribeCatalog(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function persistImported() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(IMPORTED_STORAGE_KEY, JSON.stringify([...imported.values()]))
}

function loadImportedFromStorage() {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(IMPORTED_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return
    for (const item of parsed) {
      const result = validateManifest(item)
      if (result.ok) imported.set(result.manifest.id, result.manifest)
    }
  } catch {
    /* ignore corrupt imports */
  }
}

loadImportedFromStorage()

function allManifests(): Map<string, TemplateManifest> {
  const map = new Map(bundled)
  for (const [id, manifest] of imported) map.set(id, manifest)
  return map
}

export function listManifests(): TemplateManifest[] {
  return [...allManifests().values()].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
}

export function getManifest(id: string | null | undefined): TemplateManifest | undefined {
  if (!id) return undefined
  return imported.get(id) ?? bundled.get(id)
}

export function isBundledTemplate(id: string): boolean {
  return bundled.has(id)
}

export function isImportedTemplate(id: string): boolean {
  return imported.has(id)
}

export function registerImportedManifest(manifest: TemplateManifest): TemplateManifest {
  imported.set(manifest.id, manifest)
  persistImported()
  notifyCatalog()
  return manifest
}

export function removeImportedManifest(id: string): void {
  if (!imported.delete(id)) return
  persistImported()
  notifyCatalog()
}

export function requireManifest(id: string): TemplateManifest {
  const manifest = getManifest(id)
  if (!manifest) {
    throw new Error(`Unknown template "${id}"`)
  }
  return manifest
}

export function isValidTemplateId(id: string | null | undefined): id is string {
  return Boolean(id && getManifest(id))
}

export function listTemplateIds(): string[] {
  return listManifests().map((m) => m.id)
}

export function listTemplateMeta(): TemplateMeta[] {
  cachedMeta ??= listManifests().map(manifestToMeta)
  return cachedMeta
}

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  const manifest = getManifest(id)
  return manifest ? manifestToMeta(manifest) : undefined
}

export function templateHasFeature(id: string | null | undefined, feature: TemplateFeature): boolean {
  return Boolean(id && getManifest(id)?.features.includes(feature))
}

export function getNavShellId(templateId: string): string {
  return getManifest(templateId)?.navShell ?? 'business'
}
