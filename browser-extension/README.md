# Browser Extension

This is the browser extension component of HackTheScholarship.

## Structure

- `manifest.json` - Extension manifest file (Chrome/Edge Manifest V3)
- `popup/` - Extension popup UI
- `background/` - Service worker/background script
- `content/` - Content scripts that run on web pages
- `icons/` - Extension icons

## Development

1. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension will be loaded and ready to use

## Loading the Extension

1. Make sure you have the icon files in the `icons/` folder
2. Load the extension in your browser as described above
3. Click the extension icon in the toolbar to open the popup

