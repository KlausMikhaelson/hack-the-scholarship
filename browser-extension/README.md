# Browser Extension

Browser extension for HackTheScholarship that auto-fills scholarship application forms with user profile data.

## Features

- **Clerk Authentication**: Sign in with your Scholarly account
- **Auto-fill Forms**: Automatically fill scholarship application forms with your profile data
- **Smart Field Detection**: Detects common form fields (name, email, GPA, major, etc.)
- **Essay Pre-filling**: Pre-fills essay fields with your personal background or writing sample

## Setup

1. **Install Dependencies**:
   ```bash
   cd browser-extension
   npm install
   ```

2. **Configure Extension**:
   - Update `frontendUrl` and `apiBaseUrl` in the extension settings (or they default to `http://localhost:3000`)
   - Make sure your frontend is running and accessible

3. **Load Extension in Browser**:

   **For Google Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" ON (switch in the top-right corner)
   - Click the "Load unpacked" button
   - Navigate to and select the `browser-extension` folder (the folder containing `manifest.json`)
   - The extension should now appear in your extensions list
   - Pin the extension to your toolbar for easy access (click the puzzle icon in Chrome toolbar, then pin)

   **For Microsoft Edge:**
   - Open Edge and navigate to `edge://extensions/`
   - Toggle "Developer mode" ON (switch in the bottom-left corner)
   - Click the "Load unpacked" button
   - Navigate to and select the `browser-extension` folder (the folder containing `manifest.json`)
   - The extension should now appear in your extensions list
   - Pin the extension to your toolbar for easy access (click the extensions icon, then pin)

   **For Firefox:**
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Navigate to the `browser-extension` folder and select the `manifest.json` file
   - Note: Firefox requires a different manifest format, so you may need to use Chrome/Edge for full compatibility

   **Troubleshooting:**
   - If you see errors, make sure you selected the correct folder (should contain `manifest.json`, `popup/`, `background/`, `content/` folders)
   - If the extension doesn't load, check the browser console for errors
   - Make sure all dependencies are installed (`npm install` completed successfully)
   - For Chrome/Edge: Ensure "Developer mode" is enabled before clicking "Load unpacked"

## Usage

1. **Sign In**:
   - Click the extension icon
   - Click "Sign In"
   - A browser window will open for authentication
   - After signing in, the extension will receive your session token

2. **Fill Forms**:
   - Navigate to a scholarship application page
   - Click the extension icon
   - Click "Fill Form"
   - The extension will automatically detect and fill form fields

## How It Works

1. **Authentication Flow**:
   - Extension opens sign-in page in a new tab
   - After sign-in, redirects to `/auth/extension/callback`
   - Callback page sends session token to extension via postMessage
   - Extension stores token for API calls

2. **Form Filling**:
   - Extension fetches user profile from `/api/users/profile`
   - Content script detects form fields using pattern matching
   - Fills detected fields with user data
   - Shows success notification

## Configuration

The extension uses these default URLs (can be configured in extension storage):
- `frontendUrl`: `http://localhost:3000` (your Next.js app)
- `apiBaseUrl`: `http://localhost:3000` (same as frontend for API routes)

## Development

- `popup/` - Extension popup UI
- `background/` - Service worker for background tasks
- `content/` - Content scripts that run on web pages
- `lib/` - Shared utilities (Clerk, API, form filler)

## Notes

- The extension requires the user to be signed in to the web app
- Form field detection uses pattern matching on field names, IDs, labels, and placeholders
- The extension respects user privacy and only fills forms when explicitly requested
