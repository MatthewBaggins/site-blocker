# Site Blocker

Browser extension to block websites on Chromium/Brave.

For app blocking on Ubuntu, see [app-blocker-daemon](https://github.com/MatthewBaggins/app-blocker-daemon).

## Install

1. Build: `npm run build`
2. Load `chrome://extensions/` → Developer mode → Load unpacked → select this folder
3. Click the extension icon and manage blocked sites

## Usage

### Blocking Sites

- **Manual entry**: Enter a domain (e.g., `youtube.com`) and click "Add"
- **Block current site**: Click "Block Current Site" to block the currently active tab's domain
- **Reset to defaults**: Click "Reset to Defaults" to restore your default blocked sites list

### Managing Blocked Sites

- Click "🗑️" next to a site to clear its cache
- Click "×" next to a site to remove it from the blocked list

### Managing Default Sites

- Expand "Manage Defaults" section
- Add sites manually or click "Add Current Site" to add the active tab's domain
- Remove sites from defaults with the "×" button
- Defaults are used when you click "Reset to Defaults"
- Initial defaults are determined by `src/config.ts`
