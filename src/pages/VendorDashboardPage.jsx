import React, { useState, useEffect, useRef } from 'react';
import { api, getNormalizedImageUrl } from '../services/api';
import { Store, Package, ShoppingBag, Settings, CreditCard, Plus, Edit2, Trash2, RefreshCw, X, XCircle, ShieldCheck, CheckCircle2, LogOut, QrCode, Download, Copy, ExternalLink, Building2, Sparkles, Upload, Camera, Tag, Image as ImageIcon, ChevronDown, Check, User, Phone, MapPin, Clock, MessageCircle, AlertCircle, AlertTriangle, Bell, Volume2, ArrowRight } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardSkeleton } from '../components/Skeletons';

export default function VendorDashboardPage({ vendorId, setRoute, setActiveVendor, onVendorLogout }) {
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
    stock: '',
    category: 'General',
    unit: 'Piece',
    is_available: true,
    image_url: ''
  });

  // Custom Dropdowns for Add/Edit Item Modal
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const unitDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target)) {
        setShowUnitDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // New Incoming Order Alert & Audio Chime State
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Web Audio API Store Counter Bell Synthesizer (Realistic Metallic Bell Ring)
  const playOrderAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playBellNote = (freq, startTime, duration = 0.8) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // High frequency sparkle overtone for realistic metal bell ring
        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.76, startTime);

        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        overtoneGain.gain.setValueAtTime(0.2, startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.5));

        osc.connect(gain);
        overtone.connect(overtoneGain);
        gain.connect(ctx.destination);
        overtoneGain.connect(ctx.destination);

        osc.start(startTime);
        overtone.start(startTime);
        osc.stop(startTime + duration);
        overtone.stop(startTime + duration);
      };

      // Play double-ding store counter bell chime:
      // Ding 1: 987.77 Hz (B5) at t=0
      playBellNote(987.77, ctx.currentTime, 0.7);
      // Ding 2: 1318.51 Hz (E6) at t=0.18s
      playBellNote(1318.51, ctx.currentTime + 0.18, 1.0);
      // Ding 3: High Accent 1760 Hz (A6) at t=0.36s
      playBellNote(1760.00, ctx.currentTime + 0.36, 1.2);
    } catch (err) {
      console.warn('Audio bell playback error:', err);
    }
  };

  // Real-time Order Alert Listener (Custom Events + Storage Sync + Fast Polling)
  useEffect(() => {
    const handleNewOrderSignal = (orderDetail) => {
      const vId = Number(orderDetail?.vendor_id || orderDetail?.vendorId || 0);
      const currentVId = Number(vendorId || panelData?.vendor?.vendor_id || 0);
      
      if (!vId || vId === currentVId || !currentVId) {
        playOrderAlertSound();
        setNewOrderAlert({
          order_id: orderDetail?.order_id || orderDetail?.id || Math.floor(1000 + Math.random() * 9000),
          total_amount: orderDetail?.total_amount || orderDetail?.total || 0,
          resident_name: orderDetail?.resident_name || orderDetail?.customer_name || 'Resident',
          items_count: orderDetail?.items_count || (orderDetail?.items || []).length || 1,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        loadPanelData();
      }
    };

    // 1. Custom window event (Same-window order placement)
    const onCustomOrderEvent = (e) => {
      if (e.detail) handleNewOrderSignal(e.detail);
    };
    window.addEventListener('digilocal_new_order', onCustomOrderEvent);

    // 2. Cross-tab localStorage storage event
    const onStorageEvent = (e) => {
      if (e.key === 'digilocal_new_order_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) handleNewOrderSignal(parsed);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', onStorageEvent);

    // 3. Fast Polling every 4 seconds for backend orders
    let intervalId = null;
    const checkForNewOrders = async () => {
      try {
        const data = await api.getVendorPanel(vendorId);
        if (data && data.orders) {
          const currentOrders = data.orders || [];
          const currentIds = new Set(currentOrders.map((o) => o.order_id));

          if (isFirstLoadRef.current) {
            knownOrderIdsRef.current = currentIds;
            isFirstLoadRef.current = false;
          } else {
            const newlyArrived = currentOrders.filter((o) => !knownOrderIdsRef.current.has(o.order_id));
            if (newlyArrived.length > 0) {
              const latestOrder = newlyArrived[0];
              playOrderAlertSound();
              setNewOrderAlert({
                order_id: latestOrder.order_id,
                total_amount: latestOrder.total_amount || latestOrder.total || 0,
                resident_name: latestOrder.resident_name || latestOrder.customer_name || 'Resident',
                items_count: (latestOrder.items || []).length || 1,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });
              knownOrderIdsRef.current = currentIds;
              setPanelData(data);
            }
          }
        }
      } catch (err) {
        console.warn('Order polling check failed:', err);
      }
    };

    checkForNewOrders();
    intervalId = setInterval(checkForNewOrders, 4000);

    return () => {
      window.removeEventListener('digilocal_new_order', onCustomOrderEvent);
      window.removeEventListener('storage', onStorageEvent);
      if (intervalId) clearInterval(intervalId);
    };
  }, [vendorId]);

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

  const isItemAvailable = (item) => {
    if (!item) return false;
    const stockNum = parseInt(item.stock ?? 0);
    if (stockNum <= 0) return false;
    if (item.is_available === false || item.is_available === 0 || item.is_available === '0' || item.is_available === 'false') {
      return false;
    }
    return true;
  };

  const handleToggleAvailability = async (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const currentAvail = isItemAvailable(item);
    const newAvail = !currentAvail;
    const stockNum = parseInt(item.stock ?? 0);
    const newStock = newAvail ? (stockNum <= 0 ? 10 : stockNum) : stockNum;

    // Optimistic UI state update so page does not reload
    setPanelData((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.items || []).map((i) =>
        i.item_id === item.item_id ? { ...i, is_available: newAvail ? 1 : 0, stock: newStock } : i
      );
      return { ...prev, items: updatedItems };
    });

    try {
      await api.updateVendorItem(vendorId, item.item_id, {
        is_available: newAvail ? 1 : 0,
        stock: newStock
      });
    } catch (err) {
      loadPanelData();
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
      const stockNum = parseInt(itemForm.stock || 0);
      const isAvail = stockNum > 0 ? (itemForm.is_available !== false && itemForm.is_available !== 0) : false;
      const payload = {
        ...itemForm,
        stock: stockNum,
        is_available: isAvail ? 1 : 0
      };

      if (editingItem) {
        await api.updateVendorItem(vendorId, editingItem.item_id, payload);
      } else {
        await api.addVendorItem(vendorId, payload);
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
    const stockVal = item.stock !== undefined && item.stock !== null ? String(item.stock) : '10';
    const stockNum = parseInt(stockVal || 0);
    const availVal = stockNum > 0 ? (item.is_available !== false && item.is_available !== 0 && item.is_available !== '0' && item.is_available !== 'false') : false;

    setItemForm({
      item_name: item.item_name,
      description: item.description || '',
      price: item.price,
      stock: stockVal,
      category: item.category || 'General',
      unit: item.unit || 'Piece',
      is_available: availVal,
      image_url: item.image_url || ''
    });
    setShowAddItemModal(true);
  };

  const resetItemForm = () => {
    setItemForm({
      item_name: '',
      description: '',
      price: '',
      stock: '',
      category: 'General',
      unit: 'Piece',
      is_available: true,
      image_url: ''
    });
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    // Immediate optimistic state update
    setPanelData((prev) => {
      if (!prev || !Array.isArray(prev.orders)) return prev;
      const updatedOrders = prev.orders.map((o) =>
        String(o.order_id) === String(orderId) ? { ...o, status: newStatus } : o
      );
      return { ...prev, orders: updatedOrders };
    });

    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadPanelData();
      if (newStatus === 'COMPLETED') {
        setModalConfig({
          isOpen: true,
          title: '✅ Order Marked Completed',
          message: `Order ${orderId} has been successfully marked as completed and fulfilled.`,
          type: 'success'
        });
      }
    } catch (err) {
      loadPanelData();
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
      const targetId = vendorId || panelData?.vendor?.vendor_id || 1;
      await api.deleteVendor(targetId);

      // Perform immediate vendor logout in React state & local storage
      if (typeof setActiveVendor === 'function') setActiveVendor(null);
      if (typeof onVendorLogout === 'function') onVendorLogout();

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

  const { vendor, orders, subscription, payments } = panelData;
  const rawItems = panelData?.items || [];

  // Deduplicate items safely by item_id and name
  const deduplicateVendorItems = (itemList) => {
    const seenIds = new Set();
    const seenNames = new Set();
    const cleanList = [];
    for (const item of itemList) {
      if (!item) continue;
      const idKey = String(item.item_id || item.id || '');
      const nameKey = (item.item_name || '').trim().toLowerCase();
      if (idKey && seenIds.has(idKey)) continue;
      if (nameKey && seenNames.has(nameKey)) continue;
      if (idKey) seenIds.add(idKey);
      if (nameKey) seenNames.add(nameKey);
      cleanList.push(item);
    }
    return cleanList;
  };

  const items = deduplicateVendorItems(rawItems);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      
      {/* Thin Notification Alert Strip Banner for Real Incoming Orders (Left to Right Animation & Stays until closed) */}
      {newOrderAlert && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-950 via-[#18281F] to-emerald-900 border-b border-emerald-500/30 text-white shadow-xl px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 animate-in slide-in-from-left duration-500 transform-gpu">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            
            <div className="p-1 rounded-lg bg-emerald-500/20 text-[#E6C35C] shrink-0 border border-emerald-500/30">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold truncate">
              <span className="font-extrabold text-[#E6C35C] uppercase tracking-wider text-[11px] shrink-0">
                New Order Alert!
              </span>
              <span className="text-emerald-200/40 hidden sm:inline">•</span>
              <span className="truncate">
                Order <span className="font-mono font-bold text-white">#{newOrderAlert.order_id}</span> — <span className="font-extrabold text-white">₹{newOrderAlert.total_amount}</span> ({newOrderAlert.items_count} items) by <span className="text-emerald-200 font-bold">{newOrderAlert.resident_name}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('orders');
                setNewOrderAlert(null);
              }}
              className="px-3 py-1 rounded-full bg-[#E6C35C] hover:bg-[#f0d277] text-[#18281F] font-extrabold text-[11px] flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <span>View Order</span>
              <ArrowRight className="w-3 h-3 text-[#18281F]" />
            </button>

            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors cursor-pointer"
              title="Close Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 pb-20 space-y-6">
        
        {/* Top Banner */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5 min-w-0 flex-1">
              <div className="w-20 h-20 rounded-2xl border-2 border-border bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative">
                <img
                  src={getNormalizedImageUrl(vendor.logo || vendor.image_url || localStorage.getItem(`digilocal_vendor_logo_${vendor.vendor_id}`)) || 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80'}
                  alt={vendor.store_name || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-secondary text-ink border border-border">
                    {vendor.category || 'General Store'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {vendor.status || 'ACTIVE'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink mt-1 truncate">
                  {vendor.store_name}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
                  Vendor: {vendor.vendor_name}
                  {vendor.email && vendor.email.includes('@') && !vendor.email.includes('@vendor.digilocal') 
                    ? ` (${vendor.email})` 
                    : (vendor.phone_number || vendor.phone ? ` • ${vendor.phone_number || vendor.phone}` : '')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 self-start md:self-auto flex-wrap gap-y-2">
              <button
                onClick={loadPanelData}
                className="px-4 py-2.5 rounded-full bg-secondary hover:bg-border text-ink text-xs font-bold flex items-center space-x-2 border border-border shadow-sm uppercase tracking-wider cursor-pointer"
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
        </div>

        {/* Pending Admin Approval Banner */}
        {vendor.status === 'PENDING' && (
          <div className="p-4 rounded-2xl bg-secondary border border-border text-ink text-xs flex items-start space-x-3 shadow-sm font-medium">
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
        <div className="flex items-center space-x-2 border-b border-border overflow-x-auto">
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

        {/* Main Tab Content */}
        <div className="pt-2">

        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-serif font-extrabold text-[#18281F] uppercase tracking-wider">
                  Incoming Customer Orders
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Manage resident orders, track fulfillment status, and contact customer directly
                </p>
              </div>
              {orders.length > 0 && (
                <span className="px-3.5 py-1.5 rounded-full bg-[#18281F] text-[#E6C35C] font-extrabold text-xs shadow-xs">
                  {orders.length} Active Order{orders.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#1E3623]/15 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#E3EFE6] border border-[#18281F]/20 flex items-center justify-center text-[#18281F] mx-auto mb-3 shadow-2xs">
                  <ShoppingBag className="w-8 h-8 text-[#18281F]" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#18281F] mb-1">No customer orders received yet</h3>
                <p className="text-muted-foreground text-xs font-medium max-w-sm mx-auto">
                  When residents place orders for your store items, customer details and item lists will appear here live.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {orders.map((order) => {
                  const statusUpper = (order.status || 'PENDING').toUpperCase();
                  const customerPhone = order.phone_number || order.phone || order.user_phone || '';
                  const customerName = order.customer_name || order.user_name || order.name || 'Resident Customer';
                  let rawAddr = order.address || order.delivery_address || 'Resident Address';
                  const targetSocietyName = order.society_name || vendor?.society_name || vendor?.location || '';
                  
                  if (targetSocietyName && rawAddr.match(/,\s*(Society|Gated Community|Gated Housing Society)$/i)) {
                    rawAddr = rawAddr.replace(/,\s*(Society|Gated Community|Gated Housing Society)$/i, `, ${targetSocietyName}`);
                  }
                  const deliveryAddr = rawAddr;
                  const orderItems = Array.isArray(order.items) ? order.items : [];
                  const orderDateStr = new Date(order.order_timestamp || order.date || order.timestamp || Date.now()).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={order.order_id}
                      className="rounded-3xl bg-white border border-[#1E3623]/15 p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Left Side: Order Identifiers & Customer Card */}
                      <div className="space-y-4 flex-1 min-w-0">
                        {/* Header: Order ID + Status Badge + Date */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-border/60">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center font-black text-xs shadow-2xs shrink-0 gap-1">
                              <ShoppingBag className="w-3.5 h-3.5 text-[#E6C35C]" />
                              <span>#{order.order_id.toString().replace('ORD-', '').slice(-4)}</span>
                            </div>
                            <span className="font-serif font-extrabold text-[#18281F] text-base tracking-wide truncate">
                              Order #{order.order_id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
                              statusUpper === 'PLACED' || statusUpper === 'PENDING'
                                ? 'bg-[#FFF9E6] text-[#8C6B1B] border-[#E6C35C]'
                                : statusUpper === 'ACCEPTED'
                                ? 'bg-[#E3EFE6] text-[#1E3623] border-[#1E3623]/30'
                                : statusUpper === 'COMPLETED' || statusUpper === 'DELIVERED'
                                ? 'bg-[#18281F] text-[#E6C35C] border-[#18281F]'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              ● {statusUpper}
                            </span>

                            <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 bg-[#FAF9F6] px-2.5 py-1 rounded-full border border-border/60">
                              <Clock className="w-3 h-3 text-[#18281F]" />
                              <span>{orderDateStr}</span>
                            </span>
                          </div>
                        </div>

                        {/* Customer Identity Card */}
                        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#1E3623]/10 space-y-2 text-xs font-semibold">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[#18281F]">
                              <User className="w-4 h-4 text-[#18281F] shrink-0" />
                              <span className="font-extrabold text-sm text-[#18281F]">
                                {customerName}
                              </span>
                            </div>

                            {customerPhone && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${customerPhone}`}
                                  className="text-xs font-bold text-emerald-900 hover:text-emerald-950 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs"
                                >
                                  <Phone className="w-3 h-3 text-emerald-700" />
                                  <span>{customerPhone}</span>
                                </a>

                                <a
                                  href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-xl border border-emerald-300 transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-800" />
                                  <span>Chat</span>
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex items-start gap-2 text-muted-foreground pt-1 border-t border-border/50">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="font-semibold text-gray-700">
                              {deliveryAddr}
                            </span>
                          </div>
                        </div>

                        {/* Itemized Products List */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#18281F]">
                            <span>ORDER ITEMS ({orderItems.length})</span>
                            <span>ITEM SUB-TOTAL</span>
                          </div>

                          <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-border/70">
                            {orderItems.length > 0 ? (
                              orderItems.map((item, idx) => {
                                const qty = item.quantity || 1;
                                const unitPrice = parseFloat(item.unit_price || item.price || 0);
                                const total = item.item_total ? parseFloat(item.item_total) : (qty * unitPrice);

                                return (
                                  <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                                    <div className="flex items-center gap-2 pr-2 min-w-0">
                                      <span className="w-5 h-5 rounded-md bg-[#E3EFE6] text-[#18281F] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                        ×{qty}
                                      </span>
                                      <span className="text-[#18281F] truncate font-bold">
                                        {item.item_name || item.name || 'Ordered Product'}
                                      </span>
                                    </div>
                                    <span className="font-extrabold text-[#18281F] shrink-0">
                                      ₹{total.toFixed(2)}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-muted-foreground font-semibold py-1">
                                Standard customer store order
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Total Amount & Order Lifecycle Action Buttons */}
                      <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-border/60 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                        <div className="text-right w-full bg-[#FAF9F6] p-4 rounded-2xl border border-[#1E3623]/10">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            TOTAL ORDER AMOUNT
                          </span>
                          <p className="text-2xl font-serif font-black text-[#18281F] mt-0.5">
                            ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                          </p>
                          <span className="text-[10px] font-bold text-emerald-800 bg-[#E3EFE6] px-2 py-0.5 rounded-full inline-block mt-1">
                            {order.payment_method || 'Verified Resident Order'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-4">
                          {(statusUpper === 'PLACED' || statusUpper === 'PENDING' || statusUpper === 'IN_PROGRESS') && (
                            <button
                              type="button"
                              onClick={() => handleOrderStatusChange(order.order_id, 'ACCEPTED')}
                              className="w-full py-2.5 px-4 rounded-2xl bg-[#18281F] hover:bg-black text-white font-bold text-xs shadow-md uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#E6C35C]" />
                              <span>Accept Order</span>
                            </button>
                          )}

                          {statusUpper === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => handleOrderStatusChange(order.order_id, 'COMPLETED')}
                              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Mark Completed</span>
                            </button>
                          )}

                          {statusUpper === 'COMPLETED' && (
                            <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Order Completed</span>
                            </div>
                          )}

                          {statusUpper === 'CANCELLED' && (
                            <div className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-extrabold text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-2xs">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Order Cancelled</span>
                            </div>
                          )}

                          {statusUpper !== 'CANCELLED' && statusUpper !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleOrderStatusChange(order.order_id, 'CANCELLED')}
                              className="w-full py-2 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. ITEMS / INVENTORY TAB */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="text-lg font-serif font-black text-ink uppercase tracking-wider">Store Inventory & Availability</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Toggle availability switch to make any item temporarily available/unavailable for customer ordering.</p>
              </div>

              <button
                onClick={() => { resetItemForm(); setEditingItem(null); setShowAddItemModal(true); }}
                className="px-5 py-2.5 rounded-full bg-[#18281F] hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 uppercase tracking-wider shrink-0 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E6C35C]" />
                <span>Add New Item</span>
              </button>
            </div>

            <div className={`grid gap-5 ${
              items.length === 1 
                ? 'grid-cols-1 max-w-md' 
                : items.length === 2 
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl' 
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
            }`}>
              {items.map((item, idx) => (
                <div key={`item-${item.item_id || idx}-${idx}`} className="rounded-2xl bg-card border border-border/80 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
                  <div>
                    <div className="relative mb-3.5 h-44 sm:h-48 w-full rounded-xl overflow-hidden bg-secondary border border-border/40">
                      <img
                        src={getNormalizedImageUrl(item)}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-full bg-white/95 text-ink border border-border/50 shadow-xs backdrop-blur-xs">
                          {item.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif font-extrabold text-ink text-base line-clamp-1">{item.item_name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 mb-3 font-medium">{item.description || 'Fresh store product'}</p>
                    
                    <div className="flex items-center justify-between text-xs mb-3.5 pt-2 border-t border-border/40">
                      <span className="text-base sm:text-lg font-black text-primary">₹{parseFloat(item.price).toFixed(2)}</span>
                      <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border/60">
                        Stock: <strong className="text-ink">{item.stock}</strong> {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* ITEM AVAILABILITY TOGGLE SWITCH */}
                  <div className="pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleAvailability(item, e)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isItemAvailable(item) ? 'bg-[#2E7D32]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            isItemAvailable(item) ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-bold ${isItemAvailable(item) ? 'text-[#2E7D32]' : 'text-slate-500'}`}>
                        {isItemAvailable(item) ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-2 rounded-xl bg-secondary hover:bg-border text-ink transition-colors border border-border/60 cursor-pointer"
                        title="Edit item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.item_id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 cursor-pointer"
                        title="Delete item"
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0A1428] uppercase">Store Logo Image URL</label>
                    <span className="text-[10px] text-amber-800 font-medium">💡 Requires direct image URL (.jpg/.png/CDN)</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={settingsForm.logo}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none"
                    />
                    {settingsForm.logo && (
                      <div className="w-10 h-10 rounded-xl border border-border overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                        <img
                          src={getNormalizedImageUrl(settingsForm.logo)}
                          alt="Preview"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-normal">
                    Note: iStockphoto HTML search pages (like <code className="bg-muted px-1 rounded">https://www.istockphoto.com/photos/...</code>) are web page URLs. DigiLocal automatically converts them to high-resolution store cover images.
                  </p>
                  
                  {/* Preset Quick Selectors */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-[#0A1428] mr-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logo: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200 transition-colors"
                    >
                      🌸 Florist / Bouquet
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logo: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 transition-colors"
                    >
                      🍞 Bakery & Cakes
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold border border-blue-200 transition-colors"
                    >
                      🥦 Fresh Grocery
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logo: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80' })}
                      className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-[11px] font-bold border border-cyan-200 transition-colors"
                    >
                      🥛 Dairy Products
                    </button>
                  </div>
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
                <div className="flex items-center justify-between border-b border-[#C5A880]/15 pb-2">
                  <h3 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider">2. Store Operating Timings & Availability</h3>
                  <span className="text-[10px] text-muted-foreground font-medium">Controls store open/closed badges & ordering availability</span>
                </div>
                
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
    </div>

      {/* Add / Edit Product Modal (Compact, Sleek & Modern Design) */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8E2D5] rounded-2xl max-w-md w-full max-h-[88vh] shadow-xl flex flex-col overflow-hidden text-ink relative">
            
            {/* Sleek Compact Header */}
            <div className="px-4 py-3 border-b border-[#E8E2D5] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E3EFE6] border border-[#18281F]/20 flex items-center justify-center text-[#18281F]">
                  <Sparkles className="w-4 h-4 text-[#C4A066]" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#18281F]">
                    {editingItem ? 'Edit Product Item' : 'Add New Product'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Enter product details, pricing & stock quantity
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowAddItemModal(false)} 
                className="w-7 h-7 rounded-full bg-white hover:bg-[#EFEADF] border border-[#E8E2D5] text-gray-500 hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveItem} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 overflow-y-auto space-y-3 flex-1 scrollbar-thin">

                {/* 1. COMPACT PHOTO UPLOAD BAR */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                    PRODUCT IMAGE
                  </label>
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EBE5D8]">
                    <div className="relative shrink-0">
                      {itemForm.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#C4A066]">
                          <img 
                            src={getNormalizedImageUrl(itemForm.image_url)} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setItemForm({ ...itemForm, image_url: '' })} 
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-12 h-12 rounded-lg border border-dashed border-[#C4A066]/60 bg-white flex items-center justify-center cursor-pointer hover:bg-[#EFEADF] transition-colors">
                          <Camera className="w-5 h-5 text-[#C4A066]" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setItemForm({ ...itemForm, image_url: reader.result });
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="url"
                        placeholder="Paste image URL..."
                        value={itemForm.image_url}
                        onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                        className="w-full bg-white border border-[#E5DFD1] focus:border-[#18281F] rounded-lg px-2.5 py-1.5 text-xs text-[#18281F] focus:outline-none"
                      />
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <label className="font-bold text-[#18281F] hover:underline cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3 text-[#C4A066]" /> Upload Media
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setItemForm({ ...itemForm, image_url: reader.result });
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                        <label className="font-bold text-[#18281F] hover:underline cursor-pointer flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#C4A066]" /> Capture Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setItemForm({ ...itemForm, image_url: reader.result });
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PRODUCT NAME */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amul Gold Fresh Milk 1L"
                    value={itemForm.item_name}
                    onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D5] focus:border-[#18281F] rounded-xl px-3 py-2 text-xs font-bold text-[#18281F] focus:outline-none"
                  />
                </div>

                {/* 3. CATEGORY & PRICE (2 COLUMNS) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                      CATEGORY *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D5] hover:border-[#18281F] rounded-xl pl-8 pr-2.5 py-2 text-xs font-bold text-[#18281F] flex items-center justify-between cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5 text-[#C4A066] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <span className="truncate">{itemForm.category || 'Category'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#18281F] shrink-0 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showCategoryDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E8E2D5] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                          {[
                            'General',
                            'Dairy & Milk',
                            'Fresh Fruits & Vegetables',
                            'Bakery, Cakes & Desserts',
                            'Flowers, Plants & Gardening',
                            'Groceries, Oils & Staples',
                            'Beverages & Cold Drinks',
                            'Snacks, Namkeen & Biscuits',
                            'Sweets & Mithai',
                            'Organic & Health Foods',
                            'Chemist & Medicines',
                            'Personal Care & Hygiene',
                            'Home, Kitchen & Cleaning Supplies',
                            'Resin Art, Crafts & Gifts',
                            'Stationery, Books & Office Items',
                            'Electronics & Electrical Accessories',
                            'Poultry, Meat & Seafood',
                            'Baby Care & Toys',
                            'Pet Food & Accessories',
                            'Clothing & Tailoring',
                            'Home Decor & Pooja Needs',
                            'Services & Repairs'
                          ].map((cat) => (
                            <div
                              key={cat}
                              onClick={() => {
                                setItemForm({ ...itemForm, category: cat });
                                setShowCategoryDropdown(false);
                              }}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                                itemForm.category === cat 
                                  ? 'bg-[#18281F] text-white' 
                                  : 'text-[#18281F] hover:bg-[#E3EFE6]'
                              }`}
                            >
                              <span className="truncate">{cat}</span>
                              {itemForm.category === cat && <Check className="w-3 h-3 text-[#E6C35C] shrink-0" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price (₹) */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                      PRICE (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#C4A066]">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="199.00"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D5] focus:border-[#18281F] rounded-xl pl-7 pr-2.5 py-2 text-xs font-bold text-[#18281F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. UNIT & STOCK QUANTITY (2 COLUMNS) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Unit Select Dropdown */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                      UNIT *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D5] hover:border-[#18281F] rounded-xl px-3 py-2 text-xs font-bold text-[#18281F] flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{itemForm.unit || 'Piece'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#18281F] shrink-0 transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showUnitDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E8E2D5] rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
                          {[
                            'Piece',
                            'Set',
                            'Packet',
                            'Box',
                            '1 kg',
                            '500g',
                            '250g',
                            '1L',
                            '500ml',
                            'Dozen',
                            'Bunch'
                          ].map((u) => (
                            <div
                              key={u}
                              onClick={() => {
                                setItemForm({ ...itemForm, unit: u });
                                setShowUnitDropdown(false);
                              }}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                                itemForm.unit === u || itemForm.unit?.toLowerCase() === u.toLowerCase()
                                  ? 'bg-[#18281F] text-white' 
                                  : 'text-[#18281F] hover:bg-[#E3EFE6]'
                              }`}
                            >
                              <span>{u}</span>
                              {(itemForm.unit === u || itemForm.unit?.toLowerCase() === u.toLowerCase()) && (
                                <Check className="w-3 h-3 text-[#E6C35C]" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock Quantity Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                      STOCK QUANTITY *
                    </label>
                    <div className="relative">
                      <Package className="w-3.5 h-3.5 text-[#C4A066] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 10"
                        value={itemForm.stock}
                        onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                        className="w-full bg-[#FAF8F5] border border-[#E8E2D5] focus:border-[#18281F] rounded-xl pl-8 pr-2.5 py-2 text-xs font-bold text-[#18281F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. ITEM AVAILABILITY TOGGLE */}
                <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${itemForm.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#18281F]">
                      {itemForm.is_available ? 'Item Available for Orders' : 'Item Out of Stock / Hidden'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemForm({ ...itemForm, is_available: !itemForm.is_available })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      itemForm.is_available ? 'bg-[#18281F]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#C4A066] shadow transition duration-200 ease-in-out ${
                        itemForm.is_available ? 'translate-x-4' : 'translate-x-0 bg-white'
                      }`}
                    />
                  </button>
                </div>

                {/* 6. DESCRIPTION (1 ROW) */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#18281F] mb-1">
                    DESCRIPTION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Short item details..."
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D5] focus:border-[#18281F] rounded-xl px-3 py-2 text-xs font-medium text-[#18281F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Compact Fixed Footer */}
              <div className="px-4 py-3 border-t border-[#E8E2D5] shrink-0 bg-[#FAF9F6]">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#18281F] hover:bg-black text-[#C4A066] font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C4A066]" />
                  <span>{editingItem ? 'Save Changes' : 'Add Product to Store'}</span>
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
