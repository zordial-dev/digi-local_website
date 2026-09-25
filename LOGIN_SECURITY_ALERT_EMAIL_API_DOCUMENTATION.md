# 🔐 API Documentation: Automatic Login Security Alert Email Service

> **Audience**: Website Developers, Resident User App Developers, Merchant Vendor App Developers  
> **Backend Version**: `v3.9.0`  
> **Status**: **LIVE & ACTIVE**  
> **Service Name**: Omni-Channel Login Security & Device Tracking Alert Service  
> **Sender Address**: `DigiLocal Platform <connexon@zordial.com>`  

---

## 📌 1. Overview & Purpose

Whenever a **Resident Customer (User)** or **Merchant Partner (Vendor)** logs into their DigiLocal account via either **Password** or **SMS / OTP**, the backend automatically and asynchronously dispatches an official, branded **Login Security Alert Email** to their registered email address.

### Key Capabilities for Frontend Teams:
1. **Zero Breaking Changes**: Existing login routes, request formats, and response structures remain 100% backward compatible.
2. **Non-Blocking Architecture**: Email delivery runs in the background (fire-and-forget). The frontend receives its JWT tokens and user profile instantly without waiting for the SMTP/AWS SES network roundtrip.
3. **Omni-Channel Device Tracking**: The alert includes the login method (`Password` vs `OTP`), accurate timestamp in Indian Standard Time (`IST +05:30`), client IP address, and browser/app user-agent.
4. **Optional Email Override**: If an account does not yet have an email address in the database, the frontend can pass an `"email"` field in the login payload, and the alert will automatically be dispatched there.

---

## 🛒 2. Vendor / Merchant Portal Login

### 📡 Route 1: Vendor Password Login
* **Method**: `POST`
* **URL**: `/api/vendors/login`
* **Headers**: `Content-Type: application/json`

#### Request Body Example
```json
{
  "phone_number": "9111111111",
  "password": "YourPassword123"
}
```
*(Optional: include `"email": "merchant@gmail.com"` to ensure the security alert is sent to that specific email).*

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "vendor_id": 1341,
  "public_id": "vnd@1341",
  "status": "active",
  "vendor": {
    "vendor_id": 1341,
    "public_id": "vnd@1341",
    "store_name": "Super Bakery Store",
    "vendor_name": "Rajesh Sharma",
    "email": "rajfreefire902@gmail.com",
    "phone_number": "9111111111",
    "status": "active"
  }
}
```

---

### 📡 Route 2: Vendor OTP Login
* **Method**: `POST`
* **URL**: `/api/vendors/otp-login`  
  *(Aliases: `/api/vendors/login-with-otp`, `/api/vendors/login-otp`)*
* **Headers**: `Content-Type: application/json`

#### Request Body Example
```json
{
  "phone_number": "9111111111",
  "otp": "482910"
}
```
*(Optional: include `"email": "merchant@gmail.com"`)*

---

## 🏠 3. Resident User Website & App Login

### 📡 Route: Resident User Login (Password or OTP)
* **Method**: `POST`
* **URL**: `/api/users/login`
* **Headers**: `Content-Type: application/json`

#### Option A: Password Login Payload
```json
{
  "phone": "9571240742",
  "password": "UserSecurePassword123"
}
```

#### Option B: OTP Login Payload
```json
{
  "phone": "9571240742",
  "otp": "839201"
}
```
*(Optional: include `"email": "resident@gmail.com"` to ensure the security alert is dispatched to this email).*

#### Success Response (`HTTP 200 OK`)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "user_id": "usr_102",
    "public_id": "usr@0102",
    "name": "Lovely Sethiya",
    "email": "lovelysethia753@gmail.com",
    "phone": "9571240742",
    "status": "active",
    "is_blocked": false,
    "society_id": "284",
    "society_name": "Reg Shop Society",
    "flat": "Flat 402, Tower B",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pincode": "201310"
  }
}
```

---

## 📧 4. What the Recipient Receives

### Subject Line:
* **Vendor**: `🔐 Security Alert: Login to your DigiLocal Vendor Portal`
* **User**: `🔐 Security Alert: Login to your DigiLocal User Portal`

### Sender:
`DigiLocal Platform <connexon@zordial.com>`

### Email Contents & Structure:
1. **Branded Header**: Navy & Gold DigiLocal styling.
2. **Greeting**: Personalized with `vendor_name`, `store_name`, or resident `name`.
3. **Session Summary Table**:
   | Field | Description / Example |
   | :--- | :--- |
   | **Account Type** | `Resident User` or `Merchant Partner` |
   | **Authentication Method** | `Password` or `OTP (Message Central)` |
   | **Login Time** | Formatted in Indian Standard Time (e.g. `25 Sep 2026, 01:52 PM IST`) |
   | **IP Address** | Client IPv4 / IPv6 |
   | **Device / Browser** | Browser user agent or mobile app package identifier |
4. **Security Call to Action**:  
   > *"If this login was authorized by you, no action is required. If you did not perform this login, please immediately change your password or click Report Suspicious Activity."*

---

## 🧪 5. Testing in Postman (Direct Endpoints)

Frontend developers can also test the email service directly in Postman before logging in:

| Action | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Verify SMTP Status** | `GET` | `http://localhost:5000/api/test/email/status` | Confirms AWS SES / SMTP connection without sending an email |
| **Send Test Custom Email** | `POST` | `http://localhost:5000/api/test/email/send` | Sends a custom test email to any address |
| **Vendor Login Test** | `POST` | `http://localhost:5000/api/vendors/login` | Triggers a live login and sends the security alert |
| **User Login Test** | `POST` | `http://localhost:5000/api/users/login` | Triggers a live user login and sends the alert |

#### Example: POST `/api/test/email/send` Request Body
```json
{
  "to": "developer@example.com",
  "subject": "Test Security Alert Email",
  "message": "Testing DigiLocal Email Service v3.9.0"
}
```
