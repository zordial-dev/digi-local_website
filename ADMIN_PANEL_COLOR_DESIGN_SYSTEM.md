# 👑 DigiLocal Admin Panel — Color Design System & UI Specification

This document provides the complete **Color Palette, Design Tokens, and Component State Guidelines** for the **DigiLocal Super Admin & Operations Portal** developers (React, Next.js, Vue, TailwindCSS, Ant Design, or MUI).

---

## 📌 1. Admin Layout & Shell Theme (Sidebar, Header & Canvas)

The Admin Portal uses a high-contrast **Executive Luxe** theme: Dark Espresso & Maroon sidebar navigation paired with a crisp, high-density data canvas.

| Token Name | HEX Code | RGB | Component / Layout Placement |
| :--- | :--- | :--- | :--- |
| **`sidebarBg`** | `#211A19` | `rgb(33, 26, 25)` | Admin Left Sidebar navigation background, Dark top navigation bars |
| **`sidebarHover`** | `#2D2322` | `rgb(45, 35, 34)` | Sidebar menu item hover state |
| **`sidebarActive`** | `#541D26` | `rgb(84, 29, 38)` | Active menu tab background (with gold indicator bar) |
| **`sidebarActiveText`** | `#C8A878` | `rgb(200, 168, 120)` | Active menu icon & label text |
| **`adminCanvas`** | `#F8F6F0` | `rgb(248, 246, 240)` | Main admin dashboard body canvas background |
| **`cardSurface`** | `#FFFFFF` | `rgb(255, 255, 255)` | Stat KPI widgets, Data Table containers, Modal dialogs |
| **`subtleSurface`** | `#FAF8F5` | `rgb(250, 248, 245)` | Table header row (`<thead>`), Filter toolbar boxes, Drawer panels |

---

## 📌 2. Action Buttons & Interactive Controls

| Control Type | Normal State | Hover State | Text / Icon Color | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Action** | `#541D26` | `#6B2732` | `#FFFFFF` | "Create Society", "Add Vendor", "Export CSV", "Save Settings" |
| **Approve / Verify** | `#16A34A` | `#15803D` | `#FFFFFF` | "Approve KYC", "Verify Vendor", "Resolve Complaint" |
| **Reject / Danger** | `#DC2626` | `#B91C1C` | `#FFFFFF` | "Reject Application", "Block Account", "Delete Record" |
| **Secondary / Filter** | `#FFFFFF` (Border: `#E7DFD5`) | `#FAF8F5` | `#211A19` | "Reset Filters", "Date Range Picker", "Cancel", "Back" |
| **Gold Special Action**| `#C8A878` | `#B89766` | `#211A19` | "Feature on Homepage", "Boost Vendor", "Global Broadcast" |

---

## 📌 3. Data Grid & Table Status Badges

Admin data tables (Orders, Vendors, Residents, Society Lists, Tickets) use standardized status badge pills:

| Status State | Pill Background | Text Color | Border | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Active / Approved** | `#F0FDF4` (Light Green) | `#16A34A` | `#BBF7D0` | Vendor Verified, Order Delivered, Society Active |
| **Pending / Review** | `#FFFBEB` (Light Amber) | `#D97706` | `#FDE68A` | KYC Under Review, Order Placed, Pending Payment |
| **Rejected / Blocked**| `#FEF2F2` (Light Red) | `#DC2626` | `#FECACA` | KYC Rejected, Vendor Suspended, Order Cancelled |
| **In Progress / Open**| `#EFF6FF` (Light Blue) | `#2563EB` | `#BFDBFE` | Out for Delivery, Ticket In-Progress, Active Dispatch |
| **Neutral / Inactive**| `#F3F4F6` (Light Gray) | `#4B5563` | `#E5E7EB` | Store Closed, Offline, Archived Record |

---

## 📌 4. KPI Summary Cards (Dashboard Analytics Widgets)

| KPI Metric Category | Accent Border / Icon Badge | Icon Color | Background |
| :--- | :--- | :--- | :--- |
| **Total Revenue / GMV** | `#C8A878` (Champagne Gold) | `#A88B58` | `#FFFFFF` with `#FAF8F5` header |
| **Active Orders Today** | `#541D26` (Deep Maroon) | `#541D26` | `#FFFFFF` |
| **Onboarded Vendors** | `#16A34A` (Emerald Green) | `#16A34A` | `#FFFFFF` |
| **Housing Societies** | `#2563EB` (Royal Blue) | `#2563EB` | `#FFFFFF` |
| **Open Complaints** | `#DC2626` (Crimson Red) | `#DC2626` | `#FFFFFF` |

---

## 📌 5. Typography & Border Tokens

| Token Name | HEX Code | Usage |
| :--- | :--- | :--- |
| **`textHeading`** | `#211A19` | Page titles, Modal headers, KPI numbers, Table primary columns |
| **`textBody`** | `#44403C` | Table row data, Description text, Form labels |
| **`textMuted`** | `#78716C` | Timestamps, Pincodes, Secondary IDs, Column sub-labels |
| **`borderColor`** | `#E7DFD5` | Table cell borders, Input outlines, Card wrappers |
| **`inputFocusRing`**| `#541D26` | Outline / border glow when admin types in search / form fields |

---

## 💻 6. Ready-to-Use Code Configurations for Admin Developers

### 🛠️ A. Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        admin: {
          sidebar: '#211A19',
          sidebarHover: '#2D2322',
          primary: '#541D26',
          primaryHover: '#6B2732',
          gold: '#C8A878',
          goldDark: '#A88B58',
          canvas: '#F8F6F0',
          surface: '#FFFFFF',
          ivory: '#FAF8F5',
          text: '#211A19',
          muted: '#78716C',
          border: '#E7DFD5',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        }
      }
    }
  }
}
```

---

### 🛠️ B. CSS Root Design Variables (`admin-theme.css`)
```css
:root {
  /* Layout */
  --admin-sidebar-bg: #211A19;
  --admin-sidebar-hover: #2D2322;
  --admin-canvas-bg: #F8F6F0;
  --admin-card-bg: #FFFFFF;
  --admin-table-header-bg: #FAF8F5;

  /* Brand Primary */
  --admin-primary: #541D26;
  --admin-primary-hover: #6B2732;
  --admin-accent-gold: #C8A878;

  /* Typography */
  --admin-text-dark: #211A19;
  --admin-text-body: #44403C;
  --admin-text-muted: #78716C;
  --admin-border: #E7DFD5;

  /* Status Colors */
  --status-success: #16A34A;
  --status-success-bg: #F0FDF4;
  --status-warning: #D97706;
  --status-warning-bg: #FFFBEB;
  --status-danger: #DC2626;
  --status-danger-bg: #FEF2F2;
  --status-info: #2563EB;
  --status-info-bg: #EFF6FF;
}
```

---

### 🛠️ C. React / TypeScript Admin Theme Object
```typescript
export const AdminTheme = {
  sidebar: {
    background: '#211A19',
    hover: '#2D2322',
    activeTab: '#541D26',
    activeText: '#C8A878',
    text: '#E7DFD5',
  },
  content: {
    canvas: '#F8F6F0',
    card: '#FFFFFF',
    tableHeader: '#FAF8F5',
    border: '#E7DFD5',
  },
  brand: {
    primary: '#541D26',
    primaryHover: '#6B2732',
    gold: '#C8A878',
  },
  typography: {
    heading: '#211A19',
    body: '#44403C',
    muted: '#78716C',
  },
  badges: {
    approved: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    pending: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    rejected: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    inProgress: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    inactive: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  }
};
```
