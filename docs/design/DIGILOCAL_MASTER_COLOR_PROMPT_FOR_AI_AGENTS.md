# 🎨 DIGILOCAL ECOSYSTEM — MASTER UI/UX & COLOR DESIGN SPECIFICATION
> **System Instruction & Design Guide for AI Coding Agents**  
> *Target: For building any new Web Panel, Mobile Screen, Dashboard, or Portal within the DigiLocal Product Ecosystem.*

---

## 🤖 [COPY-PASTE SYSTEM PROMPT FOR AI AGENTS]

```markdown
You are an expert Frontend AI Engineer building a portal/panel for DigiLocal (Hyperlocal Gated Community Network).
You must STRICTLY adhere to the official DigiLocal Brand Design Tokens and Color System outlined below.
Do NOT introduce generic colors (like standard blue, plain green, bootstrap purple, or grey containers). All buttons, cards, pills, navigation bars, inputs, steppers, badges, and modals must follow these exact hex codes and aesthetic guidelines.
```

---

## 🏛️ 1. Official DigiLocal Brand Color Palette

### 🔴 Primary Brand Identity (Luxury Oxblood & Wine)
- **Primary CTA / Main Accent**: `#541D26` (`rgb(84, 29, 38)`)
  - *Where to use*: Primary CTA buttons ("Order Now", "Submit", "Next Step", "Save"), active stepper indicators, brand logo headers, top navbar brand titles, search button triggers.
- **Primary Hover / Active**: `#6B2732` (`rgb(107, 39, 50)`)
  - *Where to use*: Hover and active states for primary buttons, active tab pill background.
- **Primary Subtle Glow / Focus Ring**: `rgba(84, 29, 38, 0.15)`
  - *Where to use*: Input focus rings, selected card borders, active step ring shadows.

---

### 🟡 Metallic Accent & Highlights (Champagne Warm Gold)
- **Champagne Gold**: `#C8A878` (`rgb(200, 168, 120)`)
  - *Where to use*: Button borders (`border border-[#C8A878]/30`), verified icons, golden badges ("Secure Gateway", "Verified Partner"), star ratings, special promo banners.
- **Dark Gold Highlight**: `#A88B58` (`rgb(168, 139, 88)`)
  - *Where to use*: Gold icon accents on dark backgrounds, high-contrast gold text on white.
- **Warm Sand Cream**: `#EEE5DA` (`rgb(238, 229, 218)`)
  - *Where to use*: Secondary action pills, category card subtle background, inactive tab buttons.
- **Nude Sand**: `#D6B7A5` (`rgb(214, 183, 165)`)
  - *Where to use*: Secondary card borders, subtle subtext on dark cards.

---

### ⚪ Canvas, Cards & Typography (Warm Ivory & Dark Espresso)
- **Main Canvas Background**: `#F8F6F0` (`rgb(248, 246, 240)`)
  - *Where to use*: Full-screen background (`min-h-screen bg-[#F8F6F0]`), page scaffold.
- **Surface Cards (Pure White)**: `#FFFFFF` (`rgb(255, 255, 255)`)
  - *Where to use*: Main Bento cards, data tables, modals, input backgrounds.
- **Surface Secondary (Bright Ivory)**: `#FAF8F5` (`rgb(250, 248, 245)`)
  - *Where to use*: Left hero panels, table header rows (`<thead>`), filter toolbar boxes, form section boxes.
- **Dark Espresso Text (Headings & Labels)**: `#211A19` (`rgb(33, 26, 25)`)
  - *Where to use*: Main page titles, H1/H2/H3 headings, high-contrast body text, form field labels.
- **Muted Text**: `#78716C` (`rgb(120, 113, 108)`)
  - *Where to use*: Subtitles, placeholders, timestamps, delivery notes, secondary details.
- **Subtle Border**: `#E7DFD5` (`rgb(231, 223, 213)`)
  - *Where to use*: Card borders, input outlines, table divider lines (`border border-[#E7DFD5]`).

---

### 🟢 Status & Functional Feedback Tokens
- **Success / Verified**: `#16A34A` | Background: `#F0FDF4` | Border: `#BBF7D0`
  - *Where to use*: Order Delivered, Mobile Verified, Store Open badge.
- **Warning / Pending**: `#D97706` | Background: `#FFFBEB` | Border: `#FDE68A`
  - *Where to use*: Pending Review, Placed Order, Awaiting Payment.
- **Danger / Delete**: `#DC2626` | Background: `#FEF2F2` | Border: `#FECACA`
  - *Where to use*: Delete Account, Cancel Order, Reject Application, Form Errors.
