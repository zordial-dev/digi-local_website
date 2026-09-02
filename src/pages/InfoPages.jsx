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
  Users,
  Paperclip,
  X
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
  { id: 'contact-support', title: 'Contact Support', icon: Headphones },
  { id: 'b2b-api-docs', title: 'Merchant Purchases API Docs (v1.0.0)', icon: FileText }
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
  const [contactForm, setContactForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    category: 'user_vs_vendor', 
    orderId: '', 
    targetVendor: '', 
    subject: '', 
    message: '' 
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactTicketResult, setContactTicketResult] = useState(null);
  const [pageAttachmentFile, setPageAttachmentFile] = useState(null);
  const [pageTicketsList, setPageTicketsList] = useState([]);
  const [pageTicketUserType, setPageTicketUserType] = useState('user'); // 'vendor' | 'user'
  const [supportSubTab, setSupportSubTab] = useState('submit'); // 'submit' | 'history'
  const [selectedPageTicket, setSelectedPageTicket] = useState(null);
  const [pageThreadMessages, setPageThreadMessages] = useState([]);
  const [pageReplyText, setPageReplyText] = useState('');
  const [pageReplyLoading, setPageReplyLoading] = useState(false);
  const [howItWorksSection, setHowItWorksSection] = useState('all');
  const [cmsContacts, setCmsContacts] = useState({ email: 'support@digilocal.network', phone: '+91 800-562-5999', working_hours: 'Mon-Sun: 7:00 AM - 11:00 PM' });
  const [navTabs, setNavTabs] = useState(DEFAULT_NAV_TABS);
  const [isVendorLoggedIn, setIsVendorLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('digilocal_vendor_session') || localStorage.getItem('activeVendor');
      if (saved) {
        const v = JSON.parse(saved);
        const vendorObj = v.vendor || v;
        if (vendorObj && (vendorObj.vendor_id || vendorObj.email || vendorObj.store_name || vendorObj.vendor_name)) {
          setIsVendorLoggedIn(true);
        }
      }
    } catch (_) {}
  }, []);

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
    if (activeTab === 'contact-support') {
      api.getResidentTickets().then(data => {
        if (Array.isArray(data)) setPageTicketsList(data);
      }).catch(() => {});
    }
  }, [activeTab]);

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

        {/* Mobile Horizontal Pill ScrollBar (Visible on screens smaller than lg) */}
        <div className="lg:hidden bg-white rounded-2xl p-2.5 border border-[#E5DAD0] shadow-xs overflow-x-auto no-scrollbar flex items-center gap-2">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#541D26] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#211A19] border border-[#E5DAD0] hover:bg-[#EEE5DA]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C8A878]' : 'text-[#541D26]'}`} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Desktop Left Sidebar Navigation (Visible on lg and larger screens) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white rounded-3xl p-4 shadow-sm border border-[#E5DAD0] sticky top-24 space-y-3">
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

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5DAD0] shadow-sm min-h-[600px]">
              
              {/* TAB 1: ABOUT DIGILOCAL / OUR STORY & VISION */}
              {activeTab === 'about-us' && (
                <div className="space-y-8 animate-fadeIn font-sans">
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-12 h-12 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <HeartHandshake className="w-6 h-6 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">About DigiLocal</h2>
                      <p className="text-xs text-[#211A19]/70">Powering Local Businesses Inside Communities</p>
                    </div>
                  </div>

                  {/* Origin & Mission Banner */}
                  <div className="bg-[#211A19] text-white p-6 sm:p-8 rounded-3xl space-y-4 relative overflow-hidden shadow-md border border-white/10">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#C8A878]/15 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-xs font-extrabold text-[#C8A878] uppercase tracking-widest block">Hyperlocal Digital Commerce</span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">Powering Local Businesses Inside Communities</h3>
                    <p className="text-xs sm:text-sm text-[#D6B7A5] leading-relaxed max-w-3xl">
                      DigiLocal is a hyperlocal digital commerce platform built to connect local vendors with residents of residential societies and gated communities. We believe that the neighbourhood shops people already trust should have access to simple, modern digital tools without having to build their own technology.
                    </p>
                  </div>

                  {/* What DigiLocal Does */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#541D26]" /> What DigiLocal Does
                    </h3>
                    <p className="text-xs text-[#211A19]/80 font-medium">
                      With DigiLocal Vendor, local merchants can manage their business digitally—from products and inventory to customer orders, deliveries and payouts:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Create & manage their digital store',
                        'Add products & manage pricing',
                        'Define product quantities & units',
                        'Update stock availability in real-time',
                        'Receive instant customer orders',
                        'Manage order status seamlessly',
                        'Track sales, earnings & performance',
                        'Receive automated T+1 payouts',
                        'Serve participating societies efficiently'
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E5DAD0] flex items-center gap-2.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-[#541D26] shrink-0" />
                          <span className="text-xs font-bold text-[#211A19]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Built for Local Commerce & Vision */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white border border-[#E5DAD0] space-y-2.5 shadow-sm">
                      <h4 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                        <Store className="w-4.5 h-4.5 text-[#541D26]" /> Built for Local Commerce
                      </h4>
                      <p className="text-xs text-[#211A19]/80 leading-relaxed font-medium">
                        DigiLocal is designed specifically for the unique needs of residential societies, gated communities and local neighbourhood commerce. Instead of relying only on traditional offline ordering, vendors can use DigiLocal to create a convenient digital connection with residents while continuing to operate their local businesses.
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-[#E5DAD0] space-y-2.5 shadow-sm">
                      <h4 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-[#541D26]" /> Our Vision
                      </h4>
                      <p className="text-xs text-[#211A19]/80 leading-relaxed font-medium">
                        Our vision is to make local commerce faster, simpler and more connected. We want residents to discover and order everyday essentials from trusted nearby businesses while giving local vendors the technology they need to grow their business digitally.
                      </p>
                    </div>
                  </div>

                  {/* Our Commitment (5 Pillars) */}
                  <div className="space-y-4">
                    <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#541D26]" /> Our Core Commitment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-xs">
                        <h4 className="font-serif font-bold text-sm text-[#541D26]">Local First</h4>
                        <p className="text-xs text-[#211A19]/80 font-medium">Supporting neighbourhood businesses and community-based commerce.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-xs">
                        <h4 className="font-serif font-bold text-sm text-[#541D26]">Simple Technology</h4>
                        <p className="text-xs text-[#211A19]/80 font-medium">Making digital tools easy for vendors to understand and use.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-xs">
                        <h4 className="font-serif font-bold text-sm text-[#541D26]">Reliable Service</h4>
                        <p className="text-xs text-[#211A19]/80 font-medium">Helping vendors respond to orders and serve customers efficiently.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-xs">
                        <h4 className="font-serif font-bold text-sm text-[#541D26]">Transparency</h4>
                        <p className="text-xs text-[#211A19]/80 font-medium">Providing clear information about orders, payments, payouts and platform services.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-xs sm:col-span-2 lg:col-span-1">
                        <h4 className="font-serif font-bold text-sm text-[#541D26]">Community Focus</h4>
                        <p className="text-xs text-[#211A19]/80 font-medium">Building a digital ecosystem that works for vendors, residents and participating societies.</p>
                      </div>
                    </div>
                  </div>

                  {/* Operating Entity & Slogan Banner */}
                  <div className="p-6 rounded-3xl bg-[#EEE5DA] border border-[#E5DAD0] space-y-3 text-[#211A19]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DAD0] pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#541D26] uppercase tracking-wider block">Operated By</span>
                        <h4 className="font-serif font-bold text-base text-[#211A19]">Zordial Technologies Private Limited</h4>
                        <p className="text-xs text-muted-foreground">Operating under the DigiLocal brand (DigiLocal Technologies)</p>
                      </div>
                      <div className="text-left sm:text-right text-xs font-mono">
                        <p><strong>Email:</strong> support@digilocal.in</p>
                        <p><strong>Helpline:</strong> +91 94613 53008</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#211A19]/80 font-medium">
                      <strong>Address:</strong> Near Tonk Road, Pratap Nagar, Jaipur, Rajasthan, India
                    </p>
                    <div className="pt-2 text-center">
                      <span className="font-serif italic font-black text-base text-[#541D26]">
                        DigiLocal — Your Society. Your Vendor. Your Doorstep.
                      </span>
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
                <div className="space-y-6 animate-fadeIn font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                        <Lock className="w-5 h-5 text-[#541D26]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[#211A19]">Privacy Policy</h2>
                        <p className="text-xs text-[#211A19]/70">DigiLocal Vendor Application Data & Privacy Specifications</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-right shrink-0">
                      <p className="text-muted-foreground font-bold">Effective: 10/08/2026</p>
                      <p className="text-[#541D26] font-bold">Last Updated: 18/08/2026</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#EEE5DA] border border-[#E5DAD0] rounded-2xl text-xs text-[#211A19] leading-relaxed">
                    This Privacy Policy explains how <strong>Zordial Technologies Private Limited</strong>, operating the DigiLocal platform (“DigiLocal”, “we”, “us” or “our”), collects, uses, stores and protects information when you use the DigiLocal Vendor application (<code>com.digilocal.vendor</code>) and related services.
                  </div>

                  <div className="space-y-6 text-xs sm:text-sm text-[#211A19]/90 leading-relaxed">
                    
                    {/* 1. Information We Collect */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">1. Information We Collect</h3>
                      
                      <div className="space-y-2">
                        <h4 className="font-bold text-xs text-[#211A19]">1.1 Vendor Personal Information:</h4>
                        <p className="text-xs text-[#211A19]/80">Full name, Mobile number, Email address, Account credentials, OTP authentication info, Profile details, Vendor verification info.</p>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-dashed border-[#E5DAD0]">
                        <h4 className="font-bold text-xs text-[#211A19]">1.2 Business Information:</h4>
                        <p className="text-xs text-[#211A19]/80">Store/business name, Shop address, Business category, Residential society name and Society ID, Store logo, Product catalogue, Product images, Business operating details.</p>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-dashed border-[#E5DAD0]">
                        <h4 className="font-bold text-xs text-[#211A19]">1.3 Government and Tax Information:</h4>
                        <p className="text-xs text-[#211A19]/80">GSTIN, PAN, GST documentation, and statutory compliance data reasonably required for legal onboarding.</p>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-dashed border-[#E5DAD0]">
                        <h4 className="font-bold text-xs text-[#211A19]">1.4 Banking and Payout Information:</h4>
                        <p className="text-xs text-[#211A19]/80">Account holder name, Bank account number, IFSC code, UPI ID, Payout history, Transaction references. Used strictly for settlement via banking service partners.</p>
                      </div>
                    </div>

                    {/* 2. Customer Information Accessible to Vendors */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">2. Customer Information Accessible to Vendors</h3>
                      <p className="text-xs text-[#211A19]/80">
                        When an order is placed, vendors receive necessary delivery details: Customer name, phone number, tower/block, flat/unit number, delivery notes, ordered items, quantity, unit, order value, and order status.
                      </p>
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900 text-xs">
                        <span className="font-bold block">Vendor Data-Use Restrictions & Strict Penalties</span>
                        <p className="text-[11px] leading-relaxed">
                          Customer data is strictly for order fulfillment. Vendors must not copy data unnecessarily, sell/share details, send unsolicited marketing, or contact customers for unrelated commercial purposes. Violations trigger immediate account suspension and legal action.
                        </p>
                      </div>
                    </div>

                    {/* 3. Device Permissions */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">3. Device Permissions Requested</h3>
                      <ul className="list-disc pl-5 space-y-2 text-xs text-[#211A19]/80 font-medium">
                        <li><strong>Notifications & Alarm Features:</strong> Used for high-priority order alerts, sound mechanisms, status updates, and payment alerts in background mode.</li>
                        <li><strong>Microphone:</strong> Used for voice-based product search and hands-free interactions (speech converted to text).</li>
                        <li><strong>Camera & Photos:</strong> Used to upload store logos, product photographs, catalog banners, and verification documents.</li>
                        <li><strong>Technical Information:</strong> IP address, device model, app version, FCM tokens, network status, crash logs, and security logs.</li>
                      </ul>
                    </div>

                    {/* 4. How We Use Information */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">4. How We Use Information</h3>
                      <p className="text-xs text-[#211A19]/80">
                        Used to create/verify accounts, authenticate via OTP, register with societies, manage catalog items, process orders, deliver goods, calculate commissions/settlements, execute T+1 payouts, provide helpdesk support, detect fraud, and maintain regulatory compliance.
                      </p>
                    </div>

                    {/* 5. Third-Party Service Providers */}
                    <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">5. Third-Party Service Providers</h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#211A19]/80 font-medium">
                        <li><strong>Firebase / Google:</strong> Phone authentication/OTP, Firebase Cloud Messaging (FCM), push notifications, analytics infrastructure.</li>
                        <li><strong>SMS Providers:</strong> Authorized gateways like MSG91 for OTPs and transaction alerts.</li>
                        <li><strong>Payment & Banking Partners:</strong> Licensed processors for customer checkout and T+1 vendor bank payouts.</li>
                        <li><strong>Cloud Infrastructure:</strong> Secure cloud providers like AWS, Google Cloud, and Render for system hosting.</li>
                      </ul>
                    </div>

                    {/* 6. Data Security & Retention */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-2xs">
                        <h3 className="font-serif font-bold text-sm text-[#541D26]">6. Data Security</h3>
                        <p className="text-xs text-[#211A19]/80 leading-relaxed font-medium">
                          Employs technical safeguards including encryption, access controls, secure API communication, monitoring logs, and role-based authorization.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-2 shadow-2xs">
                        <h3 className="font-serif font-bold text-sm text-[#541D26]">7. Data Retention</h3>
                        <p className="text-xs text-[#211A19]/80 leading-relaxed font-medium">
                          Retained only as long as necessary for order fulfillment, payouts, audit records, fraud prevention, and legal compliance.
                        </p>
                      </div>
                    </div>

                    {/* 8-12. Rights, Closure, Grievances, Law */}
                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD0] space-y-3 shadow-2xs">
                      <h3 className="font-serif font-bold text-base text-[#541D26]">8–12. Vendor Rights, Account Closure & Grievances</h3>
                      <p className="text-xs text-[#211A19]/80">
                        Vendors may request data access, correction, or account deletion by contacting our privacy officer. Account closure is subject to resolving pending payouts and legal retention rules.
                      </p>
                      <div className="p-3 bg-white border border-[#E5DAD0] rounded-xl text-xs space-y-1">
                        <p><strong>Grievance Officer Email:</strong> <a href="mailto:support@digilocal.in" className="text-[#541D26] font-mono font-bold hover:underline">support@digilocal.in</a></p>
                        <p><strong>Helpline:</strong> +91 94613 53008</p>
                        <p><strong>Address:</strong> Zordial Technologies Private Limited / DigiLocal Technologies, Near Tonk Road, Pratap Nagar, Jaipur, Rajasthan, India</p>
                        <p><strong>Governing Law:</strong> Governed by the laws of India.</p>
                      </div>
                    </div>

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
                <div className="space-y-6 animate-fadeIn font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                        <FileText className="w-5 h-5 text-[#541D26]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[#211A19]">Terms & Conditions</h2>
                        <p className="text-xs text-[#211A19]/70">DigiLocal Vendor Master Agreement & Platform Rules</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-right shrink-0">
                      <p className="text-muted-foreground font-bold">Effective: 10/08/2026</p>
                      <p className="text-[#541D26] font-bold">Last Updated: 18/08/2026</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#EEE5DA] border border-[#E5DAD0] rounded-2xl text-xs text-[#211A19] leading-relaxed">
                    These Terms & Conditions (“Terms”) govern your registration and use of the DigiLocal Vendor application and related services. DigiLocal is operated by <strong>Zordial Technologies Private Limited</strong> under the DigiLocal brand (“DigiLocal”, “we”, “us” or “our”). By registering as a vendor or using DigiLocal Vendor, you agree to these Terms.
                  </div>

                  <div className="space-y-6 text-xs sm:text-sm text-[#211A19]/90 leading-relaxed">
                    
                    {[
                      { title: '1. Vendor Eligibility', text: 'To register as a DigiLocal vendor, you must: Be legally authorized to operate the relevant business; Be authorized to sell within or service the registered society/community; Provide accurate registration information; Provide required business and statutory information; Comply with applicable laws and society/RWA rules. DigiLocal may verify the information provided during onboarding.' },
                      { title: '2. Vendor Account', text: 'You are responsible for maintaining the security of your account. You must: Keep OTPs and login credentials confidential; Not allow unauthorized persons to use your account; Keep your business information updated; Immediately report suspected unauthorized access. You are responsible for activity performed through your vendor account, except where applicable law provides otherwise.' },
                      { title: '3. Business and Statutory Information', text: 'Vendors must provide accurate information including, where applicable: Business name, Owner/authorized representative details, Shop address, Society information, GSTIN, PAN, Bank account information, and Other documents reasonably required for verification. Providing false, misleading or fraudulent information may result in account suspension or termination.' },
                      { title: '4. Product Catalogue', text: 'Vendors are responsible for ensuring that all products listed on DigiLocal are accurate and lawful. Product listings should correctly state: Product name, Product description, Selling price, MRP where applicable, Quantity, Unit of measurement (1 kg, 500 g, 1 litre, 500 ml, 1 packet, 1 piece, 1 box), Pack size, Product image, Availability, and Applicable taxes. Vendors must not intentionally misrepresent product quantity or unit.' },
                      { title: '5. Product Quality & Safety Standards', text: 'Vendors must supply genuine, safe and legally saleable products. Vendors must not knowingly list or sell: Expired products, Counterfeit products, Adulterated products, Illegal goods, Narcotics, Unauthorized medicines, Hazardous chemicals, or Prohibited goods. Food and other regulated products must comply with FSSAI and applicable legal requirements.' },
                      { title: '6. Stock Management', text: 'Vendors are responsible for maintaining accurate inventory information. Vendors should promptly mark products as In Stock or Out of Stock where applicable. Repeated acceptance of orders for unavailable products may result in account review or suspension.' },
                      { title: '7. Order Processing Lifecycle', text: 'Orders move through stages: PENDING → ACCEPTED → PREPARING → OUT FOR DELIVERY → DELIVERED / COMPLETED (or CANCELLED). Vendors must respond to incoming orders promptly and make reasonable efforts to fulfil accepted orders within the applicable service timeframe.' },
                      { title: '8. Order Cancellation Rules', text: 'A vendor may reject or cancel an order where reasonably necessary (Product unavailable, Operational closure, Technical/Safety issue, Delivery restriction, Suspected fraudulent order, Force Majeure). Repeated unnecessary cancellations may result in account review, penalties or suspension.' },
                      { title: '9. Delivery and Society Rules', text: 'Vendors and their delivery personnel must comply with applicable society/RWA rules, including security procedures, gate-entry requirements, visitor registration, delivery timings, parking rules, restricted areas, and resident safety requirements. Vendors are responsible for ensuring professional personnel conduct.' },
                      { title: '10. Customer Information Confidentiality', text: 'Customer information displayed through DigiLocal is confidential. Vendors may use customer information ONLY to prepare/deliver the order, resolve an order issue, or complete the transaction. Vendors must not use customer information for independent marketing or unrelated commercial activities.' },
                      { title: '11. Payments and Payouts (T+1 Settlement)', text: 'For eligible completed/delivered orders, vendor settlements are processed on a T+1 basis (targeted for processing on the next applicable business/settlement day). Deductions may include platform fees, commissions, payment-processing charges, applicable taxes, refunds, adjustments, or dispute deductions.' },
                      { title: '12. Refunds and Disputes', text: 'Where a customer reports missing, incorrect, damaged, expired, or defective products, or quantity discrepancies, DigiLocal may investigate the complaint. Where the issue is attributable to the vendor, applicable refunds or replacements may be deducted from vendor settlements.' },
                      { title: '13. Platform Fees and Commission', text: 'Applicable commissions, platform fees, subscription charges or other charges will be communicated to vendors through commercial agreements or the Platform. DigiLocal may update applicable fees by providing appropriate notice where required.' },
                      { title: '14. Taxes & Statutory Compliance', text: 'Vendors are responsible for their own tax and statutory obligations arising from their business. Vendors must provide accurate GST and statutory information. DigiLocal may collect, report, deduct or process taxes where required by law.' },
                      { title: '15. Prohibited Activities', text: 'Vendors must not upload false product info, manipulate prices/orders, create fraudulent orders, misuse customer data, circumvent platform fees, sell prohibited goods, upload malicious content, attempt unauthorized system access, manipulate reviews, or engage in abusive conduct.' },
                      { title: '16. Intellectual Property Rights', text: 'The DigiLocal name, logo, software, design, application interface and materials are owned by or licensed to Zordial Technologies Private Limited. Vendors remain responsible for ensuring uploaded images and materials do not infringe third-party rights.' },
                      { title: '17. Account Suspension and Termination', text: 'DigiLocal may suspend or terminate vendor accounts for repeated cancellations, failure to fulfil orders, selling expired/counterfeit goods, data misuse, fraud, false documentation, society rule violations, or breach of these Terms.' },
                      { title: '18. Platform Availability', text: 'DigiLocal aims to provide reliable services but does not guarantee uninterrupted availability due to maintenance, technical failures, network problems, payment provider issues, cloud outages, or circumstances beyond control.' },
                      { title: '19. Limitation of Liability', text: 'To the maximum extent permitted by law, DigiLocal shall not be responsible for indirect or consequential losses arising from a vendor\'s use of the Platform.' },
                      { title: '20. Vendor Indemnity', text: 'Vendors agree to indemnify DigiLocal against claims, losses or expenses arising from violation of Terms, sale of unlawful products, data misuse, false business info, vendor negligence, or third-party rights infringement.' },
                      { title: '21. Changes to Terms', text: 'DigiLocal may update these Terms from time to time. Continued use of DigiLocal Vendor after the effective date of updated Terms constitutes acceptance of revised Terms.' },
                      { title: '22. Support and Grievance Contact', text: 'Email: support@digilocal.in | Helpline: +91 94613 53008 | Operating Entity: Zordial Technologies Private Limited | Brand: DigiLocal Technologies | Address: Near Tonk Road, Pratap Nagar, Jaipur, Rajasthan, India' },
                      { title: '23. Governing Law & Jurisdiction', text: 'These Terms shall be governed by the laws applicable in India. Subject to applicable laws, disputes shall be subject to the jurisdiction of competent courts in Jaipur, Rajasthan.' },
                      { title: '24. Severability', text: 'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.' }
                    ].map((sec, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white border border-[#E5DAD0] space-y-1.5 shadow-2xs">
                        <h3 className="font-serif font-bold text-sm text-[#541D26]">{sec.title}</h3>
                        <p className="text-xs text-[#211A19]/80 leading-relaxed">{sec.text}</p>
                      </div>
                    ))}

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

              {/* TAB 8: HELP & SUPPORT HUB */}
              {(activeTab === 'help-support' || activeTab === 'faqs') && (
                <div className="space-y-8 animate-fadeIn font-sans">
                  
                  {/* Page Header */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                      <HelpCircle className="w-5 h-5 text-[#541D26]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-[#211A19]">Help & Support</h2>
                      <p className="text-xs text-[#211A19]/70">We're Here to Help — Complete Support Guide & Knowledge Base</p>
                    </div>
                  </div>

                  {/* Welcome Banner */}
                  <div className="bg-[#211A19] text-white p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden shadow-md border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A878]/10 rounded-full blur-3xl pointer-events-none" />
                    <span className="px-3 py-1 bg-[#541D26] text-[#C8A878] rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border border-[#C8A878]/30">
                      <Sparkles className="w-3 h-3 text-[#C8A878]" /> Official Vendor & Resident Help Desk
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white">We're Here to Help</h3>
                    <p className="text-xs sm:text-sm text-[#D6B7A5] leading-relaxed max-w-3xl">
                      Welcome to DigiLocal Support. If you need assistance with your account, orders, payments, products, catalog listings, or any other feature of the DigiLocal app & website, our dedicated support team is here to help.
                    </p>
                  </div>

                  {/* Common Help Topics Grid (6 Categories) */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5 text-[#541D26]" /> Common Help Topics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Topic 1: Account & Login */}
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#541D26]">
                          <UserCheck className="w-4 h-4 text-[#541D26]" />
                          <span className="font-serif text-sm text-[#211A19]">1. Account & Login</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#211A19]/80 pl-6 list-disc font-medium">
                          <li>Trouble logging in or receiving an OTP</li>
                          <li>Updating your mobile number or email address</li>
                          <li>Account verification issues</li>
                          <li>Password or account-security concerns</li>
                        </ul>
                      </div>

                      {/* Topic 2: Store & Profile */}
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#541D26]">
                          <Store className="w-4 h-4 text-[#541D26]" />
                          <span className="font-serif text-sm text-[#211A19]">2. Store & Profile</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#211A19]/80 pl-6 list-disc font-medium">
                          <li>Updating store information</li>
                          <li>Changing store category or society details</li>
                          <li>Uploading or changing your store logo</li>
                          <li>Updating business or GST information</li>
                        </ul>
                      </div>

                      {/* Topic 3: Products & Catalogue */}
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#541D26]">
                          <Building2 className="w-4 h-4 text-[#541D26]" />
                          <span className="font-serif text-sm text-[#211A19]">3. Products & Catalogue</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#211A19]/80 pl-6 list-disc font-medium">
                          <li>Adding or editing products & updating prices</li>
                          <li>Setting product units (kg, litre, packet, piece, etc.)</li>
                          <li>Updating stock status & uploading product images</li>
                          <li>Marking products as Out of Stock</li>
                        </ul>
                      </div>

                      {/* Topic 4: Orders */}
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#541D26]">
                          <FileText className="w-4 h-4 text-[#541D26]" />
                          <span className="font-serif text-sm text-[#211A19]">4. Orders</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#211A19]/80 pl-6 list-disc font-medium">
                          <li>New order notifications</li>
                          <li>Accepting or rejecting orders & updating order status</li>
                          <li>Preparing and completing orders</li>
                          <li>Delivery-related issues, cancelled or disputed orders</li>
                        </ul>
                      </div>

                      {/* Topic 5: Payments & Payouts */}
                      <div className="p-5 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#541D26]">
                          <RefreshCw className="w-4 h-4 text-[#541D26]" />
                          <span className="font-serif text-sm text-[#211A19]">5. Payments & Payouts</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#211A19]/80 pl-6 list-disc font-medium">
                          <li>Checking earnings & viewing payout history</li>
                          <li>Bank-account verification & T+1 settlement queries</li>
                          <li>Missing or delayed payouts</li>
                          <li>Commission or platform-fee queries</li>
                        </ul>
                      </div>

                      {/* Topic 6: Customer Issues */}
                      <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 shadow-xs hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-700" />
                          <span className="font-serif text-sm text-rose-950">6. Customer Issues & Disputes</span>
                        </div>
                        <p className="text-xs text-rose-900/90 leading-relaxed font-medium">
                          If a customer reports a missing, incorrect, damaged, expired or defective product, please contact DigiLocal Support promptly and cooperate with the resolution process.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Contact Details & Entity Information Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Contact Channels */}
                    <div className="p-6 rounded-3xl bg-white border border-[#E5DAD0] space-y-4 shadow-sm">
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2 pb-2 border-b border-[#E5DAD0]">
                        <PhoneCall className="w-4 h-4 text-[#541D26]" /> Contact DigiLocal Support
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DAD0]">
                          <Mail className="w-4 h-4 text-[#541D26] shrink-0" />
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block">Official Email</span>
                            <a href="mailto:support@digilocal.in" className="font-mono font-bold text-[#541D26] hover:underline">
                              support@digilocal.in
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DAD0]">
                          <PhoneCall className="w-4 h-4 text-[#541D26] shrink-0" />
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block">Helpline Hotline</span>
                            <a href="tel:+919461353008" className="font-mono font-bold text-[#541D26] hover:underline">
                              +91 94613 53008
                            </a>
                          </div>
                        </div>

                        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1 text-[#211A19]">
                          <span className="font-bold text-amber-900 block text-xs">When Contacting Support</span>
                          <p className="text-[11px] text-amber-900/80 leading-relaxed">
                            Please provide vendor/store name, registered mobile number, Order ID, society name, issue description, and relevant screenshots/photographs to help us resolve your issue faster.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operating Entity & Registered Office Address */}
                    <div className="p-6 rounded-3xl bg-white border border-[#E5DAD0] space-y-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2 pb-2 border-b border-[#E5DAD0]">
                          <Building className="w-4 h-4 text-[#541D26]" /> Operating Entity & Platform Information
                        </h3>

                        <div className="space-y-3 text-xs pt-3">
                          <div className="flex justify-between border-b border-dashed border-[#E5DAD0] pb-2">
                            <span className="text-muted-foreground font-semibold">Operating Entity:</span>
                            <span className="font-bold text-[#211A19]">Zordial Technologies Private Limited</span>
                          </div>

                          <div className="flex justify-between border-b border-dashed border-[#E5DAD0] pb-2">
                            <span className="text-muted-foreground font-semibold">Platform:</span>
                            <span className="font-bold text-[#211A19]">DigiLocal Technologies</span>
                          </div>

                          <div className="flex items-start gap-2 pt-1">
                            <MapPin className="w-4 h-4 text-[#541D26] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-muted-foreground font-semibold block text-[11px]">Registered Office Address:</span>
                              <p className="font-bold text-[#211A19] leading-relaxed">
                                Near Tonk Road, Pratap Nagar, Jaipur, Rajasthan, India
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Warning Banner */}
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-rose-900 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-950">
                          <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                          <span>Important Security Notice</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                          DigiLocal Support will never ask you to share your OTP, password, UPI PIN, ATM PIN or other confidential credentials. Do not share such info with anyone claiming to represent DigiLocal.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Section 2: How to Place an Order */}
                  <div className="space-y-4 pt-2">
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
                <div className="space-y-6 animate-fadeIn font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DAD0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#541D26]/10 flex items-center justify-center text-[#541D26]">
                        <Headphones className="w-5 h-5 text-[#541D26]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[#211A19]">Contact Support</h2>
                        <p className="text-xs text-[#211A19]/70">24/7 Assistance, Support Form & Direct Helpdesk Channels</p>
                      </div>
                    </div>

                    {/* My Tickets Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        const nextTab = supportSubTab === 'history' ? 'submit' : 'history';
                        setSupportSubTab(nextTab);
                        if (nextTab === 'history') {
                          try {
                            const list = await api.getResidentTickets();
                            if (Array.isArray(list)) setPageTicketsList(list);
                          } catch (_) {}
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border self-start sm:self-auto ${
                        supportSubTab === 'history' ? 'bg-[#541D26] text-white border-[#541D26] shadow-xs' : 'bg-[#EEE5DA]/60 text-[#211A19] border-[#E5DAD0] hover:bg-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{supportSubTab === 'history' ? '← Back to Support Form' : `My Tickets (${pageTicketsList.length})`}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Support Form / Ticket Viewer (2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      
                      {/* VIEW A: SUBMIT SUPPORT REQUEST FORM */}
                      {supportSubTab === 'submit' && (
                        <div>
                          <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2 mb-3">
                            <Send className="w-4 h-4 text-[#541D26]" /> Submit a Support Request
                          </h3>
                      {contactSubmitted && contactTicketResult ? (
                        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4 text-left shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="px-2.5 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase tracking-wider rounded-md">
                                Ticket Submitted
                              </span>
                              <h3 className="text-base font-serif font-extrabold text-emerald-950 mt-0.5">
                                Support Request #{contactTicketResult.ticket_number || contactTicketResult.ticket_id} Logged!
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                            Thank you for contacting DigiLocal Support Desk. Our live specialist team has received your query and will respond within <strong>{contactTicketResult.sla_minutes_remaining || 45} minutes</strong>.
                          </p>

                          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 text-xs space-y-1.5 font-sans">
                            <div className="flex items-center justify-between text-[#211A19]">
                              <span className="font-semibold text-muted-foreground">Ticket Reference:</span>
                              <span className="font-mono font-bold text-[#541D26]">{contactTicketResult.ticket_number || contactTicketResult.ticket_id}</span>
                            </div>
                            {contactTicketResult.attachment && (
                              <div className="flex items-center justify-between text-emerald-800 text-[11px]">
                                <span className="font-semibold">Attached Evidence:</span>
                                <span className="font-bold">📎 {contactTicketResult.attachment.file_name}</span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setContactSubmitted(false);
                              setContactTicketResult(null);
                              setContactForm({ name: '', email: '', phone: '', category: 'user_vs_vendor', orderId: '', targetVendor: '', subject: '', message: '' });
                            }}
                            className="px-5 py-2.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            + Submit Another Support Request
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!contactForm.name || !contactForm.message) return;
                          try {
                            setContactLoading(true);
                            const payload = {
                              user_type: pageTicketUserType,
                              reporter_name: contactForm.name.trim(),
                              reporter_email: contactForm.email.trim(),
                              reporter_phone: contactForm.phone.trim(),
                              category: contactForm.category || (pageTicketUserType === 'vendor' ? 'payouts' : 'user_vs_vendor'),
                              order_id: contactForm.orderId ? contactForm.orderId.trim() : '',
                              target_vendor: contactForm.targetVendor ? contactForm.targetVendor.trim() : '',
                              subject: contactForm.subject ? contactForm.subject.trim() : (contactForm.message.slice(0, 50) + '...'),
                              description: contactForm.message.trim(),
                              source: pageTicketUserType === 'vendor' ? 'vendor_portal' : 'landing_website'
                            };

                            const res = pageTicketUserType === 'vendor'
                              ? await api.createSupportTicket(payload)
                              : await api.createResidentTicket(payload);

                            let uploadedAtt = null;
                            const targetId = res.data?.ticket_id || res.data?.id;
                            if (pageAttachmentFile && targetId) {
                              try {
                                const attRes = await api.uploadTicketAttachment(targetId, pageAttachmentFile);
                                if (attRes && attRes.data) uploadedAtt = attRes.data;
                              } catch (_) {}
                            }

                            setContactTicketResult({
                              ticket_number: res.data?.ticket_number || `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
                              ticket_id: targetId || `t-${Date.now()}`,
                              sla_minutes_remaining: res.data?.sla_minutes_remaining || 45,
                              created_at_readable: res.data?.created_at_readable || 'Just now',
                              attachment: uploadedAtt
                            });
                            setContactSubmitted(true);
                            setPageAttachmentFile(null);
                            api.getResidentTickets().then(list => { if (Array.isArray(list)) setPageTicketsList(list); }).catch(() => {});
                          } catch (err) {
                            alert(err.message || 'Failed to submit support request');
                          } finally {
                            setContactLoading(false);
                          }
                        }} className="space-y-4 font-sans">
                          
                          {/* FILING COMPLAINT AS TOGGLE CONTROL */}
                          <div className="space-y-1.5 pb-2">
                            <label className="block text-[11px] font-extrabold text-[#211A19] uppercase tracking-wider">
                              Filing Complaint As:
                            </label>
                            <div className="grid grid-cols-2 gap-2.5 bg-[#EEE5DA]/60 p-1.5 rounded-2xl border border-[#E5DAD0]">
                              <button
                                type="button"
                                onClick={() => {
                                  setPageTicketUserType('vendor');
                                  setContactForm(prev => ({ ...prev, category: 'payouts' }));
                                }}
                                className={`py-3 px-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                                  pageTicketUserType === 'vendor'
                                    ? 'bg-[#541D26] text-white shadow-md font-bold ring-2 ring-[#541D26]/30'
                                    : 'bg-white text-muted-foreground hover:text-[#211A19] border border-[#E5DAD0] font-semibold'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Store className="w-4 h-4 text-[#C8A878]" />
                                  <span className="text-xs">Vendor Merchant Store</span>
                                </div>
                                <span className="text-[10px] opacity-80 font-normal">Store Payouts, Catalog, Settlements & Listings</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPageTicketUserType('user');
                                  setContactForm(prev => ({ ...prev, category: 'user_vs_vendor' }));
                                }}
                                className={`py-3 px-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                                  pageTicketUserType === 'user'
                                    ? 'bg-[#541D26] text-white shadow-md font-bold ring-2 ring-[#541D26]/30'
                                    : 'bg-white text-muted-foreground hover:text-[#211A19] border border-[#E5DAD0] font-semibold'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-4 h-4 text-[#C8A878]" />
                                  <span className="text-xs">Resident Customer</span>
                                </div>
                                <span className="text-[10px] opacity-80 font-normal">Personal Home Orders, Resident Delivery & Refunds</span>
                              </button>
                            </div>
                          </div>

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
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Contact Email Address *</label>
                              <input
                                type="email"
                                required
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
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Query Category *</label>
                              <select
                                value={contactForm.category}
                                onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26] cursor-pointer"
                              >
                                {pageTicketUserType === 'vendor' ? (
                                  <>
                                    <option value="payouts">💰 Vendor Settlement & Payouts</option>
                                    <option value="catalog">📦 Shop Inventory & Catalog</option>
                                    <option value="billing">💳 Billing & Commission Queries</option>
                                    <option value="technical">🛠️ Vendor Portal Technical Issue</option>
                                    <option value="general">❓ General Store Assistance</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="user_vs_vendor">🛒 Merchant / Order Dispute</option>
                                    <option value="billing">💳 Billing & Refund Queries</option>
                                    <option value="technical">🛠️ App Technical Issue</option>
                                    <option value="general">❓ General Platform Assistance</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Associated Order ID (Optional)</label>
                              <input
                                type="text"
                                value={contactForm.orderId}
                                onChange={(e) => setContactForm({ ...contactForm, orderId: e.target.value })}
                                placeholder="e.g. ORD-9842"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[#211A19] mb-1">Reported Merchant / Store Name (Optional)</label>
                              <input
                                type="text"
                                value={contactForm.targetVendor}
                                onChange={(e) => setContactForm({ ...contactForm, targetVendor: e.target.value })}
                                placeholder="e.g. Aarushi Sweets"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#211A19] mb-1">Subject / Summary *</label>
                            <input
                              type="text"
                              required
                              value={contactForm.subject}
                              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                              placeholder="e.g. Order #ORD-9842 canceled but refund pending"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#211A19] mb-1">Your Message / Detailed Complaint *</label>
                            <textarea
                              rows={3}
                              required
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="Describe your question or issue in detail..."
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DAD0] bg-white text-xs text-[#211A19] focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#211A19] mb-1">Attach Photo Evidence / PDF Document (Optional)</label>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2 px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EEE5DA] border border-[#E5DAD0] rounded-xl text-xs font-bold text-[#211A19] cursor-pointer transition-colors shadow-2xs">
                                <Paperclip className="w-4 h-4 text-[#541D26]" />
                                <span>{pageAttachmentFile ? 'Change File Evidence' : 'Choose Photo / PDF Evidence'}</span>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setPageAttachmentFile(e.target.files[0]);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              {pageAttachmentFile && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 shrink-0">
                                  <span className="truncate max-w-[180px]">📎 {pageAttachmentFile.name}</span>
                                  <button type="button" onClick={() => setPageAttachmentFile(null)} className="text-rose-600 hover:text-rose-800 p-0.5">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={contactLoading}
                            className="w-full py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Send className="w-4 h-4 text-white" />
                            <span>{contactLoading ? 'Submitting Request...' : 'Send Message to Support'}</span>
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* VIEW B: MY SUBMITTED TICKETS HISTORY & DISCUSSION THREAD */}
                  {supportSubTab === 'history' && (
                    <div className="space-y-4">
                      <h3 className="font-serif font-bold text-base text-[#211A19] flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-[#541D26]" /> My Support Ticket History
                      </h3>

                      {!selectedPageTicket ? (
                        <div>
                          {pageTicketsList.length === 0 ? (
                            <div className="p-8 text-center bg-white rounded-3xl space-y-2 border border-[#E5DAD0] shadow-2xs">
                              <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                              <p className="font-serif font-bold text-sm text-[#211A19]">No Support Tickets Logged Yet</p>
                              <p className="text-xs text-muted-foreground">Click "Submit Request" above to log a support intake complaint.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pageTicketsList.map((t) => (
                                <div
                                  key={t.ticket_id}
                                  onClick={async () => {
                                    setSelectedPageTicket(t);
                                    try {
                                      const res = await api.getTicketMessages(t.ticket_id);
                                      if (res && res.messages) setPageThreadMessages(res.messages);
                                      else setPageThreadMessages(t.messages || []);
                                    } catch (_) {
                                      setPageThreadMessages(t.messages || []);
                                    }
                                  }}
                                  className="bg-white border border-[#E5DAD0] hover:border-[#541D26] rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                                >
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-bold text-[11px] px-2.5 py-0.5 bg-[#EEE5DA] rounded-lg text-[#541D26]">{t.ticket_number || t.ticket_id}</span>
                                      {t.order_id && (
                                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg">Order: {t.order_id}</span>
                                      )}
                                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                        t.status === 'RESOLVED' || t.status === 'closed' ? 'bg-emerald-100 text-emerald-800' : 
                                        t.status === 'IN_PROGRESS' || t.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                                      }`}>
                                        {t.status || 'open'}
                                      </span>
                                      {t.sla_minutes_remaining && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                          SLA: {t.sla_minutes_remaining}m
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-serif font-bold text-xs text-[#211A19] pt-1">{t.subject}</h4>
                                    <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
                                    {t.created_at_readable && (
                                      <p className="text-[10px] text-muted-foreground font-medium pt-0.5">{t.created_at_readable}</p>
                                    )}
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white border border-[#E5DAD0] rounded-3xl p-5 shadow-xs space-y-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPageTicket(null)}
                            className="text-xs font-bold text-[#541D26] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            ← Back to All Tickets List
                          </button>

                          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DAD0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-[#541D26]">{selectedPageTicket.ticket_number || selectedPageTicket.ticket_id}</span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#541D26] text-white rounded-full uppercase">
                                Status: {selectedPageTicket.status || 'open'}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-sm text-[#211A19]">{selectedPageTicket.subject}</h3>
                            <p className="text-xs text-muted-foreground">{selectedPageTicket.description}</p>
                          </div>

                          {/* Message Thread */}
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {pageThreadMessages.map((m, idx) => (
                              <div
                                key={m.id || idx}
                                className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 text-xs ${
                                  m.sender_role === 'admin' 
                                    ? 'bg-[#541D26] text-white ml-auto' 
                                    : 'bg-[#FAF8F5] border border-[#E5DAD0] text-[#211A19]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1 text-[10px] opacity-80">
                                  <span className="font-bold">{m.sender_name || (m.sender_role === 'admin' ? 'Support Admin' : 'You')}</span>
                                  <span>{m.created_at_readable || 'Just now'}</span>
                                </div>
                                <p className="leading-relaxed">{m.message || m.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Reply Form */}
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!pageReplyText.trim() || !selectedPageTicket) return;
                            try {
                              setPageReplyLoading(true);
                              const tId = selectedPageTicket.ticket_id || selectedPageTicket.id;
                              const res = await api.replyResidentTicket(tId, pageReplyText.trim());
                              if (res) {
                                setPageThreadMessages(prev => [...prev, {
                                  id: `m-${Date.now()}`,
                                  sender_name: 'You',
                                  sender_role: 'user',
                                  message: pageReplyText.trim(),
                                  created_at_readable: 'Just now'
                                }]);
                                setPageReplyText('');
                              }
                            } catch (err) {
                              alert(err.message || 'Failed to post reply');
                            } finally {
                              setPageReplyLoading(false);
                            }
                          }} className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              required
                              value={pageReplyText}
                              onChange={(e) => setPageReplyText(e.target.value)}
                              placeholder="Write your response message..."
                              className="flex-1 px-4 py-2.5 bg-[#FAF8F5] border border-[#E5DAD0] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#541D26]"
                            />
                            <button
                              type="submit"
                              disabled={pageReplyLoading}
                              className="px-5 py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                            >
                              {pageReplyLoading ? 'Sending...' : 'Send Reply'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                    {/* Premium Direct Contact Channels Sidebar Card */}
                    <div className="bg-[#211A19] text-white p-5 rounded-3xl space-y-4 shadow-xl border border-white/10 relative overflow-hidden">
                      {/* Decorative Background Accent Glow */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#541D26]/40 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-[#541D26] text-[#C8A878] flex items-center justify-center shadow-xs">
                          <PhoneCall className="w-4 h-4 text-[#C8A878]" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-sm text-white">Direct Contact Channels</h3>
                          <p className="text-[10px] text-[#D6B7A5]">Instant help & hotline resolution</p>
                        </div>
                      </div>

                      {/* Helpline Channel */}
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 hover:bg-white/10 transition-all group relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#541D26] text-[#C8A878] flex items-center justify-center">
                              <PhoneCall className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-extrabold text-[#D6B7A5] uppercase tracking-wider">Helpline Hotline</span>
                          </div>
                          <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">LIVE</span>
                        </div>
                        <a href={`tel:${cmsContacts.phone}`} className="text-xs font-mono font-bold text-white group-hover:text-[#C8A878] transition-colors block pl-9">
                          {cmsContacts.phone || '+91 800-562-5999'}
                        </a>
                      </div>

                      {/* Email Channel */}
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 hover:bg-white/10 transition-all group relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#541D26] text-[#C8A878] flex items-center justify-center">
                              <Mail className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-extrabold text-[#D6B7A5] uppercase tracking-wider">Official Email Desk</span>
                          </div>
                          <span className="text-[9px] font-bold text-white/60">24/7 Intake</span>
                        </div>
                        <a href={`mailto:${cmsContacts.email}`} className="text-xs font-mono font-semibold text-white group-hover:text-[#C8A878] transition-colors block pl-9 truncate">
                          {cmsContacts.email || 'support@digilocal.network'}
                        </a>
                      </div>

                      {/* Working Hours Channel */}
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#541D26] text-[#C8A878] flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-[#D6B7A5] uppercase tracking-wider">Desk Working Hours</span>
                        </div>
                        <p className="text-xs font-bold text-white pl-9">{cmsContacts.working_hours}</p>
                      </div>

                      {/* SLA Assurance Banner */}
                      <div className="p-3 rounded-2xl bg-[#541D26]/40 border border-[#541D26]/60 text-[10.5px] text-[#D6B7A5] leading-relaxed relative z-10 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#C8A878] shrink-0 mt-0.5" />
                        <span><strong>45-Min Resolution SLA</strong>: All tickets logged are assigned to senior support specialists instantly.</span>
                      </div>
                    </div>

                  </div>

                  {/* Vendor Registration Banner (Hidden for Logged-In Vendors) */}
                  {!isVendorLoggedIn && (
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
                  )}
                </div>
              )}

              {/* B2B MERCHANT PURCHASES API DOCS (v1.0.0 SPECIFICATION) */}
              {activeTab === 'b2b-api-docs' && (
                <div className="space-y-6 font-sans">
                  {/* Header Banner */}
                  <div className="bg-[#211A19] text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#541D26]/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full bg-[#541D26] text-[#C8A878] text-[10px] font-black uppercase tracking-wider border border-[#C8A878]/30">
                          v1.0.0 APPROVED & LIVE IN PRODUCTION
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                          STABLE B2B SPEC
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#D6B7A5]">
                        Base URL: https://digi-local-backend.onrender.com/api
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-white relative z-10">
                      Merchant Vendor Purchases & Orders Made API Documentation
                    </h2>
                    <p className="text-xs sm:text-sm text-[#D6B7A5] font-medium leading-relaxed max-w-3xl relative z-10">
                      When a merchant vendor (e.g. Raj Supermart) acts as a buyer/customer and places an order to buy supplies or inventory from another vendor store (e.g. Aarushi Sweets or Wholesale Mart), vendors can view all orders placed by them via this API.
                    </p>
                  </div>

                  {/* Endpoint Table */}
                  <div className="bg-white border border-[#E5DAD0] rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="font-serif font-black text-[#211A19] text-lg uppercase tracking-wider">
                      📡 Endpoints Overview
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5DAD0] text-[#541D26] font-black uppercase text-[11px]">
                            <th className="py-3 px-4">METHOD</th>
                            <th className="py-3 px-4">ENDPOINT</th>
                            <th className="py-3 px-4">DESCRIPTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAD0] font-semibold text-[#211A19]">
                          <tr className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[11px]">GET</span></td>
                            <td className="py-3 px-4 font-mono font-bold text-[#541D26]">/api/vendorPanel/:vendorId/purchases</td>
                            <td className="py-3 px-4">Fetch orders placed by this vendor when buying from other vendors</td>
                          </tr>
                          <tr className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[11px]">GET</span></td>
                            <td className="py-3 px-4 font-mono font-bold text-[#541D26]">/api/vendorPanel/:vendorId/my-orders</td>
                            <td className="py-3 px-4">Alias endpoint for vendor's own purchase history</td>
                          </tr>
                          <tr className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[11px]">GET</span></td>
                            <td className="py-3 px-4 font-mono font-bold text-[#541D26]">/api/vendor/:vendorId/purchases</td>
                            <td className="py-3 px-4">Top-level vendor purchases alias</td>
                          </tr>
                          <tr className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[11px]">GET</span></td>
                            <td className="py-3 px-4 font-mono font-bold text-[#541D26]">/api/orders/vendor-purchases/:vendorId</td>
                            <td className="py-3 px-4">Orders module vendor purchases alias</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Headers & Sample Request/Response */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Headers & Query Parameters */}
                    <div className="bg-white border border-[#E5DAD0] rounded-3xl p-6 shadow-xs space-y-4">
                      <h3 className="font-serif font-black text-[#211A19] text-base uppercase tracking-wider flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#541D26]" />
                        <span>Authorization Headers</span>
                      </h3>

                      <pre className="p-4 rounded-2xl bg-[#211A19] text-[#C8A878] font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
{`Authorization: Bearer <VENDOR_JWT_ACCESS_TOKEN>
Content-Type: application/json`}
                      </pre>

                      <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#211A19]">Path Parameters</h4>
                        <ul className="text-xs text-muted-foreground space-y-1 font-medium list-disc pl-4">
                          <li><strong className="text-[#211A19] font-mono">vendorId</strong>: Vendor ID (e.g. <code>1225</code>), Public ID (e.g. <code>c860cb</code>), or phone number.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Response Sample Code JSON */}
                    <div className="bg-white border border-[#E5DAD0] rounded-3xl p-6 shadow-xs space-y-4">
                      <h3 className="font-serif font-black text-[#211A19] text-base uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#541D26]" />
                        <span>Response Sample (200 OK)</span>
                      </h3>

                      <pre className="p-4 rounded-2xl bg-[#1E293B] text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-700 max-h-72">
{`{
  "code": 200,
  "status": "success",
  "message": "Vendor purchases retrieved successfully.",
  "data": [
    {
      "order_id": "ORD-V2V-9842",
      "buyer_vendor_id": "1225",
      "buyer_public_id": "c860cb",
      "buyer_store_name": "Raj Supermart",
      "seller_vendor_id": "104",
      "seller_store_name": "Aarushi Sweets",
      "seller_store_logo": "https://...",
      "total_amount": 707.00,
      "status": "delivered",
      "delivery_address": "Shop 352, Raj Supermart",
      "created_at": "2026-09-02T06:32:11.000Z",
      "created_at_readable": "02 Sep 2026, 06:32 am IST",
      "items": [
        {
          "item_id": 101,
          "item_name": "Organic Milk Packets (Bulk)",
          "quantity": 10,
          "price": 50.00,
          "item_total": 500.00
        }
      ]
    }
  ]
}`}
                      </pre>
                    </div>
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
