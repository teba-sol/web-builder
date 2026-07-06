import type { ReactNode } from 'react'
import { getTemplateMeta } from '../data/defaults'
import { useWebsite } from '../context/WebsiteContext'
import type { ContactFieldKey } from '../types'
import { ImagePicker } from './ImagePicker'

export function ContentForm() {
  const { templateId, content, updateContent, updateListItem } = useWebsite()
  const template = templateId ? getTemplateMeta(templateId) : null

  const setContact = (key: ContactFieldKey, value: string) => {
    updateContent({ [key]: value })
  }

  return (
    <div className="space-y-8">
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

      <FormSection title="Stats">
        {content.stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Field label={`Stat ${i + 1} Value`} value={stat.value} onChange={(v) => updateListItem('stats', i, 'value', v)} placeholder="500+" />
            <Field label="Label" value={stat.label} onChange={(v) => updateListItem('stats', i, 'label', v)} placeholder="Happy Clients" />
          </div>
        ))}
      </FormSection>

      <FormSection title={template?.servicesLabel ?? 'Services'}>
        <Field label="Section Title" value={content.servicesSectionTitle} onChange={(v) => updateContent({ servicesSectionTitle: v })} />
        <Field label="Section Subtitle" value={content.servicesSectionSubtitle} onChange={(v) => updateContent({ servicesSectionSubtitle: v })} />
        {content.services.map((s, i) => (
          <ItemCard key={i} label={`Item ${i + 1}`}>
            <Field label="Title" value={s.title} onChange={(v) => updateListItem('services', i, 'title', v)} />
            <Field label="Description" value={s.description} onChange={(v) => updateListItem('services', i, 'description', v)} multiline />
          </ItemCard>
        ))}
      </FormSection>

      <FormSection title="How It Works">
        <Field label="Section Title" value={content.stepsSectionTitle} onChange={(v) => updateContent({ stepsSectionTitle: v })} />
        {content.steps.map((step, i) => (
          <ItemCard key={i} label={`Step ${i + 1}`}>
            <Field label="Title" value={step.title} onChange={(v) => updateListItem('steps', i, 'title', v)} />
            <Field label="Description" value={step.description} onChange={(v) => updateListItem('steps', i, 'description', v)} multiline />
          </ItemCard>
        ))}
      </FormSection>

      <FormSection title="Gallery">
        <Field label="Section Title" value={content.gallerySectionTitle} onChange={(v) => updateContent({ gallerySectionTitle: v })} />
        {content.galleryImages.map((img, i) => (
          <ImagePicker key={i} label={`Image ${i + 1}`} value={img} onChange={(v) => updateListItem('galleryImages', i, '', v)} />
        ))}
      </FormSection>

      <FormSection title="Testimonials">
        <Field label="Section Title" value={content.testimonialsSectionTitle} onChange={(v) => updateContent({ testimonialsSectionTitle: v })} />
        {content.testimonials.map((t, i) => (
          <ItemCard key={i} label={`Review ${i + 1}`}>
            <Field label="Quote" value={t.quote} onChange={(v) => updateListItem('testimonials', i, 'quote', v)} multiline />
            <Field label="Author" value={t.author} onChange={(v) => updateListItem('testimonials', i, 'author', v)} />
            <Field label="Role / Company" value={t.role} onChange={(v) => updateListItem('testimonials', i, 'role', v)} />
          </ItemCard>
        ))}
      </FormSection>

      <FormSection title="Team">
        <Field label="Section Title" value={content.teamSectionTitle} onChange={(v) => updateContent({ teamSectionTitle: v })} />
        {content.team.map((m, i) => (
          <ItemCard key={i} label={`Member ${i + 1}`}>
            <Field label="Name" value={m.name} onChange={(v) => updateListItem('team', i, 'name', v)} />
            <Field label="Role" value={m.role} onChange={(v) => updateListItem('team', i, 'role', v)} />
            <ImagePicker label="Photo" value={m.image} onChange={(v) => updateListItem('team', i, 'image', v)} />
          </ItemCard>
        ))}
      </FormSection>

      <FormSection title="FAQ">
        <Field label="Section Title" value={content.faqSectionTitle} onChange={(v) => updateContent({ faqSectionTitle: v })} />
        {content.faqs.map((faq, i) => (
          <ItemCard key={i} label={`Question ${i + 1}`}>
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

      {template && (
        <FormSection title={`Contact — ${template.name}`}>
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

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ItemCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-xs font-semibold text-slate-400">{label}</p>
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