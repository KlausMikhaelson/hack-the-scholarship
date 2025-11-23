document.addEventListener('DOMContentLoaded', () => {
  const signInBtn = document.getElementById('signInBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const fillFormBtn = document.getElementById('fillFormBtn');
  const status = document.getElementById('status');
  const signedOut = document.getElementById('signedOut');
  const signedIn = document.getElementById('signedIn');
  const loading = document.getElementById('loading');
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
        await loadUserInfo();
        showSignedIn();
      } else {
        console.log('User is not authenticated');
        showSignedOut();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showSignedOut();
    }
  }

  async function loadUserInfo() {
    try {
      console.log('Loading user info...');
      const response = await sendMessage({ action: 'getUserData' });
      console.log('getUserData response:', response);
      
      if (response && response.data) {
        userName.textContent = response.data.name || 'User';
        userEmail.textContent = response.data.email || '';
        
        // Update avatar with first letter of name
        const avatar = document.querySelector('.user-avatar');
        if (avatar && response.data.name) {
          avatar.textContent = response.data.name.charAt(0).toUpperCase();
        }
        
        console.log('User info loaded successfully:', response.data.name, response.data.email);
      } else if (response && response.error) {
        console.error('Error loading user info:', response.error);
        userName.textContent = 'User';
        userEmail.textContent = '';
      } else {
        console.warn('No user data in response');
        userName.textContent = 'User';
        userEmail.textContent = '';
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      userName.textContent = 'User';
      userEmail.textContent = '';
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
      showStatus('Filling form...', 'info');
      fillFormBtn.disabled = true;
      
      // Get active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      // Send message to content script
      chrome.tabs.sendMessage(currentTab.id, { action: 'fillForm' }, (response) => {
        fillFormBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          showStatus('Failed to fill form. Make sure you\'re on a page with a form.', 'error');
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
      showStatus('Failed to fill form', 'error');
    }
  }

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

