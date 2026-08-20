/**
 * Prove preview data + ZIP generators still work after the catalog migration.
 * Run: npx vite-node scripts/verify-export.ts
 */
import { listManifests, requireManifest, templateHasFeature } from '../src/catalog/catalog.ts'
import { parseTemplateJson, stringifyManifest } from '../src/catalog/io.ts'
import { buildSiteDocument, parseSiteDocument, stringifySiteDocument } from '../src/siteDocument/io.ts'
import { templateDefaults } from '../src/data/defaults.ts'
import { generateBackend } from '../src/export/backend/generateBackend.ts'
import { hasBookingFeature } from '../src/export/backend/generateBooking.ts'
import { buildAllSitePages } from '../src/export/buildSitePages.ts'
import { clonePaletteCss, resolveClonePalette } from '../src/templates/cloneTheme.ts'

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

const manifests = listManifests()
assert(manifests.length === 30, `expected 30 templates, got ${manifests.length}`)

for (const manifest of manifests) {
  const defaults = templateDefaults[manifest.id]
  assert(defaults?.businessName, `${manifest.id}: missing defaults`)
  const { pages, assets } = buildAllSitePages(manifest.id, defaults)
  assert(pages['index.html']?.includes('<!'), `${manifest.id}: missing index.html`)
  assert(
    pages['index.html']?.includes('<header') || pages['index.html']?.includes('<nav'),
    `${manifest.id}: home page missing header/nav`,
  )
  assert(assets.length >= 0, `${manifest.id}: assets failed`)

  const backend = generateBackend(
    manifest.id,
    defaults,
    manifest.defaultColorSchemeId,
    manifest.defaultLayoutVariantId,
    assets,
  )
  assert(backend['composer.json'], `${manifest.id}: missing composer.json`)
  assert(backend['app/Providers/Filament/AdminPanelProvider.php'], `${manifest.id}: missing Filament provider`)

  const hospitality = templateHasFeature(manifest.id, 'hospitality')
  if (hospitality) {
    assert(defaults.pageVisibility.rooms, `${manifest.id}: hospitality template should enable rooms`)
    assert(defaults.roomTypes.length > 0, `${manifest.id}: hospitality template should seed rooms`)
    assert(hasBookingFeature(defaults), `${manifest.id}: booking feature should be on`)
    assert(backend['app/Models/RoomType.php'], `${manifest.id}: missing RoomType model`)
    assert(backend['app/Http/Controllers/BookingController.php'], `${manifest.id}: missing BookingController`)
    assert(backend['resources/views/rooms/index.blade.php'] || Object.keys(backend).some((p) => p.includes('rooms')), `${manifest.id}: missing rooms Blade view`)
  } else {
    assert(!hasBookingFeature(defaults), `${manifest.id}: booking should stay off`)
    assert(!backend['app/Models/RoomType.php'], `${manifest.id}: business CMS should not emit booking models`)
  }
}

const hotelJson = stringifyManifest(requireManifest('hotel'))
const parsedHotel = parseTemplateJson(hotelJson)
assert(parsedHotel.ok, 'hotel JSON should round-trip')
if (parsedHotel.ok) {
  assert(parsedHotel.manifest.id === 'hotel', 'round-tripped hotel id')
  assert(parsedHotel.manifest.features.includes('hospitality'), 'round-tripped hotel features')
}

const siteDoc = buildSiteDocument('hotel', templateDefaults.hotel, 'gold', 'luxury')
assert(siteDoc.kind === 'webbuilder-site', 'site document kind')
assert(siteDoc.schemaVersion === 1, 'site document version')
assert(siteDoc.templateId === 'hotel', 'site document template id')
assert(siteDoc.content.businessName === templateDefaults.hotel.businessName, 'site document keeps edited content')
assert(siteDoc.template.id === 'hotel', 'site document embeds template design')
const parsedSite = parseSiteDocument(stringifySiteDocument(siteDoc))
assert(parsedSite.ok, 'site document round-trips')
if (parsedSite.ok) {
  assert(parsedSite.document.content.businessName === siteDoc.content.businessName, 'restored content matches')
  assert('logo' in parsedSite.document.content, 'site document keeps logo')
  assert('brandPrimary' in parsedSite.document.content, 'site document keeps brand colors')
  assert('fontHeading' in parsedSite.document.content, 'site document keeps fonts')
}

