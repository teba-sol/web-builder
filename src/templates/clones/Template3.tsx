import { useState } from 'react';
import {
  Shield,
  DollarSign,
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

export function Template3() {
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
  const servicesList = [
    { title: 'Predictive AI Analytics', desc: 'Uncover insights hidden in your datasets' },
    { title: 'Automated Workflows', desc: 'Streamline operations with smart pipelines' },
    { title: 'Enterprise Data Lake', desc: 'Secure, scalable storage for all telemetry' },
    { title: 'Real-time API', desc: 'Integrate AI directly into your apps' }
  ];

  const locationsList = [
    { title: 'Financial Services', desc: 'Fraud detection and risk modeling' },
    { title: 'Healthcare', desc: 'Patient outcomes and diagnostics' },
    { title: 'E-Commerce', desc: 'Recommendation engines and inventory' },
    { title: 'Manufacturing', desc: 'Supply chain optimization' }
  ];

  const blogList = [
    { title: '2026 AI Trends', desc: 'The future of generative models' },
    { title: 'Scaling Data Pipelines', desc: 'Best practices for Enterprise architecture' },
    { title: 'SOC-2 Compliance', desc: 'How we secure your data' }
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
      comment: 'Kreative.Studio completely transformed our brand identity. The new web app they built increased our user engagement by 150%. Unbelievable talent!'
    },
    {
      name: 'Elena Rostova',
      date: '2 weeks ago',
      rating: 5,
      comment: 'Working with this agency was a breeze. They delivered motion assets that made our marketing campaign go viral. Highly recommended!'
    },
    {
      name: 'Terrell Jackson',
      date: '1 month ago',
      rating: 5,
      comment: "The best design partners we've ever had. They truly understand how to balance stunning visuals with robust technical execution."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--clone-surface)] text-[var(--clone-ink)] font-sans selection:bg-[var(--clone-accent)] selection:text-white relative">

      {/* TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="border-b border-[#241C15]/10 text-xs py-2 px-4 text-[#FFF3E7]" style={{ backgroundColor: 'var(--clone-ink)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-semibold text-[#FFDCC4]">
              <Phone className="w-3.5 h-3.5 text-[var(--clone-accent)]" />
              Call Toll-Free: <a href="tel:+18005558299" className="text-[#FFF3E7] hover:text-[var(--clone-accent)] transition-colors">(800) 555-KREATIVEES</a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[#FFDCC4]">
              <Mail className="w-3.5 h-3.5 text-[var(--clone-accent)]" />
              info@taxguardians.com
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[#FFDCC4]">
              <Clock className="w-3.5 h-3.5 text-[var(--clone-accent)]" />
              Mon-Fri: 9AM - 7PM | Sat: 10AM - 4PM
            </span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[#FFDCC4]">
            {/* <span className="bg-[#FA6B34]/20 px-2.5 py-0.5 rounded-full border border-[#FA6B34]/40 text-[11px]">
              🔥 2026 Tax Season Open: Get Up to $7,500 Today!
            </span> */}
          </div>

        </div>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[var(--clone-surface)]/95 backdrop-blur-md border-b border-[#EEDFCF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FA6B34]/30 transition-transform group-hover:scale-105" style={{ backgroundColor: 'var(--clone-accent)' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-[#241C15] flex items-center gap-1">
                Company<span style={{ color: 'var(--clone-accent)' }}>Name</span>
              </div>
              <div className="text-[10px] text-[#9C8A76] font-semibold uppercase tracking-widest">
                Tagline here
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">

            {/* HOME */}
            <a href="#hero" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
              Home
            </a>

            {/* SERVICES DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
                Services <ChevronDown className="w-4 h-4 text-[#9C8A76] group-hover:rotate-180 group-hover:text-[var(--clone-accent)] transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-white border border-[#EEDFCF] rounded-2xl shadow-2xl shadow-[#241C15]/10 p-2 space-y-1">
                  {servicesList.map((s, idx) => (
                    <a key={idx} href="#services" className="block p-3 rounded-xl hover:bg-[#FFEDE1] border border-transparent transition">
                      <div className="text-sm font-bold text-[#241C15] flex items-center justify-between">
                        {s.title}
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--clone-accent)]" />
                      </div>
                      <div className="text-xs text-[#7A6A58] mt-0.5">{s.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* LOCATIONS DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
                Locations <ChevronDown className="w-4 h-4 text-[#9C8A76] group-hover:rotate-180 group-hover:text-[var(--clone-accent)] transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-white border border-[#EEDFCF] rounded-2xl shadow-2xl shadow-[#241C15]/10 p-2 space-y-1">
                  {locationsList.map((loc, idx) => (
                    <a key={idx} href="#location" className="block p-3 rounded-xl hover:bg-[#FFEDE1] transition">
                      <div className="text-sm font-bold text-[#241C15]">{loc.title}</div>
                      <div className="text-xs text-[#7A6A58] mt-0.5">{loc.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOG DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
                Blog <ChevronDown className="w-4 h-4 text-[#9C8A76] group-hover:rotate-180 group-hover:text-[var(--clone-accent)] transition-transform" />
              </button>

              <div className="absolute top-full left-0 w-80 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-white border border-[#EEDFCF] rounded-2xl shadow-2xl shadow-[#241C15]/10 p-2 space-y-1">
                  {blogList.map((b, idx) => (
                    <a key={idx} href="#faq" className="block p-3 rounded-xl hover:bg-[#FFEDE1] transition">
                      <div className="text-sm font-bold text-[#241C15]">{b.title}</div>
                      <div className="text-xs text-[#7A6A58] mt-0.5">{b.desc}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <a href="#about" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
              About
            </a>

            {/* CONTACT */}
            <a href="#contact" className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#3A2E22] hover:text-[var(--clone-accent)] hover:bg-[#FFEDE1] transition">
              Contact
            </a>

          </nav>

          {/* Book Now Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-[#FA6B34]/30 hover:scale-105 hover:shadow-[#FA6B34]/50 active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: 'var(--clone-accent)' }}
            >
              <Calendar className="w-4 h-4 text-white" /> Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#FFEDE1] text-[#241C15] border border-[#EEDFCF]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--clone-surface)] border-b border-[#EEDFCF] px-6 py-6 space-y-4">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">Home</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">Services</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">About Us</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">How It Works</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">Client Reviews</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-bold text-[#241C15]">Contact Us</a>

            <button
              onClick={() => { setMobileMenuOpen(false); setIsBookingModalOpen(true); }}
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#FA6B34]/30"
              style={{ backgroundColor: 'var(--clone-accent)' }}
            >
              <Calendar className="w-4 h-4 text-white" /> Book Appointment Now
            </button>
          </div>
        )}
      </header>

    <section className="relative min-h-screen text-white font-sans flex flex-col w-full bg-[#141110]">
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
  <div className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-12 max-w-[1400px] w-full mx-auto pb-24">
    <div className="max-w-3xl">
      {/* Eyebrow / Tagline */}
      <div className="flex items-center gap-4 mb-6">
        <svg className="w-8 h-8" style={{ color: 'var(--clone-accent)' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
        <span className="text-[13px] font-bold tracking-[0.2em] uppercase text-[#E8D9CB]">
          Your Success. Your Legacy. For Posterity.
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-8">
        Invested in your<br />
        <span style={{ color: 'var(--clone-accent)' }}>Long term</span> success.
      </h1>

      {/* Subtext */}
      <p className="text-lg lg:text-[19px] text-[#CBBBAC] font-medium max-w-[600px] mb-10 leading-relaxed border-l-2 pl-4" style={{ borderColor: 'var(--clone-accent)' }}>
        To assist individuals and help businesses realize their financial ambitions and be successful is The Allen CPA Firm mission.
      </p>

      {/* Call to Action */}
      <button className="text-white px-8 py-4 font-bold text-sm tracking-wide transition-colors flex items-center gap-3 rounded-lg shadow-lg shadow-[#FA6B34]/30 hover:brightness-110" style={{ backgroundColor: 'var(--clone-accent)' }}>
        Discover More <span className="text-lg leading-none">&rarr;</span>
      </button>
    </div>
  </div>
</section>

      {/* STATS BANNER */}
      <section className="py-12 bg-[#FFF3E7] border-y border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

            <div className="p-6 rounded-2xl bg-white border border-[#EEDFCF] shadow-sm">
              <div className="text-4xl font-extrabold text-[#241C15]">10+ Years</div>
              <div className="text-sm font-semibold mt-1" style={{ color: 'var(--clone-accent)' }}>Design Excellence</div>
              <p className="text-xs text-[#7A6A58] mt-1">Award-winning UX/UI Designers & Engineers</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EEDFCF] shadow-sm">
              <div className="text-4xl font-extrabold text-[#241C15]">300+</div>
              <div className="text-sm font-semibold mt-1" style={{ color: 'var(--clone-accent)' }}>Projects Launched</div>
              <p className="text-xs text-[#7A6A58] mt-1">Helping startups and enterprises redefine their brands</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EEDFCF] shadow-sm">
              <div className="text-4xl font-extrabold text-[#241C15]">$500M+</div>
              <div className="text-sm font-semibold mt-1" style={{ color: 'var(--clone-accent)' }}>Client Revenue Generated</div>
              <p className="text-xs text-[#7A6A58] mt-1">Impactful digital products driving significant business growth</p>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-[#241C15]/10 border border-[#EEDFCF]">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
                alt="Creative Team Brainstorming"
                className="w-full h-[640px] object-cover"
              />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white border border-[#EEDFCF] p-5 rounded-2xl shadow-xl shadow-[#241C15]/10 flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-[#241C15]">Award Winning</div>
                <div className="text-xs text-[#7A6A58]">Recognized for Digital Excellence</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Our Vision</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241C15] leading-tight">
              Your Strategic Partner for <br />
              <span style={{ color: 'var(--clone-accent)' }}>Digital Innovation</span>
            </h2>

            <p className="text-[#4A3B2C] text-sm sm:text-base leading-relaxed">
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
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Our Expertise</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241C15]">
              Comprehensive <span style={{ color: 'var(--clone-accent)' }}>Tax Services</span>
            </h2>
            <p className="text-[#4A3B2C] text-sm">
              From individual income tax filing to high-dollar refund advances and business audit defense.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Service 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#EEDFCF] hover:border-[var(--clone-accent)]/60 hover:shadow-xl hover:shadow-[var(--clone-accent)]/10 transition space-y-4 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#241C15] group-hover:text-[var(--clone-accent)] transition">
                Digital Product & Brand Agency
              </h3>
              <p className="text-[#7A6A58] text-sm leading-relaxed">
                Fast e-filing with refund advance options from $500 up to $7,500 deposited directly to your bank account.
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
                Refer friends, family, or colleagues and receive $50 cash per completed client filing with zero payout limits!
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
                Dedicated business accounting, LLC filing, payroll tax optimization, and 100% IRS audit defense coverage.
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto bg-[#FFF3E7] border border-[#EEDFCF] rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Financial Transparency</div>
          <h2 className="text-3xl font-extrabold text-[#241C15]">Why Invest in Professional Brand Design?</h2>
          <p className="text-[#4A3B2C] text-sm leading-relaxed">
            In today's saturated digital landscape, your brand is more than just a logo—it's the emotional connection you build with your audience. Professional design establishes trust, differentiates you from competitors, and directly influences purchasing decisions.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-[#7A6A58] pt-2">
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
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto space-y-16">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Simple 3-Step Process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#241C15]">Our Creative Process</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">

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
      <section id="reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Testimonials</div>
            <h2 className="text-3xl font-extrabold text-[#241C15]">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* FAQ ACCORDION SECTION */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-[#EEDFCF]">
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

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FFF3E7] border-t border-[#EEDFCF]">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--clone-accent)' }}>Connect With Us</div>
            <h2 className="text-3xl font-extrabold text-[#241C15]">Visit Our Creative Studio Or Message Us</h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Headquarters Address</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">100 Financial Way, Suite 300, Financial District</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Direct Phone Line</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">Call: (800) 555-KREATIVEES / (800) 555-8299</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EEDFCF] shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--clone-accent)' }}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#241C15] text-sm">Email Support</h4>
                  <p className="text-xs text-[#7A6A58] mt-1">support@taxguardians.com</p>
                </div>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#EEDFCF] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#241C15]">Send A Direct Message</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
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
                      placeholder="(555) 000-0000"
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
      <footer className="bg-[#1A1512] border-t border-[#2A231E] text-[#B8A996] text-xs py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

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
              <li><a href="#services" className="hover:text-[var(--clone-accent)] transition-colors">Individual Tax Prep</a></li>
              <li><a href="#services" className="hover:text-[var(--clone-accent)] transition-colors">Refund Advance Loans</a></li>
              <li><a href="#services" className="hover:text-[var(--clone-accent)] transition-colors">$50 Referral Bonus</a></li>
              <li><a href="#services" className="hover:text-[var(--clone-accent)] transition-colors">Business Tax & IRS Audit</a></li>
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
              Refund advances are short-term loans provided by partner financial institutions upon IRS return filing acceptance. Terms and conditions apply.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#2A231E] text-center text-[#8C7C6A]">
          © {new Date().getFullYear()} Kreative.Studio LLC. All rights reserved. Placeholder Template 1 UI.
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1512]/70 backdrop-blur-sm">
          <div className="bg-[var(--clone-surface)] border border-[#EEDFCF] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl space-y-4">

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
                  placeholder="(555) 000-0000"
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