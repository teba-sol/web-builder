import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SiteContent } from '../../types';
import { CloneCtaSection, CloneNav, ClonePricingSection, CloneTeamSection } from './CloneChrome';
import { buildCloneHomeData } from './cloneHomeData';
import {
  Shield,
  DollarSign,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUpRight,
  Star,
  Calendar,
  Send,
  X,
  Briefcase,
  Gift,
  FileCheck2,
  Users,
} from 'lucide-react';

export function Template4({ c, basePath }: { c: SiteContent; basePath: string }) {
  const d = buildCloneHomeData(c, basePath, 'cpa')
  // Mobile Navigation Menu State

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: 'Individual Tax Filing',
    newsletterConsent: true
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
        serviceType: 'Individual Tax Filing',
        newsletterConsent: true
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

  // Nav Dropdowns Data
  const faqs = d.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
  const reviews = d.testimonials.map((item) => ({
    name: item.author,
    date: item.role,
    rating: 5,
    comment: item.quote,
  }))

  const galleryPhotos = [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-[var(--clone-accent)] selection:text-[var(--clone-ink)] relative">

      <CloneNav templateId="cpa" d={d} onBook={() => setIsBookingModalOpen(true)} />
{/* HERO */}
      <section id="hero" className="relative z-0 isolate text-white font-sans w-full overflow-hidden" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl" style={{ backgroundColor: 'var(--clone-accent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">

          {/* Left copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full pl-2 pr-4 py-1.5 mb-6">
              <span className="flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}>
                4.9 <Star className="w-3 h-3 fill-[var(--clone-ink)]" />
              </span>
              <span className="text-xs font-semibold text-[#DDEBD0]">A+ BBB Rated &middot; 5,000+ Returns Filed</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] tracking-tight mb-6">
              {c.tagline}
            </h1>

            <p className="text-[15px] text-[#C7D6C9] font-medium max-w-md mb-8 leading-relaxed">
              {c.heroSubtext}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="pl-6 pr-2 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-3 hover:brightness-105 transition"
                style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}
              >
                Book Appointment
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--clone-ink)' }}>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </span>
              </button>

              <a href="tel:+18005558299" className="flex items-center gap-3 group">
                <span className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 group-hover:border-[var(--clone-accent)] transition" style={{ backgroundColor: 'var(--clone-ink)' }}>
                  <Phone className="w-4 h-4" style={{ color: 'var(--clone-accent)' }} />
                </span>
                <span className="text-xs">
                  <div className="text-[#8FA396] font-medium">Call Us Now</div>
                  <div className="font-bold text-white">+1 (800) 555-8299</div>
                </span>
              </a>
            </div>
          </div>

          {/* Right image collage */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
                alt="Tax advisors reviewing documents with a client"
                className="w-full h-[420px] object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white text-[var(--clone-ink)] rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-[220px]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--clone-ink)' }}>
                <FileCheck2 className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} />
              </div>
              <div>
                <div className="text-sm font-black leading-none">$500-$7.5K</div>
                <div className="text-[10px] text-[#6B7A70] mt-1">Refund advance, 24hrs</div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -top-6 -right-4 rounded-2xl shadow-2xl px-4 py-3 items-center gap-2" style={{ backgroundColor: 'var(--clone-accent)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--clone-ink)' }} />
              <span className="text-xs font-black" style={{ color: 'var(--clone-ink)' }}>5,000+ Happy Clients</span>
            </div>
          </div>

        </div>
      </section>

      {d.show.stats && d.stats.length > 0 && (
      <section className="py-10 border-b border-[#E4E0D4]" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {d.stats.slice(0, 4).map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: 'var(--clone-accent)' }}>{stat.label}</div>
            </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ESSENTIAL FEATURES SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>
                <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Our Approach
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--clone-ink)] leading-tight max-w-md">
                Essential services for total financial confidence
              </h2>
            </div>
            <p className="text-[#6B7A70] text-sm max-w-md lg:justify-self-end">
              We combine certified tax expertise with fast, transparent service so individuals and businesses never overpay or miss a deadline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1 - white */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] space-y-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent-soft)' }}>
                <Briefcase className="w-6 h-6" style={{ color: 'var(--clone-ink)' }} />
              </div>
              <h3 className="text-lg font-bold text-[var(--clone-ink)]">Individual Tax Filing</h3>
              <p className="text-xs text-[#6B7A70] leading-relaxed">
                Fast, accurate e-filing with a maximum-refund review on every return we prepare.
              </p>
              <button onClick={() => setIsBookingModalOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--clone-ink)] pt-1 hover:underline">
                Explore More <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2 - lime */}
            <div className="p-8 rounded-3xl space-y-5 relative overflow-hidden" style={{ backgroundColor: 'var(--clone-accent)' }}>
              <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/20" />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative" style={{ backgroundColor: 'var(--clone-ink)' }}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--clone-ink)] relative">Refund Advance Loans</h3>
              <p className="text-xs text-[#1F3A2E] leading-relaxed relative">
                Access $500 to $7,500 of your refund the same day you file, deposited directly.
              </p>
              <button onClick={() => setIsBookingModalOpen(true)} className="relative inline-flex items-center gap-1.5 text-xs font-bold text-[var(--clone-ink)] pt-1 hover:underline">
                Explore More <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3 - dark */}
            <div className="p-8 rounded-3xl space-y-5" style={{ backgroundColor: 'var(--clone-ink)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-6 h-6" style={{ color: 'var(--clone-ink)' }} />
              </div>
              <h3 className="text-lg font-bold text-white">IRS Audit Defense</h3>
              <p className="text-xs text-[#B9C9BC] leading-relaxed">
                Full representation and penalty abatement support if the IRS ever comes calling.
              </p>
              <button onClick={() => setIsBookingModalOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold pt-1 hover:underline" style={{ color: 'var(--clone-accent)' }}>
                Explore More <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className={`${!(d.show.about) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">

          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-3xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80"
                  alt="Advisors reviewing a client's tax return"
                  className="w-full h-[340px] object-cover"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-4">
                <div className="rounded-3xl p-5 flex-1 flex flex-col justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <CheckCircle2 className="w-6 h-6 mb-2" style={{ color: 'var(--clone-ink)' }} />
                  <div className="text-2xl font-black" style={{ color: 'var(--clone-ink)' }}>10K+</div>
                  <div className="text-[11px] font-semibold" style={{ color: '#1F3A2E' }}>Returns Completed</div>
                </div>
                <div className="rounded-3xl overflow-hidden flex-1">
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80"
                    alt="Client meeting with a tax advisor"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-[#E4E0D4] p-4 flex items-center gap-3">
                <div className="flex items-center gap-0.5" style={{ color: 'var(--clone-accent)' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5" style={{ fill: 'var(--clone-accent)' }} />)}
                </div>
                <div className="text-xs">
                  <div className="font-black text-[var(--clone-ink)]">4.9/5.0</div>
                  <div className="text-[#6B7A70]">Avg. client rating</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E4E0D4] p-4">
                <div className="text-[10px] font-bold text-[var(--clone-ink)] uppercase tracking-wider mb-2">Premium Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Tax Prep', 'Advisory', 'Audit Defense', 'Payroll'].map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--clone-accent-soft)', color: 'var(--clone-ink)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 lg:pt-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Who We Are
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--clone-ink)] leading-tight">
              Comprehensive tax solutions built around your finances
            </h2>

            <p className="text-[#4A554D] text-sm sm:text-base leading-relaxed">
              TaxGuardians was founded to make professional tax help fast, transparent, and genuinely useful, whether you're filing a simple return or navigating a multi-entity business.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-[#4A554D]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[var(--clone-ink)]">Certified Preparers:</strong> Every return is reviewed by an enrolled agent or CPA before filing.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#4A554D]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[var(--clone-ink)]">Transparent Pricing:</strong> No hidden fees — costs are deducted directly from your refund.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#4A554D]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[var(--clone-ink)]">Year-Round Support:</strong> We're here for audits and questions long after tax season ends.</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="pl-6 pr-2 py-2.5 rounded-full font-bold text-sm shadow-lg hover:brightness-105 transition flex items-center gap-3"
                style={{ backgroundColor: 'var(--clone-ink)', color: 'white' }}
              >
                Schedule Appointment
                <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--clone-ink)' }} />
                </span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* OUR SERVICES SECTION */}
      <section id="services" className={`${!(d.show.services) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest justify-center" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Our Expertise <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--clone-ink)]">
              Comprehensive Tax Services
            </h2>
            <p className="text-[#6B7A70] text-sm">
              From individual income tax filing to high-dollar refund advances and business audit defense.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Service 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] hover:border-[var(--clone-accent)] hover:shadow-xl hover:shadow-black/5 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--clone-ink)' }}>
                <DollarSign className="w-7 h-7" style={{ color: 'var(--clone-accent)' }} />
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">
                Refund Advance & E-Filing
              </h3>
              <p className="text-[#6B7A70] text-sm leading-relaxed">
                Fast e-filing with refund advance options from $500 up to $7,500 deposited directly to your bank account.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-ink)' }}
              >
                Apply For Advance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] hover:border-[var(--clone-accent)] hover:shadow-xl hover:shadow-black/5 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Gift className="w-7 h-7" style={{ color: 'var(--clone-ink)' }} />
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">
                Referral Bonus Program
              </h3>
              <p className="text-[#6B7A70] text-sm leading-relaxed">
                Refer friends, family, or colleagues and receive $50 cash per completed client filing with zero payout limits!
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-ink)' }}
              >
                Join Referral Program <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] hover:border-[var(--clone-accent)] hover:shadow-xl hover:shadow-black/5 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--clone-ink)' }}>
                <Briefcase className="w-7 h-7" style={{ color: 'var(--clone-accent)' }} />
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">
                Business Tax & Audit Defense
              </h3>
              <p className="text-[#6B7A70] text-sm leading-relaxed">
                Dedicated business accounting, LLC filing, payroll tax optimization, and 100% IRS audit defense coverage.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-ink)' }}
              >
                Business Tax Consult <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* PHOTO GALLERY SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>
                <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Inside Our Office
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-md">A firm built for real conversations, not just returns</h2>
            </div>
            <p className="text-[#B9C9BC] text-sm max-w-sm">
              Step inside our workspace, meet the advisors, and see where thousands of returns get filed every season.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryPhotos.map((src, idx) => (
              <div key={idx} className={`rounded-2xl overflow-hidden group ${idx === 0 ? 'row-span-2 h-full' : 'h-48 md:h-56'}`}>
                <img
                  src={src}
                  alt="Inside the TaxGuardians office"
                  className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PROCESS SECTION */}
      <section id="process" className={`${!(d.show.steps) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto space-y-16">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest justify-center" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Simple 3-Step Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--clone-ink)]">Our Filing Process</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}>
                1
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">Book & Upload Docs</h3>
              <p className="text-xs text-[#6B7A70] leading-relaxed">
                Schedule a slot online and securely upload your ID, W-2s, and 1099s ahead of time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}>
                2
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">Review & Sign</h3>
              <p className="text-xs text-[#6B7A70] leading-relaxed">
                A certified preparer walks you through every deduction before your return is filed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E4E0D4] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}>
                3
              </div>
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">Get Your Refund</h3>
              <p className="text-xs text-[#6B7A70] leading-relaxed">
                Choose a refund advance within 24 hours, or wait for your standard IRS deposit.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CLIENT REVIEWS SECTION */}
      <section id="reviews" className={`${!(d.show.testimonials) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest justify-center" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Testimonials
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--clone-ink)]">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E4E0D4] space-y-4">
                <div className="flex items-center gap-1" style={{ color: 'var(--clone-accent)' }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ fill: 'var(--clone-accent)' }} />
                  ))}
                </div>
                <p className="text-xs text-[#4A554D] leading-relaxed">"{r.comment}"</p>
                <div className="pt-2 border-t border-[#E4E0D4] flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--clone-ink)]">{r.name}</span>
                  <span className="text-[#9AA79C]">{r.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <ClonePricingSection d={d} onBook={() => setIsBookingModalOpen(true)} />
      <CloneTeamSection d={d} />

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className={`${!(d.show.faq) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest justify-center" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Got Questions?
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--clone-ink)]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#E4E0D4] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-[var(--clone-ink)] text-base flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4" style={{ backgroundColor: openFaqIndex === idx ? 'var(--clone-accent)' : 'var(--clone-surface-alt)' }}>
                    {openFaqIndex === idx ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--clone-ink)' }} /> : <ChevronDown className="w-4 h-4 text-[#6B7A70]" />}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-[#4A554D] leading-relaxed border-t border-[#E4E0D4] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      <CloneCtaSection d={d} onBook={() => setIsBookingModalOpen(true)} />

      {/* CONTACT SECTION */}
      <section id="contact" className={`${!(d.show.contact) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: 'var(--clone-surface-alt)' }}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest justify-center" style={{ color: 'var(--clone-accent)' }}>
              <span className="w-4 h-px" style={{ backgroundColor: 'var(--clone-accent)' }} /> Connect With Us
            </div>
            <h2 className="text-3xl font-extrabold text-[var(--clone-ink)]">Visit Our Office Or Message Us</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#E4E0D4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--clone-ink)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--clone-ink)] text-sm">Headquarters Address</h4>
                  <p className="text-xs text-[#6B7A70] mt-1">100 Financial Way, Suite 300, New York, NY</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E4E0D4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--clone-ink)' }}>
                  <Phone className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--clone-ink)] text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-[#6B7A70] mt-1">Call: (800) 555-8299</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E4E0D4] flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--clone-ink)' }}>
                  <Mail className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--clone-ink)] text-sm">Email Support</h4>
                  <p className="text-xs text-[#6B7A70] mt-1">support@taxguardians.com</p>
                </div>
              </div>

              {/* Google Map */}
              <div className="rounded-2xl overflow-hidden border border-[#E4E0D4] h-56">
                <iframe
                  title="TaxGuardians office location"
                  src="https://www.google.com/maps?q=100+Financial+Way,New+York,NY&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#E4E0D4] space-y-6">
              <h3 className="text-xl font-bold text-[var(--clone-ink)]">Send A Direct Message</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A554D] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-xl py-3 px-4 text-sm text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A554D] mb-1">Your Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-xl py-3 px-4 text-sm text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A554D] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-xl py-3 px-4 text-sm text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A554D] mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can our tax experts assist you today?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-xl py-3 px-4 text-sm text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="pl-6 pr-2 py-2.5 rounded-full font-bold text-sm shadow-lg hover:brightness-105 transition flex items-center gap-3"
                  style={{ backgroundColor: 'var(--clone-ink)', color: 'white' }}
                >
                  Send Inquiry
                  <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                    <Send className="w-4 h-4" style={{ color: 'var(--clone-ink)' }} />
                  </span>
                </button>
              </form>

              {contactSubmitted && (
                <div className="p-3 rounded-xl text-xs font-semibold text-center" style={{ backgroundColor: 'var(--clone-accent-soft)', border: '1px solid var(--clone-accent)', color: 'var(--clone-ink)' }}>
                  Message sent successfully! Our tax team will call you back shortly.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-[#B9C9BC] text-xs pt-16 pb-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--clone-ink)' }} />
              </div>
              <span className="text-white font-black text-base">TaxGuardians</span>
            </div>
            <p className="text-[#7E9084] text-xs leading-relaxed">
              A full-service tax and accounting firm helping individuals and businesses file with confidence, all year round.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs font-bold text-white">
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[var(--clone-accent)] hover:text-[var(--clone-ink)] transition">FB</a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[var(--clone-accent)] hover:text-[var(--clone-ink)] transition">X</a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[var(--clone-accent)] hover:text-[var(--clone-ink)] transition">IG</a>
              <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[var(--clone-accent)] hover:text-[var(--clone-ink)] transition">IN</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Services</h4>
            <ul className="space-y-2.5">
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Individual Tax Prep</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Refund Advance Loans</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">$50 Referral Bonus</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Business Tax & IRS Audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Office Hours</h4>
            <ul className="space-y-2.5">
              <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
              <li className="font-semibold pt-1" style={{ color: 'var(--clone-accent)' }}>24/7 Online Application Active</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">Legal Disclaimer</h4>
            <p className="text-[11px] text-[#7E9084] leading-relaxed">
              Refund advances are short-term loans provided by partner financial institutions upon IRS return filing acceptance. Terms and conditions apply.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-[#7E9084]">
          © {new Date().getFullYear()} TaxGuardians LLC. All rights reserved.
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F211C]/70 backdrop-blur-sm">
          <div className="bg-[var(--clone-surface)] border border-[#E4E0D4] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-4">

            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white text-[#6B7A70] hover:text-[var(--clone-ink)] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[var(--clone-ink)] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Calendar className="w-4 h-4" style={{ color: 'var(--clone-ink)' }} />
                </span>
                Book Strategy Call
              </h3>
              <p className="text-xs text-[#6B7A70]">Select your details to schedule a free tax consultation.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A554D] mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  className="w-full bg-white border border-[#E4E0D4] rounded-xl py-2.5 px-3.5 text-xs text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A554D] mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={bookingForm.lastName}
                  onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                  className="w-full bg-white border border-[#E4E0D4] rounded-xl py-2.5 px-3.5 text-xs text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A554D] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full bg-white border border-[#E4E0D4] rounded-xl py-2.5 px-3.5 text-xs text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A554D] mb-1">Service Required</label>
                <select
                  value={bookingForm.serviceType}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  className="w-full bg-white border border-[#E4E0D4] rounded-xl py-2.5 px-3.5 text-xs text-[var(--clone-ink)] focus:outline-none focus:border-[var(--clone-highlight)] focus:ring-2 focus:ring-[var(--clone-accent)]/30 transition"
                >
                  <option value="Individual Tax Filing">Individual Tax Filing</option>
                  <option value="Business Tax Prep">Business Tax Prep</option>
                  <option value="Refund Advance Loan">Refund Advance Loan</option>
                  <option value="IRS Audit Defense">IRS Audit Defense</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full font-bold text-xs shadow-lg mt-2 transition hover:brightness-105"
                style={{ backgroundColor: 'var(--clone-accent)', color: 'var(--clone-ink)' }}
              >
                Confirm Consultation
              </button>
            </form>

            {bookingSubmitted && (
              <div className="p-3 rounded-xl text-xs font-semibold text-center" style={{ backgroundColor: 'var(--clone-accent-soft)', border: '1px solid var(--clone-accent)', color: 'var(--clone-ink)' }}>
                Consultation booked! Check your email for calendar invite.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}