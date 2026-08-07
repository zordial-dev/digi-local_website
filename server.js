import http from 'http';
import url from 'url';

const PORT = 5001;

// In-Memory Database Store (Initialized Empty for Users & Orders)
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
    society_name: "Omaxe Greenwood Residency"
  },
  {
    vendor_id: 2,
    society_id: 1,
    vendor_name: "Suresh Patel",
    store_name: "Green Leaf Organics & Fruits",
    email: "greenleaf@gmail.com",
    phone_number: "9876543211",
    phone: "9876543211",
    logo: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    opening_timing: "07:30 AM",
    closing_timing: "09:30 PM",
    delivery_charge: 0.00,
    min_order_value: 0.00,
    society_name: "Omaxe Greenwood Residency"
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
    is_available: 1,
    image_url: "https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=300&auto=format&fit=crop&q=80"
  },
  {
    item_id: 2,
    vendor_id: 1,
    item_name: "Organic Whole Wheat Bread (400g)",
    price: 45.00,
    stock: 30,
    category: "Snacks & Bakery",
    unit: "400g",
    is_available: 1,
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80"
  },
  {
    item_id: 3,
    vendor_id: 1,
    item_name: "Pure Desi Cow Ghee (500ml)",
    price: 420.00,
    stock: 20,
    category: "Dairy",
    unit: "500ml",
    is_available: 1,
    image_url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80"
  }
];

// REAL USERS & REAL ORDERS DATA STORES (No static dummy records)
const users = [];
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

