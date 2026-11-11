import { resolveLogoSize } from '../data/brand'
import { THEME_KEYS } from './theme'
import type { TemplateManifest } from './types'
import { TEMPLATE_MANIFEST_SCHEMA_VERSION } from './types'
import {
  BLOG_LIST_LAYOUTS,
  BLOG_POST_LAYOUTS,
  CONTACT_FORM_STYLE_IDS,
  CONTACT_SHELL_IDS,
  EXPLORE_LAYOUT_IDS,
  FAQ_LAYOUT_IDS,
  GALLERY_LAYOUTS,
  HERO_BADGE_MODES,
  HOME_SECTION_IDS,
  NAV_SHELL_IDS,
  NEWS_LIST_LAYOUTS,
  NEWS_POST_LAYOUTS,
  PAGE_VISIBILITY_KEYS,
  PORTFOLIO_LAYOUTS,
  SECTION_IDS,
  SECTION_VISIBILITY_KEYS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_FEATURES,
} from './vocab'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function fail(path: string, message: string): string {
  return `${path}: ${message}`
}

function expectOneOf<T extends string>(path: string, value: unknown, allowed: readonly T[]): string[] {
  if (!isString(value) || !allowed.includes(value as T)) {
    return [fail(path, `expected one of ${allowed.join(', ')}`)]
  }
  return []
}

function expectStringArray(path: string, value: unknown, allowed?: readonly string[]): string[] {
  if (!Array.isArray(value) || !value.every(isString)) {
    return [fail(path, 'expected string[]')]
  }
  if (!allowed) return []
  return value.flatMap((item, i) =>
    allowed.includes(item) ? [] : [fail(`${path}[${i}]`, `unknown id "${item}"`)],
  )
}

/**
 * Structural check so a JSON file cannot invent engines the preview/export
 * compilers do not know how to run.
 */
