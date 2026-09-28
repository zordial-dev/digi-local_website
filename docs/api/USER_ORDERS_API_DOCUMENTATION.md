# 📄 Complete API Documentation: Resident User Orders Service

This document provides the full technical specification for the **Resident User Orders APIs** used in the DigiLocal platform. It defines endpoints, input schemas, business logic, output structures, and fallback rules.

---

## 📌 Index of Endpoints

1. [GET /api/users/:userId/orders](#1-get-apiusersuseridorders) — Fetch Orders by User ID or Phone Number
2. [GET /api/orders](#2-get-apiorders) — Query & Filter Orders (Query Params)
3. [POST /api/orders](#3-post-apiorders) — Create New Customer Order
4. [PUT /api/orders/:orderId/status](#4-put-apiordersorderidstatus) — Update Order Status
5. [Frontend & LocalStorage Fallback Rules](#5-frontend--localstorage-fallback-rules)

---

## 1. GET /api/users/:userId/orders

### 💡 Business Idea & Purpose
Allows resident users (on their profile dashboard) and support agents to fetch all active and historic orders associated with a specific resident user account or phone number.

### 📥 Request Schema
* **HTTP Method**: `GET`
* **URL Path**: `/api/users/:userId/orders`
* **Path Parameters**:
  - `userId` (`string`, Required): The User ID (e.g. `usr_101`) OR 10-digit Phone Number (e.g. `9784319840` / `+919784319840`).

#### Request Example
```http
GET /api/users/9784319840/orders HTTP/1.1
Host: localhost:5001
Authorization: Bearer <user_access_token>
Accept: application/json
```

---

### 📤 Response Payload Schemas

#### Response A: Success — User Has Placed Orders (200 OK)
```json
{
  "success": true,
  "count": 2,
  "orders": [
    {
      "order_id": "ORD-5985",
      "user_id": "usr_9784319840",
      "customer_name": "Aarushi",
      "phone": "+919784319840",
      "user_phone": "+919784319840",
      "vendor_id": 1,
      "store_name": "FreshMart Grocery & Organic",
      "store_logo": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80",
      "society_name": "Anupam Apartment",
      "delivery_address": "Flat A-402, Anupam Apartment",
      "status": "PLACED",
      "status_label": "Order Paid & Out for Delivery",
      "payment_status": "PAID",
      "payment_method": "COD / WhatsApp",
      "total_amount": 75.00,
      "date": "2026-08-06T15:47:00.000Z",
      "items": [
        {
          "item_id": 2,
          "item_name": "Organic Whole Wheat Bread (400g)",
          "quantity": 1,
          "unit_price": 45.00
        }
      ]
    },
    {
      "order_id": "ORD-3895",
      "user_id": "usr_9784319840",
      "customer_name": "Aarushi",
      "phone": "+919784319840",
      "vendor_id": 3,
      "store_name": "Royal Bakery & Confectionery",
      "store_logo": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80",
      "society_name": "Anupam Apartment",
      "delivery_address": "Flat A-402, Anupam Apartment",
      "status": "DELIVERED",
      "status_label": "Order Delivered",
      "payment_status": "PAID",
      "payment_method": "UPI",
      "total_amount": 200.00,
      "date": "2026-08-06T15:40:00.000Z",
      "items": [
        {
          "item_id": 12,
          "item_name": "Jalebi (250g)",
          "quantity": 1,
          "unit_price": 200.00
        }
      ]
    }
  ]
}
```

#### Response B: Success — No Orders Found (200 OK)
```json
{
  "success": true,
  "count": 0,
  "orders": []
}
```

---

## 2. GET /api/orders

### 💡 Business Idea & Purpose
Allows backend filtering of orders via URL query parameters (`phone`, `user_id`, or `vendor_id`).

### 📥 Request Schema
* **HTTP Method**: `GET`
* **URL Path**: `/api/orders`
* **Query Parameters**:
  - `phone` (`string`, Optional): Filter orders by customer 10-digit phone number.
  - `user_id` (`string`, Optional): Filter orders by user ID.
  - `vendor_id` (`number`, Optional): Filter orders by vendor store ID.

#### Request Example
```http
GET /api/orders?phone=9784319840 HTTP/1.1
Host: localhost:5001
Accept: application/json
```

---

## 3. POST /api/orders

### 💡 Business Idea & Purpose
Creates a new customer order when a resident completes store checkout.

### 📥 Request Schema
* **HTTP Method**: `POST`
* **URL Path**: `/api/orders`
* **Request Body**:
```json
{
  "vendor_id": 1,
  "user_id": "usr_9784319840",
  "customer_name": "Aarushi",
  "phone_number": "+919784319840",
  "address": "Flat A-402, Anupam Apartment",
  "payment_method": "UPI",
  "store_name": "FreshMart Grocery & Organic",
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

### 📤 Response Payload (201 Created)
```json
{
  "message": "Order placed successfully",
  "order_id": "ORD-752019",
  "total_amount": 136.00,
  "status": "PLACED",
  "order": {
    "order_id": "ORD-752019",
    "vendor_id": 1,
    "user_id": "usr_9784319840",
    "customer_name": "Aarushi",
    "phone_number": "+919784319840",
    "delivery_address": "Flat A-402, Anupam Apartment",
    "status": "PLACED",
    "payment_status": "PAID",
    "payment_method": "UPI",
    "date": "2026-08-17T14:52:00.000Z",
    "total_amount": 136.00,
    "items": [
      {
        "item_id": 1,
        "item_name": "Farm Fresh Organic Milk (1L)",
        "quantity": 2,
        "unit_price": 68.00
      }
    ]
  }
}
```

---

## 4. PUT /api/orders/:orderId/status

### 💡 Business Idea & Purpose
Allows vendor merchants or admin managers to update fulfillment status (`ACCEPTED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).

### 📥 Request Schema
* **HTTP Method**: `PUT`
* **URL Path**: `/api/orders/:orderId/status`
* **Request Body**:
```json
{
  "status": "DELIVERED"
}
```

### 📤 Response Payload (200 OK)
```json
{
  "message": "Order status updated successfully",
  "order_id": "ORD-752019",
  "status": "DELIVERED"
}
```

---

## 5. Frontend & LocalStorage Fallback Rules

1. **API Primary Sync**: Frontend components ([UserProfilePage.jsx](file:///d:/pwDigiLocal/digi-local_website/src/pages/UserProfilePage.jsx)) query `GET /api/users/:userId/orders`.
2. **LocalStorage Backup**: Orders placed client-side are also appended to `localStorage.getItem('digilocal_user_orders')` to ensure instant offline availability and instant UI rendering.
3. **Array Extraction Rule**: The service layer ([api.js](file:///d:/pwDigiLocal/digi-local_website/src/services/api.js)) extracts `data.orders || data` to ensure a consistent Array output.
