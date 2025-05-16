
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

// Execute viewport update
updateViewport();

// Remove any Lovable editor banners that might appear
const removeLovableBanner = () => {
  // Check for any Lovable editor elements and remove them
  setTimeout(() => {
    const possibleBanners = document.querySelectorAll('[class*="lovable"], [id*="lovable"], [class*="Lovable"], [id*="Lovable"]');
    possibleBanners.forEach(el => {
      if (el.tagName !== 'SCRIPT') {
        el.remove();
      }
    });
  }, 100);
};

// Execute banner removal
removeLovableBanner();

// Mount the app without the Lovable tagger
createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
