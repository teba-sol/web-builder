import type { ReactNode } from 'react'
import { getDefaultColorSchemeId } from '../data/colorSchemes'
import { getTemplateMeta } from '../data/defaults'
import { LIST_MAX_COUNT, LIST_MIN_COUNT, listAddLabels } from '../data/listDefaults'
import { getShowcaseConfig } from '../data/sectionConfig'
import { useWebsite } from '../context/WebsiteContext'
import type { ContactFieldKey } from '../types'
import type { ContentListKey } from '../data/listDefaults'
import { getDefaultLayoutVariantId } from '../data/layoutVariants'
import { ColorSchemePicker } from './ColorSchemePicker'
import { ImagePicker } from './ImagePicker'
import { LayoutVariantPicker } from './LayoutVariantPicker'
import { SectionVisibilityPicker } from './SectionVisibilityPicker'

export function ContentForm() {
  const {
    templateId, content, colorSchemeId, layoutVariantId, setColorScheme, setLayoutVariant,
    updateContent, updateListItem, addListItem, removeListItem,
    toggleSectionVisibility,
  } = useWebsite()
  const template = templateId ? getTemplateMeta(templateId) : null
  const showcaseCfg = templateId ? getShowcaseConfig(templateId) : null

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

      <SectionVisibilityPicker
        visibility={content.sectionVisibility}
        onToggle={toggleSectionVisibility}
      />

      <FormSection title="Hero">
        <Field label="Business Name" value={content.businessName} onChange={(v) => updateContent({ businessName: v })} />
        <Field label="Headline / Tagline" value={content.tagline} onChange={(v) => updateContent({ tagline: v })} />
        <Field label="Hero Subtext" value={content.heroSubtext} onChange={(v) => updateContent({ heroSubtext: v })} multiline />
        <ImagePicker label="Hero Image" value={content.heroImage} onChange={(v) => updateContent({ heroImage: v })} />
      </FormSection>

      <FormSection title="About">
        <Field label="Section Title" value={content.aboutTitle} onChange={(v) => updateContent({ aboutTitle: v })} />
        <Field label="About Text" value={content.about} onChange={(v) => updateContent({ about: v })} multiline rows={5} />
        <ImagePicker label="About Image" value={content.aboutImage} onChange={(v) => updateContent({ aboutImage: v })} />
        <Field label="Mission Statement" value={content.missionStatement} onChange={(v) => updateContent({ missionStatement: v })} multiline />
      </FormSection>

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

      {showcaseCfg && content.sectionVisibility.showcase && (
        <FormSection title={showcaseCfg.sectionTitle} {...listControls('showcaseItems', showcaseAddLabel)}>
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
              <Field label="Link" value={item.link} onChange={(v) => updateListItem('showcaseItems', i, 'link', v)} placeholder="#contact" />
            </ItemCard>
          ))}
        </FormSection>
      )}

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

      <FormSection title="CTA Banner">
        <Field label="Banner Title" value={content.ctaBannerTitle} onChange={(v) => updateContent({ ctaBannerTitle: v })} />
        <Field label="Banner Text" value={content.ctaBannerText} onChange={(v) => updateContent({ ctaBannerText: v })} multiline />
        <Field label="Button Text" value={content.ctaText} onChange={(v) => updateContent({ ctaText: v })} />
        <Field label="Button Link" value={content.ctaLink} onChange={(v) => updateContent({ ctaLink: v })} placeholder="#contact" />
      </FormSection>

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