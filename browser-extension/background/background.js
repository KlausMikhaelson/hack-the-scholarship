// Service worker for browser extension
console.log('HackTheScholarship Extension background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Initialize default settings
    chrome.storage.local.set({
      extensionState: 'initialized',
      settings: {
        enabled: true
      }
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // Handle data requests
    chrome.storage.local.get(['extensionState'], (result) => {
      sendResponse({ data: result.extensionState });
    });
    return true; // Keep channel open for async response
  }
});

