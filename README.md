# Hope Ignites Portal Hub

A single-page HTML portal hub for Hope Ignites employees, providing centralized access to organizational applications and tools.

## Features

- **Portal Cards** - Grid of application links organized by category
- **Quick Links** - Secondary navigation for frequently accessed tools
- **Dark Mode** - Toggle between light and dark themes
- **Favorites System** - Pin favorite apps for quick access
- **Search** - Spotlight-style search across all applications
- **IP Detection** - Location-based informational messages
- **Responsive Design** - Mobile-friendly interface
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
├── portal-data.json        # Application data
├── _redirects              # CloudFlare Pages routing
├── assets/                 # Logo and icon files
├── CLAUDE.md               # Development instructions
└── README.md               # This file
```

## Making Changes

### Adding a New Application

Edit `portal-data.json` and add a new card to the appropriate category:

```json
{
  "icon": "🔧",
  "title": "App Name",
  "description": "Brief description",
  "url": "https://app.example.com"
}
```

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

## Security & Privacy

- All application links use HTTPS
- No user data is collected or stored on servers
- IP detection is client-side only (localStorage) and informational
- No cookies or tracking

## License

Copyright Hope Ignites. All rights reserved.

## Support

For technical support or to request new applications, contact the Help Desk via the help button in the portal.
