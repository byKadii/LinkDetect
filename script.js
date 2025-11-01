/**
 * URL Detection Module
 * Handles URL analysis and threat detection functionality
 */

// DOM element selectors for better maintainability
const DOM_SELECTORS = {
  urlInput: 'urlInput',
  resultBox: 'result',
  resultIcon: 'resultIcon',
  resultText: 'resultText',
  progressContainer: 'progressContainer',
  progressFill: 'progressFill',
  progressText: 'progressText',
  resultDetails: 'resultDetails',
  resultActions: 'resultActions',
  analysisTime: 'analysisTime',
  threatType: 'threatType',
  threatLevel: 'threatLevel'
};

// Analysis configuration constants
const ANALYSIS_CONFIG = {
  progressInterval: 150,
  progressIncrement: { min: 5, max: 20 },
  resultDelay: 500,
  maxProgress: 100
};

/**
 * Main URL detection function
 * Validates input, shows progress, and displays analysis results
 */
function detectUrl() {
  const urlToAnalyze = getUrlInputValue();
  
  if (!isValidUrlInput(urlToAnalyze)) {
    return;
  }
  
  initializeAnalysisProgress();
  performUrlAnalysis(urlToAnalyze);
}

/**
 * Gets and trims the URL input value
 * @returns {string} The trimmed URL input value
 */
function getUrlInputValue() {
  const urlInputElement = document.getElementById(DOM_SELECTORS.urlInput);
  return urlInputElement ? urlInputElement.value.trim() : '';
}

/**
 * Validates URL input and shows appropriate notifications
 * @param {string} url - The URL to validate
 * @returns {boolean} True if URL is valid, false otherwise
 */
function isValidUrlInput(url) {
  if (!url) {
    showNotification('Please enter a URL to check', 'warning');
    return false;
  }
  
  if (!isValidUrlFormat(url)) {
    showNotification('Please enter a valid URL', 'error');
    return false;
  }
  
  return true;
}

/**
 * Checks if the URL has a valid format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if URL format is valid
 */
