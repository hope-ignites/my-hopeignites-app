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
3. **Help Modal** - Floating help button with contact info (index.html lines 100-115)
4. **IP Detection** - Client-side IP detection for location-based messages (scripts.js lines 277-369)
5. **Beta Banner** - Dismissible banner with localStorage persistence (index.html lines 10-14, scripts.js lines 371-382)
6. **Collapsible Details** - Expandable application information table (index.html lines 40-72)
7. **Dark Mode Toggle** - Light/dark theme switcher with localStorage (scripts.js lines 1-24)
8. **Favorites System** - Pin favorite apps for quick access (scripts.js lines 26-61)

### IP Detection Feature
The portal includes client-side IP detection using the ipify API to show custom messages for specific IP addresses or ranges. This is **informational only** and should never be used for access control or security.

**Configuration** (in [scripts.js](scripts.js)):
- IP addresses defined in `ALLOWED_IPS` array (line 279)
- IP ranges can be added to `ALLOWED_IP_RANGES` array
- IP cached in localStorage for 1 hour to reduce API calls
- Message content customizable at lines 351-359

**Testing**: Use browser DevTools console to see IP detection logs.

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
     "icon": "🔧",
     "title": "App Name",
     "description": "Brief description",
     "url": "https://app.example.com"
   }
   ```

### Updating Help Desk Contact Info
1. Open [index.html](index.html)
2. Find the `help-modal` section (around line 100)
3. Update contact list items (email, phone, hours, website)

### Configuring IP Detection
1. Open [scripts.js](scripts.js)
2. Find the IP Detection configuration section (around line 279)
3. Add IP addresses to `ALLOWED_IPS` array
4. Optionally add IP ranges to `ALLOWED_IP_RANGES` array
5. Customize message content (around line 351)

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
