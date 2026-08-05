import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Store, Package, ShoppingBag, Settings, CreditCard, Plus, Edit2, Trash2, RefreshCw, X, ShieldCheck, CheckCircle2, LogOut, QrCode, Download, Copy, ExternalLink, Building2 } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardSkeleton } from '../components/Skeletons';

export default function VendorDashboardPage({ vendorId, setRoute }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [panelData, setPanelData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    item_name: '',
    description: '',
    price: '',
    stock: '50',
    category: 'General',
    unit: 'piece',
    is_available: true,
    image_url: ''
  });

  // Settings State (DigiCafe style complete settings)
  const [settingsForm, setSettingsForm] = useState({
    store_name: '',
    logo: '',
    description: '',
    phone_number: '',
    gst_number: '',
    opening_timing: '08:00 AM',
    closing_timing: '10:00 PM',
    min_order_value: '0',
    max_quantity_limit: '10',
    delivery_charge: '0',
    gst_percentage: '5',
    service_charge_percentage: '0'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadPanelData();
  }, [vendorId]);

  const loadPanelData = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorPanel(vendorId);
      setPanelData(data);
      if (data.vendor) {
        setSettingsForm({
          store_name: data.vendor.store_name || '',
          logo: data.vendor.logo || '',
          description: data.vendor.description || '',
          phone_number: data.vendor.phone_number || '',
          gst_number: data.vendor.gst_number || '',
          opening_timing: data.vendor.opening_timing || '08:00 AM',
          closing_timing: data.vendor.closing_timing || '10:00 PM',
          min_order_value: String(data.vendor.min_order_value ?? 0),
          max_quantity_limit: String(data.vendor.max_quantity_limit ?? 10),
          delivery_charge: String(data.vendor.delivery_charge ?? 0),
          gst_percentage: String(data.vendor.gst_percentage ?? 5),
          service_charge_percentage: String(data.vendor.service_charge_percentage ?? 0)
        });
      }
    } catch (err) {
      console.error('Failed to load vendor panel:', err);
    } finally {
      setLoading(false);
    }
  };

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });

  const handleToggleAvailability = async (item) => {
    try {
      const newAvail = !item.is_available;
      await api.updateVendorItem(vendorId, item.item_id, { is_available: newAvail });
      loadPanelData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Status Update Error',
        message: 'Failed to update item availability status.',
        type: 'error'
      });
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateVendorItem(vendorId, editingItem.item_id, itemForm);
      } else {
        await api.addVendorItem(vendorId, itemForm);
      }
      setShowAddItemModal(false);
      setEditingItem(null);
      resetItemForm();
      loadPanelData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Save Item Error',
        message: err.message || 'Failed to save item details.',
        type: 'error'
      });
    }
  };

  const handleDeleteItem = (itemId) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Store Item',
      message: 'Are you sure you want to delete this menu item from your store catalog?',
      type: 'confirm',
      confirmText: 'Delete Item',
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        try {
          await api.deleteVendorItem(vendorId, itemId);
          loadPanelData();
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Delete Failed',
            message: 'Could not delete item. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      item_name: item.item_name,
      description: item.description || '',
      price: item.price,
      stock: item.stock || 50,
      category: item.category || 'General',
      unit: item.unit || 'piece',
      is_available: Boolean(item.is_available),
      image_url: item.image_url || ''
    });
    setShowAddItemModal(true);
  };

  const resetItemForm = () => {
    setItemForm({
      item_name: '',
      description: '',
      price: '',
      stock: '50',
      category: 'General',
      unit: 'piece',
      is_available: true,
      image_url: ''
    });
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadPanelData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Order Status Error',
        message: 'Failed to update order status.',
        type: 'error'
      });
    }
  };

  const [showSettingsSuccessModal, setShowSettingsSuccessModal] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.updateVendorSettings(vendorId, settingsForm);
      setShowSettingsSuccessModal(true);
      loadPanelData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Settings Update Error',
        message: err.message || 'Failed to update store settings.',
        type: 'error'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVendorLogout = () => {
    localStorage.removeItem('digilocal_vendor_session');
    setModalConfig({
      isOpen: true,
      title: 'Vendor Logged Out',
      message: 'You have been logged out of the Vendor Panel successfully.',
      type: 'info',
      confirmText: 'Go to Home Screen',
      onConfirm: () => {
        setModalConfig({ isOpen: false });
        setRoute({ page: 'home' });
      }
    });
  };

  // Delete Vendor Store State & Handler
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingStore, setDeletingStore] = useState(false);

  const handleDeleteVendorStore = async () => {
    try {
      setDeletingStore(true);
      await api.deleteVendor(vendorId || panelData?.vendor?.vendor_id || 1);
      setShowDeleteConfirmModal(false);
      
      setModalConfig({
        isOpen: true,
        title: 'Shop Account Deleted',
        message: 'Your vendor shop store has been permanently deleted from DigiLocal.',
        type: 'info',
        confirmText: 'Return to Home Page',
        onConfirm: () => {
          setModalConfig({ isOpen: false });
          setRoute({ page: 'home' });
        }
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Deletion Error',
        message: 'Failed to delete store. Please try again.',
        type: 'error'
      });
    } finally {
      setDeletingStore(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!panelData || !panelData.vendor) {
    let savedVendorName = 'Vendor';
    try {
      const saved = localStorage.getItem('digilocal_vendor_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.vendor?.vendor_name || parsed?.userName) {
          savedVendorName = parsed?.vendor?.vendor_name || parsed?.userName;
        }
      }
    } catch (_) {}

    return (
      <div className="min-h-screen bg-background text-foreground pb-20 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <Store className="w-10 h-10 text-[#C4A066]" />
            </div>
            <div>
              <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary text-ink border border-border">
                Logged In Vendor Portal
              </span>
              <h1 className="text-3xl font-serif font-black text-ink mt-2">
                Welcome, {savedVendorName}!
              </h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto leading-relaxed">
                Your vendor account is active. Choose an action below to manage your store catalog, add your residential housing society, or register a new storefront.
              </p>
            </div>
          </div>

          {/* Action Hub Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Option 1: Add Residential Society */}
            <div 
              onClick={() => setRoute({ page: 'home', openSocietyModal: true })}
              className="bg-card border border-border hover:border-primary/40 rounded-[2rem] p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-extrabold text-ink group-hover:text-primary transition-colors">
                  Add Residential Society
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Request onboarding for your gated community or housing society to enable resident ordering.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-primary flex items-center space-x-1">
                <span>Onboard Society Now</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Option 2: Register Storefront */}
            <div 
              onClick={() => setRoute({ page: 'vendorRegister', allowNewStore: true })}
              className="bg-card border border-border hover:border-primary/40 rounded-[2rem] p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-extrabold text-ink group-hover:text-primary transition-colors">
                  Register Storefront
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Set up your store profile, select category, upload logo, and configure business timings.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <span>Setup New Store</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Option 3: Explore Homepage Directory */}
            <div 
              onClick={() => setRoute({ page: 'home' })}
              className="bg-card border border-border hover:border-primary/40 rounded-[2rem] p-6 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-extrabold text-ink group-hover:text-primary transition-colors">
                  Browse Societies
                </h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Explore active residential societies, listed vendors, and resident marketplace directory.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-600 flex items-center space-x-1">
                <span>Go to Homepage</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { vendor, items, orders, subscription, payments } = panelData;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 px-3 sm:px-6">
      
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5 min-w-0 flex-1">
              <div className="w-20 h-20 rounded-2xl border-2 border-border bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
                <img
                  src={vendor.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                  alt=""
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="hidden absolute inset-0 bg-[#18281F] text-[#C4A066] items-center justify-center">
                  <Store className="w-8 h-8" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    vendor.status === 'ACTIVE'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-gold/10 text-ink border-gold/30'
                  }`}>
                    Status: {vendor.status === 'ACTIVE' ? 'ACTIVE (STORE LIVE)' : 'PENDING ADMIN APPROVAL'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">• {vendor.society_name}</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-ink uppercase tracking-normal leading-tight break-words">
                  {vendor.store_name}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
                  Vendor: {vendor.vendor_name} ({vendor.email})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 self-start md:self-auto">
              <button
                onClick={loadPanelData}
                className="px-4 py-2.5 rounded-full bg-secondary hover:bg-border text-ink text-xs font-bold flex items-center space-x-2 border border-border shadow-sm uppercase tracking-wider"
              >
                <RefreshCw className="w-4 h-4 text-gold" />
                <span>Refresh Panel</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-1.5 border border-rose-200 shadow-sm uppercase tracking-wider transition-colors cursor-pointer"
                title="Delete Shop Account"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Store</span>
              </button>
            </div>
          </div>

          {/* Pending Admin Approval Banner */}
          {vendor.status === 'PENDING' && (
            <div className="mt-6 p-4 rounded-2xl bg-secondary border border-border text-ink text-xs flex items-start space-x-3 shadow-sm font-medium">
              <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-ink text-sm mb-0.5">Store Setup Active (Hidden From Residents Until Approved)</h4>
                <p className="text-muted-foreground">
                  Your payment is confirmed! You can add products, set prices, and configure store settings now. Your store will automatically become visible to community residents in <strong>{vendor.society_name}</strong> once DigiLocal Admin approves your subscription request.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-8 border-b border-border overflow-x-auto">
            {[
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
              { id: 'items', label: `Items (${items.length})`, icon: Package },
              { id: 'settings', label: 'Store Settings', icon: Settings },
              { id: 'subscription', label: 'Subscription Plan', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-t-2xl text-xs font-bold flex items-center space-x-2 transition-all border-b-2 whitespace-nowrap uppercase tracking-wider ${
                    activeTab === tab.id
                      ? 'bg-secondary text-ink border-primary font-black'
                      : 'text-muted-foreground hover:text-ink border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-gold' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-serif font-bold text-[#0A1428] mb-6 uppercase tracking-wider">Incoming Customer Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#C5A880]/20 p-8 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-[#787F8C] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0A1428] mb-1">No orders received yet</h3>
                <p className="text-[#787F8C] text-xs font-medium">When customers place orders via WhatsApp or website, they will appear here live.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="rounded-2xl bg-white border border-[#C5A880]/25 p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-[#0A1428] text-base">Order #{order.order_id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          order.status === 'PLACED' ? 'bg-[#F6F3EC] text-[#0A1428] border border-[#C5A880]/30' :
                          order.status === 'ACCEPTED' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                          order.status === 'COMPLETED' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-[#787F8C] font-medium">
                          {new Date(order.order_timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/20 text-xs font-medium space-y-1">
                        <p className="font-bold text-[#0A1428]">Customer: {order.customer_name} ({order.phone_number})</p>
                        <p className="text-[#787F8C]">Address: {order.address}</p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] font-bold text-[#0A1428] uppercase tracking-wider">Order Items:</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-[#1F2229] font-medium">
                            <span>• {item.item_name} (×{item.quantity})</span>
                            <span className="font-bold text-[#0A1428]">₹{parseFloat(item.item_total).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-[#C5A880]/20 pt-4 md:pt-0 md:pl-6">
                      <div className="text-right">
                        <span className="text-xs text-[#787F8C] font-medium">Total Amount</span>
                        <p className="text-2xl font-extrabold text-[#C5A880]">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {order.status === 'PLACED' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.order_id, 'ACCEPTED')}
                            className="px-4 py-2 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-sm uppercase tracking-wider"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.order_id, 'COMPLETED')}
                            className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-sm uppercase tracking-wider"
                          >
                            Mark Completed
                          </button>
                        )}
                        {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleOrderStatusChange(order.order_id, 'CANCELLED')}
                            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 uppercase"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ITEMS / INVENTORY TAB */}
        {activeTab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#0A1428] uppercase tracking-wider">Store Inventory & Availability</h2>
                <p className="text-xs text-[#787F8C] font-medium">Toggle availability switch to make any item temporarily available/unavailable for customer ordering.</p>
              </div>

              <button
                onClick={() => { resetItemForm(); setEditingItem(null); setShowAddItemModal(true); }}
                className="px-4 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div key={item.item_id} className="rounded-2xl bg-white border border-[#C5A880]/25 p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="relative mb-3 h-40 rounded-xl overflow-hidden bg-[#FAF9F6]">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80'}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/90 text-[#0A1428] border border-[#C5A880]/30 shadow-sm">
                          {item.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[#0A1428] text-base">{item.item_name}</h3>
                    <p className="text-xs text-[#787F8C] line-clamp-2 mt-1 mb-3 font-medium">{item.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-base font-extrabold text-[#C5A880]">₹{parseFloat(item.price).toFixed(2)}</span>
                      <span className="text-xs text-[#787F8C] font-medium">Stock: {item.stock} {item.unit}</span>
                    </div>
                  </div>

                  {/* ITEM AVAILABILITY TOGGLE SWITCH */}
                  <div className="pt-3 border-t border-[#C5A880]/15 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          item.is_available ? 'bg-[#2E7D32]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            item.is_available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-bold ${item.is_available ? 'text-[#2E7D32]' : 'text-[#787F8C]'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-2 rounded-lg bg-[#FAF9F6] hover:bg-[#F6F3EC] text-[#0A1428] transition-colors border border-[#C5A880]/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.item_id)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. STORE SETTINGS TAB (DigiCafe Hotel-Room-Service Matched) */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">Store & Service Configuration</h2>
              <p className="text-xs text-[#787F8C] font-medium">Configure store details, operating hours, taxes, charges, and order limits matching DigiCafe standards.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* SECTION 1: BRANDING & CONTACT */}
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-4">
                <h3 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider border-b border-[#C5A880]/15 pb-2">1. Store Profile & Branding</h3>
                
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Store / Business Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.store_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Store Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={settingsForm.logo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Store Description</label>
                  <textarea
                    rows={2}
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">WhatsApp Target Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={settingsForm.phone_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">GSTIN Registration Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 07AAACR12341Z5"
                      value={settingsForm.gst_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gst_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STORE TIMINGS */}
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-4">
                <h3 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider border-b border-[#C5A880]/15 pb-2">2. Operating Timings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Opening Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00 AM"
                      value={settingsForm.opening_timing}
                      onChange={(e) => setSettingsForm({ ...settingsForm, opening_timing: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Closing Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 PM"
                      value={settingsForm.closing_timing}
                      onChange={(e) => setSettingsForm({ ...settingsForm, closing_timing: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TAXES & CHARGES */}
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-4">
                <h3 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider border-b border-[#C5A880]/15 pb-2">3. Taxes & Charges</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">GST Tax (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      value={settingsForm.gst_percentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gst_percentage: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Service Charge (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={settingsForm.service_charge_percentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, service_charge_percentage: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Packaging / Delivery (₹)</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={settingsForm.delivery_charge}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_charge: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ORDER LIMITS */}
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-4">
                <h3 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider border-b border-[#C5A880]/15 pb-2">4. Order Restrictions & Limits</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Minimum Order Value (₹)</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={settingsForm.min_order_value}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_order_value: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Max Item Quantity Limit</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="10"
                      value={settingsForm.max_quantity_limit}
                      onChange={(e) => setSettingsForm({ ...settingsForm, max_quantity_limit: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DANGER ZONE - DELETE STORE ACCOUNT */}
              <div className="p-5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
                <div className="flex items-center space-x-2 text-rose-700">
                  <Trash2 className="w-4 h-4 shrink-0 text-rose-600" />
                  <h3 className="text-xs font-serif font-bold uppercase tracking-wider">5. Danger Zone - Delete Shop Account</h3>
                </div>
                <p className="text-xs text-rose-700/80 leading-relaxed font-medium">
                  Permanently delete your vendor shop storefront from DigiLocal. All listed catalog items, store configuration, and order history will be removed.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>Delete My Shop Store</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all"
              >
                {savingSettings ? 'Saving All Store Settings...' : 'Save Store Configuration'}
              </button>
            </form>

            {/* ─── QR CODE CARD (inside Settings tab) ─── */}
            {vendor && (
              <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-[#F6F3EC] border border-[#C5A880]/30 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-[#C5A880]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wider">Your Shop QR Code</h2>
                    <p className="text-xs text-[#787F8C] font-medium">Customers scan this to open your shop directly</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
                  {/* QR Code */}
                  <div className="flex-shrink-0 p-4 rounded-2xl bg-white border-2 border-[#C5A880]/40 shadow-md relative" id="vendor-qr-wrapper">
                    <QRCodeSVG
                      id="vendor-qr-svg"
                      value={`http://localhost:5000/shop/${vendor.vendor_id}`}
                      size={180}
                      bgColor="#FFFFFF"
                      fgColor="#0A1428"
                      level="H"
                      includeMargin={false}
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#0A1428] text-[#C5A880] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                      DigiLocal
                    </div>
                  </div>

                  {/* Info & Actions */}
                  <div className="flex-1 space-y-4 text-sm">
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-2">
                      <p className="text-[11px] text-[#787F8C] font-medium uppercase tracking-wider">Shop Direct Link</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#0A1428] font-bold break-all">
                          localhost:5000/shop/{vendor.vendor_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(`http://localhost:5000/shop/${vendor.vendor_id}`)}
                          title="Copy link"
                          className="p-1.5 rounded-lg bg-white border border-[#C5A880]/30 hover:bg-[#F6F3EC] text-[#0A1428] transition-colors flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <a
                        href={`http://localhost:5000/shop/${vendor.vendor_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/30 hover:border-[#C5A880] text-[#0A1428] font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                        Test Shop Link
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const svg = document.getElementById('vendor-qr-svg');
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          canvas.width = 240; canvas.height = 240;
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, 240, 240);
                            ctx.drawImage(img, 0, 0, 240, 240);
                            const a = document.createElement('a');
                            a.download = `${vendor.store_name || 'shop'}-QR.png`;
                            a.href = canvas.toDataURL('image/png');
                            a.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download QR Code (PNG)
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                        💡 <strong>Tip:</strong> Print this QR and stick it at your shop entrance or packaging. Residents scan it to jump directly to your store.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SUBSCRIPTION PLAN TAB */}
        {activeTab === 'subscription' && (
          <div className="max-w-3xl space-y-6">

            {/* Subscription Status */}
            <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-serif font-extrabold text-[#0A1428] mb-1 uppercase tracking-wider">Active Subscription Status</h2>
              <p className="text-xs text-[#787F8C] mb-6 font-medium">Vendor access control & subscription validity details.</p>

              {subscription ? (
                <div className="p-6 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/30 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#C5A880]/20 pb-3">
                    <span className="text-xs text-[#787F8C] font-medium">Subscription Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 uppercase">
                      {subscription.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-[#787F8C]">Start Date:</span>
                      <p className="font-bold text-[#0A1428]">{subscription.start_date || 'Approved Date'}</p>
                    </div>
                    <div>
                      <span className="text-[#787F8C]">Expiry Date (1 Year):</span>
                      <p className="font-bold text-[#C5A880]">{subscription.end_date || '1 Year After Start'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[#787F8C] text-xs">No subscription record found.</p>
              )}
            </div>

            <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-8 shadow-sm">
              <h3 className="text-base font-serif font-bold text-[#0A1428] mb-4 uppercase tracking-wider">Transaction History</h3>
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.payment_id} className="p-4 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/20 flex items-center justify-between text-xs font-medium shadow-sm">
                    <div>
                      <p className="font-bold text-[#0A1428]">₹{parseFloat(p.amount).toFixed(2)} - {p.payment_method}</p>
                      <p className="text-[11px] text-[#787F8C]">Txn Ref: {p.transaction_id}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/50 backdrop-blur-sm">
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#0A1428] uppercase">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-[#787F8C] hover:text-[#0A1428]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="1 kg, 1L, piece"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Dairy, Fruits, Bakery"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Available Stock</label>
                  <input
                    type="number"
                    value={itemForm.stock}
                    onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/20">
                <span className="text-xs font-bold text-[#0A1428]">Item Availability for Customers</span>
                <button
                  type="button"
                  onClick={() => setItemForm({ ...itemForm, is_available: !itemForm.is_available })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    itemForm.is_available ? 'bg-[#2E7D32]' : 'bg-slate-300'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    itemForm.is_available ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 text-[#787F8C] hover:text-[#0A1428] text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Website Settings Success Modal (DigiCafe Style UI Popup) */}
      {showSettingsSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/60 backdrop-blur-sm">
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
            
            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-serif font-extrabold text-[#0A1428] uppercase tracking-wide mb-1">
              Settings Saved Successfully!
            </h3>
            
            <p className="text-xs text-[#787F8C] leading-relaxed mb-6 font-medium">
              Your store profile, operating hours, taxes, charges, and order limits have been updated in DigiLocal.
            </p>

            <button
              onClick={() => setShowSettingsSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Continue to Vendor Panel
            </button>
          </div>
        </div>
      )}

      {/* Delete Store Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative">
            <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider rounded-full border border-rose-200">
                Permanent Action
              </span>
              <h3 className="text-xl font-serif font-bold text-ink mt-2">
                Delete Store Permanently?
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                Are you sure you want to permanently delete <strong>{panelData?.vendor?.store_name || 'your store'}</strong>? All catalog items, store details, and active order history will be removed. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-full bg-secondary text-ink font-bold text-xs uppercase tracking-wider hover:bg-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingStore}
                onClick={handleDeleteVendorStore}
                className="flex-1 py-3 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{deletingStore ? 'Deleting Store...' : 'Yes, Delete Store'}</span>
              </button>
            </div>
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