function isValidUrlFormat(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Initializes the analysis progress UI
 */
function initializeAnalysisProgress() {
  const elements = getAnalysisElements();
  
  // Show progress indicators
  elements.progressContainer.style.display = 'block';
  elements.resultBox.style.display = 'block';
  elements.resultBox.className = 'result-box loading';
  
  // Set loading state
  elements.resultIcon.innerHTML = '🛡️';
  elements.resultText.textContent = 'Analyzing URL...';
  elements.resultDetails.style.display = 'none';
  elements.resultActions.style.display = 'none';
}

/**
 * Gets all DOM elements needed for analysis
 * @returns {Object} Object containing all analysis DOM elements
 */
function getAnalysisElements() {
  return {
    progressContainer: document.getElementById(DOM_SELECTORS.progressContainer),
    resultBox: document.getElementById(DOM_SELECTORS.resultBox),
    resultIcon: document.getElementById(DOM_SELECTORS.resultIcon),
    resultText: document.getElementById(DOM_SELECTORS.resultText),
    progressFill: document.getElementById(DOM_SELECTORS.progressFill),
    progressText: document.getElementById(DOM_SELECTORS.progressText),
    resultDetails: document.getElementById(DOM_SELECTORS.resultDetails),
    resultActions: document.getElementById(DOM_SELECTORS.resultActions)
  };
}

/**
 * Performs the actual URL analysis with progress simulation
 * @param {string} url - The URL to analyze
 */
function performUrlAnalysis(url) {
  const analysisStartTime = Date.now();
  let currentProgress = 0;
  
  const progressInterval = setInterval(() => {
    currentProgress = updateProgressBar(currentProgress);
    
    if (currentProgress >= ANALYSIS_CONFIG.maxProgress) {
      clearInterval(progressInterval);
      completeAnalysis(url, analysisStartTime);
    }
  }, ANALYSIS_CONFIG.progressInterval);
}

/**
 * Updates the progress bar with random increments
 * @param {number} currentProgress - Current progress value
 * @returns {number} Updated progress value
 */
function updateProgressBar(currentProgress) {
  const increment = Math.random() * 
    (ANALYSIS_CONFIG.progressIncrement.max - ANALYSIS_CONFIG.progressIncrement.min) + 
    ANALYSIS_CONFIG.progressIncrement.min;
  
  const newProgress = Math.min(currentProgress + increment, ANALYSIS_CONFIG.maxProgress);
  
  const elements = getAnalysisElements();
  elements.progressFill.style.width = newProgress + '%';
  elements.progressText.textContent = `Analyzing URL... ${Math.round(newProgress)}%`;
  
  return newProgress;
}

/**
 * Completes the analysis and displays results
 * @param {string} url - The analyzed URL
 * @param {number} startTime - Analysis start timestamp
 */
function completeAnalysis(url, startTime) {
  setTimeout(() => {
    const analysisDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    const analysisResult = analyzeUrlThreats(url);
    
    displayAnalysisResults(analysisResult, analysisDuration);
    saveAnalysisToHistory(url, analysisResult);
    incrementUrlAnalysisCounter();
  }, ANALYSIS_CONFIG.resultDelay);
}

/**
 * Displays the analysis results in the UI
 * @param {Object} analysisResult - The analysis result object
 * @param {string} analysisDuration - Duration of analysis in seconds
 */
function displayAnalysisResults(analysisResult, analysisDuration) {
  const elements = getAnalysisElements();
  
  // Hide progress and show results
  elements.progressContainer.style.display = 'none';
  elements.resultDetails.style.display = 'grid';
  elements.resultActions.style.display = 'flex';
  
  // Update result details
  document.getElementById(DOM_SELECTORS.analysisTime).textContent = analysisDuration + 's';
  document.getElementById(DOM_SELECTORS.threatType).textContent = analysisResult.threatType;
  
  // Set result styling and content based on safety
  if (analysisResult.isSafe) {
    displaySafeResult(elements);
  } else {
    displayDangerousResult(elements, analysisResult.threatType);
  }
}

/**
 * Displays safe URL result
 * @param {Object} elements - DOM elements for result display
 */
function displaySafeResult(elements) {
  elements.resultBox.className = 'result-box safe';
  elements.resultIcon.innerHTML = '✅';
  elements.resultText.textContent = 'This URL appears to be safe!';
  document.getElementById(DOM_SELECTORS.threatLevel).innerHTML = '<span class="level-low">Low</span>';
  showNotification('URL analysis complete - Safe!', 'success');
}

/**
 * Displays dangerous URL result
 * @param {Object} elements - DOM elements for result display
 * @param {string} threatType - Type of threat detected
 */
function displayDangerousResult(elements, threatType) {
  elements.resultBox.className = 'result-box dangerous';
  elements.resultIcon.innerHTML = '⚠️';
  elements.resultText.textContent = `This URL may be malicious. Threat type: ${threatType}`;
  document.getElementById(DOM_SELECTORS.threatLevel).innerHTML = '<span class="level-high">High</span>';
  showNotification(`URL analysis complete - ${threatType} detected!`, 'error');
}

/**
 * Saves analysis result to browser history
 * @param {string} url - The analyzed URL
 * @param {Object} analysisResult - The analysis result
 */
function saveAnalysisToHistory(url, analysisResult) {
  const resultStatus = analysisResult.isSafe ? 'safe' : 'dangerous';
  saveUrlHistory(url, resultStatus);
}

/**
 * Increments the global URL analysis counter
 */
function incrementUrlAnalysisCounter() {
  if (window.incrementUrlCounter) {
    window.incrementUrlCounter();
  }
}

/**
 * URL Threat Analysis Module
 * Simulates URL analysis using pattern matching (replace with actual ML model)
 */

// Threat pattern definitions for URL analysis
const THREAT_PATTERNS = {
  phishing: [
    'phishing', 'login', 'password', 'account', 'verify', 'secure', 
    'bank', 'paypal', 'amazon', 'microsoft', 'google'
  ],
  malware: [
    'malware', 'virus', 'trojan', 'worm', 'backdoor', 'rootkit', 'spyware'
  ],
  ransomware: [
    'ransomware', 'encrypt', 'decrypt', 'bitcoin', 'payment', 'unlock'
  ],
  scam: [
    'scam', 'fake', 'fraud', 'steal', 'hack', 'breach', 'leak'
  ],
  suspicious: [
    'bit.ly', 'tinyurl', 'shortened', 'suspicious', 'unknown', 'weird'
  ]
};

/**
 * Analyzes URL for potential threats using pattern matching
 * @param {string} url - The URL to analyze
 * @returns {Object} Analysis result with safety status and threat type
 */
function analyzeUrlThreats(url) {
  const normalizedUrl = url.toLowerCase();
  const detectedThreat = detectThreatPattern(normalizedUrl);
  
  return {
    isSafe: !detectedThreat,
    threatType: detectedThreat || 'None'
  };
}

/**
 * Detects threat patterns in the normalized URL
 * @param {string} normalizedUrl - URL converted to lowercase
 * @returns {string|null} Threat type if detected, null if safe
 */
function detectThreatPattern(normalizedUrl) {
  for (const [threatType, patterns] of Object.entries(THREAT_PATTERNS)) {
    if (containsThreatPattern(normalizedUrl, patterns)) {
      return threatType;
    }
  }
  return null;
}

/**
 * Checks if URL contains any of the specified threat patterns
 * @param {string} url - The URL to check
 * @param {string[]} patterns - Array of threat patterns to match
 * @returns {boolean} True if any pattern is found
 */
function containsThreatPattern(url, patterns) {
  return patterns.some(pattern => url.includes(pattern));
}

/**
 * URL History Management Module
 * Handles storage and display of URL analysis history
 */

// History configuration constants
const HISTORY_CONFIG = {
  storageKey: 'urlHistory',
  maxItems: 20,
  modalId: 'historyModal',
  listId: 'historyList'
};

/**
 * Saves URL analysis result to browser history
 * @param {string} url - The analyzed URL
 * @param {string} result - Analysis result ('safe' or 'dangerous')
 */
function saveUrlHistory(url, result) {
  const existingHistory = getStoredHistory();
  const newHistoryItem = createHistoryItem(url, result);
  const updatedHistory = addToHistory(existingHistory, newHistoryItem);
  
  storeHistory(updatedHistory);
}

/**
 * Gets stored history from localStorage
 * @returns {Array} Array of history items
 */
function getStoredHistory() {
  const storedData = localStorage.getItem(HISTORY_CONFIG.storageKey);
  return storedData ? JSON.parse(storedData) : [];
}

/**
 * Creates a new history item object
 * @param {string} url - The analyzed URL
 * @param {string} result - Analysis result
 * @returns {Object} History item object
 */
function createHistoryItem(url, result) {
  return {
    url: url,
    result: result,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString()
  };
}

/**
 * Adds new item to history and maintains size limit
 * @param {Array} history - Current history array
 * @param {Object} newItem - New history item to add
 * @returns {Array} Updated history array
 */
function addToHistory(history, newItem) {
  const updatedHistory = [newItem, ...history];
  return updatedHistory.slice(0, HISTORY_CONFIG.maxItems);
}

/**
 * Stores history array in localStorage
 * @param {Array} history - History array to store
 */
function storeHistory(history) {
  localStorage.setItem(HISTORY_CONFIG.storageKey, JSON.stringify(history));
}

/**
 * Displays URL analysis history in modal
 */
function showHistory() {
  const historyModal = document.getElementById(HISTORY_CONFIG.modalId);
  const historyList = document.getElementById(HISTORY_CONFIG.listId);
  const history = getStoredHistory();
  
  updateHistoryDisplay(historyList, history);
  showModal(historyModal);
}

/**
 * Updates the history list display
 * @param {HTMLElement} historyList - History list container element
 * @param {Array} history - History array to display
 */
function updateHistoryDisplay(historyList, history) {
  if (history.length === 0) {
    historyList.innerHTML = createEmptyHistoryMessage();
  } else {
    historyList.innerHTML = createHistoryItemsHTML(history);
  }
}

/**
 * Creates HTML for empty history message
 * @returns {string} HTML string for empty state
 */
function createEmptyHistoryMessage() {
  return '<p style="text-align: center; color: rgba(255,255,255,0.7);">No analysis history yet.</p>';
}

/**
 * Creates HTML for history items
 * @param {Array} history - History array
 * @returns {string} HTML string for history items
 */
function createHistoryItemsHTML(history) {
  return history.map(item => createHistoryItemHTML(item)).join('');
}

/**
 * Creates HTML for a single history item
 * @param {Object} item - History item object
 * @returns {string} HTML string for history item
 */
function createHistoryItemHTML(item) {
  return `
    <div class="history-item">
      <div class="history-url">${item.url}</div>
      <div class="history-status ${item.result}">${item.result}</div>
    </div>
  `;
}

/**
 * Shows the history modal
 * @param {HTMLElement} modal - Modal element to show
 */
function showModal(modal) {
  modal.style.display = 'flex';
}

/**
 * Closes the history modal
 */
function closeHistory() {
  const historyModal = document.getElementById(HISTORY_CONFIG.modalId);
  historyModal.style.display = 'none';
}

/**
 * Utility Functions Module
 * Handles copy, share, and other utility operations
 */

/**
 * Copies the current URL input to clipboard
 */
function copyUrl() {
  const urlToCopy = getUrlInputValue();
  
  if (!urlToCopy) {
    showNotification('No URL to copy', 'warning');
    return;
  }
  
  copyToClipboard(urlToCopy, 'URL copied to clipboard!');
}

/**
 * Shares the analysis result using native share API or clipboard fallback
 */
function shareResult() {
  const urlToShare = getUrlInputValue();
  
  if (!urlToShare) {
    showNotification('No result to share', 'warning');
    return;
  }
  
  const shareContent = createShareContent(urlToShare);
  
  if (supportsNativeShare()) {
    shareWithNativeAPI(shareContent);
  } else {
    shareWithClipboard(shareContent.text);
  }
}

/**
 * Gets the current URL input value
 * @returns {string} The URL input value
 */
function getUrlInputValue() {
  const urlInputElement = document.getElementById(DOM_SELECTORS.urlInput);
  return urlInputElement ? urlInputElement.value.trim() : '';
}

/**
 * Copies text to clipboard with success/error handling
 * @param {string} text - Text to copy
 * @param {string} successMessage - Success notification message
 */
function copyToClipboard(text, successMessage) {
  navigator.clipboard.writeText(text)
    .then(() => showNotification(successMessage, 'success'))
    .catch(() => showNotification('Failed to copy to clipboard', 'error'));
}

/**
 * Creates share content object
 * @param {string} url - URL to share
 * @returns {Object} Share content object
 */
function createShareContent(url) {
  const analysisResult = getCurrentAnalysisResult();
  const resultStatus = analysisResult.isSafe ? 'safe' : 'potentially dangerous';
  
  return {
    title: 'SecureLink Analysis Result',
    text: `I just analyzed "${url}" with SecureLink and it appears to be ${resultStatus}! Check it out at ${window.location.origin}`,
    url: window.location.origin
  };
}

/**
 * Gets the current analysis result from the UI
 * @returns {Object} Analysis result object
 */
function getCurrentAnalysisResult() {
  const resultBox = document.getElementById(DOM_SELECTORS.resultBox);
  return {
    isSafe: resultBox ? resultBox.classList.contains('safe') : false
  };
}

/**
 * Checks if native share API is supported
 * @returns {boolean} True if native share is supported
 */
function supportsNativeShare() {
  return navigator.share && typeof navigator.share === 'function';
}

/**
 * Shares content using native share API
 * @param {Object} shareContent - Content to share
 */
function shareWithNativeAPI(shareContent) {
  navigator.share(shareContent)
    .catch(() => shareWithClipboard(shareContent.text));
}

/**
 * Shares content using clipboard fallback
 * @param {string} shareText - Text to share
 */
function shareWithClipboard(shareText) {
  copyToClipboard(shareText, 'Share text copied to clipboard!');
}

/**
 * Form Handling Module
 * Handles user authentication forms (login/signup)
 */

// Form configuration constants
const FORM_CONFIG = {
  redirectDelay: 1500,
  homePage: 'index.html',
  loginPage: 'login.html'
};

/**
 * Handles login form submission
 * @param {Event} event - Form submission event
 */
function handleLogin(event) {
  event.preventDefault();
  
  const formData = extractFormData(event.target);
  
  if (isValidLoginData(formData)) {
    processSuccessfulLogin();
  } else {
    showNotification('Please fill in all fields', 'warning');
  }
}

/**
 * Handles signup form submission
 * @param {Event} event - Form submission event
 */
function handleSignup(event) {
  event.preventDefault();
  
  const formData = extractFormData(event.target);
  
  if (isValidSignupData(formData)) {
    processSuccessfulSignup();
  } else {
    showNotification('Please fill in all fields', 'warning');
  }
}

/**
 * Extracts form data from form element
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data object
 */
function extractFormData(form) {
  const formData = new FormData(form);
  
  return {
    username: formData.get('username') || form[0]?.value || '',
    email: formData.get('email') || form[1]?.value || '',
    password: formData.get('password') || form[2]?.value || ''
  };
}

/**
 * Validates login form data
 * @param {Object} formData - Form data object
 * @returns {boolean} True if login data is valid
 */
function isValidLoginData(formData) {
  return Boolean(formData.username && formData.password);
}

/**
 * Validates signup form data
 * @param {Object} formData - Form data object
 * @returns {boolean} True if signup data is valid
 */
function isValidSignupData(formData) {
  return Boolean(formData.username && formData.email && formData.password);
}

/**
 * Processes successful login
 */
function processSuccessfulLogin() {
  showNotification('Login successful! (This is a demo)', 'success');
  redirectToPage(FORM_CONFIG.homePage);
}

/**
 * Processes successful signup
 */
function processSuccessfulSignup() {
  showNotification('Account created successfully! (This is a demo)', 'success');
  redirectToPage(FORM_CONFIG.loginPage);
}

/**
 * Redirects to specified page after delay
 * @param {string} pageUrl - URL to redirect to
 */
function redirectToPage(pageUrl) {
  setTimeout(() => {
    window.location.href = pageUrl;
  }, FORM_CONFIG.redirectDelay);
}

/**
 * Dark Mode Management Module
 * Handles dark mode toggle and persistence
 */

// Dark mode configuration constants
const DARK_MODE_CONFIG = {
  storageKey: 'darkMode',
  enabledValue: 'enabled',
  disabledValue: 'disabled',
  bodyClass: 'dark-mode'
};

/**
 * Toggles dark mode on/off
 */
function toggleDarkMode() {
  const bodyElement = document.body;
  const isCurrentlyDark = bodyElement.classList.contains(DARK_MODE_CONFIG.bodyClass);
  
  if (isCurrentlyDark) {
    disableDarkMode(bodyElement);
  } else {
    enableDarkMode(bodyElement);
  }
}

/**
 * Enables dark mode
 * @param {HTMLElement} bodyElement - Body element to modify
 */
function enableDarkMode(bodyElement) {
  bodyElement.classList.add(DARK_MODE_CONFIG.bodyClass);
  saveDarkModePreference(DARK_MODE_CONFIG.enabledValue);
}

/**
 * Disables dark mode
 * @param {HTMLElement} bodyElement - Body element to modify
 */
function disableDarkMode(bodyElement) {
  bodyElement.classList.remove(DARK_MODE_CONFIG.bodyClass);
  saveDarkModePreference(DARK_MODE_CONFIG.disabledValue);
}

/**
 * Saves dark mode preference to localStorage
 * @param {string} preference - Dark mode preference value
 */
function saveDarkModePreference(preference) {
  localStorage.setItem(DARK_MODE_CONFIG.storageKey, preference);
}

/**
 * Initializes dark mode based on saved preference
 */
function initializeDarkMode() {
  const savedPreference = localStorage.getItem(DARK_MODE_CONFIG.storageKey);
  
  if (savedPreference === DARK_MODE_CONFIG.enabledValue) {
    document.body.classList.add(DARK_MODE_CONFIG.bodyClass);
  }
}

/**
 * Notification System Module
 * Handles user notifications with different types and animations
 */

// Notification configuration constants
const NOTIFICATION_CONFIG = {
  defaultType: 'info',
  displayDuration: 4000,
  animationDelay: 100,
  hideAnimationDuration: 300,
  zIndex: 1000,
  position: {
    top: '20px',
    right: '20px'
  }
};

// Notification type styling
const NOTIFICATION_STYLES = {
  success: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(139, 195, 74, 0.9))',
  error: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(255, 87, 34, 0.9))',
  warning: 'linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 152, 0, 0.9))',
  info: 'linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(63, 81, 181, 0.9))'
};

