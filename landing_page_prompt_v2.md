Rebuild the BuildAura landing page as an immersive, chapter-based interactive website inspired by the visual storytelling style of https://www.deso.com/.

IMPORTANT:
Do not copy DeSo's branding, content, layouts, or assets.

Use it only as inspiration for:
- chapter-based navigation
- oversized typography
- unconventional composition
- strong scroll choreography
- large visual transitions
- overlapping elements
- full-screen scenes
- editorial layouts
- motion-driven storytelling
- immersive page rhythm

BuildAura is a TEMPLATE-BASED WEBSITE BUILDER.

Users:
1. Browse professionally designed templates.
2. Select a template.
3. Customize colors, typography, images, text, layout, and sections.
4. Publish the website.

This is NOT a prompt-to-website AI product.

---

# CORE EXPERIENCE

Do NOT build a conventional SaaS landing page.

Avoid:

- hero + cards + features + testimonials + pricing
- endless rounded cards
- generic dashboard mockups
- gradient blobs
- icon grids
- typical startup layouts

Instead, make the page feel like a guided interactive story.

The website should be organized into chapters.

Example:

01 — INTRO
02 — DISCOVER
03 — CHOOSE
04 — CUSTOMIZE
05 — BUILD
06 — PUBLISH
07 — START

Each chapter should feel visually different while still belonging to the same design system.

Use subtle persistent chapter navigation similar to an editorial index.

---

# TECHNOLOGY

Use the existing React application.

Preferred tools:

- Lenis for smooth scrolling
- GSAP
- GSAP ScrollTrigger
- Framer Motion where useful
- CSS transforms and perspective

Install npm packages if needed.

Avoid Three.js unless a specific effect truly requires WebGL.

Most visual depth should come from:

- perspective
- translate3d
- rotateX / rotateY
- scale
- masks
- clip-path
- fixed/pinned elements
- layering
- scroll-linked movement

---

# CHAPTER NAVIGATION

Create a minimal chapter navigator.

It may sit vertically along one edge of the viewport.

Show:

01 Intro
02 Discover
03 Choose
04 Customize
05 Build
06 Publish
07 Start

When scrolling:
- highlight the current chapter
- smoothly transition between chapters
- optionally show progress

Keep it subtle.

Do not turn it into a large sidebar.

---

# CHAPTER 01 — INTRO

Create a highly cinematic opening.

Use extremely large typography.

Possible copy:

A BETTER
WAY TO
START.

Then:

BuildAura

Supporting line:

Beautiful websites begin with better starting points.

The hero should not use a conventional centered container.

Instead:

- typography can exceed viewport boundaries
- parts of words can be clipped
- website previews can move between typography layers
- previews can sit at different depths
- some previews may enter from outside the viewport

Use strong composition.

As the user scrolls, the hero should begin transforming rather than simply disappearing.

---

# HERO TRANSITION

On scroll:

- headline separates
- template previews begin moving
- one template moves toward the center
- background elements shift at slower rates
- the scene creates depth

Use scroll progress to make this feel like camera movement.

The transition should lead directly into Chapter 02.

---

# CHAPTER 02 — DISCOVER

Theme:

"Find something worth starting from."

Show a large collection of website templates.

Do NOT make a normal template grid.

Create a spatial template wall.

Templates can be:

- large
- small
- tall
- wide
- partially cropped
- overlapping
- positioned outside the normal content width

Different layers should move at different speeds while scrolling.

Some previews can move horizontally while the page scrolls vertically.

Use subtle perspective.

Possible headline:

DESIGN
WORTH
STARTING
FROM.

Supporting copy:

Browse professionally designed templates built for real businesses.

---

# CHAPTER 03 — CHOOSE

Create a focused template browsing experience.

Use one large template as the dominant object.

Show neighboring templates partially visible around it.

Use a premium offset / peek carousel.

Center template:
- largest
- sharp
- closest

Adjacent templates:
- slightly smaller
- offset
- reduced opacity
- slight perspective

Support:
- drag
- scroll
- touch

Avoid a conventional carousel appearance.

This should feel like physically moving through a collection.

Possible labels:

Restaurant
Agency
Portfolio
Real Estate
Health
Fashion
Consulting
Local Business

---

# CHAPTER 04 — CUSTOMIZE

This should be one of the strongest sections.

Start with ONE selected template.

As the user scrolls, continuously transform it.

Sequence:

Original template

↓

Change typography

↓

Change color palette

↓

Replace imagery

↓

Reorder sections

↓

Change content

↓

Final personalized website

Do NOT replace the entire preview each time.

It should feel like one website evolving.

Display tiny utility labels around it:

TYPE
COLOR
MEDIA
LAYOUT
CONTENT

The purpose is to communicate:

The template is the starting point, not the final result.

---

# CHAPTER 05 — BUILD

Reveal the BuildAura editor.

Do not place a screenshot inside a laptop mockup.

Instead, construct the editor visually.

At first:

- canvas enters
- toolbar appears separately
- typography controls appear
- color controls move in
- navigator enters
- section controls enter

As scrolling continues, these fragments assemble into the complete BuildAura editor.

Then demonstrate:

