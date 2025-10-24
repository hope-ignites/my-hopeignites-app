# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **single-page HTML portal hub** for Hope Ignites employees, deployed on CloudFlare Pages. The portal provides centralized access to organizational applications and tools. There is no build process, no backend, and no package manager - it's a static site with separate HTML, CSS, and JavaScript files.

**Production URL**: To be configured in CloudFlare Pages

## Architecture

### Application Structure
- **index.html** - Clean HTML markup (~119 lines)
- **styles.css** - All CSS styling (~580 lines)
- **scripts.js** - All JavaScript functionality (~558 lines)
- **portal-data.json** - Application data (cards, categories, quick links)
- **_redirects** - CloudFlare Pages routing configuration
- **assets/** - Logo and icon files

### Key Technical Components

1. **Portal Cards** - Grid of application links (rendered from portal-data.json)
2. **Quick Links** - Secondary navigation (rendered from portal-data.json)
3. **Help Modal** - Floating help button with contact info
4. **IP Detection & NHQ Filtering** - Client-side IP detection for NHQ-only applications
5. **Mobile Hamburger Menu** - Slide-out drawer navigation for mobile devices (< 768px)
6. **Badge Legend** - Collapsible card-style section explaining application badges
7. **Badge Indicators** - Visual badges on cards (Universal, SSO, NHQ-only)
8. **Collapsible Details** - Expandable application information table
9. **Dark Mode Toggle** - Light/dark theme switcher with localStorage and dynamic logo
10. **Favorites System** - Pin favorite apps for quick access
11. **Tech Mode** - Special view at /tech path showing tech team tools
12. **Spotlight Search** - Keyboard-accessible search across all applications

### IP Detection & NHQ-Only Applications
The portal includes client-side IP detection using the ipify API to:
1. Show a custom "Hope On The Hill Network Detected" banner for NHQ IPs
2. Filter and display NHQ-only applications (marked with `nhqOnly: true` in portal-data.json)
3. Show HQ badge indicator on NHQ-only cards when accessing from NHQ

**Configuration** (in [scripts.js](scripts.js)):
- NHQ IP addresses defined in `ALLOWED_IPS` array (line 432)
- IP ranges can be added to `ALLOWED_IP_RANGES` array (line 440)
- IP cached in localStorage for 1 hour to reduce API calls
- Global `isNHQIP` variable tracks NHQ status
- Cards with `nhqOnly: true` are filtered out when not at NHQ

**Important**: This is **informational only** and should never be used for access control or security. IP detection is client-side and easily bypassed.

**Testing**: Use browser DevTools console to see IP detection logs.

### Badge System
Applications can display up to three badge indicators in the bottom-right corner of cards:

1. **Universal Badge** (`universal: true`) - Available to all team members
   - Icon: `assets/universal.png`
   - Position: Bottom-right corner
   - Tooltip: "Available to all team members"

2. **SSO Badge** (`sso: true`) - Single Sign-On enabled
   - Icon: `assets/sso-badge.png`
   - Position: Middle position (48px from right)
   - Tooltip: "Single Sign-On enabled"

3. **NHQ Badge** (`nhqOnly: true`) - Only visible from NHQ IPs
   - Icon: `assets/hq-badge.png`
   - Position: Leftmost (84px from right)
   - Tooltip: "Only available from NHQ office"

**Badge Legend**: Collapsible section below category tabs explains all badges with card-style presentation.

### Tech Mode
Access the portal at `/tech` to enable Tech Mode:
- Shows additional tech team tools (cards marked with `tech: true`)
- Tech Tools category moves to second position (after Favorites)
- Tech mode indicator appears next to help button
- Uses SPA routing via `_redirects` file

**Local Testing**: Use query parameter `?tech=true` or hash `#tech` for testing in Live Server.

### Mobile Hamburger Menu
On mobile devices (< 768px width), the portal uses a hamburger menu instead of desktop navigation:

**Features:**
- Hamburger icon (☰) in top-left corner that fades out when menu opens
- Slide-out drawer (280px wide) from the left side
- Semi-transparent overlay that closes menu when tapped
- Contains: Search button, Dark mode toggle, and all category buttons
- Categories dynamically populated from portal-data.json
- Active category highlighted with accent color
- Closes automatically when category selected or ESC key pressed
- Body scroll locked when menu open

**Desktop vs Mobile:**
- **Desktop (> 768px)**: Horizontal tab navigation with scroll arrows, search/dark mode in top-right
- **Mobile (≤ 768px)**: Hamburger menu replaces all desktop controls

**Implementation:**
- HTML: Mobile drawer structure at top of body (before container)
- CSS: Positioned fixed with z-index 2000+, hidden on desktop
- JavaScript: Global variables expose `portalData`, `currentCategory`, `renderCards()` to mobile menu

## Development Commands

### Local Testing
```bash
# Open directly in browser
open index.html

# Or use VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

### Deployment

#### Initial Setup (One Time)
1. Push this repository to GitHub
2. Go to [CloudFlare Dashboard](https://dash.cloudflare.com/)
3. Navigate to "Workers & Pages" → "Pages"
4. Click "Connect to Git"
5. Select your GitHub repository
6. Configure build settings:
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (root directory)
7. Click "Save and Deploy"

#### Subsequent Deployments
All deployments happen automatically via CloudFlare Pages:
```bash
git add .
git commit -m "Update portal"
git push origin main
# Deployment completes in 1-2 minutes
```

**Deployment Status**: Check the CloudFlare Pages dashboard to monitor deployment progress.

#### Cache Clearing
CloudFlare aggressively caches content. If updates aren't appearing immediately:

1. **Purge CloudFlare Cache** (Recommended):
   - Go to CloudFlare Dashboard → Caching → Configuration
   - Click "Purge Cache" → "Purge Everything"

2. **Development Mode** (3-hour bypass):
   - CloudFlare Dashboard → Caching → Configuration
   - Toggle "Development Mode" to ON

3. **Browser Hard Refresh**:
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5`

4. **Cache Busting** (for production):
   - Add version query parameters to CSS/JS files
   - Example: `styles.css?v=1.0.2`
   - Increment version with each deployment

#### Custom Domain Setup
1. In CloudFlare Pages dashboard, go to your project
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `my.hopeignites.app`)
5. Follow CloudFlare's DNS instructions
6. SSL certificate will be auto-provisioned

## Common Modifications

### Adding a Portal Card
1. Open [portal-data.json](portal-data.json)
2. Find the appropriate category in the `categories` array
3. Add a new card object to that category's `cards` array:
   ```json
   {
     "icon": "app-icon.png",
     "title": "App Name",
     "description": "Brief description",
     "url": "https://app.example.com",
     "universal": true,
     "sso": true,
     "nhqOnly": false,
     "tech": false
   }
   ```

**Card Properties**:
- `icon`: Filename from `assets/app-icons/` (e.g., "outlook.png") or emoji, OR an object with light/dark theme icons (see below)
- `title`: Application name
- `description`: Brief description of the application
- `url`: Full HTTPS URL to the application
- `universal`: (optional) Set to `true` to show universal badge
- `sso`: (optional) Set to `true` to show SSO badge
- `nhqOnly`: (optional) Set to `true` to restrict to NHQ IPs only
- `tech`: (optional) Set to `true` to show only in Tech Mode (/tech)

**Light/Dark Mode Icons**:
You can specify different icons for light and dark themes. If only `light` is provided, it will be used in both themes:

```json
{
  "icon": {
    "light": "app-icon-light.png",
    "dark": "app-icon-dark.png"
  },
  "title": "App Name",
  "description": "Brief description",
  "url": "https://app.example.com"
}
```

The portal automatically switches icons when the user toggles between light and dark mode. If no dark icon is specified, the light icon is used as a fallback.

### Updating Help Desk Contact Info
1. Open [index.html](index.html)
2. Find the `help-modal` section (around line 100)
3. Update contact list items (email, phone, hours, website)

### Configuring NHQ IP Detection
1. Open [scripts.js](scripts.js)
2. Find the IP Detection configuration section (around line 432)
3. Add NHQ IP addresses to `ALLOWED_IPS` array:
   ```javascript
   const ALLOWED_IPS = [
       '24.207.150.155',    // Example NHQ IP
       '192.168.1.100',     // Add your NHQ IPs here
   ];
   ```
4. Optionally add IP ranges to `ALLOWED_IP_RANGES` array:
   ```javascript
   const ALLOWED_IP_RANGES = [
       { start: '192.168.1.1', end: '192.168.1.254' }
   ];
   ```
5. Customize NHQ banner message (around line 528)

**Important**: Cards marked with `nhqOnly: true` in portal-data.json will only appear when accessing from these IPs.

To disable IP detection entirely, clear both arrays or comment out the IP detection section.

### Updating Branding Colors
Colors are defined in [styles.css](styles.css) using CSS variables:
- **Primary gradient**: `:root` section `--bg-gradient-start` and `--bg-gradient-end` (lines 3-4)
- **Accent colors**: `--accent-primary` and `--accent-secondary` (lines 9-10)
- **Card styling**: `--card-bg`, `--card-shadow` (lines 6-7)
- **Dark mode**: `body.dark-mode` section (lines 17-32)

## Important Notes

### CloudFlare Pages Configuration
- **Routing**: Handled by `_redirects` file (all routes serve index.html)
- **SSL**: Auto-provisioned and auto-renewed by CloudFlare
- **CDN**: Automatically distributed globally via CloudFlare's edge network
- **Build**: No build process needed - static files deployed directly

### Testing Changes
Always test changes locally by opening index.html in a browser before pushing to production. Since there's no build process, what you see locally is exactly what will deploy.

### Accessibility
The portal is WCAG 2.1 Level AA compliant with:
- Semantic HTML5 structure
- ARIA labels for screen readers
- Keyboard navigation support
- Proper focus indicators
- High color contrast ratios

When making changes, maintain these accessibility features.

### Security Considerations
- All links use `https://` protocol
- No user data is collected (except IP cached in browser localStorage for 1 hour)
- No cookies or tracking
- IP detection is client-side only and can be easily bypassed - never use for access control
- Links open in same tab (all are trusted internal applications)

## File Organization Reference

### index.html (~119 lines)
Clean HTML markup with semantic structure:
- Lines 10-14: Beta banner HTML
- Lines 16-86: Main container with header, portal grid, quick links, collapsible details, footer
- Lines 88-98: Floating help button and security badge
- Lines 100-115: Help modal
- Line 117: Script tag linking to scripts.js

### styles.css (~580 lines)
All CSS styling organized by component:
- Lines 1-32: CSS variables (light and dark mode)
- Lines 34-62: Base styles and body
- Lines 64-86: Header and logo
- Lines 88-116: Dark mode toggle button
- Lines 118-160: Tab navigation
- Lines 162-232: Portal cards and favorite buttons
- Lines 234-268: Quick links
- Lines 270-343: Collapsible details and tables
- Lines 345-424: Beta banner and IP notice
- Lines 426-562: Help modal and security badge
- Lines 564-606: Footer
- Lines 608-626: Responsive media queries

### scripts.js (~558 lines)
All JavaScript functionality organized by feature:
- Lines 1-24: Dark mode toggle
- Lines 26-61: Favorites manager
- Lines 63-247: Portal rendering from JSON
- Lines 249-275: Open links in new tab
- Lines 277-369: IP detection
- Lines 371-382: Beta banner dismiss
- Lines 384-411: Help modal

### portal-data.json
Application data structure:
- `categories`: Array of category objects with cards
- `quickLinks`: Array of quick link objects

### _redirects
CloudFlare Pages routing configuration:
- All routes serve index.html (SPA behavior)
