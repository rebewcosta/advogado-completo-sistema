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
    // Seletores genéricos que você já tinha (bons para cobrir variações)
    '[class*="lovable-banner"]', 
    '[class*="lovable-editor"]', 
    '[class*="lovable-tagger"]',
    
    // Alvo direto no ID que começa com "lovable-" para o link/banner
    'a[id^="lovable-"]', // O acento circunflexo (^) significa "começa com"

    // Alvo no link pelo href e características de estilo (MUITO IMPORTANTE)
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    'a[href*="cdn.gpteng.co"][style*="position: fixed"]', // Para cobrir outros possíveis links da Lovable

    // Alvo em divs que podem ser wrappers do banner, baseado em z-index alto
    // Ajustado para o z-index 1000000 visto na imagem e também o 999999999
    'div[style*="z-index: 1000000"]',
    'div[style*="z-index: 999999999"]',
    
    // Seu seletor de div que funcionou antes, mantido caso o <a> esteja dentro de um div com esses estilos
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    
    // Container do GPT Engineer
    'div#gpt-engineer-container div[style*="position: fixed"]',

    // Adicionando um seletor para o caso de #lovable-badge ser o ID do elemento 'a' ou de um wrapper
    '#lovable-badge' 
  ];

  let removed = false;
  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Verificações para não remover elementos essenciais
        if (el.tagName === 'SCRIPT' || el.id === 'root' || el.closest('#root') || el.tagName === 'BODY' || el.tagName === 'HTML') {
          return; // Pula este elemento
        }
        
        // Se o elemento for um link e contiver "lovable" no href, é um bom candidato
        if (el.tagName === 'A' && (el as HTMLAnchorElement).href.includes('lovable.dev')) {
            el.remove();
            removed = true;
            // console.log("Elemento <a> da Lovable removido pelo href:", selector, el);
            return;
        }

        // Se o ID começar com "lovable-", também remove
        if (el.id && el.id.startsWith('lovable-')) {
            el.remove();
            removed = true;
            // console.log("Elemento da Lovable removido pelo ID:", selector, el);
            return;
        }
        
        // Para outros seletores, remove se encontrado
        el.remove();
        removed = true;
        // console.log("Elemento Lovable removido (genérico):", selector, el);
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }

  // if (removed) {
  //   console.log("Uma ou mais tentativas de remover elementos da Lovable foram feitas.");
  // }
};

// Definindo a lista de seletores fora para ser acessível no callback do MutationObserver
const LOVABLE_SELECTORS_FOR_OBSERVER = [
  'a[id^="lovable-"]',
  'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
  '#lovable-badge'
  // Adicione outros seletores chave se necessário para a verificação do observer
];

const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements(); // Tentativa inicial

  if (typeof MutationObserver === 'undefined') {
    // console.warn("MutationObserver não está disponível. Remoção persistente do banner pode não funcionar.");
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 50) { // Tenta por 5 segundos
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList, observerInstance) => {
    let
     nodesPotentiallyLovableAdded = false;
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
      // console.log("Lovable banner observer iniciado no document.body.");
    } else {
      // console.log("document.body ainda não disponível, tentando observar em breve.");
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