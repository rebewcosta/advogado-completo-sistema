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
    // Seletor específico para o banner "Edit with Lovable" se ele for um link <a>
    'a[href*="lovable.dev/projects/"][style*="position: fixed"]', 
    // Seletor mais genérico baseado em estilos comuns de banners flutuantes
    // CUIDADO: Este seletor pode ser muito agressivo e remover outros elementos flutuantes se não for específico o suficiente.
    // 'div[style*="z-index: 999999999"][style*="bottom:"][style*="right:"]',
    // Seletor que funcionou em testes para o banner específico:
    'div[style*="z-index: 999999999 !important"][style*="position: fixed !important"][style*="bottom: 20px !important"][style*="right: 20px !important"]',
    // Tenta pegar o contêiner do GPT Engineer se ele injetar o banner
    'div#gpt-engineer-container div[style*="position: fixed"]' 
  ];

  let removed = false;
  try {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // Verifica se o elemento não é o root da aplicação ou um script essencial
        if (el.tagName !== 'SCRIPT' && el.id !== 'root' && !el.closest('#root')) {
          // Adiciona uma verificação para não remover o próprio body ou html
          if (el.tagName !== 'BODY' && el.tagName !== 'HTML') {
            el.remove();
            removed = true;
            // console.log("Elemento Lovable removido:", selector, el); // Para debug
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
    // Fallback para tentativas repetidas se MutationObserver não estiver disponível
    let attempts = 0;
    const intervalId = setInterval(() => {
      tryRemoveLovableElements();
      attempts++;
      if (attempts > 30) { // Tenta por 3 segundos (30 * 100ms)
        clearInterval(intervalId);
      }
    }, 100);
    return;
  }

  const observer = new MutationObserver((mutationsList, observerInstance) => {
    // Não precisamos iterar mutationsList se vamos chamar tryRemoveLovableElements() de qualquer forma
    // Isso simplifica e garante que qualquer adição ao body seja verificada.
    tryRemoveLovableElements();
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
    window.addEventListener('DOMContentLoaded', () => {
      tryRemoveLovableElements(); // Tenta remover assim que o DOM básico estiver pronto
      startObserving();
    });
  } else {
    tryRemoveLovableElements(); // Tenta remover imediatamente se o DOM já estiver carregado
    startObserving();
  }

  // Adicionalmente, executa algumas vezes no início para garantir
  let initialAttempts = 0;
  const initialIntervalId = setInterval(() => {
    tryRemoveLovableElements();
    initialAttempts++;
    if (initialAttempts > 20) { // Tenta por 2 segundos (20 * 100ms)
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