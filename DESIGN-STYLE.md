# Hope Ignites Application Launcher - Design Style Guide

## Overview
Modern, professional portal design with clean cards and a vibrant gradient background. Fully supports light and dark modes with smooth transitions.

## Color Palette

### Light Mode (Default)
- **Background Gradient**: `#0b6180` → `#1b8da9` (teal blue gradient, 135deg)
- **Accent Primary**: `#ef7322` (vibrant orange)
- **Accent Secondary**: `#0b6180` (deep teal)
- **Card Background**: `#ffffff` (white)
- **Text Primary**: `#333` (dark gray)
- **Text Secondary**: `#666` (medium gray)
- **Text Light**: `#ffffff` (white, for text on gradient)

### Dark Mode
- **Background Gradient**: `#1a1a2e` → `#16213e` (dark blue gradient, 135deg)
- **Accent Primary**: `#ff6b35` (bright coral orange)
- **Accent Secondary**: `#00adb5` (cyan)
- **Card Background**: `#0f3460` (dark blue)
- **Text Primary**: `#e4e4e4` (light gray)
- **Text Secondary**: `#b4b4b4` (medium gray)
- **Text Light**: `#e4e4e4` (light gray)

## Typography
- **Font Family**: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`
- **H1 Size**: `2.5rem`, weight `600`
- **Body Text**: `1.1rem` for descriptions
- **Font Weights**: 400 (normal), 600 (headings), 700 (bold emphasis)

## Design Aesthetic

### Overall Style
- **Modern Glass-Morphism**: Semi-transparent overlays with backdrop blur effects
- **Card-Based Layout**: White cards (light mode) or dark blue cards (dark mode) with subtle shadows
- **Gradient Background**: Diagonal gradient (135deg) that spans full viewport
- **Responsive Grid**: CSS Grid layout with auto-fit columns (min 280px, max 1fr)

### Cards
- **Background**: White (`#ffffff`) in light mode, dark blue (`#0f3460`) in dark mode
- **Border Radius**: `12px` for soft, modern corners
- **Shadow**: Subtle elevation with hover effects
  - Light mode: `rgba(0,0,0,0.1)` → `rgba(0,0,0,0.2)` on hover
  - Dark mode: `rgba(0,0,0,0.3)` → `rgba(0,0,0,0.5)` on hover
- **Hover Effect**: Slight lift with `translateY(-4px)` and enhanced shadow
- **Transition**: Smooth `0.3s ease` transitions on all interactions

### Buttons & Interactive Elements
- **Primary Action**: Accent orange (`#ef7322` light, `#ff6b35` dark)
- **Border Radius**: `8px` for buttons, `22px` for pill-shaped elements
- **Hover States**: Slightly darker shade with smooth transition
- **Semi-Transparent Overlays**: `rgba(255,255,255,0.1)` with hover at `0.25`

### Spacing & Layout
- **Max Container Width**: `1200px`
- **Card Padding**: `20px` internal padding
- **Grid Gap**: `20px` between cards
- **Section Margins**: `40px` between major sections
- **Viewport Padding**: `20px` around container

## Special Effects
- **Smooth Transitions**: `0.3s ease` on background, colors, transforms
- **Gradient Backgrounds**: Diagonal linear gradients (135deg)
- **Box Shadows**: Layered shadows for depth and elevation
- **Backdrop Blur**: Used on modals and overlay elements
- **Focus States**: Visible outlines for accessibility

## Accessibility
- **WCAG 2.1 Level AA**: High contrast ratios maintained
- **Focus Indicators**: Clear outlines on all interactive elements
- **ARIA Labels**: Proper semantic HTML and ARIA attributes
- **Keyboard Navigation**: Full keyboard support throughout

## CSS Variables Structure
Use CSS custom properties for easy theming:

```css
:root {
    --bg-gradient-start: #0b6180;
    --bg-gradient-end: #1b8da9;
    --accent-primary: #ef7322;
    --accent-secondary: #0b6180;
    --card-bg: white;
    --text-primary: #333;
    --text-secondary: #666;
    --text-light: white;
}

body.dark-mode {
    --bg-gradient-start: #1a1a2e;
    --bg-gradient-end: #16213e;
    --accent-primary: #ff6b35;
    --accent-secondary: #00adb5;
    --card-bg: #0f3460;
    --text-primary: #e4e4e4;
    --text-secondary: #b4b4b4;
}
```

## Implementation Tips
1. Use CSS Grid with `auto-fit` and `minmax()` for responsive card layouts
2. Apply `linear-gradient(135deg, ...)` to body for background
3. All interactive elements should have `:hover` and `:focus` states
4. Use `transform: translateY(-4px)` for subtle lift effects on hover
5. Maintain `0.3s ease` transition timing across all animations
6. Center content with flexbox: `display: flex; align-items: center; justify-content: center`
