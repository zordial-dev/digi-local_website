# 🎨 DigiLocal Mobile & Web App Color Design System Specification

This document provides the complete, official **Color Palette & Design Tokens** for mobile app developers (React Native, Flutter, Swift/iOS, Kotlin/Android, and Figma designers).

---

## 📌 1. Primary Brand Identity (Maroon & Wine)

| Token Name | HEX Code | RGB | Usage / Component Description |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#541D26` | `rgb(84, 29, 38)` | Main brand color, Primary CTA buttons, Stepper active circles, Top navigation headers, Brand logo text |
| **`primaryHover`** | `#6B2732` | `rgb(107, 39, 50)` | Button pressed / active states, active tab backgrounds |
| **`primaryLight`** | `#F7EEF0` | `rgb(247, 238, 240)` | Active role pills, Selected category badge background, Input active focus glow (10-15% opacity) |

---

## 📌 2. Accent & Highlight Colors (Champagne Gold & Warm Sand)

| Token Name | HEX Code | RGB | Usage / Component Description |
| :--- | :--- | :--- | :--- |
| **`accentGold`** | `#C8A878` | `rgb(200, 168, 120)` | Button borders, Verified badges, Golden stars, Special promos, Secure Gateway tags |
| **`accentGoldDark`** | `#A88B58` | `rgb(168, 139, 88)` | Icon highlights on dark backgrounds, Gold text on white |
| **`warmSand`** | `#EEE5DA` | `rgb(238, 229, 218)` | Secondary action pills, Inactive filter tags, Category card subtle backdrops |
| **`nudeSand`** | `#D6B7A5` | `rgb(214, 183, 165)` | Subtitle text on dark cards, Secondary pill borders |

---

## 📌 3. Canvas, Surfaces & Typography Neutrals

| Token Name | HEX Code | RGB | Usage / Component Description |
| :--- | :--- | :--- | :--- |
| **`canvasBase`** | `#F8F6F0` | `rgb(248, 246, 240)` | Main screen background, Scaffold background, App page backdrops |
| **`surfaceCard`** | `#FFFFFF` | `rgb(255, 255, 255)` | Pure white card surfaces, Modal sheets, Input field backgrounds |
| **`surfaceIvory`** | `#FAF8F5` | `rgb(250, 248, 245)` | Secondary card containers, Left hero panels, Form section boxes |
| **`textDark`** | `#211A19` | `rgb(33, 26, 25)` | Primary titles, Headings, High-contrast body text, Form labels |
| **`textMuted`** | `#78716C` | `rgb(120, 113, 108)` | Subtitles, Placeholders, Timestamps, Delivery addresses |
| **`borderSubtle`** | `#E7DFD5` | `rgb(231, 223, 213)` | Card borders, Input outline borders, Divider lines |

---

## 📌 4. Functional & Status Feedback Colors

| State | HEX Code | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **`Success`** | `#16A34A` | `rgb(22, 163, 74)` | Order Delivered, OTP Verified, Store Open Badge |
| **`SuccessBg`**| `#F0FDF4` | `rgb(240, 253, 244)`| Success Banner / Toast background |
| **`Warning`** | `#D97706` | `rgb(217, 119, 6)` | Pending Approval, Unsaved Changes, Payment Processing |
| **`WarningBg`**| `#FFFBEB` | `rgb(255, 251, 235)`| Warning Alert pill background |
| **`Danger`**  | `#DC2626` | `rgb(220, 38, 38)`  | Delete Account, Cancel Order, Invalid Input Error |
| **`DangerBg`** | `#FEF2F2` | `rgb(254, 242, 242)`| Error Banner / Validation error text background |

---

## 💻 5. Code Snippets Ready for App Developers

### 📱 A. React Native (TypeScript / JavaScript Theme)
```typescript
export const DigiLocalColors = {
  // Brand Core
  primary: '#541D26',
  primaryHover: '#6B2732',
  primaryLight: '#F7EEF0',
  
  // Accents & Highlights
  accentGold: '#C8A878',
  accentGoldDark: '#A88B58',
  warmSand: '#EEE5DA',
  nudeSand: '#D6B7A5',

  // Canvas & Surfaces
  canvasBase: '#F8F6F0',
  surfaceCard: '#FFFFFF',
  surfaceIvory: '#FAF8F5',

  // Typography
  textDark: '#211A19',
  textMuted: '#78716C',
  border: '#E7DFD5',

  // System States
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
};
```

---

### 📱 B. Flutter (Dart Constants)
```dart
import 'package:flutter/material.dart';

class DigiLocalColors {
  // Brand Core
  static const Color primary = Color(0xFF541D26);
  static const Color primaryHover = Color(0xFF6B2732);
  static const Color primaryLight = Color(0xFFF7EEF0);

  // Accents & Highlights
  static const Color accentGold = Color(0xFFC8A878);
  static const Color accentGoldDark = Color(0xFFA88B58);
  static const Color warmSand = Color(0xFFEEE5DA);
  static const Color nudeSand = Color(0xFFD6B7A5);

  // Surfaces & Backgrounds
  static const Color canvasBase = Color(0xFFF8F6F0);
  static const Color surfaceCard = Color(0xFFFFFFFF);
  static const Color surfaceIvory = Color(0xFFFAF8F5);

  // Typography
  static const Color textDark = Color(0xFF211A19);
  static const Color textMuted = Color(0xFF78716C);
  static const Color border = Color(0xFFE7DFD5);

  // Feedback States
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFD97706);
  static const Color danger = Color(0xFFDC2626);
}
```

---

### 📱 C. Android (Kotlin / XML `colors.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Brand Core -->
    <color name="digilocal_primary">#541D26</color>
    <color name="digilocal_primary_hover">#6B2732</color>
    <color name="digilocal_primary_light">#F7EEF0</color>

    <!-- Accents -->
    <color name="digilocal_accent_gold">#C8A878</color>
    <color name="digilocal_warm_sand">#EEE5DA</color>
    <color name="digilocal_nude_sand">#D6B7A5</color>

    <!-- Surfaces -->
    <color name="digilocal_canvas_base">#F8F6F0</color>
    <color name="digilocal_surface_card">#FFFFFF</color>
    <color name="digilocal_surface_ivory">#FAF8F5</color>

    <!-- Text & Borders -->
    <color name="digilocal_text_dark">#211A19</color>
    <color name="digilocal_text_muted">#78716C</color>
    <color name="digilocal_border">#E7DFD5</color>
</resources>
```

---

### 📱 D. iOS (Swift / SwiftUI Color Extension)
```swift
import SwiftUI

extension Color {
    // Brand Core
    static let dlPrimary = Color(hex: 0x541D26)
    static let dlPrimaryHover = Color(hex: 0x6B2732)
    static let dlPrimaryLight = Color(hex: 0xF7EEF0)

    // Accents
    static let dlAccentGold = Color(hex: 0xC8A878)
    static let dlWarmSand = Color(hex: 0xEEE5DA)
    static let dlNudeSand = Color(hex: 0xD6B7A5)

    // Canvas & Text
    static let dlCanvasBase = Color(hex: 0xF8F6F0)
    static let dlSurfaceCard = Color(hex: 0xFFFFFF)
    static let dlSurfaceIvory = Color(hex: 0xFAF8F5)
    static let dlTextDark = Color(hex: 0x211A19)
    static let dlTextMuted = Color(hex: 0x78716C)
    static let dlBorder = Color(hex: 0xE7DFD5)
}
```