- editing text
- changing color
- swapping image
- reordering a section
- selecting another layout

Keep the editor readable.

Do not animate every control simultaneously.

---

# LARGE TYPOGRAPHY BREAK

Create a strong transition similar to editorial title cards.

Use:

START
WITH
DESIGN.

then transition into:

MAKE
IT
YOURS.

Use enormous typography.

Words should move at different scroll speeds.

Some words can travel horizontally.

Some can remain pinned while template previews move behind them.

Treat typography as part of the visual composition rather than just text content.

---

# CHAPTER 06 — PUBLISH

Create a transformation from editor to live website.

Start with the BuildAura editing canvas.

As the user scrolls:

- editor controls move away
- editing borders disappear
- website becomes clean
- browser frame expands
- final site fills the viewport

Possible headline:

FROM
TEMPLATE
TO LIVE.

Then show the website behaving like a real published site.

This should visually communicate completion.

---

# TEMPLATE DIVERSITY MOMENT

Create a section showing:

ONE STARTING POINT.
MANY OUTCOMES.

Take one underlying template structure and display several customized identities:

- luxury brand
- restaurant
- architecture studio
- creative agency
- local business

Animate them expanding outward from one central template.

Use:
- perspective
- scale
- rotation
- depth

Then bring them back together.

This should show that templates are flexible rather than restrictive.

---

# CHAPTER 07 — START

Finish with a strong, minimal final scene.

Large typography:

FIND YOUR
STARTING POINT.

Secondary:

Choose a template.
Make it yours.
Publish when you're ready.

Primary CTA:

EXPLORE TEMPLATES

Secondary CTA:

START BUILDING

Behind the text, allow template previews from previous sections to move slowly through the scene.

Do not use a generic CTA card.

---

# VISUAL STYLE

Aim for:

- editorial
- experimental
- premium
- minimal
- spatial
- typography-led
- sophisticated
- slightly brutalist where appropriate

Typography should carry most of the visual personality.

Use very large type.

Combine:

- huge display text
- small technical labels
- section/chapter numbers
- large whitespace
- restrained body copy

Do not over-round everything.

Some elements can use almost no border-radius.

---

# COLOR

Start with a restrained visual system.

Use:
- off-white
- black
- charcoal
- muted neutrals

Use BuildAura's existing brand color as an accent.

Avoid the stereotypical purple/blue SaaS gradient.

Colors may change between chapters if done intentionally.

---

# SCROLL BEHAVIOR

Use Lenis for smooth scrolling.

Synchronize it correctly with GSAP ScrollTrigger.

Scrolling should control:

- movement
- scale
- clipping
- depth
- transitions
- pinned scenes

The experience should feel controlled and slightly weighted.

Never make scrolling frustrating or excessively slow.

---

# PARALLAX

Use multiple depth layers.

Example:

large background typography:
0.15–0.25 speed

template background layer:
0.4

main content:
0.7

foreground UI:
1

accent objects:
1.1

Keep it subtle.

Avoid random floating shapes.

---

# TRANSITIONS

Do not use:

fade out
new section
fade in

for every transition.

Instead:

let one scene physically transform into the next.

Examples:

template gallery
→ selected template
→ customized template
→ editor
→ published website

Try to reuse the same visual object through multiple chapters.

This continuity is critical.

---

# RESPONSIVE DESIGN

Desktop:
full immersive experience.

Tablet:
reduce perspective and pinned sections.

Mobile:
simplify animations substantially.

Do not attempt to reproduce every desktop scroll animation on mobile.

Preserve:

- strong typography
- template focus
- clean storytelling
- smooth navigation

---

# ACCESSIBILITY

Support prefers-reduced-motion.

When enabled:

- remove large parallax
- remove complex pinned animations
- reduce transitions
- keep all content accessible
- maintain standard scrolling

---

# PERFORMANCE

Target smooth 60fps interaction where possible.

Prioritize transforms and opacity.

Avoid repeatedly animating:
- width
- height
- top
- left

Lazy-load template images.

Avoid unnecessary React state updates during scrolling.

Use GSAP refs rather than rerendering React on every scroll event.

---

# CODE ORGANIZATION

Inspect the existing project first.

Reuse:
- current routing
- fonts
- colors
- buttons
- design tokens
- existing components

Create focused components such as:

LandingPage
ChapterNavigation
IntroChapter
DiscoverChapter
ChooseChapter
CustomizeChapter
BuilderChapter
PublishChapter
FinalChapter
TemplateShowcase
TemplateCarousel

Create reusable animation hooks/utilities.

Do not put everything inside LandingPage.tsx.

---

# FINAL REQUIREMENT

The most important requirement is:

DO NOT BUILD A NORMAL SaaS LANDING PAGE.

The experience should feel closer to an interactive digital story.

Use DeSo.com as a reference for the idea of:

- chapters
- oversized type
- unconventional composition
- strong section identity
- immersive scrolling
- long-form storytelling
- motion-led transitions

But make BuildAura's visual language original.

The central visual narrative must be:

DISCOVER
→ CHOOSE
→ CUSTOMIZE
→ BUILD
→ PUBLISH

The user should understand what BuildAura does primarily by watching the page transform, not by reading feature cards.