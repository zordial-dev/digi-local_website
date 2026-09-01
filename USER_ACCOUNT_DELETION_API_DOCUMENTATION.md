# 🗑️ Resident User Account Deletion Backend API Documentation

This document provides the complete API specification for frontend developers (Resident User App / Web Portal) to implement the **Account Deletion** feature for resident users.

---

## 📌 Endpoint Overview

| Action | HTTP Method | Endpoint | Authorization |
| :--- | :--- | :--- | :--- |
| **Delete Logged-in User Account** | `DELETE` | `/api/users/profile` | `Bearer <JWT_TOKEN>` |
| **Delete Logged-in User Account (Alias)** | `DELETE` | `/api/users/me` | `Bearer <JWT_TOKEN>` |
| **Delete Logged-in User Account (Alias)** | `DELETE` | `/api/users/delete` | `Bearer <JWT_TOKEN>` |
| **Delete Account via User ID** | `DELETE` | `/api/users/:userId` | `Bearer <JWT_TOKEN>` |
| **Delete Account via POST** | `POST` | `/api/users/delete-account` | `Bearer <JWT_TOKEN>` |

---

## 🔐 Authorization & Headers

- **Header**: `Authorization: Bearer <USER_JWT_ACCESS_TOKEN>`
- **Content-Type**: `application/json`

---

## 📥 Request Parameters (Optional)

If the user is authenticated via Bearer token, no request body or query parameters are required. The backend automatically identifies the logged-in user from the JWT payload.

If specifying target user manually:

### Request Body (Optional):
```json
{
  "user_id": "usr_998877",
  "phone": "9876543210"
}
```

> **Note on Phone Formatting**: Both 10-digit standard format (`9876543210`) and E.164 international format (`+919876543210`) are supported by the sanitization layer.

---

## 📤 Response Specifications

### 🟢 1. Success Response (`200 OK`)
Returned when the user account and associated temporary records are permanently deleted from the database.

```json
{
  "success": true,
  "message": "Resident user account for \"Aarushi Sharma\" (ID: usr_998877, Phone: 9876543210) deleted permanently.",
  "user_id": "usr_998877",
  "deleted_at": "2026-09-01T13:10:00.000Z"
}
```

#### 💡 Frontend Actions on `200 OK`:
1. Clear local storage tokens:
```javascript
localStorage.removeItem('userToken');
localStorage.removeItem('user');
localStorage.removeItem('digilocal_user_token');
localStorage.removeItem('digilocal_user');
localStorage.clear();
```
2. Display success toast: *"Your account has been deleted permanently."*
3. Redirect user to the Registration / Welcome screen.

---

### 🔴 2. Account Not Found (`404 Not Found`)
Returned if the user account does not exist or has already been deleted.

```json
{
  "success": false,
  "error": "User account not found or already deleted."
}
```

---

### 🔴 3. Unauthorized / Missing Identifier (`400 / 401`)
Returned if neither a valid token nor a phone/user_id identifier was supplied in the request.

```json
{
  "success": false,
  "error": "User ID or phone number is required"
}
```

---

### 🔴 4. Server Error (`500 Internal Server Error`)
```json
{
  "success": false,
  "error": "Failed to delete user account: Database error"
}
```

---

## 💻 Frontend Integration Example (React / React Native)

```javascript
export async function handleDeleteAccount(userToken, userProfile) {
  try {
    const phone = userProfile?.phone || userProfile?.mobileNumber || '';
    const userId = userProfile?.user_id || userProfile?.id || '';

    const response = await fetch('https://digi-local-backend.onrender.com/api/users/profile', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        phone: phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
        phone_number: phone
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      // 1. Purge Local Storage & Session State
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      localStorage.removeItem('digilocal_user_token');
      localStorage.removeItem('digilocal_user');
      localStorage.clear();

      alert('Your account has been deleted permanently.');

      // 2. Redirect to Signup / Welcome Page
      window.location.href = '/register';
    } else {
      alert(data.error || data.message || 'Failed to delete account.');
    }
  } catch (err) {
    console.error('Account deletion error:', err);
    alert('Network error. Please try again.');
  }
}
```

---

## 🛡️ Data Sanitization & Cleanup Policy

When a deletion request is completed:
1. **User Record**: Completely removed from the resident users collection.
2. **Phone Index**: Cleared so the same mobile number can register afresh without duplicate phone errors.
3. **Active Cart & Sessions**: Terminated immediately across client sessions.
