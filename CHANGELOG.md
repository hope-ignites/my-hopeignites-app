# Changelog

All notable changes to the Hope Ignites Application Launcher will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Default favorites tab toggle - Users can now set Favorites as their default landing tab via a compact toggle slider
- **Tech mode default preference** - Users in tech mode can now set `/tech` as their default landing page
  - Toggle in tech mode banner to enable/disable
  - Automatically redirects from root to `/tech` when enabled
  - Preference saved in localStorage
- Toast notification system for important updates:
  - Discrete, non-intrusive notification appears in the lower right
  - Configurable message, link, and icon
  - Auto-dismisses after a set duration or can be closed manually
  - Remembers dismissal per notification ID
  - Easy to enable/disable in code
  - Mobile responsive design
  - Peek/unfurl behavior on hover
- **NEW badge for recently added apps**
  - Green pulsing badge appears on cards with `isNew: true`
  - Supports future date-based triggering with `addedDate` field
  - Automatically highlights apps added within last 14 days (when using dates)
- "Missing app" feedback link below portal cards grid

### Changed
- Toast notification height increased by 8px for improved visibility and consistency.

## [1.4.0] - 2025-11-01

### Added
- Welcome modal for first-time visitors with feedback option
- Feedback form integrated into welcome experience

### Fixed
- Enhanced portal card hover effects with improved box-shadow styles
- Button and card styles now feature ripple and shimmer effects for better interactivity

## [1.3.0] - 2025-10-30

### Added
- Status page link in header and mobile menu
- Favicon support with proper meta tags

### Changed
- Updated status page URL to new domain (up.hopeignites.app)

### Fixed
- Removed outdated copyright notice from footer

### Infrastructure
- Added UptimeRobot heartbeat monitoring meta tag for uptime monitoring

## [1.2.0] - 2025-10-28

### Added
- Comprehensive repository analysis and code review
- Performance optimizations across the codebase

### Changed
- Improved code structure for better readability and maintainability
- Enhanced accessibility features (WCAG 2.1 Level AA compliance)

## [1.1.0] - 2025-10-27

### Added
- New application integrations:
  - Eco (environmental management)
  - Stackium (brand management)
  - WP Engine (tech tools)
- Tech mode hover effects

### Changed
- Updated Eco application icons
- Integrated user feedback request #18280577063

## [1.0.0] - 2025-10-26

### Added
- **Progressive Web App (PWA) functionality**
  - Service worker for offline support
  - App manifest for installability
  - Cache management
  - Updated PWA names and metadata
- Application Launcher rebranding complete

### Changed
- Major visual refresh with new branding
- Updated logo assets for light and dark modes

## [0.9.0] - 2025-10-24

### Added
- **Tech Mode** - Special view at `/tech` path for tech team tools
  - Tech mode banner with orange gradient
  - Dedicated tech tools category
  - Tech-specific application filtering
- **Dark/Light Theme Support**
  - Dynamic icon switching based on theme
  - Theme-aware logos
  - Improved contrast for both modes
- Cloudflare Web Analytics integration

### Changed
- Moved HQ badge to assets folder for better organization
- Updated Program Participant Management App URL
- Default category set to "All Applications"
- Application cards now sort alphabetically in "All Applications" view
- Adjusted logos for consistent branding
- Added new ADP Admin logo

### Fixed
- Icon rendering for theme-aware applications
- Portal data structure improvements

## [0.8.0] - 2025-10-23

### Added
- **SEO Prevention** - Meta tags and headers to prevent search engine indexing
  - robots.txt file
  - noindex, nofollow meta tags
  - _headers file for CloudFlare

### Changed
- Enhanced mobile drawer overlay functionality
- Improved click handling for drawer open and closed states

## [0.7.0] - 2025-10-22

### Added
- **Mobile Hamburger Menu** - Complete mobile navigation overhaul
  - Slide-out drawer for mobile devices
  - Mobile search trigger
  - Mobile dark mode toggle
  - Category navigation in mobile view
- **Badge System Enhancement**
  - SSO badge for Single Sign-On enabled applications
  - Universal badge for apps available to all team members
  - HQ badge for NHQ-only applications
- **NHQ IP Detection** - Automatic detection and filtering of location-specific apps
- New application icons:
  - Dialpad
  - Entra ID
  - GitHub
  - LMS Admin
  - Scribe

### Changed
- Removed beta banner (moved to production)
- Enhanced mobile badge display and layout
- Improved favorites manager with badge indicators
- Refactored tab rendering functions for better performance

### Fixed
- Mobile search overlay handling
- Badge visibility on mobile devices

## [0.6.0] - 2025-10-22

### Added
- **Tech Mode Filtering** - Categories and favorites now respect tech mode
- Tech mode indicator in UI
- Enhanced portal functionality with location-aware features

### Changed
- Updated application descriptions for clarity
- Improved card presentation

## [0.5.0] - Earlier

### Added
- **Favorites/Pinning System** - Users can pin favorite apps
- **Dark Mode Toggle** - Switch between light and dark themes
- **Spotlight Search** - Keyboard-accessible fast search (Cmd/Ctrl+K or /)
- **Tab Navigation** - Category-based organization with smooth scrolling
- **Quick Links** - Secondary navigation section
- **Badge Legend** - Collapsible guide explaining all badge types
- **Responsive Design** - Mobile-first approach with adaptive layouts
- Portal cards with 46x46 PNG icons
- Application categories and organization

### Infrastructure
- CloudFlare Pages deployment
- Automatic deployments from main branch
- Cache management with _redirects file
- SPA routing support

## [0.1.0] - Initial Release

### Added
- Basic HTML portal structure
- CSS styling foundation
- JavaScript functionality core
- JSON-based application data
- CloudFlare Pages hosting setup

---

## Version Information

- **Current Version**: 1.4.0
- **Release Date**: November 7, 2025
- **Repository**: hope-ignites/my-hopeignites-app
- **Hosting**: CloudFlare Pages
- **License**: Proprietary (Hope Ignites Internal)

## Categories of Changes

This changelog follows these categories:
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes
- **Infrastructure** - Deployment and hosting changes
