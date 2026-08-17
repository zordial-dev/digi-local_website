# 🛠️ Backend Developer API Specification: Pagination Support

This specification document outlines the exact query parameters and response structure expected by the **DigiLocal Frontend** for 25-item pagination support across **Societies** and **Vendors** endpoints.

---

## 📌 Summary of Changes Required on Backend

To support pagination, the backend API should accept `page` and `limit` as optional URL query parameters on the following GET endpoints:

1. **Get Societies**: `GET /api/societies?page=1&limit=25&search=...`
2. **Get All Vendors**: `GET /api/societies/all/vendors?page=1&limit=25&search=...`
3. **Get Society Vendors**: `GET /api/societies/:societyId/vendors?page=1&limit=25&search=...`

---

## 1. GET /api/societies

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page number to retrieve (1-indexed) |
| `limit` | `integer` | No | `25` | Number of items per page |
| `search` | `string` | No | `""` | Search keyword (filters society name, location, or pincode) |

### Expected Output Payload Structure
```json
{
  "success": true,
  "data": [
    {
      "society_id": "SOC-101",
      "society_name": "Omaxe Greenwood Residency",
      "location": "Sector Greenwood, Omega II, Greater Noida",
      "public_id": "GW-4K2",
      "pincode": "201310",
      "vendor_count": 14,
      "total_flats": 650,
      "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
    }
  ],
  "meta": {
    "total_records": 50,
    "total_pages": 2,
    "current_page": 1,
    "page_size": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 2. GET /api/societies/:societyId/vendors

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `societyId` | `string` | Yes | - | Society ID (or `"all"` to retrieve all community vendors) |
| `page` | `integer` | No | `1` | Page number to retrieve (1-indexed) |
| `limit` | `integer` | No | `25` | Number of vendors per page |
| `search` | `string` | No | `""` | Search keyword (filters store name, vendor name, category) |

### Expected Output Payload Structure
```json
{
  "success": true,
  "data": [
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
  ],
  "meta": {
    "total_records": 60,
    "total_pages": 3,
    "current_page": 1,
    "page_size": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 3. Frontend Fallback Compatibility Note

* If the backend returns a flat JSON array `[...]` without a `meta` envelope, the frontend automatically performs **client-side slicing** into 25-item pages without breaking.
* Providing the `meta` pagination envelope enables **server-side pagination**, optimizing database queries and bandwidth for large scale datasets.
