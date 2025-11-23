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
   - Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `browser-extension` folder

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
