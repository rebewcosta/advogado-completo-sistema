
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

// Função aprimorada para remover elementos Lovable
const tryRemoveLovableElements = () => {
  // Seletores mais abrangentes para pegar qualquer variante do banner
  const selectors = [
    // Seletores originais
    '[class*="lovable-banner"]', '[id*="lovable-banner"]',
    '[class*="lovable-editor"]', '[id*="lovable-editor"]',
    '[class*="lovable-tagger"]', '[id*="lovable-tagger"]',
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    'div#gpt-engineer-container div[style*="position: fixed"]',
    
    // Seletores adicionais para maior abrangência
    '[style*="position: fixed"][style*="bottom"][style*="right"]',
    '[style*="z-index: 9999"]',
    'a[href*="lovable.dev"]',
    'div[style*="position: fixed"]',
    '[data-lovable]',
    '[class*="gpte"]',
    '[id*="gpte"]',
    '[class*="gpt-engineer"]',
    '[id*="gpt-engineer"]',
    // Seletor para SVG específico usado no banner
    'svg[viewBox="0 0 32 32"]',
  ];

  let removed = false;
  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Verifica se o elemento não é essencial para o funcionamento da aplicação
        if (el.tagName !== 'SCRIPT' && el.id !== 'root' && !el.closest('#root')) {
          if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
            // Remove ou torna invisível
            if (el.style) {
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.opacity = '0 !important';
              el.style.pointerEvents = 'none !important';
              el.style.width = '0 !important';
              el.style.height = '0 !important';
            }
            el.remove();
            removed = true;
          }
        }
      });
    });
    
    // Adiciona CSS global para ocultar elementos que possam aparecer depois
    const style = document.createElement('style');
    style.textContent = `
      [class*="lovable-banner"], [id*="lovable-banner"],
      [class*="lovable-editor"], [id*="lovable-editor"],
      [class*="lovable-tagger"], [id*="lovable-tagger"],
      a[href*="lovable.dev"],
      div[style*="z-index: 999999999"][style*="position: fixed"],
      div#gpt-engineer-container div[style*="position: fixed"],
      [class*="gpte"], [id*="gpte"],
      [class*="gpt-engineer"], [id*="gpt-engineer"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -9999px !important;
      }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable:", e);
  }
};


// Função aprimorada para observar e remover continuamente
const observeAndRemoveLovableBanner = () => {
  // Executa inicialmente
  tryRemoveLovableElements();

  // Configura para executar a cada 100ms nos primeiros 10 segundos
  let attempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    attempts++;
    if (attempts > 100) { // 10 segundos (100 * 100ms)
      clearInterval(initialIntervalId);
    }
  }, 100);

  // Configura MutationObserver para reagir a mudanças no DOM
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutationsList) => {
      let nodesAdded = false;
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          nodesAdded = true;
          break;
        }
      }
      if (nodesAdded) {
        tryRemoveLovableElements();
      }
    });

    // Inicia a observação no body quando disponível
    const startObserving = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        setTimeout(startObserving, 50);
      }
    };
    startObserving();
  }

  // Configura para verificar periodicamente após o carregamento (F5)
  window.addEventListener('load', () => {
    tryRemoveLovableElements();
    setTimeout(tryRemoveLovableElements, 500);
    setTimeout(tryRemoveLovableElements, 1000);
    setTimeout(tryRemoveLovableElements, 2000);
  });

  // Intercepta possíveis tentativas de recriar o banner
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    // Intercepta a criação de elementos que podem ser usados para o banner
    setTimeout(() => {
      if (
        element.className?.includes?.('lovable') || 
        element.id?.includes?.('lovable') || 
        element.href?.includes?.('lovable.dev')
      ) {
        element.style.display = 'none !important';
        element.style.visibility = 'hidden !important';
        element.style.opacity = '0 !important';
      }
    }, 0);
    
    return element;
  };
};

// Inicia todo o processo de remoção do banner
observeAndRemoveLovableBanner();

// Adiciona CSS na tag head para garantir que os elementos não apareçam mesmo durante o carregamento
const addCamouflageCss = () => {
  const style = document.createElement('style');
  style.textContent = `
    [class*="lovable"], [id*="lovable"],
    [class*="gpte"], [id*="gpte"],
    [class*="gpt-engineer"], [id*="gpt-engineer"],
    a[href*="lovable.dev"],
    div[style*="z-index: 999999"][style*="position: fixed"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      width: 0 !important;
      height: 0 !important;
      position: absolute !important;
      left: -9999px !important;
    }
  `;
  document.head.appendChild(style);
};

// Executa a adição do CSS imediatamente e após o carregamento
addCamouflageCss();
window.addEventListener('DOMContentLoaded', addCamouflageCss);
window.addEventListener('load', addCamouflageCss);

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
