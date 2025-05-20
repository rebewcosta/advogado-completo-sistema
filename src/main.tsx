import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';

// Add meta viewport tag to ensure proper mobile rendering
const updateViewport = () => {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
};

updateViewport();

const tryRemoveLovableElements = () => {
  const selectors = [
    '[class*="lovable-banner"]', 
    '[class*="lovable-editor"]', 
    '[class*="lovable-tagger"]',
    'a[id^="lovable-"]',
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    'a[href*="cdn.gpteng.co"][style*="position: fixed"]',
    'div[style*="z-index: 1000000"]',
    'div[style*="z-index: 999999999"]',
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    'div#gpt-engineer-container div[style*="position: fixed"]',
    '#lovable-badge' 
  ];

  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName === 'SCRIPT' || el.id === 'root' || el.closest('#root') || el.tagName === 'BODY' || el.tagName === 'HTML') {
          return; 
        }
        
        if (el.tagName === 'A' && (el as HTMLAnchorElement).href.includes('lovable.dev')) {
            el.remove();
            return;
        }

        if (el.id && el.id.startsWith('lovable-')) {
            el.remove();
            return;
        }
        
        el.remove();
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }
};

const LOVABLE_SELECTORS_FOR_OBSERVER = [
  'a[id^="lovable-"]',
  'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
  '#lovable-badge'
];

const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements(); 

  if (typeof MutationObserver === 'undefined') {
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 50) { 
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    let nodesPotentiallyLovableAdded = false;
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (LOVABLE_SELECTORS_FOR_OBSERVER.some(sel => element.matches(sel)) || 
                    (element.id && element.id.startsWith('lovable-')) ||
                    LOVABLE_SELECTORS_FOR_OBSERVER.some(sel => element.querySelector(sel)) ||
                    element.querySelectorAll('[id^="lovable-"]').length > 0
                   ) {
                    nodesPotentiallyLovableAdded = true;
                }
            }
        });
        if (nodesPotentiallyLovableAdded) break; 
      }
    }
    if (nodesPotentiallyLovableAdded) {
      tryRemoveLovableElements();
    }
  });

  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      setTimeout(startObserving, 50);
    }
  };
  
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      tryRemoveLovableElements(); 
      startObserving();
    });
  } else { 
    tryRemoveLovableElements(); 
    startObserving();
  }

  let initialAttempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    initialAttempts++;
    if (initialAttempts > 30) { 
      clearInterval(initialIntervalId);
    }
  }, 100);
};

observeAndRemoveLovableBanner();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error("Elemento root não encontrado no DOM.");
}