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
  Star,
  Calendar,
   Send,
  X,
  Briefcase,
  Gift,
} from 'lucide-react';

export function Template2({ c, basePath }: { c: SiteContent; basePath: string }) {
  const d = buildCloneHomeData(c, basePath, 'aureum')
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
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-purple-900 selection:text-slate-900 relative">
      
      <CloneNav templateId="aureum" d={d} onBook={() => setIsBookingModalOpen(true)} />
<section className="bg-[var(--clone-accent)] min-h-screen text-white font-sans overflow-hidden flex flex-col relative z-0 isolate">
  {/* Decorative background grid */}
  <div className="absolute right-0 bottom-0 w-[50%] h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>


  {/* Hero Content */}
  <div className="relative z-10 flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-12 lg:py-16 grid lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Text Column */}
    <div className="pr-0 lg:pr-10">
      <h1 className="text-[2.75rem] lg:text-[4rem] font-bold leading-[1.05] text-white mb-6 tracking-tight">
        {c.tagline}
      </h1>
      <p className="text-[17px] text-gray-300 mb-10 max-w-[500px] leading-relaxed">
        {c.heroSubtext}
      </p>

      {/* Input Group */}
      <div className="bg-white rounded-full p-1.5 flex items-center w-full max-w-md mb-8 shadow-lg">
        <input
          type="email"
          placeholder="Email Address"
          className="flex-1 bg-transparent px-5 py-2 text-gray-900 outline-none placeholder-gray-500 font-medium text-sm"
        />
        <button className="bg-[var(--clone-ink)] hover:brightness-110 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap">
          Talk To Our Team
        </button>
      </div>

      {/* Footer Link */}
      <a href="#" className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-600 pb-1 hover:text-white transition-colors">
        Explore What We Do <span className="text-lg leading-none">&rarr;</span>
      </a>
    </div>

    {/* Right Visual Column */}
    <div className="relative h-[450px] lg:h-[600px] w-full flex items-end justify-center lg:justify-end mt-12 lg:mt-0">
      
      {/* Yellow Arch Background */}
      <div className="absolute right-[5%] bottom-0 w-[75%] h-[85%] bg-[var(--clone-highlight)] rounded-tl-[140px] rounded-br-[30px] z-0"></div>

      {/* Main Person Image Placeholder */}
      <div className="relative z-10 w-[70%] h-[95%] bg-slate-800 rounded-t-full border-[6px] border-[#211543] overflow-hidden flex items-center justify-center shadow-2xl">
        <span className="text-slate-400 font-medium uppercase tracking-widest text-sm text-center px-4"> <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80" alt="" /></span>
      </div>

      {/* Floating UI: Graph Card */}
      <div className="absolute top-[15%] left-[5%] bg-white rounded-xl p-4 shadow-2xl z-20 w-48 text-gray-900">
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mb-1">
          Net income <span className="text-lg leading-none">&rsaquo;</span>
        </div>
        <div className="font-black text-xl mb-1 flex items-baseline gap-2">
          $17,560.45 <span className="text-[#34A853] text-[10px] font-bold">+18%</span>
        </div>
        <div className="text-[8px] font-medium text-gray-400 mb-4">Oct 2025 vs prior month</div>
        <div className="flex items-end justify-between h-14 gap-1">
          <div className="w-full bg-[var(--clone-ink)] h-[45%] rounded-[2px]"></div>
          <div className="w-full bg-[#C3B3F8] h-[100%] rounded-[2px]"></div>
          <div className="w-full bg-gray-200 h-[30%] rounded-[2px]"></div>
          <div className="w-full bg-[#A288F5] h-[75%] rounded-[2px]"></div>
        </div>
      </div>

      {/* Floating UI: Chat Bubble 1 */}
      <div className="absolute bottom-[20%] -right-[2%] bg-white p-3 rounded-2xl rounded-br-sm shadow-2xl z-20 w-52 text-gray-900">
        <div className="text-[8px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Bridget, your CFO</div>
        <div className="text-sm font-bold flex justify-between items-center text-[var(--clone-ink)]">
          Your books are ready <span className="text-lg leading-none">&rarr;</span>
        </div>
      </div>

      {/* Floating UI: Chat Bubble 2 */}
      <div className="absolute bottom-[8%] -right-[8%] bg-white px-4 py-2.5 rounded-full shadow-2xl z-30 flex items-center gap-3">
        <span className="text-gray-900 text-sm font-bold">you're my hero!</span>
        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center overflow-hidden">
          <span className="text-[8px] text-purple-800 font-bold">IMG</span>
        </div>
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
              <div className="text-sm font-semibold text-purple-600 mt-1">{stat.label}</div>
            </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ABOUT SECTION */}
      <section id="about" className={`${!(d.show.about) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 relative`}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-300">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                alt="Creative Team Brainstorming"
                className="w-full h-[640px] object-cover"
              />
            </div>
            
            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-slate-100 border border-slate-300 p-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-pink-400 flex-shrink-0" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">Award Winning</div>
                <div className="text-xs text-slate-600">Recognized for Digital Excellence</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Our Vision</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Your Strategic Partner for <br />
              <span className="text-purple-600">Digital Innovation</span>
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Kreative.Studio was founded on a simple principle: bridging the gap between aesthetic beauty and functional digital experiences to help brands stand out.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span><strong>User-Centric Design:</strong> Every interface is crafted based on deep user research and usability testing.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span><strong>Agile Development:</strong> Rapid prototyping and iterative sprints for faster time-to-market.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span><strong>Scalable Solutions:</strong> Future-proof architectures built to grow seamlessly with your business.</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-7 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl flex items-center gap-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Schedule Appointment <ArrowRight className="w-4 h-4 text-pink-400" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* OUR SERVICES SECTION */}
      <section id="services" className={`${!(d.show.services) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 border-t border-slate-300`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Our Expertise</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Comprehensive <span className="text-purple-600">Tax Services</span>
            </h2>
            <p className="text-slate-700 text-sm">
              From individual income tax filing to high-dollar refund advances and business audit defense.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Service 1 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-purple-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <DollarSign className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition">
                Digital Product & Brand Agency
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fast e-filing with refund advance options from $500 up to $7,500 deposited directly to your bank account.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-purple-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Apply For Advance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-purple-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Gift className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition">
                Referral Bonus Program
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Refer friends, family, or colleagues and receive $50 cash per completed client filing with zero payout limits!
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-purple-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Join Referral Program <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-purple-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Briefcase className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition">
                Business Tax & Audit Defense
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated business accounting, LLC filing, payroll tax optimization, and 100% IRS audit defense coverage.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-purple-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Business Tax Consult <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* WHAT IS REFUND ADVANCE EXPLANATION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-7xl mx-auto bg-slate-100 border border-slate-300 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Financial Transparency</div>
          <h2 className="text-3xl font-extrabold text-slate-900">Why Invest in Professional Brand Design?</h2>
          <p className="text-slate-700 text-sm leading-relaxed">
            In today's saturated digital landscape, your brand is more than just a logo—it's the emotional connection you build with your audience. Professional design establishes trust, differentiates you from competitors, and directly influences purchasing decisions.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
              <strong className="text-slate-900 block mb-1 text-sm">✓ Increased Perceived Value</strong>
              High-quality design allows you to command premium pricing for your products.
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
              <strong className="text-slate-900 block mb-1 text-sm">✓ Higher Conversion Rates</strong>
              Optimized user experiences reduce friction and turn more visitors into loyal customers.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS PROCESS SECTION */}
      <section id="process" className={`${!(d.show.steps) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300`}>
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Simple 3-Step Process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Creative Process</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Discovery & Strategy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We dive deep into your business goals, target audience, and market positioning.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Design & Prototyping</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We create wireframes, visual concepts, and interactive prototypes for your review.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Development & Launch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our engineers build the final product, ensuring performance, accessibility, and scale.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CLIENT REVIEWS SECTION */}
      <section id="reviews" className={`${!(d.show.testimonials) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-t border-slate-300`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Testimonials</div>
            <h2 className="text-3xl font-extrabold text-slate-900">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="flex items-center gap-1 text-pink-500">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-pink-500" />
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

      <ClonePricingSection d={d} onBook={() => setIsBookingModalOpen(true)} />
      <CloneTeamSection d={d} />

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className={`${!(d.show.faq) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Got Questions?</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 text-base flex justify-between items-center hover:text-purple-600 transition"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
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

      <CloneCtaSection d={d} onBook={() => setIsBookingModalOpen(true)} />

      {/* CONTACT SECTION */}
      <section id="contact" className={`${!(d.show.contact) ? 'hidden ' : ''}py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/80 border-t border-slate-300`}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">Connect With Us</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Visit Our Creative Studio Or Message Us</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <MapPin className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Headquarters Address</h4>
                  <p className="text-xs text-slate-600 mt-1">100 Financial Way, Suite 300, Financial District</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Phone className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-slate-600 mt-1">Call: (800) 555-KREATIVEES / (800) 555-8299</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Mail className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Support</h4>
                  <p className="text-xs text-slate-600 mt-1">support@taxguardians.com</p>
                </div>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-7 bg-slate-50 p-8 rounded-3xl border border-slate-300 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Send A Direct Message</h3>

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
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
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
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can our tax experts assist you today?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl flex items-center gap-2"
                  style={{ backgroundColor: 'var(--clone-accent)' }}
                >
                  <Send className="w-4 h-4 text-pink-400" /> Send Inquiry
                </button>
              </form>

              {contactSubmitted && (
                <div className="p-3 bg-purple-100 border border-purple-600 rounded-xl text-purple-700 text-xs font-semibold text-center">
                  Message sent successfully! Our tax team will call you back shortly.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-300 text-slate-600 text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-purple-500" /> KREATIVE STUDIO
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              A full-service digital product agency specializing in brand identity, user experience, and scalable web applications.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><Link to={d.hrefs.services} className="hover:text-purple-600">Individual Tax Prep</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-purple-600">Refund Advance Loans</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-purple-600">$50 Referral Bonus</Link></li>
              <li><Link to={d.hrefs.services} className="hover:text-purple-600">Business Tax & IRS Audit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Office Hours</h4>
            <ul className="space-y-2">
              <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
              <li className="text-pink-400 font-semibold pt-1">24/7 Online Application Active</li>
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
          © {new Date().getFullYear()} Kreative.Studio LLC. All rights reserved. Placeholder Template 1 UI.
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
                <Calendar className="w-5 h-5 text-purple-600" /> Book Strategy Call
              </h3>
              <p className="text-xs text-slate-600">Select your details to schedule a free project consultation.</p>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Required</label>
                <select
                  value={bookingForm.serviceType}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="Web & Mobile Apps">Web & Mobile Apps</option>
                  <option value="Brand Architecture">Brand Architecture</option>
                  <option value="Motion & 3D Assets">Motion & 3D Assets</option>
                  <option value="Referral Program Registration">Digital Marketing & SEO</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-lg mt-2"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Confirm Consultation
              </button>
            </form>

            {bookingSubmitted && (
              <div className="p-3 bg-purple-100 border border-purple-600 rounded-xl text-purple-700 text-xs font-semibold text-center">
                Consultation booked! Check your email for calendar invite.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
