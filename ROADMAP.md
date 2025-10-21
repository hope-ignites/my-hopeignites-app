# Hope Ignites Portal - Roadmap

This document tracks potential future enhancements and features for the portal.

## Authentication & Security

### CloudFlare Access (Zero Trust Authentication)
**Status**: Not implemented
**Priority**: Medium
**Effort**: Low (configuration only, no code changes)

Add CloudFlare Access to require employee authentication before accessing the portal.

**Benefits**:
- Secure authentication for internal portal
- Integration with existing identity providers (Google Workspace, Azure AD, GitHub, etc.)
- No code changes required - configured entirely in CloudFlare dashboard
- Better security than IP-based restrictions

**Pricing**:
- **FREE** for up to 50 users
- **$3/user/month** for Access only (beyond 50 users)
- **$7/user/month** for full Zero Trust bundle (Access + Gateway)

**Setup Steps**:
1. Go to CloudFlare Dashboard → Zero Trust
2. Configure identity provider (Google Workspace, Azure AD, etc.)
3. Create Access policy for the portal domain
4. Set authentication rules (who can access)
5. Test with team members

**Documentation**: [CloudFlare Access Docs](https://developers.cloudflare.com/cloudflare-one/applications/)

---

## Analytics & Monitoring

### CloudFlare Web Analytics
**Status**: Not implemented
**Priority**: Low
**Effort**: Low (add script tag)

Add privacy-first analytics to track portal usage.

**What it provides**:
- Page views and unique visitors
- Referrers and traffic sources
- Browser and device information
- Geographic location
- Page load performance metrics

**Setup Steps**:
1. Go to CloudFlare Dashboard → Analytics & Logs → Web Analytics
2. Click "Add a site"
3. Copy the analytics script tag
4. Add script to index.html before closing `</body>` tag
5. Deploy changes

**Built-in Alternative**: CloudFlare Pages includes automatic analytics in the dashboard (Workers & Pages → Your Project → Analytics tab) with visits, requests, bandwidth, and performance metrics.

---

## Feature Enhancements

### User Feedback Form
**Status**: Not implemented
**Priority**: Low
**Effort**: Medium

Add a feedback form to the help modal for users to submit suggestions or report issues.

**Considerations**:
- Would require a backend service (CloudFlare Workers + D1/KV)
- Could use CloudFlare Turnstile for bot protection
- Alternative: Link to external form (Google Forms, Typeform, etc.)

---

## Performance & Optimization

### Image Optimization
**Status**: Not implemented
**Priority**: Low
**Effort**: Low

Optimize logo and icon assets using CloudFlare Images or WebP format.

**Benefits**:
- Faster page load times
- Reduced bandwidth usage
- Better performance on mobile devices

---

## Accessibility

### Enhanced Keyboard Navigation
**Status**: Partial (basic keyboard nav exists)
**Priority**: Low
**Effort**: Low

Improve keyboard navigation for portal cards and quick links.

**Potential improvements**:
- Skip navigation link
- Better focus indicators
- Keyboard shortcuts for common actions
- Search/filter functionality

---

## Notes

This roadmap is not prioritized or scheduled. Items listed here are potential enhancements to consider as the portal evolves based on user needs and feedback.