/**
 * Shows a notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = NOTIFICATION_CONFIG.defaultType) {
  const notificationElement = createNotificationElement(message, type);
  
  displayNotification(notificationElement);
  scheduleNotificationRemoval(notificationElement);
}

/**
 * Creates notification DOM element
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @returns {HTMLElement} Notification element
 */
function createNotificationElement(message, type) {
  const notification = document.createElement('div');
  
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  applyNotificationStyles(notification, type);
  
  return notification;
}

/**
 * Applies styling to notification element
 * @param {HTMLElement} notification - Notification element
 * @param {string} type - Notification type
 */
function applyNotificationStyles(notification, type) {
  const baseStyles = {
    position: 'fixed',
    top: NOTIFICATION_CONFIG.position.top,
    right: NOTIFICATION_CONFIG.position.right,
    padding: '16px 24px',
    borderRadius: '12px',
    color: 'white',
    fontWeight: '600',
    zIndex: NOTIFICATION_CONFIG.zIndex.toString(),
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.info
  };
  
  Object.assign(notification.style, baseStyles);
}

/**
 * Displays notification with slide-in animation
 * @param {HTMLElement} notification - Notification element
 */
function displayNotification(notification) {
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, NOTIFICATION_CONFIG.animationDelay);
}

/**
 * Schedules notification removal with slide-out animation
 * @param {HTMLElement} notification - Notification element
 */
