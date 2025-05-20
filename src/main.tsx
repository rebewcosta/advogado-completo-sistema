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
    'a[id^="lovable-"]', // Alvo em IDs de links começando com "lovable-"
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    'a[href*="cdn.gpteng.co"][style*="position: fixed"]',
    'div[style*="z-index: 1000000"]', // z-index visto na sua imagem
    'div[style*="z-index: 999999999"]', // Um z-index comum para overlays
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    'div#gpt-engineer-container div[style*="position: fixed"]',
    '#lovable-badge' // ID que apareceu no inspetor de estilos
  ];

  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Verificações para não remover elementos essenciais
        if (el.tagName === 'SCRIPT' || el.id === 'root' || el.closest('#root') || el.tagName === 'BODY' || el.tagName === 'HTML') {
          return; 
        }
        
        // Condições mais específicas para remover com segurança
        if (el.tagName === 'A' && (el as HTMLAnchorElement).href.includes('lovable.dev')) {
            el.remove();
            // console.log("Lovable <a> removido por href:", selector, el);
            return;
        }

        if (el.id && el.id.startsWith('lovable-')) {
            el.remove();
            // console.log("Lovable elemento removido por ID:", selector, el);
            return;
        }
        
        // Para seletores mais genéricos (como os de classe ou z-index em divs), 
        // pode ser necessário adicionar mais verificações se houver risco de remover algo errado.
        // Por enquanto, a remoção é direta se o seletor corresponder e não for um elemento essencial.
        el.remove();
        // console.log("Lovable elemento removido por seletor genérico:", selector, el);
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }
};

// Seletores mais específicos e prováveis para verificar rapidamente no MutationObserver
const LOVABLE_SELECTORS_FOR_OBSERVER_CHECK = [
  'a[id^="lovable-"]',
  'a[href*="lovable.dev/projects/"]',
  '#lovable-badge'
];

const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements(); // Tentativa inicial imediata

  if (typeof MutationObserver === 'undefined') {
    // console.warn("MutationObserver não está disponível.");
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 60) { // Tenta por 6 segundos (60 * 100ms)
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    let potentialBannerNodeAdded = false;
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                // Verifica se o nó adicionado OU qualquer um de seus filhos corresponde aos seletores chave
                if (LOVABLE_SELECTORS_FOR_OBSERVER_CHECK.some(sel => element.matches(sel) || element.querySelector(sel)) ||
                    (element.id && element.id.startsWith('lovable-')) ||
                    element.querySelectorAll('[id^="lovable-"]').length > 0 ) {
                    potentialBannerNodeAdded = true;
                }
            }
        });
        if (potentialBannerNodeAdded) break; 
      }
    }
    
    // Se um nó potencialmente problemático foi adicionado, ou para garantir em outras mutações,
    // chama a função de remoção.
    if (potentialBannerNodeAdded) {
      tryRemoveLovableElements();
    }
  });

  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      // console.log("Lovable banner observer iniciado.");
    } else {
      // console.log("document.body ainda não disponível, tentando observar em breve.");
      setTimeout(startObserving, 30); // Tenta um pouco mais rápido
    }
  };
  
  // Tenta executar a remoção o mais cedo possível
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      tryRemoveLovableElements(); 
      startObserving();
    });
  } else { // Se o DOM já estiver interativo ou completo
    tryRemoveLovableElements(); 
    startObserving();
  }

  // Tentativas adicionais nos primeiros momentos após o carregamento
  let initialAttempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    initialAttempts++;
    if (initialAttempts > 40) { // Tenta por 4 segundos (40 * 100ms)
      clearInterval(initialIntervalId);
    }
  }, 100);
};

observeAndRemoveLovableBanner();

// Mount the app
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