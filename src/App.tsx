// src/App.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
// ... (outras importações de páginas e componentes) ...
import Index from './pages/Index'; // Certifique-se que Index está importado
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
import { Download, X as CloseIcon, Share2 } from 'lucide-react'; // Adicionado Share2 para iOS

// Criar um contexto simples para o PWA install prompt (se ainda não existir ou se quiser refatorar)
interface PWAInstallContextType {
  deferredInstallPrompt: Event | null;
  canInstallPWA: boolean; // Indica se o navegador suporta e disparou o prompt
  isStandalone: boolean; // Indica se o app já está rodando como PWA instalado
  triggerInstall: () => Promise<void>;
  showInstallBannerGlobal: boolean; // Novo estado para controlar o banner global
  setShowInstallBannerGlobal: React.Dispatch<React.SetStateAction<boolean>>; // Para dispensar o banner
}
const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

export const usePWAInstall = () => useContext(PWAInstallContext);

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallBannerGlobal, setShowInstallBannerGlobal] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iPad = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const macIntel = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1; // iPads mais novos
    setIsIOS(iPad || macIntel);
    
    if (standalone) {
      console.log('PWA: App rodando em modo standalone. Banner de instalação não será mostrado.');
      setShowInstallBannerGlobal(false);
      return; // Não faz mais nada se já estiver instalado
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setCanInstallPWA(true); // Navegador suporta a instalação
      setShowInstallBannerGlobal(true); // Mostrar o banner
      console.log('PWA: beforeinstallprompt event fired e prevenido. Banner customizado deve aparecer.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleAppInstalled = () => {
      console.log('PWA: App instalado com sucesso!');
      setShowInstallBannerGlobal(false); 
      setDeferredInstallPrompt(null);
      setIsStandalone(true); // Marcar como instalado
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Executa apenas uma vez na montagem

  const triggerInstall = async () => {
    if (!deferredInstallPrompt) {
      // Se não há deferredPrompt, mas é iOS e não está instalado, talvez o usuário precise de instruções.
      // No entanto, este botão é para navegadores que SUPORTAM o prompt.
      if(isIOS && !isStandalone) {
        alert("Para instalar no iOS: toque no botão Compartilhar no Safari e depois em 'Adicionar à Tela de Início'.");
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
    setShowInstallBannerGlobal(false);
    // Não precisa setar canInstallPWA para false, pois o navegador pode disparar o evento novamente se os critérios mudarem.
  };

  const handleDismissBanner = () => {
    setShowInstallBannerGlobal(false);
    // Opcional: localStorage.setItem('pwaInstallDismissedTimestamp', Date.now().toString());
    console.log('PWA: Banner de instalação dispensado pelo usuário.');
  }

  // Só mostrar o banner se não estiver em modo standalone E (se o prompt estiver disponível OU se for iOS)
  const shouldShowBanner = !isStandalone && showInstallBannerGlobal;

  return (
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
      {shouldShowBanner && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4 bg-gray-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left"
          role="alertdialog" // Melhor para acessibilidade, pois é um "diálogo"
          aria-labelledby="pwa-install-banner-title"
          aria-describedby="pwa-install-banner-description"
        >
          <img src="/icons/icon-192x192.png" alt="JusGestão" className="h-10 w-10 rounded-md flex-shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <h3 id="pwa-install-banner-title" className="text-sm sm:text-base font-semibold">
              {isIOS ? "Acesso Rápido ao JusGestão" : "Instale o JusGestão App"}
            </h3>
            <p id="pwa-install-banner-description" className="text-xs sm:text-sm text-gray-300">
              {isIOS 
                ? "Toque em Compartilhar <Share2Icon className='inline h-3 w-3 align-text-bottom'/> e 'Adicionar à Tela de Início'."
                : "Tenha o JusGestão na sua tela inicial para acesso rápido e fácil!"}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {!isIOS && canInstallPWA && deferredInstallPrompt && ( // Botão de Instalar só se 'canInstallPWA' e 'deferredInstallPrompt' existirem
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
              size="sm" // Usar sm para consistência ou icon se preferir
              onClick={handleDismissBanner}
              className="text-gray-400 hover:text-white hover:bg-gray-700 h-auto px-2 py-1.5 sm:px-3" // Ajustar padding e altura
              aria-label="Dispensar instalação"
            >
              <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5 md:hidden" /> {/* Ícone para mobile */}
              <span className="hidden md:inline text-xs">Agora Não</span> {/* Texto para desktop */}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;