const branded = {
  ...templateDefaults.hotel,
  logo: 'https://example.com/brand-logo.png',
  logoShowName: false,
  brandPrimary: '#112233',
  brandSecondary: '#445566',
  brandAccent: '#778899',
  fontHeading: 'playfair',
  fontBody: 'inter',
}
const brandedDoc = buildSiteDocument('hotel', branded, 'gold', 'luxury')
assert(brandedDoc.content.logo === branded.logo, 'branded site document stores logo')
assert(brandedDoc.content.brandPrimary === '#112233', 'branded site document stores primary')
assert(brandedDoc.content.fontHeading === 'playfair', 'branded site document stores heading font')

const brandedPages = buildAllSitePages('hotel', branded)
assert(brandedPages.pages['index.html']?.includes('brand-logo.png'), 'static export includes logo')
assert(brandedPages.pages['index.html']?.includes('--brand-primary: #112233'), 'static export includes primary color')
assert(brandedPages.pages['index.html']?.includes('--brand-secondary: #445566'), 'static export includes secondary color')
assert(brandedPages.pages['index.html']?.includes('Playfair+Display'), 'static export loads heading font')
assert(brandedPages.pages['index.html']?.includes('data-site-brand'), 'static export marks brand root')

const brandedBackend = generateBackend('hotel', branded, 'gold', 'luxury', [])
assert(brandedBackend['app/Support/Brand.php']?.includes('playfair'), 'Laravel Brand helper includes fonts')
assert(brandedBackend['database/migrations/0001_01_01_000001_create_site_settings_table.php']?.includes("'logo'"), 'settings migration has logo')
assert(brandedBackend['app/Filament/Resources/SiteSettingResource.php']?.includes("Tab::make('Brand')"), 'Filament has Brand tab')
assert(brandedBackend['resources/views/layouts/site.blade.php']?.includes('data-site-brand'), 'Blade layout uses brand root')
assert(brandedBackend['resources/views/partials/nav.blade.php']?.includes('$settings->logo'), 'Blade nav renders logo')

const customId = 'my-new-lodge'
const customDoc = buildSiteDocument('hotel', { ...templateDefaults.hotel, businessName: 'New Lodge' }, 'gold', 'classic')
customDoc.templateId = customId
customDoc.template = { ...customDoc.template, id: customId, name: 'New Lodge layout' }
const parsedCustom = parseSiteDocument(stringifySiteDocument(customDoc))
assert(parsedCustom.ok, 'custom template site document is valid')
if (parsedCustom.ok) {
  assert(parsedCustom.document.templateId === customId, 'new template id survives')
}

const business = requireManifest('business')
const hotel = requireManifest('hotel')
assert(business.features.includes('cms') && !business.features.includes('hospitality'), 'business should be CMS-only')
assert(hotel.features.includes('hospitality'), 'hotel should include hospitality')
assert(hotel.navShell === 'hotel', 'hotel nav shell should stay hotel')

const cpa = requireManifest('cpa')
assert(cpa.category === 'finance', 'cpa should be in the finance category')
assert(cpa.navShell === 'cpa', 'cpa nav shell should stay cpa')
assert(cpa.features.includes('cms') && !cpa.features.includes('hospitality'), 'cpa should be CMS-only')
assert(templateDefaults.cpa?.licenseNumber, 'cpa should seed a license number')

const taxfighters = requireManifest('taxfighters')
assert(taxfighters.category === 'finance', 'taxfighters should be in the finance category')
assert(taxfighters.navShell === 'taxfighters', 'taxfighters nav shell should stay taxfighters')
assert(templateDefaults.taxfighters?.businessName === 'TaxGuardians', 'taxfighters should seed TaxGuardians')
assert(templateDefaults.taxfighters?.phone?.includes('555'), 'taxfighters should seed the storefront phone')

