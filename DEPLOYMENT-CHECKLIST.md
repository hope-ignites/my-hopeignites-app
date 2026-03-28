# 🚀 CloudFlare Pages Deployment Checklist

## Pre-Deployment Verification

### ✅ Files Ready
- [x] `index.html` - Main HTML file
- [x] `styles.css` - All styles including onboarding
- [x] `scripts.js` - All JavaScript logic including onboarding
- [x] `portal-data.json` - Portal application data
- [x] `onboarding-data.json` - Onboarding steps with documentation
- [x] `_redirects` - CloudFlare Pages routing (handles /tech and /onboarding)
- [x] `manifest.json` - PWA configuration
- [x] `service-worker.js` - PWA offline support
- [x] `assets/` - All images and icons

### ✅ Routing Configuration
- [x] `_redirects` file configured for SPA routing
- [x] All routes (`/`, `/tech`, `/onboarding`) serve `index.html`
- [x] Scripts detect current route and render appropriate content

### ✅ Onboarding Feature
- [x] Onboarding page renders at `/onboarding`
- [x] Progress tracking with localStorage
- [x] Interactive checkboxes and progress bar
- [x] Responsive mobile design
- [x] Tab only visible on onboarding route
- [x] Documentation added to CLAUDE.md

### ✅ Local Testing Completed
Test these URLs before deploying:
- [ ] `http://localhost:8000/` - Main launcher
- [ ] `http://localhost:8000/#onboarding` - Onboarding page
- [ ] `http://localhost:8000/#tech` - Tech mode
- [ ] Check dark mode toggle
- [ ] Check mobile responsive design (< 768px)
- [ ] Test checkbox progress tracking
- [ ] Verify localStorage persistence (refresh page)

## Deployment Steps

### Option 1: Git Push (Automatic Deployment)
```bash
git add .
git commit -m "Add onboarding feature for new hires"
git push origin main
```
CloudFlare will automatically detect the push and deploy within 1-2 minutes.

### Option 2: Manual Deploy via CloudFlare Dashboard
1. Go to CloudFlare Pages dashboard
2. Navigate to your project
3. Click "Create deployment"
4. Select branch: `main`
5. Click "Deploy"

## Post-Deployment Verification

After deployment completes, test these production URLs:

### Main Routes
- [ ] `https://your-domain.com/` - Main launcher loads
- [ ] `https://your-domain.com/onboarding` - Onboarding page loads
- [ ] `https://your-domain.com/tech` - Tech mode loads
- [ ] All routes show correct content (not 404 errors)

### Functionality Tests
- [ ] Portal cards render correctly
- [ ] Onboarding checkboxes work
- [ ] Progress bar updates
- [ ] localStorage saves progress
- [ ] Dark mode toggle works
- [ ] Mobile hamburger menu works
- [ ] Search functionality works
- [ ] PWA installation works

### Performance Checks
- [ ] Page loads under 3 seconds
- [ ] All images load correctly
- [ ] No console errors in browser DevTools
- [ ] Service worker registers successfully

## Cache Management

If changes don't appear immediately after deployment:

1. **Purge CloudFlare Cache**:
   - CloudFlare Dashboard → Caching → Configuration
   - Click "Purge Cache" → "Purge Everything"

2. **Enable Development Mode** (3-hour bypass):
   - CloudFlare Dashboard → Caching → Configuration
   - Toggle "Development Mode" to ON

3. **Browser Hard Refresh**:
   - Chrome/Edge: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
   - Firefox: `Ctrl + F5`

## Next Steps After Deployment

1. **Share Onboarding Link**: Send `/onboarding` URL to new hires
2. **Monitor Analytics**: Check CloudFlare Analytics for traffic
3. **Gather Feedback**: Ask new hires about onboarding experience
4. **Iterate**: Add more onboarding steps as needed in `onboarding-data.json`

## Need Help?

- **Documentation**: See [CLAUDE.md](CLAUDE.md) for full technical docs
- **Onboarding Config**: See [onboarding-data.json](onboarding-data.json) for step templates
- **CloudFlare Docs**: https://developers.cloudflare.com/pages/

---

**Last Updated**: March 28, 2026
**Feature**: Onboarding Mode v1.0
