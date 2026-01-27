# Site Blocker

Browser extension to block websites on Chromium/Brave.

For app blocking on Ubuntu, see [app-blocker-daemon](https://github.com/MatthewBaggins/app-blocker-daemon).

## Install

1. Build: `npm run build`
2. Load `chrome://extensions/` → Developer mode → Load unpacked → select this folder
3. Click the extension icon and manage blocked sites

## Features

- **Auto-reset**: Blocked sites automatically reset to defaults every 5 minutes
- **Auto-cache clearing**: Cache is automatically cleared when blocking a domain
- **Randomized display**: Site lists are shuffled to prevent habit-based navigation
- **Manual confirmation**: Type the domain name to confirm removal (paste disabled)

## Usage

### Blocking Sites

- **Manual entry**: Enter a domain (e.g., `youtube.com`) and click "Add"
  - Cache is automatically cleared when you add a domain
- **Block current site**: Click "Block Current Site" to block the currently active tab's domain
  - Cache is automatically cleared
- **Reset to defaults**: Click "Reset to Defaults" to immediately restore your default blocked sites list
  - Happens automatically every 5 minutes
  - Cache is cleared for newly re-added domains

### Managing Blocked Sites

- Click "×" next to a site to remove it from the blocked list
  - You must manually type the domain name to confirm (paste disabled)
- Sites are displayed in random order each time

### Managing Default Sites

- Expand "Manage Defaults" section
- Add sites manually or click "Add Current Site" to add the active tab's domain
- Remove sites from defaults with the "×" button (requires typing confirmation)
- Defaults are used when you click "Reset to Defaults" or when auto-reset occurs every 5 minutes
- Sites are displayed in random order each time
- Initial defaults are determined by `src/config.ts`