// Helper: Format string into clean capitalized Name
function cleanNameFromEmail(inputStr) {
  if (!inputStr) return "Resident User";
  if (inputStr.includes('@')) {
    const part = inputStr.split('@')[0];
    const words = part.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  const clean = inputStr.replace(/[^a-zA-Z\s]/g, '').trim();
  if (!clean || clean.length < 2) return "Resident User";
  return clean.replace(/\b\w/g, c => c.toUpperCase());
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
      environment: "development"
    });
  }

  // In-Memory Active OTP Sessions
  const activeOtpSessions = new Map();

  // 0.1 Send User OTP (POST /api/users/send-otp)
  if (method === 'POST' && pathname === '/api/users/send-otp') {
    const body = await getRequestBody(req);
    const target = (body.phone || body.identifier || body.email || '').trim();
    if (!target) {
      return sendJSON(res, 400, { error: "Phone number or email is required to send OTP" });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtpSessions.set(target.toLowerCase(), { otp: otpCode, expiresAt: Date.now() + 600000 });
    return sendJSON(res, 200, {
      message: "OTP sent successfully",
      target: target,
      simulationOtp: otpCode
    });
  }

  // 0.2 Verify User OTP (POST /api/users/verify-otp)
  if (method === 'POST' && pathname === '/api/users/verify-otp') {
    const body = await getRequestBody(req);
    const target = (body.phone || body.identifier || body.email || '').trim().toLowerCase();
    const enteredOtp = (body.otp || '').trim();

    if (body.firebase_token) {
      return sendJSON(res, 200, { message: "OTP verified successfully", valid: true });
    }

    if (!target && !enteredOtp) {
      return sendJSON(res, 400, { error: "Phone number or email and OTP are required" });
    }

    const session = activeOtpSessions.get(target);
    if (session && (session.otp === enteredOtp || enteredOtp.length === 4 || enteredOtp.length === 6)) {
      return sendJSON(res, 200, { message: "OTP verified successfully", valid: true });
    }

    // Accept valid 4 or 6 digit code for demo testing
    if (enteredOtp && (enteredOtp.length === 4 || enteredOtp.length === 6)) {
      return sendJSON(res, 200, { message: "OTP verified successfully", valid: true });
    }

    return sendJSON(res, 400, { error: "Invalid OTP code" });
  }

  // 0.3 Resident User Login (POST /api/users/login)
  if (method === 'POST' && pathname === '/api/users/login') {
    const body = await getRequestBody(req);
    const email = body.email ? body.email.trim().toLowerCase() : '';
    const phone = body.phone || body.identifier ? (body.phone || body.identifier).trim() : '';
    let user = users.find(u => (email && u.email.toLowerCase() === email) || (phone && u.phone === phone));

    if (!user) {
      const userDisplayName = body.name ? body.name.trim() : (phone ? `User ${phone.slice(-4)}` : cleanNameFromEmail(email || 'User'));
      user = {
        user_id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
        name: userDisplayName,
        email: email || '',
        phone: phone || '9876543210',
        society_id: String(body.society_id || '1'),
        society_name: body.society_name || 'Omaxe Greenwood Residency',
        flat: body.flat || 'Tower A-402',
        joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
      };
      users.push(user);
    }

    const tokenStr = `user_jwt_access_${Date.now()}`;
    return sendJSON(res, 200, {
      token: tokenStr,
      accessToken: tokenStr,
      refreshToken: `user_jwt_refresh_${Date.now()}`,
      user
    });
  }

  // 0.4 Resident User Registration (POST /api/users/register)
  if (method === 'POST' && pathname === '/api/users/register') {
    const body = await getRequestBody(req);
    const email = body.email ? body.email.trim().toLowerCase() : '';
    const phone = body.phone ? body.phone.trim() : '';

    if (phone && users.some(u => u.phone === phone)) {
      return sendJSON(res, 400, { error: "An account with this mobile number already exists" });
    }

    const userDisplayName = body.name ? body.name.trim() : (phone ? `User ${phone.slice(-4)}` : cleanNameFromEmail(email));
    const newUser = {
      user_id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
      name: userDisplayName,
      email: email || '',
      phone: phone || '',
      society_id: String(body.society_id || '1'),
      society_name: body.society_name || 'Omaxe Greenwood Residency',
      flat: body.flat || 'Tower B-204',
      joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
    };

    users.push(newUser);
    const tokenStr = `user_jwt_access_${Date.now()}`;
    return sendJSON(res, 201, {
      message: "User registered successfully",
      token: tokenStr,
      accessToken: tokenStr,
      refreshToken: `user_jwt_refresh_${Date.now()}`,
      user: newUser
    });
  }

  // 0.5 Send Vendor OTP (POST /api/vendors/send-otp)
  if (method === 'POST' && pathname === '/api/vendors/send-otp') {
    const body = await getRequestBody(req);
    const target = (body.email || body.phone || body.identifier || '').trim();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (target) {
      activeOtpSessions.set(target.toLowerCase(), { otp: otpCode, expiresAt: Date.now() + 600000 });
    }
    return sendJSON(res, 200, {
      message: "Vendor OTP sent successfully",
      target,
      simulationOtp: otpCode
    });
  }

  if (method === 'PUT' && pathname.startsWith('/api/users/')) {
    const body = await getRequestBody(req);
    const userId = pathname.split('/')[3];
    let user = users.find(u => u.user_id === userId || u.email === body.email);
    if (user) {
      if (body.name) user.name = cleanNameFromEmail(body.name);
      if (body.email) user.email = body.email;
      if (body.phone) user.phone = body.phone;
      if (body.society_name) user.society_name = body.society_name;
      if (body.flat) user.flat = body.flat;
      if (body.avatar) user.avatar = body.avatar;
    }
    return sendJSON(res, 200, { message: "User profile updated successfully", user });
  }

  if (method === 'GET' && pathname.includes('/api/users/') && pathname.endsWith('/orders')) {
    const userId = pathname.split('/')[3];
    const userOrders = orders.filter(o => String(o.user_id) === String(userId));
    return sendJSON(res, 200, userOrders);
  }

  // 1. VENDOR AUTHENTICATION APIs
  if (method === 'POST' && pathname === '/api/vendors/register') {
    const body = await getRequestBody(req);
    if (!body.email || (!body.store_name && !body.shop_business_name)) {
      return sendJSON(res, 400, { error: "Missing required fields" });
    }
    const existing = vendors.find(v => v.email && body.email && v.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      return sendJSON(res, 400, { error: "An account with this email address already exists" });
    }
    const newId = vendors.length + 1;
    const newVendor = {
      vendor_id: newId,
      society_id: body.society_id || 1,
      society_name: body.society_name || "",
      vendor_name: body.vendor_name || body.owner_name || "Vendor Owner",
      store_name: body.store_name || body.shop_business_name || "Store",
      shop_number: body.shop_number || "",
      shop_address: body.shop_address || "",
      city: body.city || "",
      pincode: body.pincode || "",
      business_category: body.business_category || "General",
      email: body.email.toLowerCase(),
      phone_number: body.phone_number || body.mobile_number || "",
      gst_number: body.gst_number || "",
      shop_images: body.shop_images || [],
      status: "ACTIVE"
    };
    vendors.push(newVendor);
    return sendJSON(res, 201, {
      message: "Vendor registration submitted successfully!",
      vendor_id: newId,
      vendor: newVendor,
      status: "ACTIVE",
      token: `jwt_vendor_${Date.now()}`
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/login') {
    const body = await getRequestBody(req);
    let vendor = vendors.find(v => v.email && body.email && v.email.toLowerCase() === body.email.toLowerCase());
    if (!vendor && body.email) {
      const newId = vendors.length + 1;
      const cleanName = cleanNameFromEmail(body.email);
      vendor = {
        vendor_id: newId,
        society_id: 1,
        vendor_name: cleanName,
        store_name: `${cleanName}'s Store`,
        email: body.email.toLowerCase(),
        phone_number: body.phone || "9876543210",
        phone: body.phone || "9876543210",
        status: "ACTIVE",
        society_name: "Omaxe Greenwood Residency"
      };
      vendors.push(vendor);
    }
    return sendJSON(res, 200, {
      message: "Login successful",
      vendor,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });
  }

  if (method === 'POST' && pathname === '/api/vendors/forgot-password') {
    return sendJSON(res, 200, { message: "OTP sent successfully", simulationOtp: "849201" });
  }

  if (method === 'POST' && pathname === '/api/vendors/verify-otp') {
    const body = await getRequestBody(req);
    if (body.otp && body.otp !== "849201") {
      return sendJSON(res, 400, { error: "Invalid OTP" });
    }
    return sendJSON(res, 200, { message: "OTP verified successfully." });
  }

  if (method === 'POST' && pathname === '/api/vendors/reset-password') {
    return sendJSON(res, 200, { message: "Password reset successfully!" });
  }

  // 2. STOREFRONT & PUBLIC DIRECTORY APIs
  if (method === 'POST' && pathname === '/api/societies') {
    const body = await getRequestBody(req);
    if (!body.society_name) {
      return sendJSON(res, 400, { error: "Society name is required" });
    }
    const numericId = societies.length + 101;
    const newSociety = {
      society_id: numericId,
      society_name: body.society_name,
      location: body.location || body.fullAddress || body.address || "Gated Community",
      public_id: `GW-${Math.floor(100 + Math.random() * 900)}`,
      pincode: body.pincode || "201310",
      vendor_count: 0
    };
    societies.unshift(newSociety);
    return sendJSON(res, 201, { message: "Society created successfully", society_id: numericId, society: newSociety });
  }

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
    return sendJSON(res, 200, { vendor, items: vendorItems });
  }

  // 3. CUSTOMER ORDERS APIs
  if (method === 'POST' && pathname === '/api/orders') {
    const body = await getRequestBody(req);
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const reqItems = body.items || [];

    let totalAmount = 0;
    for (let rItem of reqItems) {
      const targetItem = items.find(i => i.item_id === Number(rItem.item_id));
      const price = targetItem ? targetItem.price : (rItem.unit_price || 68.00);
      totalAmount += price * (rItem.quantity || 1);
    }

    const newOrder = {
      order_id: orderId,
      vendor_id: body.vendor_id || 1,
      user_id: body.user_id || body.customer_id || "usr_guest",
      customer_name: body.customer_name || body.buyer_name || "Resident User",
      phone_number: body.phone_number || "9876543210",
      delivery_address: body.address || `Flat A-402, Greenwood Residency`,
      status: "PLACED",
      payment_status: "PAID",
      payment_method: body.payment_method || "UPI",
      date: new Date().toISOString(),
      total_amount: totalAmount || 308.00,
      store_name: body.store_name || "FreshMart Grocery & Organic",
      store_logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80",
      items: reqItems.map(i => ({
        item_id: i.item_id,
        item_name: i.item_name || "Grocery Item",
        quantity: i.quantity || 1,
        unit_price: i.unit_price || 68.00
      }))
    };
    orders.unshift(newOrder);

    return sendJSON(res, 201, {
      message: "Order placed successfully",
      order_id: orderId,
      total_amount: newOrder.total_amount,
      status: "PLACED",
      order: newOrder
    });
  }

  if (method === 'GET' && pathname.startsWith('/api/orders/')) {
    const orderId = pathname.split('/')[3];
    const order = orders.find(o => String(o.order_id) === String(orderId));
    if (!order) return sendJSON(res, 404, { error: "Order not found" });
    return sendJSON(res, 200, { order, items: order.items });
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
      orders: orders.filter(o => o.vendor_id === vendorId),
      subscription: { status: "ACTIVE", end_date: "2027-07-31" },
      payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }]
    });
  }

  // Admin APIs
  if (method === 'GET' && pathname === '/api/admin/vendors') {
    return sendJSON(res, 200, vendors.map(v => ({ ...v, payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }] })));
  }

  if (method === 'GET' && pathname === '/api/admin/config') {
    return sendJSON(res, 200, platformConfig);
  }

  // Default 404
  return sendJSON(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`DigiLocal REST API Server running on port ${PORT}`);
});
