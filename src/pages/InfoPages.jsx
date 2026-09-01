import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  ShieldAlert, 
  HelpCircle, 
  Headphones, 
  Mail, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Building, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Send, 
  PhoneCall, 
  ArrowRight,
  MessageSquare,
  Building2,
  Store,
  MapPin,
  Users
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_NAV_TABS = [
  { id: 'about-us', title: 'Our Story & Vision', icon: HeartHandshake },
  { id: 'how-it-works', title: 'How It Works', icon: Sparkles },
  { id: 'privacy-policy', title: 'Privacy Policy', icon: Lock },
  { id: 'refund-policy', title: 'Refund & Cancellation Policy', icon: RefreshCw },
  { id: 'child-security', title: 'Child Security Policy', icon: ShieldCheck },
  { id: 'terms-and-conditions', title: 'Terms & Conditions', icon: FileText },
  { id: 'safety-standards', title: 'Safety & Quality Standards', icon: ShieldAlert },
  { id: 'help-support', title: 'Help & Support Center (with FAQs)', icon: HelpCircle },
  { id: 'contact-support', title: 'Contact Support', icon: Headphones }
];

const FAQS_DATA = [
  { q: 'How does ordering work on DigiLocal?', a: 'You select your residential society, browse verified local vendors, build your cart, and click "Order via WhatsApp". A structured receipt is generated directly in your app ready to send to the vendor.', cat: 'Ordering' },
  { q: 'Are there any hidden delivery charges or platform fees?', a: 'No! DigiLocal operates with 100% transparent pricing. Vendors list their fair prices, and you pay them directly with zero platform markup.', cat: 'Pricing' },
  { q: 'How fast will my order arrive at my society door?', a: 'Because vendors are located directly inside or beside your gated community, average delivery time is under 15 minutes.', cat: 'Delivery' },
  { q: 'How do I pay for my orders?', a: 'You pay the vendor directly upon delivery or via direct UPI QR transfer / Cash on Delivery.', cat: 'Payments' },
  { q: 'What if an item is damaged or out of stock?', a: 'You can immediately inform the vendor over WhatsApp. Since they are your neighborhood store, replacements or instant refunds are processed right away.', cat: 'Refunds' },
  { q: 'How can I register my store as a vendor on DigiLocal?', a: 'Click "Become a Vendor" in the header menu, fill in your shop name, phone number, catalog items, and select your target residential societies. Registration takes under 2 minutes.', cat: 'Vendors' }
];

