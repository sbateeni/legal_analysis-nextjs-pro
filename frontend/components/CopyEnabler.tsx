import { useEffect } from 'react';

/**
 * Copy enabler component for Next.js
 * مكون تفعيل النسخ لـ Next.js
 */
export const CopyEnabler = () => {
  useEffect(() => {
    // Client-side only execution
    if (typeof window === 'undefined') return;
    
    const script = `
          (function() {
            console.log('🔓 Initializing copy functionality...');
            
            function enableCopyFunctionality() {
              // Remove event listeners that prevent copying
              const eventsToRemove = [
                'selectstart', 'dragstart', 'contextmenu', 'copy', 'cut', 'paste'
              ];

              eventsToRemove.forEach(eventName => {
                document.removeEventListener(eventName, function(e) { return false; }, true);
                document.removeEventListener(eventName, function(e) { return false; }, false);
              });

              // Override common copy prevention methods
              document.onselectstart = null;
              document.ondragstart = null;
              document.oncontextmenu = null;
              document.oncopy = null;
              document.oncut = null;
              document.onpaste = null;

              // Add CSS styles to enable copying
              const style = document.createElement('style');
              style.id = 'enable-copy-styles';
              style.textContent = \`
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

                .no-select, .noselect, .unselectable {
                  -webkit-user-select: text !important;
                  -moz-user-select: text !important;
                  user-select: text !important;
                }

                body {
                  -webkit-user-select: text !important;
                  -moz-user-select: text !important;
                  user-select: text !important;
                }
              \`;
              
              // Remove existing style if present
              const existingStyle = document.getElementById('enable-copy-styles');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              document.head.appendChild(style);
            }

            // Initialize immediately
            enableCopyFunctionality();
            
            // Re-enable after DOM changes
            if (typeof MutationObserver !== 'undefined') {
              const observer = new MutationObserver(() => {
                enableCopyFunctionality();
              });
              
              observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
              });
            }
            
            // Re-enable on various events
            document.addEventListener('focus', enableCopyFunctionality);
            document.addEventListener('click', enableCopyFunctionality);
            document.addEventListener('DOMContentLoaded', enableCopyFunctionality);
            
            console.log('✅ Copy functionality enabled globally - تم تفعيل وظيفة النسخ عالمياً');
          })();
    `;
    
    // Execute the script
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = script;
    document.head.appendChild(scriptElement);
    
    // Cleanup function
    return () => {
      if (scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};

export default CopyEnabler;