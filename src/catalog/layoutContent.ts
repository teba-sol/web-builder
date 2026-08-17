import { defaultSectionVisibility, createShowcaseItems } from '../data/sectionConfig'
import { emptyRoomType } from '../data/hospitality'
import { mergeRichContent } from '../data/richDefaults'
import type { SiteContent } from '../types'
import type { TemplateManifest } from './types'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=60'

/** Structural content only — no marketing copy. Used when someone picks a template to build a site. */
export function layoutContent(manifest: TemplateManifest): SiteContent {
  const hospitality = manifest.features.includes('hospitality')
  return mergeRichContent({
    businessName: '',
    tagline: '',
    heroSubtext: '',
    heroImage: '',
    logo: '',
    logoShowName: true,
    brandPrimary: '',
    brandSecondary: '',
    brandAccent: '',
    fontHeading: '',
    fontBody: '',
    aboutTitle: 'About Us',
    about: '',
    aboutImage: '',
    missionStatement: '',
    pageVisibility: { ...manifest.pages },
    sectionVisibility: { ...defaultSectionVisibility, ...manifest.defaults.sectionVisibility },
    stats: [
      { value: '', label: '' },
      { value: '', label: '' },
      { value: '', label: '' },
    ],
    servicesSectionTitle: manifest.servicesLabel || 'Services',
    servicesSectionSubtitle: '',
    services: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    steps: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    showcaseSectionTitle: manifest.showcase.sectionTitle,
    showcaseSectionSubtitle: '',
    showcaseItems: createShowcaseItems([]),
    galleryImages: ['', '', ''],
    testimonials: [{ quote: '', author: '', role: '' }],
    faqs: [{ question: '', answer: '' }],
    team: [],
    blogPosts: [],
    newsPosts: [],
    pricing: [],
    roomTypes: hospitality ? [emptyRoomType()] : [],
    ctaBannerTitle: '',
    ctaBannerText: '',
    ctaText: '',
    ctaLink: 'contact',
  })
}

/** Filler so the studio canvas shows the layout. Never saved as the template. */
export function studioPreviewContent(manifest: TemplateManifest): SiteContent {
  const hospitality = manifest.features.includes('hospitality')
  const base = layoutContent(manifest)
  return {
    ...base,
    businessName: manifest.name || 'Your business',
    tagline: 'Your headline',
    heroSubtext: 'Copy and media are added in the website builder, not in the template.',
    heroImage: PLACEHOLDER_IMAGE,
    aboutTitle: 'About',
    about: 'This block is layout only. The real story is written when you build the site.',
    aboutImage: PLACEHOLDER_IMAGE,
    missionStatement: '',
    stats: [
      { value: '00', label: 'Stat' },
      { value: '00', label: 'Stat' },
      { value: '00', label: 'Stat' },
    ],
    services: [
      { title: 'Service', description: 'Describe this later in the website builder.' },
      { title: 'Service', description: 'Describe this later in the website builder.' },
      { title: 'Service', description: 'Describe this later in the website builder.' },
    ],
    steps: [
      { title: 'Step', description: 'Process step' },
      { title: 'Step', description: 'Process step' },
      { title: 'Step', description: 'Process step' },
    ],
    showcaseItems: createShowcaseItems([
      { title: 'Item', description: 'Portfolio or listing', image: PLACEHOLDER_IMAGE },
      { title: 'Item', description: 'Portfolio or listing', image: PLACEHOLDER_IMAGE },
      { title: 'Item', description: 'Portfolio or listing', image: PLACEHOLDER_IMAGE },
    ]),
    testimonials: [{ quote: 'Customer quote', author: 'Name', role: 'Role' }],
    faqs: [{ question: 'Question?', answer: 'Answer is added in the website builder.' }],
    roomTypes: hospitality
      ? [
          {
            ...emptyRoomType(),
            name: 'Room type',
            slug: 'room-type',
            shortDescription: 'Added in the website builder',
            description: 'Room details are content, not template.',
            image: PLACEHOLDER_IMAGE,
            isActive: true,
          },
        ]
      : [],
    ctaText: 'Call to action',
    galleryImages: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  }
}

/** Drop marketing copy so the document is design + layout only. */
export function asDesignManifest(manifest: TemplateManifest): TemplateManifest {
  const defaults = layoutContent(manifest)
  return {
    ...manifest,
    pages: { ...manifest.pages },
    blocks: manifest.blocks ? structuredClone(manifest.blocks) : {},
    defaultShowcase: [],
    defaults,
  }
}