function scheduleNotificationRemoval(notification) {
  setTimeout(() => {
    hideNotification(notification);
  }, NOTIFICATION_CONFIG.displayDuration);
}

/**
 * Hides notification with slide-out animation
 * @param {HTMLElement} notification - Notification element
 */
function hideNotification(notification) {
  notification.style.transform = 'translateX(100%)';
  
  setTimeout(() => {
    removeNotificationFromDOM(notification);
  }, NOTIFICATION_CONFIG.hideAnimationDuration);
}

/**
 * Removes notification from DOM
 * @param {HTMLElement} notification - Notification element
 */
function removeNotificationFromDOM(notification) {
  if (notification.parentNode) {
    notification.parentNode.removeChild(notification);
  }
}

/**
 * Keyboard Shortcuts Module
 * Handles keyboard navigation and shortcuts
 */

// Keyboard shortcut configuration
const KEYBOARD_SHORTCUTS = {
  focusUrlInput: 'd',
  submitForm: 'Enter',
  closeModal: 'Escape',
  urlInputId: 'urlInput',
  historyModalId: 'historyModal'
};

/**
 * Initializes keyboard event listeners
 */
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', handleKeyboardInput);
}

/**
 * Handles keyboard input events
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardInput(event) {
  if (isFocusUrlInputShortcut(event)) {
    handleFocusUrlInputShortcut(event);
  } else if (isSubmitFormShortcut(event)) {
    handleSubmitFormShortcut(event);
  } else if (isCloseModalShortcut(event)) {
    handleCloseModalShortcut();
  }
}

/**
 * Checks if the event is the focus URL input shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean} True if it's the focus shortcut
 */
