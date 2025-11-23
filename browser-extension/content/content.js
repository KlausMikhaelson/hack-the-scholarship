// Content script that runs on web pages
console.log('HackTheScholarship Extension content script loaded');

// Handle extension callback page
if (window.location.pathname.includes('/auth/extension/callback')) {
  // Listen for postMessage from the callback page
  window.addEventListener('message', function(event) {
    // Verify message is from same origin
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data && event.data.type === 'CLERK_EXTENSION_AUTH') {
      // Forward message to extension background script
      chrome.runtime.sendMessage({
        type: 'CLERK_EXTENSION_AUTH',
        token: event.data.token,
        extensionId: event.data.extensionId,
        clerkId: event.data.clerkId || null,
        email: event.data.email || null
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to send token to extension:', chrome.runtime.lastError);
        } else {
          console.log('Token sent to background script successfully');
        }
      });
    }
  });

  // Also check localStorage for token (fallback method)
  function checkLocalStorageForToken() {
    try {
      const token = localStorage.getItem('extensionAuthToken');
      const timestamp = localStorage.getItem('extensionAuthTimestamp');
      const clerkId = localStorage.getItem('extensionAuthClerkId');
      const email = localStorage.getItem('extensionAuthEmail');
      
      if (token && timestamp) {
        const timeDiff = Date.now() - parseInt(timestamp, 10);
        // Only use token if it's less than 5 seconds old
        if (timeDiff < 5000) {
          // Extract extension ID from URL
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get('redirect_url');
          if (redirectUrl && redirectUrl.startsWith('chrome-extension://')) {
            const extensionIdMatch = redirectUrl.match(/chrome-extension:\/\/([^/]+)/);
            if (extensionIdMatch) {
              const extensionId = extensionIdMatch[1];
              
              console.log('Content script: Sending token from localStorage to background');
              chrome.runtime.sendMessage({
                type: 'CLERK_EXTENSION_AUTH',
                token: token,
                extensionId: extensionId,
                clerkId: clerkId,
                email: email
              }, (response) => {
                if (!chrome.runtime.lastError) {
                  console.log('Content script: Token from localStorage sent successfully');
                  // Clear localStorage after successful send
                  localStorage.removeItem('extensionAuthToken');
                  localStorage.removeItem('extensionAuthTimestamp');
                  localStorage.removeItem('extensionAuthClerkId');
                  localStorage.removeItem('extensionAuthEmail');
                } else {
                  console.error('Content script: Failed to send token from localStorage:', chrome.runtime.lastError);
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
  }

  // Check immediately and also poll for a few seconds
  checkLocalStorageForToken();
  const pollInterval = setInterval(() => {
    checkLocalStorageForToken();
  }, 500);
  
  // Stop polling after 5 seconds
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 5000);
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    // Simple ping to check if content script is loaded
    sendResponse({ ready: true });
    return true;
  }
  
  if (request.action === 'fillForm') {
    handleFillForm(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'fillFormWithAI') {
    handleFillFormWithAI(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'detectForm') {
    const fields = detectFormFields();
    sendResponse({ fields });
    return true;
  }
  
  return true;
});

async function handleFillForm(sendResponse) {
  try {
    // Get user data from background script
    const userData = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getUserData' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      });
    });

    if (!userData) {
      sendResponse({ success: false, error: 'User data not available. Please sign in.' });
      return;
    }

    const result = fillFormWithData(userData);
    
    // Show success notification
    showNotification(`Filled ${result.filledCount} field(s)`, 'success');
    
    sendResponse({ success: true, ...result });
  } catch (error) {
    console.error('Fill form error:', error);
    showNotification('Failed to fill form. Please sign in.', 'error');
    sendResponse({ success: false, error: error.message });
  }
}

// Function to scrape form HTML from the page
function scrapeFormHTML() {
  try {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      // If no form tags, look for form-like structures (inputs grouped together)
      const inputs = document.querySelectorAll('input, textarea, select');
      if (inputs.length === 0) {
        return null;
      }
      
      // Create a virtual container with all form elements
      const container = document.createElement('div');
      inputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-field-type', input.type || input.tagName.toLowerCase());
        wrapper.setAttribute('data-field-name', input.name || '');
        wrapper.setAttribute('data-field-id', input.id || '');
        wrapper.setAttribute('data-field-placeholder', input.placeholder || '');
        
        // Get label if exists
        const label = getLabelText(input);
        if (label) {
          wrapper.setAttribute('data-field-label', label);
        }
        
        wrapper.innerHTML = input.outerHTML;
        container.appendChild(wrapper);
      });
      
      return container.innerHTML;
    }
    
    // If forms exist, return the HTML of all forms
    const formHTMLs = Array.from(forms).map(form => {
      // Include form attributes and structure
      return form.outerHTML;
    });
    
    return formHTMLs.join('\n\n<!-- Form separator -->\n\n');
  } catch (error) {
    console.error('Error scraping form HTML:', error);
    return null;
  }
}

async function handleFillFormWithAI(sendResponse) {
  try {
    // Update progress: Scraping form HTML
    updateProgressInPopup(20, 'Analyzing form structure...');
    
    // Scrape form HTML from the current page
    const formHTML = scrapeFormHTML();
    
    if (!formHTML) {
      sendResponse({ success: false, error: 'No form found on this page' });
      return;
    }

    // Update progress: Getting user data
    updateProgressInPopup(40, 'Getting your profile data...');
    
    // Get user data from background script
    const userData = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getUserData' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          // Check if token expired
          if (response.expired || response.error.includes('Authentication required')) {
            reject(new Error('Session expired. Please sign in again in the extension popup.'));
          } else {
            reject(new Error(response.error));
          }
        } else {
          resolve(response.data);
        }
      });
    });

    if (!userData) {
      sendResponse({ success: false, error: 'User data not available. Please sign in.' });
      return;
    }

    // Update progress: Analyzing form with AI
    updateProgressInPopup(60, 'Analyzing form with AI...');
    
    // Send form HTML and user data to API for Claude analysis
    const analysisResult = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ 
        action: 'analyzeFormWithAI',
        formHTML: formHTML,
        userData: userData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.analysis);
        }
      });
    });

    // Update progress: Filling form fields
    updateProgressInPopup(80, 'Filling form fields...');
    
    // Fill form based on Claude's analysis
    const result = fillFormWithAIAnalysis(analysisResult);
    
    // Update progress: Complete
    updateProgressInPopup(100, 'Complete!');
    
    // Show success notification
    showNotification(`Filled ${result.filledCount} field(s) using AI!`, 'success');
    
    sendResponse({ success: true, ...result });
  } catch (error) {
    console.error('AI fill form error:', error);
    showNotification('Failed to fill form with AI. Please try again.', 'error');
    sendResponse({ success: false, error: error.message });
  }
}

function updateProgressInPopup(percent, text) {
  // Send progress update to popup
  chrome.runtime.sendMessage({
    type: 'FILL_PROGRESS_UPDATE',
    percent: percent,
    text: text
  }).catch(() => {
    // Ignore errors - popup might be closed
  });
}

function fillFormWithAIAnalysis(analysis) {
  // analysis should contain: { fields: [{ selector, value, fieldType }] }
  let filledCount = 0;
  
  if (!analysis || !analysis.fields || !Array.isArray(analysis.fields)) {
    console.error('Invalid analysis result:', analysis);
    return { filledCount: 0, totalFields: 0 };
  }

  analysis.fields.forEach(field => {
    try {
      let element = null;
      
      // Try different selector strategies
      if (field.selector) {
        element = document.querySelector(field.selector);
      }
      
      if (!element && field.id) {
        element = document.getElementById(field.id);
      }
      
      if (!element && field.name) {
        element = document.querySelector(`[name="${field.name}"]`);
      }
      
      if (!element && field.label) {
        // Try to find by label text
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.toLowerCase().includes(field.label.toLowerCase()));
        if (label && label.htmlFor) {
          element = document.getElementById(label.htmlFor);
        }
      }
      
      if (element && field.value) {
        if (fillField(element, field.value)) {
          filledCount++;
        }
      }
    } catch (error) {
      console.error('Error filling field:', field, error);
    }
  });

  return { filledCount, totalFields: analysis.fields.length };
}

