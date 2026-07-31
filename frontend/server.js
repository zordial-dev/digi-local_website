import http from 'http';
import url from 'url';

const PORT = 5001;

// In-Memory Database Store
const societies = [
  {
    society_id: "SOC-101",
    society_name: "Omaxe Greenwood Residency",
    location: "Sector Greenwood, Omega II, Greater Noida",
    public_id: "GW-4K2",
    pincode: "201310",
    vendor_count: 14
  },
  {
    society_id: "SOC-102",
    society_name: "Palm Meadows Residency",
    location: "Whitefield, Bengaluru",
    public_id: "PM-981",
    pincode: "560066",
    vendor_count: 8
  },
  {
    society_id: "SOC-103",
    society_name: "DLF Phase 5 Enclave",
    location: "Golf Course Road, Gurugram",
    public_id: "DLF-55",
    pincode: "122002",
    vendor_count: 15
  },
  {
    society_id: "SOC-104",
    society_name: "Godrej Woods Community",
    location: "Sector 43, Noida",
    public_id: "GW-904",
    pincode: "201303",
    vendor_count: 6
  },
  {
    society_id: "SOC-105",
    society_name: "Jaypee Greens Wish Town",
    location: "Sector 128, Noida",
    public_id: "JPG-12",
    pincode: "201304",
    vendor_count: 18
  },
  {
    society_id: "SOC-106",
    society_name: "ATS Village Gated Complex",
    location: "Sector 93A, Noida",
    public_id: "ATS-93",
    pincode: "201304",
    vendor_count: 11
  }
];

const vendors = [
  {
    vendor_id: 1,
    society_id: 1,
    vendor_name: "Rajesh Sharma",
    store_name: "FreshMart Grocery & Organic",
    email: "freshmart@gmail.com",
    phone_number: "9876543210",
    phone: "9876543210",
    gst_number: "07AAACR12341Z5",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    opening_timing: "08:00 AM",
    closing_timing: "10:00 PM",
    delivery_charge: 0.00,
    min_order_value: 0.00,
    society_name: "Greenwood Residency"
  }
];

const items = [
  {
    item_id: 1,
    vendor_id: 1,
    item_name: "Farm Fresh Organic Milk (1L)",
    price: 68.00,
    stock: 50,
    category: "Dairy",
    unit: "1L",
    is_available: 1
  },
  {
    item_id: 2,
    vendor_id: 1,
    item_name: "Organic Whole Wheat Bread (400g)",
    price: 45.00,
    stock: 30,
    category: "Snacks & Bakery",
    unit: "400g",
    is_available: 1
  }
];

const orders = [];
const pendingRequests = [];
let platformConfig = {
  platform_logo: "https://imgh.in/host/ucila6",
  platform_name: "DigiLocal"
};

