import type { SectionVisibility, ShowcaseItem, TemplateId, ToggleableSection } from '../types'

export interface ShowcaseConfig {
  sectionTitle: string
  sectionSubtitle: string
  navLabel: string
  itemLabel: string
  showPrice: boolean
  priceLabel: string
  showTag: boolean
  tagLabel: string
}

export interface SectionMeta {
  key: ToggleableSection
  label: string
  description: string
}

export const defaultSectionVisibility: SectionVisibility = {
  stats: true,
  about: true,
  services: true,
  steps: true,
  showcase: true,
  gallery: true,
  team: true,
  faq: true,
  cta: true,
}

export const sectionMetas: SectionMeta[] = [
  { key: 'showcase', label: 'Featured Items', description: 'Products, listings, menu, or plans' },
  { key: 'stats', label: 'Stats Bar', description: 'Key numbers and achievements' },
  { key: 'about', label: 'About', description: 'Story, mission, and second image' },
  { key: 'services', label: 'Services', description: 'What you offer' },
  { key: 'steps', label: 'Process', description: 'How it works step-by-step' },
  { key: 'gallery', label: 'Gallery', description: 'Photo showcase grid' },
  { key: 'team', label: 'Team', description: 'People behind the business' },
  { key: 'faq', label: 'FAQ', description: 'Common questions' },
  { key: 'cta', label: 'CTA Banner', description: 'Mid-page call to action' },
]

export const showcaseConfigByTemplate: Record<TemplateId, ShowcaseConfig> = {
  business: {
    sectionTitle: 'Client Success Stories',
    sectionSubtitle: 'Real results from companies we have helped transform',
    navLabel: 'Case Studies',
    itemLabel: 'Case Study',
    showPrice: false,
    priceLabel: 'ROI',
    showTag: true,
    tagLabel: 'Industry',
  },
  creative: {
    sectionTitle: 'Featured Projects',
    sectionSubtitle: 'A selection of our most impactful creative work',
    navLabel: 'Projects',
    itemLabel: 'Project',
    showPrice: false,
    priceLabel: 'Budget',
    showTag: true,
    tagLabel: 'Category',
  },
  restaurant: {
    sectionTitle: 'Signature Menu',
    sectionSubtitle: 'Chef-curated dishes made with seasonal ingredients',
    navLabel: 'Menu',
    itemLabel: 'Dish',
    showPrice: true,
    priceLabel: 'Price',
    showTag: true,
    tagLabel: 'Course',
  },
  saas: {
    sectionTitle: 'Pricing Plans',
    sectionSubtitle: 'Simple, transparent pricing for teams of every size',
    navLabel: 'Pricing',
    itemLabel: 'Plan',
    showPrice: true,
    priceLabel: 'Price / mo',
    showTag: true,
    tagLabel: 'Best for',
  },
  fitness: {
    sectionTitle: 'Membership Plans',
    sectionSubtitle: 'Flexible options to match your fitness goals',
    navLabel: 'Plans',
    itemLabel: 'Plan',
    showPrice: true,
    priceLabel: 'Price / mo',
    showTag: true,
    tagLabel: 'Includes',
  },
  boutique: {
    sectionTitle: 'Shop Collection',
    sectionSubtitle: 'Curated pieces from our latest arrivals',
    navLabel: 'Shop',
    itemLabel: 'Product',
    showPrice: true,
    priceLabel: 'Price',
    showTag: true,
    tagLabel: 'Category',
  },
  realtor: {
    sectionTitle: 'Featured Listings',
    sectionSubtitle: 'Exclusive properties available now',
    navLabel: 'Listings',
    itemLabel: 'Property',
    showPrice: true,
    priceLabel: 'Price',
    showTag: true,
    tagLabel: 'Details',
  },
  photography: {
    sectionTitle: 'Session Packages',
    sectionSubtitle: 'Professional photography tailored to your needs',
    navLabel: 'Packages',
    itemLabel: 'Package',
    showPrice: true,
    priceLabel: 'Starting at',
    showTag: true,
    tagLabel: 'Duration',
  },
  medical: {
    sectionTitle: 'Care Programs',
    sectionSubtitle: 'Comprehensive health programs for every stage of life',
    navLabel: 'Programs',
    itemLabel: 'Program',
    showPrice: false,
    priceLabel: 'Copay',
    showTag: true,
    tagLabel: 'Type',
  },
}

const emptyShowcase = (): ShowcaseItem => ({
  title: '',
  description: '',
  image: '',
  price: '',
  tag: '',
  link: '#contact',
})

export function createShowcaseItems(items: Partial<ShowcaseItem>[]): ShowcaseItem[] {
  const filled = items.map((item) => ({ ...emptyShowcase(), ...item }))
  while (filled.length < 6) filled.push(emptyShowcase())
  return filled.slice(0, 6)
}

