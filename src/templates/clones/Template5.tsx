import { useState } from 'react';
import type { SiteContent } from '../../types';
import { CloneNav, ClonePricingSection } from './CloneChrome';
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
  Star,
  Calendar,
  Send,
  X,
  Briefcase,
  Gift,
  FileCheck2,
  Target,
  Award,
  TrendingUp,
  Headphones,
  Play,
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa'

/* ─── Color Palette ─── */
const C = {
  primary: 'var(--clone-accent)',
  primaryDark: 'var(--clone-ink)',
  primaryDeep: 'var(--clone-ink)',
  accent: 'var(--clone-highlight)',
  accentLight: 'var(--clone-highlight)',
  accentSoft: 'var(--clone-accent-soft)',
  surface: 'var(--clone-surface)',
  surfaceAlt: 'var(--clone-surface-alt)',
  white: '#FFFFFF',
  text: 'var(--clone-ink)',
  textMuted: '#546E8A',
  textLight: '#8BA3BF',
  border: '#D6E4F0',
  borderLight: '#E8EFF7',
  gold: '#F59E0B',
};

export function Template5({ c, basePath }: { c: SiteContent; basePath: string }) {
  const d = buildCloneHomeData(c, basePath, 'axiom')
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    serviceType: 'Individual Tax Filing', newsletterConsent: true,
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.firstName || !bookingForm.phone) return;
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setIsBookingModalOpen(false);
      setBookingForm({ firstName: '', lastName: '', phone: '', email: '', serviceType: 'Individual Tax Filing', newsletterConsent: true });
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

  /* ─── Data ─── */
  const faqs = d.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
  const reviews = d.testimonials.map((item, i) => ({
    name: item.author,
    date: item.role,
    role: item.role,
    rating: 5,
    comment: item.quote,
    img: c.galleryImages[i] || c.aboutImage || c.heroImage,
  }))

  const teamMembers = d.team.map((member) => ({
    name: member.name,
    role: member.role,
    img: member.image,
  }))

  const industries = [
    { name: 'Small Business', img: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=400&q=80', desc: 'Bookkeeping, payroll, and quarterly tax filings' },
    { name: 'Real Estate', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', desc: 'Depreciation, 1031 exchanges, rental income' },
    { name: 'Freelancers', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', desc: '1099 income, deductions, and estimated tax' },
    { name: 'Corporations', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', desc: 'Multi-entity tax strategy and compliance' },
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-blue-400 selection:text-white relative" style={{ backgroundColor: C.surface, color: C.text }}>

      {/* ──── CSS ANIMATIONS ──── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .t5 { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes t5FadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes t5Float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes t5Pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes t5Slide { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .t5-fu { animation: t5FadeUp .7s ease both; }
        .t5-fu1 { animation: t5FadeUp .7s ease .1s both; }
        .t5-fu2 { animation: t5FadeUp .7s ease .2s both; }
        .t5-fu3 { animation: t5FadeUp .7s ease .3s both; }
        .t5-float { animation: t5Float 5s ease-in-out infinite; }
        .t5-pulse { animation: t5Pulse 2s ease-in-out infinite; }
        .t5-card { transition: all .35s cubic-bezier(.23,1,.32,1); }
        .t5-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px -12px rgba(11,79,138,.18); }
        .t5-hero-overlay {
          background: linear-gradient(135deg, rgba(6,31,58,.92) 0%, rgba(11,79,138,.82) 50%, rgba(6,31,58,.90) 100%);
        }
        .t5-process-line {
          position: absolute; top: 40px; left: 12.5%; right: 12.5%; height: 2px;
          background: repeating-linear-gradient(90deg, ${C.accent} 0, ${C.accent} 8px, transparent 8px, transparent 16px);
        }
      `}</style>

      <CloneNav templateId="axiom" d={d} onBook={() => setIsBookingModalOpen(true)} />

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Full-width image with dark overlay (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="t5 relative z-0 isolate w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=80"
            alt="Financial documents and calculator"
            className="w-full h-full object-cover"
          />
          <div className="t5-hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 pb-28 lg:pb-32">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.25em] mb-4 t5-fu" style={{ color: C.accentLight }}>
              Smart Tax Filing, Stronger Finances
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6 t5-fu1">
              {c.tagline}
            </h1>

            <p className="text-base text-blue-100/80 font-medium max-w-lg mb-8 leading-relaxed t5-fu2">
              {c.heroSubtext}
            </p>

            <div className="flex flex-wrap items-center gap-4 t5-fu3">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-7 py-3.5 rounded-lg font-bold text-sm shadow-xl hover:shadow-blue-500/30 active:scale-95 transition-all text-white"
                style={{ backgroundColor: C.accent }}
              >
                Get A Free Quote
              </button>

              <button className="flex items-center gap-3 group">
                <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/20 group-hover:bg-white/20 transition">
                  <Play className="w-5 h-5 text-white fill-white" />
                </span>
                <span className="text-sm font-semibold text-white">Watch Our Story</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {d.show.stats && d.stats.length > 0 && (
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-2xl shadow-black/8 p-6 border" style={{ borderColor: C.borderLight }}>
          {d.stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="p-2 text-center">
              <div className="text-2xl font-black" style={{ color: C.primary }}>{stat.value}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: C.textMuted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ABOUT SECTION — Image collage + content (unique layout)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="about" className={`${!(d.show.about) ? 'hidden ' : ''}t5 pt-16 pb-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Image collage with floating badge */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80" alt="Team reviewing tax documents" className="w-full h-[380px] object-cover" />
              </div>
              <div className="col-span-2 flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden shadow-lg flex-1">
                  <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80" alt="Client consultation" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg flex-1">
                  <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=600&q=80" alt="Office workspace" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Floating stat badge */}
            <div className="t5-float absolute -bottom-6 right-8 bg-white rounded-2xl shadow-2xl shadow-blue-950/15 px-5 py-4 flex items-center gap-3 border" style={{ borderColor: C.borderLight }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color: C.primary }}>98%</div>
                <div className="text-[11px] font-semibold" style={{ color: C.textMuted }}>Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>
              ✦ About Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: C.text }}>
              Tax Solutions{' '}
              <span className="italic" style={{ color: C.primary }}>Built Around</span> You
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
              At Axiom Audit, we simplify complex tax situations with smart technology, expert support, and a commitment to excellence. We're here to protect your finances year-round.
            </p>

            <div className="space-y-2.5 pt-1">
              {['Certified Preparers & Enrolled Agents', 'Transparent Pricing — No Hidden Fees', 'Year-Round Audit & IRS Support', 'Fast Refund Advances Up To $7,500'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: C.text }}>
                  <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" style={{ color: C.accent }} />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="mt-3 px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all text-white"
              style={{ backgroundColor: C.primary }}
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════════
          SERVICES — 4-column icon grid (NavikX-style)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="services" className={`${!(d.show.services) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Our Services</div>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: C.text }}>
              Comprehensive Tax{' '}
              <span className="italic" style={{ color: C.primary }}>Services</span> Tailored to You
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <DollarSign className="w-7 h-7" />, title: 'Refund Advances', desc: 'Access $500 to $7,500 deposited directly to your account.' },
              { icon: <Briefcase className="w-7 h-7" />, title: 'Business Tax Prep', desc: 'LLC, S-Corp, partnership filing and compliance.' },
              { icon: <Shield className="w-7 h-7" />, title: 'IRS Audit Defense', desc: 'Full representation and penalty abatement support.' },
              { icon: <Gift className="w-7 h-7" />, title: 'Referral Bonuses', desc: '$50 cash per referred client with zero limits.' },
            ].map((s, i) => (
              <div key={i} className="t5-card text-center p-8 rounded-2xl border bg-white" style={{ borderColor: C.border }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.accentSoft, color: C.primary }}>
                  {s.icon}
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: C.text }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-2.5 rounded-lg border-2 font-bold text-sm hover:bg-blue-50 transition"
              style={{ borderColor: C.primary, color: C.primary }}
            >
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA SPLIT — Request a Plan + Why Choose Us (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="t5 py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: C.surface }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left: CTA Card with image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[320px] flex items-end">
            <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80" alt="Tax consultation" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 p-8 space-y-3">
              <h3 className="text-2xl font-black text-white">Request a Custom Tax Strategy</h3>
              <p className="text-sm text-white/70">Tell us your needs, and our experts will design the right solution.</p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 py-2.5 rounded-lg font-bold text-sm text-white transition hover:brightness-110"
                style={{ backgroundColor: C.accent }}
              >
                Request a Plan
              </button>
            </div>
          </div>

          {/* Right: Why Choose Us */}
          <div className="bg-white rounded-2xl border p-8 lg:p-10 space-y-6" style={{ borderColor: C.border }}>
            <h3 className="text-2xl font-black" style={{ color: C.text }}>Why Choose Axiom Audit?</h3>
            <div className="space-y-4">
              {[
                { icon: <Award className="w-5 h-5" />, label: 'Industry Expertise' },
                { icon: <Target className="w-5 h-5" />, label: 'Advanced Technology' },
                { icon: <DollarSign className="w-5 h-5" />, label: 'Cost-Effective Solutions' },
                { icon: <Headphones className="w-5 h-5" />, label: 'Dedicated Year-Round Support' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PROCESS — 4-step horizontal with connected dashed line
      ═══════════════════════════════════════════════════════════════ */}
      <section id="process" className={`${!(d.show.steps) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Our Process</div>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: C.text }}>
              Smart Process for{' '}
              <span className="italic" style={{ color: C.primary }}>Seamless</span> Filing
            </h2>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Connecting dashed line (desktop) */}
            <div className="t5-process-line hidden lg:block" />

            {[
              { step: '01', icon: <FileCheck2 className="w-7 h-7" />, title: 'Understand Needs', desc: 'We analyze your financial requirements.' },
              { step: '02', icon: <Target className="w-7 h-7" />, title: 'Plan Solution', desc: 'We design the most efficient filing route.' },
              { step: '03', icon: <TrendingUp className="w-7 h-7" />, title: 'Execute Plan', desc: 'We manage and monitor every step.' },
              { step: '04', icon: <CheckCircle2 className="w-7 h-7" />, title: 'Deliver On Time', desc: 'We ensure safe and timely delivery of your refund.' },
            ].map((s, i) => (
              <div key={i} className="text-center space-y-4 relative">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center relative z-10 shadow-lg" style={{ backgroundColor: C.accentSoft, color: C.primary }}>
                  {s.icon}
                </div>
                <div className="text-xs font-black" style={{ color: C.accent }}>{s.step}</div>
                <h3 className="text-base font-bold" style={{ color: C.text }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIAL — Large single-card slider (NavikX-style)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className={`${!(d.show.testimonials) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.surfaceAlt }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Client Testimonials</div>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: C.text }}>
              What Our Clients{' '}
              <span className="italic" style={{ color: C.primary }}>Are Saying</span>
            </h2>
          </div>

          {reviews.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border" style={{ borderColor: C.borderLight }}>
              {/* Image */}
              <div className="md:col-span-2 h-64 md:h-auto">
                <img
                  src={reviews[activeTestimonial].img}
                  alt={reviews[activeTestimonial].name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Content */}
              <div className="md:col-span-3 p-8 lg:p-10 flex flex-col justify-center space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(reviews[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ fill: C.gold, color: C.gold }} />
                  ))}
                </div>
                <p className="text-base italic leading-relaxed" style={{ color: C.text }}>
                  "{reviews[activeTestimonial].comment}"
                </p>
                <div>
                  <div className="font-bold text-sm" style={{ color: C.text }}>— {reviews[activeTestimonial].name}</div>
                  <div className="text-xs" style={{ color: C.textMuted }}>{reviews[activeTestimonial].role}</div>
                </div>

                {/* Nav dots */}
                <div className="flex items-center gap-2 pt-2">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className="w-3 h-3 rounded-full transition-all"
                      style={{
                        backgroundColor: i === activeTestimonial ? C.accent : C.border,
                        transform: i === activeTestimonial ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          EVENTS & NEWSLETTER — Split layout (NavikX-inspired, unique)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="t5 py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Left: Upcoming Events / Tax Deadlines */}
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Upcoming Deadlines</div>
            <div className="space-y-4">
              {[
                { month: 'JAN', day: '29', title: 'IRS Begins Processing Returns', desc: 'January 29 – Filing Season Opens' },
                { month: 'APR', day: '15', title: 'Individual Tax Filing Deadline', desc: 'April 15, 2026 – Federal Deadline' },
                { month: 'JUN', day: '15', title: 'Estimated Tax Payment Due', desc: 'June 15, 2026 – Q2 Estimated Tax' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition" style={{ borderColor: C.border }}>
                  <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: C.accentSoft }}>
                    <span className="text-[10px] font-bold uppercase" style={{ color: C.accent }}>{ev.month}</span>
                    <span className="text-xl font-black" style={{ color: C.primary }}>{ev.day}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: C.text }}>{ev.title}</div>
                    <div className="text-xs" style={{ color: C.textMuted }}>{ev.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Newsletter */}
          <div className="space-y-6">
            <div className="rounded-2xl p-8 space-y-5" style={{ backgroundColor: C.primary }}>
              <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accentLight }}>Stay Updated</div>
              <h3 className="text-2xl font-black text-white">Subscribe to Our Newsletter</h3>
              <p className="text-sm text-blue-100/70">Get the latest tax updates, insights, and industry news delivered to your inbox.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition"
                />
                <button className="px-5 py-3 rounded-lg font-bold text-sm text-white transition hover:brightness-110" style={{ backgroundColor: C.accent }}>
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick contact CTA */}
            <div className="rounded-2xl border p-6 flex items-center gap-4" style={{ borderColor: C.border, backgroundColor: C.white }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.accentSoft }}>
                <Phone className="w-6 h-6" style={{ color: C.primary }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: C.text }}>Need immediate help?</div>
                <div className="text-xs" style={{ color: C.textMuted }}>Call us at <strong>(800) 555-8299</strong></div>
              </div>
              <a href="tel:+18005558299" className="px-4 py-2 rounded-lg font-bold text-xs text-white" style={{ backgroundColor: C.accent }}>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TEAM — 4-member grid with social icons (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      {d.show.team && teamMembers.length > 0 && (
      <section className="t5 py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: C.surfaceAlt }}>
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Our Experts</div>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: C.text }}>
              Meet The Experts Behind{' '}
              <span className="italic" style={{ color: C.primary }}>Our Success</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((m, i) => (
              <div key={i} className="t5-card bg-white rounded-2xl overflow-hidden border" style={{ borderColor: C.border }}>
                <div className="h-56 overflow-hidden">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 text-center space-y-2">
                  <h4 className="text-sm font-bold" style={{ color: C.text }}>{m.name}</h4>
                  <p className="text-xs" style={{ color: C.textMuted }}>{m.role}</p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a href="#" className="w-7 h-7 rounded-full flex items-center justify-center transition hover:scale-110" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                      <FaLinkedin className="w-3.5 h-3.5" />
                    </a>
                    <a href="#" className="w-7 h-7 rounded-full flex items-center justify-center transition hover:scale-110" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                      <X className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      <ClonePricingSection d={d} onBook={() => setIsBookingModalOpen(true)} />

      {/* ═══════════════════════════════════════════════════════════════
          FAQ — Side-by-side: image+CTA left, accordion right
      ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className={`${!(d.show.faq) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Left: Image + CTA */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80"
                alt="Friendly tax support team"
                className="w-full h-[320px] object-cover"
              />
            </div>
            <div className="rounded-2xl p-6 space-y-3" style={{ backgroundColor: C.accentSoft }}>
              <h4 className="text-lg font-bold" style={{ color: C.primary }}>Need Help?</h4>
              <p className="text-xs" style={{ color: C.textMuted }}>Our team is ready to assist you with any questions.</p>
              <button
                onClick={() => { const el = document.getElementById('contact'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                className="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition hover:brightness-110"
                style={{ backgroundColor: C.primary }}
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>
              Frequently Asked Questions
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border rounded-xl overflow-hidden transition-shadow hover:shadow-sm" style={{ borderColor: C.border, backgroundColor: C.white }}>
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-sm flex justify-between items-center"
                    style={{ color: C.text }}
                  >
                    <span>{faq.q}</span>
                    <span className="ml-3 flex-shrink-0">
                      {openFaqIndex === idx
                        ? <ChevronUp className="w-4 h-4" style={{ color: C.accent }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: C.textLight }} />}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 pb-4 text-xs leading-relaxed border-t pt-3" style={{ color: C.textMuted, borderColor: C.borderLight }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INDUSTRIES — Horizontal card row (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="industries" className={`${!(d.show.portfolio) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.surfaceAlt }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Latest Solutions</div>
              <h2 className="text-3xl font-black" style={{ color: C.text }}>Tailored Solutions for Every Industry</h2>
            </div>
            <button className="text-sm font-bold flex items-center gap-1 hover:underline" style={{ color: C.primary }}>
              View All Solutions <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind, i) => (
              <div key={i} className="t5-card bg-white rounded-2xl overflow-hidden border" style={{ borderColor: C.border }}>
                <div className="h-44 overflow-hidden">
                  <img src={ind.img} alt={ind.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 space-y-1.5">
                  <h4 className="text-sm font-bold" style={{ color: C.text }}>{ind.name}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{ind.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CONTACT SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section id="contact" className={`${!(d.show.contact) ? 'hidden ' : ''}t5 py-24 px-4 sm:px-6 lg:px-8`} style={{ backgroundColor: C.white }}>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Get In Touch</div>
            <h2 className="text-3xl font-extrabold" style={{ color: C.text }}>Visit Our Office Or Message Us</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              {[
                { icon: <MapPin className="w-5 h-5" />, title: 'Headquarters Address', desc: '100 Financial Way, Suite 300, New York, NY' },
                { icon: <Phone className="w-5 h-5" />, title: 'Direct Phone Line', desc: 'Call: (800) 555-8299' },
                { icon: <Mail className="w-5 h-5" />, title: 'Email Support', desc: 'support@axiomaudit.com' },
              ].map((c, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border flex items-start gap-4" style={{ borderColor: C.border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: C.primary }}>
                    {c.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: C.text }}>{c.title}</h4>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>{c.desc}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl overflow-hidden border h-56" style={{ borderColor: C.border }}>
                <iframe title="Office location" src="https://www.google.com/maps?q=100+Financial+Way,New+York,NY&output=embed" className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-8 rounded-2xl border space-y-6" style={{ borderColor: C.border }}>
              <h3 className="text-xl font-bold" style={{ color: C.text }}>Send A Direct Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>Your Name *</label>
                    <input type="text" required placeholder="John Smith" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full border rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>Your Phone *</label>
                    <input type="tel" required placeholder="(555) 000-0000" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full border rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>Email Address</label>
                  <input type="email" placeholder="john@example.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full border rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>Message</label>
                  <textarea rows={4} placeholder="How can our tax experts assist you?" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }} />
                </div>
                <button type="submit" className="px-6 py-3 rounded-lg font-bold text-sm shadow-md text-white transition hover:brightness-110" style={{ backgroundColor: C.primary }}>
                  <Send className="w-4 h-4 inline mr-2" /> Send Inquiry
                </button>
              </form>
              {contactSubmitted && (
                <div className="p-3 rounded-lg text-xs font-semibold text-center" style={{ backgroundColor: C.accentSoft, border: `1px solid ${C.accent}`, color: C.primary }}>
                  Message sent successfully! Our tax team will call you back shortly.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA BANNER — Full-width dark (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      {d.show.cta && (
      <section className="t5 py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: C.primaryDeep }}>
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Simplify Your Taxes?
          </h2>
          <p className="text-sm text-blue-200/70 max-w-lg mx-auto">
            Let's build a smarter financial future together. Get started with a free consultation today.
          </p>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-8 py-3.5 rounded-lg font-bold text-sm text-white shadow-xl hover:shadow-blue-500/30 transition hover:brightness-110"
            style={{ backgroundColor: C.accent }}
          >
            Get A Free Quote →
          </button>
        </div>
      </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER — Multi-column (NavikX-inspired)
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="t5 text-xs pt-16 pb-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: C.primaryDeep, color: '#7A9BB8' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-black text-base">Axiom Audit</span>
            </div>
            <p className="text-xs leading-relaxed">
              Empowering individuals and businesses with intelligent tax solutions that deliver results.
            </p>
          </div>

          {[
            { title: 'Quick Links', links: ['Home|#hero', 'About Us|#about', 'Services|#services', 'Solutions|#industries'] },
            { title: 'Our Services', links: ['Refund Advances|#services', 'Business Tax|#services', 'Audit Defense|#services', 'Referral Program|#services'] },
            { title: 'Resources', links: ['Blog|#faq', 'Case Studies|#', 'Webinars|#', 'FAQ|#faq'] },
            { title: 'Support', links: ['Help Center|#contact', 'Contact Us|#contact', 'Terms of Use|#', 'Privacy Policy|#'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-[11px]">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => {
                  const [label, href] = link.split('|');
                  return (
                    <li key={j}><a href={href} className="hover:text-blue-400 transition-colors">{label}</a></li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center" style={{ color: '#5B7D9C' }}>
          © {new Date().getFullYear()} Axiom Audit LLC. All rights reserved.
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════
          BOOKING MODAL
      ═══════════════════════════════════════════════════════════════ */}
      {isBookingModalOpen && (
        <div className="t5 fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="border rounded-2xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-4 bg-white" style={{ borderColor: C.border }}>
            <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <X className="w-5 h-5" style={{ color: C.textMuted }} />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: C.text }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                  <Calendar className="w-4 h-4 text-white" />
                </span>
                Book Strategy Call
              </h3>
              <p className="text-xs" style={{ color: C.textMuted }}>Select your details to schedule a free tax consultation.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              {[
                { label: 'First Name *', ph: 'Jane', key: 'firstName' as const },
                { label: 'Last Name *', ph: 'Doe', key: 'lastName' as const },
                { label: 'Phone Number *', ph: '(555) 000-0000', key: 'phone' as const },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>{f.label}</label>
                  <input
                    type={f.key === 'phone' ? 'tel' : 'text'} required placeholder={f.ph}
                    value={bookingForm[f.key]}
                    onChange={(e) => setBookingForm({ ...bookingForm, [f.key]: e.target.value })}
                    className="w-full border rounded-lg py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.textMuted }}>Service Required</label>
                <select value={bookingForm.serviceType} onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  className="w-full border rounded-lg py-2.5 px-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  style={{ backgroundColor: C.surface, borderColor: C.border, color: C.text }}>
                  <option value="Individual Tax Filing">Individual Tax Filing</option>
                  <option value="Business Tax Prep">Business Tax Prep</option>
                  <option value="Refund Advance Loan">Refund Advance Loan</option>
                  <option value="IRS Audit Defense">IRS Audit Defense</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-lg font-bold text-xs shadow-lg mt-2 transition hover:brightness-110 text-white" style={{ backgroundColor: C.primary }}>
                Confirm Consultation
              </button>
            </form>

            {bookingSubmitted && (
              <div className="p-3 rounded-lg text-xs font-semibold text-center" style={{ backgroundColor: C.accentSoft, border: `1px solid ${C.accent}`, color: C.primary }}>
                Consultation booked! Check your email for calendar invite.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
