import type { ReactNode } from 'react'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import { getTemplateMeta } from '../data/defaults'
import { LIST_MAX_COUNT, LIST_MIN_COUNT, listAddLabels } from '../data/listDefaults'
import { getShowcaseConfig } from '../data/sectionConfig'
import { useWebsite } from '../context/WebsiteContext'
import type { ContactFieldKey } from '../types'
import { slugify } from '../utils/slugify'
import type { ContentListKey } from '../data/listDefaults'
import { getDefaultLayoutVariantId } from '../data/layoutVariants'
import {
  getEditablePageMetas,
  getEditableSectionMetas,
  isEditablePage,
  isEditableSection,
} from '../data/editorProfile'
import { getPageNavLabel } from '../data/pageConfig'
import { getMapEmbedUrl, isShortMapLink } from '../utils/mapEmbed'
import { optimizeSiteSeo } from '../utils/seoOptimizer'
import { BrandIdentityForm } from './BrandIdentityForm'
import { ColorSchemePicker } from './ColorSchemePicker'
import { ImagePicker } from './ImagePicker'
import { LayoutVariantPicker } from './LayoutVariantPicker'
import { PageVisibilityPicker } from './PageVisibilityPicker'
import { SectionVisibilityPicker } from './SectionVisibilityPicker'

