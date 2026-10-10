Redesign and implement the landing page for **BuildAura**, a template-based website builder.

IMPORTANT:

BuildAura is NOT a prompt-to-website AI generator.

Users:
1. Browse professionally designed website templates.
2. Choose a template.
3. Customize its content, colors, typography, sections, images, and branding.
4. Publish their website.

The landing page should communicate this clearly.

---

# PRIMARY DESIGN DIRECTION

Do NOT create a conventional SaaS landing page.

I want an experimental, immersive, highly polished landing page inspired by the interaction philosophy and visual energy of:

https://lenis.dev/

Do not copy Lenis literally.

Instead, borrow the qualities that make it interesting:

- oversized typography
- unusual layouts
- strong motion design
- scroll-driven storytelling
- elements entering from unexpected positions
- depth
- parallax
- overlapping content
- perspective
- scale changes
- pinned sections
- horizontal movement during vertical scrolling
- smooth transitions between sections
- very little reliance on conventional cards
- strong editorial composition
- intentional empty space
- sections that feel like scenes instead of containers

The experience should feel like exploring a creative interactive website rather than scrolling through a SaaS template.

---

# TECHNOLOGY

The existing project is React.

You may install npm packages where appropriate.

Preferred tools:

- Lenis for smooth scrolling
- GSAP
- GSAP ScrollTrigger
- Framer Motion
- CSS perspective / 3D transforms

Three.js / React Three Fiber may be used only if genuinely necessary.

Do not introduce WebGL just to claim the page is 3D.

Most depth effects should preferably use:
- CSS perspective
- translate3d
- rotateX
- rotateY
- scale
- transform-origin
- clipping
- masks
- layered positioning

Performance must remain excellent.

---

# EXPERIENCE PRINCIPLE

Scrolling should feel like controlling the composition.

Do not think:

section
section
section
section

Think:

scene → transformation → scene → transformation → scene

Elements from one scene should sometimes continue into the next.

Avoid obvious rectangular section boundaries.

---

# HERO

Make the opening immediately visually distinctive.

Full viewport or slightly taller than viewport.

Use extremely large typography.

Possible headline:

BUILD
YOUR
PRESENCE.

or

A BETTER
STARTING POINT
FOR THE WEB.

Supporting message:

BuildAura gives you beautifully designed templates and the tools to make them completely yours.

CTA:
Explore Templates

Secondary:
Start Building

Do not put everything inside a centered hero container.

Break the conventional layout.

For example:

- enormous headline partially extending beyond viewport edges
- template previews floating through the typography
- some previews partially cropped
- one website frame rotated slightly in perspective
- text and imagery existing at different depth levels

Mouse movement should create extremely subtle depth.

Scroll should begin transforming the hero immediately.

---

# HERO → TEMPLATE TRANSITION

As the user scrolls away from the hero:

Do NOT simply fade into the next section.

Make the hero transform.

For example:

The large typography moves apart.

Website previews that were floating in the hero move toward the center.

One template becomes dominant.

The camera-like perspective moves closer toward it.

The dominant template then becomes the entry point into the next experience.

This should feel like one continuous sequence.

---

# TEMPLATE SHOWCASE

Templates are the core of BuildAura.

Make them visually dominant.

Do not show six small template cards in a normal grid.

Create a large immersive template showcase.

Possible layout:

One huge template preview occupying 60–80% of the viewport.

Other templates appear:
- partially offscreen
- behind it
- above/below
- at different scales

As the user scrolls vertically, the templates move horizontally.

Use ScrollTrigger to create a pinned horizontal sequence.

Template categories can include:

Restaurant
Agency
Portfolio
Real Estate
Fashion
Healthcare
Consulting
Local Business

Each template preview should look like a real website.

Avoid generic placeholder rectangles.

---

# OFFSET / PEEK TEMPLATE BROWSER

At one point in the experience, create a polished offset carousel.

One template is dominant in the center.

Previous and next templates remain partially visible.

Use:

- scale differences
- perspective
- slight Y offsets
- subtle rotations
- depth
- clipping

The active item should feel physically closer.

Dragging or scrolling can move between templates.

Do NOT make this look like a standard carousel component.

It should feel integrated into the overall page composition.

---

# TEMPLATE DETAIL MOMENT

Choose one template and make it become almost fullscreen.

Then demonstrate visually how BuildAura allows customization.

Do not explain this using feature cards.

As the user scrolls:

the same template changes.

Example:

Stage 1:
original template

Stage 2:
colors change

Stage 3:
typography changes

Stage 4:
images change

Stage 5:
sections reorder

Stage 6:
final personalized website

Use smooth interpolation / transitions.

Show small labels such as:

COLOR

TYPE

LAYOUT

CONTENT

SECTIONS

but keep them visually minimal.

The user should understand:

"You start from a professional template but the final website becomes your own."

---

# LARGE TYPOGRAPHY SCENE

Create a strong typographic transition.

For example:

START
WITH
GOOD
DESIGN.

Then:

MAKE
IT
YOURS.

Make each word extremely large.

Words can move at different speeds while scrolling.

Some text may travel horizontally.

Some may be clipped by the viewport.

Website previews can move between text layers.

Use typography almost as graphical objects.

---

# TEMPLATE WALL

Create a section inspired by a visual design gallery / Pinterest wall.

BUT do not make a static masonry grid.

Use many template screenshots at different sizes.

Layout should feel almost spatial.

Some previews:
- tall
- wide
- tiny
- partially cropped
- overlapping
- extending outside the normal content width