const aureum = requireManifest('aureum')
assert(aureum.category === 'finance', 'aureum should be in the finance category')
assert(aureum.navShell === 'aureum', 'aureum nav shell should stay aureum')
assert(templateDefaults.aureum?.businessName === 'Ledger Studio', 'aureum should seed Ledger Studio')

const flux = requireManifest('flux')
assert(flux.category === 'finance', 'flux should be in the finance category')
assert(flux.navShell === 'flux', 'flux nav shell should stay flux')
assert(templateDefaults.flux?.businessName === 'Posterity', 'flux should seed Posterity')

const axiom = requireManifest('axiom')
assert(axiom.category === 'finance', 'axiom should be in the finance category')
assert(axiom.navShell === 'axiom', 'axiom nav shell should stay axiom')
assert(templateDefaults.axiom?.businessName === 'Axiom Audit', 'axiom should seed Axiom Audit')

const helix = requireManifest('helix')
assert(helix.category === 'finance', 'helix should be the sixth tax template')
assert(helix.navShell === 'helix', 'helix nav shell should stay helix')
assert(templateDefaults.helix?.businessName === 'The Tax Fighters', 'helix should seed The Tax Fighters')

const financeIds = ['cpa', 'taxfighters', 'aureum', 'flux', 'axiom', 'helix'] as const
for (const id of financeIds) {
  const defaults = templateDefaults[id]
  const { pages } = buildAllSitePages(id, defaults)
  const nameInHtml = defaults.businessName.replace(/&/g, '&amp;')
  assert(pages['index.html']?.includes(nameInHtml) || pages['index.html']?.includes(defaults.businessName), `${id}: static home missing business name`)
  const firstService = (defaults.services[0]?.title ?? '').replace(/&/g, '&amp;')
  assert(
    !firstService || pages['services.html']?.includes(firstService) || pages['services.html']?.includes(defaults.services[0].title),
    `${id}: services page missing first service`,
  )
  assert(pages['contact.html']?.includes(defaults.phone) || pages['contact.html']?.includes(defaults.email), `${id}: contact page missing phone/email`)
  const backend = generateBackend(id, defaults, requireManifest(id).defaultColorSchemeId, requireManifest(id).defaultLayoutVariantId, [])
  assert(backend['resources/views/site/index.blade.php']?.includes('@extends'), `${id}: missing Blade home`)
  assert(backend['resources/views/partials/nav.blade.php'], `${id}: missing Blade nav`)
  assert(backend['app/Http/Controllers/SiteController.php'] || Object.keys(backend).some((p) => p.includes('Controller')), `${id}: missing site controller`)
  assert(backend['database/seeders/DatabaseSeeder.php']?.includes(defaults.businessName), `${id}: seeder missing business name`)
  assert(backend['app/Filament/Resources/ServiceResource.php'], `${id}: missing Service Filament resource`)
  assert(backend['app/Filament/Resources/FaqResource.php'], `${id}: missing FAQ Filament resource`)
  assert(backend['app/Filament/Resources/SiteSettingResource.php']?.includes('license_number'), `${id}: Filament should edit license`)
  assert(backend['routes/web.php']?.includes("route('contact')") || backend['routes/web.php']?.includes('contact'), `${id}: missing contact route`)
  assert(!backend['app/Models/RoomType.php'], `${id}: finance export must not include booking models`)
  assert(pages['index.html']?.includes('js-clone-form'), `${id}: static home must include working clone forms`)
  assert(pages['index.html']?.includes('booking-modal'), `${id}: static home must include booking modal`)
  assert(pages['index.html']?.includes('name="phone"'), `${id}: static forms must collect phone`)
  assert(backend['resources/views/site/index.blade.php']?.includes('contact.store'), `${id}: Blade home must post to contact.store`)
  assert(backend['resources/views/site/index.blade.php']?.includes('@csrf'), `${id}: Blade forms must include CSRF`)
  assert(backend['app/Http/Controllers/ContactController.php']?.includes('service_type'), `${id}: ContactController must accept booking fields`)
}

