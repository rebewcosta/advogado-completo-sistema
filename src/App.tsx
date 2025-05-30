// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from 'react'; // Adicionado createContext, useContext
import { Navigate, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import MeusProcessosPage from './pages/MeusProcessosPage';
import AgendaPage from './pages/AgendaPage';
import TarefasPage from './pages/TarefasPage';
import FinanceiroPage from './pages/FinanceiroPage';
import DocumentosPage from './pages/DocumentosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import PagamentoPage from './pages/PagamentoPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import NotFound from './pages/NotFound';
import TermosPrivacidadePage from './pages/TermosPrivacidadePage';
import SuportePage from './pages/SuportePage';
import EmailsTransacionaisPage from './pages/EmailsTransacionaisPage';
import AdminPage from './pages/AdminPage';
import RecuperarSenhaPage from './pages/RecuperarSenhaPage';
import AtualizarSenhaPage from './pages/AtualizarSenhaPage';
import PerfilUsuarioPage from './pages/PerfilUsuarioPage';
import RedefinirPinFinanceiroPage from './pages/RedefinirPinFinanceiroPage';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import VerificarAssinatura from './components/VerificarAssinatura';

// Os ícones e Button para o banner PWA serão usados no HeroSection agora.

// 1. Criar o Contexto PWA
interface PWAInstallContextType {
  deferredInstallPrompt: Event | null;
  canInstallPWA: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  showPWAInstallBanner: boolean; // Renomeado de showInstallBanner para clareza do contexto
  triggerPWAInstall: () => void;
  dismissPWAInstallBanner: () => void;
}

export const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  if (!context) {
    // Se precisar usar fora do provider, pode retornar um objeto default ou lançar erro.
    // Para esta aplicação, esperamos que esteja sempre dentro do provider.
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState(false); // Usando o nome do estado do contexto
  const [canInstallPWA, setCanInstallPWA] = useState(false); // Se o navegador disparou o prompt
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPad = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const macIntelWithTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    setIsIOS(iPad || macIntelWithTouch);
    
    if (standalone) {
      console.log('PWA: App rodando em modo standalone. Banner de instalação não será preparado.');
      setShowPWAInstallBanner(false);
      return; 
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setCanInstallPWA(true);
      const dismissedTimestamp = localStorage.getItem('pwaInstallDismissedTimestamp');
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 semana
      if (!dismissedTimestamp || (Date.now() - parseInt(dismissedTimestamp, 10) > oneWeek)) {
        setShowPWAInstallBanner(true); 
      }
      console.log('PWA: beforeinstallprompt event fired e prevenido.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleAppInstalled = () => {
      console.log('PWA: App instalado com sucesso!');
      setShowPWAInstallBanner(false); 
      setDeferredInstallPrompt(null);
      setIsStandalone(true); 
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); 

  const triggerPWAInstall = async () => {
    if (!deferredInstallPrompt) {
      if(isIOS && !isStandalone) {
          alert("Para instalar no iOS: toque no botão Compartilhar (caixa com seta para cima) no Safari e depois em 'Adicionar à Tela de Início'.");
      }
      return;
    }
    (deferredInstallPrompt as any).prompt();
    const { outcome } = await (deferredInstallPrompt as any).userChoice;
    if (outcome === 'accepted') {
      console.log('PWA: Usuário aceitou a instalação.');
    } else {
      console.log('PWA: Usuário recusou a instalação.');
    }
    setDeferredInstallPrompt(null);
    setShowPWAInstallBanner(false);
  };

  const dismissPWAInstallBanner = () => {
    setShowPWAInstallBanner(false);
    localStorage.setItem('pwaInstallDismissedTimestamp', Date.now().toString());
    console.log('PWA: Banner de instalação dispensado pelo usuário.');
  }
  
  const pwaContextValue: PWAInstallContextType = {
    deferredInstallPrompt,
    canInstallPWA,
    isStandalone,
    isIOS,
    showPWAInstallBanner, // Passando o estado correto
    triggerPWAInstall,    // Passando a função correta
    dismissPWAInstallBanner // Passando a função correta
  };

  return (
    <PWAInstallContext.Provider value={pwaContextValue}>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/termos-privacidade" element={<TermosPrivacidadePage />} />
        <Route path="/suporte" element={<SuportePage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
        <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />

        {/* Rotas de autenticação - acessíveis apenas quando não logado */}
        <Route element={<ProtectedRoute requireAuth={false} redirectPath="/dashboard" />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
        </Route>

        {/* Rotas de pagamento */}
        <Route path="/pagamento" element={<PagamentoPage />} />
        <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />

        {/* Rotas protegidas - requerem autenticação */}
        <Route element={<ProtectedRoute requireAuth={true} redirectPath="/login"/>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/perfil" element={<PerfilUsuarioPage />} />

          <Route element={<VerificarAssinatura />}>
            <Route path="/meus-processos" element={<MeusProcessosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/tarefas" element={<TarefasPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/documentos" element={<DocumentosPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* O JSX do banner foi removido daqui, pois será colocado na HeroSection via Contexto */}
    </PWAInstallContext.Provider>
  );
}

export default App;