During scroll:

different groups move at different speeds.

Some travel upward.

Some move sideways.

Some slowly scale.

This should produce noticeable depth without making the page chaotic.

---

# "ONE TEMPLATE, MANY IDENTITIES"

Create one of the strongest sections around this concept.

Headline:

ONE TEMPLATE.
ENDLESS IDENTITIES.

Show the same underlying template repeated several times but styled completely differently.

Example identities:

Luxury brand
Coffee shop
Architecture studio
Creative agency
Restaurant

As the user scrolls, these versions can fan out from one central template.

Use perspective.

Then collapse them back together.

This visually explains BuildAura better than a paragraph.

---

# BUILDER EXPERIENCE

Reveal the actual BuildAura editor.

Do not simply place a dashboard screenshot inside a laptop frame.

Make the interface part of the scene.

Start with fragments:

- page canvas
- section navigator
- color controls
- typography controls
- image selector
- template selector

They begin distributed around the viewport.

As the user scrolls, they assemble into the BuildAura editor.

The final assembled editor should occupy most of the viewport.

Then show small interactions:

- change heading
- change image
- reorder section
- change colors

Keep interactions subtle.

---

# SCROLL PHYSICS

Use Lenis.

Scrolling should feel slightly weighted and smooth.

Do not make it sluggish.

Synchronize Lenis with GSAP ScrollTrigger properly.

All scroll-based transforms must stay synchronized.

Use animation for meaningful transitions only.

---

# PARALLAX

Use multiple depth levels.

Example:

background typography:
0.2x movement

large template:
0.6x

foreground UI:
1x

floating detail:
1.15x

Keep movement controlled.

No random floating blobs.

---

# NAVIGATION

Keep navigation extremely minimal.

Logo:
BuildAura

Links:
Templates
Features
Pricing

Actions:
Sign In
Start Building

Navigation can begin transparent.

As content moves beneath it, adjust contrast or add a subtle background.

Do not use a large pill navbar unless it genuinely fits the composition.

---

# HOW IT WORKS

Do not create three cards.

Use:

CHOOSE
CUSTOMIZE
PUBLISH

Each word can occupy an entire viewport moment.

For CHOOSE:
templates slide around the viewport.

For CUSTOMIZE:
selected template transforms.

For PUBLISH:
browser frame expands outward and becomes a real live website.

Make these scenes transition into one another.

---

# PRODUCT MESSAGE

BuildAura's main differentiator on this landing page should feel like:

Professional design without starting from zero.

The template is the beginning — not the limitation.

BuildAura lets you start from something beautiful and reshape it into your own website.

---

# FINAL CTA

The final section should feel like a conclusion to the visual story.

Large text:

FIND YOUR
STARTING POINT.

or

YOUR WEBSITE
STARTS HERE.

Then show templates moving slowly behind or around the typography.

CTA:

EXPLORE TEMPLATES

Secondary:

START BUILDING

Keep the composition bold.

Do not finish with a generic centered CTA card.

---

# DESIGN SYSTEM

Aim for an editorial / creative studio aesthetic.

Typography should carry much of the visual identity.

Use:
- very large display text
- strong contrast in scale
- small utility labels
- uppercase text selectively
- intentional line breaks

Avoid:
- excessive rounded corners
- generic Tailwind-looking cards
- gradient backgrounds everywhere
- purple SaaS aesthetic
- excessive glowing effects
- generic icons
- illustration packs

Use a restrained palette.

Start primarily monochrome or neutral.

Use BuildAura's existing brand color as an accent if one exists.

Do not arbitrarily replace the existing brand identity.

---

# ANIMATION CHARACTER

Animation should feel:

precise
heavy
smooth
confident
physical

Not:

bouncy
cute
floaty
random
overanimated

Use mostly:

linear
power2
power3
expo

style easing where appropriate.

---

# MOBILE

Do not try to reproduce every desktop animation.

Create a deliberate mobile version.

Reduce:
- pinned sequences
- 3D perspective
- extreme parallax
- simultaneous animated elements

Keep:
- typography
- template focus
- smooth scrolling
- strong transitions

Touch experience must remain natural.

---

# ACCESSIBILITY

Respect:

prefers-reduced-motion

If reduced motion is enabled:
- disable large parallax
- disable pinned transformations where needed
- preserve all content
- maintain normal scrolling

---

# PERFORMANCE

Target smooth animation.

Only animate:
- transform
- opacity
- clip-path where reasonable

Avoid layout thrashing.

Use will-change only where necessary.

Lazy-load large template images.

Do not mount expensive scenes before they are needed.

---

# IMPLEMENTATION

Before coding:

1. Inspect the existing project.
2. Identify the current routing and landing-page entry point.
3. Identify the existing design system.
4. Reuse existing typography/colors/components where useful.
5. Check existing dependencies before installing duplicates.

Then implement the landing page.

Break it into focused components.

Do not make one enormous LandingPage component.

Use reusable animation utilities/hooks where appropriate.

---

# CRITICAL REQUIREMENT

I do NOT want an average SaaS landing page with some scroll animations added to it.

The entire composition itself must be driven by scrolling.

The benchmark is the feeling of sites such as Lenis.dev:

large typography,
interactive visual composition,
smooth movement,
unusual positioning,
depth,
scroll choreography,
and continuous transitions between scenes.

BuildAura should feel like a creative website-building product from the first second of the experience.

The user should remember the website even if they only scroll through it once.

Implement this directly in the existing React application and make sensible design decisions when details are missing instead of stopping for clarification.