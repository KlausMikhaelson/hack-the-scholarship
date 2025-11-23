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
    console.log('Background: ClerkId present:', !!request.clerkId);
    console.log('Background: Email present:', !!request.email);
    handleAuthSuccess(request.token, request.clerkId || null, request.email || null, sendResponse);
    return true;
  }
  
  if (request.action === 'captureScreenshot') {
    handleCaptureScreenshot(sendResponse);
    return true;
  }
  
  if (request.action === 'analyzeFormWithAI') {
    handleAnalyzeFormWithAI(request.formHTML, request.userData, sendResponse);
    return true;
  }
  
  if (request.type === 'FILL_PROGRESS_UPDATE') {
    // Forward progress updates to popup if open
    chrome.runtime.sendMessage({
      type: 'FILL_PROGRESS_UPDATE',
      percent: request.percent,
      text: request.text
    }).catch(() => {
      // Ignore errors - popup might not be open
    });
    sendResponse({ success: true });
    return true;
  }
  
  return true;
});

async function handleGetUserData(sendResponse) {
  try {
    const config = await getConfig();
    
    // Get user identifier (clerkId/email) from storage for extension authentication
    const userIdentifier = await getUserIdentifier();
    
    if (!userIdentifier.clerkId && !userIdentifier.email) {
      sendResponse({ error: 'Not authenticated. Please sign in again.' });
      return;
    }

    console.log('Fetching user profile with extension identifier - clerkId:', userIdentifier.clerkId, 'email:', userIdentifier.email);

    const response = await fetch(`${config.apiBaseUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Request': 'true', // Mark this as an extension request
        'X-Extension-User-Id': userIdentifier.clerkId || '',
        'X-Extension-User-Email': userIdentifier.email || ''
      }
    });

    console.log('Profile API response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log('401 Unauthorized - token expired, clearing session');
        await clearSession();
        // Return a specific error code so popup can handle it appropriately
        sendResponse({ 
          error: 'Authentication required. Please sign in again.',
          expired: true 
        });
        return;
      }
      if (response.status === 404) {
        // Try to parse error message
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Unknown error' };
        }
        
        console.log('404 error data:', errorData);
        
        if (errorData.error === 'User not found') {
          sendResponse({ error: 'User not found. Please sign up first.' });
          return;
        }
        // Profile not found - user hasn't completed onboarding
        sendResponse({ 
          error: 'Profile not found. Please complete onboarding first.',
          data: null 
        });
        return;
      }
      const errorText = await response.text();
      console.error('Profile fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Profile data received:', { hasProfile: !!data.profile, hasUser: !!data.user });
    
    // Return user data even if profile doesn't exist (user is authenticated but hasn't completed onboarding)
    // This allows the popup to show user info even without a profile
    const profile = data.profile;
    
    // Check if we have at least user data (even without profile)
    if (!data.user && !data.profile) {
      // This shouldn't happen if API is working correctly, but handle it gracefully
      console.warn('No user or profile data in response');
      sendResponse({ 
        error: 'Profile not found. Please complete onboarding first.',
        data: null 
      });
      return;
    }
    
    // Format data for form prefilling
    // Include user data even if profile is null
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

    // If profile is missing, include a note in the response but still return user data
    if (!profile && data.user) {
      sendResponse({ 
        data: userData,
        error: 'Profile not found. Please complete onboarding first.'
      });
    } else {
      sendResponse({ data: userData });
    }
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
    // Check for user identifier (clerkId/email) - this is what we use for extension auth
    const userIdentifier = await getUserIdentifier();
    const hasIdentifier = !!(userIdentifier.clerkId || userIdentifier.email);
    
    console.log('checkAuth called, user identifier exists:', hasIdentifier);
    
    // Check if user identifier exists - this is what we use for extension API calls
    // Token is stored but not used for API calls (to avoid expiration issues)
    sendResponse({ authenticated: hasIdentifier });
  } catch (error) {
    console.error('checkAuth error:', error);
    sendResponse({ authenticated: false });
  }
}

async function handleAuthSuccess(token, clerkId, email, sendResponse) {
  try {
    if (!token) {
      console.error('handleAuthSuccess: No token provided');
      sendResponse({ error: 'No token provided' });
      return;
    }
    
    console.log('handleAuthSuccess: Storing token, length:', token.length);
    await setSessionToken(token);
    
    // Use provided clerkId/email, or extract from token as fallback
    let finalClerkId = clerkId;
    let finalEmail = email;
    
    if (!finalClerkId || !finalEmail) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          // Use browser-native atob() instead of Node.js Buffer
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          // Add padding if needed
          const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
          const payloadJson = atob(paddedBase64);
          const payload = JSON.parse(payloadJson);
          finalClerkId = finalClerkId || payload.sub || null;
          finalEmail = finalEmail || payload.email || payload.email_addresses?.[0] || null;
        }
      } catch (error) {
        console.error('Failed to extract user info from token:', error);
      }
    }
    
    // Store user identifier for extension API calls
    if (finalClerkId || finalEmail) {
      await setUserIdentifier(finalClerkId, finalEmail);
      console.log('handleAuthSuccess: Stored user identifier - clerkId:', finalClerkId, 'email:', finalEmail);
    } else {
      console.warn('handleAuthSuccess: Could not extract user identifier from token or request');
    }
    
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

async function setUserIdentifier(clerkId, email) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 
      extensionUserId: clerkId,
      extensionUserEmail: email 
    }, () => {
      console.log('User identifier stored in chrome.storage.local');
      resolve();
    });
  });
}

async function getUserIdentifier() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['extensionUserId', 'extensionUserEmail'], (result) => {
      resolve({
        clerkId: result.extensionUserId || null,
        email: result.extensionUserEmail || null
      });
    });
  });
}

async function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['clerkSessionToken', 'extensionUserId', 'extensionUserEmail'], () => {
      console.log('Session cleared');
      resolve();
    });
  });
}

async function handleCaptureScreenshot(sendResponse) {
  try {
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ error: 'No active tab found' });
      return;
    }
    
    const tabId = tabs[0].id;
    
    // Check if tab is accessible
    if (!tabId) {
      sendResponse({ error: 'Invalid tab ID' });
      return;
    }
    
    // Capture visible tab with error handling
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Screenshot capture error:', chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message || 'Failed to capture screenshot' });
        return;
      }
      
      if (!dataUrl) {
        sendResponse({ error: 'Failed to capture screenshot - no data received' });
        return;
      }
      
      console.log('Screenshot captured successfully, size:', dataUrl.length);
      sendResponse({ screenshot: dataUrl });
    });
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    sendResponse({ error: error.message || 'Unknown error during screenshot capture' });
  }
}

async function handleAnalyzeFormWithAI(formHTML, userData, sendResponse) {
  try {
    const config = await getConfig();
    
    // Get user identifier (clerkId/email) from storage for extension authentication
    const userIdentifier = await getUserIdentifier();
    
    if (!userIdentifier.clerkId && !userIdentifier.email) {
      sendResponse({ error: 'Not authenticated. Please sign in again.' });
      return;
    }

    // Send form HTML and user data to API with extension identifier
    const response = await fetch(`${config.apiBaseUrl}/api/extension/analyze-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Request': 'true', // Mark this as an extension request
        'X-Extension-User-Id': userIdentifier.clerkId || '',
        'X-Extension-User-Email': userIdentifier.email || ''
      },
      body: JSON.stringify({
        formHTML: formHTML,
        userData: userData
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('401 Unauthorized during form analysis - token expired');
        await clearSession();
        sendResponse({ 
          error: 'Authentication required. Please sign in again.',
          expired: true 
        });
        return;
      }
      const errorText = await response.text();
      throw new Error(`Failed to analyze form: ${response.statusText} - ${errorText}`);
    }

    const analysis = await response.json();
    sendResponse({ analysis: analysis });
  } catch (error) {
    console.error('Failed to analyze form with AI:', error);
    sendResponse({ error: error.message });
  }
}