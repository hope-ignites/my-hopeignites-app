# Deployment Guide for Organizations

This guide explains how to prepare this Hope Ignites Portal for sharing with other organizations, and how those organizations can customize and deploy it in their own environment.

---

## Part 1: Preparing the Portal for Sharing (Hope Ignites Team)

Before sharing this portal template with other organizations, you need to scrub organization-specific data and create a clean template.

### Step 1: Scrub Organization-Specific Data

#### 1.1 Clean portal-data.json
Remove all Hope Ignites-specific applications and replace with example/template data:

**File:** `portal-data.json`

```json
{
  "categories": [
    {
      "id": "all",
      "name": "All Applications",
      "cards": []
    },
    {
      "id": "favorites",
      "name": "⭐ Favorites",
      "cards": []
    },
    {
      "id": "example-category",
      "name": "Example Category",
      "cards": [
        {
          "icon": "📧",
          "title": "Example App",
          "description": "Description of your application",
          "url": "https://example.com",
          "universal": true,
          "sso": false
        }
      ]
    }
  ],
  "quickLinks": [
    {
      "title": "Your Organization Website",
      "url": "https://example.org"
    }
  ]
}
```

#### 1.2 Update scripts.js - Remove NHQ IPs
**File:** `scripts.js` (around line 432)

Replace the ALLOWED_IPS and ALLOWED_IP_RANGES with empty arrays:

```javascript
const ALLOWED_IPS = [
    // Add your organization's office IP addresses here
    // Example: '24.207.150.155',
];

const ALLOWED_IP_RANGES = [
    // Add IP ranges here if needed
    // Example: { start: '192.168.1.1', end: '192.168.1.254' }
];
```

#### 1.3 Update scripts.js - GitHub Integration
**File:** `scripts.js` (around line 840)

Replace with placeholder values:

```javascript
const GITHUB_REPO_OWNER = 'your-org'; // Replace with your GitHub username/org
const GITHUB_REPO_NAME = 'your-repo'; // Replace with your repository name
```

#### 1.4 Replace Logo Files
**Files:** `assets/light-logo.png`, `assets/dark-logo.png`

Replace Hope Ignites logos with generic placeholder logos or remove and provide instructions to add their own.

Create a note in the assets folder:
**File:** `assets/README.md`

```markdown
# Assets Folder

## Required Logo Files

Place your organization's logo files in this directory:

- `light-logo.png` - Logo for light mode (recommended: 300px width, transparent background)
- `dark-logo.png` - Logo for dark mode (recommended: 300px width, transparent background)

## App Icons

Place application icons in the `app-icons/` subdirectory as 46x46px PNG files.
```

#### 1.5 Update index.html - Contact Information
**File:** `index.html` (around line 100-115)

Replace with placeholder text:

```html
<div id="help-modal" class="help-modal">
    <div class="help-modal-content">
        <button class="help-modal-close" aria-label="Close help">&times;</button>
        <h2>Need Help?</h2>
        <p>Contact your IT Help Desk:</p>
        <ul class="help-contact-list">
            <li><strong>Email:</strong> <a href="mailto:helpdesk@yourorg.com">helpdesk@yourorg.com</a></li>
            <li><strong>Phone:</strong> (555) 123-4567</li>
            <li><strong>Hours:</strong> Monday-Friday, 9 AM - 5 PM</li>
            <li><strong>Portal:</strong> <a href="https://support.yourorg.com" target="_blank">support.yourorg.com</a></li>
        </ul>
    </div>
</div>
```

#### 1.6 Update index.html - Page Title
**File:** `index.html` (line 6)

```html
<title>Your Organization - Portal Hub</title>
```

#### 1.7 Clean Up Documentation Files
Remove or sanitize these files:
- **CLAUDE.md** - Remove or update with generic information
- **ROADMAP.md** - Remove or provide generic template
- **PRE-PRODUCTION-CHECKLIST.md** - Provide clean template version

Create a generic README.md (see Part 2 below)

### Step 2: Create Template Documentation

Create a clean README.md that other organizations can follow.

---

## Part 2: Instructions for Other Organizations (Template README)

