# 🔑 DigiLocal Platform — Vendor Password Update API Specification
**Target Audience:** Frontend Developers (Web / Vendor Mobile App)  
**Backend Version:** 3.5.0  
**Updated:** September 2026  
**Base Server URL:** `http://localhost:5000` (Local) / `https://digilocal-backend.onrender.com` (Production)

---

## 📌 Endpoint Overview
- **Endpoint:** `/api/vendors/:vendorId/password`
- **Method:** `PUT` *(also accepts `PATCH` or `POST`)*
- **Headers:**
```http
Content-Type: application/json
Authorization: Bearer <VENDOR_JWT_TOKEN>
```

---

## 📝 Request Body Options

### Option A — Standard "Change Password" Form (Recommended)
Use this when the vendor is logged in and changing their existing password in their dashboard/profile settings:
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecretPassword456!",
  "confirm_password": "NewSecretPassword456!"
}
```

### Option B — Direct Password Reset Form
Use this during initial password setup after first-time OTP verification or direct password reset:
```json
{
  "password": "NewSecretPassword456!"
}
```

---

## 🔀 Supported Field Aliases
The backend supports all standard field aliases automatically:
- **New Password:** `new_password`, `newPassword`, `password`, `pass`
- **Current Password:** `current_password`, `currentPassword`, `old_password`, `oldPassword`
- **Confirmation:** `confirm_password`, `confirmPassword`

---

## 📤 Response Codes & Formats

### `200 OK` (Success)
```json
{
  "success": true,
  "status": "success",
  "message": "Password updated successfully.",
  "vendor_id": 1323
}
```

### `401 Unauthorized` (Wrong Current Password)
```json
{
  "success": false,
  "error": "Current password is incorrect. Please check and try again."
}
```

### `400 Bad Request` (Validation Error)
When password is too short:
```json
{
  "success": false,
  "error": "Password must be at least 6 characters long."
}
```
When new password and confirmation password do not match:
```json
{
  "success": false,
  "error": "New password and confirmation password do not match."
}
```

### `404 Not Found` (Vendor Not Found)
```json
{
  "success": false,
  "error": "Vendor with ID \"1323\" not found."
}
```

---

## 💻 Frontend Client Integration (`api.js`)
Call the `api.updateVendorPassword(vendorId, passwordData, token)` function in [api.js](file:///d:/pwDigiLocal/digi-local_website/src/services/api.js):

```javascript
// Option A: Change Password with verification
const res = await api.updateVendorPassword(vendorId, {
  current_password: "OldPassword123!",
  new_password: "NewSecretPassword456!",
  confirm_password: "NewSecretPassword456!"
});

// Option B: Direct Password Reset
const res = await api.updateVendorPassword(vendorId, "NewSecretPassword456!");
```
