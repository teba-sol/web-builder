import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SiteContent } from '../../types';
import { CloneCtaSection, CloneMap, CloneNav, ClonePricingSection, CloneTeamSection } from './CloneChrome';
import { buildCloneHomeData } from './cloneHomeData';
import {
  Shield,
  DollarSign,
  Award,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  Calendar,
   Send,
  X,
} from 'lucide-react';

export function Template1({ c, basePath }: { c: SiteContent; basePath: string }) {
  const d = buildCloneHomeData(c, basePath, 'taxfighters')
  // Mobile Navigation Menu State

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: 'Refund Advance ($1,500 - $7,500)',
    smsConsent: true
  });

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Handlers
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.firstName || !bookingForm.phone) return;
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setIsBookingModalOpen(false);
      setBookingForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        serviceType: 'Refund Advance ($1,500 - $7,500)',
        smsConsent: true
      });
    }, 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const faqs = d.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
  const reviews = d.testimonials.map((item) => ({
    name: item.author,
    date: item.role,
    rating: 5,
    comment: item.quote,
  }))

  return (
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-rose-900 selection:text-slate-900 relative">
      <CloneNav templateId="taxfighters" d={d} onBook={() => setIsBookingModalOpen(true)} />
      {/* HERO SECTION */}
      <section id="hero" className="relative z-0 isolate py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={c.heroImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=2000&q=80'}
            alt=""
            className="w-full h-full object-cover opacity-15 filter contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider border border-rose-200/60 shadow-sm" style={{ backgroundColor: 'var(--clone-highlight)' }}>
              <Award className="w-4 h-4 text-white" /> Authorized IRS e-File Provider
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
              {c.tagline}
            </h1>

            <p className="text-slate-700 text-base sm:text-lg max-w-2xl leading-relaxed">
              {c.heroSubtext}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-8 py-4 rounded-xl text-white font-extrabold text-base shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                {c.ctaText || 'Pre-Qualify Now'} <ArrowRight className="w-5 h-5 text-amber-300" />
              </button>

              <Link
                to={d.hrefs.about}
                className="px-7 py-4 rounded-xl bg-slate-100 border border-slate-400/80 hover:border-slate-500 text-slate-800 font-bold text-base transition-all flex items-center gap-2"
              >
                Learn More
              </Link>
            </div>

            {d.show.stats && d.stats.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-300">
              {d.stats.slice(0, 3).map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {stat.value} {stat.label}
              </div>
              ))}
            </div>
            )}

          </div>

          {/* Side Fast Pre-Qualify Booking Form */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-100/90 border border-slate-300 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-900/20 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-rose-600 bg-rose-100 border border-rose-200">
                  Instant Calculation
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">Apply For Refund Advance</h3>
                <p className="text-xs text-slate-600 mt-1">Takes under 60 seconds to pre-qualify online.</p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={bookingForm.firstName}
                      onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={bookingForm.lastName}
                      onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={bookingForm.smsConsent}
                    onChange={(e) => setBookingForm({ ...bookingForm, smsConsent: e.target.checked })}
                    className="mt-1 rounded bg-slate-50 border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-600 leading-tight">
                    I agree to receive SMS status updates regarding my tax return and refund advance approval.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-extrabold text-sm shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--clone-accent)' }}
                >
                  <DollarSign className="w-4 h-4 text-amber-300" /> Check My Refund Advance Amount
                </button>
              </form>

              {bookingSubmitted && (
                <div className="p-3 bg-rose-100 border border-rose-600 rounded-xl text-rose-700 text-xs font-semibold text-center">
                  ✅ Application Received! A Senior Tax Advisor will contact you within 15 minutes.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {d.show.stats && d.stats.length > 0 && (
      <section className="py-12 bg-slate-100/60 border-y border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {d.stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-slate-50/60 border border-slate-300">
              <div className="text-4xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-sm font-semibold text-rose-600 mt-1">{stat.label}</div>
            </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {d.show.about && (
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-300">
              {c.aboutImage ? (
              <img
                src={c.aboutImage}
                alt=""
                className="w-full h-[640px] object-cover"
              />
              ) : null}
            </div>
            
            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-slate-100 border border-slate-300 p-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-300 flex-shrink-0" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">100% Guaranteed</div>
                <div className="text-xs text-slate-600">Maximum Tax Refund Guarantee</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Who We Are</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {c.aboutTitle}
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {c.about}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>No Out-Of-Pocket Fees:</strong> All preparation fees are conveniently deducted from your tax return.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>Fast Same-Day Advance:</strong> Get approved for up to $7,500 within hours of filing.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span><strong>$50 Referral Rewards:</strong> Earn unlimited cash rewards for every friend you refer.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl flex items-center gap-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Schedule Appointment <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>

        </div>
      </section>
      )}

      {d.show.services && (
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Our Expertise</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {c.servicesSectionTitle}
            </h2>
            <p className="text-slate-700 text-sm">
              {c.servicesSectionSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {d.services.slice(0, 3).map((service) => (
            <div key={service.title} className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-rose-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <DollarSign className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">
                {service.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {service.description}
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-rose-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* WHAT IS REFUND ADVANCE EXPLANATION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-7xl mx-auto bg-slate-100 border border-slate-300 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Financial Transparency</div>
          <h2 className="text-3xl font-extrabold text-slate-900">What Is A Tax Preparation Refund Advance?</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            A refund advance is a short-term loan issued prior to the IRS disbursing your official tax refund check or direct deposit. Instead of waiting 3 to 4 weeks for federal processing, approved clients receive their funds in as little as 24 hours.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
              <strong className="text-slate-900 block mb-1 text-sm">✓ No Impact On Credit Score</strong>
              Pre-qualifying for a refund advance does not hurt your personal credit rating.
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
              <strong className="text-slate-900 block mb-1 text-sm">✓ Automatic Repayment</strong>
              Once the IRS releases your tax refund, the loan balance is automatically settled with zero stress.
            </div>
          </div>
        </div>
      </section>

      {d.show.steps && d.steps.length > 0 && (
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{c.stepsSectionTitle || 'How It Works'}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {d.steps.slice(0, 4).map((step, index) => (
            <div key={step.title} className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {d.show.testimonials && reviews.length > 0 && (
      <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Testimonials</div>
            <h2 className="text-3xl font-extrabold text-slate-900">{c.testimonialsSectionTitle || 'What Our Clients Say'}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">"{r.comment}"</p>
                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{r.name}</span>
                  <span className="text-slate-500">{r.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      <ClonePricingSection d={d} onBook={() => setIsBookingModalOpen(true)} />
      <CloneTeamSection d={d} />

      {d.show.faq && faqs.length > 0 && (
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Got Questions?</div>
            <h2 className="text-3xl font-extrabold text-slate-900">{c.faqSectionTitle || 'Frequently Asked Questions'}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 text-base flex justify-between items-center hover:text-rose-600 transition"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-rose-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-700 leading-relaxed border-t border-slate-300/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      <CloneCtaSection d={d} onBook={() => setIsBookingModalOpen(true)} />

      {d.show.contact && (
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/80 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Connect With Us</div>
            <h2 className="text-3xl font-extrabold text-slate-900">{c.contactSectionTitle || 'Visit Our Tax Office Or Message Us'}</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <MapPin className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Headquarters Address</h4>
                  <p className="text-xs text-slate-600 mt-1">{c.address}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Phone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-slate-600 mt-1">{c.phone}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Mail className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Support</h4>
                  <p className="text-xs text-slate-600 mt-1">{c.email}</p>
                </div>
              </div>
              <CloneMap d={d} className="h-56 overflow-hidden rounded-2xl border border-slate-300" />
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-7 bg-slate-50 p-8 rounded-3xl border border-slate-300 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">{c.contactFormTitle || 'Send A Direct Message'}</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can our tax experts assist you today?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl flex items-center gap-2"
                  style={{ backgroundColor: 'var(--clone-accent)' }}
                >
                  <Send className="w-4 h-4 text-amber-300" /> Send Inquiry
                </button>
              </form>

              {contactSubmitted && (
                <div className="p-3 bg-rose-100 border border-rose-600 rounded-xl text-rose-700 text-xs font-semibold text-center">
                  Message sent successfully! Our tax team will call you back shortly.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>
      )}

      <footer className="bg-slate-50 border-t border-slate-300 text-slate-600 text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-slate-900">
              <Shield className="w-5 h-5 text-rose-500" /> {c.businessName}
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              {c.missionStatement || c.heroSubtext}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 uppercase tracking-wider text-slate-900">Pages</h4>
            <ul className="space-y-2">
              {d.navItems.filter((item) => item.page !== 'home').map((item) => (
                <li key={item.page}><Link to={item.to} className="hover:text-rose-600">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 uppercase tracking-wider text-slate-900">Office Hours</h4>
            <ul className="space-y-2">
              <li>{c.hours}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Legal Disclaimer</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Refund advances are short-term loans provided by partner financial institutions upon IRS return filing acceptance. Terms and conditions apply.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-900 text-center text-slate-500">
          © {new Date().getFullYear()} {c.businessName}. All rights reserved.
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-slate-100 border border-slate-300 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-4">
            
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" /> Book Tax Appointment
              </h3>
              <p className="text-xs text-slate-600">Select your details to reserve your tax prep session.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={bookingForm.lastName}
                  onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Required</label>
                <select
                  value={bookingForm.serviceType}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="Refund Advance ($1,500 - $7,500)">Refund Advance ($1,500 - $7,500)</option>
                  <option value="Individual Income Tax Preparation">Individual Income Tax Preparation</option>
                  <option value="Business Tax Filing & Audit Defense">Business Tax Filing & Audit Defense</option>
                  <option value="Referral Program Registration">Referral Program Registration ($50 Bonus)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-lg mt-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Confirm Appointment Booking
              </button>
            </form>

            {bookingSubmitted && (
              <div className="p-3 bg-rose-100 border border-rose-600 rounded-xl text-rose-700 text-xs font-semibold text-center">
                Appointment booked! Check your SMS for confirmation.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