Below is the content you should provide as the main README.md for organizations using this template:

---

# Portal Hub - Deployment Instructions

A lightweight, single-page HTML portal hub for centralized access to organizational applications and tools. Designed for deployment on CloudFlare Pages with no build process required.

## Features

- ✅ **Zero Dependencies** - Pure HTML, CSS, and JavaScript
- ✅ **Mobile Responsive** - Hamburger menu for mobile devices
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Favorites System** - Pin favorite apps for quick access
- ✅ **Search** - Keyboard-accessible spotlight search (Cmd/Ctrl + K)
- ✅ **IP Detection** - Show office-only applications based on IP address
- ✅ **Badge System** - Visual indicators for Universal, SSO, and office-only apps
- ✅ **Tech Mode** - Special view for IT team tools (access at /tech)
- ✅ **No-Index Protection** - Prevent search engine and AI crawler indexing

---

## Quick Start

### 1. Fork or Download This Repository

```bash
git clone https://github.com/your-org/portal-hub.git
cd portal-hub
```

### 2. Customize for Your Organization

#### A. Add Your Logo
Replace these files with your organization's logos:
- `assets/light-logo.png` (300px width recommended)
- `assets/dark-logo.png` (300px width recommended)

#### B. Configure Applications
Edit `portal-data.json` to add your organization's applications:

```json
{
  "categories": [
    {
      "id": "collaboration",
      "name": "Collaboration",
      "cards": [
        {
          "icon": "📧",
          "title": "Email",
          "description": "Access your organization email",
          "url": "https://mail.yourorg.com",
          "universal": true,
          "sso": true
        }
      ]
    }
  ]
}
```

**Card Properties:**
- `icon`: Emoji or PNG filename from `assets/app-icons/`, OR an object with `light` and `dark` properties for theme-specific icons
- `title`: Application name
- `description`: Brief description
- `url`: Full HTTPS URL
- `universal`: (optional) Show universal badge
- `sso`: (optional) Show SSO badge
- `nhqOnly`: (optional) Only show from office IPs
- `tech`: (optional) Only show in Tech Mode (/tech)

**Light/Dark Mode Icons:**
You can specify different icons for light and dark themes:

```json
{
  "icon": {
    "light": "app-light.png",
    "dark": "app-dark.png"
  },
  "title": "My App",
  "description": "Description",
  "url": "https://app.example.com"
}
```

If only `light` is provided, it will be used in both themes. Icons automatically switch when users toggle dark mode.

#### C. Update Help Desk Contact Info
Edit `index.html` (lines 100-115) with your IT help desk information:

```html
<li><strong>Email:</strong> <a href="mailto:helpdesk@yourorg.com">helpdesk@yourorg.com</a></li>
<li><strong>Phone:</strong> (555) 123-4567</li>
```

#### D. Configure Office IP Detection (Optional)
If you want to show office-only applications, edit `scripts.js` (line 432):

```javascript
const ALLOWED_IPS = [
    '12.34.56.78',    // Add your office public IP
];
```

**Find your office IP:** Visit https://api.ipify.org in a browser from your office network.

#### E. Configure GitHub Version Display (Optional)
Edit `scripts.js` (line 840):

```javascript
const GITHUB_REPO_OWNER = 'your-github-username';
const GITHUB_REPO_NAME = 'your-repo-name';
```

#### F. Update Page Title
Edit `index.html` (line 6):

```html
<title>Your Organization - Portal Hub</title>
```

### 3. Test Locally

Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Or use VS Code Live Server extension
```

### 4. Deploy to CloudFlare Pages

#### Initial Setup

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial portal setup"
   git push origin main
   ```

2. **Create CloudFlare Pages Project:**
   - Go to [CloudFlare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **Connect to Git**
   - Select your GitHub repository
   - Configure build settings:
     - **Build command:** (leave empty)
     - **Build output directory:** `/`
     - **Root directory:** `/`
   - Click **Save and Deploy**

3. **Wait for Deployment** (1-2 minutes)
   - CloudFlare will provide a URL: `https://your-project.pages.dev`

#### Subsequent Deployments

All future updates deploy automatically:

```bash
git add .
git commit -m "Update applications"
git push origin main
```

#### Custom Domain Setup

1. In CloudFlare Pages dashboard, go to your project
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `portal.yourorg.com`)
5. Follow DNS instructions
6. SSL certificate auto-provisions

