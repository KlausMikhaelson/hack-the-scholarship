document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn');
  const status = document.getElementById('status');

  // Load saved state
  chrome.storage.local.get(['extensionState'], (result) => {
    if (result.extensionState) {
      status.textContent = `Status: ${result.extensionState}`;
    }
  });

  actionBtn.addEventListener('click', () => {
    // Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      
      // Save state
      const newState = `Active on ${new Date().toLocaleTimeString()}`;
      chrome.storage.local.set({ extensionState: newState }, () => {
        status.textContent = `Status: ${newState}`;
      });

      // Send message to content script
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'extensionClicked',
        timestamp: Date.now()
      });
    });
  });
});