export const defaultShowcaseByTemplate: Record<TemplateId, ShowcaseItem[]> = {
  business: createShowcaseItems([
    { title: 'TechStart Growth Strategy', description: 'Helped a SaaS startup triple ARR in 18 months through market repositioning and sales optimization.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', tag: 'Technology' },
    { title: 'Retail Chain Turnaround', description: 'Reduced operational costs by 22% while improving customer satisfaction scores across 40 locations.', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80', tag: 'Retail' },
    { title: 'Healthcare Expansion', description: 'Guided a regional clinic network through a successful multi-state expansion and EHR integration.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', tag: 'Healthcare' },
    { title: 'Manufacturing Efficiency', description: 'Implemented lean processes that cut production waste by 35% and improved on-time delivery to 98%.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', tag: 'Manufacturing' },
    { title: 'Financial Services Digital', description: 'Led digital transformation for a credit union, increasing mobile adoption by 200% in one year.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', tag: 'Finance' },
    { title: 'Nonprofit Scale-Up', description: 'Built fundraising and operations infrastructure that helped a nonprofit 5x its annual impact.', image: 'https://images.unsplash.com/photo-1531206716517-69b0e4f0aee1?w=600&q=80', tag: 'Nonprofit' },
  ]),
  creative: createShowcaseItems([
    { title: 'Nova Rebrand', description: 'Complete brand identity for a fintech startup — logo, guidelines, and launch campaign.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80', tag: 'Branding' },
    { title: 'Bloom E-Commerce', description: 'UI/UX design and development for a luxury skincare DTC brand.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', tag: 'Web Design' },
    { title: 'Pulse Festival', description: 'Visual identity, stage design, and social campaign for a 50,000-person music festival.', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', tag: 'Events' },
    { title: 'Artisan Coffee Co.', description: 'Packaging design and retail experience for a specialty coffee roaster.', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80', tag: 'Packaging' },
    { title: 'Motion Reel 2025', description: 'Brand film and motion graphics for a global sportswear launch.', image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80', tag: 'Motion' },
    { title: 'Urban Spaces', description: 'Architectural photography and editorial layout for a design magazine feature.', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8627?w=600&q=80', tag: 'Editorial' },
  ]),
  restaurant: createShowcaseItems([
    { title: 'Osso Buco Milanese', description: 'Braised veal shanks in white wine, served with saffron risotto.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', price: '$42', tag: 'Main' },
    { title: 'Truffle Burrata', description: 'Creamy burrata, black truffle shavings, heirloom tomatoes, aged balsamic.', image: 'https://images.unsplash.com/photo-1608897012298-7d7b468a4cb3?w=600&q=80', price: '$18', tag: 'Starter' },
    { title: 'Lobster Ravioli', description: 'Handmade pasta filled with Maine lobster in a champagne cream sauce.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80', price: '$36', tag: 'Pasta' },
    { title: 'Tiramisu Classico', description: 'Espresso-soaked ladyfingers, mascarpone, Valrhona cocoa — our signature dessert.', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80', price: '$14', tag: 'Dessert' },
    { title: 'Chianti-Braised Short Rib', description: 'Slow-cooked for 12 hours, served with roasted root vegetables.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', price: '$38', tag: 'Main' },
    { title: 'Chef\'s Tasting Menu', description: 'Seven courses with wine pairings — an unforgettable culinary journey.', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', price: '$125', tag: 'Experience' },
  ]),
  saas: createShowcaseItems([
    { title: 'Starter', description: 'Perfect for small teams getting started. Tasks, boards, and basic automations.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', price: '$0', tag: 'Up to 5 users' },
    { title: 'Professional', description: 'Advanced workflows, integrations, and reporting for growing teams.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', price: '$29', tag: 'Up to 25 users' },
    { title: 'Business', description: 'Unlimited projects, priority support, and custom automations.', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80', price: '$79', tag: 'Up to 100 users' },
    { title: 'Enterprise', description: 'SSO, audit logs, dedicated CSM, and SLA guarantees.', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80', price: 'Custom', tag: 'Unlimited' },
    { title: 'Add-on: Analytics Pro', description: 'Advanced dashboards, custom reports, and data export.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', price: '$15', tag: 'Per user' },
    { title: 'Add-on: Automation Pack', description: '500 additional automation runs per month.', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80', price: '$10', tag: 'Per month' },
  ]),
  fitness: createShowcaseItems([
    { title: 'Basic', description: 'Gym floor access, locker room, and 2 group classes per week.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', price: '$29', tag: 'Month-to-month' },
    { title: 'Pro', description: 'Unlimited classes, sauna access, and 1 personal training session monthly.', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80', price: '$59', tag: 'Most popular' },
    { title: 'Elite', description: 'Everything in Pro plus nutrition coaching and priority class booking.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80', price: '$99', tag: 'Best value' },
    { title: 'HIIT Bootcamp', description: '8-week intensive program — 3 sessions per week with certified coaches.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80', price: '$199', tag: '8 weeks' },
    { title: 'Yoga Unlimited', description: 'Daily yoga and pilates classes for all levels.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', price: '$39', tag: 'Add-on' },
    { title: 'Corporate Wellness', description: 'Custom packages for teams of 10+. On-site and virtual options.', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80', price: 'Custom', tag: 'Teams' },
  ]),
  boutique: createShowcaseItems([
    { title: 'Silk Midi Dress', description: 'Fluid Italian silk in champagne — perfect for evening events.', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', price: '$285', tag: 'Dresses' },
    { title: 'Cashmere Wrap Coat', description: 'Oversized camel coat, sustainably sourced Mongolian cashmere.', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80', price: '$420', tag: 'Outerwear' },
    { title: 'Gold Hoop Earrings', description: '14k recycled gold, hand-crafted by Parisian artisans.', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', price: '$165', tag: 'Jewelry' },
    { title: 'Linen Blazer', description: 'Relaxed tailoring in natural ivory — a summer wardrobe essential.', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', price: '$198', tag: 'Blazers' },
    { title: 'Leather Tote', description: 'Vegetable-tanned leather, spacious interior, lifetime repair guarantee.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', price: '$340', tag: 'Bags' },
    { title: 'Satin Slip Skirt', description: 'Bias-cut midnight navy skirt — pairs with everything.', image: 'https://images.unsplash.com/photo-1583497276230-9f401a8c0f94?w=600&q=80', price: '$145', tag: 'Skirts' },
  ]),
  realtor: createShowcaseItems([
    { title: 'Oceanfront Villa — Malibu', description: '5 bed, 6 bath contemporary estate with infinity pool and private beach access.', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80', price: '$12,500,000', tag: '5 bed · 6,200 sqft' },
    { title: 'Penthouse — Brickell', description: '3 bed penthouse with 360° views, private elevator, and rooftop terrace.', image: 'https://images.unsplash.com/photo-1600607687939-ce8ab6f122ef?w=600&q=80', price: '$4,200,000', tag: '3 bed · 3,100 sqft' },
    { title: 'Historic Estate — Coral Gables', description: 'Mediterranean revival on 1.2 acres with guest house and tropical gardens.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', price: '$6,800,000', tag: '6 bed · 8,400 sqft' },
    { title: 'Waterfront Condo — Miami Beach', description: '2 bed modern condo steps from the sand, resort-style amenities.', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6a3?w=600&q=80', price: '$1,850,000', tag: '2 bed · 1,450 sqft' },
    { title: 'Golf Course Home — Palm Beach', description: '4 bed lakefront home on championship course with dock and pool.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', price: '$3,400,000', tag: '4 bed · 4,800 sqft' },
    { title: 'Downtown Loft — Wynwood', description: 'Converted warehouse loft with 14ft ceilings and artist studio space.', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80', price: '$975,000', tag: '2 bed · 1,800 sqft' },
  ]),
  photography: createShowcaseItems([
    { title: 'Wedding — Full Day', description: '10 hours coverage, engagement session, online gallery, and heirloom album.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', price: '$4,500', tag: '10 hours' },
    { title: 'Portrait Session', description: '1-hour session, 2 outfit changes, 25 edited high-res images.', image: 'https://images.unsplash.com/photo-1554048612-b6a482b22f42?w=600&q=80', price: '$450', tag: '1 hour' },
    { title: 'Commercial — Half Day', description: 'Product or brand shoot, 4 hours, usage rights included.', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80', price: '$2,200', tag: '4 hours' },
    { title: 'Newborn & Family', description: 'In-home or studio session, includes prints and digital gallery.', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80', price: '$650', tag: '2 hours' },
    { title: 'Event Coverage', description: 'Corporate events, galas, and celebrations — flexible hourly packages.', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', price: '$350/hr', tag: 'Hourly' },
    { title: 'Elopement Package', description: 'Intimate ceremony coverage, 4 hours, next-day sneak peek.', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80', price: '$2,800', tag: '4 hours' },
  ]),
  medical: createShowcaseItems([
    { title: 'Annual Wellness Exam', description: 'Comprehensive physical, labs, preventive screening, and personalized health plan.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', tag: 'Preventive' },
    { title: 'Pediatric Care', description: 'Well-child visits, immunizations, developmental assessments birth through 18.', image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80', tag: 'Pediatrics' },
    { title: 'Chronic Care Management', description: 'Ongoing support for diabetes, hypertension, asthma, and heart disease.', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80', tag: 'Chronic' },
    { title: 'Women\'s Health', description: 'Annual exams, prenatal care, menopause management, and reproductive health.', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80', tag: 'Women\'s' },
    { title: 'Telehealth Visits', description: 'Virtual consultations for follow-ups, prescriptions, and minor illnesses.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', tag: 'Virtual' },
    { title: 'Senior Care Program', description: 'Coordinated care for adults 65+ including fall prevention and medication review.', image: 'https://images.unsplash.com/photo-1586773866498-ae9054135b1c?w=600&q=80', tag: 'Seniors' },
  ]),
}

export function getShowcaseConfig(templateId: TemplateId): ShowcaseConfig {
  return showcaseConfigByTemplate[templateId]
}