---

## Customization Guide

### Adding Application Icons

1. Save 46x46px PNG icons to `assets/app-icons/`
2. Reference in `portal-data.json`:
   ```json
   {
     "icon": "my-app.png",
     "title": "My App"
   }
   ```

**Theme-Specific Icons:**

For apps that need different icons in light vs dark mode:

1. Create both icon versions:
   - `my-app-light.png` - Icon optimized for light mode
   - `my-app-dark.png` - Icon optimized for dark mode

2. Reference both in `portal-data.json`:
   ```json
   {
     "icon": {
       "light": "my-app-light.png",
       "dark": "my-app-dark.png"
     },
     "title": "My App"
   }
   ```

The portal will automatically switch icons when users toggle between light and dark themes.

### Changing Brand Colors

Edit `styles.css` (lines 1-32) CSS variables:

```css
:root {
    --bg-gradient-start: #your-color;
    --bg-gradient-end: #your-color;
    --accent-primary: #your-color;
    --accent-secondary: #your-color;
}
```

### Enabling Tech Mode

Add applications with `"tech": true` in `portal-data.json`. Access at `/tech` path.

### Cache Clearing (If Updates Don't Appear)

1. **CloudFlare Dashboard** → Caching → Configuration → **Purge Everything**
2. **Browser:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. **Enable Development Mode** (3-hour bypass in CloudFlare)

---

## File Structure

```
├── index.html              # Main HTML file
├── styles.css              # All styling
├── scripts.js              # All JavaScript
├── portal-data.json        # Application data (customize this!)
├── _redirects              # CloudFlare Pages routing
├── _headers                # Security headers
├── robots.txt              # Block search engines/AI crawlers
├── assets/
│   ├── light-logo.png      # Your light mode logo
│   ├── dark-logo.png       # Your dark mode logo
│   ├── universal.png       # Universal app badge
│   ├── sso-badge.png       # SSO badge
│   ├── hq-badge.png        # Office-only badge
│   └── app-icons/          # Application icons (46x46 PNG)
└── README.md               # This file
```

---

## Security & Privacy

### Search Engine Blocking

This portal includes multiple layers to prevent search engine and AI crawler indexing:

1. ✅ `robots.txt` - Blocks Google, Bing, ChatGPT, Claude, and other crawlers
2. ✅ Meta tags - `noindex, nofollow, noarchive`
3. ✅ HTTP headers - `X-Robots-Tag` via `_headers` file

**Note:** These rely on crawlers respecting the rules. For true security, implement authentication.

### Recommended Security Enhancements

For production use, consider:

- **CloudFlare Access** - Add authentication (email/SSO required)
- **IP Allowlisting** - Restrict to office/VPN IPs only
- **Rate Limiting** - Prevent abuse

---

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Accessibility

- ✅ WCAG 2.1 Level AA compliant
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast ratios

---

## Troubleshooting

### Cards not clickable on mobile
- Already fixed with `pointer-events: none` on overlay when closed

### Search not opening
- Check console for errors
- Verify keyboard shortcut: Cmd/Ctrl + K

### IP detection not working
- Verify office IP in `scripts.js` ALLOWED_IPS array
- Check browser console for IP detection logs
- Test at: https://api.ipify.org

### Changes not appearing after deployment
- Purge CloudFlare cache
- Hard refresh browser (Ctrl+Shift+R)
- Enable Development Mode in CloudFlare

---

## Support

For issues with this portal template, please open an issue on GitHub.

For CloudFlare-specific questions, see [CloudFlare Pages Documentation](https://developers.cloudflare.com/pages/).

---

## License

[Specify your license here - MIT, Apache 2.0, etc.]

---

## Credits

Originally developed by Hope Ignites IT Team.
Template adapted for general organizational use.
