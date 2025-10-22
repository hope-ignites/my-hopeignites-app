# Pre-Production Checklist

This document tracks tasks that must be completed before the portal goes into production.

## Code Cleanup

### Remove Beta Banner
**Status**: ⏳ To Do
**Location**: [index.html:11-14](index.html#L11-L14), [scripts.js](scripts.js)

Remove the beta banner before going live:

**HTML to remove** (lines 11-14 in index.html):
```html
<div id="beta-banner" class="beta-banner" role="region" aria-label="Beta site notification" hidden>
    <div class="beta-text">BETA — This site is in beta. Some features may be incomplete. Hosted on Cloudflare Pages. Please send feedback <a target="_blank" rel="noopener noreferrer" href="...">here.</a></div>
    <button class="beta-close" id="beta-close" aria-label="Dismiss banner">×</button>
</div>
```

**JavaScript to remove**:
- Search for `beta-banner` related code in scripts.js and remove the banner dismiss functionality

**CSS to remove or keep**:
- Beta banner styles in styles.css (can be left for future use or removed)

### Remove Debug Logging
**Status**: ⏳ To Do
**Location**: [scripts.js:166-194](scripts.js#L166-L194)

Remove all `console.log('DEBUG - ...')` statements from the icon rendering code. These were added for troubleshooting and should not be in production.

**Lines to remove**:
- Line 166: `console.log('DEBUG - Card:', card.title);`
- Line 167: `console.log('DEBUG - Icon value:', card.icon);`
- Line 168: `console.log('DEBUG - Icon type:', typeof card.icon);`
- Line 169: `console.log('DEBUG - Has .png?', card.icon && card.icon.includes('.png'));`
- Line 170: `console.log('DEBUG - ICON_BASE_PATH:', ICON_BASE_PATH);`
- Line 175: `console.log('DEBUG - Full image path:', fullPath);`
- Line 177: `console.log('DEBUG - iconHtml (img):', iconHtml);`
- Line 180: `console.log('DEBUG - iconHtml (emoji):', iconHtml);`
- Line 194: `console.log('DEBUG - Final card HTML:', cardLink.innerHTML);`

**Keep**:
- Line 80: `console.log('Portal data loaded successfully');` - This is useful for production
- Line 83: `console.error('Error loading portal data:', error);` - Keep error logging

---

## Content Review

### Update Placeholder Contact Information
**Status**: ⏳ To Do
**Location**: [index.html:113](index.html#L113)

The help modal currently shows a placeholder phone number: `1 (555) 555-5555`

**Action**: Update to the real Hope Ignites Technology Services help desk phone number, or remove if not ready.

### Review Application URLs
**Status**: ⏳ To Do
**Location**: [portal-data.json](portal-data.json)

Review all application URLs to ensure they are correct and accessible:
- [ ] Outlook Web Access
- [ ] File Sharing (OneDrive)
- [ ] Network Hub (SharePoint)
- [ ] ADP Workforce Now
- [ ] ADP Workforce Now Admin
- [ ] Hopeforce (Salesforce)
- [ ] Hopeforce Apps

### Review Quick Links
**Status**: ⏳ To Do
**Location**: [portal-data.json:74-91](portal-data.json#L74-L91)

Update placeholder quick links:
- [ ] "Quick Link 3" pointing to sharepoint.com
- [ ] "Quick Link 4" pointing to onedrive.live.com

Replace with actual Hope Ignites resources.

---

## Configuration

### Update Beta Banner
**Status**: ⏳ To Do
**Location**: [index.html:12](index.html#L12)

Current banner text: "BETA — This site is in beta. Some features may be incomplete. Hosted on Cloudflare Pages."

**Options**:
1. Update banner text to reflect production status
2. Remove banner entirely by deleting lines 11-14 in index.html
3. Keep as-is if soft launch is planned

### Verify GitHub Repository Info
**Status**: ✅ Complete
**Location**: [scripts.js:653-655](scripts.js#L653-L655)

Commit ID version display is correctly configured:
- `GITHUB_REPO_OWNER`: hope-ignites
- `GITHUB_REPO_NAME`: my-hopeignites-app
- `BRANCH`: main

### Review IP Detection Configuration
**Status**: ⏳ To Do
**Location**: [scripts.js:277-369](scripts.js#L277-L369)

If using IP detection feature:
- [ ] Add authorized IP addresses to `ALLOWED_IPS` array
- [ ] Configure IP ranges in `ALLOWED_IP_RANGES` if needed
- [ ] Customize the displayed message content (lines 351-359)
- [ ] Test with actual office/network IPs

If NOT using IP detection:
- [ ] Clear the `ALLOWED_IPS` array (set to `[]`)
- [ ] Clear the `ALLOWED_IP_RANGES` array (set to `[]`)

---

## Testing

### Cross-Browser Testing
**Status**: ⏳ To Do

Test portal functionality in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Test checklist per browser**:
- [ ] All icons load correctly
- [ ] All application cards are clickable
- [ ] Favorites system works (add/remove)
- [ ] Tab navigation works
- [ ] Search functionality works (Cmd+K / Ctrl+K / /)
- [ ] Dark mode toggle works
- [ ] Help modal opens and closes
- [ ] Beta banner can be dismissed (if keeping it)
- [ ] Quick links work
- [ ] Footer version info displays

### Application Link Testing
**Status**: ⏳ To Do

Verify all application links work:
- [ ] Click each portal card
- [ ] Confirm it goes to the correct destination
- [ ] Verify user has appropriate access

### Icon Assets
**Status**: ✅ Verified

All icon files exist in `assets/app-icons/`:
- ✅ adp.png
- ✅ campaign-monitor.png
- ✅ canva.png
- ✅ experience-app.png
- ✅ m365.png
- ✅ one-drive.png
- ✅ outlook.png
- ✅ qbo.png
- ✅ salesforce.png
- ✅ sharepoint.png

---

## Security

### Repository Visibility
**Status**: ⏳ Review

Current repository: `https://github.com/hope-ignites/my-hopeignites-app`

**Decision needed**: Should this remain public or be made private?

**If making private**:
- CloudFlare Pages will still work with private repos
- Better for internal tools with organization-specific data

**If keeping public**:
- Code is already safe (no credentials or secrets)
- Consider removing organization-specific URLs from portal-data.json
- Move sensitive config to CloudFlare Pages environment variables

### Consider CloudFlare Access
**Status**: 🗺️ Roadmap Item

See [ROADMAP.md](ROADMAP.md#cloudflare-access-zero-trust-authentication) for details on adding authentication.

**Recommended for production** to ensure only authorized employees can access the portal.

---

## Documentation

### Update CLAUDE.md
**Status**: ⏳ To Do

Review and update project documentation to reflect:
- [ ] Any architecture changes
- [ ] Final icon configuration approach
- [ ] Any new features added
- [ ] Updated deployment instructions

### README.md Review
**Status**: ⏳ To Do

Ensure README is up to date and includes:
- [ ] Accurate project description
- [ ] Deployment status and URL
- [ ] How to contribute (if applicable)
- [ ] Contact information for maintainers

---

## Deployment

### Custom Domain Setup
**Status**: ⏳ To Do
**Current URL**: `https://my.hopeignites.app` (or CloudFlare Pages default)

If using a custom domain:
1. [ ] Configure custom domain in CloudFlare Pages
2. [ ] Update DNS settings
3. [ ] Verify SSL certificate is active
4. [ ] Test custom domain access

### Environment Setup
**Status**: ⏳ To Do

Verify CloudFlare Pages deployment settings:
- [ ] Production branch is set to `main`
- [ ] Build command is empty (static site)
- [ ] Build output directory is `/`
- [ ] Deployment notifications are configured (optional)

---

## Post-Launch

### Monitor Initial Usage
- [ ] Check CloudFlare Pages Analytics
- [ ] Review browser console for any errors
- [ ] Collect user feedback
- [ ] Monitor help desk tickets related to portal

### Optional: Add Analytics
See [ROADMAP.md](ROADMAP.md#cloudflare-web-analytics) for CloudFlare Web Analytics setup.

---

## Notes

- This checklist should be reviewed and updated as the project evolves
- Mark items as complete with ✅ as you finish them
- Add new items as needed
- Once all items are ✅, the portal is ready for production!

---

**Last Updated**: 2025-10-22
**Status**: Pre-Production (Beta Testing)
