// Clerk authentication service for browser extension
// This file handles Clerk authentication in the extension context

class ClerkService {
  constructor() {
    this.publishableKey = null;
    this.clerk = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Get Clerk publishable key from storage or use default
      const result = await chrome.storage.local.get(['clerkPublishableKey']);
      this.publishableKey = result.clerkPublishableKey || '';

      if (!this.publishableKey) {
        console.warn('Clerk publishable key not found. Please set it in extension settings.');
        return false;
      }

      // Initialize Clerk for Chrome Extension
      // Note: @clerk/chrome-extension needs to be loaded via CDN or bundled
      // For now, we'll use a manual implementation
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Clerk:', error);
      return false;
    }
  }

  async getSessionToken() {
    try {
      const result = await chrome.storage.local.get(['clerkSessionToken']);
      return result.clerkSessionToken || null;
    } catch (error) {
      console.error('Failed to get session token:', error);
      return null;
    }
  }

  async setSessionToken(token) {
    try {
      await chrome.storage.local.set({ clerkSessionToken: token });
      return true;
    } catch (error) {
      console.error('Failed to set session token:', error);
      return false;
    }
  }

  async clearSession() {
    try {
      await chrome.storage.local.remove(['clerkSessionToken', 'clerkUserId']);
      return true;
    } catch (error) {
      console.error('Failed to clear session:', error);
      return false;
    }
  }

  async isSignedIn() {
    const token = await this.getSessionToken();
    return !!token;
  }

  // Open Clerk sign-in in a popup
  async signIn() {
    try {
      // Get the frontend URL from storage
      const result = await chrome.storage.local.get(['frontendUrl']);
      const frontendUrl = result.frontendUrl || 'http://localhost:3000';
      
      // Open sign-in page in a popup
      chrome.windows.create({
        url: `${frontendUrl}/sign-in?redirect_url=chrome-extension://${chrome.runtime.id}/popup/index.html`,
        type: 'popup',
        width: 500,
        height: 600
      });

      // Listen for the redirect message
      return new Promise((resolve) => {
        chrome.runtime.onMessage.addListener(function listener(message) {
          if (message.type === 'clerk-auth-success') {
            chrome.runtime.onMessage.removeListener(listener);
            resolve(message.token);
          }
        });
      });
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
const clerkService = new ClerkService();
export default clerkService;

