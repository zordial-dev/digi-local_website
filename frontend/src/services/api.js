const API_BASE = '/api';

export const api = {
  // Societies
  getSocieties: async (search = '') => {
    const res = await fetch(`${API_BASE}/societies${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch societies');
    return res.json();
  },

  getSociety: async (societyId) => {
    const res = await fetch(`${API_BASE}/societies/${societyId}`);
    if (!res.ok) throw new Error('Failed to fetch society');
    return res.json();
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
    const res = await fetch(`${API_BASE}/societies/${societyId}/vendors${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch society vendors');
    return res.json();
  },

  getVendorStorefront: async (vendorId) => {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}`);
    if (!res.ok) throw new Error('Failed to fetch vendor storefront');
    return res.json();
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
