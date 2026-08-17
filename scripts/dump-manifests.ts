/**
 * One-shot dump of the current TypeScript template maps into JSON manifests.
 * Run from web-builder-exp: npx tsx scripts/dump-manifests.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colorSchemesByTemplate } from '../src/data/colorSchemes.ts'
import { templateDefaults } from '../src/data/defaults.ts'
import { DEFAULT_HOME_SECTIONS } from '../src/data/homePageConfig.ts'
import { HOSPITALITY_TEMPLATE_IDS } from '../src/data/hospitality.ts'
import { defaultShowcaseByTemplate, showcaseConfigByTemplate } from '../src/data/sectionConfig.ts'
import { getSectionVariants } from '../src/data/sectionVariants.ts'
import { TEMPLATE_IDS } from '../src/data/templateIds.ts'
import { getTemplateMeta } from '../src/data/templates.ts'
import { getPageLayouts } from '../src/templates/pageLayouts.ts'
import { sectionOrders, themes } from '../src/templates/themes.ts'
import type { TemplateManifest } from '../src/catalog/types.ts'
import type { HeroBadgeMode, NavShellId, TemplateFeature } from '../src/catalog/vocab.ts'
import { validateManifest } from '../src/catalog/validate.ts'

const OVERLAY_IDS = new Set([
  'creative',
  'restaurant',
  'fitness',
  'realtor',
  'photography',
  'noir',
  'coastal',
  'vineyard',
  'arcade',
  'coffee',
  'hotel',
  'guesthouse',
  'alpine',
  'ryokan',
  'desert',
  'nordic',
  'jungle',
  'taxfighters',
])

const SPLIT_COLUMN_IDS = new Set(['business', 'saas', 'medical', 'lawfirm', 'cpa', 'aureum', 'flux', 'axiom', 'helix', 'terra'])

function overlayGradient(id: string): string {
  switch (id) {
    case 'creative':
      return 'bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent'
    case 'restaurant':
      return 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
    case 'fitness':
      return 'bg-gradient-to-r from-black via-black/80 to-transparent'
    case 'realtor':
      return 'bg-black/40'
    case 'noir':
      return 'bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/30'
    case 'coastal':
    case 'hotel':
      return 'bg-gradient-to-t from-sky-950/90 via-sky-900/40 to-transparent'
    case 'alpine':
      return 'bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent'
    case 'ryokan':
      return 'bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent'
    case 'desert':
      return 'bg-gradient-to-t from-amber-950/95 via-orange-900/40 to-transparent'
    case 'nordic':
      return 'bg-gradient-to-t from-teal-950/90 via-slate-900/40 to-transparent'
    case 'jungle':
      return 'bg-gradient-to-t from-emerald-950 via-lime-950/50 to-transparent'
    case 'taxfighters':
      return 'bg-black/50'
    case 'vineyard':
      return 'bg-gradient-to-r from-rose-950/90 via-rose-900/50 to-transparent'
    case 'arcade':
      return 'bg-gradient-to-br from-fuchsia-950/80 via-black/70 to-lime-950/40'
    case 'coffee':
    case 'guesthouse':
      return 'bg-gradient-to-r from-[#1a0f08]/95 via-[#2d1810]/75 to-[#1a0f08]/40'
    default:
      return 'bg-black/30'
  }
}

function heroBadge(id: string): HeroBadgeMode {
  if (id === 'restaurant') return 'established'
  if (id === 'photography') return 'none'
  return 'name'
}

function buildManifest(id: (typeof TEMPLATE_IDS)[number], sortOrder: number): TemplateManifest {
  const meta = getTemplateMeta(id)
  if (!meta) throw new Error(`Missing template meta for ${id}`)

  const features: TemplateFeature[] = HOSPITALITY_TEMPLATE_IDS.includes(id)
    ? ['cms', 'hospitality']
    : ['cms']

  const schemes = colorSchemesByTemplate[id]
  const defaults = templateDefaults[id]

  return {
    schemaVersion: 1,
    id,
    name: meta.name,
    description: meta.description,
    category: meta.category,
    previewGradient: meta.previewGradient,
    accentColor: meta.accentColor,
    premium: meta.premium,
    sortOrder,
    features,
    pages: defaults.pageVisibility,
    homeSections: [...DEFAULT_HOME_SECTIONS],
    sectionOrder: [...sectionOrders[id]],
    theme: themes[id],
    colorSchemes: schemes,
    defaultColorSchemeId: schemes[0]?.id,
    defaultLayoutVariantId: 'classic',
    sectionVariants: getSectionVariants(id),
    showcase: showcaseConfigByTemplate[id],
    defaultShowcase: defaultShowcaseByTemplate[id],
    navShell: id as NavShellId,
    contactFields: meta.contactFields,
    servicesLabel: meta.servicesLabel,
    pageLayouts: getPageLayouts(id),
    hero: {
      overlay: OVERLAY_IDS.has(id),
      overlayGradient: overlayGradient(id),
      splitColumns: SPLIT_COLUMN_IDS.has(id),
      badge: heroBadge(id),
      grayscaleImage: id === 'noir',
    },
    defaults,
  }
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '../src/catalog/manifests')
mkdirSync(outDir, { recursive: true })

let failed = 0
for (const [index, id] of TEMPLATE_IDS.entries()) {
  const manifest = buildManifest(id, index)
  const result = validateManifest(manifest)
  if (!result.ok) {
    failed += 1
    console.error(`Invalid manifest for ${id}:\n  ${result.errors.join('\n  ')}`)
    continue
  }
  const path = join(outDir, `${id}.json`)
  writeFileSync(path, `${JSON.stringify(result.manifest, null, 2)}\n`)
  console.log(`wrote ${path}`)
}

if (failed > 0) {
  process.exit(1)
}

console.log(`dumped ${TEMPLATE_IDS.length} manifests`)