export default function InfoPages({ currentRoute, tab, setRoute }) {
  const activeTab = currentRoute?.tab || tab || 'about-us';

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', category: 'General Query', message: '', societyName: '' });
  const [howItWorksSection, setHowItWorksSection] = useState('all');
  const [cmsContacts, setCmsContacts] = useState({ email: 'support@digilocal.network', phone: '+91 800-562-5999', working_hours: 'Mon-Sun: 7:00 AM - 11:00 PM' });
  const [navTabs, setNavTabs] = useState(DEFAULT_NAV_TABS);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const res = await api.getCmsContent();
        if (res?.data?.contacts) setCmsContacts(res.data.contacts);
      } catch (_) {}
    };
    fetchCmsData();
  }, []);

  const handleTabChange = (tabId) => {
    setRoute({ page: 'info', tab: tabId });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const filteredFaqs = FAQS_DATA.filter((item) =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-[#211A19] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Banner in Dark Espresso #211A19 */}
        <div className="bg-[#211A19] text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6B7A5]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#541D26] text-white text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C8A878]" />
              Official DigiLocal Center
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white">
              {navTabs.find((t) => t.id === activeTab)?.title || 'Information & Support'}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#D6B7A5] font-medium leading-relaxed">
              Transparent policies, operational guidelines, and 24/7 help desk for residents, gated communities, and local merchants across India.
            </p>
          </div>
        </div>

        {/* Main Content 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Navigation (3 columns) */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-4 shadow-sm border border-[#E5DAD0] sticky top-24 space-y-3">
            <div className="px-3 pt-2 pb-1">
              <h3 className="text-xs font-extrabold text-[#211A19] uppercase tracking-wider">Navigation Menu</h3>
            </div>
            
            <nav className="space-y-1">
              {navTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#541D26] text-white shadow-md'
                        : 'text-[#211A19] hover:bg-[#EEE5DA] hover:text-[#541D26]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C8A878]' : 'text-[#541D26]'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C8A878]' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#E5DAD0] px-2 space-y-2">
              <div className="text-[11px] font-medium text-[#211A19]/70 px-1">
                Need direct assistance?
              </div>
              <button
                onClick={() => handleTabChange('contact-support')}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#541D26] hover:text-white text-[#541D26] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#541D26] cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>

          {/* Main Content Area (9 columns out of 12 for full responsive layout) */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5DAD0] shadow-sm min-h-[600px]">
              
              {/* TAB 1: OUR STORY & VISION */}
              {activeTab === 'about-us' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <HeartHandshake className="w-6 h-6 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Our Story — Empowering Hyperlocal Neighborhoods</h2>
                      <p className="text-xs text-[#211A19]/70">Building thriving communities, one doorstep at a time.</p>
                    </div>
                  </div>

                  {/* Origin & Mission Banner in Dark Espresso #211A19 */}
                  <div className="bg-[#211A19] text-white p-6 sm:p-8 rounded-3xl space-y-4 relative overflow-hidden shadow-md border border-white/10">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#C8A878]/15 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-xs font-extrabold text-[#C8A878] uppercase tracking-widest block">The Genesis</span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Why We Created DigiLocal</h3>
                    <p className="text-xs sm:text-sm text-[#D6B7A5] leading-relaxed max-w-2xl">
                      Every gated housing society is home to incredible talent — passionate home bakers, organic micro-growers, expert craftspeople, and florists. Yet residents often ended up ordering mass-produced goods from distant warehouses. DigiLocal bridges this gap by creating an instant, direct hyperlocal marketplace inside your residential community.
                    </p>
                  </div>

                  {/* 4 Pillars Grid (Pure White Cards with Oxblood Badge Icons) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs hover:border-[#541D26]/30 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-[#541D26] flex items-center justify-center text-white mb-1 shadow-xs">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#211A19]">Hyperlocal First</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Vendors are located directly within or right beside your registered residential society.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs hover:border-[#541D26]/30 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-[#541D26] flex items-center justify-center text-white mb-1 shadow-xs">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#211A19]">10–15 Min Delivery</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Lightning-fast fulfillment from neighborhood vendors without long transport delays.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs hover:border-[#541D26]/30 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-[#541D26] flex items-center justify-center text-white mb-1 shadow-xs">
                        <UserCheck className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#211A19]">Society Verified</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Every listed vendor undergoes identity verification and society compliance checks.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs hover:border-[#541D26]/30 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-[#541D26] flex items-center justify-center text-white mb-1 shadow-xs">
                        <Sparkles className="w-4 h-4 text-[#C8A878]" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#211A19]">Zero Markup & Fair Trade</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Direct WhatsApp commerce with zero platform commissions, supporting local families.
                      </p>
                    </div>
                  </div>

                  {/* Impact Stats Row */}
                  <div className="p-6 rounded-3xl bg-[#EEE5DA] border border-[#E5DAD0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <span className="text-2xl sm:text-3xl font-serif font-black text-[#541D26] block">100+</span>
                      <span className="text-[11px] font-bold text-[#211A19] uppercase">Societies</span>
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-serif font-black text-[#541D26] block">500+</span>
                      <span className="text-[11px] font-bold text-[#211A19] uppercase">Vendors</span>
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-serif font-black text-[#541D26] block">15k+</span>
                      <span className="text-[11px] font-bold text-[#211A19] uppercase">Orders</span>
                    </div>
                    <div>
                      <span className="text-2xl sm:text-3xl font-serif font-black text-[#541D26] block">12 Mins</span>
                      <span className="text-[11px] font-bold text-[#211A19] uppercase">Avg Delivery</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HOW IT WORKS */}
              {activeTab === 'how-it-works' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DAD0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                        <Sparkles className="w-6 h-6 text-[#541D26]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[#211A19]">How DigiLocal Works</h2>
                        <p className="text-xs text-[#211A19]/70">Hyperlocal commerce simplified for residents and local businesses.</p>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-1.5 bg-[#EEE5DA] p-1 rounded-full text-xs font-bold shrink-0">
                      <button
                        onClick={() => setHowItWorksSection('residents')}
                        className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                          howItWorksSection === 'residents' ? 'bg-[#541D26] text-white shadow-xs font-extrabold' : 'text-[#211A19] hover:text-[#541D26]'
                        }`}
                      >
                        For Residents
                      </button>
                      <button
                        onClick={() => setHowItWorksSection('vendors')}
                        className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                          howItWorksSection === 'vendors' ? 'bg-[#541D26] text-white shadow-xs font-extrabold' : 'text-[#211A19] hover:text-[#541D26]'
                        }`}
                      >
                        For Vendors
                      </button>
                    </div>
                  </div>

                  {/* SECTION 1: FOR RESIDENTS */}
                  {(howItWorksSection === 'all' || howItWorksSection === 'residents') && (
                    <div className="space-y-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                          🏡
                        </div>
                        <div>
                          <h3 className="font-serif font-extrabold text-lg text-[#211A19]">1. For Residents & Society Families</h3>
                          <p className="text-xs text-[#211A19]/70">Order fresh essentials & local services directly to your doorstep in 4 steps.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden group hover:border-[#541D26] transition-colors shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">1</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">Select Society</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Search & choose your registered residential apartment complex to discover approved local vendors serving your gate.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden group hover:border-[#541D26] transition-colors shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">2</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">Browse Stores</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Explore fresh bakery goods, organic dairy, flowers, laundry, and home services operating in your neighborhood block.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden group hover:border-[#541D26] transition-colors shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">3</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">Instant Order</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Build your cart and click 'Order via WhatsApp'. A structured receipt is generated directly in your app with zero extra fees.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden group hover:border-[#541D26] transition-colors shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">4</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">10–15 Min Delivery</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Your neighborhood shop or society runner delivers fresh items directly to your flat door with safe gate verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: FOR VENDORS */}
                  {(howItWorksSection === 'all' || howItWorksSection === 'vendors') && (
                    <div className="space-y-5 pt-4 border-t border-[#E5DAD0]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                          🏪
                        </div>
                        <div>
                          <h3 className="font-serif font-extrabold text-lg text-[#211A19]">2. For Local Vendors & Shop Owners</h3>
                          <p className="text-xs text-[#211A19]/70">Digitize your neighborhood store and serve nearby gated communities with zero commission.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">1</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">Register Store</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Create your vendor profile in 2 minutes. Add shop name, phone number, and select the residential societies you service.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">2</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">Add Products</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Upload catalog items, item prices, photos, and stock status using your easy Vendor Panel dashboard.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">3</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">WhatsApp Orders</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Incoming orders arrive instantly on your WhatsApp with customer flat/tower numbers and clear cart items.
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 relative overflow-hidden shadow-xs">
                          <span className="w-7 h-7 rounded-full bg-[#541D26] text-white font-bold text-xs flex items-center justify-center">4</span>
                          <h4 className="font-serif font-bold text-base text-[#211A19]">0% Commission</h4>
                          <p className="text-xs text-[#211A19]/75 leading-relaxed">
                            Collect 100% of your payment directly via UPI or cash with zero platform commissions or middleman deductions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PRIVACY POLICY */}
              {activeTab === 'privacy-policy' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <Lock className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Privacy Policy</h2>
                      <p className="text-xs text-[#211A19]/70">Last updated: July 2026</p>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-[#211A19]/90 space-y-4 leading-relaxed">
                    <p>
                      At <strong>DigiLocal Network</strong>, we respect your privacy and are committed to protecting the personal data of all residential buyers, local vendors, and society members using our platform.
                    </p>

                    <div className="bg-[#EEE5DA] p-5 rounded-2xl border border-[#E5DAD0] space-y-2">
                      <h4 className="font-bold text-[#541D26] text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#541D26]" /> Key Data Protection Commitments:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-[#211A19]/80">
                        <li>We do NOT sell or monetize your personal details to third-party advertisers.</li>
                        <li>We only store essential data required to match you with your residential society vendors.</li>
                        <li>All order interactions take place directly between your phone and vendor WhatsApp.</li>
                      </ul>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#211A19] pt-2">1. Information We Collect</h3>
                    <p>
                      We collect minimal information necessary to facilitate direct WhatsApp orders:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Residential Society Selection:</strong> Your chosen residential society location to filter local vendors.</li>
                      <li><strong>Vendor Profile Details:</strong> Shop names, contact numbers, catalog pricing, and society coverage areas.</li>
                      <li><strong>Contact Submissions:</strong> Information provided when filling support requests or society addition forms.</li>
                    </ul>

                    <h3 className="font-serif font-bold text-base text-[#211A19] pt-2">2. Direct WhatsApp Communications</h3>
                    <p>
                      When you initiate an order, DigiLocal constructs a structured WhatsApp message containing your selected items. When sent, communications are end-to-end encrypted by WhatsApp according to Meta's privacy protocols.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19] pt-2">3. Cookies & Local Browser Storage</h3>
                    <p>
                      We use local browser storage strictly to remember your active society preference and session cart items so you don't lose your selection when navigating between pages.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19] pt-2">4. Your Data Rights</h3>
                    <p>
                      You have the right to request deletion of any stored vendor profile or support record at any time by contacting our privacy compliance desk at <span className="text-[#541D26] font-semibold">support@digilocal.in</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: REFUND & CANCELLATION POLICY */}
              {activeTab === 'refund-policy' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <RefreshCw className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Refund & Cancellation Policy</h2>
                      <p className="text-xs text-[#211A19]/70">100% Resident Satisfaction & Protection Protocol</p>
                    </div>
                  </div>

                  <div className="bg-[#EEE5DA] border border-[#E5DAD0] rounded-2xl p-5 text-[#211A19] text-xs sm:text-sm space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-[#541D26]">
                      <CheckCircle2 className="w-4 h-4 text-[#541D26] shrink-0" />
                      <span>Zero Hassle Protection Commitment</span>
                    </div>
                    <p className="leading-relaxed text-[#211A19]/80">
                      DigiLocal Network is dedicated to ensuring a reliable, fresh, and delightful neighborhood shopping experience. Because you deal directly with trusted local vendors serving your society, refunds and replacements are processed swiftly with zero unnecessary paperwork.
                    </p>
                  </div>

                  <div className="space-y-6 text-xs sm:text-sm text-[#211A19]/90 leading-relaxed">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center space-x-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#541D26] text-white text-[11px] font-sans font-bold flex items-center justify-center shrink-0">1</span>
                        <span>Order Cancellation Guidelines</span>
                      </h3>
                      <div className="pl-8 space-y-2">
                        <p>
                          <strong>Before Dispatch / Preparation:</strong> You can cancel your order free of charge at any time before the vendor has dispatched or started preparing your items. Simply send a quick cancellation message directly to the vendor via WhatsApp.
                        </p>
                        <p>
                          <strong>Pre-Paid Orders:</strong> If you paid upfront via UPI or QR code and cancel before dispatch, 100% of your payment will be refunded immediately back to your UPI VPA account within 2 to 24 hours.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center space-x-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#541D26] text-white text-[11px] font-sans font-bold flex items-center justify-center shrink-0">2</span>
                        <span>Eligibility for Instant Refund or Free Replacement</span>
                      </h3>
                      <div className="pl-8 space-y-2">
                        <p>You are eligible for a 100% full refund or immediate free replacement under the following conditions:</p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#211A19]/80">
                          <li><strong>Damaged, Defective, or Spoiled Goods:</strong> Perishable items (fresh milk, bakery products, fruits, vegetables, paneer) received damaged or past expiry date.</li>
                          <li><strong>Incorrect or Missing Items:</strong> Delivered items do not match what you ordered in your WhatsApp cart receipt.</li>
                          <li><strong>Significant Delivery Delay:</strong> Order was delayed beyond reasonable society delivery timeframe without prior notification.</li>
                          <li><strong>Vendor Out-of-Stock:</strong> Item was paid for but unavailable for immediate fulfillment.</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center space-x-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#541D26] text-white text-[11px] font-sans font-bold flex items-center justify-center shrink-0">3</span>
                        <span>Refund Turnaround Time & Modes</span>
                      </h3>
                      <div className="pl-8 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="bg-white border border-[#E5DAD0] rounded-xl p-4 space-y-1 shadow-xs">
                            <h4 className="font-bold text-xs text-[#541D26]">UPI / Online Payments</h4>
                            <p className="text-[11px] text-[#211A19]/80 leading-relaxed">Refunds credited directly to your original GPay / PhonePe / Paytm / BHIM UPI VPA account within <strong>2 to 24 hours</strong>.</p>
                          </div>
                          <div className="bg-white border border-[#E5DAD0] rounded-xl p-4 space-y-1 shadow-xs">
                            <h4 className="font-bold text-xs text-[#541D26]">Cash on Delivery (COD)</h4>
                            <p className="text-[11px] text-[#211A19]/80 leading-relaxed">Refund issued as instant UPI transfer or credited towards your next society store delivery.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CHILD SECURITY POLICY */}
              {activeTab === 'child-security' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <ShieldCheck className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Child Security & Protection Policy</h2>
                      <p className="text-xs text-[#211A19]/70">Zero-Tolerance Safe Neighborhood Environment</p>
                    </div>
                  </div>

                  <div className="bg-[#EEE5DA] border border-[#E5DAD0] rounded-2xl p-5 text-[#211A19] text-xs sm:text-sm space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-[#541D26]">
                      <AlertTriangle className="w-4 h-4 text-[#541D26] shrink-0" />
                      <span>Zero Tolerance Commitment</span>
                    </div>
                    <p className="leading-relaxed text-[#211A19]/80">
                      DigiLocal Network enforces mandatory safety standards for all vendors operating within residential societies. Safeguarding children and youth inside gated communities is our highest operational mandate.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#211A19]/90 leading-relaxed">
                    <h3 className="font-serif font-bold text-base text-[#211A19]">1. Verified Vendor & Staff Entry</h3>
                    <p>
                      All neighborhood vendors and delivery partners registered on DigiLocal Network serving residential complexes must hold verified government photo identification and comply with resident welfare association (RWA) gate security approvals.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19]">2. Protection of Minors</h3>
                    <p>
                      Vendor storefronts listing alcohol, tobacco, adult products, or age-restricted items are strictly prohibited on DigiLocal Network. All catalogs are regularly audited by system administrators.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19]">3. Safe Delivery Protocols</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Deliveries to homes must be handed directly to an adult resident or left at gate security.</li>
                      <li>Delivery staff are strictly prohibited from entering residences where only minors are present without explicit parental authorization.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 6: TERMS & CONDITIONS */}
              {activeTab === 'terms-and-conditions' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <FileText className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Terms & Conditions</h2>
                      <p className="text-xs text-[#211A19]/70">User Agreement & Platform Guidelines</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-[#211A19]/90 leading-relaxed">
                    <p>
                      Welcome to <strong>DigiLocal Network</strong>. By accessing or using our platform, website, and services, you agree to comply with and be bound by the following Terms & Conditions.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19]">1. Platform Scope & Facilitation</h3>
                    <p>
                      DigiLocal Network acts as an information directory and order-formatting technology connecting residential buyers with local independent vendors. DigiLocal does not own, manufacture, store, or directly deliver goods.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19]">2. Vendor Obligations</h3>
                    <p>
                      Vendors registering on DigiLocal agree to provide accurate item descriptions, honor displayed pricing, maintain hygiene and safety standards, and adhere to local commerce laws and society entry regulations.
                    </p>

                    <h3 className="font-serif font-bold text-base text-[#211A19]">3. Pricing & Direct Payments</h3>
                    <p>
                      Item prices displayed on vendor pages are set independently by vendors. Payments are settled directly between buyer and vendor via UPI, Cash, or Direct QR transfer. DigiLocal charges zero commission on resident transactions.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 7: SAFETY STANDARDS */}
              {activeTab === 'safety-standards' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <ShieldAlert className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Safety & Quality Standards</h2>
                      <p className="text-xs text-[#211A19]/70">Hyperlocal Trust & Verification Pillars</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="font-bold text-[#211A19] text-sm">Identity & Location Vetting</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Every vendor profile is verified against valid government identity and physical shop location to prevent unauthorized listings.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="font-bold text-[#211A19] text-sm">Freshness & Hygiene Protocol</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Food and grocery vendors adhere to strict food safety guidelines, clean packaging, and hygienic handling for residential deliveries.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="font-bold text-[#211A19] text-sm">Transparent WhatsApp Ordering</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Orders are placed openly over WhatsApp, creating a permanent timestamped chat record for both buyer and seller.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-[#541D26] text-white flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <h4 className="font-bold text-[#211A19] text-sm">Community Feedback & Blacklisting</h4>
                      <p className="text-xs text-[#211A19]/75 leading-relaxed font-medium">
                        Vendors receiving repeated complaints regarding quality, pricing, or gate security breaches face suspension and removal.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: HELP & SUPPORT HUB (FAQS) */}
              {(activeTab === 'help-support' || activeTab === 'faqs') && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <HelpCircle className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Help & Support Center</h2>
                      <p className="text-xs text-[#211A19]/70">Interactive FAQs, How-To Guides & Quick Knowledgebase</p>
                    </div>
                  </div>

                  {/* Section 1: How to Place an Order */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#541D26]" /> How to Place an Order in 3 Simple Steps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] shadow-xs">
                        <span className="text-xs font-bold text-[#541D26] uppercase tracking-wider block mb-1">Step 1</span>
                        <h4 className="font-bold text-xs text-[#211A19] mb-1">Select Your Society</h4>
                        <p className="text-xs text-[#211A19]/75">Search for your residential building or apartment complex on the home screen.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] shadow-xs">
                        <span className="text-xs font-bold text-[#541D26] uppercase tracking-wider block mb-1">Step 2</span>
                        <h4 className="font-bold text-xs text-[#211A19] mb-1">Browse & Build Cart</h4>
                        <p className="text-xs text-[#211A19]/75">Pick local vendors (groceries, dairy, services, food) and select your items.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] shadow-xs">
                        <span className="text-xs font-bold text-[#541D26] uppercase tracking-wider block mb-1">Step 3</span>
                        <h4 className="font-bold text-xs text-[#211A19] mb-1">Send via WhatsApp</h4>
                        <p className="text-xs text-[#211A19]/75">Click 'Order via WhatsApp'. A formatted message opens in your app ready to send!</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: FAQs */}
                  <div className="space-y-4 pt-2 border-t border-[#E5DAD0]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#541D26]" /> Frequently Asked Questions (FAQs)
                      </h3>
                      <span className="text-xs text-[#211A19]/70">Instant answers for residents and vendors</span>
                    </div>

                    {/* Search Filter Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions (e.g., ordering, fees, vendor verification)..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                      />
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="space-y-3 pt-1">
                      {filteredFaqs.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#211A19]/70 font-medium">
                          No matching questions found for "{searchQuery}". Click below to send a message to our Support Team.
                        </div>
                      ) : (
                        filteredFaqs.map((faq, idx) => {
                          const isOpen = openFaqIndex === idx;
                          return (
                            <div
                              key={idx}
                              className="border border-[#E5DAD0] rounded-2xl overflow-hidden transition-all bg-white hover:border-[#541D26]/30 shadow-xs"
                            >
                              <button
                                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#541D26]/10 text-[10px] font-bold text-[#541D26] uppercase tracking-wider shrink-0">
                                    {faq.cat}
                                  </span>
                                  <span className="font-bold text-xs sm:text-sm text-[#211A19]">{faq.q}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-[#211A19]/60 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#541D26]' : ''}`} />
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 pt-1 border-t border-[#E5DAD0] text-xs text-[#211A19]/80 leading-relaxed bg-[#F6F0E8]/40">
                                  {faq.a}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Callout to Contact Support */}
                  <div className="p-6 rounded-2xl bg-[#211A19] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-white/10">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-serif font-bold text-base text-white flex items-center justify-center sm:justify-start gap-2">
                        <Headphones className="w-4.5 h-4.5 text-[#C8A878]" /> Need Direct Assistance?
                      </h4>
                      <p className="text-xs text-[#D6B7A5]">
                        Can't find what you're looking for? Submit a ticket or chat directly with our customer desk.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabChange('contact-support')}
                      className="px-5 py-3 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>Contact Support Team</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 9: CONTACT SUPPORT PAGE */}
              {activeTab === 'contact-support' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <Headphones className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Contact Support</h2>
                      <p className="text-xs text-[#211A19]/70">24/7 Assistance, Support Form & Direct Helpdesk Channels</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Contact Form (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                        <Send className="w-4 h-4 text-[#541D26]" /> Submit a Support Request
                      </h3>
                      {contactSubmitted ? (
                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                          <h3 className="text-lg font-serif font-bold text-emerald-900">Message Received!</h3>
                          <p className="text-xs text-emerald-700">
                            Thank you for reaching out. Our support team will review your query and respond via email or phone within 2 hours.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="space-y-4 font-sans">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Your Full Name *</label>
                              <input
                                type="text"
                                required
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                placeholder="e.g. Ramesh Kumar"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Email Address</label>
                              <input
                                type="email"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                placeholder="e.g. ramesh@gmail.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Query Category</label>
                              <select
                                value={contactForm.category}
                                onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
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
                            <label className="block text-xs font-bold text-[#211A19] mb-1">Society Name (Optional)</label>
                            <input
                              type="text"
                              value={contactForm.societyName}
                              onChange={(e) => setContactForm({ ...contactForm, societyName: e.target.value })}
                              placeholder="e.g. Green Meadows Apartments, Phase 2"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#211A19] mb-1">Your Message / Detail *</label>
                            <textarea
                              rows={3}
                              required
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="Describe your question or issue in detail..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Send className="w-4 h-4 text-white" /> Send Message to Support
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Direct Contact Cards (1 col) */}
                    <div className="space-y-3">
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-[#541D26]" /> Direct Contact Channels
                      </h3>

                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#541D26]">
                          <PhoneCall className="w-4 h-4 text-[#541D26]" />
                          <span>Customer Helpline Hotline</span>
                        </div>
                        <a href={`tel:${cmsContacts.phone}`} className="text-xs font-bold text-[#211A19] hover:underline block">
                          {cmsContacts.phone || '+91 800-562-5999'}
                        </a>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#541D26]">
                          <Mail className="w-4 h-4 text-[#541D26]" />
                          <span>Official Email Support Desk</span>
                        </div>
                        <a href={`mailto:${cmsContacts.email}`} className="text-xs font-bold text-[#211A19] hover:underline block">
                          {cmsContacts.email || 'support@digilocal.in'}
                        </a>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-xs">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#541D26]">
                          <Clock className="w-4 h-4 text-[#541D26]" />
                          <span>Working Hours</span>
                        </div>
                        <p className="text-xs font-bold text-[#211A19]">{cmsContacts.working_hours}</p>
                      </div>
                    </div>

                  </div>

                  {/* Vendor Registration Banner */}
                  <div className="p-5 rounded-2xl bg-[#211A19] text-white space-y-3 shadow-md border border-white/10">
                    <h4 className="font-serif font-bold text-lg text-white">Are you a Local Vendor?</h4>
                    <p className="text-xs text-[#D6B7A5] leading-relaxed">
                      Grow your sales inside nearby gated residential societies. Create your free digital catalog today with zero commission fees!
                    </p>
                    <button
                      onClick={() => setRoute({ page: 'vendorRegister' })}
                      className="px-5 py-2.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Register Store as Vendor</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
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
