import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const PORT = 5001;

// Load Persistent JSON Database
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return { societies: [], vendors: [], items: [], users: [], orders: [], pendingRequests: [], platformConfig: {} };
}

// Persistent Auto-Save Database Helper
function saveDB() {
  try {
    const dataToSave = { societies, vendors, items, users, orders, pendingRequests, tickets, platformConfig, cmsPages, supportContacts };
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// Default CMS Pages & Support Contacts Fallback Data
const defaultSupportContacts = {
  phone: "+91 800-562-5999",
  email: "support@digilocal.in",
  toll_free: "1800-123-4567",
  whatsapp: "+91 80056 25999",
  address: "DigiLocal Tech Hub, Tower B, Sector 62, Noida, UP - 201309",
  working_hours: "Monday to Saturday: 9:00 AM - 8:00 PM IST"
};

const defaultCmsPages = {
  'help-support': {
    slug: "help-support",
    title: "Help & Support Center",
    meta_description: "Official DigiLocal Help & Support, FAQ, Order Assistance, and Customer Service Contacts.",
    content: `# DigiLocal Help & Support Center\n\nWelcome to the DigiLocal Help & Support Center. We are here to assist residents, apartment owners, and verified local merchants with instant support.\n\n## 📞 Quick Contact Information\n- **Support Hotline**: +91 800-562-5999\n- **Official Email**: support@digilocal.in\n- **Toll-Free Helpline**: 1800-123-4567\n- **WhatsApp Instant Support**: +91 80056 25999\n- **Working Hours**: Monday to Saturday: 9:00 AM - 8:00 PM IST\n- **Corporate Address**: DigiLocal Tech Hub, Tower B, Sector 62, Noida, UP - 201309\n\n## ❓ Frequently Asked Questions\n\n### 1. How does DigiLocal delivery work?\nDigiLocal connects residents with verified local merchants operating inside or near your residential housing society. Orders are delivered directly to your doorstep in 10-15 minutes.\n\n### 2. How can I contact a vendor directly?\nEach store storefront on DigiLocal includes a direct phone call button and instant WhatsApp order placement link for fast communication.\n\n### 3. What if my order has missing or damaged items?\nYou can raise an instant support ticket from your User Profile under "Orders & Support" or contact our helpline at +91 800-562-5999.\n\n### 4. How do local vendors register on DigiLocal?\nLocal store owners can click on "Register as Vendor", select their housing society, fill in GST & store details, choose a subscription plan, and submit for DigiLocal Admin approval.`,
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    updated_at: "2026-08-14T10:30:00.000Z"
  },
  'about-us': {
    slug: "about-us",
    title: "About DigiLocal",
    meta_description: "Learn about DigiLocal, India premier hyperlocal enclave e-commerce and residential merchant ecosystem.",
    content: `# About DigiLocal\n\nDigiLocal is India's premier Hyperlocal Enclave E-Commerce Platform built exclusively for gated residential societies, apartment enclaves, and neighborhood community ecosystems.\n\n## 🚀 Our Mission\nOur mission is to empower neighborhood micro-entrepreneurs, home bakers, local grocers, florists, and artisans by connecting them directly with residents living in nearby housing societies.\n\n## 🌟 Why DigiLocal?\n- **10-15 Min Hyperlocal Delivery**: Sourced from verified vendors within or adjacent to your gated enclave.\n- **Direct WhatsApp Ordering**: Connect directly with trusted shop owners.\n- **Zero Middleman Markup**: Transparent pricing directly set by verified local vendors.\n- **Community Trust**: Verified resident reviews and admin-approved store onboarding.`,
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    updated_at: "2026-08-14T10:30:00.000Z"
  },
  'privacy-policy': {
    slug: "privacy-policy",
    title: "Privacy Policy",
    meta_description: "DigiLocal Privacy Policy detailing data protection, encryption, user consent, and security standards.",
    content: `# DigiLocal Privacy Policy\n\n**Effective Date**: August 14, 2026\n\nAt DigiLocal, protecting customer and merchant data is our highest priority. This Privacy Policy outlines how we collect, process, encrypt, and safeguard your personal information when you use the DigiLocal web application and services.\n\n## 🔒 1. Information We Collect\n- **Resident Account Data**: Name, mobile phone number, email address, society name, tower & flat number.\n- **Vendor Store Data**: Store name, merchant owner name, business email, contact phone, GSTIN number, shop address.\n- **Order & Transaction Records**: Items ordered, payment method, transaction references, delivery instructions.\n\n## 🛡️ 2. How We Use Your Information\n- Facilitating hyperlocal order dispatch and delivery inside your residential society.\n- Enabling WhatsApp direct communication between residents and local vendors.\n- Sending real-time SMS order status alerts and subscription invoice receipts.\n- Preventing fraudulent store registrations and protecting community security.`,
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    updated_at: "2026-08-14T10:30:00.000Z"
  },
  'terms-conditions': {
    slug: "terms-conditions",
    title: "Terms & Conditions",
    meta_description: "DigiLocal Terms & Conditions of Service for residents, customers, and vendor merchants.",
    content: `# DigiLocal Terms & Conditions\n\n**Effective Date**: August 14, 2026\n\nWelcome to DigiLocal! These Terms and Conditions govern your access to and use of the DigiLocal website, resident ordering portal, vendor management dashboard, and admin control suite.\n\n## 📜 1. Acceptance of Terms\nBy registering an account, placing an order, or listing a store on DigiLocal, you agree to be bound by these Terms & Conditions and our Privacy Policy.\n\n## 🏘️ 2. Resident User Responsibilities\n- Residents must provide accurate society, tower, and flat address information for seamless delivery.\n- Orders placed via DigiLocal are subject to store availability and operating hours set by local vendors.\n\n## 🏪 3. Vendor Merchant Guidelines\n- Vendors must hold valid GST or local trade permits and maintain fresh product quality.\n- Subscription fees paid for DigiLocal vendor panel access are non-refundable once approved by Admin.`,
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    updated_at: "2026-08-14T10:30:00.000Z"
  },
  'how-it-works': {
    slug: "how-it-works",
    title: "How DigiLocal Works",
    meta_description: "Understand how DigiLocal connects housing society residents with verified local merchants.",
    content: `# How DigiLocal Works\n\nDigiLocal simplifies hyperlocal ordering within gated residential societies in 3 easy steps:\n\n1. **Select Your Housing Society**: Choose your residential complex to view approved local store vendors.\n2. **Browse Stores & Products**: Explore groceries, fresh produce, bakeries, pharmacy, services & daily essentials.\n3. **Order & Enjoy 10-15 Min Doorstep Delivery**: Order directly via WhatsApp or online checkout.`,
    phone: "+91 800-562-5999",
    email: "support@digilocal.in",
    updated_at: "2026-08-14T10:30:00.000Z"
  }
};

// Initialize Active Database Collections from db.json
const initialDb = loadDB();
const societies = initialDb.societies || [];
const vendors = initialDb.vendors || [];
const items = initialDb.items || [];
const users = initialDb.users || [];
const orders = initialDb.orders || [];
const pendingRequests = initialDb.pendingRequests || [];
const tickets = initialDb.tickets || [];
let cmsPages = initialDb.cmsPages || defaultCmsPages;
let supportContacts = initialDb.supportContacts || defaultSupportContacts;
let platformConfig = initialDb.platformConfig || {
  platform_name: "DigiLocal",
  platform_logo: "https://imgh.in/host/ucila6",
  maintenance_mode: false,
  support_email: "support@digilocal.in",
  support_phone: "+91 1800 123 4567",
  max_upload_size_mb: 10,
  default_currency: "INR",
  timezone: "Asia/Kolkata"
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

// In-Memory Active OTP Sessions
const activeOtpSessions = new Map();

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

  // MSG91 SMS OTP Service - Send OTP (POST /api/otp/send-otp)
  if (method === 'POST' && (pathname === '/api/otp/send-otp' || pathname === '/api/users/send-otp' || pathname === '/api/vendors/send-otp')) {
    const body = await getRequestBody(req);
    const rawPhone = (body.phone || body.mobile || body.identifier || body.email || '').trim();
    if (!rawPhone) {
      return sendJSON(res, 400, {
        success: false,
        message: "Invalid phone number format. Provide a valid 10-digit mobile number."
      });
    }

    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const mobileFormatted = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const sessionData = { otp: otpCode, expiresAt: Date.now() + 600000 };
    activeOtpSessions.set(rawPhone.toLowerCase(), sessionData);
    if (cleanDigits) activeOtpSessions.set(cleanDigits.toLowerCase(), sessionData);
    if (mobileFormatted) activeOtpSessions.set(mobileFormatted.toLowerCase(), sessionData);

    return sendJSON(res, 200, {
      success: true,
      message: "OTP sent successfully",
      data: {
        type: "success",
        message: "OTP sent successfully",
        mobile: mobileFormatted || rawPhone
      },
      target: rawPhone,
      simulationOtp: otpCode
    });
  }

  // MSG91 SMS OTP Service - Verify OTP (POST /api/otp/verify-otp)
  if (method === 'POST' && (pathname === '/api/otp/verify-otp' || pathname === '/api/users/verify-otp' || pathname === '/api/vendors/verify-otp')) {
    const body = await getRequestBody(req);
    const rawPhone = (body.phone || body.mobile || body.identifier || body.email || '').trim().toLowerCase();
    const enteredOtp = (body.otp || body.code || '').trim();

    if (body.firebase_token) {
      return sendJSON(res, 200, {
        success: true,
        message: "OTP verified successfully",
        data: {
          type: "success",
          message: "OTP verified successfully",
          mobile: rawPhone
        },
        valid: true
      });
    }

    if (!rawPhone || !enteredOtp) {
      return sendJSON(res, 400, {
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    const cleanDigits = rawPhone.replace(/[^0-9]/g, '');
    const mobileFormatted = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    const session = activeOtpSessions.get(rawPhone) || 
                    (cleanDigits && activeOtpSessions.get(cleanDigits)) || 
                    (mobileFormatted && activeOtpSessions.get(mobileFormatted));

    if (session && session.otp === enteredOtp) {
      return sendJSON(res, 200, {
        success: true,
        message: "OTP verified successfully",
        data: {
          type: "success",
          message: "OTP verified successfully",
          mobile: mobileFormatted || rawPhone
        },
        valid: true
      });
    }

    return sendJSON(res, 400, {
      success: false,
      message: "Invalid or expired OTP"
    });
  }

  // 0.3 Resident User Login (POST /api/users/login)
  if (method === 'POST' && pathname === '/api/users/login') {
    const body = await getRequestBody(req);
    const email = body.email ? body.email.trim().toLowerCase() : '';
    const phone = body.phone || body.identifier ? (body.phone || body.identifier).trim() : '';
    let user = users.find(u => (email && u.email.toLowerCase() === email) || (phone && u.phone === phone));

    if (!user) {
      return sendJSON(res, 404, { error: "No account found with these credentials. The account may have been deleted or not registered. Please register first." });
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
    saveDB();
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
      saveDB();
    }
    return sendJSON(res, 200, { message: "User profile updated successfully", user });
  }

  if (method === 'DELETE' && pathname.startsWith('/api/users/')) {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: "Unauthorized: Missing or invalid access token" });
    }

    const sub = pathname.split('/')[3] || 'profile';
    let index = -1;

    if (sub === 'profile' || sub === 'me') {
      index = users.length > 0 ? users.length - 1 : -1;
    } else {
      index = users.findIndex(u => String(u.user_id) === String(sub) || String(u.phone) === String(sub) || String(u.email).toLowerCase() === String(sub).toLowerCase());
    }

    if (index === -1 && users.length > 0) {
      index = 0;
    }

    if (index === -1) {
      return sendJSON(res, 404, { success: false, error: "User account not found" });
    }

    const userObj = users[index];
    const userName = userObj ? (userObj.name || 'Resident User') : 'Resident User';
    const targetUserId = userObj ? userObj.user_id : (sub !== 'profile' && sub !== 'me' ? sub : 'usr_379378');

    users.splice(index, 1);

    for (let i = orders.length - 1; i >= 0; i--) {
      if (String(orders[i].user_id) === String(targetUserId)) {
        orders.splice(i, 1);
      }
    }
    saveDB();

    return sendJSON(res, 200, {
      success: true,
      message: `User account for "${userName}" (ID: ${targetUserId}) deleted successfully.`,
      user_id: targetUserId
    });
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
    saveDB();
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
    saveDB();
    return sendJSON(res, 201, { message: "Society created successfully", society_id: numericId, society: newSociety });
  }

  if (method === 'GET' && pathname === '/api/societies') {
    const q = parsedUrl.query.search ? parsedUrl.query.search.toLowerCase() : '';
    const filtered = q ? societies.filter(s => s.society_name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)) : societies;
    
    if (parsedUrl.query.page || parsedUrl.query.limit) {
      const page = parseInt(parsedUrl.query.page || '1', 10);
      const limit = parseInt(parsedUrl.query.limit || '25', 10);
      const totalRecords = filtered.length;
      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return sendJSON(res, 200, {
        success: true,
        data: paginated,
        meta: {
          total_records: totalRecords,
          total_pages: totalPages,
          current_page: page,
          page_size: limit,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      });
    }

    return sendJSON(res, 200, filtered);
  }

  if (method === 'GET' && pathname.startsWith('/api/societies/')) {
    const parts = pathname.split('/');
    const rawSocParam = parts[3];
    const isVendors = parts[4] === 'vendors';

    if (isVendors) {
      const q = parsedUrl.query.search ? parsedUrl.query.search.toLowerCase() : '';
      const list = vendors.filter(v => {
        if (!v) return false;
        if (rawSocParam === 'all') return true;

        const vSocStr = String(v.society_id || '').toLowerCase().trim();
        const tSocStr = String(rawSocParam || '').toLowerCase().trim();

        if (vSocStr === tSocStr) return true;

        const vClean = vSocStr.replace('soc-', '');
        const tClean = tSocStr.replace('soc-', '');

        if (vClean && tClean && vClean === tClean) return true;
        if ((vClean === '1' || vClean === '101') && (tClean === '1' || tClean === '101')) return true;
        if ((vClean === '2' || vClean === '102') && (tClean === '2' || tClean === '102')) return true;
        if ((vClean === '3' || vClean === '103') && (tClean === '3' || tClean === '103')) return true;
        if ((vClean === '4' || vClean === '104') && (tClean === '4' || tClean === '104')) return true;
        if ((vClean === '5' || vClean === '105') && (tClean === '5' || tClean === '105')) return true;
        if ((vClean === '6' || vClean === '106') && (tClean === '6' || tClean === '106')) return true;

        if (v.society_name) {
          const matchedSoc = societies.find(s => String(s.society_id).toLowerCase() === tSocStr || String(s.society_id).replace('SOC-', '').toLowerCase() === tClean);
          if (matchedSoc && matchedSoc.society_name.toLowerCase() === v.society_name.toLowerCase()) return true;
        }
        return false;
      });
      const filtered = q ? list.filter(v => (v.store_name || '').toLowerCase().includes(q) || (v.category || '').toLowerCase().includes(q)) : list;
      
      if (parsedUrl.query.page || parsedUrl.query.limit) {
        const page = parseInt(parsedUrl.query.page || '1', 10);
        const limit = parseInt(parsedUrl.query.limit || '25', 10);
        const totalRecords = filtered.length;
        const totalPages = Math.ceil(totalRecords / limit) || 1;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);

        return sendJSON(res, 200, {
          success: true,
          data: paginated,
          meta: {
            total_records: totalRecords,
            total_pages: totalPages,
            current_page: page,
            page_size: limit,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        });
      }

      return sendJSON(res, 200, filtered);
    } else {
      const cleanTargetSoc = String(rawSocParam).replace('SOC-', '').toLowerCase();
      const soc = societies.find(s => String(s.society_id).toLowerCase() === String(rawSocParam).toLowerCase() || String(s.society_id).replace('SOC-', '').toLowerCase() === cleanTargetSoc);
      if (!soc) return sendJSON(res, 404, { error: "Society not found" });
      return sendJSON(res, 200, soc);
    }
  }

  if (method === 'DELETE' && (pathname.startsWith('/api/vendors/') || pathname.startsWith('/api/vendorPanel/'))) {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { success: false, error: "Unauthorized: Token missing or invalid" });
    }

    const targetVendorId = pathname.split('/')[3];
    const index = vendors.findIndex(v => String(v.vendor_id) === String(targetVendorId) || String(v.vendor_id).replace('SOC-', '') === String(targetVendorId));
    if (index === -1) {
      return sendJSON(res, 404, { success: false, error: "Vendor store ID not found" });
    }

    const storeObj = vendors[index];
    const storeTitle = storeObj ? (storeObj.store_name || storeObj.vendor_name || 'Vendor Store') : 'Vendor Store';
    vendors.splice(index, 1);

    for (let i = items.length - 1; i >= 0; i--) {
      if (String(items[i].vendor_id) === String(targetVendorId)) {
        items.splice(i, 1);
      }
    }
    saveDB();

    return sendJSON(res, 200, {
      success: true,
      message: `Vendor store "${storeTitle}" (ID: ${targetVendorId}) and associated items deleted successfully.`,
      vendor_id: Number(targetVendorId) || targetVendorId
    });
  }

  if (method === 'GET' && pathname.startsWith('/api/vendors/')) {
    const targetVendorId = pathname.split('/')[3];
    const vendor = vendors.find(v => String(v.vendor_id) === String(targetVendorId));
    if (!vendor) return sendJSON(res, 404, { error: "Vendor store not found or has been deleted" });
    const vendorItems = items.filter(i => String(i.vendor_id) === String(targetVendorId));
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

  if (method === 'GET' && pathname === '/api/orders') {
    const qPhone = parsedUrl.query.phone || parsedUrl.query.phone_number || parsedUrl.query.mobile;
    const qUser = parsedUrl.query.user_id || parsedUrl.query.userId;
    let filtered = orders;

    if (qPhone) {
      const cleanPhone = String(qPhone).replace(/[^0-9]/g, '');
      filtered = filtered.filter(o => {
        const oPhone = String(o.phone_number || o.phone || '').replace(/[^0-9]/g, '');
        return oPhone && (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone));
      });
    }

    if (qUser) {
      filtered = filtered.filter(o => String(o.user_id) === String(qUser));
    }

    return sendJSON(res, 200, { success: true, count: filtered.length, orders: filtered });
  }

  if (method === 'GET' && pathname.startsWith('/api/users/') && pathname.endsWith('/orders')) {
    const parts = pathname.split('/');
    const targetUser = parts[3]; // e.g. usr_123 or 9784319840
    const cleanPhone = String(targetUser).replace(/[^0-9]/g, '');

    const userOrders = orders.filter(o => {
      if (String(o.user_id) === String(targetUser)) return true;
      const oPhone = String(o.phone_number || o.phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone && cleanPhone.length >= 7 && oPhone && (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone))) return true;
      return false;
    });

    return sendJSON(res, 200, { success: true, count: userOrders.length, orders: userOrders });
  }

  if (method === 'GET' && pathname.startsWith('/api/orders/')) {
    const orderId = pathname.split('/')[3];
    const order = orders.find(o => String(o.order_id) === String(orderId) || String(o.order_id).replace('ORD-', '') === String(orderId).replace('ORD-', ''));
    if (!order) return sendJSON(res, 404, { error: "Order not found" });
    return sendJSON(res, 200, { order, items: order.items });
  }

  if (method === 'PUT' && pathname.includes('/status')) {
    const parts = pathname.split('/');
    const orderId = parts[3];
    const body = await getRequestBody(req);
    const order = orders.find(o => String(o.order_id) === String(orderId) || String(o.order_id).replace('ORD-', '') === String(orderId).replace('ORD-', ''));
    if (order) {
      order.status = body.status || 'ACCEPTED';
      return sendJSON(res, 200, { message: 'Order status updated successfully', order_id: orderId, status: order.status, order });
    }
    return sendJSON(res, 200, { message: 'Order status updated', order_id: orderId, status: body.status || 'ACCEPTED' });
  }

  // 4. VENDOR DASHBOARD & CATALOG APIs
  if (method === 'GET' && pathname.startsWith('/api/vendorPanel/')) {
    const parts = pathname.split('/');
    const rawVendorId = parts[3];
    const vendorId = Number(rawVendorId) || rawVendorId;
    const vendor = vendors.find(v => String(v.vendor_id) === String(vendorId)) || vendors[0];
    const vendorItems = items.filter(i => String(i.vendor_id) === String(vendorId) || String(vendorId) === '1');
    const vendorOrders = orders.filter(o => String(o.vendor_id) === String(vendorId) || String(o.vendorId) === String(vendorId));
    return sendJSON(res, 200, {
      vendor,
      items: vendorItems,
      orders: vendorOrders,
      subscription: { status: "ACTIVE", end_date: "2027-07-31" },
      payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }]
    });
  }

  // 5. GLOBAL CONFIG & MAINTENANCE APIs
  if (method === 'GET' && (pathname === '/config' || pathname === '/api/config' || pathname === '/api/admin/config')) {
    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Platform configuration loaded successfully",
      data: platformConfig
    });
  }

  if (method === 'PUT' && (pathname === '/config' || pathname === '/api/config')) {
    const body = await getRequestBody(req);
    platformConfig = { ...platformConfig, ...body };
    saveDB();
    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Platform configuration updated successfully",
      data: platformConfig
    });
  }

  // 6. SUPPORT DESK INTAKE & TICKET WORKFLOW APIs
  if (method === 'POST' && (pathname === '/support/tickets' || pathname === '/api/support/tickets')) {
    const body = await getRequestBody(req);
    if (!body.subject || !body.description || !body.reporter_name) {
      return sendJSON(res, 400, { success: false, status_code: 400, error: "Missing required fields: subject, description, and reporter_name" });
    }
    const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket = {
      ticket_id: ticketId,
      user_type: body.user_type || "user",
      source: body.source || "user_app",
      reporter_name: body.reporter_name,
      reporter_email: body.reporter_email || "",
      reporter_phone: body.reporter_phone || "",
      entity_name: body.entity_name || "",
      order_id: body.order_id || "",
      subject: body.subject,
      description: body.description,
      category: body.category || "general",
      priority: body.priority || "low",
      status: "OPEN",
      sla_minutes: 2880,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          message_id: `MSG-${Date.now()}`,
          sender_role: body.user_type || "user",
          sender_name: body.reporter_name,
          content: body.description,
          created_at: new Date().toISOString()
        }
      ]
    };
    tickets.unshift(newTicket);
    saveDB();
    return sendJSON(res, 201, {
      success: true,
      status_code: 201,
      message: "Support ticket created successfully",
      data: newTicket
    });
  }

  if (method === 'GET' && (pathname === '/support/tickets' || pathname === '/api/support/tickets')) {
    const userType = parsedUrl.query.user_type;
    const email = parsedUrl.query.email ? parsedUrl.query.email.toLowerCase() : '';
    const status = parsedUrl.query.status;

    let filtered = [...tickets];
    if (userType) filtered = filtered.filter(t => t.user_type === userType);
    if (email) filtered = filtered.filter(t => t.reporter_email && t.reporter_email.toLowerCase() === email);
    if (status) filtered = filtered.filter(t => t.status === status);

    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Support tickets retrieved successfully",
      data: filtered,
      meta: { total_records: filtered.length }
    });
  }

  if (method === 'GET' && (pathname.includes('/support/tickets/') && pathname.endsWith('/messages'))) {
    const parts = pathname.split('/');
    const ticketId = parts[parts.indexOf('tickets') + 1];
    const ticket = tickets.find(t => String(t.ticket_id) === String(ticketId));
    if (!ticket) {
      return sendJSON(res, 404, { success: false, status_code: 404, error: "RESOURCE_NOT_FOUND", message: "Support ticket not found" });
    }
    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Ticket thread retrieved successfully",
      data: {
        ticket_id: ticket.ticket_id,
        subject: ticket.subject,
        status: ticket.status,
        messages: ticket.messages || []
      }
    });
  }

  if (method === 'POST' && (pathname.includes('/support/tickets/') && pathname.endsWith('/reply'))) {
    const parts = pathname.split('/');
    const ticketId = parts[parts.indexOf('tickets') + 1];
    const body = await getRequestBody(req);
    const ticket = tickets.find(t => String(t.ticket_id) === String(ticketId));
    if (!ticket) {
      return sendJSON(res, 404, { success: false, status_code: 404, error: "RESOURCE_NOT_FOUND", message: "Support ticket not found" });
    }
    const newMsg = {
      message_id: `MSG-${Date.now()}`,
      sender_role: body.sender_role || "user",
      sender_name: body.sender_name || ticket.reporter_name || "Applicant",
      content: body.content || "",
      created_at: new Date().toISOString()
    };
    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push(newMsg);
    if (body.sender_role === 'admin') {
      ticket.status = 'IN_PROGRESS';
    }
    ticket.updated_at = new Date().toISOString();
    saveDB();
    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Reply posted successfully",
      data: newMsg
    });
  }

  if (method === 'POST' && (pathname.includes('/support/tickets/') && pathname.endsWith('/escalate'))) {
    const parts = pathname.split('/');
    const ticketId = parts[parts.indexOf('tickets') + 1];
    const ticket = tickets.find(t => String(t.ticket_id) === String(ticketId));
    if (!ticket) {
      return sendJSON(res, 404, { success: false, status_code: 404, error: "RESOURCE_NOT_FOUND", message: "Support ticket not found" });
    }
    if (ticket.priority === 'urgent') {
      return sendJSON(res, 422, {
        success: false,
        status_code: 422,
        error: "BUSINESS_RULE_BREACH",
        message: "Ticket is already at maximum URGENT priority level and cannot be escalated further."
      });
    }
    ticket.priority = 'urgent';
    ticket.sla_minutes = 120;
    ticket.updated_at = new Date().toISOString();
    saveDB();
    return sendJSON(res, 200, {
      success: true,
      status_code: 200,
      message: "Ticket priority escalated successfully",
      data: {
        ticket_id: ticket.ticket_id,
        priority: ticket.priority,
        sla_minutes: ticket.sla_minutes,
        updated_at: ticket.updated_at
      }
    });
  }

  // Admin APIs
  if (method === 'GET' && pathname === '/api/admin/vendors') {
    return sendJSON(res, 200, vendors.map(v => ({ ...v, payments: [{ payment_id: 1, amount: 2999.00, status: "SUCCESS" }] })));
  }

  // CMS & Support Contacts APIs
  if (method === 'GET' && (pathname === '/api/cms/contacts' || pathname === '/api/contacts' || pathname === '/api/contact-info')) {
    return sendJSON(res, 200, { success: true, data: supportContacts });
  }

  if (method === 'PUT' && pathname === '/api/cms/contacts') {
    const body = await getRequestBody(req);
    supportContacts = { ...supportContacts, ...body, updated_at: new Date().toISOString() };
    saveDB();
    return sendJSON(res, 200, { success: true, message: "Support contact details updated successfully", data: supportContacts });
  }

  if (method === 'GET' && pathname === '/api/cms/pages') {
    const list = Object.values(cmsPages).map(p => ({
      slug: p.slug,
      title: p.title,
      meta_description: p.meta_description,
      updated_at: p.updated_at
    }));
    return sendJSON(res, 200, { success: true, data: list });
  }

  // Individual CMS Page or direct convenience route (e.g. /api/about-us, /api/privacy-policy, /api/terms-conditions, /api/how-it-works, /api/help-support)
  const cmsDirectSlugs = ['about-us', 'privacy-policy', 'terms-conditions', 'terms-and-conditions', 'privacy', 'help-support', 'how-it-works', 'contacts', 'contact-info'];
  let reqSlug = '';
  if (pathname.startsWith('/api/cms/pages/')) {
    reqSlug = pathname.replace('/api/cms/pages/', '').toLowerCase().trim();
  } else if (pathname.startsWith('/api/')) {
    const candidate = pathname.replace('/api/', '').toLowerCase().trim();
    if (cmsDirectSlugs.includes(candidate)) {
      reqSlug = candidate;
    }
  }

  if (reqSlug) {
    let cleanSlug = reqSlug;
    if (cleanSlug === 'terms-and-conditions' || cleanSlug === 'terms') cleanSlug = 'terms-conditions';
    if (cleanSlug === 'privacy') cleanSlug = 'privacy-policy';
    if (cleanSlug === 'help' || cleanSlug === 'faqs' || cleanSlug === 'contact-support') cleanSlug = 'help-support';

    if (method === 'GET') {
      if (cleanSlug === 'contacts' || cleanSlug === 'contact-info') {
        return sendJSON(res, 200, { success: true, data: supportContacts });
      }
      const page = cmsPages[cleanSlug] || defaultCmsPages[cleanSlug] || defaultCmsPages['help-support'];
      return sendJSON(res, 200, { success: true, data: page });
    }

    if (method === 'PUT' && pathname.startsWith('/api/cms/pages/')) {
      const body = await getRequestBody(req);
      const existing = cmsPages[cleanSlug] || defaultCmsPages[cleanSlug] || {};
      cmsPages[cleanSlug] = {
        ...existing,
        slug: cleanSlug,
        title: body.title || existing.title,
        content: body.content || existing.content,
        meta_description: body.meta_description || existing.meta_description,
        updated_at: new Date().toISOString()
      };
      cmsPages[cleanSlug] = cmsPages[cleanSlug];
      saveDB();
      return sendJSON(res, 200, { success: true, message: `CMS Page [${cleanSlug}] updated successfully`, data: cmsPages[cleanSlug] });
    }
  }

  // Default 404
  return sendJSON(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`DigiLocal REST API Server running on port ${PORT}`);
});
