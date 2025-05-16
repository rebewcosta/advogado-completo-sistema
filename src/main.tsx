
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

// Add meta viewport tag to ensure proper mobile rendering
const updateViewport = () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
};

// Hide any "Edit with lovable" elements that might be injected
const hideEditBanner = () => {
  // Create a style element to hide any "Edit with lovable" elements
  const style = document.createElement('style');
  style.textContent = `
    [data-lovable-selector],
    [class*="lovable"],
    [id*="lovable"],
    [class*="gpteng"],
    [id*="gpteng"],
    [class*="gpt-eng"],
    [id*="gpt-eng"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
      position: absolute !important;
      overflow: hidden !important;
      z-index: -9999 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Remove any existing lovable/gpteng elements
  setTimeout(() => {
    document.querySelectorAll('[data-lovable-selector], [class*="lovable"], [id*="lovable"], [class*="gpteng"], [id*="gpteng"], [class*="gpt-eng"], [id*="gpt-eng"]').forEach(el => {
      el.remove();
    });
  }, 100);
};

// Execute viewport update and banner hiding
updateViewport();
hideEditBanner();

// Also set up a mutation observer to hide any dynamically added elements
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        hideEditBanner();
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
