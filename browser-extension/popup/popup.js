document.addEventListener('DOMContentLoaded', () => {
  const signInBtn = document.getElementById('signInBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const fillFormBtn = document.getElementById('fillFormBtn');
  const status = document.getElementById('status');
  const signedOut = document.getElementById('signedOut');
  const signedIn = document.getElementById('signedIn');
  const loading = document.getElementById('loading');
  const fillingForm = document.getElementById('fillingForm');
  const progressFill = document.getElementById('progressFill');
  const loadingSubtext = document.getElementById('loadingSubtext');
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');

  // Check authentication status on load
  checkAuthStatus();
  
  // Listen for storage changes (when token is stored)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.clerkSessionToken) {
      console.log('Token storage changed, refreshing auth status');
      setTimeout(() => {
        checkAuthStatus();
      }, 200);
    }
  });
  
  // Listen for progress updates from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'FILL_PROGRESS_UPDATE') {
      if (window.updateFillProgress) {
        window.updateFillProgress(message.percent, message.text);
      }
      sendResponse({ received: true });
    }
    return true;
  });
  
  // Check auth when popup regains focus (user might have signed in in another tab)
  window.addEventListener('focus', () => {
    console.log('Popup focused, checking auth status...');
    checkAuthStatus();
  });
  
  // Also poll periodically when popup is open (in case storage events don't fire)
  let pollInterval = null;
  let pollCount = 0;
  const maxPollCount = 120; // Poll for up to 60 seconds (500ms * 120)
  
  function startPolling() {
    if (pollInterval) return; // Already polling
    
    console.log('Starting auth polling...');
    pollInterval = setInterval(async () => {
      try {
        pollCount++;
        const response = await sendMessage({ action: 'checkAuth' });
        if (response && response.authenticated) {
          console.log('Polling detected authentication!');
          // User is authenticated, refresh UI
          await loadUserInfo();
          showSignedIn();
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        } else if (pollCount >= maxPollCount) {
          // Stop polling after max attempts
          console.log('Stopped polling after max attempts');
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 500); // Poll every 500ms for faster detection
  }
  
  // Start polling when popup opens
  startPolling();
  
  // Stop polling when popup closes (cleanup)
  window.addEventListener('beforeunload', () => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  signInBtn.addEventListener('click', () => {
    handleSignIn();
  });

  signOutBtn.addEventListener('click', () => {
    handleSignOut();
  });

  fillFormBtn.addEventListener('click', () => {
    handleFillForm();
  });

  async function checkAuthStatus() {
    try {
      showLoading();
      
      const response = await sendMessage({ action: 'checkAuth' });
      console.log('checkAuthStatus response:', response);
      
      if (response && response.authenticated) {
        console.log('User is authenticated, loading user info...');
        // Load user info and show signed-in state
        // loadUserInfo will handle showing user data even if profile is missing
        await loadUserInfo();
        showSignedIn();
      } else {
        console.log('User is not authenticated');
        showSignedOut();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, try to load user info anyway (might be a network issue)
      // If it fails, show signed out
      try {
        await loadUserInfo();
        showSignedIn();
      } catch (loadError) {
        console.error('Failed to load user info after auth check error:', loadError);
        showSignedOut();
      }
    }
  }

  // Prevent multiple simultaneous getUserData calls
  let isLoadingUserInfo = false;
  let lastUserInfoLoad = 0;
  const USER_INFO_CACHE_MS = 2000; // Cache user info for 2 seconds

  async function loadUserInfo() {
    // Prevent duplicate calls within cache window
    const now = Date.now();
    if (isLoadingUserInfo || (now - lastUserInfoLoad < USER_INFO_CACHE_MS)) {
      console.log('Skipping duplicate loadUserInfo call');
      return;
    }
    
    isLoadingUserInfo = true;
    lastUserInfoLoad = now;
    
    try {
      console.log('Loading user info...');
      const response = await sendMessage({ action: 'getUserData' });
      console.log('getUserData response:', response);
      
      if (response && response.data) {
        // User data exists (even if profile doesn't)
        userName.textContent = response.data.name || 'User';
        userEmail.textContent = response.data.email || '';
        
        // Update avatar with first letter of name
        const avatar = document.querySelector('.user-avatar');
        if (avatar && response.data.name) {
          avatar.textContent = response.data.name.charAt(0).toUpperCase();
        }
        
        console.log('User info loaded successfully:', response.data.name, response.data.email);
        
        // Show a warning if profile is missing (user hasn't completed onboarding)
        if (response.error && response.error.includes('Profile not found')) {
          showStatus('Complete onboarding to enable form filling', 'info');
        }
      } else if (response && response.error) {
        // Check if it's an auth error (should sign out) vs profile error (show user but warn)
        if (response.error.includes('Authentication required') || response.error.includes('Not authenticated') || response.expired) {
          console.error('Authentication error - token expired, clearing session');
          // Clear session and show signed out state
          // Show clear message that session expired
          showSignedOut();
          showStatus('Session expired. Please sign in again.', 'info');
        } else {
          // Profile error but user is authenticated - show user info anyway
          console.warn('Profile error but user authenticated:', response.error);
          // Try to get basic user info from Clerk token if possible
          userName.textContent = 'User';
          userEmail.textContent = '';
          showStatus(response.error, 'info');
        }
      } else {
        console.warn('No user data in response');
        userName.textContent = 'User';
        userEmail.textContent = '';
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      userName.textContent = 'User';
      userEmail.textContent = '';
    } finally {
      isLoadingUserInfo = false;
    }
  }

  async function handleSignIn() {
    try {
      showLoading();
      await sendMessage({ action: 'signIn' });
      
      // Poll for auth status (user will sign in in another tab)
      showStatus('Please sign in the browser window that opened...', 'info');
      
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds (give more time for user to sign in)
      
      const pollInterval = setInterval(async () => {
        attempts++;
        const response = await sendMessage({ action: 'checkAuth' });
        
        if (response.authenticated) {
          clearInterval(pollInterval);
          // Load user info and show signed in state
          try {
            await loadUserInfo();
            showSignedIn();
            showStatus('Signed in successfully!', 'success');
          } catch (error) {
            console.error('Failed to load user info:', error);
            showSignedIn(); // Still show signed in state even if loading user info fails
            showStatus('Signed in!', 'success');
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          showStatus('Sign-in timeout. Please try again.', 'error');
          showSignedOut();
        }
      }, 500); // Poll every 500ms for faster detection
    } catch (error) {
      console.error('Sign-in failed:', error);
      showStatus('Sign-in failed. Please try again.', 'error');
      showSignedOut();
    }
  }

  async function handleSignOut() {
    try {
      showLoading();
      await sendMessage({ action: 'signOut' });
      showSignedOut();
      showStatus('Signed out successfully', 'success');
    } catch (error) {
      console.error('Sign-out failed:', error);
      showStatus('Sign-out failed', 'error');
    }
  }

  async function handleFillForm() {
    try {
      // Show loading state
      showFillingForm();
      updateProgress(10, 'Analyzing form...');
      fillFormBtn.disabled = true;
      
      // Get active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab) {
        throw new Error('No active tab found');
      }
      
      // Check if content script is ready by trying to ping it first
      try {
        await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(currentTab.id, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError) {
              // Content script might not be loaded, try to inject it
              reject(new Error('Content script not ready'));
            } else {
              resolve(response);
            }
          });
        });
      } catch (error) {
        // Try to inject content script if not loaded
        console.log('Content script not ready, attempting to inject...');
        try {
          await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content/content.js']
          });
          // Wait a bit for script to initialize
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError);
          throw new Error('Failed to load extension on this page. Please refresh the page and try again.');
        }
      }
      
      // Set up a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        fillFormBtn.disabled = false;
        hideFillingForm();
        showStatus('Operation timed out. Please try again.', 'error');
      }, 60000); // 60 second timeout
      
      // Send message to content script with progress callback
      chrome.tabs.sendMessage(currentTab.id, { action: 'fillFormWithAI' }, async (response) => {
        clearTimeout(timeoutId);
        fillFormBtn.disabled = false;
        hideFillingForm();
        
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          showStatus(`Failed to fill form: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }
        
        if (!response) {
          showStatus('No response from content script. Please try again.', 'error');
          return;
        }
        
        if (response.success) {
          showStatus(`Successfully filled ${response.filledCount} field(s)!`, 'success');
        } else {
          showStatus(response.error || 'Failed to fill form', 'error');
        }
      });
    } catch (error) {
      console.error('Fill form failed:', error);
      fillFormBtn.disabled = false;
      hideFillingForm();
      showStatus(error.message || 'Failed to fill form', 'error');
    }
  }

  function showFillingForm() {
    fillingForm.style.display = 'block';
    signedIn.style.display = 'none';
    signedOut.style.display = 'none';
    loading.style.display = 'none';
  }

  function hideFillingForm() {
    fillingForm.style.display = 'none';
    signedIn.style.display = 'block';
  }

  function updateProgress(percent, text) {
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    if (loadingSubtext) {
      loadingSubtext.textContent = text;
    }
  }

  // Expose updateProgress to window for content script to call
  window.updateFillProgress = updateProgress;

  function showLoading() {
    loading.style.display = 'block';
    signedIn.style.display = 'none';
    signedOut.style.display = 'none';
  }

  function showSignedIn() {
    loading.style.display = 'none';
    signedIn.style.display = 'block';
    signedOut.style.display = 'none';
  }

  function showSignedOut() {
    loading.style.display = 'none';
    signedIn.style.display = 'none';
    signedOut.style.display = 'block';
  }

  function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status status-${type}`;
    
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 3000);
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
});

