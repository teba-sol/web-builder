import type { SiteContent } from '../types'
import { emptyContacts } from './contacts'
import {
  defaultSectionVisibility,
  defaultShowcaseByTemplate,
  showcaseConfigByTemplate,
} from './sectionConfig'
import type { TemplateId } from '../types'

export const baseRichContent: SiteContent = {
  businessName: '',
  tagline: '',
  heroSubtext: '',
  heroImage: '',
  aboutTitle: 'About Us',
  about: '',
  aboutImage: '',
  missionStatement: '',
  sectionVisibility: { ...defaultSectionVisibility },
  stats: [
    { value: '500+', label: 'Happy Clients' },
    { value: '15+', label: 'Years Experience' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' },
  ],
  servicesSectionTitle: 'What We Offer',
  servicesSectionSubtitle: 'Comprehensive solutions tailored to your needs',
  services: [
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ],
  stepsSectionTitle: 'How It Works',
  steps: [
    { title: 'Consultation', description: 'We learn about your goals and challenges in a discovery session.' },
    { title: 'Strategy', description: 'Our team crafts a tailored plan designed for your success.' },
    { title: 'Execution', description: 'We deliver with precision, keeping you informed every step.' },
    { title: 'Growth', description: 'We measure results and optimize for continuous improvement.' },
  ],
  showcaseSectionTitle: 'Featured Items',
  showcaseSectionSubtitle: '',
  showcaseItems: defaultShowcaseByTemplate.business,
  gallerySectionTitle: 'Our Work',
  galleryImages: ['', '', '', '', '', ''],
  testimonialsSectionTitle: 'What Clients Say',
  testimonials: [
    { quote: 'Outstanding service and incredible results. Highly recommended!', author: 'Sarah Johnson', role: 'CEO, TechStart' },
    { quote: 'They transformed our business. Professional, creative, and reliable.', author: 'Michael Chen', role: 'Founder, Bloom Co' },
    { quote: 'The best decision we made this year. Exceeded every expectation.', author: 'Emily Rodriguez', role: 'Director, Apex Group' },
  ],
  faqSectionTitle: 'Frequently Asked Questions',
  faqs: [
    { question: 'How do I get started?', answer: 'Simply reach out via our contact form or give us a call. We offer a free initial consultation.' },
    { question: 'What are your pricing options?', answer: 'We offer flexible packages tailored to your needs and budget. Contact us for a custom quote.' },
    { question: 'How long does a typical project take?', answer: 'Timelines vary by scope, but most projects are completed within 2–8 weeks.' },
    { question: 'Do you offer ongoing support?', answer: 'Yes! We provide continued support and maintenance to ensure long-term success.' },
  ],
  teamSectionTitle: 'Meet the Team',
  blogSectionTitle: 'Latest from Our Blog',
  blogSectionSubtitle: 'Insights, tips, and updates from our team',
  blogPosts: [
    {
      title: '5 Strategies to Grow Your Business This Year',
      slug: '5-strategies-to-grow-your-business',
      excerpt: 'Practical steps you can take today to build momentum and reach more customers.',
      body: 'Growing a business takes focus, consistency, and a willingness to adapt. Start by clarifying your core offer, then double down on the channels that already bring results.\n\nReview your customer journey from first touch to repeat purchase. Small improvements at each step compound into meaningful revenue gains. Finally, invest in relationships — referrals and retention often outperform cold outreach.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      author: 'Alex Morgan',
      date: '2026-03-12',
    },
    {
      title: 'What Clients Are Asking Us Right Now',
      slug: 'what-clients-are-asking-us',
      excerpt: 'A quick roundup of the most common questions we hear — and how we answer them.',
      body: 'Every season brings a new set of priorities. Lately, clients ask about pricing transparency, faster turnaround times, and how to stand out in crowded markets.\n\nOur advice stays grounded in fundamentals: deliver exceptional value, communicate clearly, and measure what matters. When in doubt, talk to your customers — their feedback is the best roadmap.',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
      author: 'Jordan Lee',
      date: '2026-02-28',
    },
    {
      title: 'Behind the Scenes: How We Work',
      slug: 'behind-the-scenes-how-we-work',
      excerpt: 'Take a peek at our process, tools, and the principles that guide every project.',
      body: 'We believe great outcomes come from clear goals, collaborative planning, and disciplined execution. Every engagement starts with listening — understanding where you are and where you want to go.\n\nFrom there we build a tailored plan with milestones you can track. Throughout delivery we keep communication open so there are no surprises, only steady progress toward results you can measure.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      author: 'Taylor Brooks',
      date: '2026-01-15',
    },
  ],
  team: [
    { name: 'Alex Morgan', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
    { name: 'Jordan Lee', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
    { name: 'Taylor Brooks', role: 'Operations Lead', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
  ],
  ctaBannerTitle: 'Ready to get started?',
  ctaBannerText: 'Join hundreds of satisfied clients. Let us help you achieve your goals today.',
  ctaText: '',
  ctaLink: 'contact',
  ...emptyContacts,
}

export function mergeRichContent(overrides: Partial<SiteContent>): SiteContent {
  return {
    ...baseRichContent,
    ...emptyContacts,
    ...overrides,
    sectionVisibility: { ...defaultSectionVisibility, ...overrides.sectionVisibility },
    stats: overrides.stats ?? baseRichContent.stats,
    services: overrides.services ?? baseRichContent.services,
    steps: overrides.steps ?? baseRichContent.steps,
    showcaseItems: overrides.showcaseItems ?? baseRichContent.showcaseItems,
    galleryImages: overrides.galleryImages ?? baseRichContent.galleryImages,
    testimonials: overrides.testimonials ?? baseRichContent.testimonials,
    blogPosts: overrides.blogPosts ?? baseRichContent.blogPosts,
    faqs: overrides.faqs ?? baseRichContent.faqs,
    team: overrides.team ?? baseRichContent.team,
  }
}

export function enrichForTemplate(templateId: TemplateId, content: SiteContent): SiteContent {
  const cfg = showcaseConfigByTemplate[templateId]
  return {
    ...content,
    showcaseSectionTitle: content.showcaseSectionTitle || cfg.sectionTitle,
    showcaseSectionSubtitle: content.showcaseSectionSubtitle || cfg.sectionSubtitle,
    showcaseItems: content.showcaseItems?.some((i) => i.title)
      ? content.showcaseItems
      : defaultShowcaseByTemplate[templateId],
    sectionVisibility: content.sectionVisibility ?? defaultSectionVisibility,
  }
}