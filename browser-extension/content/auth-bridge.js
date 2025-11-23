// Auth bridge script injected into web pages to communicate with extension
// This script listens for auth tokens from the callback page

(function() {
  // Only run on our callback page
  if (!window.location.pathname.includes('/auth/extension/callback')) {
    return;
  }

  // Check if chrome.runtime is available
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
    console.error('Chrome extension APIs not available');
    return;
  }

  // Listen for postMessage from the callback page
  window.addEventListener('message', function(event) {
    // Verify message is from same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data && event.data.type === 'CLERK_EXTENSION_AUTH') {
      // Forward message to extension background script
      try {
        chrome.runtime.sendMessage({
          type: 'CLERK_EXTENSION_AUTH',
          token: event.data.token,
          extensionId: event.data.extensionId
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send token to extension:', chrome.runtime.lastError);
          }
        });
      } catch (error) {
        console.error('Error sending message to extension:', error);
      }
    }
  });
})();

