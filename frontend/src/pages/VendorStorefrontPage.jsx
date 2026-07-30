import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, ShoppingBag, Plus, Minus, X, Check, Search, ShieldCheck, Phone, AlertTriangle, FileText, MessageSquare, HelpCircle, Send, Home, MapPin, Edit3 } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

export default function VendorStorefrontPage({ societyId, vendorId, setRoute }) {
  const [vendorData, setVendorData] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Flat & Tower Location Entry State (Always re-asks on entering any cafe)
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [tempFlatInput, setTempFlatInput] = useState('');
  const [tempBuildingInput, setTempBuildingInput] = useState('');
  const [locationError, setLocationError] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderRemark, setOrderRemark] = useState('');
  
  // Modals & Tracking
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadStorefront();
    
    // Always reset flat/building number & prompt location entry modal on entering cafe
    setFlatNumber('');
    setBuildingNumber('');
    setTempFlatInput('');
    setTempBuildingInput('');
    setShowLocationModal(true);
  }, [vendorId]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorStorefront(vendorId);
      setVendorData(data.vendor);
      setItems(data.items || []);

      const cats = ['All', ...new Set((data.items || []).map(i => i.category || 'General'))];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load storefront:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    setLocationError('');
    const cleanFlat = tempFlatInput.trim();
    const cleanBuilding = tempBuildingInput.trim() || 'Tower A';

    if (!cleanFlat) {
      setLocationError('Please enter your flat / room number for this store.');
      return;
    }

    setFlatNumber(cleanFlat);
    setBuildingNumber(cleanBuilding);
    setShowLocationModal(false);
  };

  const handleOpenChangeLocation = () => {
    setTempFlatInput(flatNumber);
    setTempBuildingInput(buildingNumber);
    setShowLocationModal(true);
  };

  const addToCart = (item) => {
    if (!item.is_available) return;
    if (!flatNumber) {
      handleOpenChangeLocation();
      return;
    }
    setCart((prev) => {
      const existing = prev.find(i => i.item_id === item.item_id);
      if (existing) {
        return prev.map(i => i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, specialInstructions: '' }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      return prev.map(i => {
        if (i.item_id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const updateInstructions = (itemId, text) => {
    setCart((prev) => prev.map(i => i.item_id === itemId ? { ...i, specialInstructions: text } : i));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // WHATSAPP ORDERING TRIGGER
  const handlePlaceOrderWhatsApp = async () => {
    if (!flatNumber) {
      handleOpenChangeLocation();
      return;
    }
    if (cart.length === 0) return;

    try {
      setPlacingOrder(true);
      const targetPhone = vendorData?.phone_number || '9876543210';
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      const storeName = vendorData?.store_name || 'DigiLocal Store';
      const societyName = vendorData?.society_name || 'Society';
      const gstNumber = vendorData?.gst_number || '07AAACR12341Z5';

      let msg = `🛎️ *New Order from Flat ${flatNumber} (${buildingNumber})* - ${storeName}\n`;
      msg += `--------------------------------------\n`;
      msg += `📍 *Society:* ${societyName}\n`;
      msg += `🏢 *Flat/Tower:* Flat ${flatNumber}, ${buildingNumber}\n`;
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
      msg += `📄 *Vendor GSTIN:* ${gstNumber}\n`;
      msg += `--------------------------------------\n\n`;
      msg += `Please confirm preparation and delivery to my flat. Thank you!`;

      const backendPayload = {
        vendor_id: vendorId,
        customer_name: `Flat ${flatNumber}`,
        phone_number: targetPhone,
        address: `Flat ${flatNumber}, ${buildingNumber}, ${societyName}`,
        items: cart.map(i => ({
          item_id: i.item_id,
          quantity: i.quantity,
          unit_price: i.price
        }))
      };

      const backendRes = await api.placeOrder(backendPayload);
      setLastPlacedOrder({ order_id: backendRes.order_id, total: subtotal });

      const encodedMsg = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');

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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2229] pb-28">
      
      {/* Store Header Banner */}
      <div className="bg-white border-b border-[#C5A880]/20 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setRoute({ page: 'societyVendors', societyId })}
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#787F8C] hover:text-[#C5A880] transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 text-[#C5A880]" />
              <span>Back to Society Vendors</span>
            </button>

            {/* Flat Delivery Badge (Per Cafe Visit) */}
            {flatNumber ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F6F3EC] border border-[#C5A880]/30 shadow-sm self-start sm:self-auto">
                <Home className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-xs font-bold text-[#0A1428]">
                  Delivering to: <strong className="text-[#C5A880]">Flat {flatNumber} ({buildingNumber || 'Tower A'})</strong>
                </span>
                <button
                  onClick={handleOpenChangeLocation}
                  className="text-[11px] font-extrabold text-[#0A1428] underline hover:text-[#C5A880] ml-1 uppercase"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenChangeLocation}
                className="px-3.5 py-1.5 rounded-xl bg-[#0A1428] text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 uppercase tracking-wider"
              >
                <Home className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Enter Flat & Tower Number</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ) : vendorData && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-5">
                <img
                  src={vendorData.logo || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80'}
                  alt={vendorData.store_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C5A880]/30 bg-[#FAF9F6] shadow-sm"
                />
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#2E7D32] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Store • {vendorData.society_name}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide">
                    {vendorData.store_name}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#787F8C] mt-1 max-w-xl font-medium">
                    {vendorData.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#787F8C] mt-3 font-medium">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{vendorData.phone_number}</span>
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-[#F6F3EC] border border-[#C5A880]/30 text-[#0A1428] font-bold flex items-center space-x-1.5 shadow-sm text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>GSTIN:</span>
                      <span className="font-mono">{vendorData.gst_number || '07AAACR12341Z5'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {cartItemCount > 0 && (
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold shadow-md flex items-center justify-center space-x-3 transition-all tracking-wider uppercase text-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Cart ({cartItemCount}) • ₹{subtotal.toFixed(2)}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Category Navigation Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                  selectedCategory === cat
                    ? 'bg-[#0A1428] text-white shadow-sm'
                    : 'bg-white text-[#787F8C] hover:text-[#0A1428] border border-[#C5A880]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880]" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A880]/30 text-xs font-medium focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>
        </div>

        {/* Item Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#C5A880]/20 p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-[#787F8C] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0A1428] mb-1">No items found</h3>
            <p className="text-[#787F8C] text-xs font-medium">Try selecting a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const inCart = cart.find(c => c.item_id === item.item_id);
              const isAvailable = Boolean(item.is_available);

              return (
                <div
                  key={item.item_id}
                  className={`rounded-2xl bg-white border border-[#C5A880]/25 overflow-hidden flex flex-col justify-between transition-all duration-200 shadow-sm ${
                    !isAvailable ? 'opacity-70 bg-[#FAF9F6]' : 'hover:border-[#C5A880] hover:shadow-md'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="relative mb-3.5 rounded-xl overflow-hidden bg-[#FAF9F6] h-40">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80'}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute top-2.5 left-2.5">
                        {isAvailable ? (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#2E7D32] text-white rounded-full shadow-sm">
                            In Stock ({item.unit})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-[#C62828] text-white rounded-full shadow-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Unavailable
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-white/90 text-[#0A1428] border border-[#C5A880]/30 rounded-full shadow-sm">
                          {item.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#0A1428] mb-1">{item.item_name}</h3>
                    <p className="text-[#787F8C] text-xs line-clamp-2 mb-3 leading-relaxed font-medium">
                      {item.description || 'Fresh quality item.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F6] border-t border-[#C5A880]/15 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-[#C5A880]">₹{parseFloat(item.price).toFixed(2)}</span>
                      <span className="text-[11px] text-[#787F8C] ml-1 font-medium">/ {item.unit}</span>
                    </div>

                    {!isAvailable ? (
                      <span className="text-[11px] font-bold text-[#C62828] px-3 py-1 rounded-lg bg-rose-50 border border-rose-200">
                        Out of Stock
                      </span>
                    ) : inCart ? (
                      <div className="flex items-center space-x-2 bg-white border border-[#C5A880]/30 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.item_id, -1)}
                          className="w-6 h-6 rounded bg-[#FAF9F6] hover:bg-slate-100 text-[#0A1428] flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3 text-[#0A1428]" />
                        </button>
                        <span className="text-xs font-extrabold text-[#0A1428] px-1">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item_id, 1)}
                          className="w-6 h-6 rounded bg-[#0A1428] hover:bg-[#C5A880] text-white flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-1.5 rounded-lg bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-sm flex items-center space-x-1 transition-all uppercase tracking-wider text-[11px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && !showCartDrawer && (
        <div className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-40">
          <div className="bg-[#0A1428] text-white p-4 rounded-2xl border border-[#C5A880]/40 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#C5A880] text-[#0A1428] flex items-center justify-center font-extrabold text-xs">
                {cartItemCount}
              </div>
              <div>
                <p className="text-[10px] text-[#C5A880] font-bold uppercase tracking-wider">Total Bill</p>
                <p className="text-base font-extrabold text-white">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#A88F68] text-[#0A1428] font-extrabold text-xs shadow-md flex items-center space-x-1.5 uppercase tracking-wider"
            >
              <span>Review & Order via WhatsApp</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* LOCATION ENTRY MODAL (Always re-asks on entering cafe) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/60 backdrop-blur-md">
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            
            <div className="w-14 h-14 rounded-full bg-[#F6F3EC] border border-[#C5A880]/40 flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-[#C5A880]" />
            </div>

            <h2 className="text-xl font-serif font-extrabold text-[#0A1428] uppercase tracking-wide mb-1">
              Enter Room / Flat Number
            </h2>
            <p className="text-xs text-[#787F8C] leading-relaxed mb-6 font-medium">
              Welcome to <strong className="text-[#0A1428]">{vendorData?.store_name || 'this Store'}</strong>! Please enter your room/flat number to order from this store.
            </p>

            {locationError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-4">
                {locationError}
              </div>
            )}

            <form onSubmit={handleLocationSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1.5">Flat / Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 402, 101, 503"
                  value={tempFlatInput}
                  onChange={(e) => setTempFlatInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/40 text-[#0A1428] text-sm font-bold focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1428] uppercase mb-1.5">Tower / Building (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tower B, Block A"
                  value={tempBuildingInput}
                  onChange={(e) => setTempBuildingInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#C5A880]/40 text-[#0A1428] text-sm font-bold focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider transition-all mt-2"
              >
                Confirm Location & Order
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Slide-out Shopping Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0A1428]/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FAF9F6] border-l border-[#C5A880]/30 h-full flex flex-col justify-between shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-white border-b border-[#C5A880]/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
                <h3 className="text-base font-serif font-extrabold text-[#0A1428] uppercase tracking-wider">Your Order Cart</h3>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="w-8 h-8 rounded-full bg-[#FAF9F6] text-[#787F8C] hover:text-[#0A1428] flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.item_id} className="p-3.5 rounded-xl bg-white border border-[#C5A880]/25 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#0A1428] text-xs">{item.item_name}</h4>
                      <p className="text-[11px] text-[#C5A880] font-extrabold">₹{parseFloat(item.price).toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#C5A880]/20 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.item_id, -1)} className="w-5 h-5 text-[#0A1428] font-bold flex items-center justify-center">-</button>
                      <span className="text-xs font-bold text-[#0A1428] px-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.item_id, 1)} className="w-5 h-5 text-[#C5A880] font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-[#FAF9F6] px-2.5 py-1.5 rounded-lg border border-[#C5A880]/15">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
                    <input
                      type="text"
                      placeholder="Special instruction (e.g. deliver fresh, pack separately)"
                      value={item.specialInstructions || ''}
                      onChange={(e) => updateInstructions(item.item_id, e.target.value)}
                      className="w-full text-[11px] bg-transparent text-[#0A1428] placeholder-[#787F8C] focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* Delivery Location Summary in Cart */}
              <div className="p-4 bg-white border border-[#C5A880]/25 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#C5A880]/15 pb-2">
                  <h4 className="text-xs font-serif font-bold text-[#0A1428] uppercase tracking-wider">Delivery Location</h4>
                  <button
                    onClick={() => { setShowCartDrawer(false); handleOpenChangeLocation(); }}
                    className="text-[11px] font-bold text-[#C5A880] hover:underline"
                  >
                    Change Location
                  </button>
                </div>
                <p className="text-xs font-bold text-[#0A1428]">Flat {flatNumber} ({buildingNumber || 'Tower A'})</p>
                <p className="text-[11px] text-[#787F8C]">{vendorData?.society_name}</p>
              </div>

              {/* Order Remarks */}
              <div className="p-4 bg-white border border-[#C5A880]/25 rounded-xl space-y-1.5 shadow-sm">
                <label className="block text-[10px] font-bold text-[#0A1428] uppercase">Order Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Deliver after 5 PM, leave with security if unavailable..."
                  value={orderRemark}
                  onChange={(e) => setOrderRemark(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#FAF9F6] border border-[#C5A880]/30 text-xs text-[#0A1428] focus:outline-none resize-none"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="p-4 bg-white border border-[#C5A880]/25 rounded-xl space-y-1.5 text-xs text-[#787F8C] font-medium shadow-sm">
                <h4 className="text-[11px] font-serif font-bold text-[#0A1428] uppercase border-b border-[#C5A880]/15 pb-1.5 mb-2">Bill Summary</h4>
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Society Delivery</span><span className="text-[#2E7D32] font-bold">FREE</span></div>
                <div className="flex justify-between text-sm font-extrabold text-[#0A1428] pt-2 border-t border-dashed border-[#C5A880]/30">
                  <span>Total Amount</span>
                  <span className="text-[#C5A880]">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Place Order Button */}
            <div className="p-5 bg-white border-t border-[#C5A880]/20">
              <button
                onClick={handlePlaceOrderWhatsApp}
                disabled={placingOrder}
                className="w-full py-3.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4 text-[#C5A880]" />
                <span>{placingOrder ? 'Preparing WhatsApp Order...' : 'Place Order via WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DigiCafe Order Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/60 backdrop-blur-sm">
          <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F6F3EC] border border-[#C5A880]/40 flex items-center justify-center mb-3">
              <HelpCircle className="w-6 h-6 text-[#C5A880]" />
            </div>

            <h3 className="text-base font-serif font-extrabold text-[#0A1428] mb-1">Order Sent via WhatsApp?</h3>
            <p className="text-xs text-[#787F8C] mb-6 leading-relaxed font-medium">
              Did you successfully send the generated order message in the WhatsApp chat to vendor staff?
            </p>

            <div className="w-full space-y-2">
              <button
                onClick={handleConfirmOrderSentYes}
                className="w-full py-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                Yes, Order Sent on WhatsApp
              </button>
              <button
                onClick={handleConfirmOrderSentNo}
                className="w-full py-2.5 rounded-xl bg-transparent border border-[#C5A880]/40 text-[#787F8C] hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                No, Modify Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Website Notification Modal */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />

    </div>
  );
}
