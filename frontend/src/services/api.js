const API_BASE = '/api';

// Fallback Mock Data for standalone / offline resilience
const MOCK_SOCIETIES = [
  {
    society_id: '101',
    society_name: 'Greenwood Heights',
    location: 'Sector 62, Noida',
    pincode: '201301',
    total_flats: 450,
    vendor_count: 12,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80'
  },
  {
    society_id: '102',
    society_name: 'Palm Meadows Residency',
    location: 'Whitefield, Bengaluru',
    pincode: '560066',
    total_flats: 320,
    vendor_count: 8,
    image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80'
  },
  {
    society_id: '103',
    society_name: 'DLF Phase 5 Enclave',
    location: 'Golf Course Road, Gurugram',
    pincode: '122002',
    total_flats: 600,
    vendor_count: 15,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
  },
  {
    society_id: '104',
    society_name: 'Godrej Woods Community',
    location: 'Sector 43, Noida',
    pincode: '201303',
    total_flats: 280,
    vendor_count: 6,
    image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80'
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
      return MOCK_SOCIETIES.find(s => s.society_id === String(societyId)) || MOCK_SOCIETIES[0];
    }
  },


  createSociety: async (data) => {
    const res = await fetch(`${API_BASE}/societies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create society');
    return res.json();
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
        categories: ['Milk & Dairy', 'Daily Essentials', 'Snacks & Bakery'],
        items: [
          { item_id: '1', item_name: 'Farm Fresh Toned Milk (1L)', price: '65', unit: 'per item', category: 'Milk & Dairy', stock: '50', image_url: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=300&auto=format&fit=crop&q=80' },
          { item_id: '2', item_name: 'Organic Whole Wheat Bread (400g)', price: '45', unit: 'per item', category: 'Snacks & Bakery', stock: '30', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
          { item_id: '3', item_name: 'Pure Desi Cow Ghee (500ml)', price: '420', unit: 'per item', category: 'Milk & Dairy', stock: '20', image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80' },
          { item_id: '4', item_name: 'Fresh Red Tomatoes (1kg)', price: '40', unit: 'per kg', category: 'Daily Essentials', stock: '40', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80' }
        ]
      };
    }
  },

  // Orders
  placeOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place order');
    return data;
  },

  getOrderStatus: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  // Vendor Registration & Login
  registerVendor: async (vendorData) => {
    const res = await fetch(`${API_BASE}/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  loginVendor: async (credentials) => {
    const res = await fetch(`${API_BASE}/vendors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // Vendor Panel
  getVendorPanel: async (vendorId) => {
    const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}`);
    if (!res.ok) throw new Error('Failed to fetch vendor panel');
    return res.json();
  },

  addVendorItem: async (vendorId, itemData) => {
    const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add item');
    return data;
  },

  updateVendorItem: async (vendorId, itemId, itemData) => {
    const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update item');
    return data;
  },

  deleteVendorItem: async (vendorId, itemId) => {
    const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  updateVendorSettings: async (vendorId, settingsData) => {
    const res = await fetch(`${API_BASE}/vendorPanel/${vendorId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  // Admin
  getAdminVendors: async (search = '') => {
    const res = await fetch(`${API_BASE}/admin/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch admin vendor list');
    return res.json();
  },

  getAdminRequests: async () => {
    const res = await fetch(`${API_BASE}/admin/requests`);
    if (!res.ok) throw new Error('Failed to fetch vendor requests');
    return res.json();
  },

  approveVendorRequest: async (vendorId) => {
    const res = await fetch(`${API_BASE}/admin/requests/${vendorId}/approve`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve request');
    return data;
  },

  rejectVendorRequest: async (vendorId) => {
    const res = await fetch(`${API_BASE}/admin/requests/${vendorId}/reject`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject request');
    return data;
  },

  // Platform Branding Config
  getPlatformConfig: async () => {
    const res = await fetch(`${API_BASE}/admin/config`);
    if (!res.ok) throw new Error('Failed to fetch platform config');
    return res.json();
  },

  updatePlatformConfig: async (configData) => {
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
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status} status. Please restart backend server (node server.js).`);
    return { message: 'Config updated' };
  }
};
