// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
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

import { Button } from '@/components/ui/button';
import { Download, X as CloseIcon, Share2 } from 'lucide-react';

// Contexto PWA (Opcional, mas bom para organizar se a lógica crescer)
interface PWAInstallContextType {
  deferredInstallPrompt: Event | null;
  canInstallPWA: boolean;
  isStandalone: boolean;
  triggerInstall: () => Promise<void>;
  showInstallBannerGlobal: boolean;
  setShowInstallBannerGlobal: React.Dispatch<React.SetStateAction<boolean>>;
}
const PWAInstallContext = createContext<PWAInstallContextType | null>(null);
export const usePWAInstall = () => useContext(PWAInstallContext); // Hook para usar o contexto

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBannerGlobal, setShowInstallBannerGlobal] = useState(false);

  useEffect(() => {
    // Verifica se o app já está rodando em modo standalone (instalado)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    // Detecta se é iOS para mensagens customizadas
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPad = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const macIntelWithTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1; // iPads mais novos
    setIsIOS(iPad || macIntelWithTouch);
    
    // Se já estiver instalado, não faz mais nada relacionado ao prompt de instalação
    if (standalone) {
      console.log('PWA: App rodando em modo standalone. Banner de instalação não será mostrado.');
      setShowInstallBannerGlobal(false); // Garante que o banner não seja mostrado
      return; 
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Previne o mini-infobar padrão do Chrome
      setDeferredInstallPrompt(event); // Guarda o evento
      setCanInstallPWA(true); // Indica que o navegador suporta e disparou o prompt
      setShowInstallBannerGlobal(true); // Mostra nosso banner customizado
      console.log('PWA: beforeinstallprompt event fired e prevenido. Banner customizado deve aparecer.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listener para quando o app é efetivamente instalado
    const handleAppInstalled = () => {
      console.log('PWA: App instalado com sucesso!');
      setShowInstallBannerGlobal(false); // Esconde o banner
      setDeferredInstallPrompt(null); // Limpa o prompt, pois só pode ser usado uma vez
      setIsStandalone(true); // Marca que o app agora está instalado
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Limpeza dos listeners quando o componente App é desmontado
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Array de dependências vazio para rodar apenas na montagem e desmontagem

  // Função para acionar o prompt de instalação
  const triggerInstall = async () => {
    if (!deferredInstallPrompt) {
      // Se não há deferredInstallPrompt, mas é iOS e não está instalado, mostra instruções
      if(isIOS && !isStandalone) {
        // Idealmente, essa mensagem seria mais integrada à UI, mas alert é simples para começar
        alert("Para instalar no iOS: toque no botão Compartilhar (caixa com seta para cima) no Safari e depois em 'Adicionar à Tela de Início'.");
      }
      return;
    }
    // Mostra o prompt de instalação do navegador
    (deferredInstallPrompt as any).prompt(); 
    // Espera pela escolha do usuário
    const { outcome } = await (deferredInstallPrompt as any).userChoice;
    if (outcome === 'accepted') {
      console.log('PWA: Usuário aceitou a instalação.');
    } else {
      console.log('PWA: Usuário recusou a instalação.');
    }
    // Limpa o prompt e esconde o banner
    setDeferredInstallPrompt(null);
    setShowInstallBannerGlobal(false);
  };

  // Função para dispensar o banner
  const handleDismissBanner = () => {
    setShowInstallBannerGlobal(false);
    // Opcional: Guardar no localStorage para não mostrar o banner por um tempo
    // localStorage.setItem('pwaInstallDismissedTimestamp', Date.now().toString());
    console.log('PWA: Banner de instalação dispensado pelo usuário.');
  }

  // Determina se o banner customizado deve ser exibido
  const shouldDisplayCustomPwaBanner = !isStandalone && showInstallBannerGlobal;

  return (
    // O Provider do Contexto PWA é opcional se toda a lógica e o banner ficarem apenas no App.tsx
    // Se você quiser acessar `triggerInstall` de outros lugares, o Contexto é útil.
    <PWAInstallContext.Provider value={{ deferredInstallPrompt, canInstallPWA, isStandalone, triggerInstall, showInstallBannerGlobal, setShowInstallBannerGlobal }}>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Index />} />
        <Route path="/termos-privacidade" element={<TermosPrivacidadePage />} />
        <Route path="/suporte" element={<SuportePage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
        <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />

        {/* Rotas de autenticação */}
        <Route element={<ProtectedRoute requireAuth={false} redirectPath="/dashboard" />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
        </Route>

        {/* Rotas de pagamento */}
        <Route path="/pagamento" element={<PagamentoPage />} />
        <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />

        {/* Rotas protegidas */}
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

      {/* Banner/Botão de Instalação Customizado do PWA */}
      {shouldDisplayCustomPwaBanner && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-[1000] p-3 md:p-4 bg-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4 text-center sm:text-left"
          role="alertdialog"
          aria-labelledby="pwa-install-banner-title"
          aria-describedby="pwa-install-banner-description"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src="/icons/icon-192x192.png" alt="JusGestão" className="h-10 w-10 rounded-md flex-shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <h3 id="pwa-install-banner-title" className="text-sm sm:text-base font-semibold">
                {isIOS ? "Acesso Rápido ao JusGestão" : "Instale o App JusGestão"}
              </h3>
              <p id="pwa-install-banner-description" className="text-xs sm:text-sm text-slate-300">
                {isIOS 
                  ? <>Toque em <Share2 className="inline h-3 w-3 align-baseline mx-0.5"/> e 'Adicionar à Tela de Início'.</>
                  : "Tenha na sua tela inicial para acesso rápido e fácil!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {/* Botão de Instalar só aparece se não for iOS E o prompt estiver disponível */}
            {!isIOS && canInstallPWA && deferredInstallPrompt && (
              <Button 
                onClick={triggerInstall} 
                size="sm" 
                className="bg-lawyer-primary hover:bg-lawyer-primary/80 text-white text-xs sm:text-sm px-3 py-1.5 h-auto"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Instalar
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white hover:bg-slate-700 h-auto px-2 py-1.5 text-xs" // Ajustado para ser um pouco menor e mais discreto
              aria-label="Dispensar"
            >
              <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5 md:hidden" /> {/* Ícone para mobile */}
              <span className="hidden md:inline">Agora Não</span> {/* Texto para desktop */}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
