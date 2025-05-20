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
    '[class*="lovable-banner"]', '[id*="lovable-banner"]',
    '[class*="lovable-editor"]', '[id*="lovable-editor"]',
    '[class*="lovable-tagger"]', '[id*="lovable-tagger"]',
    // Adicionando um seletor mais específico que possa pegar o banner "Edit with Lovable"
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    'div[style*="z-index: 999999999"][style*="bottom: 20px"][style*="right: 20px"]', // Exemplo mais genérico, mas pode ser arriscado
  ];

  let removed = false;
  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Verifica se o elemento não é o root da aplicação ou um script essencial
        if (el.tagName !== 'SCRIPT' && el.id !== 'root' && !el.closest('#root')) {
          el.remove();
          removed = true;
          // console.log("Elemento Lovable removido:", selector, el); // Para debug
        }
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }

  // if (removed) {
  //   console.log("Um ou mais elementos da Lovable foram removidos.");
  // }
};


const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements(); // Tentativa inicial

  if (typeof MutationObserver === 'undefined') {
    console.warn("MutationObserver não está disponível. Remoção persistente do banner pode não funcionar.");
    // Fallback para tentativas repetidas se MutationObserver não estiver disponível
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 20) { // Tenta por 2 segundos
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList, observerInstance) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verifica se algum nó adicionado corresponde aos seletores do banner
        let bannerEncontrado = false;
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.matches && (
              element.matches('a[href*="lovable.dev/projects/"][style*="position: fixed"]') ||
              element.matches('div[style*="z-index: 999999999"][style*="bottom: 20px"][style*="right: 20px"]') ||
              element.querySelector('a[href*="lovable.dev/projects/"][style*="position: fixed"]') || // Verifica filhos também
              element.querySelector('div[style*="z-index: 999999999"][style*="bottom: 20px"][style*="right: 20px"]')
              )
            ) {
              bannerEncontrado = true;
            }
          }
        });
        if (bannerEncontrado) {
          tryRemoveLovableElements();
        }
      }
    }
  });

  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      // console.log("Lovable banner observer iniciado no document.body.");
    } else {
      // Se o body ainda não existe, tenta novamente em breve
      // console.log("document.body ainda não disponível, tentando observar em breve.");
      setTimeout(startObserving, 50);
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startObserving);
  } else {
    startObserving();
  }

  // Adicionalmente, executa algumas vezes no início para garantir
  let initialAttempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    initialAttempts++;
    if (initialAttempts > 10) { // Tenta por 1 segundo
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