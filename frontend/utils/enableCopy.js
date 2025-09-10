/**
 * JavaScript utility to completely enable text selection and copying
 * أداة جافاسكريبت لتفعيل تحديد ونسخ النصوص بالكامل
 */

// Function to remove all copy protection
export const enableCopyFunctionality = () => {
  // Remove event listeners that prevent copying
  const eventsToRemove = [
    'selectstart',
    'dragstart', 
    'contextmenu',
    'copy',
    'cut',
    'paste'
  ];

  eventsToRemove.forEach(eventName => {
    document.removeEventListener(eventName, preventEvent, true);
    document.removeEventListener(eventName, preventEvent, false);
  });

  // Override common copy prevention methods
  document.onselectstart = null;
  document.ondragstart = null;
  document.oncontextmenu = null;
  document.oncopy = null;
  document.oncut = null;
  document.onpaste = null;

  // Enable text selection on body
  document.body.style.webkitUserSelect = 'text';
  document.body.style.mozUserSelect = 'text';
  document.body.style.msUserSelect = 'text';
  document.body.style.userSelect = 'text';

  // Add CSS styles to enable copying
  const style = document.createElement('style');
  style.id = 'enable-copy-styles';
  style.textContent = `
    * {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default !important;
    }
    
    ::selection {
      background-color: #3b82f6 !important;
      color: white !important;
    }
    
    ::-moz-selection {
      background-color: #3b82f6 !important;
      color: white !important;
    }
  `;
  
  // Remove existing style if present
  const existingStyle = document.getElementById('enable-copy-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(style);

  console.log('✅ تم تفعيل إمكانية النسخ والتحديد بنجاح');
};

// Function to prevent default behavior
function preventEvent(e) {
  // This function intentionally does nothing to allow the event
  return true;
}

// Enhanced copy function
export const copyToClipboard = async (text) => {
  try {
    // Method 1: Modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Method 2: Traditional method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    }
    
    // Method 3: Selection-based copy
    const selection = window.getSelection();
    const range = document.createRange();
    const span = document.createElement('span');
    span.textContent = text;
    span.style.whiteSpace = 'pre';
    span.style.position = 'fixed';
    span.style.left = '-999999px';
    document.body.appendChild(span);
    
    range.selectNode(span);
    selection.removeAllRanges();
    selection.addRange(range);
    
    const result = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(span);
    
    return result;
    
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

// Auto-enable on page load
export const initializeCopyFunctionality = () => {
  // Enable immediately
  enableCopyFunctionality();
  
  // Re-enable after DOM changes
  const observer = new MutationObserver(() => {
    enableCopyFunctionality();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // Re-enable on focus (in case other scripts disable it)
  document.addEventListener('focus', enableCopyFunctionality);
  document.addEventListener('click', enableCopyFunctionality);
  
  console.log('🔓 نظام إلغاء قيود النسخ مفعل بالكامل');
};

// Run immediately if in browser
if (typeof window !== 'undefined') {
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCopyFunctionality);
  } else {
    initializeCopyFunctionality();
  }
}