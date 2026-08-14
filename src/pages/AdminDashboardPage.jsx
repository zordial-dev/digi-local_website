import React, { useState, useEffect } from 'react';
import { api, getSocietyImage } from '../services/api';
import { ShieldCheck, Search, Check, Store, Calendar, CreditCard, ChevronDown, ChevronUp, User, MapPin, Clock, RefreshCw, Building2, Plus, X, Image, LogOut, FileText, Headphones, PhoneCall, Mail } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { VendorCardSkeleton, TableRowSkeleton } from '../components/Skeletons';

export default function AdminDashboardPage({ setRoute }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedVendorId, setExpandedVendorId] = useState(null);

  // Add Society Modal & Notification State
  const [showAddSocietyModal, setShowAddSocietyModal] = useState(false);
  const [newSociety, setNewSociety] = useState({ society_name: '', location: '' });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });

  // Platform Branding Logo & Name State
  const [platformLogoInput, setPlatformLogoInput] = useState('/logo.png');
  const [platformNameInput, setPlatformNameInput] = useState('DigiLocal');
  const [savingLogo, setSavingLogo] = useState(false);

  // CMS & Support Contacts Manager State
  const [supportContacts, setSupportContacts] = useState({
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    toll_free: "1800-123-4567",
    whatsapp: "+91 80056 25999",
    address: "DigiLocal Tech Hub, Tower B, Sector 62, Noida, UP - 201309",
    working_hours: "Monday to Saturday: 9:00 AM - 8:00 PM IST"
  });
  const [selectedCmsSlug, setSelectedCmsSlug] = useState('help-support');
  const [cmsForm, setCmsForm] = useState({
    title: '',
    meta_description: '',
    content: ''
  });
  const [savingCms, setSavingCms] = useState(false);
  const [savingContacts, setSavingContacts] = useState(false);

  useEffect(() => {
    loadLogoConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    } else if (activeTab === 'vendors') {
      loadVendors(search);
    } else if (activeTab === 'societies') {
      loadSocieties(search);
    } else if (activeTab === 'cms') {
      loadCmsData();
    } else if (activeTab === 'branding') {
      setLoading(false);
    }
  }, [activeTab, search, selectedCmsSlug]);

  const loadCmsData = async () => {
    try {
      setLoading(true);
      const contacts = await api.getCmsContacts();
      if (contacts) setSupportContacts(contacts);

      const page = await api.getCmsPage(selectedCmsSlug);
      if (page) {
        setCmsForm({
          title: page.title || '',
          meta_description: page.meta_description || '',
          content: page.content || ''
        });
      }
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupportContacts = async (e) => {
    e.preventDefault();
    try {
      setSavingContacts(true);
      const res = await api.updateSupportContacts(supportContacts);
      setModalConfig({
        isOpen: true,
        title: 'Support Contacts Saved!',
        message: res.message || 'Support contact information updated successfully in database.',
        type: 'success'
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Save Contacts Error',
        message: err.message || 'Failed to update support contact details.',
        type: 'error'
      });
    } finally {
      setSavingContacts(false);
    }
  };

  const handleSaveCmsPage = async (e) => {
    e.preventDefault();
    try {
      setSavingCms(true);
      const res = await api.updateCmsPage(selectedCmsSlug, cmsForm);
      setModalConfig({
        isOpen: true,
        title: 'CMS Page Saved!',
        message: res.message || `CMS Page [${selectedCmsSlug}] updated successfully in database.`,
        type: 'success'
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'CMS Page Save Error',
        message: err.message || 'Failed to update CMS page content.',
        type: 'error'
      });
    } finally {
      setSavingCms(false);
    }
  };

  const loadLogoConfig = async () => {
    try {
      const config = await api.getPlatformConfig();
      if (config) {
        if (config.platform_logo) setPlatformLogoInput(config.platform_logo);
        if (config.platform_name) setPlatformNameInput(config.platform_name);
      }
    } catch (err) {
      console.error('Failed to load logo config:', err);
    }
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!platformLogoInput || !platformLogoInput.trim()) {
      setModalConfig({
        isOpen: true,
        title: 'Invalid Logo URL',
        message: 'Please enter a valid image URL for the platform logo.',
        type: 'warning'
      });
      return;
    }
    try {
      setSavingLogo(true);
      await api.updatePlatformConfig({
        platform_logo: platformLogoInput.trim(),
        platform_name: platformNameInput.trim()
      });
      setModalConfig({
        isOpen: true,
        title: 'Platform Branding Saved!',
        message: `DigiLocal logo and product name ("${platformNameInput.trim()}") updated successfully.`,
        type: 'success'
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Logo Update Error',
        message: err.message || 'Failed to update platform logo.',
        type: 'error'
      });
    } finally {
      setSavingLogo(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async (searchQuery = '') => {
    try {
      setLoading(true);
      const data = await api.getAdminVendors(searchQuery);
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSocieties = async (searchQuery = '') => {
    try {
      setLoading(true);
      const data = await api.getSocieties(searchQuery);
      setSocieties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load societies:', err);
      setSocieties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setModalConfig({
      isOpen: true,
      title: 'Admin Logged Out',
      message: 'You have exited the Admin Management Portal successfully.',
      type: 'info',
      confirmText: 'Go to Home Screen',
      onConfirm: () => {
        setModalConfig({ isOpen: false });
        setRoute({ page: 'home' });
      }
    });
  };

  const handleApproveRequest = async (vendorId) => {
    try {
      await api.approveVendorRequest(vendorId);
      setModalConfig({
        isOpen: true,
        title: 'Vendor Approved!',
        message: 'Vendor approved successfully! Start date set to NOW and 1-Year subscription activated.',
        type: 'success'
      });
      loadRequests();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Approval Error',
        message: err.message || 'Failed to approve vendor.',
        type: 'error'
      });
    }
  };

  const handleRejectRequest = (vendorId) => {
    setModalConfig({
      isOpen: true,
      title: 'Reject Vendor Request',
      message: 'Are you sure you want to reject this vendor registration request?',
      type: 'confirm',
      confirmText: 'Reject Request',
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        try {
          await api.rejectVendorRequest(vendorId);
          loadRequests();
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Rejection Failed',
            message: 'Failed to reject request. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleAddSocietySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createSociety(newSociety);
      setShowAddSocietyModal(false);
      setNewSociety({ society_name: '', location: '' });
      loadSocieties(search);
      setModalConfig({
        isOpen: true,
        title: 'Society Added!',
        message: 'New society created successfully and added to DigiLocal network.',
        type: 'success'
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Society Creation Failed',
        message: 'Failed to add new society. Please check your inputs.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] pb-20">
      
      {/* Top Admin Header */}
      <div className="bg-white border-b border-[#C5A880]/20 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 text-xs font-bold mb-2 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>DigiLocal Central Admin Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide">Admin Management Portal</h1>
            </div>

            <button
              onClick={() => {
                if (activeTab === 'requests') loadRequests();
                else if (activeTab === 'vendors') loadVendors(search);
                else if (activeTab === 'societies') loadSocieties(search);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F6F3EC] text-[#0A1428] text-xs font-bold flex items-center space-x-2 border border-[#C5A880]/30 shadow-sm uppercase tracking-wider self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4 text-[#C5A880]" />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center space-x-3 mt-8 border-b border-[#C5A880]/20 overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                activeTab === 'requests'
                  ? 'bg-[#F6F3EC] text-[#0A1428] border-[#0A1428] font-extrabold'
                  : 'text-[#787F8C] hover:text-[#0A1428] border-transparent'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Requests ({(Array.isArray(requests) ? requests : []).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                activeTab === 'vendors'
                  ? 'bg-[#F6F3EC] text-[#0A1428] border-[#0A1428] font-extrabold'
                  : 'text-[#787F8C] hover:text-[#0A1428] border-transparent'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>All Registered Vendors</span>
            </button>

            <button
              onClick={() => setActiveTab('societies')}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                activeTab === 'societies'
                  ? 'bg-[#F6F3EC] text-[#0A1428] border-[#0A1428] font-extrabold'
                  : 'text-[#787F8C] hover:text-[#0A1428] border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#2E7D32]" />
              <span>Societies Management</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                activeTab === 'branding'
                  ? 'bg-[#F6F3EC] text-[#0A1428] border-[#0A1428] font-extrabold'
                  : 'text-[#787F8C] hover:text-[#0A1428] border-transparent'
              }`}
            >
              <Image className="w-4 h-4 text-[#C5A880]" />
              <span>Platform Logo & Branding</span>
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`px-5 py-3 rounded-t-xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                activeTab === 'cms'
                  ? 'bg-[#F6F3EC] text-[#0A1428] border-[#0A1428] font-extrabold'
                  : 'text-[#787F8C] hover:text-[#0A1428] border-transparent'
              }`}
            >
              <FileText className="w-4 h-4 text-[#C5A880]" />
              <span>CMS & Support Contacts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Section Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* 1. PENDING REQUESTS */}
        {activeTab === 'requests' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider">Vendor Registration Approval Queue</h2>
              <p className="text-xs text-[#787F8C] font-medium">Review vendor details and payment. Accepting will activate their 1-Year subscription starting from approval date.</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </div>
            ) : (!Array.isArray(requests) || requests.length === 0) ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#C5A880]/20 p-8 shadow-sm">
                <Check className="w-12 h-12 text-[#2E7D32] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0A1428] mb-1">No Pending Vendor Requests</h3>
                <p className="text-[#787F8C] text-xs font-medium">All vendor applications have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(requests) ? requests : []).map((req) => (
                  <div key={req.vendor_id} className="rounded-2xl bg-white border border-[#C5A880]/25 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      <img
                        src={req.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                        alt={req.store_name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#C5A880]/30 bg-[#FAF9F6] shadow-sm"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-[#0A1428]">{req.store_name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30 uppercase">
                            PENDING APPROVAL
                          </span>
                        </div>

                        <p className="text-xs text-[#787F8C] font-medium">
                          Vendor Name: <strong>{req.vendor_name}</strong> • Email: <strong className="text-[#C5A880]">{req.email}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#787F8C] pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                            {req.society_name} ({req.location})
                          </span>
                          <span>• Phone: {req.phone_number || 'N/A'}</span>
                          {req.gst_number && <span>• GST: {req.gst_number}</span>}
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/20 text-xs text-[#0A1428] mt-2 font-medium">
                          <span className="font-bold text-[#2E7D32]">Razorpay Payment Received: ₹{req.paid_amount || '2,999.00'}</span>
                          <span className="text-[#787F8C] ml-2">({req.payment_method || 'UPI'} - Txn: {req.transaction_id || 'N/A'})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-center">
                      <button
                        onClick={() => handleRejectRequest(req.vendor_id)}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors uppercase"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req.vendor_id)}
                        className="px-6 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-md flex items-center space-x-1.5 uppercase tracking-wider"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Activate 1-Yr Subscription</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ALL VENDORS */}
        {activeTab === 'vendors' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider">Registered Vendors Directory</h2>
                <p className="text-xs text-[#787F8C] font-medium">Clicking on any vendor opens details, transaction history, package placement, and subscription 1-year expiry date.</p>
              </div>

              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
                  <input
                    type="text"
                    placeholder="Search vendor or society name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white border border-[#C5A880]/20 animate-pulse" />
                ))}
              </div>
            ) : (!Array.isArray(vendors) || vendors.length === 0) ? (
              <div className="text-center py-16 bg-[#FAF9F6] rounded-2xl border border-[#C5A880]/20 p-8 shadow-sm">
                <Store className="w-12 h-12 text-[#787F8C] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0A1428] mb-1">No Vendors Found</h3>
                <p className="text-[#787F8C] text-xs font-medium">No registered vendors match your search query.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(vendors) ? vendors : []).map((vendor) => {
                  const isExpanded = expandedVendorId === vendor.vendor_id;

                  return (
                    <div
                      key={vendor.vendor_id}
                      className="rounded-2xl bg-white border border-[#C5A880]/25 overflow-hidden transition-all shadow-sm"
                    >
                      <div
                        onClick={() => setExpandedVendorId(isExpanded ? null : vendor.vendor_id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={vendor.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                            alt={vendor.store_name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#C5A880]/30 bg-[#FAF9F6] shadow-sm"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-[#0A1428] text-base">{vendor.store_name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                vendor.status === 'ACTIVE' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' :
                                vendor.status === 'PENDING' ? 'bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30' :
                                'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {vendor.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#787F8C] font-medium">
                              Vendor: {vendor.vendor_name} • Society: <strong className="text-[#C5A880]">{vendor.society_name}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right hidden sm:block">
                            <span className="text-[11px] text-[#787F8C] font-medium">Subscription Expiry</span>
                            <p className="text-xs font-bold text-[#0A1428]">
                              {vendor.end_date ? vendor.end_date : (vendor.status === 'ACTIVE' ? '1 Year Active' : 'Not Started')}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#787F8C]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#787F8C]" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Drawer */}
                      {isExpanded && (
                        <div className="p-6 bg-[#FAF9F6] border-t border-[#C5A880]/20 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className="p-4 rounded-xl bg-white border border-[#C5A880]/25 shadow-sm">
                              <div className="flex items-center space-x-2 text-[#0A1428] font-bold text-xs uppercase mb-2">
                                <CreditCard className="w-4 h-4 text-[#C5A880]" />
                                <span>Package Placement</span>
                              </div>
                              <p className="text-xs font-bold text-[#0A1428]">{vendor.package_placement}</p>
                              <p className="text-[11px] text-[#787F8C] mt-1 font-medium">Unlimited catalog items & direct WhatsApp resident messaging.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-[#C5A880]/25 shadow-sm">
                              <div className="flex items-center space-x-2 text-[#0A1428] font-bold text-xs uppercase mb-2">
                                <Calendar className="w-4 h-4 text-[#C5A880]" />
                                <span>Subscription Dates</span>
                              </div>
                              <div className="text-xs space-y-1 text-[#787F8C] font-medium">
                                <div className="flex justify-between">
                                  <span>Start Date:</span>
                                  <span className="font-bold text-[#0A1428]">{vendor.start_date || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Expiry Date (1 Yr):</span>
                                  <span className="font-bold text-[#C5A880]">{vendor.end_date || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-white border border-[#C5A880]/25 shadow-sm">
                              <div className="flex items-center space-x-2 text-[#2E7D32] font-bold text-xs uppercase mb-2">
                                <User className="w-4 h-4" />
                                <span>Vendor Details</span>
                              </div>
                              <div className="text-xs space-y-1 text-[#787F8C] font-medium">
                                <p>Email: {vendor.email}</p>
                                <p>Phone: {vendor.phone_number || 'N/A'}</p>
                                <p>GST: {vendor.gst_number || 'N/A'}</p>
                              </div>
                            </div>

                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#0A1428] uppercase tracking-wider mb-3">Transaction History</h4>
                            {Array.isArray(vendor.payments) && vendor.payments.length > 0 ? (
                              <div className="space-y-2">
                                {vendor.payments.map((pay) => (
                                  <div key={pay.payment_id || Math.random()} className="p-3 rounded-xl bg-white border border-[#C5A880]/20 flex items-center justify-between text-xs font-medium shadow-sm">
                                    <div>
                                      <span className="font-bold text-[#0A1428]">₹{pay.amount ? parseFloat(pay.amount).toFixed(2) : '0.00'}</span>
                                      <span className="text-[#787F8C] ml-2">via {pay.payment_method || 'N/A'}</span>
                                      <span className="text-[#787F8C] ml-2">(Txn: {pay.transaction_id || 'N/A'})</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] font-bold">
                                      {pay.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#787F8C]">No payment transaction records found.</p>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SOCIETIES MANAGEMENT */}
        {activeTab === 'societies' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider">Societies Management</h2>
                <p className="text-xs text-[#787F8C] font-medium">Admin can view registered societies and add new societies to DigiLocal.</p>
              </div>

              <button
                onClick={() => setShowAddSocietyModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md flex items-center space-x-1.5 uppercase tracking-wider self-start"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Society</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-white border border-[#C5A880]/20 animate-pulse" />
                ))}
              </div>
            ) : (!Array.isArray(societies) || societies.length === 0) ? (
              <div className="text-center py-16 bg-[#FAF9F6] rounded-2xl border border-[#C5A880]/20 p-8 shadow-sm">
                <Building2 className="w-12 h-12 text-[#787F8C] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0A1428] mb-1">No Societies Registered</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(societies) ? societies : []).map((soc) => (
                  <div key={soc.society_id} className="p-4 rounded-xl bg-white border border-[#C5A880]/25 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C5A880]/30 shrink-0 bg-[#F6F3EC]">
                        <img 
                          src={getSocietyImage(soc)} 
                          alt={soc.society_name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-[#0A1428] text-sm">{soc.society_name}</h4>
                          {soc.society_id && (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#0A1428] text-[#C5A880] rounded-md uppercase tracking-wider">
                              {soc.society_id}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-[#787F8C] font-medium mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>{soc.location}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 rounded-full flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#2E7D32]" />
                      {soc.vendor_count || 0} Vendors
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. PLATFORM LOGO & BRANDING SETTINGS */}
        {activeTab === 'branding' && (
          <div className="max-w-2xl bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">
                Platform Logo & Branding Settings
              </h2>
              <p className="text-xs text-[#787F8C] font-medium">
                Admin can update the official DigiLocal logo image URL displayed across the platform navbar, header, and home screen.
              </p>
            </div>

            {/* Live Logo Preview Box */}
            <div className="p-6 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[#C5A880]/40 p-2 flex items-center justify-center shadow-md">
                <img
                  src={platformLogoInput || '/logo.png'}
                  alt="DigiLocal Platform Logo Preview"
                  className="max-h-full max-w-full object-contain rounded-lg"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[10px] font-bold text-[#C5A880] uppercase tracking-widest">Active Logo Preview</span>
                <h3 className="text-base font-serif font-bold text-[#0A1428]">DigiLocal Network Logo</h3>
                <p className="text-xs text-[#787F8C] font-medium">This logo is displayed in the main top header navigation, hero banner, and login pages.</p>
              </div>
            </div>

            <form onSubmit={handleSaveLogo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1.5">
                  Platform Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DigiLocal"
                  value={platformNameInput}
                  onChange={(e) => setPlatformNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1.5">
                  Platform Logo Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://imgh.in/host/ucila6"
                  value={platformLogoInput}
                  onChange={(e) => setPlatformLogoInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#0A1428] uppercase">Preset Logo Options:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatformLogoInput('https://imgh.in/host/ucila6')}
                    className="px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D9] text-[#0A1428] border border-[#C5A880]/30 text-[11px] font-bold transition-colors"
                  >
                    Use Hosted Logo (imgh.in/host/ucila6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformLogoInput('/logo.png')}
                    className="px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#EAE5D9] text-[#0A1428] border border-[#C5A880]/30 text-[11px] font-bold transition-colors"
                  >
                    Use Local Asset (/logo.png)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingLogo}
                className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all"
              >
                {savingLogo ? 'Updating Platform Logo...' : 'Save Platform Logo'}
              </button>
            </form>
          </div>
        )}

        {/* 5. CMS & SUPPORT CONTACTS MANAGEMENT */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            <div className="mb-2">
              <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider">CMS & Support Contacts Management</h2>
              <p className="text-xs text-[#787F8C] font-medium">Manage legal pages content (Privacy Policy, Terms & Conditions, Help & Support, About Us) and customer support helpline contacts persisted in PostgreSQL database.</p>
            </div>

            {/* SECTION 1: SUPPORT CONTACT DETAILS EDITOR */}
            <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#C5A880]/15 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0A1428] uppercase flex items-center gap-2">
                    <PhoneCall className="w-4.5 h-4.5 text-[#C5A880]" />
                    <span>Support Contact Details (PUT /api/cms/contacts)</span>
                  </h3>
                  <p className="text-xs text-[#787F8C] mt-0.5 font-medium">Phone helpline, email, toll-free number, WhatsApp support, working hours & corporate address.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-300">
                  Database Persisted
                </span>
              </div>

              <form onSubmit={handleSaveSupportContacts} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Helpline Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 800-562-5999"
                      value={supportContacts.phone}
                      onChange={(e) => setSupportContacts({ ...supportContacts, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Official Support Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="support@digilocal.in"
                      value={supportContacts.email}
                      onChange={(e) => setSupportContacts({ ...supportContacts, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Toll-Free Number</label>
                    <input
                      type="text"
                      placeholder="1800-123-4567"
                      value={supportContacts.toll_free}
                      onChange={(e) => setSupportContacts({ ...supportContacts, toll_free: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">WhatsApp Support Number</label>
                    <input
                      type="text"
                      placeholder="+91 80056 25999"
                      value={supportContacts.whatsapp}
                      onChange={(e) => setSupportContacts({ ...supportContacts, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Working Hours</label>
                  <input
                    type="text"
                    placeholder="Monday to Saturday: 9:00 AM - 8:00 PM IST"
                    value={supportContacts.working_hours}
                    onChange={(e) => setSupportContacts({ ...supportContacts, working_hours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Corporate Address</label>
                  <textarea
                    rows={2}
                    placeholder="DigiLocal Tech Hub, Tower B, Sector 62, Noida, UP - 201309"
                    value={supportContacts.address}
                    onChange={(e) => setSupportContacts({ ...supportContacts, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingContacts}
                  className="px-6 py-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all cursor-pointer"
                >
                  {savingContacts ? 'Saving Support Contacts...' : 'Save Support Contacts'}
                </button>
              </form>
            </div>

            {/* SECTION 2: CMS & LEGAL PAGES MARKDOWN EDITOR */}
            <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#C5A880]/15 pb-4">
                <h3 className="text-base font-serif font-bold text-[#0A1428] uppercase flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#C5A880]" />
                  <span>CMS Page Content Editor (PUT /api/cms/pages/:slug)</span>
                </h3>
                <p className="text-xs text-[#787F8C] mt-0.5 font-medium">Select page slug and edit title, meta description, and markdown document content.</p>
              </div>

              {/* Page Slug Selector Tabs */}
              <div className="flex items-center space-x-2 border-b border-[#C5A880]/20 overflow-x-auto pb-1">
                {[
                  { slug: 'help-support', label: 'Help & Support' },
                  { slug: 'about-us', label: 'About Us' },
                  { slug: 'privacy-policy', label: 'Privacy Policy' },
                  { slug: 'terms-conditions', label: 'Terms & Conditions' },
                ].map((tab) => (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => setSelectedCmsSlug(tab.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                      selectedCmsSlug === tab.slug
                        ? 'bg-[#0A1428] text-white shadow-sm'
                        : 'bg-[#F6F3EC] text-[#787F8C] hover:text-[#0A1428]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveCmsPage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Help & Support Center"
                    value={cmsForm.title}
                    onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Meta Description</label>
                  <input
                    type="text"
                    placeholder="Meta description for SEO search engines..."
                    value={cmsForm.meta_description}
                    onChange={(e) => setCmsForm({ ...cmsForm, meta_description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Page Content (Markdown / Text) *</label>
                  <textarea
                    rows={12}
                    required
                    placeholder="# Page Heading..."
                    value={cmsForm.content}
                    onChange={(e) => setCmsForm({ ...cmsForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/30 text-xs font-mono text-[#0A1428] focus:outline-none focus:border-[#C5A880] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingCms}
                  className="px-6 py-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all cursor-pointer"
                >
                  {savingCms ? `Saving [${selectedCmsSlug}]...` : `Save Page Content [${selectedCmsSlug}]`}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Add Society Modal */}
      {showAddSocietyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#0A1428] uppercase">Add New Society</h3>
              <button onClick={() => setShowAddSocietyModal(false)} className="text-[#787F8C] hover:text-[#0A1428]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSocietySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Society Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Palm Meadows Apartment"
                  value={newSociety.society_name}
                  onChange={(e) => setNewSociety({ ...newSociety, society_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Location / Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whitefield, Bangalore"
                  value={newSociety.location}
                  onChange={(e) => setNewSociety({ ...newSociety, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#C5A880]/15">
                <button
                  type="button"
                  onClick={() => setShowAddSocietyModal(false)}
                  className="px-4 py-2 text-[#787F8C] hover:text-[#0A1428] text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider"
                >
                  Save Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Website Generic Notification / Confirm Modal */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText || 'OK'}
        cancelText={modalConfig.cancelText || 'Cancel'}
        onConfirm={modalConfig.onConfirm || (() => setModalConfig({ ...modalConfig, isOpen: false }))}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

    </div>
  );
}