// Helper: Read Body JSON
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Helper: Send JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // OPTIONS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // 6. HEALTH & OBSERVABILITY APIs
  if (method === 'GET' && pathname === '/health') {
    return sendJSON(res, 200, {
      status: "UP",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      uptimeSeconds: Math.floor(process.uptime()),
      environment: "development",
      database: { status: "UP", engine: "sqlite" },
      memory: { heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024) }
    });
  }

  if (method === 'GET' && pathname === '/health/live') {
    return sendJSON(res, 200, {
      status: "ALIVE",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    });
  }

  if (method === 'GET' && pathname === '/health/ready') {
    return sendJSON(res, 200, {
      status: "READY",
      timestamp: new Date().toISOString(),
      database: "CONNECTED"
    });
  }

  if (method === 'GET' && pathname === '/version') {
    return sendJSON(res, 200, {
      name: "digilocal-backend",
      version: "1.0.0",
      description: "Backend API for DigiLocal Vendor Ordering and Subscription Platform",
      environment: "development",
      nodeVersion: process.version
    });
  }

  // 1. VENDOR AUTHENTICATION APIs
  if (method === 'POST' && pathname === '/api/vendors/register') {
    const body = await getRequestBody(req);
    if (!body.email || !body.store_name) {
      return sendJSON(res, 400, { error: "Missing required fields" });
    }
    const existing = vendors.find(v => v.email === body.email);
    if (existing) {
      return sendJSON(res, 400, { error: "An account with this email address already exists" });
    }
    const newId = vendors.length + 1;
    const newVendor = {
      vendor_id: newId,
      society_id: body.society_id || 1,
      vendor_name: body.vendor_name || "Vendor",
      store_name: body.store_name,
      email: body.email,
      phone_number: body.phone_number || "9876543210",
      gst_number: body.gst_number || "",
      status: "PENDING"
    };
    vendors.push(newVendor);
    return sendJSON(res, 201, {
      message: "Vendor registration & payment submitted successfully!",
      vendor_id: newId,
      vendor: newVendor,
      status: "PENDING",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/login') {
    const body = await getRequestBody(req);
    const vendor = vendors.find(v => v.email === body.email || v.phone_number === body.phone_number || v.phone === body.phone);
    if (!vendor) {
      return sendJSON(res, 401, { error: "Invalid email or password" });
    }
    if (vendor.status === 'REJECTED') {
      return sendJSON(res, 403, {
        error: "Access Denied: Your vendor application was rejected by DigiLocal Admin.",
        status: "REJECTED"
      });
    }
    return sendJSON(res, 200, {
      message: "Login successful",
      vendor,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/refresh') {
    return sendJSON(res, 200, {
      message: "Access token refreshed successfully",
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/logout') {
    return sendJSON(res, 200, { message: "Logout successful, tokens revoked" });
  }

  if (method === 'POST' && pathname === '/api/vendors/forgot-password') {
    return sendJSON(res, 200, {
      message: "OTP sent successfully to registered email address",
      simulationOtp: "849201"
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/verify-otp') {
    const body = await getRequestBody(req);
    if (body.otp && body.otp !== "849201") {
      return sendJSON(res, 400, { error: "Invalid OTP" });
    }
    return sendJSON(res, 200, { message: "OTP verified successfully. You may now reset your password." });
  }

  if (method === 'POST' && pathname === '/api/vendors/reset-password') {
    return sendJSON(res, 200, { message: "Password reset successfully! You can now log in with your new password." });
  }

  // 2. STOREFRONT & PUBLIC DIRECTORY APIs
  if (method === 'GET' && pathname === '/api/societies') {
    const q = parsedUrl.query.search ? parsedUrl.query.search.toLowerCase() : '';
    const filtered = q ? societies.filter(s => s.society_name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)) : societies;
    return sendJSON(res, 200, filtered);
  }

  if (method === 'GET' && pathname.startsWith('/api/societies/')) {
    const parts = pathname.split('/');
    const socId = Number(parts[3]);
    const isVendors = parts[4] === 'vendors';

    if (isVendors) {
      const q = parsedUrl.query.search ? parsedUrl.query.search.toLowerCase() : '';
      const list = vendors.filter(v => Number(v.society_id) === socId || socId === 1);
      const filtered = q ? list.filter(v => v.store_name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) : list;
      return sendJSON(res, 200, filtered);
    } else {
      const soc = societies.find(s => s.society_id === socId);
      if (!soc) return sendJSON(res, 404, { error: "Society not found" });
      return sendJSON(res, 200, soc);
    }
  }

  if (method === 'GET' && pathname.startsWith('/api/vendors/')) {
    const vendorId = Number(pathname.split('/')[3]);
    const vendor = vendors.find(v => v.vendor_id === vendorId) || vendors[0];
    const vendorItems = items.filter(i => i.vendor_id === vendorId || vendorId === 1);
    return sendJSON(res, 200, {
      vendor,
      items: vendorItems
    });
  }

  if (method === 'GET' && pathname.startsWith('/shop/')) {
    const vendorId = pathname.split('/')[2];
    res.writeHead(302, { Location: `/1/${vendorId}` });
    return res.end();
  }

  // 3. CUSTOMER ORDERS APIs
  if (method === 'POST' && pathname === '/api/orders') {
    const body = await getRequestBody(req);
    const orderId = orders.length + 1;
    const reqItems = body.items || [];
    
    // Check Stock
    for (let rItem of reqItems) {
      const targetItem = items.find(i => i.item_id === Number(rItem.item_id));
      if (targetItem && targetItem.stock < rItem.quantity) {
        return sendJSON(res, 400, {
          error: `Insufficient stock for '${targetItem.item_name}'. Available: ${targetItem.stock}, Requested: ${rItem.quantity}`
        });
      }
    }

    let totalAmount = 0;
    for (let rItem of reqItems) {
      const targetItem = items.find(i => i.item_id === Number(rItem.item_id));
      const price = targetItem ? targetItem.price : (rItem.unit_price || 68.00);
      totalAmount += price * (rItem.quantity || 1);
      if (targetItem) targetItem.stock -= (rItem.quantity || 1);
    }

    const newOrder = {
      order_id: orderId,
      vendor_id: body.vendor_id || 1,
      customer_id: 1,
      customer_name: body.customer_name || body.buyer_name || "Rahul Verma",
      phone_number: body.phone_number || body.buyer_phone || "9898989898",
      address: body.address || `Flat ${body.flat_number || '402'}, Tower B`,
      status: "PLACED",
      total_amount: totalAmount || 308.00,
      store_name: "FreshMart Grocery & Organic",
      items: reqItems.map(i => ({ ...i, unit_price: i.unit_price || 68.00, item_total: (i.unit_price || 68.00) * i.quantity }))
    };
    orders.push(newOrder);

    return sendJSON(res, 201, {
      message: "Order placed successfully",
      order_id: orderId,
      total_amount: newOrder.total_amount,
      status: "PLACED"
    });
  }

  if (method === 'GET' && pathname.startsWith('/api/orders/')) {
    const orderId = Number(pathname.split('/')[3]);
    const order = orders.find(o => o.order_id === orderId) || {
      order_id: orderId,
      vendor_id: 1,
      customer_id: 1,
      status: "PLACED",
      total_amount: 308.00,
      store_name: "FreshMart Grocery & Organic",
      customer_name: "Rahul Verma"
    };
    return sendJSON(res, 200, {
      order,
      items: order.items || [
        { order_id: orderId, item_id: 1, quantity: 1, unit_price: 68.00, item_total: 68.00, item_name: "Farm Fresh Organic Milk (1L)" }
      ]
    });
  }

  if (method === 'PUT' && pathname.includes('/api/orders/') && pathname.endsWith('/status')) {
    const body = await getRequestBody(req);
    return sendJSON(res, 200, {
      message: "Order status updated",
      status: body.status || "ACCEPTED"
    });
  }

  // 4. VENDOR DASHBOARD & CATALOG APIs
  if (method === 'GET' && pathname.startsWith('/api/vendorPanel/')) {
    const parts = pathname.split('/');
    const vendorId = Number(parts[3]);
    const vendor = vendors.find(v => v.vendor_id === vendorId) || vendors[0];
    const vendorItems = items.filter(i => i.vendor_id === vendorId || vendorId === 1);
    return sendJSON(res, 200, {
      vendor,
      items: vendorItems,
      orders: orders.filter(o => o.vendor_id === vendorId || vendorId === 1),
      subscription: { status: "ACTIVE", end_date: "2027-07-31" },
      payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }]
    });
  }

  if (method === 'POST' && pathname.includes('/api/vendorPanel/') && pathname.endsWith('/items')) {
    const body = await getRequestBody(req);
    const newItemId = items.length + 1;
    const newItem = {
      item_id: newItemId,
      vendor_id: Number(pathname.split('/')[3]) || 1,
      item_name: body.item_name || "New Item",
      price: Number(body.price) || 50,
      stock: Number(body.stock) || 10,
      category: body.category || "General",
      unit: body.unit || "per item",
      is_available: body.is_available !== undefined ? body.is_available : 1,
      image_url: body.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80"
    };
    items.push(newItem);
    return sendJSON(res, 201, {
      message: "Item added successfully",
      item_id: newItemId
    });
  }

  if (method === 'PUT' && pathname.includes('/api/vendorPanel/') && pathname.includes('/items/')) {
    const body = await getRequestBody(req);
    const itemId = Number(pathname.split('/')[5]);
    const item = items.find(i => i.item_id === itemId);
    if (item) Object.assign(item, body);
    return sendJSON(res, 200, { message: "Availability status updated successfully" });
  }

  if (method === 'DELETE' && pathname.includes('/api/vendorPanel/') && pathname.includes('/items/')) {
    const itemId = Number(pathname.split('/')[5]);
    const idx = items.findIndex(i => i.item_id === itemId);
    if (idx !== -1) items.splice(idx, 1);
    return sendJSON(res, 200, { message: "Item deleted successfully" });
  }

  if (method === 'PUT' && pathname.includes('/api/vendorPanel/') && pathname.endsWith('/settings')) {
    const body = await getRequestBody(req);
    const vendorId = Number(pathname.split('/')[3]);
    const vendor = vendors.find(v => v.vendor_id === vendorId);
    if (vendor) Object.assign(vendor, body);
    return sendJSON(res, 200, {
      message: "Store settings updated successfully",
      logo: body.logo || (vendor ? vendor.logo : "")
    });
  }

  if (method === 'POST' && pathname.includes('/api/vendorPanel/') && pathname.endsWith('/renew')) {
    return sendJSON(res, 200, {
      message: "Subscription renewed successfully for 1 year!",
      start_date: "2026-07-31",
      end_date: "2027-07-31"
    });
  }

  // 5. ADMIN PORTAL APIs
  if (method === 'GET' && pathname === '/api/admin/vendors') {
    return sendJSON(res, 200, vendors.map(v => ({
      ...v,
      payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }]
    })));
  }

  if (method === 'GET' && pathname === '/api/admin/requests') {
    return sendJSON(res, 200, pendingRequests);
  }

  if (method === 'POST' && pathname.includes('/api/admin/requests/') && pathname.endsWith('/approve')) {
    const vId = pathname.split('/')[4];
    return sendJSON(res, 200, {
      message: "Vendor request approved successfully! Vendor is now active with 1-Year Subscription.",
      vendor_id: vId,
      start_date: "2026-07-31",
      end_date: "2027-07-31"
    });
  }

  if (method === 'POST' && pathname.includes('/api/admin/requests/') && pathname.endsWith('/reject')) {
    const vId = pathname.split('/')[4];
    return sendJSON(res, 200, {
      message: "Vendor request rejected",
      vendor_id: vId
    });
  }

  if (method === 'GET' && pathname === '/api/admin/config') {
    return sendJSON(res, 200, platformConfig);
  }

  if ((method === 'PUT' || method === 'POST') && pathname === '/api/admin/config') {
    const body = await getRequestBody(req);
    platformConfig = { ...platformConfig, ...body };
    return sendJSON(res, 200, {
      message: "Platform configuration updated successfully",
      platform_logo: platformConfig.platform_logo,
      platform_name: platformConfig.platform_name
    });
  }

  // Default 404
  return sendJSON(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`DigiLocal REST API Server running on port ${PORT}`);
});
