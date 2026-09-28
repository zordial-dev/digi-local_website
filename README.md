# 🏘️ DigiLocal — Residential Hyperlocal Commerce Platform

A full-stack residential society marketplace enabling residents, local vendors, and community administrators to seamlessly connect, trade, track orders in real-time, and manage hyper-localized services.

---

## 📁 Repository Folder Structure

The project follows a clean, modular architecture where components, pages, public assets, and backend services are logically organized for readability and maintainability.

```
pwDigiLocal/digi-local_website/
│
├── 📂 docs/                               # Project & API Documentation
│   ├── 📂 api/                            # API Specifications & Contracts
│   │   ├── API_DOCUMENTATION.md           # Master Backend REST APIs
│   │   ├── PAYMENT_GATEWAY_API_DOCS.md    # Cashfree Gateway & Settlements
│   │   ├── ORDER_STATUS_API_DOCS.md       # Real-time Order Tracker Spec
│   │   ├── EMAIL_AND_OTP_API_DOCS.md      # Nodemailer & Static OTP Auth
│   │   └── ...                            # Pagination, Purchases, Auth Docs
│   └── 📂 design/                         # Design System & Theme Specs
│       ├── DIGILOCAL_COLOR_DESIGN_SYSTEM.md # Brand Color Tokens & Guidelines
│       └── ADMIN_PANEL_COLOR_DESIGN_SYSTEM.md # Admin Panel Luxury Theme Spec
│
├── 📂 public/                             # Public Static Assets
│   ├── 📂 images/                         # Official Logos & Platform Graphics
│   │   ├── logo.png                       # Primary DigiLocal Brand Logo
│   │   ├── zordial_logo.png               # Parent Brand Asset
│   │   └── login_hero.png                 # Authentication Illustration
│   ├── 📂 showcase/                       # App Store & Marketing Graphics
│   │   ├── app_icon_512x512.png           # Store Icon
│   │   ├── feature_graphic_1024x500.png   # Play Store Feature Banner
│   │   ├── payouts_screenshot_1080x1920.png # Payouts Screen Mockup
│   │   └── play_store_screenshots_9x16/   # Store Screenshots
│   └── index.html                         # SPA Entrypoint HTML
│
├── 📂 src/                                # Frontend React / Vite Application
│   │
│   ├── 📂 assets/                         # Bundled Static Assets
│   │   ├── 📂 images/                     # Component Images & Logos
│   │   └── 📂 styles/                     # Global & Modular CSS Stylesheets
│   │
│   ├── 📂 components/                     # Categorized React Components
│   │   ├── 📂 layout/                     # Shell & Structure Elements
│   │   │   ├── Navbar.jsx                 # Global Society & Cart Header
│   │   │   ├── Footer.jsx                 # Footer with CMS Links
│   │   │   └── FloatingCartBar.jsx        # Sticky Order Drawer
│   │   │
│   │   ├── 📂 modals/                     # Overlays, Popups & Dialogs
│   │   │   ├── LoginModal.jsx             # OTP & Password Login
│   │   │   ├── SupportDeskModal.jsx       # Helpdesk & Live Ticket Thread
│   │   │   ├── ResidentOrderCheckoutModal.jsx # Order Placement & Address
│   │   │   ├── LiveOrderTrackerModal.jsx  # Real-time Order Tracking
│   │   │   ├── DummyPaymentModal.jsx      # UPI & QR Payment Simulation
│   │   │   ├── UserLocationPromptModal.jsx# Society / Location Selector
│   │   │   ├── DeliveryAddressModal.jsx   # Resident Address Book
│   │   │   ├── DeliveryLocationModal.jsx  # Quick Pincode / Area Selector
│   │   │   ├── BlockedAccountModal.jsx    # Account Suspension Notice
│   │   │   ├── UserStrikeWarningModal.jsx # Fake Order Penalty Strike Dialog
│   │   │   └── NotificationModal.jsx      # Universal Alert / Confirm Dialog
│   │   │
│   │   ├── 📂 ui/                         # Reusable UI Atoms & Controls
│   │   │   ├── HeroSearchComponent.jsx    # Society Autocomplete Search
│   │   │   ├── CategoryPicker.jsx         # Service & Item Category Filter
│   │   │   ├── CountryCodePicker.jsx      # International Phone Prefix Dropdown
│   │   │   ├── VendorStatusBanner.jsx     # Active / Pending / Verification Strip
│   │   │   ├── VendorCoverageMap.jsx      # Society Map Radius Visualizer
│   │   │   ├── LiveOrderTrackerToast.jsx  # Floating Bottom-Right Toast Alert
│   │   │   ├── Skeletons.jsx              # Pulse Shimmer Loading States
│   │   │   └── ZordialLogo.jsx            # Vector Brand Mark
│   │   │
│   │   ├── 📂 animations/                 # Interactive Motion & GSAP Effects
│   │   │   ├── AccordionGallery.jsx       # Animated Society Showcase
│   │   │   ├── CircularGallery.jsx        # 3D Circular WebGL Carousel
│   │   │   ├── FloatingDoodles.jsx        # Ambient Doodles & Badges
│   │   │   ├── MaskedHeading.jsx          # Kinetic Typography Reveal
│   │   │   ├── ScrollStoryAnimation.jsx   # Step-by-Step Society Story
│   │   │   ├── StrokeText.jsx             # SVG Outline Animated Text
│   │   │   └── TextType.jsx               # Typing Animation Header
│   │   │
│   │   ├── 📂 vendor/                     # Merchant-Specific Steppers
│   │   │   └── VendorOnboardingStepper.jsx # 4-Step Registration Wizard
│   │   │
│   │   ├── 📂 common/                     # Utility & Error Boundaries
│   │   │   ├── ErrorBoundary.jsx          # React Crash Recovery Boundary
│   │   │   ├── AnimatedIcon.jsx           # Lucide Motion Wrappers
│   │   │   └── ScrollTextReveal.jsx       # Scroll-Triggered Text Stagger
│   │   │
│   │   └── index.js                       # Central Barrel Export Index
│   │
│   ├── 📂 pages/                          # Full Page Views & Routes
│   │   ├── HomePage.jsx                   # Hero & Society Search Landing
│   │   ├── SocietyVendorsPage.jsx         # Society Vendor Directory
│   │   ├── VendorStorefrontPage.jsx       # Vendor Product Catalog & Cart
│   │   ├── VendorRegisterPage.jsx         # Merchant Onboarding Stepper Page
│   │   ├── VendorDashboardPage.jsx        # Merchant Store Admin Portal
│   │   ├── AdminDashboardPage.jsx         # Platform Superadmin Portal
│   │   ├── UserProfilePage.jsx            # Resident Orders, Addresses & Strikes
│   │   ├── LoginPage.jsx                  # Resident / Vendor Dual Login
│   │   ├── RegisterPage.jsx               # Resident Sign Up Flow
│   │   ├── RequestSocietyPage.jsx         # Unlisted Society Onboarding
│   │   ├── ServiceEnquiryPage.jsx         # Vendor Bulk Inquiry Form
│   │   └── InfoPages.jsx                  # Privacy, Terms, Help CMS Pages
│   │
│   ├── 📂 services/                       # API Clients & Data Layer
│   │   └── api.js                         # Axios Client with Offline Fallback
│   │
│   ├── 📂 context/                        # React State Contexts
│   ├── 📂 hooks/                          # Custom React Hooks
│   │   └── useScrollLock.js               # Modal Scroll Locking Hook
│   ├── 📂 utils/                          # Formatting & Helper Utilities
│   ├── App.jsx                            # Main Router & Modal Coordinator
│   ├── main.jsx                           # React DOM Entrypoint
│   └── index.css                          # Tailwind & Theme Token Definitions
│
├── 📂 scripts/                            # Database Seed & Migration Scripts
│   ├── seed_database.js                   # Mock Societies, Vendors & Products
│   └── test_api.js                        # Endpoint Health Check Tests
│
├── server.js                              # Node.js Express Backend REST API
├── db.json                                # Lowdb / JSON Fallback Database
├── package.json                           # NPM Dependencies & Scripts
├── tailwind.config.js                     # Tailwind CSS Theme & Colors
└── vite.config.js                         # Vite Build & Proxy Configuration
```

---

## 🎨 DigiLocal Luxury Color Theme

| Role | Color Token | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Action** | Oxblood Red | `#541D26` | Primary Buttons, Active Tabs, Highlights |
| **Primary Hover** | Deep Burgundy | `#6B2732` | Hover state on primary actions |
| **Accent Tone** | Champagne Gold | `#C8A878` | Badges, Icons, Luxury accents |
| **Main Background**| Classic Cream | `#F6F0E8` | Page background body |
| **Card & Sections**| Soft Warm Sand | `#EEE5DA` / `#FAF8F5` | Cards, alternating rows, drawers |
| **Primary Text**   | Dark Espresso | `#211A19` | High contrast typography |
| **Muted Text**     | Espresso 60% | `#211A19`/60 | Secondary descriptions, hints |
| **Borders**        | Warm Taupe | `#E5DAD0` / `#E7DFD5` | Card borders, dividers, inputs |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
# Install root dependencies
npm install
```

### 3. Running Locally
```bash
# 1. Start Backend API Server (Port 5001)
node server.js

# 2. In another terminal, start Frontend Dev Server (Port 5000)
npm run dev
```

### 4. Building for Production
```bash
npm run build
```
Output bundle is generated into `dist/`.
