import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SiteContent } from '../../types';
import { CloneCtaSection, CloneMap, CloneNav, ClonePricingSection, CloneTeamSection } from './CloneChrome';
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
} from 'lucide-react';

export function Template3({ c, basePath }: { c: SiteContent; basePath: string }) {
  const d = buildCloneHomeData(c, basePath, 'flux')
  // Mobile Navigation Menu State

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: 'Web & Mobile Apps',
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
        serviceType: 'Web & Mobile Apps',
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

  return (
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-[var(--clone-accent)] selection:text-white relative">

      <CloneNav templateId="flux" d={d} onBook={() => setIsBookingModalOpen(true)} />
<section className="relative z-0 isolate flex min-h-[70vh] w-full flex-col bg-[#141110] font-sans text-white clg:min-h-screen">
  {/* Full Background Image with Dark Overlay */}
  <div className="absolute inset-0 z-0">
    <img
      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=80"
      alt="Professionals reviewing documents"
      className="w-full h-full object-cover object-center"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#141110] via-[#141110]/80 to-transparent"></div>
  </div>



  {/* Hero Content Area */}
  <div className="relative z-10 flex-1 flex flex-col justify-center px-6 clg:px-12 max-w-[1400px] w-full mx-auto pb-24">
    <div className="max-w-3xl">
      {/* Eyebrow / Tagline */}
      <div className="flex items-center gap-4 mb-6">
        <svg className="w-8 h-8" style={{ color: 'var(--clone-accent)' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
        <span className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#E8D9CB]">
          Your Success. Your Legacy. For Bole Tax Desk.
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="mb-8 text-3xl font-bold leading-[1.05] tracking-tight csm:text-5xl clg:text-[5.5rem]">
        {c.tagline}
      </h1>

      {/* Subtext */}
      <p className="text-lg clg:text-[19px] text-[#CBBBAC] font-medium max-w-[600px] mb-10 leading-relaxed border-l-2 pl-4" style={{ borderColor: 'var(--clone-accent)' }}>
        {c.heroSubtext}
      </p>

      {/* Call to Action */}
      <button className="text-white px-8 py-4 font-bold text-sm tracking-wide transition-colors flex items-center gap-3 rounded-lg shadow-lg shadow-[#FA6B34]/30 hover:brightness-110" style={{ backgroundColor: 'var(--clone-accent)' }}>
        Discover More <span className="text-lg leading-none">&rarr;</span>
      </button>
    </div>
  </div>
</section>

      {d.show.stats && d.stats.length > 0 && (
      <section className="py-12 bg-[#FFF3E7] border-y border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto px-4 csm:px-6 clg:px-8">
          <div className="grid grid-cols-1 cmd:grid-cols-3 gap-6 text-center">
            {d.stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white border border-[#EEDFCF] shadow-sm">
              <div className="text-4xl font-extrabold text-[#241C15]">{stat.value}</div>
              <div className="text-sm font-semibold mt-1" style={{ color: 'var(--clone-accent)' }}>{stat.label}</div>
            </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ABOUT SECTION */}
      <section id="about" className={`${!(d.show.about) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 relative`}>
        <div className="max-w-7xl mx-auto grid clg:grid-cols-12 gap-12 items-center">

          <div className="clg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#241C15]/10 border border-[#EEDFCF]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                alt="Creative Team Brainstorming"
                className="h-56 w-full object-cover csm:h-80 clg:h-[640px]"
              />
            </div>

            {/* Floating Experience Badge */}
            <div className="relative mt-4 flex max-w-xs items-center gap-4 rounded-2xl border border-[#EEDFCF] bg-white p-5 shadow-xl shadow-[#241C15]/10 csm:absolute csm:-bottom-6 csm:right-6 csm:mt-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-[#241C15]">Award Winning</div>
                <div className="text-xs text-[#7A6A58]">Recognized for Digital Excellence</div>
              </div>
            </div>
          </div>

          <div className="clg:col-span-6 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Our Vision</div>
            <h2 className="text-3xl csm:text-4xl font-extrabold text-[#241C15] leading-tight">
              Your Strategic Partner for <br />
              <span style={{ color: 'var(--clone-accent)' }}>Digital Innovation</span>
            </h2>

            <p className="text-[#4A3B2C] text-sm csm:text-base leading-relaxed">
              Kreative.Studio was founded on a simple principle: bridging the gap between aesthetic beauty and functional digital experiences to help brands stand out.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-[#4A3B2C]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[#241C15]">User-Centric Design:</strong> Every interface is crafted based on deep user research and usability testing.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#4A3B2C]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[#241C15]">Agile Development:</strong> Rapid prototyping and iterative sprints for faster time-to-market.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#4A3B2C]">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clone-accent)' }} />
                <span><strong className="text-[#241C15]">Scalable Solutions:</strong> Future-proof architectures built to grow seamlessly with your business.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-[#FA6B34]/30 hover:brightness-110 transition flex items-center gap-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Schedule Appointment <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* OUR SERVICES SECTION */}
      <section id="services" className={`${!(d.show.services) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]`}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Our Expertise</div>
            <h2 className="text-3xl csm:text-4xl font-extrabold text-[#241C15]">
              Comprehensive <span style={{ color: 'var(--clone-accent)' }}>Tax Services</span>
            </h2>
            <p className="text-[#4A3B2C] text-sm">
              From individual income tax filing to high-dollar refund advances and business audit defense.
            </p>
          </div>

          <div className="grid cmd:grid-cols-3 gap-8">

            {/* Service 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#EEDFCF] hover:border-[var(--clone-accent)]/60 hover:shadow-xl hover:shadow-[var(--clone-accent)]/10 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#241C15] group-hover:text-[var(--clone-accent)] transition">
                Digital Product & Brand Agency
              </h3>
              <p className="text-[#7A6A58] text-sm leading-relaxed">
                Fast e-filing with refund advance options from 27,500 ETB up to 412,500 ETB deposited directly to your bank account.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-accent)' }}
              >
                Apply For Advance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-8 rounded-3xl border border-[#EEDFCF] hover:border-[var(--clone-accent)]/60 hover:shadow-xl hover:shadow-[var(--clone-accent)]/10 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#241C15] group-hover:text-[var(--clone-accent)] transition">
                Referral Bonus Program
              </h3>
              <p className="text-[#7A6A58] text-sm leading-relaxed">
                Refer friends, family, or colleagues and receive 2,750 ETB cash per completed client filing with zero payout limits!
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-accent)' }}
              >
                Join Referral Program <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-8 rounded-3xl border border-[#EEDFCF] hover:border-[var(--clone-accent)]/60 hover:shadow-xl hover:shadow-[var(--clone-accent)]/10 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#241C15] group-hover:text-[var(--clone-accent)] transition">
                Business Tax & Audit Defense
              </h3>
              <p className="text-[#7A6A58] text-sm leading-relaxed">
                Dedicated business accounting, LLC filing, payroll tax optimization, and 100% Ministry of Revenue audit defense coverage.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold flex items-center gap-1.5 pt-2 hover:underline"
                style={{ color: 'var(--clone-accent)' }}
              >
                Business Tax Consult <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* WHAT IS REFUND ADVANCE EXPLANATION */}
      <section className="py-20 px-4 csm:px-6 clg:px-8 border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto bg-[#FFF3E7] border border-[#EEDFCF] rounded-3xl p-8 csm:p-12 space-y-6">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Financial Transparency</div>
          <h2 className="text-3xl font-extrabold text-[#241C15]">Why Invest in Professional Brand Design?</h2>
          <p className="text-[#4A3B2C] text-sm leading-relaxed">
            In today's saturated digital landscape, your brand is more than just a logo—it's the emotional connection you build with your audience. Professional design establishes trust, differentiates you from competitors, and directly influences purchasing decisions.
          </p>
          <div className="grid csm:grid-cols-2 gap-4 text-xs text-[#7A6A58] pt-2">
            <div className="p-4 bg-white rounded-xl border border-[#EEDFCF]">
              <strong className="text-[#241C15] block mb-1 text-sm">✓ Increased Perceived Value</strong>
              High-quality design allows you to command premium pricing for your products.
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#EEDFCF]">
              <strong className="text-[#241C15] block mb-1 text-sm">✓ Higher Conversion Rates</strong>
              Optimized user experiences reduce friction and turn more visitors into loyal customers.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PROCESS SECTION */}
      <section id="process" className={`${!(d.show.steps) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 border-t border-[#EEDFCF]`}>
        <div className="max-w-7xl mx-auto space-y-16">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Simple 3-Step Process</div>
            <h2 className="text-3xl csm:text-4xl font-extrabold text-[#241C15]">Our Creative Process</h2>
          </div>

          <div className="grid cmd:grid-cols-3 gap-8 relative">

            {/* Step 1 */}
            <div className="bg-[#FFF3E7] p-8 rounded-3xl border border-[#EEDFCF] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-white mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                1
              </div>
              <h3 className="text-xl font-bold text-[#241C15]">Discovery & Strategy</h3>
              <p className="text-xs text-[#7A6A58] leading-relaxed">
                We dive deep into your business goals, target audience, and market positioning.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FFF3E7] p-8 rounded-3xl border border-[#EEDFCF] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-white mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                2
              </div>
              <h3 className="text-xl font-bold text-[#241C15]">Design & Prototyping</h3>
              <p className="text-xs text-[#7A6A58] leading-relaxed">
                We create wireframes, visual concepts, and interactive prototypes for your review.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFF3E7] p-8 rounded-3xl border border-[#EEDFCF] text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-white mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                3
              </div>
              <h3 className="text-xl font-bold text-[#241C15]">Development & Launch</h3>
              <p className="text-xs text-[#7A6A58] leading-relaxed">
                Our engineers build the final product, ensuring performance, accessibility, and scale.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CLIENT REVIEWS SECTION */}
      <section id="reviews" className={`${!(d.show.testimonials) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]`}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Testimonials</div>
            <h2 className="text-3xl font-extrabold text-[#241C15]">What Our Clients Say</h2>
          </div>

          <div className="grid cmd:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="flex items-center gap-1" style={{ color: 'var(--clone-accent)' }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ fill: 'var(--clone-accent)' }} />
                  ))}
                </div>
                <p className="text-xs text-[#4A3B2C] leading-relaxed">"{r.comment}"</p>
                <div className="pt-2 border-t border-[#EEDFCF] flex justify-between items-center text-xs">
                  <span className="font-bold text-[#241C15]">{r.name}</span>
                  <span className="text-[#9C8A76]">{r.date}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <ClonePricingSection d={d} onBook={() => setIsBookingModalOpen(true)} />
      <CloneTeamSection templateId="flux" d={d} />

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className={`${!(d.show.faq) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 border-t border-[#EEDFCF]`}>
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Got Questions?</div>
            <h2 className="text-3xl font-extrabold text-[#241C15]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#FFF3E7] border border-[#EEDFCF] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-[#241C15] text-base flex justify-between items-center hover:text-[var(--clone-accent)] transition"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} /> : <ChevronDown className="w-5 h-5 text-[#9C8A76]" />}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-[#4A3B2C] leading-relaxed border-t border-[#EEDFCF] pt-4">
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
      <section id="contact" className={`${!(d.show.contact) ? 'hidden ' : ''}py-24 px-4 csm:px-6 clg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]`}>
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Connect With Us</div>
            <h2 className="text-3xl font-extrabold text-[#241C15]">Visit Our Creative Studio Or Message Us</h2>
          </div>

          <div className="grid clg:grid-cols-12 gap-12">

            <div className="clg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Headquarters Address</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">{c.address}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">{c.phone ? `Call: ${c.phone}` : ''}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Email Support</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">{c.email}</p>
                </div>
              </div>
              <CloneMap d={d} className="h-56 overflow-hidden rounded-2xl border border-[#EEDFCF]" />
            </div>

            {/* Direct Message Form */}
            <div className="clg:col-span-7 bg-white p-8 rounded-3xl border border-[#EEDFCF] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#241C15]">Send A Direct Message</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid csm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Smith"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-xl py-3 px-4 text-sm text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Your Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+251 911 000 000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-xl py-3 px-4 text-sm text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-xl py-3 px-4 text-sm text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can our tax experts assist you today?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-xl py-3 px-4 text-sm text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-[#FA6B34]/30 hover:brightness-110 transition flex items-center gap-2"
                  style={{ backgroundColor: 'var(--clone-accent)' }}
                >
                  <Send className="w-4 h-4 text-white" /> Send Inquiry
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
      <footer className="bg-[#1A1512] border-t border-[#2A231E] text-[#B8A996] text-xs py-12 px-4 csm:px-6 clg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 cmd:grid-cols-4 gap-8">

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} /> KREATIVE STUDIO
            </div>
            <p className="text-[#8C7C6A] text-xs leading-relaxed">
              A full-service digital product agency specializing in brand identity, user experience, and scalable web applications.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Individual Tax Prep</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Refund Advance Loans</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">2,750 ETB Referral Bonus</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-[var(--clone-accent)] transition-colors">Business Tax & Ministry of Revenue Audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Office Hours</h4>
            <ul className="space-y-2">
              <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
              <li className="font-semibold pt-1" style={{ color: 'var(--clone-accent)' }}>24/7 Online Application Active</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Legal Disclaimer</h4>
            <p className="text-[11px] text-[#8C7C6A] leading-relaxed">
              Refund advances are short-term loans provided by partner financial institutions upon Ministry of Revenue return filing acceptance. Terms and conditions apply.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#2A231E] text-center text-[#8C7C6A]">
          © {new Date().getFullYear()} Kreative.Studio LLC. All rights reserved. Placeholder Template 1 UI.
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#1A1512]/70 p-4 backdrop-blur-sm csm:items-center">
          <div className="bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-3xl p-6 csm:p-8 max-w-md w-full relative shadow-2xl space-y-4">

            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#FFEDE1] text-[#7A6A58] hover:text-[#241C15] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#241C15] flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: 'var(--clone-accent)' }} /> Book Strategy Call
              </h3>
              <p className="text-xs text-[#7A6A58]">Select your details to schedule a free project consultation.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  className="w-full bg-white border border-[#EEDFCF] rounded-xl py-2.5 px-3.5 text-xs text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={bookingForm.lastName}
                  onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                  className="w-full bg-white border border-[#EEDFCF] rounded-xl py-2.5 px-3.5 text-xs text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+251 911 000 000"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full bg-white border border-[#EEDFCF] rounded-xl py-2.5 px-3.5 text-xs text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A3B2C] mb-1">Service Required</label>
                <select
                  value={bookingForm.serviceType}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  className="w-full bg-white border border-[#EEDFCF] rounded-xl py-2.5 px-3.5 text-xs text-[#241C15] focus:outline-none focus:border-[var(--clone-accent)] focus:ring-2 focus:ring-[var(--clone-accent)]/20 transition"
                >
                  <option value="Web & Mobile Apps">Web & Mobile Apps</option>
                  <option value="Brand Architecture">Brand Architecture</option>
                  <option value="Motion & 3D Assets">Motion & 3D Assets</option>
                  <option value="Referral Program Registration">Digital Marketing & SEO</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-[#FA6B34]/30 hover:brightness-110 transition mt-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
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