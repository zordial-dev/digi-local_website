import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  HelpCircle, 
  ShieldAlert, 
  Headphones, 
  MessageSquare, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  Building,
  PhoneCall,
  Mail,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function InfoPages({ tab = 'privacy-policy', setRoute }) {
  const [activeTab, setActiveTab] = useState(tab || 'privacy-policy');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    societyName: '',
    category: 'General Query',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const navTabs = [
    { id: 'privacy-policy', title: 'Privacy Policy', icon: Lock, category: 'Legal & Policy' },
    { id: 'child-security', title: 'Child Security Policy', icon: ShieldCheck, category: 'Legal & Policy' },
    { id: 'terms-and-conditions', title: 'Terms & Conditions', icon: FileText, category: 'Legal & Policy' },
    { id: 'safety-standards', title: 'Safety & Quality Standards', icon: ShieldAlert, category: 'Safety & Trust' },
    { id: 'help-support', title: 'Help & Support Center', icon: HelpCircle, category: 'Support' },
    { id: 'contact-support', title: 'Contact Support', icon: Headphones, category: 'Support' },
    { id: 'faqs', title: "Frequently Asked Questions", icon: MessageSquare, category: 'Support' },
  ];

  const handleTabChange = (id) => {
    setActiveTab(id);
    setRoute({ page: 'info', tab: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        societyName: '',
        category: 'General Query',
        message: ''
      });
    }, 4000);
  };

  const faqsList = [
    {
      q: "How does ordering work on DigiLocal Network?",
      a: "DigiLocal connects you directly with verified neighborhood vendors serving your specific residential society. When you select items and click 'Place Order via WhatsApp', a pre-formatted message is automatically generated in WhatsApp with your cart details. You send it directly to the vendor for fulfillment without any middleman markup or service fees.",
      cat: "Residents"
    },
    {
      q: "Are there any service charges or hidden fees for residents?",
      a: "No! DigiLocal Network is 100% free for residential buyers. You pay the exact price set by the local vendor with zero platform commissions or extra service charges.",
      cat: "Residents"
    },
    {
      q: "How are local vendors verified before listing?",
      a: "Every vendor on DigiLocal undergoes a strict multi-step vetting process including identity verification, business proof, local residential society approval, and compliance with our food & service safety standards.",
      cat: "Safety & Verification"
    },
    {
      q: "How can a vendor register on DigiLocal?",
      a: "Click on 'Register as Vendor' in the navigation header or footer. You can submit your shop name, contact number, catalog items, and select the residential societies you serve. The admin team reviews and activates your digital storefront within 24 hours.",
      cat: "Vendors"
    },
    {
      q: "How does DigiLocal ensure Child Security and minor safety?",
      a: "DigiLocal operates under strict zero-tolerance child protection protocols. All delivery personnel and vendors entering gated residential societies must be background-checked and identity-verified. No communication with minors is permitted without parent/guardian consent.",
      cat: "Safety & Verification"
    },
    {
      q: "What if my residential society is not listed on DigiLocal?",
      a: "You can click 'Request Society Addition' on the homepage to submit your society name and location. Our team will coordinate with your Resident Welfare Association (RWA) or managing committee to onboard your neighborhood vendors.",
      cat: "Residents"
    },
    {
      q: "Who handles payment processing and delivery refunds?",
      a: "Since DigiLocal facilitates direct commerce over WhatsApp, payments are handled directly between you and the vendor (via UPI, cash on delivery, or direct QR pay). For order issues or refunds, you communicate directly with the vendor via WhatsApp, or reach out to our Support team for mediation.",
      cat: "Residents"
    },
    {
      q: "Can vendors edit their prices and catalog items later?",
      a: "Yes! Registered vendors have access to their own Vendor Dashboard panel where they can update product pricing, add new items, toggle stock availability, and manage society service coverage in real-time.",
      cat: "Vendors"
    }
  ];

  const filteredFaqs = faqsList.filter(item => 
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#18281F] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#18281F] via-[#243A2D] to-[#18281F] text-[#F7F4EE] rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C4A066]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4A066]/20 border border-[#C4A066]/40 text-[#C4A066] text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Trust & Compliance Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Legal, Safety & Support Center
            </h1>
            <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
              We are committed to building a secure, transparent, and trusted hyperlocal network for residential societies, local vendors, and families.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl p-4 border border-[#E4DCC9] shadow-sm sticky top-24">
              <h3 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider px-3 mb-3">
                Information Sections
              </h3>
              <nav className="space-y-1">
                {navTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#18281F] text-[#F7F4EE] shadow-md font-semibold'
                          : 'text-[#18281F] hover:bg-[#EFE8D8] hover:text-[#18281F]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C4A066]' : 'text-[#6B7C70]'}`} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C4A066]' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Quick Contact Card */}
              <div className="mt-6 pt-6 border-t border-[#E4DCC9] px-2 text-center">
                <p className="text-xs text-[#6B7C70] mb-2 font-medium">Need immediate assistance?</p>
                <button
                  onClick={() => handleTabChange('contact-support')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EFE8D8] hover:bg-[#C4A066] hover:text-[#18281F] text-[#18281F] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#E4DCC9]"
                >
                  <Headphones className="w-3.5 h-3.5" /> Reach Support
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E4DCC9] shadow-sm min-h-[600px]">
              
              {/* TAB 1: PRIVACY POLICY */}
              {activeTab === 'privacy-policy' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <Lock className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Privacy Policy</h2>
                      <p className="text-xs text-[#6B7C70]">Last updated: July 2026</p>
                    </div>
                  </div>

                  <div className="prose text-xs sm:text-sm text-[#18281F]/80 space-y-4 leading-relaxed">
                    <p>
                      At <strong>DigiLocal Network</strong>, we respect your privacy and are committed to protecting the personal data of all residential buyers, local vendors, and society members using our platform.
                    </p>

                    <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E4DCC9] space-y-2">
                      <h4 className="font-bold text-[#18281F] text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Data Protection Commitments:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-[#6B7C70]">
                        <li>We do NOT sell or monetize your personal details to third-party advertisers.</li>
                        <li>We only store essential data required to match you with your residential society vendors.</li>
                        <li>All order interactions take place directly between your phone and vendor WhatsApp.</li>
                      </ul>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#18281F] pt-2">1. Information We Collect</h3>
                    <p>
                      We collect minimal information necessary to facilitate direct WhatsApp orders:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Residential Society Selection:</strong> Your chosen residential society location to filter local vendors.</li>
                      <li><strong>Vendor Profile Details:</strong> Shop names, contact numbers, catalog pricing, and society coverage areas.</li>
                      <li><strong>Contact Submissions:</strong> Information provided when filling support requests or society addition forms.</li>
                    </ul>

                    <h3 className="font-serif font-bold text-base text-[#18281F] pt-2">2. Direct WhatsApp Communications</h3>
                    <p>
                      When you initiate an order, DigiLocal constructs a structured WhatsApp message containing your selected items. When sent, communications are end-to-end encrypted by WhatsApp according to Meta's privacy protocols.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F] pt-2">3. Cookies & Local Browser Storage</h3>
                    <p>
                      We use local browser storage strictly to remember your active society preference and session cart items so you don't lose your selection when navigating between pages.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F] pt-2">4. Your Data Rights</h3>
                    <p>
                      You have the right to request deletion of any stored vendor profile or support record at any time by contacting our privacy compliance desk at <span className="text-[#C4A066] font-semibold">privacy@digilocal.network</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: CHILD SECURITY */}
              {activeTab === 'child-security' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <ShieldCheck className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Child Security & Protection Policy</h2>
                      <p className="text-xs text-[#6B7C70]">Zero-Tolerance Safe Neighborhood Environment</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Zero Tolerance Commitment</span>
                    </div>
                    <p className="leading-relaxed text-amber-800">
                      DigiLocal Network enforces mandatory safety standards for all vendors operating within residential societies. Safeguarding children and youth inside gated communities is our highest operational mandate.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#18281F]/80 leading-relaxed">
                    <h3 className="font-serif font-bold text-base text-[#18281F]">1. Verified Vendor & Staff Entry</h3>
                    <p>
                      All neighborhood vendors and delivery partners registered on DigiLocal Network serving residential complexes must hold verified government photo identification and comply with resident welfare association (RWA) gate security approvals.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">2. Protection of Minors</h3>
                    <p>
                      Vendor storefronts listing alcohol, tobacco, adult products, or age-restricted items are strictly prohibited on DigiLocal Network. All catalogs are regularly audited by system administrators.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">3. Safe Delivery Protocols</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Deliveries to homes must be handed directly to an adult resident or left at gate security.</li>
                      <li>Delivery staff are strictly prohibited from entering residences where only minors are present without explicit parental authorization.</li>
                      <li>Any inappropriate conduct towards children will result in immediate permanent expulsion, blacklisting, and referral to law enforcement.</li>
                    </ul>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">4. Reporting Safety Incidents</h3>
                    <p>
                      If you observe any suspicious behavior or policy violation within your society involving a registered vendor, contact our 24/7 Safety Desk immediately at <span className="text-[#C4A066] font-semibold">safety@digilocal.network</span> or notify local society security.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: TERMS & CONDITIONS */}
              {activeTab === 'terms-and-conditions' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <FileText className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Terms & Conditions</h2>
                      <p className="text-xs text-[#6B7C70]">User Agreement & Platform Guidelines</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#18281F]/80 leading-relaxed">
                    <p>
                      Welcome to <strong>DigiLocal Network</strong>. By accessing or using our platform, website, and services, you agree to comply with and be bound by the following Terms & Conditions.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">1. Platform Scope & Facilitation</h3>
                    <p>
                      DigiLocal Network acts as an information directory and order-formatting technology connecting residential buyers with local independent vendors. DigiLocal does not own, manufacture, store, or directly deliver goods.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">2. Vendor Obligations</h3>
                    <p>
                      Vendors registering on DigiLocal agree to provide accurate item descriptions, honor displayed pricing, maintain hygiene and safety standards, and adhere to local commerce laws and society entry regulations.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">3. Pricing & Direct Payments</h3>
                    <p>
                      Item prices displayed on vendor pages are set independently by vendors. Payments are settled directly between buyer and vendor via UPI, Cash, or Direct QR transfer. DigiLocal charges zero commission on resident transactions.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#18281F]">4. Limitation of Liability</h3>
                    <p>
                      While DigiLocal vets vendors, we are not responsible for product quality defects, delivery delays caused by external factors, or commercial disputes between buyers and vendors. However, our support team actively mediates unresolved issues.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: SAFETY STANDARDS */}
              {activeTab === 'safety-standards' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <ShieldAlert className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Safety & Quality Standards</h2>
                      <p className="text-xs text-[#6B7C70]">Hyperlocal Trust & Verification Pillars</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#18281F] text-[#C4A066] flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="font-bold text-[#18281F] text-sm">Identity & Location Vetting</h4>
                      <p className="text-xs text-[#6B7C70] leading-relaxed">
                        Every vendor profile is verified against valid government identity and physical shop location to prevent unauthorized listings.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#18281F] text-[#C4A066] flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="font-bold text-[#18281F] text-sm">Freshness & Hygiene Protocol</h4>
                      <p className="text-xs text-[#6B7C70] leading-relaxed">
                        Food and grocery vendors adhere to strict food safety guidelines, clean packaging, and hygienic handling for residential deliveries.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#18281F] text-[#C4A066] flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="font-bold text-[#18281F] text-sm">Transparent WhatsApp Ordering</h4>
                      <p className="text-xs text-[#6B7C70] leading-relaxed">
                        Orders are placed openly over WhatsApp, creating a permanent timestamped chat record for both buyer and seller.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-[#18281F] text-[#C4A066] flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <h4 className="font-bold text-[#18281F] text-sm">Community Feedback & Blacklisting</h4>
                      <p className="text-xs text-[#6B7C70] leading-relaxed">
                        Vendors receiving repeated complaints regarding quality, pricing, or gate security breaches face suspension and removal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HELP & SUPPORT */}
              {activeTab === 'help-support' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <HelpCircle className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Help & Support Center</h2>
                      <p className="text-xs text-[#6B7C70]">Guides & Step-by-Step Assistance</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-serif font-bold text-base text-[#18281F] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C4A066]" /> How to Place an Order in 3 Simple Steps
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9]">
                          <span className="text-xs font-bold text-[#C4A066] uppercase tracking-wider block mb-1">Step 1</span>
                          <h4 className="font-bold text-xs text-[#18281F] mb-1">Select Your Society</h4>
                          <p className="text-xs text-[#6B7C70]">Search for your residential building or apartment complex on the home screen.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9]">
                          <span className="text-xs font-bold text-[#C4A066] uppercase tracking-wider block mb-1">Step 2</span>
                          <h4 className="font-bold text-xs text-[#18281F] mb-1">Browse & Build Cart</h4>
                          <p className="text-xs text-[#6B7C70]">Pick local vendors (groceries, dairy, services, food) and select your items.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9]">
                          <span className="text-xs font-bold text-[#C4A066] uppercase tracking-wider block mb-1">Step 3</span>
                          <h4 className="font-bold text-xs text-[#18281F] mb-1">Send via WhatsApp</h4>
                          <p className="text-xs text-[#6B7C70]">Click 'Order via WhatsApp'. A formatted message opens in your app ready to send!</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#18281F] text-[#F7F4EE] space-y-3">
                      <h4 className="font-serif font-bold text-lg text-white">Are you a Local Vendor?</h4>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        Grow your sales inside nearby gated residential societies. Create your free digital catalog today with zero commission fees!
                      </p>
                      <button
                        onClick={() => setRoute({ page: 'vendorRegister' })}
                        className="px-5 py-2.5 rounded-xl bg-[#C4A066] hover:bg-amber-400 text-[#18281F] font-bold text-xs transition-colors inline-flex items-center gap-2"
                      >
                        Register Vendor Shop <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: CONTACT SUPPORT */}
              {activeTab === 'contact-support' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E4DCC9]">
                    <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                      <Headphones className="w-5 h-5 text-[#C4A066]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#18281F]">Contact Support</h2>
                      <p className="text-xs text-[#6B7C70]">We're here to help 7 days a week</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-4">
                      {contactSubmitted ? (
                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                          <h3 className="text-lg font-serif font-bold text-emerald-900">Message Received!</h3>
                          <p className="text-xs text-emerald-700">
                            Thank you for reaching out. Our support team will review your query and respond via email or phone within 2 hours.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#18281F] mb-1">Your Full Name *</label>
                              <input
                                type="text"
                                required
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                placeholder="e.g. Ramesh Kumar"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#18281F] mb-1">Email Address</label>
                              <input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="e.g. ramesh@gmail.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#18281F] mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#18281F] mb-1">Query Category</label>
                              <select
                                value={contactForm.category}
                                onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                              >
                                <option>General Query</option>
                                <option>Order Issue / Vendor Dispute</option>
                                <option>Society Addition Request</option>
                                <option>Vendor Registration Assistance</option>
                                <option>Safety or Policy Violation</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#18281F] mb-1">Society Name (Optional)</label>
                            <input
                              type="text"
                              value={contactForm.societyName}
                              onChange={(e) => setContactForm({ ...contactForm, societyName: e.target.value })}
                              placeholder="e.g. Green Meadows Apartments, Phase 2"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#18281F] mb-1">Your Message / Detail *</label>
                            <textarea
                              rows={4}
                              required
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="Describe your question or issue in detail..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-[#18281F] hover:bg-[#243A2D] text-[#F7F4EE] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4 text-[#C4A066]" /> Send Message to Support
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Support Cards */}
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#18281F]">
                          <Mail className="w-4 h-4 text-[#C4A066]" />
                          <span>Email Support Desk</span>
                        </div>
                        <p className="text-xs text-[#6B7C70]">For official inquiries, society onboarding, or vendor disputes:</p>
                        <a href="mailto:support@digilocal.network" className="text-xs font-bold text-[#18281F] hover:text-[#C4A066] block">
                          support@digilocal.network
                        </a>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#F7F4EE] border border-[#E4DCC9] space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#18281F]">
                          <Clock className="w-4 h-4 text-[#C4A066]" />
                          <span>Support Hours</span>
                        </div>
                        <p className="text-xs text-[#6B7C70]">Monday – Sunday</p>
                        <p className="text-xs font-bold text-[#18281F]">8:00 AM – 9:00 PM IST</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-900 text-white space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#C4A066]">
                          <MessageSquare className="w-4 h-4" />
                          <span>Instant WhatsApp Help</span>
                        </div>
                        <p className="text-xs text-emerald-200/80">Need quick chat assistance?</p>
                        <a
                          href="https://wa.me/?text=Hi%20DigiLocal%20Support%2C%20I%20need%20assistance"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 rounded-xl bg-[#C4A066] hover:bg-amber-400 text-[#18281F] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          Chat on WhatsApp
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 7: FAQS */}
              {activeTab === 'faqs' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DCC9]">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EFE8D8] flex items-center justify-center text-[#18281F]">
                        <MessageSquare className="w-5 h-5 text-[#C4A066]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[#18281F]">Frequently Asked Questions</h2>
                        <p className="text-xs text-[#6B7C70]">Instant answers to common platform questions</p>
                      </div>
                    </div>
                  </div>

                  {/* Search Filter Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions (e.g., ordering, fees, vendor verification)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4DCC9] bg-[#F7F4EE] text-xs text-[#18281F] focus:outline-none focus:ring-2 focus:ring-[#C4A066]"
                    />
                  </div>

                  {/* FAQ Accordion List */}
                  <div className="space-y-3 pt-2">
                    {filteredFaqs.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6B7C70]">
                        No matching questions found for "{searchQuery}". Try another keyword or reach out to Contact Support!
                      </div>
                    ) : (
                      filteredFaqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div 
                            key={idx}
                            className="border border-[#E4DCC9] rounded-2xl overflow-hidden transition-all bg-[#F7F4EE]/50 hover:bg-[#F7F4EE]"
                          >
                            <button
                              onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                              className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#EFE8D8] text-[10px] font-bold text-[#18281F] uppercase tracking-wider shrink-0">
                                  {faq.cat}
                                </span>
                                <span className="font-bold text-xs sm:text-sm text-[#18281F]">{faq.q}</span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-[#6B7C70] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#C4A066]' : ''}`} />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 pt-1 border-t border-[#E4DCC9]/60 text-xs text-[#18281F]/80 leading-relaxed bg-white">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
