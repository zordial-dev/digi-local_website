import React, { useState, useEffect } from 'react';
import { api, getNormalizedImageUrl, getStoreTimeStatus } from '../services/api';
import { ArrowLeft, ShoppingBag, Plus, Minus, X, Check, Search, ShieldCheck, Phone, AlertTriangle, FileText, MessageSquare, HelpCircle, Send, Home, MapPin, Edit3, CreditCard, Lock, User, Building2, LogIn, Clock, Heart } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import DummyPaymentModal from '../components/DummyPaymentModal';
import LiveOrderTrackerToast from '../components/LiveOrderTrackerToast';
import LoginModal from '../components/LoginModal';
import DeliveryAddressModal from '../components/DeliveryAddressModal';
import { ProductCardSkeleton } from '../components/Skeletons';

export default function VendorStorefrontPage({ currentRoute, societyId, vendorId, setRoute, onOpenLoginModal, activeUser }) {
  const [vendorData, setVendorData] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Favorite Vendor State (Con-04)
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (vendorData?.vendor_id) {
      try {
        const saved = localStorage.getItem('digilocal_favorite_vendors');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            setIsFavorite(list.some(f => String(f.vendor_id) === String(vendorData.vendor_id)));
          }
        }
      } catch (_) {}
    }
  }, [vendorData]);

  // Flat & Location Entry State
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [showDeliveryAddressModal, setShowDeliveryAddressModal] = useState(false);
  const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

  // Sync flat number dynamically from active logged-in user or session
  useEffect(() => {
    let u = activeUser;
    if (!u) {
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          u = parsed.user || parsed;
        }
      } catch (_) {}
    }
    if (u) {
      if (u.flat) setFlatNumber(u.flat);
      if (u.building || u.block) setBuildingNumber(u.building || u.block || '');
    }
  }, [activeUser]);

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(Boolean(currentRoute?.openCart));
  const [orderRemark, setOrderRemark] = useState('');
  const [pendingWhatsappUrl, setPendingWhatsappUrl] = useState('');

  useEffect(() => {
    if (currentRoute?.openCart) {
      setShowCartDrawer(true);
    }
  }, [currentRoute?.openCart]);

  // Lock background page scroll when Cart Side Panel Drawer is open
  useEffect(() => {
    if (showCartDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCartDrawer]);
  
  // Replace Cart Modal State
  const [showReplaceCartModal, setShowReplaceCartModal] = useState(false);
  const [pendingReplaceItem, setPendingReplaceItem] = useState(null);
  const [existingCartVendorName, setExistingCartVendorName] = useState('');

  // Restore persisted active cart for THIS vendor on mount/vendorId change
  useEffect(() => {
    if (!vendorId) return;
    try {
      const activeCartStr = localStorage.getItem('digilocal_active_cart');
      if (activeCartStr) {
        const parsedCart = JSON.parse(activeCartStr);
        if (parsedCart && parsedCart.vendor && String(parsedCart.vendor.vendor_id) === String(vendorId)) {
          if (Array.isArray(parsedCart.items)) {
            setCart(parsedCart.items);
          }
        }
      }
    } catch (_) {}
  }, [vendorId]);

  // Modals & Tracking
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Service Enquiry State
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Today (ASAP)');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  const handleServiceEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!checkResidentAuth()) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      setSubmittingEnquiry(true);
      let currentUser = null;
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          currentUser = parsed.user || parsed.resident || parsed;
        }
      } catch (_) {}

      const resName = currentUser?.name || currentUser?.full_name || `Flat ${flatNumber || 'Resident'}`;
      const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || '';

      const payload = {
        vendor_id: vendorId,
        resident_name: resName,
        resident_phone: resPhone,
        society_name: vendorData?.society_name || currentUser?.society_name || 'Society',
        flat_number: flatNumber || '101',
        service_title: serviceTitle || vendorData?.store_name || 'Service Enquiry',
        description: serviceDescription,
        preferred_time: preferredTime
      };

      await api.createServiceEnquiry(payload);

      const targetPhone = vendorData?.phone_number || '8005625999';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone || '918005625999');

      let msg = `🛠️ *New Service Request from Flat ${flatNumber || 'Resident'}*\n`;
      msg += `--------------------------------------\n`;
      msg += `📍 *Society:* ${payload.society_name}\n`;
      msg += `🛠️ *Service:* ${payload.service_title}\n`;
      msg += `📝 *Details:* ${serviceDescription || 'Need service assistance'}\n`;
      msg += `⏰ *Preferred Time:* ${preferredTime}\n`;
      msg += `--------------------------------------\n`;
      msg += `Please confirm appointment. Thank you!`;

      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');

      setModalConfig({
        isOpen: true,
        title: 'Service Enquiry Sent!',
        message: 'Your service request has been sent to the vendor. They will contact you shortly.',
        type: 'success'
      });
      setServiceTitle('');
      setServiceDescription('');
    } catch (err) {
      setModalConfig({ isOpen: true, title: 'Error', message: 'Failed to submit enquiry', type: 'error' });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Auth Guard Helper: Check if user is logged in
  const checkResidentAuth = () => {
    try {
      const resSession = localStorage.getItem('digilocal_resident_session');
      const venSession = localStorage.getItem('digilocal_vendor_session');
      if (resSession || venSession) {
        return true;
      }
    } catch (_) {}
    return false;
  };

  const handleCheckoutOnline = () => {
    if (!checkResidentAuth()) {
      setModalConfig({
        isOpen: true,
        title: '🔒 Login Required to Place Order',
        message: 'You cannot place an order without signing in or registering your mobile number. Please log in to proceed.',
        type: 'warning'
      });
      setIsLoginModalOpen(true);
      return;
    }
    setShowPaymentModal(true);
  };

  const [forbiddenError, setForbiddenError] = useState(null);

  useEffect(() => {
    loadStorefront();

    const syncSavedAddress = () => {
      try {
        const savedAddressesStr = localStorage.getItem('digilocal_saved_addresses');
        if (savedAddressesStr) {
          const parsedList = JSON.parse(savedAddressesStr);
          if (Array.isArray(parsedList) && parsedList.length > 0) {
            const defaultAddr = parsedList.find(a => a.isDefault) || parsedList[0];
            if (defaultAddr && (defaultAddr.flat || defaultAddr.address)) {
              setFlatNumber(defaultAddr.flat || defaultAddr.address);
              setBuildingNumber(defaultAddr.building || '');
              return;
            }
          }
        }
        const savedLocStr = localStorage.getItem('digilocal_user_location');
        if (savedLocStr) {
          const parsedLoc = JSON.parse(savedLocStr);
          if (parsedLoc && (parsedLoc.flat || parsedLoc.address)) {
            setFlatNumber(parsedLoc.flat || parsedLoc.address);
            return;
          }
        }
      } catch (_) {}
    };

    syncSavedAddress();

    window.addEventListener('digilocal_saved_addresses_updated', syncSavedAddress);
    window.addEventListener('digilocal_location_changed', syncSavedAddress);

    return () => {
      window.removeEventListener('digilocal_saved_addresses_updated', syncSavedAddress);
      window.removeEventListener('digilocal_location_changed', syncSavedAddress);
    };
  }, [vendorId]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      setForbiddenError(null);

      let userLoc = null;
      try {
        const saved = localStorage.getItem('digilocal_user_location');
        if (saved) userLoc = JSON.parse(saved);
      } catch (_) {}

      // Attempt 1: Fetch vendor storefront details with user location
      let data = await api.getVendorStorefront(vendorId, {
        user_lat: userLoc?.lat,
        user_lng: userLoc?.lng
      });

      if (data && data.forbidden) {
        setForbiddenError(data);
        return;
      }

      // Attempt 2: If data is null or empty, fetch vendor without location restriction
      if (!data || (!data.vendor && !data.store_name && !data.name)) {
        data = await api.getVendorStorefront(vendorId, {});
      }

      let targetVendor = data?.vendor || (data?.store_name || data?.name ? data : null);

      // Attempt 3: If still missing, query society/all vendors API list to find vendor by vendorId
      if (!targetVendor || (!targetVendor.store_name && !targetVendor.name && !targetVendor.vendor_name)) {
        try {
          const allVendorsData = await api.getSocietyVendors('all');
          const vendorsList = Array.isArray(allVendorsData) ? allVendorsData : (allVendorsData?.vendors || allVendorsData?.data || []);
          const found = vendorsList.find(v => v && String(v.vendor_id || v.id) === String(vendorId));
          if (found) {
            targetVendor = found;
          }
        } catch (_) {}
      }

      // Attempt 4: Search persistent local storage vendors list if backend is un-reachable
      if (!targetVendor || (!targetVendor.store_name && !targetVendor.name)) {
        try {
          const savedVendorsStr = localStorage.getItem('digilocal_registered_vendors') || localStorage.getItem('digilocal_vendors');
          if (savedVendorsStr) {
            const list = JSON.parse(savedVendorsStr);
            if (Array.isArray(list)) {
              const found = list.find(v => v && String(v.vendor_id || v.id) === String(vendorId));
              if (found) targetVendor = found;
            }
          }
        } catch (_) {}
      }

      if (targetVendor) {
        const resolvedStoreName = targetVendor.store_name || targetVendor.name || targetVendor.vendor_name || targetVendor.business_name || targetVendor.shop_business_name || targetVendor.shop_name || targetVendor.title || `Vendor Store #${vendorId}`;
        const normalizedVendor = {
          ...targetVendor,
          store_name: resolvedStoreName,
          society_name: targetVendor.society_name || targetVendor.society || targetVendor.location || targetVendor.address || targetVendor.area || 'Residential Community',
          category: targetVendor.category || targetVendor.business_category || targetVendor.business_type || targetVendor.vendor_type || 'General Store',
          logo: targetVendor.logo || targetVendor.image_url || targetVendor.shop_images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
          phone_number: targetVendor.phone_number || targetVendor.phone || targetVendor.mobile || targetVendor.contact || ''
        };

        setVendorData(normalizedVendor);

        let rawItems = Array.isArray(data?.items) && data.items.length > 0
          ? data.items
          : (Array.isArray(targetVendor.items) && targetVendor.items.length > 0 ? targetVendor.items : []);

        // Fallback to local storage custom items if empty
        if (!rawItems || rawItems.length === 0) {
          try {
            const localKey = `digilocal_vendor_items_${vendorId}`;
            const localStr = localStorage.getItem(localKey);
            if (localStr) {
              const parsed = JSON.parse(localStr);
              if (Array.isArray(parsed) && parsed.length > 0) rawItems = parsed;
            }
          } catch (_) {}
        }

        // If items are still empty, fetch items from global products API
        if (!rawItems || rawItems.length === 0) {
          try {
            const allItemsRes = await api.getItems?.();
            if (Array.isArray(allItemsRes)) {
              const matched = allItemsRes.filter(i => i && String(i.vendor_id) === String(vendorId));
              if (matched.length > 0) rawItems = matched;
            }
          } catch (_) {}
        }

        setItems(rawItems || []);

        const catSet = new Set(['All']);
        (rawItems || []).forEach(i => {
          if (i && i.category) catSet.add(i.category);
        });
        setCategories(Array.from(catSet));
      }
    } catch (err) {
      console.error("loadStorefront error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangeLocation = () => {
    setShowDeliveryAddressModal(true);
  };

  // Helper to persist active cart to localStorage & notify all components across pages
  const saveCartToStorage = (updatedCart) => {
    setCart(updatedCart);
    try {
      if (updatedCart && updatedCart.length > 0) {
        const cartPayload = {
          vendor: {
            vendor_id: String(vendorData?.vendor_id || vendorId),
            store_name: vendorData?.store_name || 'Community Store',
            society_id: vendorData?.society_id || 'all',
            logo: vendorData?.logo || ''
          },
          items: updatedCart
        };
        localStorage.setItem('digilocal_active_cart', JSON.stringify(cartPayload));
        window.dispatchEvent(new CustomEvent('digilocal_cart_updated', { detail: cartPayload }));
      } else {
        localStorage.removeItem('digilocal_active_cart');
        window.dispatchEvent(new CustomEvent('digilocal_cart_updated', { detail: null }));
      }
    } catch (_) {}
  };

  const addToCart = (item) => {
    if (item.is_available === false) return;
    if (!flatNumber) {
      setPendingItemToAdd(item);
      setShowDeliveryAddressModal(true);
      return;
    }

    // Check if active cart exists for ANOTHER vendor
    try {
      const activeCartStr = localStorage.getItem('digilocal_active_cart');
      if (activeCartStr) {
        const parsedCart = JSON.parse(activeCartStr);
        const existingVendorId = parsedCart?.vendor?.vendor_id;
        const currentVId = String(vendorData?.vendor_id || vendorId);

        if (existingVendorId && String(existingVendorId) !== currentVId && Array.isArray(parsedCart.items) && parsedCart.items.length > 0) {
          // Trigger Replace Cart Warning Modal!
          setExistingCartVendorName(parsedCart.vendor?.store_name || 'another vendor');
          setPendingReplaceItem(item);
          setShowReplaceCartModal(true);
          return;
        }
      }
    } catch (_) {}

    // Same vendor or empty cart: proceed normally
    const existing = cart.find(i => i.item_id === item.item_id);
    let updated;
    if (existing) {
      updated = cart.map(i => i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updated = [...cart, { ...item, quantity: 1, specialInstructions: '' }];
    }
    saveCartToStorage(updated);
  };

  const handleConfirmReplaceCart = () => {
    if (!pendingReplaceItem) return;
    const newItem = pendingReplaceItem;
    const updated = [{ ...newItem, quantity: 1, specialInstructions: '' }];
    saveCartToStorage(updated);
    setShowReplaceCartModal(false);
    setPendingReplaceItem(null);
  };

  const updateQuantity = (itemId, delta) => {
    const updated = cart.map(i => {
      if (i.item_id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean);
    saveCartToStorage(updated);
  };

  const updateInstructions = (itemId, text) => {
    const updated = cart.map(i => i.item_id === itemId ? { ...i, specialInstructions: text } : i);
    saveCartToStorage(updated);
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter(item => {
    if (!item) return false;
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const itemName = String(item.item_name || item.name || '');
    const itemDesc = String(item.description || '');
    const q = (search || '').toLowerCase().trim();
    const matchesSearch = !q || itemName.toLowerCase().includes(q) || itemDesc.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  }).reduce((acc, current) => {
    if (!current) return acc;
    const nameKey = String(current.item_name || current.name || '').trim().toLowerCase();
    const idKey = String(current.item_id || current.id || '');
    const isDuplicate = acc.some(item => 
      (nameKey && String(item.item_name || item.name || '').trim().toLowerCase() === nameKey) ||
      (idKey && String(item.item_id || item.id || '') === idKey)
    );
    if (!isDuplicate) acc.push(current);
    return acc;
  }, []);

  // Save Order Helper for User Profile Order History & Vendor Dashboard
  const saveOrderToUserProfile = (orderId, totalAmount, itemsList, isWhatsApp = false, txnDetails = null) => {
    let currentUser = null;
    try {
      const keys = ['digilocal_user_session', 'digilocal_resident_session', 'user_profile', 'resident_profile', 'digilocal_user', 'digilocal_resident'];
      for (const k of keys) {
        const uStr = localStorage.getItem(k);
        if (uStr) {
          const parsed = JSON.parse(uStr);
          const u = parsed.user || parsed.resident || parsed;
          if (u && (u.name || u.phone || u.mobile || u.full_name)) {
            currentUser = u;
            break;
          }
        }
      }
    } catch (_) {}

    const storeNameStr = vendorData?.store_name || 'Community Store';
    const societyNameStr = vendorData?.society_name || vendorData?.location || currentUser?.society_name || currentUser?.society || 'Anupam Apartment';
    const targetVendorId = vendorData?.vendor_id || vendorId || 1;

    const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || (flatNumber ? `Resident (Flat ${flatNumber})` : 'Resident Customer');
    const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || currentUser?.user_phone || '';

    const orderRecord = {
      order_id: orderId || `ORD-${Date.now().toString().slice(-6)}`,
      user_id: currentUser?.user_id || currentUser?.id || `usr_${resPhone.replace(/[^0-9]/g, '')}`,
      customer_name: resName,
      user_name: resName,
      name: resName,
      phone: resPhone,
      user_phone: resPhone,
      phone_number: resPhone,
      vendor_id: targetVendorId,
      store_name: storeNameStr,
      store_logo: vendorData?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
      society_name: societyNameStr,
      date: new Date().toISOString(),
      order_timestamp: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: 'PLACED',
      status_label: isWhatsApp ? 'WhatsApp Order Placed' : 'Order Paid & Out for Delivery',
      payment_status: isWhatsApp ? 'PENDING_COD' : 'PAID',
      payment_method: txnDetails?.paymentMethod || (isWhatsApp ? 'COD / WhatsApp' : 'UPI Payment'),
      total_amount: totalAmount,
      address: `Flat ${flatNumber} (${buildingNumber || 'Block A'}), ${societyNameStr}`,
      delivery_address: `Flat ${flatNumber} (${buildingNumber || 'Block A'}), ${societyNameStr}`,
      items: itemsList.map(c => ({
        item_id: c.item_id || c.id,
        item_name: c.item_name || c.name,
        name: c.item_name || c.name,
        quantity: c.quantity || 1,
        unit_price: parseFloat(c.price || 0),
        price: parseFloat(c.price || 0),
        item_total: parseFloat(c.price || 0) * (c.quantity || 1)
      }))
    };

    try {
      localStorage.setItem('digilocal_active_order', JSON.stringify(orderRecord));
      const userOrdersStr = localStorage.getItem('digilocal_user_orders');
      let userOrdersList = userOrdersStr ? JSON.parse(userOrdersStr) : [];
      if (!Array.isArray(userOrdersList)) userOrdersList = [];
      userOrdersList = [orderRecord, ...userOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
      localStorage.setItem('digilocal_user_orders', JSON.stringify(userOrdersList));

      // Save to vendor specific orders list (both numeric and string keys)
      const vKey1 = `digilocal_vendor_orders_${targetVendorId}`;
      const vKey2 = `digilocal_vendor_orders_${String(targetVendorId)}`;
      [vKey1, vKey2].forEach(vk => {
        try {
          const vOrdersStr = localStorage.getItem(vk);
          let vOrdersList = vOrdersStr ? JSON.parse(vOrdersStr) : [];
          if (!Array.isArray(vOrdersList)) vOrdersList = [];
          vOrdersList = [orderRecord, ...vOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
          localStorage.setItem(vk, JSON.stringify(vOrdersList));
        } catch (_) {}
      });

      // Global vendor orders list fallback
      const globalOrdersKey = 'digilocal_all_vendor_orders';
      const gOrdersStr = localStorage.getItem(globalOrdersKey);
      let gOrdersList = gOrdersStr ? JSON.parse(gOrdersStr) : [];
      if (!Array.isArray(gOrdersList)) gOrdersList = [];
      gOrdersList = [orderRecord, ...gOrdersList.filter(o => o && String(o.order_id) !== String(orderRecord.order_id))];
      localStorage.setItem(globalOrdersKey, JSON.stringify(gOrdersList));

      // Auto-decrement item stock in vendor catalog
      api.decrementVendorItemStock(targetVendorId, itemsList);
    } catch (err) {
      console.warn('Failed to save order to localStorage:', err);
    }

    // Clear active cart from state & localStorage immediately upon order creation
    saveCartToStorage([]);
    setOrderRemark('');

    setActiveOrder(orderRecord);
    return orderRecord;
  };

  // WHATSAPP ORDERING TRIGGER
  const handlePlaceOrderWhatsApp = async () => {
    if (!checkResidentAuth()) {
      setModalConfig({
        isOpen: true,
        title: '🔒 Login Required to Place Order',
        message: 'You cannot place an order without signing in or registering your mobile number. Please log in to proceed.',
        type: 'warning'
      });
      setIsLoginModalOpen(true);
      return;
    }

    if (!flatNumber) {
      handleOpenChangeLocation();
      return;
    }
    if (cart.length === 0) return;

    try {
      setPlacingOrder(true);
      const targetPhone = vendorData?.phone_number || '8005625999';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : (cleanPhone || '918005625999');

      const storeName = vendorData?.store_name || 'DigiLocal Store';
      const societyName = vendorData?.society_name || vendorData?.location || currentUser?.society_name || currentUser?.society || 'Anupam Apartment';
      const gstNumber = vendorData?.gst_number || '';

      let msg = `🛎️ *New Order from Flat ${flatNumber}* - ${storeName}\n`;
      msg += `--------------------------------------\n`;
      msg += `📍 *Society:* ${societyName}\n`;
      msg += `🏢 *Flat/Room:* Flat ${flatNumber}\n`;
      msg += `⏰ *Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
      msg += `--------------------------------------\n\n`;
      msg += `📋 *Items Ordered:*\n`;

      cart.forEach((item) => {
        msg += `* ${item.quantity}x ${item.item_name} (₹${parseFloat(item.price).toFixed(2)} each)\n`;
        if (item.specialInstructions && item.specialInstructions.trim()) {
          msg += `  ↳ _Note: ${item.specialInstructions.trim()}_\n`;
        }
      });

      if (orderRemark && orderRemark.trim()) {
        msg += `\n📝 *Order Remark:* ${orderRemark.trim()}\n`;
      }

      msg += `\n--------------------------------------\n`;
      msg += `💵 *Total Bill Amount:* ₹${subtotal.toFixed(2)}\n`;
      if (gstNumber) {
        msg += `📄 *Vendor GSTIN:* ${gstNumber}\n`;
      }
      msg += `--------------------------------------\n\n`;
      msg += `Please confirm preparation and delivery to my flat. Thank you!`;

      let currentUser = null;
      try {
        const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session') || localStorage.getItem('user_profile');
        if (uStr) {
          const parsed = JSON.parse(uStr);
          currentUser = parsed.user || parsed.resident || parsed;
        }
      } catch (_) {}

      const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || `Flat ${flatNumber}`;
      const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || '';

      const cleanFlatStr = `Flat ${flatNumber}${buildingNumber ? `, ${buildingNumber}` : ''}`;
      const cleanAddrStr = `${cleanFlatStr}, ${societyName || 'Residential Complex'}`;

      const userCity = vendorData?.city || currentUser?.city || '';
      const userState = vendorData?.state || currentUser?.state || 'Rajasthan';
      const userPincode = vendorData?.pincode || currentUser?.pincode || '302001';

      const backendPayload = {
        user_id: currentUser?.user_id || currentUser?.id || (resPhone ? `usr_${resPhone}` : 'usr_guest'),
        vendor_id: vendorId,
        customer_name: resName,
        phone: resPhone,
        customer_phone: resPhone,
        flat: cleanFlatStr,
        area: societyName || 'Residential Complex',
        city: userCity,
        state: userState,
        pincode: userPincode,
        delivery_address: cleanAddrStr,
        full_address: cleanAddrStr,
        items: cart.map(i => ({
          item_id: i.item_id || i.id,
          item_name: i.item_name || i.name,
          quantity: i.quantity,
          price: parseFloat(i.price || 0),
          unit_price: parseFloat(i.price || 0)
        })),
        total_amount: subtotal
      };

      const backendRes = await api.placeOrder(backendPayload);
      const savedOrder = saveOrderToUserProfile(backendRes?.order_id, subtotal, cart, true);
      setLastPlacedOrder({ order_id: savedOrder.order_id, total: subtotal });

      // Dispatch Real-time New Order Event for Vendor Dashboard Notification Alert & Sound Chime
      const newOrderPayload = {
        vendor_id: vendorId,
        order_id: backendRes?.order_id || savedOrder.order_id || Math.floor(1000 + Math.random() * 9000),
        total_amount: subtotal,
        resident_name: `${resName} (Flat ${flatNumber})`,
        items_count: cart.length,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem('digilocal_new_order_event', JSON.stringify(newOrderPayload));
        window.dispatchEvent(new CustomEvent('digilocal_new_order', { detail: newOrderPayload }));
      } catch (_) {}

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
      setPendingWhatsappUrl(whatsappUrl);

      // Reset body scroll lock immediately so fixed modals align to dead center of viewport
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Open WhatsApp application / web tab immediately
      try {
        const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!win) {
          window.location.href = whatsappUrl;
        }
      } catch (_) {
        window.location.href = whatsappUrl;
      }

      setShowCartDrawer(false);
      setShowConfirmModal(true);
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Order Launch Error',
        message: err.message || 'Could not place WhatsApp order. Please check your connection.',
        type: 'error'
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleConfirmOrderSentYes = () => {
    setShowConfirmModal(false);
    setCart([]);
    setOrderRemark('');
  };

  const handleConfirmOrderSentNo = () => {
    setShowConfirmModal(false);
    setShowCartDrawer(true);
  };

  if (forbiddenError) {
    return (
      <div className="min-h-screen bg-[#F7F3E8] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-center border border-rose-100 space-y-5">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Store Not Available in Your Area</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This store does not service your current location. Vendor delivery radius is capped at{' '}
              <span className="font-bold text-slate-900">{forbiddenError.vendor_radius_km || 3} km</span> (your distance: {' '}
              <span className="font-bold text-rose-600">{forbiddenError.user_distance_km || 4.5} km</span>).
            </p>
          </div>
          <button
            onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            Explore Nearby Available Stores
          </button>
        </div>
      </div>
    );
  }

  if (!checkResidentAuth()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-[2.2rem] p-7 sm:p-8 shadow-2xl border border-[#E8E2D5] text-center space-y-5 animate-in zoom-in-95 duration-200">
          
          {/* Top Right Close Button */}
          <button
            onClick={() => setRoute({ page: 'societyVendors', societyId: societyId || 'all' })}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F3EFE6] text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5 text-gray-500" />
          </button>

          {/* Center Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#EEE5DA] border border-[#E5DAD0] flex items-center justify-center mx-auto text-[#541D26] shadow-xs">
            <Building2 className="w-8 h-8 text-[#541D26]" />
          </div>

          {/* Pill Badge & Title */}
          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-[#541D26]/10 text-[#541D26] border border-[#541D26]/20 text-[11px] font-extrabold uppercase tracking-widest">
              LOGIN REQUIRED
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#211A19] leading-tight">
              Explore {vendorData?.store_name || 'Community Store'}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto pt-1">
              Please log in to your account to view approved local stores, products, and daily essentials for {vendorData?.store_name || 'this storefront'}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setRoute({
                page: 'login',
                accountType: 'resident',
                redirectVendorId: vendorId,
                redirectSocietyId: societyId
              })}
              className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs shadow-md tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>LOG IN NOW</span>
            </button>

            <button
              onClick={() => setRoute({ page: 'register' })}
              className="w-full sm:w-1/2 py-3.5 px-5 rounded-full bg-transparent border border-[#541D26] text-[#541D26] hover:bg-[#541D26] hover:text-white font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer"
            >
              <span>REGISTER</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 px-3 sm:px-6">
      
      {/* Store Header Banner */}
      <div className="max-w-6xl mx-auto pt-4 pb-6">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setRoute({ page: 'societyVendors', societyId })}
              className="inline-flex items-center space-x-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>Back to Society Vendors</span>
            </button>

            {/* Flat Delivery Badge (Per Cafe Visit) */}
            {flatNumber ? (
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border shadow-sm self-start sm:self-auto">
                <Home className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold text-ink">
                  Delivering to: <strong className="text-primary font-bold">{flatNumber.toLowerCase().includes('flat') ? flatNumber : `Flat ${flatNumber}`}{buildingNumber ? ` (${buildingNumber})` : ''}</strong>
                </span>
                <button
                  onClick={handleOpenChangeLocation}
                  className="text-[11px] font-bold text-ink underline hover:text-primary ml-2"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenChangeLocation}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm flex items-center space-x-2 uppercase tracking-wider"
              >
                <Home className="w-4 h-4 text-gold" />
                <span>Enter Flat & Tower Number</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-28 rounded-2xl bg-[#151415]/10 animate-pulse" />
          ) : vendorData && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-5">
                <img
                  src={getNormalizedImageUrl(vendorData.logo || vendorData.image_url) || 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80'}
                  alt={vendorData.store_name || 'Vendor Logo'}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80';
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#151415]/15 bg-[#151415]/5 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-[#151415] mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center space-x-1.5 bg-[#151415]/10 px-3 py-1 rounded-full border border-[#151415]/15">
                      <ShieldCheck className="w-4 h-4 text-[#151415]" />
                      <span>Verified Store • {vendorData.shop_number || vendorData.shop_no ? `${vendorData.shop_number || vendorData.shop_no}, ` : ''}{vendorData.society_name || vendorData.society || vendorData.location || vendorData.address || 'Residential Community'}</span>
                    </div>

                    {(vendorData.category || vendorData.business_type) && (
                      <span className="px-3 py-1 rounded-full bg-[#151415] text-[#F1EADE] text-[11px] font-extrabold uppercase tracking-wider">
                        {vendorData.category || vendorData.business_type}
                      </span>
                    )}

                    {(() => {
                      const timeStatus = getStoreTimeStatus(vendorData);
                      return (
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center space-x-1 border shadow-2xs ${
                          timeStatus.badgeType === 'closed'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : timeStatus.badgeType === 'closing_soon'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        }`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{timeStatus.statusText}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap my-1">
                    <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#151415] uppercase tracking-tight block">
                      {vendorData.store_name || vendorData.name || vendorData.vendor_name || vendorData.business_name || vendorData.shop_name || vendorData.title || `Vendor #${vendorId}`}
                    </h1>
                  </div>

                  {(vendorData.description || vendorData.bio || vendorData.details || vendorData.about) && (
                    <p className="text-xs sm:text-sm text-[#151415]/80 mt-1 line-clamp-2 max-w-xl font-medium leading-relaxed">
                      {vendorData.description || vendorData.bio || vendorData.details || vendorData.about}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#151415]/80 mt-3 font-semibold">
                    {checkResidentAuth() ? (
                      <>
                        <span className="flex items-center space-x-1.5 bg-[#151415]/5 px-3 py-1 rounded-full border border-[#151415]/10">
                          <Phone className="w-3.5 h-3.5 text-[#151415]" />
                          <span>{vendorData.phone_number || vendorData.phone || vendorData.mobile || 'Contact Available'}</span>
                        </span>
                        {vendorData.gst_number && vendorData.gst_number.trim() && (
                          <span className="px-3 py-1 rounded-full bg-[#151415]/5 border border-[#151415]/10 text-[#151415] font-bold flex items-center space-x-1.5 shadow-xs text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-[#151415]" />
                            <span>GSTIN:</span>
                            <span className="font-mono">{vendorData.gst_number}</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold shadow-xs">
                        <Lock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span>Contact details & GSTIN hidden • Sign in to view vendor details</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {cartItemCount > 0 && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="px-6 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold shadow-md flex items-center justify-center space-x-3 transition-all tracking-wider uppercase text-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-gold" />
                  <span>View Cart ({cartItemCount}) • ₹{subtotal.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {(vendorData?.vendor_type === 'service' || vendorData?.can_add_items === false) ? (
          <div className="bg-white border border-[#315C45]/20 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-md space-y-5">
            <div className="text-center space-y-1.5 border-b border-border/60 pb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-full border border-emerald-200 inline-block uppercase tracking-wider">
                🛠️ Verified Service Provider
              </span>
              <h2 className="text-xl font-serif font-extrabold text-[#202622]">
                Book Service Request with {vendorData?.store_name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Submit your requirement to receive instant phone call / WhatsApp assistance at your flat.
              </p>
            </div>

            <form onSubmit={handleServiceEnquirySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#202622] uppercase mb-1">Service Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC Servicing, Electrical Repair, Tap Leakage..."
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F3E8] border border-border text-xs font-medium focus:outline-none focus:border-[#315C45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202622] uppercase mb-1">Issue / Request Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your issue or custom requirements in detail..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F3E8] border border-border text-xs font-medium focus:outline-none focus:border-[#315C45]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202622] uppercase mb-1">Preferred Date / Time Slot</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F3E8] border border-border text-xs font-medium focus:outline-none focus:border-[#315C45]"
                >
                  <option value="Today (ASAP)">Today (ASAP)</option>
                  <option value="Today Evening (4 PM - 8 PM)">Today Evening (4 PM - 8 PM)</option>
                  <option value="Tomorrow Morning (9 AM - 1 PM)">Tomorrow Morning (9 AM - 1 PM)</option>
                  <option value="Tomorrow Evening (4 PM - 8 PM)">Tomorrow Evening (4 PM - 8 PM)</option>
                  <option value="Weekend Slot">Weekend Slot</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingEnquiry}
                className="w-full py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{submittingEnquiry ? 'Sending Request...' : 'Submit Service Enquiry & Open WhatsApp'}</span>
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Category Navigation Pills & Search Input */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-card border border-border p-3 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-muted-foreground hover:text-ink border border-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

          <div className="w-full md:w-64">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-full bg-background border border-border text-xs font-semibold focus:outline-none focus:border-primary text-ink"
              />
            </div>
          </div>
        </div>

        {/* Products Grid (Responsive 4-Column Layout) */}
        {loading ? (
          <ProductCardSkeleton count={8} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border p-8 shadow-sm max-w-md mx-auto my-6">
            <ShoppingBag className="w-12 h-12 text-[#E8B94A] mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-ink mb-1">
              {items.length === 0 ? 'No Products Added Yet' : 'No Matching Items Found'}
            </h3>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed">
              {items.length === 0 
                ? 'This vendor has not cataloged any items yet. Please check back later!'
                : 'Try selecting a different category or search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => {
              const timeStatus = getStoreTimeStatus(vendorData);
              const isStoreClosed = !timeStatus.isOpen;
              const inCart = cart.find(c => c.item_id === item.item_id);
              const isAvailable = isStoreClosed ? false : (item.is_available !== undefined ? Boolean(item.is_available) : true);

              return (
                <div
                  key={item.item_id}
                  className={`rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-xs bento-card ${
                    isStoreClosed
                      ? 'border border-rose-200/80 bg-rose-50/20 opacity-80'
                      : !isAvailable
                      ? 'border border-amber-200/80 bg-amber-50/20 opacity-80'
                      : 'border border-emerald-200/70 hover:border-emerald-500/60 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="p-3.5">
                    <div className="relative mb-2.5 rounded-xl overflow-hidden bg-secondary h-32 sm:h-36">
                      <img
                        src={getNormalizedImageUrl(item)}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute top-2 left-2">
                        {isAvailable ? (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-600 text-white rounded-full shadow-sm flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                            In Stock ({item.unit})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-amber-600 text-white rounded-full shadow-sm flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-card/90 text-ink border border-border rounded-full shadow-sm">
                          {item.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-ink mb-1 line-clamp-1">{item.item_name}</h3>
                    <p className="text-muted-foreground text-[11px] line-clamp-1 mb-2 font-medium">
                      {item.description || 'Fresh quality item.'}
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-secondary/40 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-800">₹{parseFloat(item.price).toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground ml-0.5 font-medium">/ {item.unit}</span>
                    </div>

                    {isStoreClosed ? (
                      <span className="text-[10px] font-bold text-rose-700 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        Closed
                      </span>
                    ) : !isAvailable ? (
                      <span className="text-[10px] font-bold text-amber-800 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300">
                        Unavailable
                      </span>
                    ) : inCart ? (
                      <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 rounded-full p-0.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.item_id, -1)}
                          className="w-6 h-6 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold text-emerald-950 px-1">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item_id, 1)}
                          className="w-6 h-6 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center space-x-1 transition-all uppercase tracking-wider text-[10px]"
                      >
                        <Plus className="w-3 h-3 text-emerald-200" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && !showCartDrawer && (
        <div className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40">
          <div className="bg-primary text-primary-foreground p-4 rounded-[2rem] border border-primary/40 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center font-extrabold text-xs">
                {cartItemCount}
              </div>
              <div>
                <p className="text-[10px] text-gold font-extrabold uppercase tracking-wider">Total Bill</p>
                <p className="text-lg font-extrabold text-primary-foreground">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-5 py-3 rounded-full bg-gold hover:bg-gold/90 text-ink font-extrabold text-xs shadow-md flex items-center space-x-2 uppercase tracking-wider"
            >
              <span>Review & Order via WhatsApp</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}



      {/* Slide-out Shopping Cart Drawer */}
      {showCartDrawer && (
        <div 
          className="fixed inset-0 z-[99999] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowCartDrawer(false)}
        >
          <div 
            className="w-full max-w-md bg-[#FDFBF7] border-l border-[#E5DAD0] h-full max-h-screen flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-[#541D26] text-white border-b border-[#C8A878]/30 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#C8A878]/20 flex items-center justify-center border border-[#C8A878]/40">
                  <ShoppingBag className="w-5 h-5 text-[#C8A878]" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-white uppercase tracking-wider">Your Order Cart</h3>
                  <p className="text-[11px] text-[#D6B7A5] font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''} selected</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {cart.length > 0 && (
                  <button
                    onClick={() => saveCartToStorage([])}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-rose-900/50 text-xs font-extrabold text-rose-200 border border-rose-300/30 transition-all cursor-pointer mr-1"
                    title="Empty Entire Cart"
                  >
                    Clear Cart
                  </button>
                )}
                <button 
                  onClick={() => setShowCartDrawer(false)} 
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 cursor-pointer transition-all hover:scale-105"
                  title="Close Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List & Summaries (Isolated Internal Scroll) */}
            <div className="p-5 flex-1 overflow-y-auto min-h-0 space-y-4 text-[#211A19]">
              {cart.map((item) => (
                <div key={item.item_id} className="p-4 rounded-2xl bg-white border border-[#E5DAD0] space-y-3 shadow-sm hover:border-[#C8A878]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="pr-2">
                      <h4 className="font-bold text-[#211A19] text-xs leading-snug">{item.item_name}</h4>
                      <p className="text-[11px] text-[#541D26] font-black mt-0.5">₹{parseFloat(item.price).toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-[#F5EBE6] border border-[#E5DAD0] rounded-full p-1 shrink-0">
                      <button onClick={() => updateQuantity(item.item_id, -1)} className="w-6 h-6 rounded-full bg-white text-[#541D26] font-black text-xs flex items-center justify-center hover:bg-[#541D26] hover:text-white transition-colors cursor-pointer shadow-xs">-</button>
                      <span className="text-xs font-black text-[#211A19] px-2">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.item_id, 1)} className="w-6 h-6 rounded-full bg-[#541D26] text-white font-black text-xs flex items-center justify-center hover:bg-[#6B2732] transition-colors cursor-pointer shadow-xs">+</button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#F8F5F0] px-3 py-2 rounded-xl border border-[#E5DAD0]">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C8A878] shrink-0" />
                    <input
                      type="text"
                      placeholder="Special instruction (e.g. deliver fresh, pack separately)"
                      value={item.specialInstructions || ''}
                      onChange={(e) => updateInstructions(item.item_id, e.target.value)}
                      className="w-full text-[11px] bg-transparent text-[#211A19] placeholder-[#9E9085] focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Delivery Location Summary in Cart */}
              <div className="p-4 bg-white border border-[#E5DAD0] rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#E5DAD0] pb-2">
                  <h4 className="text-xs font-serif font-black text-[#211A19] uppercase tracking-wider">Delivery Location</h4>
                  <button
                    onClick={() => { setShowCartDrawer(false); handleOpenChangeLocation(); }}
                    className="text-[11px] font-bold text-[#541D26] hover:text-[#C8A878] hover:underline cursor-pointer"
                  >
                    Change Location
                  </button>
                </div>
                <p className="text-xs font-bold text-[#211A19]">
                  {flatNumber ? (flatNumber.toLowerCase().includes('flat') ? flatNumber : `Flat ${flatNumber}`) : 'Select Delivery Flat'}{buildingNumber ? ` (${buildingNumber})` : ''}
                </p>
                <p className="text-[11px] text-[#7A6E65]">{vendorData?.society_name || 'Resident Society'}</p>
              </div>

              {/* Order Remarks */}
              <div className="p-4 bg-white border border-[#E5DAD0] rounded-2xl space-y-1.5 shadow-sm">
                <label className="block text-[10px] font-black text-[#211A19] uppercase tracking-wider">Order Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Deliver after 5 PM, leave with security if unavailable..."
                  value={orderRemark}
                  onChange={(e) => setOrderRemark(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F8F5F0] border border-[#E5DAD0] text-xs text-[#211A19] placeholder-[#9E9085] focus:outline-none focus:border-[#C8A878] resize-none"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="p-4 bg-white border border-[#E5DAD0] rounded-2xl space-y-2 text-xs text-[#7A6E65] font-medium shadow-sm">
                <h4 className="text-[11px] font-serif font-black text-[#211A19] uppercase border-b border-[#E5DAD0] pb-2 mb-2 tracking-wider">Bill Summary</h4>
                <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-[#211A19]">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Society Delivery</span><span className="text-[#2D6A4F] font-extrabold">FREE</span></div>
                <div className="flex justify-between text-sm font-black text-[#211A19] pt-2 border-t border-dashed border-[#E5DAD0]">
                  <span>Total Amount</span>
                  <span className="text-[#541D26]">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Order & Payment Buttons */}
            <div className="p-5 bg-white border-t border-[#E5DAD0] space-y-2.5 shrink-0 shadow-lg">
              <button
                onClick={handleCheckoutOnline}
                disabled={placingOrder}
                className="w-full py-3.5 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-black text-xs shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer border border-[#C8A878]/30 hover:scale-[1.01]"
              >
                <CreditCard className="w-4 h-4 text-[#C8A878]" />
                <span>Pay ₹{subtotal.toFixed(2)} Online (Dummy Sandbox)</span>
              </button>

              <button
                onClick={handlePlaceOrderWhatsApp}
                disabled={placingOrder}
                className="w-full py-3 rounded-full bg-[#F5EBE6] hover:bg-[#EBDDD5] text-[#541D26] border border-[#E5DAD0] font-black text-xs shadow-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#541D26]" />
                <span>{placingOrder ? 'Preparing Order...' : 'Place Order via WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dummy Payment Modal */}
      <DummyPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={subtotal}
        title="DigiLocal Dummy Payment"
        description={`Order from ${vendorData?.store_name || 'Local Store'} (${vendorData?.society_name || 'Society'})`}
        onSuccess={async (txn) => {
          setShowPaymentModal(false);
          setShowCartDrawer(false);
          try {
            setPlacingOrder(true);
            let currentUser = null;
            try {
              const uStr = localStorage.getItem('digilocal_user_session') || localStorage.getItem('digilocal_resident_session') || localStorage.getItem('user_profile');
              if (uStr) {
                const parsed = JSON.parse(uStr);
                currentUser = parsed.user || parsed.resident || parsed;
              }
            } catch (_) {}

            const resName = currentUser?.name || currentUser?.full_name || currentUser?.owner_name || `Flat ${flatNumber}`;
            const resPhone = currentUser?.phone || currentUser?.mobile || currentUser?.phone_number || '';

            const cleanFlatStr = `Flat ${flatNumber}${buildingNumber ? `, ${buildingNumber}` : ''}`;
            const cleanAddrStr = `${cleanFlatStr}, ${societyName || 'Residential Complex'}`;

            const userCity = vendorData?.city || currentUser?.city || '';
            const userState = vendorData?.state || currentUser?.state || 'Rajasthan';
            const userPincode = vendorData?.pincode || currentUser?.pincode || '302001';

            const payload = {
              user_id: currentUser?.user_id || currentUser?.id || (resPhone ? `usr_${resPhone}` : 'usr_guest'),
              vendor_id: vendorId,
              customer_name: resName,
              phone: resPhone,
              customer_phone: resPhone,
              flat: cleanFlatStr,
              area: societyName || 'Residential Complex',
              city: userCity,
              state: userState,
              pincode: userPincode,
              delivery_address: cleanAddrStr,
              full_address: cleanAddrStr,
              order_remark: orderRemark,
              payment_method: txn.paymentMethod,
              transaction_id: txn.transactionId,
              items: cart.map(c => ({
                item_id: c.item_id || c.id,
                item_name: c.item_name || c.name,
                quantity: c.quantity,
                price: parseFloat(c.price || 0),
                unit_price: parseFloat(c.price || 0),
                specialInstructions: c.specialInstructions || ''
              })),
              total_amount: subtotal
            };

            const res = await api.placeOrder(payload);
            saveOrderToUserProfile(res?.order_id, subtotal, cart, false, txn);

            saveCartToStorage([]);
            setOrderRemark('');
            setModalConfig({
              isOpen: true,
              title: 'Order Paid & Confirmed!',
              message: `Your payment of ₹${subtotal.toFixed(2)} (${txn.paymentMethod}) was processed successfully in test mode. Transaction Ref: ${txn.transactionId}. Your order is now live!`,
              type: 'success'
            });
          } catch (err) {
            setModalConfig({
              isOpen: true,
              title: 'Order Placement Error',
              message: err.message || 'Payment processed, but order logging failed.',
              type: 'error'
            });
          } finally {
            setPlacingOrder(false);
          }
        }}
      />

      {/* Replace Cart Conflict Warning Modal */}
      {showReplaceCartModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#211A19] text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/10 space-y-4 font-sans text-center">
            
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-[#C8A878]/20 border border-[#C8A878]/40 flex items-center justify-center mx-auto text-[#C8A878]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-serif font-black text-white">Replace Items in Cart?</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Your cart already contains items from <strong className="text-[#C8A878] font-bold">{existingCartVendorName}</strong>. 
                Do you want to discard your existing cart and add items from <strong className="text-[#C8A878] font-bold">{vendorData?.store_name || 'this store'}</strong>?
              </p>
            </div>

            <div className="pt-3 grid grid-cols-2 gap-3 text-xs font-black uppercase tracking-wider">
              <button
                onClick={() => {
                  setShowReplaceCartModal(false);
                  setPendingReplaceItem(null);
                }}
                className="py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
              >
                Keep Current
              </button>

              <button
                onClick={handleConfirmReplaceCart}
                className="py-3 px-4 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white border border-[#C8A878]/40 shadow-md transition-all cursor-pointer hover:scale-105"
              >
                Replace Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 w-screen h-screen z-[99999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#FAF8F5] text-[#211A19] border border-[#E5DAD0] rounded-[2.5rem] p-7 max-w-sm w-full shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 my-auto">
            <div className="w-14 h-14 rounded-full bg-[#541D26]/10 border border-[#541D26]/20 flex items-center justify-center mb-3 text-[#541D26]">
              <HelpCircle className="w-7 h-7 text-[#541D26]" />
            </div>

            <h3 className="text-lg font-serif font-black text-[#211A19] mb-1">Order Sent via WhatsApp?</h3>
            <p className="text-xs text-[#211A19]/70 font-medium mb-5">Did you send your order message to the vendor on WhatsApp?</p>

            <div className="flex flex-col gap-2.5 w-full text-xs font-bold uppercase tracking-wider">
              {pendingWhatsappUrl && (
                <a
                  href={pendingWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>💬 Launch WhatsApp App</span>
                </a>
              )}
              <div className="flex space-x-2.5 w-full">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#EEE5DA] text-[#211A19] border border-[#E5DAD0] hover:bg-[#D6B7A5]/60 transition-all cursor-pointer"
                >
                  No, Not Yet
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (lastPlacedOrder) {
                      saveOrderToUserProfile(lastPlacedOrder.order_id, lastPlacedOrder.total, lastPlacedOrder.items, true);
                    }
                    saveCartToStorage([]);
                    setOrderRemark('');
                    setModalConfig({
                      isOpen: true,
                      title: 'Order Recorded!',
                      message: 'Your order has been logged to your account orders history and sent to the vendor.',
                      type: 'success'
                    });
                  }}
                  className="flex-1 py-3 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white font-extrabold shadow-md transition-all cursor-pointer"
                >
                  Yes, Sent!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

      {/* Login Portal Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        setRoute={setRoute}
      />

      {/* Delivery Address Modal */}
      <DeliveryAddressModal
        isOpen={showDeliveryAddressModal}
        onClose={() => setShowDeliveryAddressModal(false)}
        onAddressSaved={(newAddr) => {
          setFlatNumber(newAddr.flat);
          setBuildingNumber(newAddr.building || '');
          if (pendingItemToAdd) {
            const existing = cart.find(i => i.item_id === pendingItemToAdd.item_id);
            let updated;
            if (existing) {
              updated = cart.map(i => i.item_id === pendingItemToAdd.item_id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
              updated = [...cart, { ...pendingItemToAdd, quantity: 1, specialInstructions: '' }];
            }
            saveCartToStorage(updated);
            setPendingItemToAdd(null);
          }
        }}
      />

    </div>
  );
}

