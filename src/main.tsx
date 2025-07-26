import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from './hooks/auth/AuthProvider.tsx' // 1. IMPORTAR O AUTHPROVIDER

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. ENVOLVER TUDO COM O AUTHPROVIDER */}
    <AuthProvider> 
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)