export function ContentForm() {
  const {
    templateId, content, colorSchemeId, layoutVariantId, setColorScheme, setLayoutVariant,
    updateContent, updateListItem, addListItem, removeListItem,
    toggleSectionVisibility,
    togglePageVisibility,
  } = useWebsite()
  const template = templateId ? getTemplateMeta(templateId) : null
  const showcaseCfg = templateId ? getShowcaseConfig(templateId) : null
  const editablePages = getEditablePageMetas(templateId).map((meta) => ({
    ...meta,
    label: templateId ? getPageNavLabel(templateId, meta.key) : meta.label,
  }))
  const editableSections = getEditableSectionMetas(templateId)
  const pageOn = (page: keyof typeof content.pageVisibility) =>
    isEditablePage(templateId, page) && content.pageVisibility[page]
  const sectionOn = (section: Parameters<typeof isEditableSection>[1]) =>
    isEditableSection(templateId, section) && content.sectionVisibility[section]

  const setContact = (key: ContactFieldKey, value: string) => {
    updateContent({ [key]: value })
  }

  const listControls = (list: ContentListKey, addLabel?: string) => ({
    onAdd: () => addListItem(list),
    addLabel: addLabel ?? listAddLabels[list],
    canAdd: content[list].length < LIST_MAX_COUNT,
    canRemove: () => content[list].length > LIST_MIN_COUNT[list],
    onRemove: (index: number) => removeListItem(list, index),
  })

  const showcaseAddLabel = showcaseCfg ? `Add ${showcaseCfg.itemLabel}` : 'Add Item'
  const servicesAddLabel = template?.servicesLabel
    ? `Add ${template.servicesLabel.replace(/s$/i, '')}`
    : 'Add Service'

  return (
    <div className="space-y-8">
      <BrandIdentityForm content={content} onChange={updateContent} />

      {templateId && (
        <>
          <LayoutVariantPicker
            templateId={templateId}
            activeVariantId={layoutVariantId || getDefaultLayoutVariantId(templateId)}
            onChange={setLayoutVariant}
          />
          <ColorSchemePicker
            templateId={templateId}
            activeSchemeId={colorSchemeId || getDefaultColorSchemeId(templateId)}
            onChange={setColorScheme}
          />
        </>
      )}

      <PageVisibilityPicker
        visibility={content.pageVisibility}
        onToggle={togglePageVisibility}
        pages={editablePages}
      />

      <SectionVisibilityPicker
        visibility={content.sectionVisibility}
        onToggle={toggleSectionVisibility}
        sections={editableSections}
      />

      <FormSection title="SEO">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <input
            type="checkbox"
            checked={content.seoEnabled}
            onChange={(e) => {
              if (e.target.checked) {
                updateContent(optimizeSiteSeo(content, templateId ?? undefined))
              } else {
                updateContent({ seoEnabled: false })
              }
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            <span className="block text-sm font-semibold text-emerald-900">Optimize SEO</span>
            <span className="mt-1 block text-xs text-emerald-800/80">
              Auto-generates meta title, description, keywords, slugs, sitemap, robots.txt, Open Graph tags, and structured data on export.
            </span>
          </span>
        </label>
        {content.seoEnabled && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Field label="Meta Title" value={content.seoTitle} onChange={(v) => updateContent({ seoTitle: v })} placeholder="Business Name | Tagline" />
            <Field label="Meta Description" value={content.seoDescription} onChange={(v) => updateContent({ seoDescription: v })} multiline rows={3} placeholder="155-character summary for search results" />
            <Field label="Keywords" value={content.seoKeywords} onChange={(v) => updateContent({ seoKeywords: v })} placeholder="service, location, industry" />
            <Field label="Live Site URL (for canonical links & sitemap)" value={content.seoSiteUrl} onChange={(v) => updateContent({ seoSiteUrl: v })} placeholder="https://www.yourbusiness.com" />
            <p className="text-xs text-slate-500">Tip: add your real domain before exporting so canonical URLs and sitemap entries point to production.</p>
          </div>
        )}
      </FormSection>

      <FormSection title="Hero">
        <Field label="Business Name" value={content.businessName} onChange={(v) => updateContent({ businessName: v })} />
        <Field label="Headline / Tagline" value={content.tagline} onChange={(v) => updateContent({ tagline: v })} />
        <Field label="Hero Subtext" value={content.heroSubtext} onChange={(v) => updateContent({ heroSubtext: v })} multiline />
        <ImagePicker label="Hero Image" value={content.heroImage} onChange={(v) => updateContent({ heroImage: v })} />
        <Field label="Primary button text" value={content.ctaText} onChange={(v) => updateContent({ ctaText: v })} />
        <Field label="Primary button link" value={content.ctaLink} onChange={(v) => updateContent({ ctaLink: v })} placeholder="contact" />
      </FormSection>

      {pageOn('about') && (
      <FormSection title="About">
        <Field label="Section Title" value={content.aboutTitle} onChange={(v) => updateContent({ aboutTitle: v })} />
        <Field label="About Text" value={content.about} onChange={(v) => updateContent({ about: v })} multiline rows={5} />
        <ImagePicker label="About Image" value={content.aboutImage} onChange={(v) => updateContent({ aboutImage: v })} />
        <Field label="Mission Statement" value={content.missionStatement} onChange={(v) => updateContent({ missionStatement: v })} multiline />
      </FormSection>
      )}

      {sectionOn('stats') && (
      <FormSection title="Stats" {...listControls('stats')}>
        {content.stats.map((stat, i) => (
          <ItemCard
            key={i}
            label={`Stat ${i + 1}`}
            canRemove={listControls('stats').canRemove()}
            onRemove={() => listControls('stats').onRemove(i)}
          >
            <Field label="Value" value={stat.value} onChange={(v) => updateListItem('stats', i, 'value', v)} placeholder="500+" />
            <Field label="Label" value={stat.label} onChange={(v) => updateListItem('stats', i, 'label', v)} placeholder="Happy Clients" />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {pageOn('services') && (
      <FormSection title={template?.servicesLabel ?? 'Services'} {...listControls('services', servicesAddLabel)}>
        <Field label="Section Title" value={content.servicesSectionTitle} onChange={(v) => updateContent({ servicesSectionTitle: v })} />
        <Field label="Section Subtitle" value={content.servicesSectionSubtitle} onChange={(v) => updateContent({ servicesSectionSubtitle: v })} />
        {content.services.map((s, i) => (
          <ItemCard
            key={i}
            label={`${template?.servicesLabel?.replace(/s$/i, '') ?? 'Service'} ${i + 1}`}
            canRemove={listControls('services').canRemove()}
            onRemove={() => listControls('services').onRemove(i)}
          >
            <Field label="Title" value={s.title} onChange={(v) => updateListItem('services', i, 'title', v)} />
            <Field label="Description" value={s.description} onChange={(v) => updateListItem('services', i, 'description', v)} multiline />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {pageOn('rooms') && (
        <FormSection title="Rooms & Booking" {...listControls('roomTypes', 'Add Room Type')}>
          <p className="mb-3 text-xs text-slate-500">
            Define room types and optional subtypes (set Parent slug). Unit count seeds inventory in the exported admin. Guests can only book available units.
          </p>
          <Field label="Rooms Section Title" value={content.roomsSectionTitle} onChange={(v) => updateContent({ roomsSectionTitle: v })} />
          <Field label="Rooms Section Subtitle" value={content.roomsSectionSubtitle} onChange={(v) => updateContent({ roomsSectionSubtitle: v })} />
          <Field label="Booking Page Title" value={content.bookingSectionTitle} onChange={(v) => updateContent({ bookingSectionTitle: v })} />
          <Field label="Booking Page Subtitle" value={content.bookingSectionSubtitle} onChange={(v) => updateContent({ bookingSectionSubtitle: v })} />
          {content.roomTypes.map((room, i) => (
            <ItemCard
              key={i}
              label={room.name ? room.name : `Room type ${i + 1}`}
              canRemove={listControls('roomTypes').canRemove()}
              onRemove={() => listControls('roomTypes').onRemove(i)}
            >
              <Field
                label="Name"
                value={room.name}
                onChange={(v) => {
                  const nextSlug = !room.slug || room.slug === slugify(room.name) ? slugify(v) : room.slug
                  const rooms = [...content.roomTypes]
                  rooms[i] = { ...rooms[i], name: v, slug: nextSlug }
                  updateContent({ roomTypes: rooms })
                }}
              />
              <Field label="URL Slug" value={room.slug} onChange={(v) => updateListItem('roomTypes', i, 'slug', slugify(v))} placeholder="deluxe-suite" />
              <Field
                label="Parent slug (subtype of…)"
                value={room.parentSlug}
                onChange={(v) => updateListItem('roomTypes', i, 'parentSlug', slugify(v))}
                placeholder="leave empty for top-level type"
              />
              <Field label="Short description" value={room.shortDescription} onChange={(v) => updateListItem('roomTypes', i, 'shortDescription', v)} />
              <Field label="Full description" value={room.description} onChange={(v) => updateListItem('roomTypes', i, 'description', v)} multiline rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nightly price" value={room.basePrice} onChange={(v) => updateListItem('roomTypes', i, 'basePrice', v)} placeholder="250" />
                <Field label="Currency" value={room.currency} onChange={(v) => updateListItem('roomTypes', i, 'currency', v)} placeholder="USD" />
                <Field label="Max adults" value={room.maxAdults} onChange={(v) => updateListItem('roomTypes', i, 'maxAdults', v)} />
                <Field label="Max children" value={room.maxChildren} onChange={(v) => updateListItem('roomTypes', i, 'maxChildren', v)} />
                <Field label="Max occupancy" value={room.maxOccupancy} onChange={(v) => updateListItem('roomTypes', i, 'maxOccupancy', v)} />
                <Field label="Size (m²)" value={room.sizeSqm} onChange={(v) => updateListItem('roomTypes', i, 'sizeSqm', v)} />
                <Field label="Beds" value={room.bedConfiguration} onChange={(v) => updateListItem('roomTypes', i, 'bedConfiguration', v)} placeholder="1 King" />
                <Field label="Unit count" value={room.unitCount} onChange={(v) => updateListItem('roomTypes', i, 'unitCount', v)} placeholder="4" />
                <Field label="Unit code prefix" value={room.unitPrefix} onChange={(v) => updateListItem('roomTypes', i, 'unitPrefix', v)} placeholder="DLX-" />
              </div>
              <Field label="Amenities (comma-separated)" value={room.amenities} onChange={(v) => updateListItem('roomTypes', i, 'amenities', v)} placeholder="Wi-Fi, Mini bar, Safe" />
              <ImagePicker label="Image" value={room.image} onChange={(v) => updateListItem('roomTypes', i, 'image', v)} />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={room.isActive}
                  onChange={(e) => {
                    const rooms = [...content.roomTypes]
                    rooms[i] = { ...rooms[i], isActive: e.target.checked }
                    updateContent({ roomTypes: rooms })
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Active (bookable on the public site)
              </label>
            </ItemCard>
          ))}
        </FormSection>
      )}

      {showcaseCfg && pageOn('portfolio') && (
        <FormSection title={`Portfolio — ${showcaseCfg.sectionTitle}`} {...listControls('showcaseItems', showcaseAddLabel)}>
          <Field label="Section Title" value={content.showcaseSectionTitle} onChange={(v) => updateContent({ showcaseSectionTitle: v })} />
          <Field label="Section Subtitle" value={content.showcaseSectionSubtitle} onChange={(v) => updateContent({ showcaseSectionSubtitle: v })} />
          {content.showcaseItems.map((item, i) => (
            <ItemCard
              key={i}
              label={`${showcaseCfg.itemLabel} ${i + 1}`}
              canRemove={listControls('showcaseItems').canRemove()}
              onRemove={() => listControls('showcaseItems').onRemove(i)}
            >
              <Field label="Title" value={item.title} onChange={(v) => updateListItem('showcaseItems', i, 'title', v)} />
              <Field label="Description" value={item.description} onChange={(v) => updateListItem('showcaseItems', i, 'description', v)} multiline />
              <ImagePicker label="Image" value={item.image} onChange={(v) => updateListItem('showcaseItems', i, 'image', v)} />
              {showcaseCfg.showPrice && (
                <Field label={showcaseCfg.priceLabel} value={item.price} onChange={(v) => updateListItem('showcaseItems', i, 'price', v)} />
              )}
              {showcaseCfg.showTag && (
                <Field label={showcaseCfg.tagLabel} value={item.tag} onChange={(v) => updateListItem('showcaseItems', i, 'tag', v)} />
              )}
              <Field label="Link" value={item.link} onChange={(v) => updateListItem('showcaseItems', i, 'link', v)} placeholder="contact" />
            </ItemCard>
          ))}
        </FormSection>
      )}

      {sectionOn('steps') && (
      <FormSection title="How It Works" {...listControls('steps')}>
        <Field label="Section Title" value={content.stepsSectionTitle} onChange={(v) => updateContent({ stepsSectionTitle: v })} />
        {content.steps.map((step, i) => (
          <ItemCard
            key={i}
            label={`Step ${i + 1}`}
            canRemove={listControls('steps').canRemove()}
            onRemove={() => listControls('steps').onRemove(i)}
          >
            <Field label="Title" value={step.title} onChange={(v) => updateListItem('steps', i, 'title', v)} />
            <Field label="Description" value={step.description} onChange={(v) => updateListItem('steps', i, 'description', v)} multiline />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {pageOn('gallery') && (
      <FormSection title="Gallery" {...listControls('galleryImages')}>
        <Field label="Section Title" value={content.gallerySectionTitle} onChange={(v) => updateContent({ gallerySectionTitle: v })} />
        {content.galleryImages.map((img, i) => (
          <ItemCard
            key={i}
            label={`Image ${i + 1}`}
            canRemove={listControls('galleryImages').canRemove()}
            onRemove={() => listControls('galleryImages').onRemove(i)}
          >
            <ImagePicker label="Photo" value={img} onChange={(v) => updateListItem('galleryImages', i, '', v)} />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {sectionOn('testimonials') && (
      <FormSection title="Reviews" {...listControls('testimonials', 'Add Review')}>
        <Field label="Section Title" value={content.testimonialsSectionTitle} onChange={(v) => updateContent({ testimonialsSectionTitle: v })} />
        {content.testimonials.map((t, i) => (
          <ItemCard
            key={i}
            label={`Review ${i + 1}`}
            canRemove={listControls('testimonials').canRemove()}
            onRemove={() => listControls('testimonials').onRemove(i)}
          >
            <Field label="Quote" value={t.quote} onChange={(v) => updateListItem('testimonials', i, 'quote', v)} multiline />
            <Field label="Author" value={t.author} onChange={(v) => updateListItem('testimonials', i, 'author', v)} />
            <Field label="Role / Company" value={t.role} onChange={(v) => updateListItem('testimonials', i, 'role', v)} />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {pageOn('blog') && (
        <FormSection title="Blog" {...listControls('blogPosts', 'Add Post')}>
          <Field label="Section Title" value={content.blogSectionTitle} onChange={(v) => updateContent({ blogSectionTitle: v })} />
          <Field label="Section Subtitle" value={content.blogSectionSubtitle} onChange={(v) => updateContent({ blogSectionSubtitle: v })} />
          {content.blogPosts.map((post, i) => (
            <ItemCard
              key={i}
              label={`Post ${i + 1}`}
              canRemove={listControls('blogPosts').canRemove()}
              onRemove={() => listControls('blogPosts').onRemove(i)}
            >
              <Field
                label="Title"
                value={post.title}
                onChange={(v) => {
                  const nextSlug = !post.slug || post.slug === slugify(post.title) ? slugify(v) : post.slug
                  const posts = [...content.blogPosts]
                  posts[i] = { ...posts[i], title: v, slug: nextSlug }
                  updateContent({ blogPosts: posts })
                }}
              />
              <Field label="URL Slug" value={post.slug} onChange={(v) => updateListItem('blogPosts', i, 'slug', slugify(v))} placeholder="my-post-title" />
              <Field label="Excerpt" value={post.excerpt} onChange={(v) => updateListItem('blogPosts', i, 'excerpt', v)} multiline rows={2} />
              <Field label="Full Content" value={post.body} onChange={(v) => updateListItem('blogPosts', i, 'body', v)} multiline rows={6} />
              <ImagePicker label="Cover Image" value={post.image} onChange={(v) => updateListItem('blogPosts', i, 'image', v)} />
              <Field label="Author" value={post.author} onChange={(v) => updateListItem('blogPosts', i, 'author', v)} />
              <Field label="Publish Date" value={post.date} onChange={(v) => updateListItem('blogPosts', i, 'date', v)} placeholder="2026-03-15" />
            </ItemCard>
          ))}
        </FormSection>
      )}

      {pageOn('news') && (
        <FormSection title="News" {...listControls('newsPosts', 'Add News Item')}>
          <Field label="Section Title" value={content.newsSectionTitle} onChange={(v) => updateContent({ newsSectionTitle: v })} />
          <Field label="Section Subtitle" value={content.newsSectionSubtitle} onChange={(v) => updateContent({ newsSectionSubtitle: v })} />
          {content.newsPosts.map((post, i) => (
            <ItemCard
              key={i}
              label={`News ${i + 1}`}
              canRemove={listControls('newsPosts').canRemove()}
              onRemove={() => listControls('newsPosts').onRemove(i)}
            >
              <Field
                label="Title"
                value={post.title}
                onChange={(v) => {
                  const nextSlug = !post.slug || post.slug === slugify(post.title) ? slugify(v) : post.slug
                  const posts = [...content.newsPosts]
                  posts[i] = { ...posts[i], title: v, slug: nextSlug }
                  updateContent({ newsPosts: posts })
                }}
              />
              <Field label="URL Slug" value={post.slug} onChange={(v) => updateListItem('newsPosts', i, 'slug', slugify(v))} />
              <Field label="Excerpt" value={post.excerpt} onChange={(v) => updateListItem('newsPosts', i, 'excerpt', v)} multiline rows={2} />
              <Field label="Full Content" value={post.body} onChange={(v) => updateListItem('newsPosts', i, 'body', v)} multiline rows={6} />
              <ImagePicker label="Cover Image" value={post.image} onChange={(v) => updateListItem('newsPosts', i, 'image', v)} />
              <Field label="Author" value={post.author} onChange={(v) => updateListItem('newsPosts', i, 'author', v)} />
              <Field label="Date" value={post.date} onChange={(v) => updateListItem('newsPosts', i, 'date', v)} placeholder="2026-03-15" />
            </ItemCard>
          ))}
        </FormSection>
      )}

      {sectionOn('pricing') && (
        <FormSection title="Pricing" {...listControls('pricing', 'Add Plan')}>
          <Field label="Section Title" value={content.pricingSectionTitle} onChange={(v) => updateContent({ pricingSectionTitle: v })} />
          {content.pricing.map((plan, i) => (
            <ItemCard
              key={i}
              label={`Plan ${i + 1}`}
              canRemove={listControls('pricing').canRemove()}
              onRemove={() => listControls('pricing').onRemove(i)}
            >
              <Field label="Title" value={plan.title} onChange={(v) => updateListItem('pricing', i, 'title', v)} />
              <Field label="Price" value={plan.price} onChange={(v) => updateListItem('pricing', i, 'price', v)} />
              <Field label="Tag" value={plan.tag} onChange={(v) => updateListItem('pricing', i, 'tag', v)} placeholder="Most popular" />
              <Field label="Description" value={plan.description} onChange={(v) => updateListItem('pricing', i, 'description', v)} multiline />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={plan.featured}
                  onChange={(e) => {
                    const plans = [...content.pricing]
                    plans[i] = { ...plans[i], featured: e.target.checked }
                    updateContent({ pricing: plans })
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Highlight as featured plan
              </label>
            </ItemCard>
          ))}
        </FormSection>
      )}

      {sectionOn('team') && (
      <FormSection title="Team" {...listControls('team')}>
        <Field label="Section Title" value={content.teamSectionTitle} onChange={(v) => updateContent({ teamSectionTitle: v })} />
        {content.team.map((m, i) => (
          <ItemCard
            key={i}
            label={`Member ${i + 1}`}
            canRemove={listControls('team').canRemove()}
            onRemove={() => listControls('team').onRemove(i)}
          >
            <Field label="Name" value={m.name} onChange={(v) => updateListItem('team', i, 'name', v)} />
            <Field label="Role" value={m.role} onChange={(v) => updateListItem('team', i, 'role', v)} />
            <ImagePicker label="Photo" value={m.image} onChange={(v) => updateListItem('team', i, 'image', v)} />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {sectionOn('faq') && (
      <FormSection title="FAQ" {...listControls('faqs')}>
        <Field label="Section Title" value={content.faqSectionTitle} onChange={(v) => updateContent({ faqSectionTitle: v })} />
        {content.faqs.map((faq, i) => (
          <ItemCard
            key={i}
            label={`Question ${i + 1}`}
            canRemove={listControls('faqs').canRemove()}
            onRemove={() => listControls('faqs').onRemove(i)}
          >
            <Field label="Question" value={faq.question} onChange={(v) => updateListItem('faqs', i, 'question', v)} />
            <Field label="Answer" value={faq.answer} onChange={(v) => updateListItem('faqs', i, 'answer', v)} multiline />
          </ItemCard>
        ))}
      </FormSection>
      )}

      {sectionOn('cta') && (
      <FormSection title="CTA Banner">
        <Field label="Banner Title" value={content.ctaBannerTitle} onChange={(v) => updateContent({ ctaBannerTitle: v })} />
        <Field label="Banner Text" value={content.ctaBannerText} onChange={(v) => updateContent({ ctaBannerText: v })} multiline />
        <Field label="Button Text" value={content.ctaText} onChange={(v) => updateContent({ ctaText: v })} />
        <Field label="Button Link" value={content.ctaLink} onChange={(v) => updateContent({ ctaLink: v })} placeholder="contact" />
      </FormSection>
      )}

      {pageOn('contact') && (
      <FormSection title="Contact Form">
        <Field label="Section Title" value={content.contactSectionTitle} onChange={(v) => updateContent({ contactSectionTitle: v })} />
        <Field label="Form Section Title" value={content.contactFormTitle} onChange={(v) => updateContent({ contactFormTitle: v })} />
        <Field
          label="Form Link (Google Forms, Typeform, etc.)"
          value={content.contactFormUrl}
          onChange={(v) => updateContent({ contactFormUrl: v })}
          placeholder="https://docs.google.com/forms/d/e/.../viewform"
        />
        <Field label="Form Button Text" value={content.contactFormButtonText} onChange={(v) => updateContent({ contactFormButtonText: v })} placeholder="Open Contact Form" />
        <p className="text-xs text-slate-400">A built-in contact form is always on your site. Optionally paste a Google Form or Typeform link to embed it (use the full docs.google.com/forms URL, not a forms.gle short link).</p>
      </FormSection>
      )}

      {template && (
        <FormSection title={`Contact Details — ${template.name}`}>
          {template.contactFields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={content[field.key]}
              onChange={(v) => setContact(field.key, v)}
              placeholder={field.placeholder}
            />
          ))}
          <MapLinkField
            value={content.mapUrl}
            address={content.address}
            onChange={(v) => updateContent({ mapUrl: v })}
          />
        </FormSection>
      )}
    </div>
  )
}

function FormSection({
  title, children, onAdd, addLabel, canAdd = true,
}: {
  title: string
  children: ReactNode
  onAdd?: () => void
  addLabel?: string
  canAdd?: boolean
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + {addLabel ?? 'Add'}
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ItemCard({
  label, children, onRemove, canRemove = false,
}: {
  label: string
  children: ReactNode
  onRemove?: () => void
  canRemove?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, multiline, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean; rows?: number
}) {
  const cls = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </label>
  )
}

function MapLinkField({
  value,
  address,
  onChange,
}: {
  value: string
  address: string
  onChange: (v: string) => void
}) {
  const embedUrl = getMapEmbedUrl(value, address)
  const shortLink = isShortMapLink(value)
  return (
    <div className="space-y-2">
      <Field
        label="Google Maps link"
        value={value}
        onChange={onChange}
        placeholder="https://www.google.com/maps/place/... or paste embed code"
      />
      <p className="text-xs text-slate-400">
        Paste a Google Maps URL or the embed iframe code (Share → Embed a map). Short maps.app.goo.gl links cannot be
        embedded — open them, then copy the full maps.google.com address. If this is empty, the map uses your office
        address.
      </p>
      {shortLink ? (
        <p className="text-xs text-amber-700">
          That looks like a short Maps link. Copy the full URL from your browser bar after it opens, or we will fall
          back to the office address.
        </p>
      ) : null}
      {embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <iframe
            title="Map preview"
            src={embedUrl}
            className="h-44 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
    </div>
  )
}