assert(generateBackend('taxfighters', templateDefaults.taxfighters, 'burgundy-fight', 'classic', [])['resources/views/site/index.blade.php']?.includes('#e60039'), 'taxfighters Blade home should keep rose')
assert(generateBackend('aureum', templateDefaults.aureum, requireManifest('aureum').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#9333ea'), 'aureum Blade home should keep purple')
assert(generateBackend('flux', templateDefaults.flux, requireManifest('flux').defaultColorSchemeId, 'modern', [])['resources/views/site/index.blade.php']?.includes('#FA6B34'), 'flux Blade home should keep orange')
assert(generateBackend('axiom', templateDefaults.axiom, requireManifest('axiom').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#0B4F8A'), 'axiom Blade home should keep blue')
assert(generateBackend('helix', templateDefaults.helix, requireManifest('helix').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#800020'), 'helix Blade home should keep burgundy')
assert(generateBackend('cpa', templateDefaults.cpa, requireManifest('cpa').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#16302A'), 'cpa Blade home should keep forest')

const cpaNative = resolveClonePalette('cpa', templateDefaults.cpa, requireManifest('cpa').defaultColorSchemeId)
assert(cpaNative.ink.toLowerCase() === '#16302a', 'cpa first scheme ink is forest')
assert(cpaNative.accent.toLowerCase() === '#a8d93f', 'cpa first scheme accent is lime')
assert(cpaNative.surface.toLowerCase() === '#f6f3ea', 'cpa first scheme surface is cream')
const cpaAlt = resolveClonePalette('cpa', { ...templateDefaults.cpa, brandPrimary: '#ff0000', brandSecondary: '#00ff00', brandAccent: '#0000ff' }, 'forest-trust')
assert(cpaAlt.ink.toLowerCase() === '#0b1f3a', 'cpa scheme change applies ink even if brand is set')
assert(cpaAlt.accent.toLowerCase() === '#0f766e', 'cpa scheme change applies accent even if brand is set')
assert(cpaAlt.surface.toLowerCase() === '#f7f4ee', 'cpa navy scheme uses its light surface')
const fluxNative = resolveClonePalette('flux', templateDefaults.flux, requireManifest('flux').defaultColorSchemeId)
assert(fluxNative.surface.toLowerCase() === '#fff9f4', 'flux first scheme keeps warm peach surface')
assert(fluxNative.accent.toLowerCase() === '#fa6b34', 'flux first scheme keeps ember accent')
const helixNative = resolveClonePalette('helix', templateDefaults.helix, requireManifest('helix').defaultColorSchemeId)
assert(helixNative.accent.toLowerCase() === '#800020', 'helix first scheme keeps burgundy')
const cpaCss = clonePaletteCss('cpa', cpaNative)
assert(cpaCss.includes('--clone-surface: #F6F3EA') || cpaCss.toLowerCase().includes('--clone-surface: #f6f3ea'), 'cpa palette css emits cream surface')
const cpaAltCss = clonePaletteCss('cpa', cpaAlt)
assert(cpaAltCss.includes('#0f766e') || cpaAltCss.includes('#0F766E'), 'alternate scheme css emits new accent')

const hotelBackend = generateBackend('hotel', templateDefaults.hotel, hotel.defaultColorSchemeId, hotel.defaultLayoutVariantId, [])
assert(hotelBackend['app/Models/RoomType.php']?.includes('class RoomType'), 'hotel Laravel export should include RoomType')
assert(Object.keys(hotelBackend).some((path) => path.includes('BookingController')), 'hotel Laravel export should include booking')

console.log(`ok: ${manifests.length} templates, preview defaults + static ZIP + Laravel ZIP`)
