# Hope Ignites Portal Hub

A single-page HTML portal hub for Hope Ignites employees, providing centralized access to organizational applications and tools.

## Features

- **Portal Cards** - Grid of application links organized by category with 46x46 PNG icons
- **Badge System** - Visual indicators for Universal, SSO, and NHQ-only apps
- **Badge Legend** - Collapsible card-style guide explaining all badge types
- **Mobile Hamburger Menu** - Slide-out drawer navigation for mobile devices
- **Quick Links** - Secondary navigation for frequently accessed tools
- **Dark Mode** - Toggle between light and dark themes with dynamic logo switching
- **Favorites System** - Pin favorite apps for quick access
- **Tech Mode** - Special view at `/tech` path showing tech team tools
- **NHQ IP Detection** - Filter and display location-specific applications
- **Spotlight Search** - Fast keyboard-accessible search with icon support
- **Responsive Design** - Mobile-first interface with hamburger menu and scroll arrows
- **Accessibility** - WCAG 2.1 Level AA compliant

## Deployment

This portal is deployed on **CloudFlare Pages** with automatic deployments from the main branch.

### Quick Start

1. Clone this repository
2. Open `index.html` in your browser to test locally
3. Push changes to trigger automatic deployment

### CloudFlare Pages Setup

1. Push this repository to GitHub
2. Go to [CloudFlare Dashboard](https://dash.cloudflare.com/)
3. Navigate to "Workers & Pages" → "Pages"
4. Click "Connect to Git" and select your repository
5. Configure build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
6. Click "Save and Deploy"

### Cache Management

CloudFlare caches content aggressively. If updates aren't appearing:

1. **Purge Cache**: CloudFlare Dashboard → Caching → Configuration → "Purge Everything"
2. **Development Mode**: Toggle on for 3-hour cache bypass
3. **Hard Refresh**: `Ctrl/Cmd + Shift + R` in browser

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks or build tools
- **CloudFlare Pages** - Static site hosting and CDN

## File Structure

```
hopeignites-portal-cloudflare/
├── index.html              # Main HTML file
├── styles.css              # All CSS styling
├── scripts.js              # All JavaScript functionality
├── portal-data.json        # Application data (cards, categories, quick links)
├── _redirects              # CloudFlare Pages routing (SPA support)
├── assets/
│   ├── light-logo.png      # Logo for light mode
│   ├── dark-logo.png       # Logo for dark mode
│   ├── universal.png       # Universal badge icon
│   ├── sso-badge.png       # SSO badge icon
│   └── app-icons/          # 46x46 application icons
│       ├── outlook.png
│       ├── sharepoint.png
│       ├── hq-badge.png    # NHQ badge icon
│       └── ...
├── CLAUDE.md               # Development instructions
├── PRE-PRODUCTION-CHECKLIST.md
├── ROADMAP.md
└── README.md               # This file
```

## Making Changes

### Adding a New Application

Edit `portal-data.json` and add a new card to the appropriate category:

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

**Badge Properties:**
- `universal: true` - Shows universal badge (available to all team members)
- `sso: true` - Shows SSO badge (Single Sign-On enabled)
- `nhqOnly: true` - Only visible from NHQ IPs, shows HQ badge
- `tech: true` - Only visible in Tech Mode (`/tech` path)

**Icons:**
- Place 46x46 PNG icons in `assets/app-icons/`
- Reference by filename: `"icon": "outlook.png"`
- Emojis also supported: `"icon": "🔧"`

### Updating Styles

All styling is in `styles.css`. The portal uses CSS variables for easy theming:

- `--bg-gradient-start` / `--bg-gradient-end` - Background gradient
- `--accent-primary` / `--accent-secondary` - Accent colors
- `--card-bg` - Card background color

### Updating Contact Information

Edit the help modal in `index.html` (around line 100).

## Development

No build process required! Just edit the files and open `index.html` in your browser to test.

For the best development experience, use VS Code with the Live Server extension:
1. Right-click `index.html`
2. Select "Open with Live Server"

### Testing Tech Mode Locally

Tech Mode (`/tech`) uses SPA routing that requires CloudFlare Pages. For local testing:
- Add query parameter: `http://127.0.0.1:5500/index.html?tech=true`
- Or modify `scripts.js` line 85 to force tech mode temporarily

### Testing Mobile Menu

The mobile hamburger menu appears only on viewports ≤ 768px:
1. Open Chrome DevTools (F12)
2. Click device toolbar icon or press `Ctrl+Shift+M` / `Cmd+Shift+M`
3. Select a mobile device (e.g., iPhone 12 Pro - 390px)
4. Refresh the page
5. Hamburger menu (☰) appears in top-left corner

**Mobile Menu Features:**
- Hamburger icon fades when menu opens
- Slide-out drawer from left with all navigation
- Search and dark mode buttons integrated
- All categories dynamically populated
- Active category highlighted
- Closes on category selection, overlay click, or ESC key

## Security & Privacy

- All application links use HTTPS
- No user data is collected or stored on servers
- NHQ IP detection is client-side only (localStorage) and informational - **never use for access control**
- No cookies or tracking
- IP detection can be easily bypassed - it's for convenience, not security

## License

Copyright Hope Ignites. All rights reserved.

## Support

For technical support or to request new applications, contact the Help Desk via the help button in the portal.
