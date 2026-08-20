import { useState } from 'react';
import {
  Shield,
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
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
  Menu,
  Briefcase,
  Gift,
} from 'lucide-react';

export function Template1() {
  // Mobile Navigation Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Nav Dropdowns Data
  const servicesList = [
    { title: 'Tax Preparation & E-Filing', desc: 'Maximize your federal & state tax returns' },
    { title: 'Instant Refund Advances', desc: 'Get up to $7,500 in 24 hours with zero upfront fee' },
    { title: 'Referral Rewards Program', desc: 'Earn $50 for every friend or family member referred' },
    { title: 'Business Tax & Audit Defense', desc: 'Comprehensive CPA assistance for LLCs & Corporations' }
  ];

  const locationsList = [
    { title: 'Metro Financial Center (HQ)', desc: '100 Financial Way, Suite 300' },
    { title: 'Midtown Branch', desc: '450 Peachtree Ave NE' },
    { title: 'Downtown Office', desc: '85 Commerce Street' },
    { title: 'Suburban Tax Hub', desc: '1200 Market Center Blvd' }
  ];

  const blogList = [
    { title: '2026 IRS Filing Guide: Maximize Credits', desc: 'Key updates for Earned Income & Child Tax credits' },
    { title: 'How Refund Advances Work Explained', desc: 'Learn how to get funds before IRS direct deposit' },
    { title: 'Top 5 Small Business Deductions', desc: 'Don’t leave money on the table this tax year' }
  ];

  const faqs = [
    {
      q: 'How much can I receive in an instant refund advance?',
      a: 'Qualified clients can receive refund advances ranging from $500 up to $7,500 within 24 hours of filing, subject to IRS acceptance and loan approval terms.'
    },
    {
      q: 'Are there any upfront out-of-pocket costs to apply?',
      a: 'No! There are $0 upfront out-of-pocket fees. All preparation fees and advance repayments can be deducted directly from your total tax refund.'
    },
    {
      q: 'What documents do I need to bring for tax preparation?',
      a: 'Please bring a valid Government-issued ID, Social Security Card (or ITIN), W-2s, 1099s, direct deposit account info, and any applicable tax deduction forms.'
    },
    {
      q: 'How does the $50 referral bonus work?',
      a: 'For every new client you refer who completes tax preparation with us, you receive a cash or digital gift bonus of $50 with no limit on referrals.'
    },
    {
      q: 'Do you assist with IRS audit protection & back taxes?',
      a: 'Yes, our certified tax preparers provide comprehensive IRS audit representation, back-tax resolution, and penalty abatement support.'
    }
  ];

  const reviews = [
    {
      name: 'Marcus Vance',
      date: '1 week ago',
      rating: 5,
      comment: 'Got my $5,000 refund advance approved the exact same day! The staff was super friendly and explained every deduction. Best tax office in town!'
    },
    {
      name: 'Elena Rostova',
      date: '2 weeks ago',
      rating: 5,
      comment: 'I referred 4 coworkers and received my $200 referral bonuses immediately. Professional, transparent, and maximized my return!'
    },
    {
      name: 'Terrell Jackson',
      date: '1 month ago',
      rating: 5,
      comment: 'Been coming here for 5 years. They solved an IRS notice for my small business seamlessly. Highly recommend TaxGuardians!'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-rose-900 selection:text-slate-900 relative">
      
      {/* TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="bg border-b border-rose-200 text-xs py-2 px-4 text-slate-900" style={{ backgroundColor: '#eee4e6ff' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-semibold text-rose-700">
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              Call Toll-Free: <a href="tel:+18005558299" className="text-slate-900 hover:underline">(800) 555-TAXES</a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-rose-700">
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              info@taxguardians.com
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-rose-700">
              <Clock className="w-3.5 h-3.5 text-rose-600" />
              Mon-Fri: 9AM - 7PM | Sat: 10AM - 4PM
            </span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-rose-100">
            {/* <span className="bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-300 text-[11px]">
              🔥 2026 Tax Season Open: Get Up to $7,500 Today!
            </span> */}
          </div>

        </div>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md border-b border-slate-300 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-900 shadow-lg transition-transform group-hover:scale-105" style={{ backgroundColor: 'var(--clone-accent)' }}>
              <Shield className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Company<span className="text-purple-600">Name</span>
              </div>
              <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
                Tagline here
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            
            {/* HOME */}
            <a href="#hero" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
              Home
            </a>

            {/* SERVICES DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
                Services <ChevronDown className="w-4 h-4 text-slate-600 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl p-2 space-y-1">
                  {servicesList.map((s, idx) => (
                    <a key={idx} href="#services" className="block p-3 rounded-xl hover:bg-rose-100/40 border border-transparent transition">
                      <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                        {s.title}
                        <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{s.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* LOCATIONS DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
                Locations <ChevronDown className="w-4 h-4 text-slate-600 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl p-2 space-y-1">
                  {locationsList.map((loc, idx) => (
                    <a key={idx} href="#location" className="block p-3 rounded-xl hover:bg-rose-100/40 transition">
                      <div className="text-sm font-bold text-slate-900">{loc.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{loc.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOG DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
                Blog <ChevronDown className="w-4 h-4 text-slate-600 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-slate-100 border border-slate-300 rounded-2xl shadow-2xl p-2 space-y-1">
                  {blogList.map((b, idx) => (
                    <a key={idx} href="#faq" className="block p-3 rounded-xl hover:bg-rose-100/40 transition">
                      <div className="text-sm font-bold text-slate-900">{b.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{b.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <a href="#about" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
              About
            </a>

            {/* CONTACT */}
            <a href="#contact" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-rose-600 hover:bg-slate-100 transition">
              Contact
            </a>

          </nav>

          {/* Book Now Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-xl shadow-rose-950/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: 'var(--clone-accent)' }}
            >
              <Calendar className="w-4 h-4 text-amber-300" /> Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-50 border-b border-slate-300 px-6 py-6 space-y-4">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">Home</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">Services</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">About Us</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">How It Works</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">Client Reviews</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-slate-900">Contact Us</a>

            <button
              onClick={() => { setMobileMenuOpen(false); setIsBookingModalOpen(true); }}
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: 'var(--clone-accent)' }}
            >
              <Calendar className="w-4 h-4 text-amber-300" /> Book Appointment Now
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=2000&q=80"
            alt="Tax Preparation Experts"
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
              Best Tax Preparation & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300">
                Instant Refund Advances
              </span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg max-w-2xl leading-relaxed">
              Get up to <strong className="text-amber-300">$7,500 in instant refund advances</strong> within 24 hours! No hidden fees, $0 upfront out-of-pocket costs, and maximum return guaranteed by certified CPAs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-8 py-4 rounded-xl text-white font-extrabold text-base shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                style={{ backgroundColor: 'var(--clone-accent)' }}
              >
                Pre-Qualify Now <ArrowRight className="w-5 h-5 text-amber-300" />
              </button>

              <a
                href="#about"
                className="px-7 py-4 rounded-xl bg-slate-100 border border-slate-400/80 hover:border-slate-500 text-slate-800 font-bold text-base transition-all flex items-center gap-2"
              >
                Learn More
              </a>
            </div>

            {/* Quick Hero Badges */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-300">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> $0 Upfront Out-Of-Pocket
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Up to $7,500 Advances
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Maximum Refund Guarantee
              </div>
            </div>

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

      {/* STATS BANNER */}
      <section className="py-12 bg-slate-100/60 border-y border-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-300">
              <div className="text-4xl font-extrabold text-slate-900">20+ Years</div>
              <div className="text-sm font-semibold text-rose-600 mt-1">Tax Filing Experience</div>
              <p className="text-xs text-slate-600 mt-1">IRS Registered Certified Tax Preparers & CPAs</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-300">
              <div className="text-4xl font-extrabold text-slate-900">5,000+</div>
              <div className="text-sm font-semibold text-amber-300 mt-1">Happy Tax Clients</div>
              <p className="text-xs text-slate-600 mt-1">Helping families and businesses get maximum refunds</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-300">
              <div className="text-4xl font-extrabold text-slate-900">$10M+</div>
              <div className="text-sm font-semibold text-rose-600 mt-1">Refund Advances Issued</div>
              <p className="text-xs text-slate-600 mt-1">Instant payouts provided before official IRS dates</p>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-300">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                alt="Tax Advisor Consulting Client"
                className="w-full h-[640px] object-cover"
              />
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
              Your Trusted Partners for <br />
              <span className="text-rose-600">Tax Relief & Fast Cash</span>
            </h2>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              TaxGuardians was founded on a simple principle: ensuring hard-working individuals and business owners never overpay on taxes or wait weeks for their IRS refunds.
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

      {/* OUR SERVICES SECTION */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Our Expertise</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Comprehensive <span className="text-rose-600">Tax Services</span>
            </h2>
            <p className="text-slate-700 text-sm">
              From individual income tax filing to high-dollar refund advances and business audit defense.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Service 1 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-rose-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <DollarSign className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">
                Tax Prep & Refund Advances
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fast e-filing with refund advance options from $500 up to $7,500 deposited directly to your bank account.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-rose-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Apply For Advance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-rose-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Gift className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">
                Referral Bonus Program
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Refer friends, family, or colleagues and receive $50 cash per completed client filing with zero payout limits!
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-rose-600 flex items-center gap-1.5 pt-2 hover:underline"
              >
                Join Referral Program <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-300 hover:border-rose-600/60 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Briefcase className="w-7 h-7 text-amber-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">
                Business Tax & Audit Defense
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated business accounting, LLC filing, payroll tax optimization, and 100% IRS audit defense coverage.
              </p>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-rose-600 flex items-center gap-1.5 pt-2 hover:underline"
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

      {/* HOW IT WORKS PROCESS SECTION */}
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Simple 3-Step Process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How Refund Advances Work</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Submit W-2 & Documents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bring or upload your tax documents to our secure client portal or physical branch office.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Instant Approval Calculation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our CPAs e-file your return and run immediate eligibility checks for advances up to $7,500.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-300 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full font-black text-lg text-slate-900 mx-auto flex items-center justify-center" style={{ backgroundColor: 'var(--clone-accent)' }}>
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Receive Cash in 24 Hours</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Funds are transferred directly into your bank account or provided via prepaid debit card.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CLIENT REVIEWS SECTION */}
      <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Testimonials</div>
            <h2 className="text-3xl font-extrabold text-slate-900">What Our Clients Say</h2>
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

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-300">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Got Questions?</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
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

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/80 border-t border-slate-300">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-widest">Connect With Us</div>
            <h2 className="text-3xl font-extrabold text-slate-900">Visit Our Tax Office Or Message Us</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <MapPin className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Headquarters Address</h4>
                  <p className="text-xs text-slate-600 mt-1">100 Financial Way, Suite 300, Financial District</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Phone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-slate-600 mt-1">Call: (800) 555-TAXES / (800) 555-8299</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Mail className="w-5 h-5 text-amber-300" />
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

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-300 text-slate-600 text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-rose-500" /> TAX GUARDIANS
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Authorized IRS e-File Provider specializing in maximum tax refunds, fast refund advance loans, and audit representation.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-rose-600">Individual Tax Prep</a></li>
              <li><a href="#services" className="hover:text-rose-600">Refund Advance Loans</a></li>
              <li><a href="#services" className="hover:text-rose-600">$50 Referral Bonus</a></li>
              <li><a href="#services" className="hover:text-rose-600">Business Tax & IRS Audit</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Office Hours</h4>
            <ul className="space-y-2">
              <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
              <li className="text-amber-300 font-semibold pt-1">24/7 Online Application Active</li>
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
          © {new Date().getFullYear()} TaxGuardians LLC. All rights reserved. Placeholder Template 1 UI.
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