function isFocusUrlInputShortcut(event) {
  return event.key === KEYBOARD_SHORTCUTS.focusUrlInput && 
         !event.ctrlKey && 
         !event.altKey && 
         window.location.pathname.includes('detect');
}

/**
 * Handles focus URL input shortcut
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleFocusUrlInputShortcut(event) {
  const urlInputElement = document.getElementById(KEYBOARD_SHORTCUTS.urlInputId);
  
  if (urlInputElement) {
    urlInputElement.focus();
    event.preventDefault();
  }
}

/**
 * Checks if the event is the submit form shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean} True if it's the submit shortcut
 */
function isSubmitFormShortcut(event) {
  return event.key === KEYBOARD_SHORTCUTS.submitForm && 
         event.target.id === KEYBOARD_SHORTCUTS.urlInputId;
}

/**
 * Handles submit form shortcut
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleSubmitFormShortcut(event) {
  detectUrl();
  event.preventDefault();
}

/**
 * Checks if the event is the close modal shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {boolean} True if it's the close modal shortcut
 */
function isCloseModalShortcut(event) {
  return event.key === KEYBOARD_SHORTCUTS.closeModal;
}

/**
 * Handles close modal shortcut
 */
function handleCloseModalShortcut() {
  const historyModal = document.getElementById(KEYBOARD_SHORTCUTS.historyModalId);
  
  if (historyModal && historyModal.style.display === 'flex') {
    closeHistory();
  }
}

