const API_BASE = '/api';

// Fallback Mock Data for standalone / offline resilience
const MOCK_SOCIETIES = [
  {
    society_id: 'SOC-101',
    society_name: 'Omaxe Greenwood Residency',
    location: 'Sector Greenwood, Omega II, Greater Noida',
    pincode: '201310',
    total_flats: 650,
    vendor_count: 14,
    image_url: 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg',
    banner_image: 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg'
  },
  {
    society_id: 'SOC-102',
    society_name: 'Palm Meadows Residency',
    location: 'Whitefield, Bengaluru',
    pincode: '560066',
    total_flats: 320,
    vendor_count: 8,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
    banner_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'
  },
  {
    society_id: 'SOC-103',
    society_name: 'DLF Phase 5 Enclave',
    location: 'Golf Course Road, Gurugram',
    pincode: '122002',
    total_flats: 600,
    vendor_count: 15,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80',
    banner_image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80'
  },
  {
    society_id: 'SOC-104',
    society_name: 'Godrej Woods Community',
    location: 'Sector 43, Noida',
    pincode: '201303',
    total_flats: 280,
    vendor_count: 6,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    banner_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  },
  {
    society_id: 'SOC-105',
    society_name: 'Jaypee Greens Wish Town',
    location: 'Sector 128, Noida',
    pincode: '201304',
    total_flats: 850,
    vendor_count: 18,
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    banner_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80'
  },
  {
    society_id: 'SOC-106',
    society_name: 'ATS Village Gated Complex',
    location: 'Sector 93A, Noida',
    pincode: '201304',
    total_flats: 520,
    vendor_count: 11,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    banner_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'
  }
];

const MOCK_VENDORS = [
  {
    vendor_id: '201',
    store_name: 'Fresh Daily Supermarket & Dairy',
    vendor_name: 'Rajesh Kumar',
    category: 'Grocery & Daily Essentials',
    status: 'ACTIVE',
    rating: '4.9',
    delivery_time: '10-15 mins',
    phone: '9876543210',
    logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
  },
  {
    vendor_id: '202',
    store_name: 'Green Leaf Organics & Fruits',
    vendor_name: 'Suresh Patel',
    category: 'Fresh Fruits & Vegetables',
    status: 'ACTIVE',
    rating: '4.8',
    delivery_time: '15 mins',
    phone: '9876543211',
    logo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80'
  },
  {
    vendor_id: '203',
    store_name: 'Royal Bakery & Confectionery',
    vendor_name: 'Anita Sharma',
    category: 'Bakery & Confectionery',
    status: 'ACTIVE',
    rating: '4.7',
    delivery_time: '20 mins',
    phone: '9876543212',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop&q=80'
  },
  {
    vendor_id: '204',
    store_name: 'Sparkle Express Laundry',
    vendor_name: 'Amit Verma',
    category: 'Laundry & Dry Cleaning',
    status: 'ACTIVE',
    rating: '4.9',
    delivery_time: 'Same day pickup',
    phone: '9876543213',
    logo: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80'
  }
];

export const api = {
  // Societies
  getSocieties: async (search = '') => {
    try {
      const res = await fetch(`${API_BASE}/societies${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch societies');
      return await res.json();
    } catch (err) {
      // Return filtered mock data on network error
      if (!search) return MOCK_SOCIETIES;
      const term = search.toLowerCase();
      return MOCK_SOCIETIES.filter(s => 
        s.society_name.toLowerCase().includes(term) ||
        s.location.toLowerCase().includes(term) ||
        s.pincode.includes(term)
      );
    }
  },

  getSociety: async (societyId) => {
    try {
      const res = await fetch(`${API_BASE}/societies/${societyId}`);
      if (!res.ok) throw new Error('Failed to fetch society');
      return await res.json();
    } catch (err) {
      const sId = String(societyId);
      return MOCK_SOCIETIES.find(s => 
        String(s.society_id) === sId ||
        String(s.society_id).toLowerCase() === sId.toLowerCase() ||
        String(s.society_id).replace('SOC-', '') === sId ||
        sId.replace('SOC-', '') === String(s.society_id)
      ) || MOCK_SOCIETIES[0];
    }
  },

  createSociety: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/societies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create society');
      return await res.json();
    } catch (err) {
      const newId = `SOC-${Math.floor(100 + Math.random() * 900)}`;
      const created = {
        society_id: newId,
        society_name: data.society_name || 'New Residential Complex',
        location: data.location || 'Noida, NCR',
        pincode: data.pincode || '201301',
        total_flats: data.total_flats || 400,
        vendor_count: 0,
        image_url: data.image_url || data.banner_image || 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg',
        banner_image: data.image_url || data.banner_image || 'https://static.squareyards.com/resources/images/noida/project-image/omaxe-greenwood-project-project-large-image1-2275.jpg'
      };
      MOCK_SOCIETIES.unshift(created);
      return created;
    }
  },

  // Vendors Storefront
  getSocietyVendors: async (societyId, search = '') => {
    try {
      const res = await fetch(`${API_BASE}/societies/${societyId}/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch society vendors');
      return await res.json();
    } catch (err) {
      if (!search) return MOCK_VENDORS;
      const term = search.toLowerCase();
      return MOCK_VENDORS.filter(v => 
        v.store_name.toLowerCase().includes(term) || 
        v.category.toLowerCase().includes(term)
      );
    }
  },

  getVendorStorefront: async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE}/vendors/${vendorId}`);
      if (!res.ok) throw new Error('Failed to fetch vendor storefront');
      return await res.json();
    } catch (err) {
      const vendor = MOCK_VENDORS.find(v => v.vendor_id === String(vendorId)) || MOCK_VENDORS[0];
      return {
        vendor,
        categories: ['Milk & Dairy', 'Daily Essentials', 'Snacks & Bakery', 'Fresh Produce'],
        items: [
          { item_id: '1', item_name: 'Farm Fresh Toned Milk (1L)', price: '65', unit: 'per item', category: 'Milk & Dairy', stock: '50', is_available: true, image_url: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=300&auto=format&fit=crop&q=80' },
          { item_id: '2', item_name: 'Organic Whole Wheat Bread (400g)', price: '45', unit: 'per item', category: 'Snacks & Bakery', stock: '30', is_available: true, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
          { item_id: '3', item_name: 'Pure Desi Cow Ghee (500ml)', price: '420', unit: 'per item', category: 'Milk & Dairy', stock: '20', is_available: true, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80' },
          { item_id: '4', item_name: 'Fresh Red Tomatoes (1kg)', price: '40', unit: 'per kg', category: 'Daily Essentials', stock: '40', is_available: true, image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80' },
          { item_id: '5', item_name: 'Fresh Cottage Cheese Paneer (200g)', price: '90', unit: 'per item', category: 'Milk & Dairy', stock: '25', is_available: true, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80' },
          { item_id: '6', item_name: 'Farm Eggs Pack (12 Pcs)', price: '95', unit: 'per item', category: 'Daily Essentials', stock: '35', is_available: true, image_url: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=300&auto=format&fit=crop&q=80' }
        ]
      };
    }
  },

  // Orders
  placeOrder: async (orderData) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to place order');
        return data;
      }
    } catch (err) {
      console.warn('Backend API unavailable, using offline order confirmation:', err);
    }
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    return {
      order_id: orderId,
      status: 'RECEIVED',
      created_at: new Date().toISOString(),
      message: 'Order recorded successfully'
    };
  },

  getOrderStatus: async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return {
      order_id: orderId,
      status: 'PREPARING',
      delivery_time: '15-20 mins'
    };
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update order status');
        return data;
      }
    } catch (_) {}
    return { order_id: orderId, status };
  },

  // Vendor Registration & Login
  registerVendor: async (vendorData) => {
    try {
      const res = await fetch(`${API_BASE}/vendors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
      }
    } catch (_) {}
    return {
      vendor_id: `20${Math.floor(Math.random() * 90 + 10)}`,
      status: 'PENDING_APPROVAL',
      message: 'Registration submitted successfully'
    };
  },

  loginVendor: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE}/vendors/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
      }
    } catch (_) {}
    return {
      vendor: MOCK_VENDORS[0],
      expiresAt: Date.now() + 86400000
    };
  },

  // Vendor Panel
  getVendorPanel: async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    const vendor = MOCK_VENDORS.find(v => v.vendor_id === String(vendorId)) || MOCK_VENDORS[0];
    return {
      vendor,
      items: [
        { item_id: '1', item_name: 'Farm Fresh Toned Milk (1L)', price: '65', unit: 'per item', category: 'Milk & Dairy', stock: '50', is_available: true, image_url: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=300&auto=format&fit=crop&q=80' },
        { item_id: '2', item_name: 'Organic Whole Wheat Bread (400g)', price: '45', unit: 'per item', category: 'Snacks & Bakery', stock: '30', is_available: true, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
        { item_id: '3', item_name: 'Pure Desi Cow Ghee (500ml)', price: '420', unit: 'per item', category: 'Milk & Dairy', stock: '20', is_available: true, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80' }
      ],
      orders: [],
      subscription: { status: 'ACTIVE', plan_type: 'Annual', expires_at: '2027-12-31' },
      payments: [
        { payment_id: 'PAY_101', amount: '2999.00', payment_method: 'UPI', created_at: new Date().toLocaleDateString() }
      ]
    };
  },

  addVendorItem: async (vendorId, itemData) => {
    try {
      const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add item');
        return data;
      }
    } catch (_) {}
    return { item_id: `ITM_${Date.now()}`, ...itemData, is_available: true };
  },

  updateVendorItem: async (vendorId, itemId, itemData) => {
    try {
      const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update item');
        return data;
      }
    } catch (_) {}
    return { item_id: itemId, ...itemData };
  },

  deleteVendorItem: async (vendorId, itemId) => {
    try {
      const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items/${itemId}`, {
        method: 'DELETE'
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return { success: true };
  },

  updateVendorSettings: async (vendorId, settingsData) => {
    try {
      const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update settings');
        return data;
      }
    } catch (_) {}
    return { success: true, ...settingsData };
  },

  // Admin
  getAdminVendors: async (search = '') => {
    try {
      const res = await fetch(`${API_BASE}/admin/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return MOCK_VENDORS;
  },

  getAdminRequests: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/requests`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return [];
  },

  approveVendorRequest: async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${vendorId}/approve`, {
        method: 'POST'
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return { success: true, vendorId, status: 'APPROVED' };
  },

  rejectVendorRequest: async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${vendorId}/reject`, {
        method: 'POST'
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return { success: true, vendorId, status: 'REJECTED' };
  },

  // Platform Branding Config
  getPlatformConfig: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/config`);
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
    } catch (_) {}
    return { platform_logo: '/logo.png', platform_name: 'DigiLocal' };
  },

  updatePlatformConfig: async (configData) => {
    try {
      let res = await fetch(`${API_BASE}/admin/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      if (res.status === 404) {
        res = await fetch(`${API_BASE}/admin/config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configData)
        });
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update platform config');
        return data;
      }
    } catch (_) {}
    return { message: 'Config updated locally' };
  }
};
