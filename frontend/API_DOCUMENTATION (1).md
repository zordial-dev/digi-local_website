# 📚 DigiLocal Platform Complete & Comprehensive API Documentation

An exhaustive, production-grade API Reference Manual covering every RESTful endpoint, path parameter, query parameter, request body (`req.body`), header requirement, status code, error case, and JSON response payload in the **DigiLocal Backend Ecosystem**.

---

## 📑 Table of Contents

1. [Global API Architecture & Overview](#1-global-api-architecture--overview)
2. [Security & Authentication Protocols](#2-security--authentication-protocols)
3. [Vendor Authentication & Account Management APIs](#3-vendor-authentication--account-management-apis)
4. [Societies & Public Storefront Directory APIs](#4-societies--public-storefront-directory-apis)
5. [Customer Orders APIs](#5-customer-orders-apis)
6. [Vendor Dashboard & Catalog Management APIs](#6-vendor-dashboard--catalog-management-apis)
7. [Admin Portal & Platform Control APIs](#7-admin-portal--platform-control-apis)
8. [Health, Observability & Probe APIs](#8-health-observability--probe-apis)
9. [Interactive Documentation & Specification APIs](#9-interactive-documentation--specification-apis)

---

## 1. Global API Architecture & Overview

### Base URLs & Environment
- **Development Local**: `http://localhost:5001`
- **Network Interface**: `http://0.0.0.0:5001`
- **Master API Prefix**: `/api` (e.g., `http://localhost:5001/api/vendors/login`)
- **Backward Compatibility Aliases**: Legacy routes such as `/registerVender`, `/venderPanel/:venderId`, and `/shop/:vendorId` are mapped automatically to standard `/api/*` endpoints.

### Standard Request & Response Format
- **Content Type**: `application/json` (Must set `Content-Type: application/json` for POST/PUT/PATCH requests).
- **Date/Time Standard**: ISO 8601 Strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Currency Standard**: Numeric decimals (e.g. `2999.00`, `68.00`).
- **Global Error Envelope**: All API error responses return a uniform JSON format:
  ```json
  {
    "error": "Human-readable description of error",
    "details": [],
    "requestId": "req-uuid-12345"
  }
  ```

---

## 2. Security & Authentication Protocols

### Security Headers (OWASP Compliant)
Every response automatically includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Authentication Types
1. **Bearer Token Authentication**:
   - Header: `Authorization: Bearer <jwt_access_token>`
   - Fallbacks: `x-access-token` header, `?token=` query param, or `req.body.token`.
2. **Brute-Force Guard**:
   - `/api/vendors/login` enforces a max of 5 failed attempts per email/IP. Exceeding triggers a temporary 15-minute lock (`429 Too Many Requests`).
3. **IDOR & Role Guards**:
   - Roles supported: `admin`, `vendor`.
   - `requireVendorOwner` ensures vendors can only access/modify their own store resources (`vendor_id` match).

---

## 3. Vendor Authentication & Account Management APIs

### 3.1 Register New Vendor
- **Endpoint**: `POST /api/vendors/register` *(Legacy Alias: `POST /registerVender`)*
- **Auth Required**: Public
- **Request Headers**: `Content-Type: application/json`
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description / Constraints |
  | :--- | :--- | :--- | :--- |
  | `society_id` | Integer | Yes | ID of society where vendor operates |
  | `vendor_name` | String | Yes | Full name of the vendor owner |
  | `email` | String | Yes | Valid email address (Unique constraint) |
  | `password` | String | Yes | Account password (min 6 characters) |
  | `store_name` | String | Yes | Commercial store name |
  | `phone_number`| String | No | 10-15 digit phone number |
  | `gst_number` | String | No | Official GST Identification Number |
  | `payment_method`| String| No | Payment method (e.g. `Razorpay (UPI)`, `Bank Transfer`) |
  | `transaction_id`| String| No | Payment Txn Ref (auto-generated if omitted) |

- **Possible Cases & Responses**:
  - `201 Created`: Vendor registered successfully & initial payment record created.
    ```json
    {
      "message": "Vendor registration & payment submitted successfully!",
      "vendor_id": 1,
      "vendor": {
        "vendor_id": 1,
        "society_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "email": "freshmart@gmail.com",
        "logo": "https://images.unsplash.com/photo-1534723452862-4c874018d66d...",
        "description": "Welcome to FreshMart Grocery & Organic! Sourced with quality for DigiLocal residents.",
        "status": "PENDING"
      },
      "status": "PENDING",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - `400 Bad Request`: Missing fields, invalid email format, password too short, or duplicate email.
    ```json
    {
      "error": "An account with this email address already exists"
    }
    ```
  - `500 Internal Server Error`: Database insertion failure.

---

### 3.2 Vendor Login
- **Endpoint**: `POST /api/vendors/login`
- **Auth Required**: Public (Protected by Brute-Force Guard)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Registered vendor email |
  | `password` | String | Yes | Account password |

- **Possible Cases & Responses**:
  - `200 OK`: Login successful. Returns vendor payload and access/refresh tokens.
    ```json
    {
      "message": "Login successful",
      "vendor": {
        "vendor_id": 1,
        "society_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "email": "freshmart@gmail.com",
        "status": "ACTIVE"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - `401 Unauthorized`: Email not found or invalid password.
    ```json
    {
      "error": "Invalid email or password"
    }
    ```
  - `403 Forbidden`: Vendor application was rejected by Admin.
    ```json
    {
      "error": "Access Denied: Your vendor application was rejected by DigiLocal Admin.",
      "status": "REJECTED"
    }
    ```
  - `429 Too Many Requests`: Account locked after 5 consecutive failed attempts.
    ```json
    {
      "error": "Account temporarily locked due to repeated failed login attempts. Please try again in 15 minute(s).",
      "isLocked": true
    }
    ```
  - `500 Internal Server Error`: DB error during authentication.

---

### 3.3 Refresh Access Token
- **Endpoint**: `POST /api/vendors/refresh`
- **Auth Required**: Public (Requires valid Refresh Token)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `refreshToken` | String | Yes | Valid non-expired Refresh JWT |

- **Possible Cases & Responses**:
  - `200 OK`: New access token generated.
    ```json
    {
      "message": "Access token refreshed successfully",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - `400 Bad Request`: Missing refresh token parameter.
    ```json
    {
      "error": "Refresh token is required"
    }
    ```
  - `401 Unauthorized`: Expired, forged, or invalid refresh token.
    ```json
    {
      "error": "Invalid or expired refresh token"
    }
    ```

---

### 3.4 Vendor Logout
- **Endpoint**: `POST /api/vendors/logout`
- **Auth Required**: Optional (Token provided in header or body)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Input Parameters (`req.body`)**: `{ "refreshToken": "..." }` (Optional)
- **Possible Cases & Responses**:
  - `200 OK`: Token added to internal revocation registry.
    ```json
    {
      "message": "Logout successful, tokens revoked"
    }
    ```

---

### 3.5 Request Password Reset OTP
- **Endpoint**: `POST /api/vendors/forgot-password`
- **Auth Required**: Public
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Registered vendor email |

- **Possible Cases & Responses**:
  - `200 OK`: OTP generated (Includes `simulationOtp` in non-production environments).
    ```json
    {
      "message": "OTP sent successfully to registered email address",
      "simulationOtp": "849201"
    }
    ```
  - `400 Bad Request`: Invalid email format.
  - `500 Internal Server Error`: Mailer/OTP generation failure.

---

### 3.6 Verify Password Reset OTP
- **Endpoint**: `POST /api/vendors/verify-otp`
- **Auth Required**: Public
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Vendor email address |
  | `otp` | String | Yes | 6-digit OTP code |

- **Possible Cases & Responses**:
  - `200 OK`: OTP matches and is within 10-minute validity window.
    ```json
    {
      "message": "OTP verified successfully. You may now reset your password."
    }
    ```
  - `400 Bad Request`: OTP mismatch, expired, or invalid parameters.
    ```json
    {
      "error": "Invalid or expired OTP"
    }
    ```

---

### 3.7 Reset Password
- **Endpoint**: `POST /api/vendors/reset-password`
- **Auth Required**: Public
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Registered vendor email |
  | `otp` | String | Yes | Verified 6-digit OTP |
  | `newPassword` | String | Yes | New password (min 6 chars) |

- **Possible Cases & Responses**:
  - `200 OK`: Password updated and failed attempt counter cleared.
    ```json
    {
      "message": "Password reset successfully! You can now log in with your new password."
    }
    ```
  - `400 Bad Request`: OTP validation failed or new password invalid.
  - `500 Internal Server Error`: DB update failure.

---

## 4. Societies & Public Storefront Directory APIs

### 4.1 Search & List All Societies
- **Endpoint**: `GET /api/societies`
- **Auth Required**: Public (Cached with 30-Second TTL)
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `search` | String | No | Search query matching society name, location, or store/vendor names |

- **Possible Cases & Responses**:
  - `200 OK`: List of matching societies with active vendor counts and matched shop names.
    ```json
    [
      {
        "society_id": 1,
        "society_name": "Greenwood Residency",
        "location": "Block A, Sector 62, Noida",
        "public_id": "GW4K2",
        "vendor_count": 2,
        "matched_shops": ["FreshMart Grocery & Organic", "Quality Dairy"]
      }
    ]
    ```
  - `500 Internal Server Error`: Database fetch error.

---

### 4.2 Get Single Society Details
- **Endpoint**: `GET /api/societies/:societyId`
- **Auth Required**: Public
- **Path Parameters**: `societyId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Society object details.
    ```json
    {
      "society_id": 1,
      "society_name": "Greenwood Residency",
      "location": "Block A, Sector 62, Noida",
      "public_id": "GW4K2"
    }
    ```
  - `404 Not Found`: Society ID does not exist.
    ```json
    {
      "error": "Society not found"
    }
    ```
  - `500 Internal Server Error`: DB query failed.

---

### 4.3 Add New Society (Admin Only)
- **Endpoint**: `POST /api/societies`
- **Auth Required**: Bearer Token (`admin` Role)
- **Headers**: `Authorization: Bearer <admin_access_token>`
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `society_name` | String | Yes | Full name of the residential society |
  | `location` | String | Yes | Geographic location/address |

- **Possible Cases & Responses**:
  - `201 Created`: Society added and society cache cleared.
    ```json
    {
      "message": "Society created successfully",
      "society_id": 4
    }
    ```
  - `400 Bad Request`: Missing name or location.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Authenticated user is not an admin.
  - `500 Internal Server Error`: DB insertion failure.

---

### 4.4 List Active Vendors in a Society
- **Endpoint**: `GET /api/societies/:societyId/vendors`
- **Auth Required**: Public
- **Path Parameters**: `societyId` (Integer)
- **Query Parameters**: `search` (String, Optional)
- **Possible Cases & Responses**:
  - `200 OK`: Array of active vendors matching society and search filter.
    ```json
    [
      {
        "vendor_id": 1,
        "society_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "logo": "https://images.unsplash.com/photo-1542838132...",
        "description": "Your neighborhood fresh organic store",
        "status": "ACTIVE",
        "society_name": "Greenwood Residency"
      }
    ]
    ```
  - `500 Internal Server Error`: DB query failed.

---

### 4.5 Get Vendor Storefront & Product Menu
- **Endpoint**: `GET /api/vendors/:vendorId`
- **Auth Required**: Public
- **Path Parameters**: `vendorId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Vendor details and full item catalog.
    ```json
    {
      "vendor": {
        "vendor_id": 1,
        "society_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "logo": "https://images.unsplash.com/photo-1542838132...",
        "opening_timing": "08:00 AM",
        "closing_timing": "10:00 PM",
        "delivery_charge": 0.00,
        "min_order_value": 0.00,
        "society_name": "Greenwood Residency",
        "location": "Block A, Sector 62, Noida"
      },
      "items": [
        {
          "item_id": 1,
          "vendor_id": 1,
          "item_name": "Farm Fresh Organic Milk (1L)",
          "description": "Pure pasteurized milk",
          "price": 68.00,
          "stock": 50,
          "category": "Dairy",
          "unit": "1L",
          "is_available": 1,
          "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150..."
        }
      ]
    }
    ```
  - `404 Not Found`: Vendor ID does not exist.
  - `500 Internal Server Error`: DB fetch error.

---

### 4.6 QR Code Store Direct Link Redirect
- **Endpoint**: `GET /shop/:vendorId`
- **Auth Required**: Public
- **Path Parameters**: `vendorId` (Integer)
- **Possible Cases & Responses**:
  - `302 Found`: Redirects browser directly to `{FRONTEND_URL}/{society_id}/{vendor_id}`.
  - `404 Not Found`: Returns `<h2>Shop not found</h2>` HTML document.
  - `500 Internal Server Error`: Returns `<h2>Server error</h2>` HTML document.

---

## 5. Customer Orders APIs

### 5.1 Place Customer Order
- **Endpoint**: `POST /api/orders`
- **Auth Required**: Public (Validated via Zod Schema)
- **Request Headers**: `Content-Type: application/json`
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description / Constraints |
  | :--- | :--- | :--- | :--- |
  | `customer_name` | String | Yes | Full name of customer |
  | `phone_number` | String | Yes | 10-15 digit contact number |
  | `address` | String | Yes | Delivery address |
  | `vendor_id` | Integer | Yes | Vendor store receiving the order |
  | `items` | Array | Yes | Non-empty array of item order objects |
  | `items[].item_id` | Integer | Yes | Target item ID |
  | `items[].quantity` | Integer | Yes | Positive integer quantity (> 0) |
  | `items[].unit_price` | Number | Yes | Expected unit price |

- **Possible Cases & Responses**:
  - `201 Created`: Order placed, prices verified server-side, and item inventory deducted atomically.
    ```json
    {
      "message": "Order placed successfully",
      "order_id": 104,
      "total_amount": 308.00,
      "status": "PLACED"
    }
    ```
  - `400 Bad Request`: Validation failure, insufficient stock, item unavailable, or vendor inactive/expired.
    ```json
    {
      "error": "Insufficient stock for 'Farm Fresh Organic Milk (1L)'. Available: 2, Requested: 5"
    }
    ```
  - `500 Internal Server Error`: Database transaction error.

---

### 5.2 Check Order Status & Details
- **Endpoint**: `GET /api/orders/:orderId`
- **Auth Required**: Public
- **Path Parameters**: `orderId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Order metadata and list of items purchased.
    ```json
    {
      "order": {
        "order_id": 104,
        "vendor_id": 1,
        "customer_id": 12,
        "customer_name": "Rahul Verma",
        "phone_number": "9898989898",
        "address": "Flat 402, Tower B, Greenwood Residency",
        "status": "PLACED",
        "total_amount": 308.00,
        "created_at": "2026-08-03T10:15:00.000Z",
        "store_name": "FreshMart Grocery & Organic"
      },
      "items": [
        {
          "order_id": 104,
          "item_id": 1,
          "quantity": 1,
          "unit_price": 68.00,
          "item_total": 68.00,
          "item_name": "Farm Fresh Organic Milk (1L)"
        }
      ]
    }
    ```
  - `404 Not Found`: Order ID does not exist.
    ```json
    {
      "error": "Order not found"
    }
    ```
  - `500 Internal Server Error`: Fetch failure.

---

### 5.3 Update Order Status (Vendor Panel)
- **Endpoint**: `PUT /api/orders/:orderId/status`
- **Auth Required**: Bearer Token (`vendor` or `admin` Role)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Path Parameters**: `orderId` (Integer)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description / Constraints |
  | :--- | :--- | :--- | :--- |
  | `status` | Enum | Yes | Allowed values: `PLACED`, `ACCEPTED`, `COMPLETED`, `CANCELLED` |

- **Possible Cases & Responses**:
  - `200 OK`: Order status updated.
    ```json
    {
      "message": "Order status updated",
      "status": "ACCEPTED"
    }
    ```
  - `400 Bad Request`: Invalid status string.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User role insufficient.
  - `500 Internal Server Error`: Status update failure.

---

## 6. Vendor Dashboard & Catalog Management APIs

### 6.1 Get Vendor Dashboard Data
- **Endpoint**: `GET /api/vendorPanel/:vendorId` *(Legacy Redirect: `/venderPanel/:venderId`)*
- **Auth Required**: Bearer Token (Vendor Owner Guard / IDOR Protection)
- **Headers**: `Authorization: Bearer <vendor_access_token>`
- **Path Parameters**: `vendorId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Consolidated vendor profile, store items, recent orders, active subscription, and payment history.
    ```json
    {
      "vendor": {
        "vendor_id": 1,
        "society_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "status": "ACTIVE"
      },
      "items": [],
      "orders": [],
      "subscription": {
        "subscription_id": 1,
        "status": "ACTIVE",
        "start_date": "2026-08-03",
        "end_date": "2027-08-03"
      },
      "payments": []
    }
    ```
  - `403 Forbidden`: Authenticated vendor attempting to view another vendor's panel (IDOR protection).
    ```json
    {
      "error": "Forbidden: You do not have permission to access or modify this vendor resource (IDOR Protection)"
    }
    ```
  - `404 Not Found`: Vendor record not found.
  - `500 Internal Server Error`: Dashboard aggregation error.

---

### 6.2 Add Item to Store Catalog
- **Endpoint**: `POST /api/vendorPanel/:vendorId/items`
- **Auth Required**: Bearer Token (Vendor Owner Guard)
- **Headers**: `Authorization: Bearer <vendor_access_token>`
- **Path Parameters**: `vendorId` (Integer)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description / Defaults |
  | :--- | :--- | :--- | :--- |
  | `item_name` | String | Yes | Name of item |
  | `price` | Number | Yes | Unit selling price (> 0) |
  | `description` | String | No | Detailed description |
  | `stock` | Integer | No | Stock quantity (Default: 50) |
  | `category` | String | No | Item category (Default: `General`) |
  | `unit` | String | No | Measurement unit (Default: `piece`) |
  | `is_available` | Boolean/Integer | No | Availability flag (Default: 1) |
  | `image_url` | String | No | Public image URL |

- **Possible Cases & Responses**:
  - `201 Created`: Item created successfully.
    ```json
    {
      "message": "Item added successfully",
      "item_id": 12
    }
    ```
  - `400 Bad Request`: Validation error (e.g. price negative or name missing).
  - `403 Forbidden`: IDOR protection check failed.
  - `500 Internal Server Error`: Item insertion failure.

---

### 6.3 Edit Item Details or Toggle Availability
- **Endpoint**: `PUT /api/vendorPanel/:vendorId/items/:itemId`
- **Auth Required**: Bearer Token (Vendor Owner Guard)
- **Headers**: `Authorization: Bearer <vendor_access_token>`
- **Path Parameters**: `vendorId` (Integer), `itemId` (Integer)
- **Input Parameters (`req.body`)**:
  - *Option A (Toggle Availability Only)*: `{ "is_available": 0 }`
  - *Option B (Full Edit)*:
    ```json
    {
      "item_name": "Farm Fresh Organic Milk (1L)",
      "description": "Pure pasteurized milk updated",
      "price": 70.00,
      "stock": 45,
      "category": "Dairy",
      "unit": "1L",
      "is_available": 1,
      "image_url": "https://..."
    }
    ```

- **Possible Cases & Responses**:
  - `200 OK`: Item updated.
    ```json
    {
      "message": "Item updated successfully"
    }
    ```
  - `403 Forbidden`: Vendor ownership failure.
  - `500 Internal Server Error`: Update error.

---

### 6.4 Delete Catalog Item
- **Endpoint**: `DELETE /api/vendorPanel/:vendorId/items/:itemId`
- **Auth Required**: Bearer Token (Vendor Owner Guard)
- **Path Parameters**: `vendorId` (Integer), `itemId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Item deleted.
    ```json
    {
      "message": "Item deleted successfully"
    }
    ```
  - `403 Forbidden`: Ownership check failed.
  - `500 Internal Server Error`: Delete error.

---

### 6.5 Update Store Settings
- **Endpoint**: `PUT /api/vendorPanel/:vendorId/settings`
- **Auth Required**: Bearer Token (Vendor Owner Guard)
- **Headers**: `Authorization: Bearer <vendor_access_token>`
- **Path Parameters**: `vendorId` (Integer)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `store_name` | String | No | Store display title |
  | `logo` | String | No | Store logo image URL |
  | `description` | String | No | Store bio/tagline |
  | `phone_number` | String | No | Business phone number |
  | `gst_number` | String | No | Business GST number |
  | `opening_timing` | String | No | E.g. `08:00 AM` |
  | `closing_timing` | String | No | E.g. `10:00 PM` |
  | `min_order_value` | Number | No | Minimum order amount threshold |
  | `max_quantity_limit`| Integer| No | Max units per order |
  | `delivery_charge` | Number | No | Flat delivery charge |
  | `gst_percentage` | Number | No | Applicable GST % rate |
  | `service_charge_percentage` | Number | No | Service fee % rate |

- **Possible Cases & Responses**:
  - `200 OK`: Settings updated.
    ```json
    {
      "message": "Store settings updated successfully",
      "logo": "https://images.unsplash.com/photo-1542838132..."
    }
    ```
  - `400 Bad Request`: Validation error.
  - `403 Forbidden`: Ownership check failed.
  - `500 Internal Server Error`: Update error.

---

### 6.6 Renew Vendor Subscription
- **Endpoint**: `POST /api/vendorPanel/:vendorId/renew`
- **Auth Required**: Bearer Token (Vendor Owner Guard)
- **Headers**: `Authorization: Bearer <vendor_access_token>`
- **Path Parameters**: `vendorId` (Integer)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `payment_method` | String | No | E.g. `Razorpay (UPI)` |
  | `transaction_id` | String | No | Txn ref ID |

- **Possible Cases & Responses**:
  - `200 OK`: Subscription extended by 1 year and payment logged.
    ```json
    {
      "message": "Subscription renewed successfully for 1 year!",
      "start_date": "2026-08-03",
      "end_date": "2027-08-03"
    }
    ```
  - `403 Forbidden`: Vendor ownership check failed.
  - `500 Internal Server Error`: Renewal transaction error.

---

## 7. Admin Portal & Platform Control APIs

### 7.1 List All Vendors (Admin View)
- **Endpoint**: `GET /api/admin/vendors`
- **Auth Required**: Bearer Token (`admin` Role)
- **Headers**: `Authorization: Bearer <admin_access_token>`
- **Query Parameters**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `search` | String | No | null | Search vendor name, society name, or store name |
  | `page` | Integer| No | 1 | Page number for pagination |
  | `limit` | Integer| No | 50 | Max items per page (Max limit: 100) |

- **Possible Cases & Responses**:
  - `200 OK`: List of vendors with joined subscription metadata and batch-fetched payment histories (N+1 query optimized).
    ```json
    [
      {
        "vendor_id": 1,
        "vendor_name": "Rajesh Sharma",
        "store_name": "FreshMart Grocery & Organic",
        "email": "freshmart@gmail.com",
        "status": "ACTIVE",
        "society_name": "Greenwood Residency",
        "location": "Block A, Sector 62, Noida",
        "subscription_status": "ACTIVE",
        "start_date": "2026-08-03",
        "end_date": "2027-08-03",
        "package_placement": "Standard Annual Vendor Subscription (1 Year)",
        "payments": [
          {
            "payment_id": 1,
            "amount": "2999.00",
            "payment_method": "Razorpay (UPI)",
            "transaction_id": "RAZORPAY_TXN_991823",
            "status": "SUCCESS"
          }
        ]
      }
    ]
    ```
  - `401 Unauthorized`: Admin token missing/invalid.
  - `403 Forbidden`: Non-admin account.
  - `500 Internal Server Error`: Query failure.

---

### 7.2 Get Pending Vendor Registration Requests
- **Endpoint**: `GET /api/admin/requests`
- **Auth Required**: Bearer Token (`admin` Role)
- **Possible Cases & Responses**:
  - `200 OK`: Pending vendor requests waiting for approval.
    ```json
    [
      {
        "vendor_id": 5,
        "vendor_name": "Pooja Verma",
        "store_name": "Royal Laundry & Dry Cleaning",
        "email": "royallaundry@gmail.com",
        "status": "PENDING",
        "society_name": "Greenwood Residency",
        "location": "Block A, Sector 62, Noida",
        "payment_method": "Razorpay (UPI)",
        "transaction_id": "RAZORPAY_TXN_881204",
        "paid_amount": "2999.00"
      }
    ]
    ```
  - `401 Unauthorized` / `403 Forbidden`

---

### 7.3 Approve Vendor Application
- **Endpoint**: `POST /api/admin/requests/:vendorId/approve`
- **Auth Required**: Bearer Token (`admin` Role)
- **Path Parameters**: `vendorId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Vendor status set to `ACTIVE` and 1-Year subscription activated.
    ```json
    {
      "message": "Vendor request approved successfully! Vendor is now active with 1-Year Subscription.",
      "vendor_id": "5",
      "start_date": "2026-08-03",
      "end_date": "2027-08-03"
    }
    ```
  - `401 Unauthorized` / `403 Forbidden`
  - `500 Internal Server Error`: Approval transaction failed.

---

### 7.4 Reject Vendor Application
- **Endpoint**: `POST /api/admin/requests/:vendorId/reject`
- **Auth Required**: Bearer Token (`admin` Role)
- **Path Parameters**: `vendorId` (Integer)
- **Possible Cases & Responses**:
  - `200 OK`: Vendor status set to `REJECTED` and subscription cancelled.
    ```json
    {
      "message": "Vendor request rejected",
      "vendor_id": "5"
    }
    ```
  - `401 Unauthorized` / `403 Forbidden`

---

### 7.5 Get Platform Configuration
- **Endpoint**: `GET /api/admin/config`
- **Auth Required**: Public (Cached 2 Minutes)
- **Possible Cases & Responses**:
  - `200 OK`: Global platform branding configuration.
    ```json
    {
      "platform_logo": "https://imgh.in/host/ucila6",
      "platform_name": "DigiLocal"
    }
    ```

---

### 7.6 Update Platform Configuration
- **Endpoint**: `PUT /api/admin/config` *(Aliases: `POST /api/admin/config`, `PUT /api/admin/logo`, `POST /api/admin/logo`)*
- **Auth Required**: Bearer Token (`admin` Role)
- **Input Parameters (`req.body`)**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `platform_logo` | String | No | New image URL for logo |
  | `platform_name` | String | No | Platform branding name |

- **Possible Cases & Responses**:
  - `200 OK`: Configuration updated in DB and cache invalidated.
    ```json
    {
      "message": "Platform configuration updated successfully",
      "platform_logo": "https://imgh.in/host/new_logo.png",
      "platform_name": "DigiLocal Marketplace"
    }
    ```
  - `401 Unauthorized` / `403 Forbidden`
  - `500 Internal Server Error`: Config update error.

---

## 8. Health, Observability & Probe APIs

### 8.1 Comprehensive System Health Check
- **Endpoint**: `GET /health` *(Alias: `GET /api/health`)*
- **Auth Required**: Public
- **Possible Cases & Responses**:
  - `200 OK` (Healthy):
    ```json
    {
      "status": "UP",
      "timestamp": "2026-08-03T17:02:49.102Z",
      "version": "1.0.0",
      "uptimeSeconds": 4820,
      "environment": "development",
      "requestId": "req-991203",
      "database": {
        "status": "UP",
        "engine": "postgres",
        "error": null
      },
      "memory": {
        "heapUsedMb": 42,
        "rssMb": 88
      }
    }
    ```
  - `503 Service Unavailable` (Degraded / DB Down):
    ```json
    {
      "status": "DEGRADED",
      "timestamp": "2026-08-03T17:02:49.102Z",
      "version": "1.0.0",
      "uptimeSeconds": 4820,
      "environment": "development",
      "database": {
        "status": "DOWN",
        "engine": "postgres",
        "error": "connect ECONNREFUSED 127.0.0.1:5432"
      },
      "memory": {
        "heapUsedMb": 42,
        "rssMb": 88
      }
    }
    ```

---

### 8.2 Kubernetes Liveness Probe
- **Endpoint**: `GET /health/live` *(Alias: `GET /api/health/live`)*
- **Auth Required**: Public
- **Possible Cases & Responses**:
  - `200 OK`: Service process is running.
    ```json
    {
      "status": "ALIVE",
      "timestamp": "2026-08-03T17:02:49.102Z",
      "uptimeSeconds": 4820
    }
    ```

---

### 8.3 Kubernetes Readiness Probe
- **Endpoint**: `GET /health/ready` *(Alias: `GET /api/health/ready`)*
- **Auth Required**: Public
- **Possible Cases & Responses**:
  - `200 OK`: Database ping successful, ready for network traffic.
    ```json
    {
      "status": "READY",
      "timestamp": "2026-08-03T17:02:49.102Z",
      "database": "CONNECTED"
    }
    ```
  - `503 Service Unavailable`:
    ```json
    {
      "status": "NOT_READY",
      "timestamp": "2026-08-03T17:02:49.102Z",
      "error": "Database ping failed: connect ECONNREFUSED"
    }
    ```

---

### 8.4 Version & Environment Info
- **Endpoint**: `GET /version` *(Alias: `GET /api/health/version`)*
- **Auth Required**: Public
- **Possible Cases & Responses**:
  - `200 OK`:
    ```json
    {
      "name": "digilocal-backend",
      "version": "1.0.0",
      "description": "Backend API for DigiLocal Vendor Ordering and Subscription Platform",
      "environment": "development",
      "nodeVersion": "v20.11.0"
    }
    ```

---

## 9. Interactive Documentation & Specification APIs

### 9.1 Interactive Swagger UI
- **Endpoint**: `GET /api-docs`
- **Response Format**: `text/html`
- **Description**: Mounts Swagger UI standalone bundle in the browser linked to `/openapi.json`.

### 9.2 Raw OpenAPI 3.1.0 JSON Spec
- **Endpoint**: `GET /openapi.json`
- **Response Format**: `application/json`
- **Possible Cases**:
  - `200 OK`: Returns full OpenAPI 3.1 schema JSON file.
  - `404 Not Found`: Schema file missing.
