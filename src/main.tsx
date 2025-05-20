import React from 'react'; // <<<< IMPORTAÇÃO ADICIONADA AQUI
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
    // Adicionar seletores mais genéricos se o banner tiver outros nomes/classes
    // Cuidado para não remover elementos legítimos da sua aplicação
    // 'div[style*="z-index: 999999999"]', // Exemplo de um seletor mais genérico (USAR COM CAUTELA)
  ];

  let removed = false;
  try { // Adicionado try-catch para seletores potencialmente inválidos
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.tagName !== 'SCRIPT' && el.id !== 'root') { // Não remover o script ou o root do seu app
          el.remove();
          removed = true;
        }
      });
    });
  } catch (e) {
    console.warn("Erro ao tentar remover elementos Lovable com seletores:", e);
  }

  if (removed) {
    // console.log("Lovable elements removed by direct selection.");
  }
};


// Função para remover banners da Lovable de forma mais persistente
const observeAndRemoveLovableBanner = () => {
  tryRemoveLovableElements();

  // Verifica se MutationObserver está disponível (não existe em todos os ambientes, como alguns testes)
  if (typeof MutationObserver === 'undefined') {
    console.warn("MutationObserver não está disponível. Remoção persistente do banner pode não funcionar.");
    return;
  }

  const observer = new MutationObserver((mutationsList, observerInstance) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        tryRemoveLovableElements();
      }
    }
  });

  // Garante que document.body exista antes de observar
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    // Se o body ainda não existe, tenta observar quando o DOM estiver carregado
    window.addEventListener('DOMContentLoaded', () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  let attempts = 0;
  const intervalId = setInterval(() => {
    tryRemoveLovableElements();
    attempts++;
    if (attempts > 15) { // Aumentado para 1.5 segundos
      clearInterval(intervalId);
    }
  }, 100);

  console.log("Lovable banner observer and remover initialized.");
};

// Execute a remoção do banner
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