/**
 * URL Counter Module
 * Tracks and displays URL analysis statistics
 */

// URL counter configuration
const URL_COUNTER_CONFIG = {
  storageKey: 'urlsAnalyzed',
  counterElementId: 'urlsAnalyzed',
  millionThreshold: 1000000,
  thousandThreshold: 1000
};

/**
 * Initializes URL analysis counter
 */
function initializeUrlCounter() {
  const counterElement = document.getElementById(URL_COUNTER_CONFIG.counterElementId);
  let currentCount = getStoredUrlCount();
  
  /**
   * Updates the counter display with formatted number
   */
  function updateCounterDisplay() {
    if (counterElement) {
      counterElement.textContent = formatUrlCount(currentCount);
    }
  }
  
  /**
   * Increments the URL counter and updates display
   */
  window.incrementUrlCounter = function() {
    currentCount += 1;
    saveUrlCount(currentCount);
    updateCounterDisplay();
  };
  
  // Initial display
  updateCounterDisplay();
}

/**
 * Gets stored URL count from localStorage
 * @returns {number} Stored URL count or 0
 */
function getStoredUrlCount() {
  const storedCount = localStorage.getItem(URL_COUNTER_CONFIG.storageKey);
  return storedCount ? parseInt(storedCount, 10) : 0;
}

