# 📚 DigiLocal Complete API Specification (All Panels)

This document serves as the comprehensive API reference manual for the entire **DigiLocal Ecosystem**. It details all REST API endpoints across **User/Resident Panel**, **Vendor Merchant Panel**, **Admin Control Suite**, **Public Storefront & Societies**, **Support Desk**, and **Platform Observability**.

Each endpoint specifies:
- **Panel / Role Scope**
- **HTTP Method & Path**
- **Idea Behind Using It** (Business logic & architectural rationale)
- **Input Parameters & Request Body Schema**
- **Expected Output JSON Schema** (Success & Error states)

---

## 📑 Table of Contents

1. [User / Resident Panel APIs](#1-user--resident-panel-apis)
2. [Vendor Merchant Panel APIs](#2-vendor-merchant-panel-apis)
3. [Admin Control Suite Panel APIs](#3-admin-control-suite-panel-apis)
4. [Public Storefront & Societies Directory APIs](#4-public-storefront--societies-directory-apis)
5. [Customer Orders & Checkout APIs](#5-customer-orders--checkout-apis)
6. [Support Desk & Ticketing Panel APIs](#6-support-desk--ticketing-panel-apis)
7. [System Observability & Platform Config APIs](#7-system-observability--platform-config-apis)

---

## 1. User / Resident Panel APIs

The Resident Panel enables apartment owners and residents to register, authenticate via SMS OTP or password, manage flat addresses, track order history, and delete profiles.

### 1.1 Send Resident OTP (MSG91)
* **Panel**: Resident Panel / Authentication Modal
* **Endpoint**: `POST /api/otp/send-otp` (or `/api/users/send-otp`)
* **Idea Behind Using It**: Triggers a 6-digit SMS OTP to a resident’s 10-digit mobile number for fast, passwordless authentication.
* **Input Body**:
  ```json
  {
    "phone": "9876543210"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "target": "9876543210",
    "simulationOtp": "849201"
  }
  ```

---

### 1.2 Verify Resident OTP
* **Panel**: Resident Panel / Authentication Modal
* **Endpoint**: `POST /api/otp/verify-otp` (or `/api/users/verify-otp`)
* **Idea Behind Using It**: Validates the mobile number OTP before logging in the user or permitting account registration.
* **Input Body**:
  ```json
  {
    "phone": "9876543210",
    "otp": "849201"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "valid": true
  }
  ```

---

### 1.3 Register Resident Account
* **Panel**: Resident Panel / Registration Page
* **Endpoint**: `POST /api/users/register`
* **Idea Behind Using It**: Onboards a new resident customer linked to their housing society, tower, and flat unit.
* **Input Body**:
  ```json
  {
    "name": "Aarav Gupta",
    "email": "aarav.gupta@gmail.com",
    "phone": "9876543210",
    "society_id": "SOC-101",
    "society_name": "Omaxe Greenwood Residency",
    "flat": "Tower B-204"
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "token": "user_jwt_access_1723891000",
    "accessToken": "user_jwt_access_1723891000",
    "user": {
      "user_id": "usr_381029",
      "name": "Aarav Gupta",
      "email": "aarav.gupta@gmail.com",
      "phone": "9876543210",
      "society_id": "SOC-101",
      "society_name": "Omaxe Greenwood Residency",
      "flat": "Tower B-204",
      "joined_date": "August 2026",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
    }
  }
  ```

---

### 1.4 Resident User Login
* **Panel**: Resident Panel / Login Page
* **Endpoint**: `POST /api/users/login`
* **Idea Behind Using It**: Authenticates returning residents via phone/email and password or OTP.
* **Input Body**:
  ```json
  {
    "identifier": "9876543210",
    "password": "UserPass123!"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "token": "user_jwt_access_1723891000",
    "user": {
      "user_id": "usr_381029",
      "name": "Aarav Gupta",
      "email": "aarav.gupta@gmail.com",
      "phone": "9876543210",
      "society_name": "Omaxe Greenwood Residency",
      "flat": "Tower B-204"
    }
  }
  ```

---

### 1.5 Fetch Resident Order History
* **Panel**: Resident Panel / Profile Page
* **Endpoint**: `GET /api/users/:userId/orders`
* **Idea Behind Using It**: Loads all historical and active orders placed by the resident across all society vendors.
* **Expected Output (200 OK)**:
  ```json
  [
    {
      "order_id": "ORD-984201",
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "total_amount": 308.00,
      "status": "DELIVERED",
      "date": "2026-08-15T10:30:00.000Z"
    }
  ]
  ```

---

### 1.6 Update Resident Profile
* **Panel**: Resident Panel / Profile Settings
* **Endpoint**: `PUT /api/users/:userId`
* **Idea Behind Using It**: Allows updating name, flat number, phone, or avatar image.
* **Input Body**:
  ```json
  {
    "name": "Aarav V. Gupta",
    "flat": "Tower C-501",
    "email": "aarav.updated@gmail.com"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "message": "User profile updated successfully",
    "user": {
      "user_id": "usr_381029",
      "name": "Aarav V. Gupta",
      "flat": "Tower C-501",
      "email": "aarav.updated@gmail.com"
    }
  }
  ```

---

### 1.7 Delete Resident Account
* **Panel**: Resident Panel / Profile Settings
* **Endpoint**: `DELETE /api/users/:userId`
* **Idea Behind Using It**: Permanently wipes user credentials, saved addresses, and active sessions per GDPR privacy rules.
* **Headers**: `Authorization: Bearer <token>`
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User account for \"Aarav Gupta\" (ID: usr_381029) deleted successfully.",
    "user_id": "usr_381029"
  }
  ```

---

## 2. Vendor Merchant Panel APIs

The Vendor Panel enables local store owners (grocers, bakeries, chemists) to register, manage store status (Open/Closed), add product catalog items, process order queues, and view revenue analytics.

### 2.1 Check Vendor Phone Registration
* **Panel**: Vendor Registration Stepper
* **Endpoint**: `POST /api/vendors/check-phone`
* **Idea Behind Using It**: Prevents duplicate vendor registrations by checking mobile number existence prior to step 1.
* **Input Body**:
  ```json
  { "phone": "9876543210" }
  ```
* **Expected Output (200 OK)**:
  ```json
  { "exists": true, "phone": "9876543210", "message": "Vendor account found" }
  ```

---

### 2.2 Vendor Store Registration
* **Panel**: Vendor Registration Stepper
* **Endpoint**: `POST /api/vendors/register`
* **Idea Behind Using It**: Registers a merchant store with GSTIN, business category, address, shop images, and operating hours.
* **Input Body**:
  ```json
  {
    "store_name": "FreshMart Grocery & Organic",
    "vendor_name": "Rajesh Sharma",
    "email": "freshmart@gmail.com",
    "phone_number": "9876543210",
    "society_id": 1,
    "category": "Grocery & Daily Essentials",
    "shop_address": "Shop 4, Greenwood Commercial Market",
    "gst_number": "07AAACR12341Z5",
    "opening_timing": "08:00 AM",
    "closing_timing": "10:00 PM"
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "message": "Vendor registration submitted successfully!",
    "vendor_id": 1,
    "status": "ACTIVE",
    "token": "jwt_vendor_1723891000"
  }
  ```

---

### 2.3 Vendor Login
* **Panel**: Vendor Login Page
* **Endpoint**: `POST /api/vendors/login`
* **Idea Behind Using It**: Authenticates store owners to access their private management dashboard.
* **Input Body**:
  ```json
  {
    "identifier": "freshmart@gmail.com",
    "password": "VendorPass123!"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_vendor_1723891000",
    "vendor": {
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "status": "ACTIVE"
    }
  }
  ```

---

### 2.4 Vendor Dashboard Consolidated Payload
* **Panel**: Vendor Dashboard
* **Endpoint**: `GET /api/vendorPanel/:vendorId`
* **Idea Behind Using It**: Single consolidated payload returning store details, revenue metrics, listed items, active orders, and subscription plan status.
* **Expected Output (200 OK)**:
  ```json
  {
    "vendor": {
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "vendor_name": "Rajesh Sharma",
      "society_name": "Omaxe Greenwood Residency",
      "status": "ACTIVE",
      "is_open": true
    },
    "items": [
      {
        "item_id": 1,
        "item_name": "Farm Fresh Organic Milk (1L)",
        "price": 68,
        "stock": 50,
        "category": "Dairy"
      }
    ],
    "orders": [
      {
        "order_id": "ORD-984201",
        "customer_name": "Aarav Gupta",
        "total_amount": 308.00,
        "status": "PLACED"
      }
    ],
    "subscription": {
      "status": "ACTIVE",
      "end_date": "2027-07-31"
    }
  }
  ```

---

### 2.5 Create Catalog Item
* **Panel**: Vendor Dashboard / Inventory Tab
* **Endpoint**: `POST /api/vendorPanel/:vendorId/items`
* **Idea Behind Using It**: Adds a new product (title, price, stock count, category, image) to the vendor's storefront catalog.
* **Input Body**:
  ```json
  {
    "item_name": "Organic Brown Eggs (6 Pack)",
    "price": 95,
    "stock": 40,
    "category": "Dairy & Eggs",
    "unit": "6 pcs",
    "image_url": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300"
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "message": "Item added successfully",
    "item_id": 108,
    "item": {
      "item_id": 108,
      "item_name": "Organic Brown Eggs (6 Pack)",
      "price": 95
    }
  }
  ```

---

### 2.6 Toggle Store Status (Open / Closed)
* **Panel**: Vendor Dashboard Top Header
* **Endpoint**: `PUT /api/vendorPanel/:vendorId/store-status`
* **Idea Behind Using It**: Allows store owner to toggle store availability status dynamically.
* **Input Body**:
  ```json
  {
    "is_open": false,
    "status": "CLOSED"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "message": "Store status updated to CLOSED",
    "is_open": false
  }
  ```

---

## 3. Admin Control Suite Panel APIs

The Admin Suite enables super-admins to oversee system metrics, approve or suspend vendor applications, manage housing societies, configure CMS pages, and resolve global support tickets.

### 3.1 Get System-Wide Platform Analytics
* **Panel**: Admin Dashboard / Analytics Overview
* **Endpoint**: `GET /api/admin/metrics`
* **Idea Behind Using It**: Returns top-level platform statistics: gross merchandise value (GMV), total active societies, total registered vendors, pending vendor applications, and open support tickets.
* **Expected Output (200 OK)**:
  ```json
  {
    "total_gmv": 142850.00,
    "active_societies_count": 6,
    "active_vendors_count": 17,
    "pending_vendor_applications": 2,
    "open_support_tickets": 3
  }
  ```

---

### 3.2 List All Vendor Applications & Status
* **Panel**: Admin Dashboard / Vendors Management Tab
* **Endpoint**: `GET /api/admin/vendors`
* **Idea Behind Using It**: Retrieves all registered vendor stores along with their approval status (`PENDING`, `ACTIVE`, `SUSPENDED`).
* **Expected Output (200 OK)**:
  ```json
  [
    {
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "vendor_name": "Rajesh Sharma",
      "society_name": "Omaxe Greenwood Residency",
      "status": "ACTIVE",
      "gst_number": "07AAACR12341Z5"
    }
  ]
  ```

---

### 3.3 Approve or Suspend Vendor Store
* **Panel**: Admin Dashboard / Vendors Management Tab
* **Endpoint**: `PUT /api/admin/vendors/:vendorId/status`
* **Idea Behind Using It**: Allows Admin to approve pending store applications or suspend stores violating platform terms.
* **Input Body**:
  ```json
  {
    "status": "ACTIVE",
    "admin_notes": "GST verified successfully"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "message": "Vendor status updated to ACTIVE",
    "vendor_id": 1,
    "status": "ACTIVE"
  }
  ```

---

### 3.4 Manage Housing Societies
* **Panel**: Admin Dashboard / Societies Tab
* **Endpoint**: `POST /api/admin/societies` (or `PUT /api/admin/societies/:societyId`)
* **Idea Behind Using It**: Allows super-admins to officially onboard or edit gated residential societies.
* **Input Body**:
  ```json
  {
    "society_name": "Jaypee Greens Wish Town",
    "location": "Sector 128, Noida",
    "pincode": "201304",
    "total_flats": 850,
    "image_url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "message": "Society added successfully",
    "society_id": "SOC-105"
  }
  ```

---

### 3.5 CMS Static Page Content Editor
* **Panel**: Admin Dashboard / CMS Content Tab
* **Endpoint**: `PUT /api/admin/cms/:slug`
* **Idea Behind Using It**: Enables live editing of static information pages (Privacy Policy, Refund Policy, Help & Support, Terms & Conditions).
* **Input Body**:
  ```json
  {
    "title": "Privacy Policy",
    "content": "# DigiLocal Updated Privacy Policy\n\nEffective August 2026...",
    "phone": "+91 800-562-5999",
    "email": "support@digilocal.in"
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "message": "CMS page content updated successfully",
    "slug": "privacy-policy"
  }
  ```

---

## 4. Public Storefront & Societies Directory APIs

Public endpoints consumed by guest visitors and residents browsing stores.

### 4.1 Search & List Housing Societies
* **Endpoint**: `GET /api/societies?search=:query`
* **Idea Behind Using It**: Powers autocomplete search and society card grid.
* **Expected Output (200 OK)**:
  ```json
  [
    {
      "society_id": "SOC-101",
      "society_name": "Omaxe Greenwood Residency",
      "location": "Sector Greenwood, Omega II, Greater Noida",
      "pincode": "201310",
      "vendor_count": 14
    }
  ]
  ```

---

### 4.2 List Society Vendors
* **Endpoint**: `GET /api/societies/:societyId/vendors?search=:query`
* **Idea Behind Using It**: Primary endpoint for **Society Vendors Directory** (`:societyId = all` lists all vendors across all societies).
* **Expected Output (200 OK)**:
  ```json
  [
    {
      "vendor_id": 1,
      "society_id": "SOC-101",
      "store_name": "FreshMart Grocery & Organic",
      "vendor_name": "Rajesh Sharma",
      "category": "Grocery & Daily Essentials",
      "phone_number": "9876543210",
      "status": "ACTIVE",
      "opening_timing": "08:00 AM",
      "closing_timing": "10:00 PM",
      "society_name": "Omaxe Greenwood Residency",
      "logo": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
    }
  ]
  ```

---

### 4.3 Get Single Vendor Storefront & Items
* **Endpoint**: `GET /api/vendors/:vendorId`
* **Idea Behind Using It**: Fetches vendor store profile, banner, timings, and item catalog for public shopping.
* **Expected Output (200 OK)**:
  ```json
  {
    "vendor": {
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "vendor_name": "Rajesh Sharma",
      "phone_number": "9876543210"
    },
    "items": [
      {
        "item_id": 1,
        "item_name": "Farm Fresh Organic Milk (1L)",
        "price": 68,
        "stock": 50,
        "category": "Dairy"
      }
    ]
  }
  ```

---

## 5. Customer Orders & Checkout APIs

### 5.1 Place Resident Order
* **Endpoint**: `POST /api/orders`
* **Idea Behind Using It**: Places customer order for instant doorstep delivery or WhatsApp dispatch.
* **Input Body**:
  ```json
  {
    "vendor_id": 1,
    "user_id": "usr_381029",
    "customer_name": "Aarav Gupta",
    "phone_number": "9876543210",
    "address": "Tower B, Flat 204, Omaxe Greenwood Residency",
    "payment_method": "UPI",
    "items": [
      {
        "item_id": 1,
        "item_name": "Farm Fresh Organic Milk (1L)",
        "quantity": 2,
        "unit_price": 68.00
      }
    ]
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "message": "Order placed successfully",
    "order_id": "ORD-984201",
    "total_amount": 136.00,
    "status": "PLACED"
  }
  ```

---

### 5.2 Get Order Tracking Info
* **Endpoint**: `GET /api/orders/:orderId`
* **Idea Behind Using It**: Powers live order tracking toasts and receipt pages.
* **Expected Output (200 OK)**:
  ```json
  {
    "order": {
      "order_id": "ORD-984201",
      "store_name": "FreshMart Grocery & Organic",
      "status": "ACCEPTED",
      "total_amount": 136.00,
      "date": "2026-08-17T12:00:00.000Z"
    },
    "items": [
      {
        "item_name": "Farm Fresh Organic Milk (1L)",
        "quantity": 2,
        "unit_price": 68.00
      }
    ]
  }
  ```

---

### 5.3 Update Order Fulfillment Status
* **Endpoint**: `PUT /api/orders/:orderId/status`
* **Idea Behind Using It**: Updates order status (`PLACED` ➔ `ACCEPTED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
* **Input Body**:
  ```json
  { "status": "OUT_FOR_DELIVERY" }
  ```
* **Expected Output (200 OK)**:
  ```json
  { "message": "Order status updated successfully", "order_id": "ORD-984201", "status": "OUT_FOR_DELIVERY" }
  ```

---

## 6. Support Desk & Ticketing Panel APIs

APIs powering customer support, vendor helpdesk, and admin ticket resolution.

### 6.1 Create Support Ticket
* **Endpoint**: `POST /api/support/tickets`
* **Idea Behind Using It**: Allows users/vendors to file support tickets for order issues, billing, or general queries.
* **Input Body**:
  ```json
  {
    "user_type": "user",
    "reporter_name": "Aarav Gupta",
    "reporter_email": "aarav.gupta@gmail.com",
    "order_id": "ORD-984201",
    "subject": "Delayed Order Refund for ORD-984201",
    "description": "Order #ORD-984201 was canceled but refund not received.",
    "category": "billing",
    "priority": "medium"
  }
  ```
* **Expected Output (201 Created)**:
  ```json
  {
    "success": true,
    "status_code": 201,
    "message": "Support ticket created successfully",
    "data": {
      "ticket_id": "TCK-381260",
      "status": "OPEN"
    }
  }
  ```

---

### 6.2 Fetch Tickets List
* **Endpoint**: `GET /api/support/tickets?user_type=:type&email=:email`
* **Idea Behind Using It**: Lists active tickets filed by a specific resident or vendor.
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "ticket_id": "TCK-381260",
        "subject": "Delayed Order Refund for ORD-984201",
        "status": "OPEN",
        "created_at": "2026-08-17T10:53:26.925Z"
      }
    ]
  }
  ```

---

### 6.3 Fetch Ticket Thread Messages
* **Endpoint**: `GET /api/support/tickets/:ticketId/messages`
* **Idea Behind Using It**: Loads the full multi-turn conversation thread inside the Support Desk modal.
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "ticket_id": "TCK-381260",
      "subject": "Delayed Order Refund for ORD-984201",
      "status": "OPEN",
      "messages": [
        {
          "message_id": "MSG-1786532006927",
          "sender_role": "user",
          "sender_name": "Aarav Gupta",
          "content": "Order #ORD-984201 was canceled but refund not received.",
          "created_at": "2026-08-17T10:53:26.927Z"
        }
      ]
    }
  }
  ```

---

### 6.4 Reply to Support Ticket
* **Endpoint**: `POST /api/support/tickets/:ticketId/reply`
* **Idea Behind Using It**: Appends a reply message from the resident, vendor, or official Admin agent.
* **Input Body**:
  ```json
  {
    "sender_role": "admin",
    "sender_name": "DigiLocal Support Team",
    "content": "We have processed the refund to your UPI account. Transaction Ref: TXN-90281."
  }
  ```
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Reply posted successfully",
    "data": {
      "message_id": "MSG-1786539991200",
      "sender_role": "admin",
      "content": "We have processed the refund to your UPI account..."
    }
  }
  ```

---

## 7. System Observability & Platform Config APIs

### 7.1 Server Health Status Check
* **Endpoint**: `GET /health`
* **Idea Behind Using It**: Used by cloud load balancers and deployment monitoring scripts to check server health, version, and process uptime.
* **Expected Output (200 OK)**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-08-17T12:10:00.000Z",
    "version": "1.0.0",
    "uptimeSeconds": 4820,
    "environment": "development"
  }
  ```

---

### 7.2 Get Global Platform Config & Maintenance Mode
* **Endpoint**: `GET /api/config`
* **Idea Behind Using It**: Loaded on app boot to evaluate platform maintenance status, support phone numbers, default currency, and max file upload sizes.
* **Expected Output (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Platform configuration loaded successfully",
    "data": {
      "platform_name": "DigiLocal",
      "maintenance_mode": false,
      "support_email": "support@digilocal.in",
      "support_phone": "+91 1800 123 4567",
      "default_currency": "INR",
      "timezone": "Asia/Kolkata"
    }
  }
  ```
