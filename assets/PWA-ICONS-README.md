# PWA Icons Required

For the Progressive Web App (PWA) functionality to work properly, you need to create and add the following icon files to this `assets/` directory:

## Required Icons

### 1. `pwa-icon-192.png` (192x192 pixels)
- **Purpose**: Small app icon for mobile devices
- **Usage**: Home screen icon, app launcher
- **Format**: PNG with transparent or solid background
- **Recommendation**: Use your Hope Ignites logo on a solid background matching your brand color

### 2. `pwa-icon-512.png` (512x512 pixels)
- **Purpose**: Large app icon for high-resolution displays
- **Usage**: Splash screen, app stores, Android prompts
- **Format**: PNG with transparent or solid background
- **Recommendation**: Same design as 192px version, just larger resolution

### 3. `screenshot-mobile.png` (390x844 pixels - Optional)
- **Purpose**: Preview screenshot for app install prompts
- **Usage**: Shown to users before they install the app
- **Format**: PNG screenshot of the portal on mobile
- **Recommendation**: Take a screenshot of the portal in mobile view

## How to Create PWA Icons

### Option 1: Use Your Existing Logo
1. Open your Hope Ignites logo in an image editor (Photoshop, Figma, Canva, etc.)
2. Place it on a solid background (use theme color: `#ff6b35` or `#0f3460`)
3. Add padding around the logo (about 10-15% of canvas size)
4. Export as:
   - `pwa-icon-192.png` at 192x192px
   - `pwa-icon-512.png` at 512x512px

### Option 2: Use an Online PWA Icon Generator
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo
3. Select "Generate Icons"
4. Download the 192x192 and 512x512 versions
5. Rename them to match the required filenames above

### Option 3: Use Favicon Generator
1. Go to https://realfavicongenerator.net/
2. Upload your logo
3. Customize the appearance for iOS and Android
4. Download and extract the icons
5. Rename the appropriate sizes to match requirements

## Testing Your PWA

After adding the icons:

1. **Deploy to CloudFlare Pages**: Push your changes
2. **Test on Mobile**:
   - Open the portal in Chrome (Android) or Safari (iOS)
   - Look for "Add to Home Screen" or "Install App" prompt
   - Install the app
   - Verify the icon appears correctly on your home screen

3. **Verify in Browser DevTools**:
   - Open Chrome DevTools (F12)
   - Go to "Application" tab
   - Check "Manifest" section
   - Verify all icons load correctly

## Current Status

⚠️ **PWA icons are not yet added.** The manifest.json file references these icons, but you need to create and add them to this directory for the PWA to work properly.

Once you add the icons, users will be able to:
- Install the portal as an app on their phones
- Access it from their home screen
- Use it offline (cached content)
- Get a native app-like experience

## Placeholder Alternative

If you want to test PWA functionality immediately, you can:
1. Copy `light-logo.png` and resize it to 192x192 and 512x512
2. Name them `pwa-icon-192.png` and `pwa-icon-512.png`
3. This will work but may not look optimal on all devices