/**
 * Saves URL count to localStorage
 * @param {number} count - URL count to save
 */
function saveUrlCount(count) {
  localStorage.setItem(URL_COUNTER_CONFIG.storageKey, count.toString());
}

/**
 * Formats URL count for display (e.g., 1.2M+, 5.5K+)
 * @param {number} count - URL count to format
 * @returns {string} Formatted count string
 */
function formatUrlCount(count) {
  if (count >= URL_COUNTER_CONFIG.millionThreshold) {
    return (count / URL_COUNTER_CONFIG.millionThreshold).toFixed(1) + 'M+';
  } else if (count >= URL_COUNTER_CONFIG.thousandThreshold) {
    return (count / URL_COUNTER_CONFIG.thousandThreshold).toFixed(1) + 'K+';
  } else {
    return count.toString();
  }
}

/**
 * Application Initialization Module
 * Handles page setup and event listener initialization
 */

/**
 * Initializes the application when DOM is loaded
 */
function initializeApplication() {
  initializeDarkMode();
  initializeUrlCounter();
  initializeKeyboardShortcuts();
  initializeButtonHandlers();
  initializeModalHandlers();
}

/**
 * Initializes button click handlers
 */
function initializeButtonHandlers() {
  const actionButtons = document.querySelectorAll('.primary-btn, .secondary-btn');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });
}

/**
 * Handles button click events
 * @param {Event} event - Click event
 */
function handleButtonClick(event) {
  const buttonText = event.target.textContent.trim();
  
  // Prevent default action for detect buttons to avoid form submission
  if (buttonText === 'Detect') {
    event.preventDefault();
  }
}

/**
 * Initializes modal event handlers
 */
function initializeModalHandlers() {
  document.addEventListener('click', handleModalClick);
}

/**
 * Handles clicks outside modal to close it
 * @param {Event} event - Click event
 */
function handleModalClick(event) {
  const historyModal = document.getElementById(HISTORY_CONFIG.modalId);
  
  if (event.target === historyModal) {
    closeHistory();
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApplication);