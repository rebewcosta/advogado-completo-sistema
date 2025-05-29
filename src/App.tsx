// src/App.tsx
import React, { useState, useEffect } from 'react'; // Adicionado useState e useEffect
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

<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { Download, X as CloseIcon, Share2 } from 'lucide-react';

// Contexto PWA (se você decidir usá-lo globalmente)
// Por enquanto, a lógica está contida em App.tsx
interface PWAInstallContextType {
  deferredInstallPrompt: Event | null;
  canInstallPWA: boolean;
  isStandalone: boolean;
  triggerInstall: () => Promise<void>;
  showInstallBannerGlobal: boolean;
  setShowInstallBannerGlobal: React.Dispatch<React.SetStateAction<boolean>>;
}
const PWAInstallContext = createContext<PWAInstallContextType | null>(null);
export const usePWAInstall = () => useContext(PWAInstallContext);

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false); // Se o navegador disparou beforeinstallprompt
  const [isStandalone, setIsStandalone] = useState(false); // Se já está rodando como app instalado
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBannerGlobal, setShowInstallBannerGlobal] = useState(false); // Controla a visibilidade do nosso banner

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPad = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    // Alguns iPads mais novos podem se identificar como MacIntel e ter touch.
    const macIntelWithTouch = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    setIsIOS(iPad || macIntelWithTouch);
    
    if (standalone) {
      console.log('PWA: App rodando em modo standalone. Banner de instalação não será mostrado.');
      setShowInstallBannerGlobal(false);
      return; 
    }

=======
import { Button } from '@/components/ui/button'; // Para o botão de instalação
import { Download, X as CloseIcon } from 'lucide-react'; // Para ícones do botão

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
    const handleBeforeInstallPrompt = (event: Event) => {
      // Impedir que o mini-infobar do Chrome (ou outros prompts padrão) apareça
      event.preventDefault();
      // Guardar o evento para que possa ser acionado mais tarde.
      setDeferredInstallPrompt(event);
<<<<<<< HEAD
      setCanInstallPWA(true); 
      setShowInstallBannerGlobal(true); 
=======
      // Mostrar seu banner/botão de instalação customizado
      setShowInstallBanner(true);
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
      console.log('PWA: beforeinstallprompt event fired e prevenido. Banner customizado deve aparecer.');
    };

    // Verificar se o app já foi instalado (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      console.log('PWA: App já está rodando em modo standalone, não mostrar prompt de instalação.');
      setShowInstallBanner(false); // Não mostrar se já estiver em modo app
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    
    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA: App instalado com sucesso!');
<<<<<<< HEAD
      setShowInstallBannerGlobal(false); 
      setDeferredInstallPrompt(null);
      setIsStandalone(true); 
=======
      setShowInstallBanner(false); // Esconder o banner após a instalação
      setDeferredInstallPrompt(null); // Limpar o prompt
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
    };
    window.addEventListener('appinstalled', handleAppInstalled);


    // Limpar os listeners quando o componente desmontar
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
<<<<<<< HEAD
  }, []); 
=======
  }, []);
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8

  const handleInstallClick = async () => {
    if (!deferredInstallPrompt) {
<<<<<<< HEAD
      if(isIOS && !isStandalone) {
        alert("Para instalar no iOS: toque no botão Compartilhar (caixa com seta para cima) no Safari e depois em 'Adicionar à Tela de Início'.");
      }
=======
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
      return;
    }
    // Mostrar o prompt de instalação
    (deferredInstallPrompt as any).prompt();

    // Esperar o usuário responder ao prompt
    const { outcome } = await (deferredInstallPrompt as any).userChoice;
    console.log(`PWA: User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('PWA: Usuário aceitou a instalação.');
    } else {
      console.log('PWA: Usuário recusou a instalação.');
    }

    // O prompt só pode ser usado uma vez.
    setDeferredInstallPrompt(null);
<<<<<<< HEAD
    setShowInstallBannerGlobal(false);
=======
    // Esconder o banner de instalação customizado
    setShowInstallBanner(false);
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    // Você pode guardar no localStorage que o usuário dispensou para não mostrar por um tempo
    // localStorage.setItem('pwaInstallDismissed', 'true');
    // localStorage.setItem('pwaInstallDismissedTimestamp', Date.now().toString());
    console.log('PWA: Banner de instalação dispensado pelo usuário.');
  }

<<<<<<< HEAD
  // Lógica de quando mostrar o banner:
  // Não está instalado E ( (é iOS e não temos prompt, então sempre mostramos a dica) OU (não é iOS e o prompt está disponível) )
  const shouldDisplayCustomPwaBanner = !isStandalone && showInstallBannerGlobal;

=======
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
  return (
    <>
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

      {/* Banner/Botão de Instalação Customizado do PWA */}
<<<<<<< HEAD
      {shouldDisplayCustomPwaBanner && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-[1000] p-3 md:p-4 bg-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-4 text-center sm:text-left"
          role="alertdialog"
=======
      {showInstallBanner && deferredInstallPrompt && (
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 md:p-4 bg-gray-800 text-white rounded-lg shadow-xl w-[90%] max-w-md sm:max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
          role="dialog"
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
          aria-labelledby="pwa-install-banner-title"
          aria-describedby="pwa-install-banner-description"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
<<<<<<< HEAD
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
              className="text-slate-400 hover:text-white hover:bg-slate-700 h-auto px-2 py-1.5 text-xs"
              aria-label="Dispensar"
            >
              <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5 md:hidden" />
              <span className="hidden md:inline">Agora Não</span>
=======
            <img src="/icons/icon-192x192.png" alt="JusGestão Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0" />
            <div className="min-w-0">
              <h3 id="pwa-install-banner-title" className="text-sm sm:text-base font-semibold truncate">Instale o JusGestão</h3>
              <p id="pwa-install-banner-description" className="text-xs sm:text-sm text-gray-300 truncate">Acesso rápido e fácil na sua tela inicial.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleInstallClick} 
              size="sm" 
              className="bg-lawyer-primary hover:bg-lawyer-primary/80 text-white flex-grow sm:flex-grow-0 text-xs sm:text-sm px-3 py-1.5 h-auto"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Instalar
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDismissBanner}
              className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
              aria-label="Dispensar instalação"
            >
              <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
>>>>>>> 430ebcaa7c31c82861cb00b854adf3ac1d3a94c8
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;