export function validateManifest(raw: unknown): { ok: true; manifest: TemplateManifest } | { ok: false; errors: string[] } {
  if (!isRecord(raw)) {
    return { ok: false, errors: [fail('$', 'expected an object')] }
  }

  const errors: string[] = []

  if (raw.schemaVersion !== TEMPLATE_MANIFEST_SCHEMA_VERSION) {
    errors.push(fail('schemaVersion', `expected ${TEMPLATE_MANIFEST_SCHEMA_VERSION}`))
  }
  if (!isString(raw.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.id)) {
    errors.push(fail('id', 'expected a lowercase slug'))
  }
  for (const key of ['name', 'description', 'previewGradient', 'accentColor', 'servicesLabel'] as const) {
    if (!isString(raw[key]) || !raw[key].trim()) {
      errors.push(fail(key, 'expected a non-empty string'))
    }
  }
  errors.push(...expectOneOf('category', raw.category, TEMPLATE_CATEGORIES))
  if (typeof raw.sortOrder !== 'number' || !Number.isFinite(raw.sortOrder)) {
    errors.push(fail('sortOrder', 'expected a number'))
  }

  if (!Array.isArray(raw.features) || raw.features.length === 0) {
    errors.push(fail('features', 'expected a non-empty array'))
  } else {
    raw.features.forEach((feature, i) => {
      errors.push(...expectOneOf(`features[${i}]`, feature, TEMPLATE_FEATURES))
    })
  }

  if (Array.isArray(raw.homeSections)) {
    raw.homeSections = raw.homeSections.filter((item) => item !== 'cookie')
  }
  if (isRecord(raw.defaults)) {
    if (isRecord(raw.defaults.sectionVisibility)) {
      delete raw.defaults.sectionVisibility.terms
      delete raw.defaults.sectionVisibility.cookieBanner
    }
    delete raw.defaults.termsSectionTitle
    delete raw.defaults.termsContent
    delete raw.defaults.cookieBannerText
    delete raw.defaults.seoEnabled
    delete raw.defaults.seoTitle
    delete raw.defaults.seoDescription
    delete raw.defaults.seoKeywords
    delete raw.defaults.seoSiteUrl
    if (typeof raw.defaults.logo !== 'string') raw.defaults.logo = ''
    if (typeof raw.defaults.logoShowName !== 'boolean') raw.defaults.logoShowName = true
    raw.defaults.logoSize = resolveLogoSize(raw.defaults.logoSize)
    if (typeof raw.defaults.brandPrimary !== 'string') raw.defaults.brandPrimary = ''
    if (typeof raw.defaults.brandSecondary !== 'string') raw.defaults.brandSecondary = ''
    if (typeof raw.defaults.brandAccent !== 'string') raw.defaults.brandAccent = ''
    if (typeof raw.defaults.fontHeading !== 'string') raw.defaults.fontHeading = ''
    if (typeof raw.defaults.fontBody !== 'string') raw.defaults.fontBody = ''
  }

  errors.push(...expectStringArray('homeSections', raw.homeSections, HOME_SECTION_IDS))
  errors.push(...expectStringArray('sectionOrder', raw.sectionOrder, SECTION_IDS))
  errors.push(...expectOneOf('navShell', raw.navShell, NAV_SHELL_IDS))

  if (!isRecord(raw.theme)) {
    errors.push(fail('theme', 'expected an object'))
  } else {
    for (const key of THEME_KEYS) {
      if (!isString(raw.theme[key])) {
        errors.push(fail(`theme.${key}`, 'expected a string'))
      }
    }
  }

  if (!Array.isArray(raw.colorSchemes) || raw.colorSchemes.length === 0) {
    errors.push(fail('colorSchemes', 'expected a non-empty array'))
  } else {
    raw.colorSchemes.forEach((scheme, i) => {
      if (!isRecord(scheme) || !isString(scheme.id) || !isString(scheme.name)) {
        errors.push(fail(`colorSchemes[${i}]`, 'expected { id, name, swatches, overrides }'))
      }
    })
  }

  if (!isRecord(raw.sectionVariants)) {
    errors.push(fail('sectionVariants', 'expected an object'))
  } else {
    errors.push(...expectOneOf('sectionVariants.faq', raw.sectionVariants.faq, FAQ_LAYOUT_IDS))
    errors.push(...expectOneOf('sectionVariants.explore', raw.sectionVariants.explore, EXPLORE_LAYOUT_IDS))
    errors.push(...expectOneOf('sectionVariants.contactShell', raw.sectionVariants.contactShell, CONTACT_SHELL_IDS))
    errors.push(...expectOneOf('sectionVariants.contactForm', raw.sectionVariants.contactForm, CONTACT_FORM_STYLE_IDS))
  }

  if (!isRecord(raw.pageLayouts)) {
    errors.push(fail('pageLayouts', 'expected an object'))
  } else {
    errors.push(...expectOneOf('pageLayouts.blog', raw.pageLayouts.blog, BLOG_LIST_LAYOUTS))
    errors.push(...expectOneOf('pageLayouts.blogPost', raw.pageLayouts.blogPost, BLOG_POST_LAYOUTS))
    errors.push(...expectOneOf('pageLayouts.news', raw.pageLayouts.news, NEWS_LIST_LAYOUTS))
    errors.push(...expectOneOf('pageLayouts.newsPost', raw.pageLayouts.newsPost, NEWS_POST_LAYOUTS))
    errors.push(...expectOneOf('pageLayouts.gallery', raw.pageLayouts.gallery, GALLERY_LAYOUTS))
    errors.push(...expectOneOf('pageLayouts.portfolio', raw.pageLayouts.portfolio, PORTFOLIO_LAYOUTS))
  }

  if (!isRecord(raw.hero)) {
    errors.push(fail('hero', 'expected an object'))
  } else {
    if (typeof raw.hero.overlay !== 'boolean') errors.push(fail('hero.overlay', 'expected a boolean'))
    if (!isString(raw.hero.overlayGradient)) errors.push(fail('hero.overlayGradient', 'expected a string'))
    if (typeof raw.hero.splitColumns !== 'boolean') errors.push(fail('hero.splitColumns', 'expected a boolean'))
    errors.push(...expectOneOf('hero.badge', raw.hero.badge, HERO_BADGE_MODES))
  }

  if (!isRecord(raw.defaults) || !isString(raw.defaults.businessName)) {
    errors.push(fail('defaults', 'expected SiteContent with businessName'))
  }
  if (!isRecord(raw.pages)) {
    errors.push(fail('pages', 'expected page visibility flags'))
  }
  if (raw.editorPages !== undefined) {
    errors.push(...expectStringArray('editorPages', raw.editorPages, PAGE_VISIBILITY_KEYS))
  }
  if (raw.editorSections !== undefined) {
    errors.push(...expectStringArray('editorSections', raw.editorSections, SECTION_VISIBILITY_KEYS))
  }
  if (!isRecord(raw.showcase)) {
    errors.push(fail('showcase', 'expected showcase config'))
  }
  if (!Array.isArray(raw.defaultShowcase)) {
    errors.push(fail('defaultShowcase', 'expected an array'))
  }
  if (!Array.isArray(raw.contactFields) || raw.contactFields.length === 0) {
    errors.push(fail('contactFields', 'expected a non-empty array'))
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, manifest: raw as unknown as TemplateManifest }
}
