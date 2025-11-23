// Service worker for browser extension
console.log('HackTheScholarship Extension background script loaded');

// Default configuration
const DEFAULT_CONFIG = {
  frontendUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3000'
};

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Initialize default settings
    chrome.storage.local.set({
      extensionState: 'initialized',
      settings: {
        enabled: true
      },
      ...DEFAULT_CONFIG
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserData') {
    handleGetUserData(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'signIn') {
    handleSignIn(sendResponse);
    return true;
  }
  
  if (request.action === 'signOut') {
    handleSignOut(sendResponse);
    return true;
  }
  
  if (request.action === 'checkAuth') {
    handleCheckAuth(sendResponse);
    return true;
  }
  
  if (request.type === 'CLERK_EXTENSION_AUTH') {
    console.log('Background: Received CLERK_EXTENSION_AUTH message');
    console.log('Background: Token present:', !!request.token);
    handleAuthSuccess(request.token, sendResponse);
    return true;
  }
  
  return true;
});

async function handleGetUserData(sendResponse) {
  try {
    const config = await getConfig();
    const sessionToken = await getSessionToken();
    
    if (!sessionToken) {
      sendResponse({ error: 'Not authenticated' });
      return;
    }

    const response = await fetch(`${config.apiBaseUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        await clearSession();
        sendResponse({ error: 'Authentication required' });
        return;
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    const profile = data.profile;
    
    // Format data for form prefilling
    const userData = {
      name: data.user?.name || '',
      email: data.user?.email || '',
      firstName: data.user?.firstName || '',
      lastName: data.user?.lastName || '',
      gpa: profile?.gpaString || profile?.gpa?.toString() || '',
      major: profile?.major || '',
      extracurriculars: profile?.extracurriculars || '',
      achievements: profile?.achievements || '',
      personalBackground: profile?.personalBackground || '',
      writingSample: profile?.writingSample || ''
    };

    sendResponse({ data: userData });
  } catch (error) {
    console.error('Failed to get user data:', error);
    sendResponse({ error: error.message });
  }
}

async function handleSignIn(sendResponse) {
  try {
    const config = await getConfig();
    const extensionId = chrome.runtime.id;
    
    // Build callback URL
    const callbackUrl = `${config.frontendUrl}/auth/extension/callback?redirect_url=${encodeURIComponent('chrome-extension://' + extensionId + '/popup/index.html')}`;
    
    // Open sign-in page with callback URL
    chrome.tabs.create({
      url: `${config.frontendUrl}/sign-in?redirect_url=${encodeURIComponent(callbackUrl)}`
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Sign-in failed:', error);
    sendResponse({ error: error.message });
  }
}

async function handleSignOut(sendResponse) {
  try {
    await clearSession();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Sign-out failed:', error);
    sendResponse({ error: error.message });
  }
}

async function handleCheckAuth(sendResponse) {
  try {
    const token = await getSessionToken();
    console.log('checkAuth called, token exists:', !!token);
    sendResponse({ authenticated: !!token });
  } catch (error) {
    console.error('checkAuth error:', error);
    sendResponse({ authenticated: false });
  }
}

async function handleAuthSuccess(token, sendResponse) {
  try {
    if (!token) {
      console.error('handleAuthSuccess: No token provided');
      sendResponse({ error: 'No token provided' });
      return;
    }
    
    console.log('handleAuthSuccess: Storing token, length:', token.length);
    await setSessionToken(token);
    
    // Verify token was stored
    const storedToken = await getSessionToken();
    console.log('handleAuthSuccess: Token verification - stored:', !!storedToken);
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Auth success handling failed:', error);
    sendResponse({ error: error.message });
  }
}

// Helper functions
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['frontendUrl', 'apiBaseUrl'], (result) => {
      resolve({
        frontendUrl: result.frontendUrl || DEFAULT_CONFIG.frontendUrl,
        apiBaseUrl: result.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl
      });
    });
  });
}

async function getSessionToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['clerkSessionToken'], (result) => {
      resolve(result.clerkSessionToken || null);
    });
  });
}

async function setSessionToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ clerkSessionToken: token }, () => {
      console.log('Token stored in chrome.storage.local');
      resolve();
    });
  });
}

async function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['clerkSessionToken', 'clerkUserId'], () => {
      resolve();
    });
  });
}