/** Shared by the editor, static HTML, and Laravel exports. */
export const FITNESS_CSS = `
.tpl-fitness { --pulse-accent: var(--brand-accent, #ea580c); }
.tpl-fitness nav { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.tpl-fitness .pulse-trust { background: #111827 !important; color: #fff; border-block: 1px solid #374151; }
.tpl-fitness .pulse-trust > div:first-child { padding-bottom: 1.5rem; }
.tpl-fitness .pulse-trust-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 1rem; }
.tpl-fitness .pulse-trust-grid > div { padding: 1.5rem 1rem; border: 1px solid #374151; border-radius: 1rem; background: #1f2937; }
.tpl-fitness .pulse-trust-grid p:last-child { color: #e5e7eb; opacity: 1; line-height: 1.6; }
.tpl-fitness section.bg-slate-50 { background: #111827; color: #fff; }
.tpl-fitness section .text-slate-600 { color: #cbd5e1; }
.tpl-fitness section .bg-white { color: #111827; }
.tpl-fitness section .bg-white .text-slate-600 { color: #475569; }
.tpl-fitness section .pulse-card { background: #111827; color: #fff; height: 100%; transition: transform .2s, border-color .2s, box-shadow .2s; }
.tpl-fitness .pulse-card:hover { transform: translateY(-4px); border-color: var(--pulse-accent); box-shadow: 0 14px 30px #0003; }
.tpl-fitness section .pulse-card .text-slate-600 { color: #cbd5e1; }
.tpl-fitness .pulse-card:focus-visible { outline: 3px solid var(--pulse-accent); outline-offset: 4px; }
.tpl-fitness .pulse-card-cue { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #6b728066; font-size: .875rem; font-weight: 700; }
.tpl-fitness .pulse-card-cue span { font-size: 1.25rem; transition: transform .2s; }
.tpl-fitness .pulse-card:hover .pulse-card-cue span { transform: translateX(4px); }
.tpl-fitness .pulse-cta { max-width: 64rem; margin: 2rem auto; border-radius: 1.5rem; padding: 3rem 1.5rem !important; width: calc(100% - 2rem); }
.tpl-fitness .pulse-cta > div { max-width: 40rem; }
.tpl-fitness .pulse-contact-grid { display: grid; align-items: start; gap: 2.5rem; max-width: 68rem; margin-inline: auto; }
.tpl-fitness .pulse-contact-details { display: grid; grid-template-columns: minmax(0,1fr); gap: 0; border: 1px solid #374151; border-radius: 1rem; background: #111827; padding: .25rem 1.5rem; }
.tpl-fitness .pulse-contact-details > div { min-width: 0; padding: 1.1rem 0; border-bottom: 1px solid #374151; }
.tpl-fitness .pulse-contact-details > div:last-child { border-bottom: 0; }
.tpl-fitness .pulse-contact-details p { overflow-wrap: anywhere; word-break: normal; line-height: 1.6; }
.tpl-fitness .pulse-contact-details p:first-child { color: #d1d5db; font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; opacity: 1; }
.tpl-fitness .pulse-contact-details a { color: #fff; text-decoration: underline; text-underline-offset: 4px; }
.tpl-fitness .pulse-contact-form { min-width: 0; padding: 1.5rem; border: 1px solid #d1d5db; border-radius: 1.5rem; background: #fff; color: #111827; box-shadow: 0 20px 50px #0003; }
.tpl-fitness .pulse-contact-form > div { border: 0; box-shadow: none; padding: 0; }
.tpl-fitness .pulse-contact-form input,.tpl-fitness .pulse-contact-form textarea,.tpl-fitness .pulse-contact-form select { width: 100%; border: 1px solid #cbd5e1; border-radius: .75rem; background: #f8fafc; color: #111827; padding: .875rem 1rem; text-transform: none; letter-spacing: normal; }
.tpl-fitness .pulse-contact-form input:focus,.tpl-fitness .pulse-contact-form textarea:focus,.tpl-fitness .pulse-contact-form select:focus { outline: 2px solid var(--pulse-accent); outline-offset: 2px; }
.tpl-fitness .pulse-contact-form label { color: #374151; font-size: .875rem; font-weight: 600; text-transform: none; letter-spacing: normal; }
.tpl-fitness .pulse-contact-form button { border-radius: .75rem; min-height: 3rem; }
.tpl-fitness footer { background: #111827; color: #e5e7eb; border-top: 1px solid #374151; padding: 3rem 0; text-align: left; }
.tpl-fitness footer p,.tpl-fitness footer a { color: #e5e7eb; opacity: 1; overflow-wrap: anywhere; line-height: 1.75; }
.tpl-fitness footer a:hover { color: #fff; text-decoration: underline; }
@media (min-width: 768px) { .tpl-fitness .pulse-trust-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
@media (min-width: 1024px) { .tpl-fitness .pulse-contact-grid { grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); gap: 3rem; } }
@media (prefers-reduced-motion: reduce) { .tpl-fitness .pulse-card,.tpl-fitness .pulse-card-cue span { transition: none; transform: none; } }
`.trim()
