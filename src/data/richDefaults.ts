import type { SiteContent } from '../types'
import { emptyContacts } from './contacts'

export const baseRichContent: SiteContent = {
  businessName: '',
  tagline: '',
  heroSubtext: '',
  heroImage: '',
  aboutTitle: 'About Us',
  about: '',
  aboutImage: '',
  missionStatement: '',
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
  gallerySectionTitle: 'Our Work',
  galleryImages: ['', '', ''],
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
  team: [
    { name: 'Alex Morgan', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
    { name: 'Jordan Lee', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
    { name: 'Taylor Brooks', role: 'Operations Lead', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
  ],
  ctaBannerTitle: 'Ready to get started?',
  ctaBannerText: 'Join hundreds of satisfied clients. Let us help you achieve your goals today.',
  ctaText: '',
  ctaLink: '#contact',
  ...emptyContacts,
}

export function mergeRichContent(overrides: Partial<SiteContent>): SiteContent {
  return {
    ...baseRichContent,
    ...overrides,
    stats: overrides.stats ?? baseRichContent.stats,
    services: overrides.services ?? baseRichContent.services,
    steps: overrides.steps ?? baseRichContent.steps,
    galleryImages: overrides.galleryImages ?? baseRichContent.galleryImages,
    testimonials: overrides.testimonials ?? baseRichContent.testimonials,
    faqs: overrides.faqs ?? baseRichContent.faqs,
    team: overrides.team ?? baseRichContent.team,
    ...emptyContacts,
    ...overrides,
  }
}