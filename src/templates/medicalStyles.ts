import type { HeroLayout } from '../data/layoutVariants'

export function medicalHeroClass(layout: HeroLayout): string {
  return `medical-hero${layout === 'centered' ? ' medical-hero--centered' : ''}`
}

/** Keep the preview, HTML, and Laravel hero geometry identical. */
export const MEDICAL_CSS = `
.medical-hero { padding: clamp(2.5rem, 6vw, 5.5rem) 0 !important; }
.medical-hero-layout { max-width: 72rem; margin-inline: auto; padding-inline: 1.5rem; display: grid; grid-template-columns: minmax(0,1fr); align-items: center; gap: 2.5rem; }
.medical-hero-copy { min-width: 0; max-width: 36rem; }
.medical-hero-copy > [data-part="badge"] { display: inline-flex; margin-bottom: 1.25rem; }
.medical-hero-title { margin: 0 0 1.5rem; font-size: clamp(2.25rem, 4.2vw, 3.75rem); line-height: 1.1; letter-spacing: -.035em; text-wrap: balance; }
.medical-hero-description { max-width: 52ch; margin: 0 0 2rem; font-size: 1.125rem; line-height: 1.8; }
.medical-hero-action { display: inline-flex; align-items: center; justify-content: center; gap: .75rem; min-height: 3rem; text-decoration: none; transition: transform .2s, box-shadow .2s; }
.medical-hero-action:hover { transform: translateY(-2px); box-shadow: 0 8px 20px #0f172a18; }
.medical-hero-action:focus-visible { outline: 3px solid #0f766e; outline-offset: 4px; }
.medical-hero-media { min-width: 0; width: 100%; overflow: hidden; border-radius: 1.5rem; background: #e2e8f0; border: 1px solid #cbd5e1; box-shadow: 0 20px 50px #0f172a15; }
.medical-hero-image { display: block; width: 100%; height: 100%; aspect-ratio: 4 / 3; object-fit: cover; object-position: center; }
.medical-hero--centered .medical-hero-copy { max-width: 48rem; margin-inline: auto; text-align: center; }
.medical-hero--centered .medical-hero-description { margin-inline: auto; }
.medical-hero--centered .medical-hero-media { max-width: 56rem; margin-inline: auto; }
.tpl-medical nav a:focus-visible,.tpl-medical nav button:focus-visible,.tpl-medical nav summary:focus-visible { outline: 3px solid #0f766e; outline-offset: 4px; }
@media (min-width: 1024px) { .medical-hero:not(.medical-hero--centered) .medical-hero-layout { grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 3.5rem; } }
.medical-hero:not(.medical-hero--centered) .medical-hero-layout:not(:has(.medical-hero-media)) { grid-template-columns: minmax(0,1fr); }
@media (max-width: 639px) { .medical-hero-layout { padding-inline: 1rem; gap: 2rem; } .medical-hero-description { font-size: 1rem; } .medical-hero-action { width: 100%; } .medical-hero-media { border-radius: 1rem; } }
@media (prefers-reduced-motion: reduce) { .medical-hero-action { transition: none; transform: none; } }
`.trim()
