// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { PWAProvider } from './contexts/PWAContext.tsx'; // Importar o PWAProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PWAProvider> {/* Adicionar PWAProvider aqui para envolver o App */}
        <App />
      </PWAProvider>
    </ThemeProvider>
  </React.StrictMode>,
);