- **Information / Dispatch**: `#2563EB` | Background: `#EFF6FF` | Border: `#BFDBFE`
  - *Where to use*: Out for Delivery, Open Ticket, Live Dispatch.

---

## 🔤 2. Typography Pairings

- **Headings / Serif Titles**: `'Cormorant Garamond', 'Playfair Display', Georgia, serif`
  - Used for: Brand logo text, page titles, review headers, hero titles.
  - Class: `font-serif font-extrabold text-[#211A19]`
- **Body / Interface / Buttons**: `'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif`
  - Used for: Buttons, form labels, inputs, card text, navigation pills.
  - Class: `font-sans font-bold text-xs`
- **Monospace / Numerical IDs**: `'JetBrains Mono', monospace`
  - Used for: Order numbers (`#ORD-9821`), VPA codes, Transaction hashes.

---

## 🧩 3. Component Design Patterns & Code Snippets

### A. Primary CTA Button
```jsx
<button className="w-full py-3.5 px-6 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 border border-[#C8A878]/30 cursor-pointer">
  <span>Confirm & Proceed</span>
  <ArrowRight className="w-4 h-4 text-[#C8A878]" />
</button>
```

### B. Secondary / Pill Button
```jsx
<button className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] text-xs font-bold shadow-2xs transition-all cursor-pointer">
  <span>Cancel / Back</span>
</button>
```

### C. Bento Card / Modal Container
```jsx
<div className="bg-white rounded-[2rem] border border-[#E7DFD5] shadow-xl p-6 sm:p-8 space-y-4">
  <div className="flex items-center justify-between pb-3 border-b border-[#E7DFD5]/60">
    <h3 className="font-serif font-bold text-lg text-[#211A19]">Card Title</h3>
    <span className="px-2.5 py-1 rounded-full bg-[#EEE5DA] text-[#541D26] text-[10px] font-extrabold border border-[#C8A878]/30">
      Active
    </span>
  </div>
</div>
```

### D. Input Form Field
```jsx
<div>
  <label className="block text-xs font-bold text-[#211A19] mb-1">Mobile Number *</label>
  <input 
    type="text" 
    placeholder="Enter 10-digit number"
    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-xs font-semibold text-[#211A19] placeholder:text-[#78716C] focus:outline-none focus:border-[#541D26] focus:bg-white focus:ring-4 focus:ring-[#541D26]/10 transition-all shadow-xs"
  />
</div>
```

### E. 3-Step Stepper Progress Component
```jsx
<div className="flex items-center justify-center space-x-3">
  {/* Step 1: Active/Done */}
  <div className="w-8 h-8 rounded-full bg-[#541D26] text-white flex items-center justify-center text-xs font-black shadow-sm ring-4 ring-[#541D26]/15">
    1
  </div>
  <div className="w-12 h-0.5 bg-[#541D26]" />
  {/* Step 2: Inactive */}
  <div className="w-8 h-8 rounded-full bg-white text-[#78716C] border-2 border-[#E7DFD5] flex items-center justify-center text-xs font-black">
    2
  </div>
</div>
```

---

## 🚫 4. Strict Anti-Patterns (What the AI Agent Must NEVER Do)

1. **NEVER use standard green/emerald (`#00592E`, `#18281F`, `bg-emerald-600`) for primary buttons or main headers.** Primary buttons MUST be `#541D26` (Oxblood Maroon).
2. **NEVER use dull/muddy beige containers (`#E5DBC5` or grey boxes).** Use clean `#FAF8F5` (Bright Ivory) or `#FFFFFF` (Pure White).
3. **NEVER use plain browser blue for links.** Links must be `#541D26` or `#C8A878`.
4. **NEVER use harsh pure black text (`#000000`).** Always use `#211A19` (Dark Espresso).
5. **ALWAYS pair `#541D26` buttons with subtle champagne gold borders (`border-[#C8A878]/30`) and gold icons (`text-[#C8A878]`).**

---

## 📦 5. Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        digi: {
          primary: '#541D26',
          primaryHover: '#6B2732',
          primaryLight: '#F7EEF0',
          gold: '#C8A878',
          goldDark: '#A88B58',
          sand: '#EEE5DA',
          nude: '#D6B7A5',
          canvas: '#F8F6F0',
          card: '#FFFFFF',
          ivory: '#FAF8F5',
          dark: '#211A19',
          muted: '#78716C',
          border: '#E7DFD5',
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```
