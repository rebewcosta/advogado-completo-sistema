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
  // **IMPORTANTE:** Verifique no inspetor do navegador se existem classes ou IDs mais específicos
  // para o banner da Lovable e adicione-os aqui.
  const selectors = [
    '[class*="lovable-banner"]', '[id*="lovable-banner"]',
    '[class*="lovable-editor"]', '[id*="lovable-editor"]',
    '[class*="lovable-tagger"]', '[id*="lovable-tagger"]',
    // Seletor específico para o banner "Edit with Lovable" se ele for um link <a>
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]',
    // Seu seletor que funcionou em testes para o banner específico:
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    // Tenta pegar o contêiner do GPT Engineer se ele injetar o banner
    'div#gpt-engineer-container div[style*="position: fixed"]',
    // Adicione aqui quaisquer novos seletores identificados via inspeção
    // Exemplo: '#lovable-specific-id', '.some-unique-lovable-class'
  ];

  let removed = false;
  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName !== 'SCRIPT' && el.id !== 'root' && !el.closest('#root')) {
          if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
            el.remove();
            removed = true;
            // console.log("Elemento Lovable removido:", selector, el); 
          }
        }
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }

  // if (removed) {
  //   console.log("Uma ou mais tentativas de remover elementos da Lovable foram feitas.");
  // }
};


const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements(); // Tentativa inicial

  if (typeof MutationObserver === 'undefined') {
    // console.warn("MutationObserver não está disponível. Remoção persistente do banner pode não funcionar.");
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 50) { // Tenta por 5 segundos (50 * 100ms) se não houver MutationObserver
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList, observerInstance) => {
    // Otimização: apenas executa se houver nós adicionados, para não rodar em cada mínima alteração.
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

  const startObserving = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      // console.log("Lovable banner observer iniciado no document.body.");
    } else {
      // console.log("document.body ainda não disponível, tentando observar em breve.");
      setTimeout(startObserving, 50);
    }
  };

  // Tenta remover assim que o DOM interativo estiver pronto
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      tryRemoveLovableElements(); 
      startObserving();
    });
  } else { // Se já carregou
    tryRemoveLovableElements(); 
    startObserving();
  }

  // Tentativas iniciais adicionais para pegar elementos que podem aparecer um pouco depois do DOMContentLoaded
  // mas antes do MutationObserver estar totalmente ativo ou em casos de scripts que demoram um pouco mais.
  let initialAttempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    initialAttempts++;
    if (initialAttempts > 30) { // Tenta por 3 segundos (30 * 100ms)
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