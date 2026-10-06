# Hope Ignites Application Launcher — Admin Guide

This guide explains how the Application Launcher is built, how it is deployed, and how Hope Ignites Technology Services maintains and supports it day to day.

---

## 1. What it is

The Application Launcher is a single web page that gives Hope Ignites team members one place to find every organizational application (Outlook, SharePoint, Hopeforce, payroll, training, and so on). It also hosts a guided **New Hire Onboarding** page.

It is a **static website**: plain HTML, CSS, and JavaScript files with no server, no database, and no build step. What is in the GitHub repository is exactly what users get.

| Item | Value |
| --- | --- |
| Source code | [github.com/hope-ignites/my-hopeignites-app](https://github.com/hope-ignites/my-hopeignites-app) (branch `main`) |
| Hosting | Cloudflare Pages (auto-deploys from `main`) |
| Production URL | `https://my.hopeignites.app` |
| Onboarding URL | `https://my.hopeignites.app/onboarding` |
| Tech team view | `https://my.hopeignites.app/tech` |

---

## 2. How it is built

### Files

Most day-to-day changes only touch the two JSON data files. The HTML, CSS, and JavaScript files only change when the layout or behavior changes.

| File | Purpose | How often you edit it |
| --- | --- | --- |
| `portal-data.json` | All application cards, categories, and Quick Links | Often |
| `onboarding-data.json` | Onboarding steps, welcome message, and the Microsoft 365 setup question | Occasionally |
| `assets/app-icons/` | Application icons (PNG, about 46×46 px) | When adding apps |
| `index.html` | Page structure, Help modal contact details, support banner, footer | Rarely |
| `styles.css` | All styling, including light/dark themes | Rarely |
| `scripts.js` | All behavior (rendering, search, favorites, onboarding, IP detection) | Rarely |
| `service-worker.js` | Offline caching for the installable app (PWA) | When releasing CSS/JS changes |
| `manifest.json` | Installable app name, icons, and colors | Rarely |
| `_redirects` | Sends every URL (such as `/tech` and `/onboarding`) to `index.html` | Never |
| `_headers` | Tells search engines not to index the site | Never |
| `CHANGELOG.md` | Release notes, linked from the page footer | Every release (recommended) |

### How a page load works

1. The browser loads `index.html`, `styles.css`, and `scripts.js`.
2. `scripts.js` downloads `portal-data.json` (always fresh, never cached) and draws the category dropdown, the app cards, and the Quick Links.
3. If the URL is `/onboarding`, it also downloads `onboarding-data.json` and shows the onboarding page instead of the app grid.
4. In the background it looks up the visitor's public IP address. If the address belongs to Network Headquarters (NHQ), it shows the "Hope On The Hill Network Detected" banner and reveals NHQ-only apps.
5. The footer asks the GitHub API for the latest commit on `main` and shows it as the version number.

Everything a user personalizes (favorites, dark mode, onboarding progress) is stored **only in that user's browser**. Nothing is sent to a server, and nothing carries over between devices or browsers.

---

## 3. Features and how they work

### Views (routes)

| URL | What users see |
| --- | --- |
| `/` | The standard launcher: badge legend, support banner, app grid, Quick Links |
| `/tech` | Same as `/`, plus cards marked `"tech": true` and the Tech Team Tools category moved near the top. Tech staff can make this their default view. |
| `/onboarding` | The New Hire Onboarding page (see below). The support banner, "Is there an app missing?", and "More information" sections are hidden here; Quick Links stay. |

### Application cards and badges

Each card comes from `portal-data.json`. Optional flags on a card control what appears:

| Flag | Effect |
| --- | --- |
| `"universal": true` | Shows the "available to all team members" badge |
| `"sso": true` | Shows the Single Sign-On badge |
| `"nhqOnly": true` | Card only appears for visitors on an NHQ network, with the HQ badge |
| `"tech": true` | Card only appears in Tech Mode (`/tech`) |
| `"isNew": true` | Marks the card as **NEW** until you remove the flag |
| `"addedDate": "YYYY-MM-DD"` | Marks the card as **NEW** automatically for 14 days after that date |

### NHQ network detection

The launcher compares the visitor's public IP address against a list in `scripts.js` (`ALLOWED_IPS` and `ALLOWED_IP_RANGES`). The result is cached in the browser for one hour.

> **Important:** this is a convenience feature, not security. Anyone can read the page source or bypass the check. Never rely on it to protect an application. Access control must be enforced by the application itself (for example, through Microsoft 365 sign-in).

### New Hire Onboarding (`/onboarding`)

The onboarding page walks a new hire through setup in this order:

1. **Network Preview notice** (orange banner at the top). Remove it when onboarding is officially launched.
2. **Microsoft 365 question:** "Have you set up your hopeignites.org Microsoft 365 account yet?"
   - **Yes** takes them straight to device selection.
   - **No** shows instructions (get credentials from the supervisor's message, sign in at `m365.cloud.microsoft/login`) and a button to mark it complete, which then continues to device selection.
3. **Device type:** Organization Issued or BYOD (personal device).
4. **Operating system:** detected automatically (Windows, Mac, Linux); the user can override it.
5. **Checklist of steps** with a progress bar. Step text can differ by device type and operating system.

All answers and progress are saved in the new hire's browser, so they can close the page and come back later on the same device.

### Other user-facing features

- **Favorites and Recently Used:** users pin apps with the star; recently opened apps appear in their own category.
- **Search:** a Spotlight-style search across every app (search button or keyboard shortcut).
- **Dark mode:** toggle in the header; the logo and any theme-specific icons switch automatically.
- **Installable app (PWA):** users can "Add to Home Screen" on phones or install from Chrome/Edge on desktop. A service worker keeps a copy of the core files for offline use.
- **Welcome modal:** shown once to first-time visitors (never on the onboarding page).
- **Toast notification:** an optional announcement pop-up, configured at the top of `scripts.js`.
- **Support banner:** "Need Help? Visit hopeignites.org/help…" between the badge legend and the apps. This promotes the Jira Service Management support portal.
- **Help button (?):** opens a modal with Technology Services contact details.
- **Refresh apps button:** lets a user pull the latest app list without a full page reload.

---

## 4. Common maintenance tasks

All edits can be made directly on GitHub in the browser (open the file, click the pencil icon, commit to `main`) or locally in an editor. Every commit to `main` goes live in 1–2 minutes.

**Always validate JSON before committing.** A single missing comma in `portal-data.json` will leave the launcher with no apps. Paste the file into a JSON validator such as [jsonlint.com](https://jsonlint.com), or let VS Code/Cursor highlight errors.

### Add an application

1. Add the icon to `assets/app-icons/` (PNG, square, about 46×46 px; transparent background recommended).
2. In `portal-data.json`, find the right category in `categories` and add a card to its `cards` list:

   ```json
   {
     "icon": { "light": "my-app.png", "dark": "my-app.png" },
     "title": "My App",
     "description": "One-line description of what it does",
     "url": "https://myapp.example.com",
     "universal": true,
     "sso": true,
     "addedDate": "2026-10-06"
   }
   ```

3. Make sure the card before it ends with a comma, and this card does not if it is the last one in the list.

To use a different icon in dark mode, give `dark` a different filename. To remove an app, delete its card object (and its trailing comma).

### Add a category

Add a new object to `categories` with a unique `id`, a display `name`, and a `cards` list. Do not remove the `all` or `favorites` categories; the page relies on them.

### Edit Quick Links

Edit the `quickLinks` list at the bottom of `portal-data.json`. Each link needs a `title` and a `url`.

### Edit onboarding content

- **Welcome text:** `welcomeMessage` in `onboarding-data.json`.
- **Microsoft 365 question and instructions:** the `m365Setup` block in `onboarding-data.json` (question, button labels, instruction lines, login URL).
- **Steps:** the `steps` list. Each step has an `id`, `title`, `description`, `buttonText`, `buttonUrl`, `buttonIcon` (inline SVG), and `notes`. The comments at the top of the file explain how to add steps and where to find icons.
- **Device/OS-specific text:** add a variant block to a step (`byod_mac`, `byod_pc`, `org_mac`, `org_pc`, `mac`, `pc`, or `linux`) containing only the fields that differ. The most specific match wins: `byod_mac`, then `mac`, then the step's base fields.
- **Network Preview notice:** in `scripts.js`, search for `onboarding-preview-notice` and delete that block when onboarding goes live.

Do not change a step's `id` after launch. Progress is saved by `id`, so renaming it resets that step for everyone.

### Update NHQ IP addresses

In `scripts.js`, search for `ALLOWED_IPS`. Add single addresses to `ALLOWED_IPS`, or ranges to `ALLOWED_IP_RANGES` as `{ start: '…', end: '…' }`. Include a comment naming each location.

### Show an announcement (toast notification)

At the top of `scripts.js`, edit `NOTIFICATION_CONFIG`: set `enabled: true`, write the `message`, `linkText`, and `linkUrl`, and **change the `id`** to something new (for example `benefits-oct-2026`). Users who dismissed a previous announcement only see a new one if the `id` changes. Set `enabled: false` to turn it off.

### Update Help desk contact details

In `index.html`, search for `help-modal` and edit the contact list (web, email, phone, hours).

### Update the support banner

In `index.html`, search for `support-portal-banner`.

---

## 5. Testing changes locally

There is no build step. From the project folder, start a simple web server and open it in a browser:

```bash
python3 -m http.server 8080
```

Then visit:

| What to test | Local URL |
| --- | --- |
| Launcher | `http://localhost:8080/` |
| Tech Mode | `http://localhost:8080/?tech=true` |
| Onboarding | `http://localhost:8080/?onboarding=true` |

`/tech` and `/onboarding` paths only work on Cloudflare (they depend on `_redirects`), so use the query-string versions locally. Opening `index.html` directly as a file will not work because browsers block loading the JSON files that way.

**Testing NHQ-only apps from outside NHQ:** open the browser developer console and run:

```js
isNHQIP = true; renderCards();
```

**Restarting onboarding from the beginning:** in the developer console, run:

```js
['onboarding_m365_setup', 'onboarding_device_type', 'onboarding_os_override', 'onboarding_progress']
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

---

## 6. Deployment

### Normal releases

Cloudflare Pages watches the `main` branch on GitHub. Every push to `main` deploys automatically, usually within 1–2 minutes. There is no build command; Cloudflare publishes the repository root as-is. You can watch progress in the Cloudflare dashboard under **Workers & Pages → (project) → Deployments**, and roll back by choosing an earlier deployment there.

```bash
git add <changed files>
git commit -m "Describe the change"
git push origin main
```

### Release checklist when CSS or JavaScript changes

Changes to only `portal-data.json` or `onboarding-data.json` appear right away, because the page always re-downloads them. Changes to `styles.css` or `scripts.js` can be hidden by browser and service-worker caches, so do these steps too:

1. In `index.html`, bump the version on both file references, for example `styles.css?v=1.1.5` → `styles.css?v=1.1.6` and the same for `scripts.js`.
2. In `service-worker.js`, bump `CACHE_NAME` (for example `hopeignites-app-launcher-v3` → `-v4`) and update the versioned file names in `urlsToCache` to match.
3. Add an entry to `CHANGELOG.md`.
4. After deployment, hard-refresh (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows) and confirm the footer version matches your commit.
5. If users still see old content, purge the cache in Cloudflare: **Caching → Configuration → Purge Everything**.

### Things to know

- **Every file in the repository is published.** Anything committed (including Markdown documentation) can be opened by URL on the live site. Never commit passwords, API keys, or internal-only information.
- The site sends `noindex` headers so search engines do not list it, but it is not private.
- Custom domain and SSL are managed in Cloudflare Pages under **Custom domains**; certificates renew automatically.

---

## 7. Support and troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No apps appear, or "Unable to load" | Broken JSON in `portal-data.json` | Validate the JSON, fix the error, and push. Roll back in Cloudflare if urgent. |
| Onboarding page says it cannot load | Broken JSON in `onboarding-data.json` | Same as above. |
| A user sees an old layout or styling | Cached CSS/JS in the browser or service worker | User hard-refreshes. If widespread, follow the release checklist and purge the Cloudflare cache. |
| An NHQ user cannot see NHQ-only apps | Office IP changed or is missing from `ALLOWED_IPS`; or the IP is cached for an hour | Confirm the office's public IP (search "what is my IP" from the office), update `ALLOWED_IPS`, and have the user wait an hour or clear site data. |
| A remote user sees NHQ-only apps | They are on a listed network (for example a VPN) | Expected behavior; the feature is informational only. |
| A new hire wants to start onboarding over | Progress is saved in their browser | Use the reset snippet in section 5, or clear site data for the launcher in browser settings. |
| A user lost their favorites | They switched browsers/devices or cleared browser data | Favorites are stored per browser and cannot be recovered. |
| Footer shows "Version: unknown" | GitHub's API limits anonymous requests to 60 per hour per IP address | Harmless; it clears on its own. Common in offices where many users share one IP. |
| The Tech Mode default keeps sending a user to `/tech` | They enabled "default to Tech Mode" | Turn off the toggle in Tech Mode, or remove `tech_mode_default` from site data. |

### Browser storage reference

These keys live in each user's browser (developer tools → Application → Local Storage). Clearing them resets the matching feature.

| Key | What it stores |
| --- | --- |
| `app_launcher_favorites` | Pinned apps |
| `app_launcher_recently_used` | Recently opened apps |
| `app_launcher_default_tab` | Whether Favorites is the default tab |
| `darkMode` | Light or dark theme |
| `tech_mode_default` | Always open in Tech Mode |
| `welcomeModalDismissed` | Welcome pop-up already seen |
| `dismissed_notifications` | Announcements the user closed |
| `user_ip_data` | Cached IP address (expires after 1 hour) |
| `onboarding_m365_setup` | Microsoft 365 question answer (`yes`, `no`, or `completed`) |
| `onboarding_device_type` | `org` or `byod` |
| `onboarding_os_override` | Manually chosen operating system |
| `onboarding_progress` | Completed onboarding steps |

### Getting help with the launcher itself

Team members report problems or missing apps through the Help button, the "Is there an app missing?" feedback form, or [hopeignites.org/help](https://hopeignites.org/help).

---

## 8. Known issues and housekeeping

These were noted while writing this guide and are worth addressing:

1. **"Protected by Cloudflare Turnstile" badge:** Turnstile is not implemented in the site's code. Confirm whether it is configured at the Cloudflare level (for example via a WAF or challenge rule). If not, remove the badge so it does not overstate the site's protection.
2. **Leftover Salesforce files:** the repository still tracks a `.sfdx/` folder unrelated to the launcher. It has been deleted locally but not committed. Commit the deletion and add `.sfdx/` to `.gitignore`.
3. **Outdated developer notes:** `CLAUDE.md` and `README.md` reference old line numbers and file sizes. Treat this guide as the current reference.
