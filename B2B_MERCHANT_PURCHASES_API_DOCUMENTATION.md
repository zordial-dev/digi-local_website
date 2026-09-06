# B2B Merchant Purchases & Orders Made API Documentation (v1.0.0)

> **Status:** APPROVED & LIVE IN PRODUCTION (STABLE B2B SPEC)  
> **Base URL:** `https://digi-local-backend.onrender.com/api`

---

## 📌 Overview
When a merchant vendor (e.g. Raj Supermart) acts as a buyer/customer and places an order to buy supplies or inventory from another vendor store (e.g. Aarushi Sweets or Wholesale Mart), vendors can view all orders placed by them via this API.

---

## 📡 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vendorPanel/:vendorId/purchases` | Fetch orders placed by this vendor when buying from other vendors |
| `GET` | `/api/vendorPanel/:vendorId/my-orders` | Alias endpoint for vendor's own purchase history |
| `GET` | `/api/vendor/:vendorId/purchases` | Top-level vendor purchases alias |
| `GET` | `/api/orders/vendor-purchases/:vendorId` | Orders module vendor purchases alias |

---

## 🔒 Authorization & Headers

```http
Authorization: Bearer <VENDOR_JWT_ACCESS_TOKEN>
Content-Type: application/json
```

### Path Parameters
- **`vendorId`**: Vendor ID (e.g. `1225`), Public ID (e.g. `c860cb`), or phone number.

---

## 📄 Response Sample (200 OK)

```json
{
  "code": 200,
  "status": "success",
  "message": "Vendor purchases retrieved successfully.",
  "data": [
    {
      "order_id": "ORD-V2V-9842",
      "buyer_vendor_id": "1225",
      "buyer_public_id": "c860cb",
      "buyer_store_name": "Raj Supermart",
      "seller_vendor_id": "104",
      "seller_store_name": "Aarushi Sweets",
      "seller_store_logo": "https://...",
      "total_amount": 707.00,
      "status": "delivered",
      "delivery_address": "Shop 352, Raj Supermart",
      "created_at": "2026-09-02T06:32:11.000Z",
      "created_at_readable": "02 Sep 2026, 06:32 am IST",
      "items": [
        {
          "item_id": 101,
          "item_name": "Organic Milk Packets (Bulk)",
          "quantity": 10,
          "price": 50.00,
          "item_total": 500.00
        }
      ]
    }
  ]
}
```
