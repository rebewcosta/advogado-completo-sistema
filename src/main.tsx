import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';

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
```