function detectFormFields() {
  const fields = {
    name: [],
    firstName: [],
    lastName: [],
    email: [],
    gpa: [],
    major: [],
    extracurriculars: [],
    achievements: [],
    essay: []
  };

  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const label = getLabelText(input);
    const combined = `${name} ${id} ${placeholder} ${label}`.toLowerCase();

    if (matchesPattern(combined, ['name', 'full name', 'fullname', 'applicant name'])) {
      fields.name.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['first name', 'firstname', 'fname', 'given name'])) {
      fields.firstName.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['last name', 'lastname', 'lname', 'surname', 'family name'])) {
      fields.lastName.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['email', 'e-mail', 'email address'])) {
      fields.email.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['gpa', 'grade point average', 'g.p.a'])) {
      fields.gpa.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['major', 'field of study', 'area of study', 'program', 'degree'])) {
      fields.major.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['extracurricular', 'activities', 'involvement', 'volunteer'])) {
      fields.extracurriculars.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['achievement', 'award', 'honor', 'recognition', 'accomplishment'])) {
      fields.achievements.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
    if (matchesPattern(combined, ['essay', 'personal statement', 'background', 'biography', 'bio', 'statement', 'why', 'describe'])) {
      fields.essay.push({ element: input, type: input.type, name: input.name, id: input.id });
    }
  });

  return fields;
}

function fillFormWithData(userData) {
  const fields = detectFormFields();
  let filledCount = 0;

  // Fill name
  if (fields.name.length > 0 && userData.name) {
    fields.name.forEach(field => {
      if (fillField(field.element, userData.name)) filledCount++;
    });
  }

  // Fill first name
  if (fields.firstName.length > 0 && userData.firstName) {
    fields.firstName.forEach(field => {
      if (fillField(field.element, userData.firstName)) filledCount++;
    });
  }

  // Fill last name
  if (fields.lastName.length > 0 && userData.lastName) {
    fields.lastName.forEach(field => {
      if (fillField(field.element, userData.lastName)) filledCount++;
    });
  }

  // Fill email
  if (fields.email.length > 0 && userData.email) {
    fields.email.forEach(field => {
      if (fillField(field.element, userData.email)) filledCount++;
    });
  }

  // Fill GPA
  if (fields.gpa.length > 0 && userData.gpa) {
    fields.gpa.forEach(field => {
      if (fillField(field.element, userData.gpa)) filledCount++;
    });
  }

  // Fill major
  if (fields.major.length > 0 && userData.major) {
    fields.major.forEach(field => {
      if (fillField(field.element, userData.major)) filledCount++;
    });
  }

  // Fill extracurriculars
  if (fields.extracurriculars.length > 0 && userData.extracurriculars) {
    fields.extracurriculars.forEach(field => {
      if (fillField(field.element, userData.extracurriculars)) filledCount++;
    });
  }

  // Fill achievements
  if (fields.achievements.length > 0 && userData.achievements) {
    fields.achievements.forEach(field => {
      if (fillField(field.element, userData.achievements)) filledCount++;
    });
  }

  // Fill essay
  const essayText = userData.personalBackground || userData.writingSample || '';
  if (fields.essay.length > 0 && essayText) {
    fields.essay.forEach(field => {
      if (fillField(field.element, essayText)) filledCount++;
    });
  }

  return { filledCount, totalFields: Object.values(fields).flat().length };
}

function fillField(field, value) {
  if (!field || !value) return false;

  try {
    if (field.tagName === 'SELECT') {
      const options = Array.from(field.options);
      const matchingOption = options.find(opt => 
        opt.text.toLowerCase().includes(value.toLowerCase()) ||
        opt.value.toLowerCase().includes(value.toLowerCase())
      );
      if (matchingOption) {
        field.value = matchingOption.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } else {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  } catch (error) {
    console.error('Failed to fill field:', error);
    return false;
  }
  return false;
}

function getLabelText(input) {
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }
  
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent;
  
  const nearbyLabel = input.previousElementSibling;
  if (nearbyLabel && nearbyLabel.tagName === 'LABEL') {
    return nearbyLabel.textContent;
  }
  
  return '';
}

function matchesPattern(text, patterns) {
  return patterns.some(pattern => text.includes(pattern));
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

