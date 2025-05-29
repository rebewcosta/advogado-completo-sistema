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

import { Button } from '@/components/ui/button'; // Para o botão de instalação
import { Download, X as CloseIcon } from 'lucide-react'; // Para ícones do botão

function App() {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<Event | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Impedir que o mini-infobar do Chrome (ou outros prompts padrão) apareça
      event.preventDefault();
      // Guardar o evento para que possa ser acionado mais tarde.
      setDeferredInstallPrompt(event);
      // Mostrar seu banner/botão de instalação customizado
      setShowInstallBanner(true);
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
      setShowInstallBanner(false); // Esconder o banner após a instalação
      setDeferredInstallPrompt(null); // Limpar o prompt
    };
    window.addEventListener('appinstalled', handleAppInstalled);


    // Limpar os listeners quando o componente desmontar
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredInstallPrompt) {
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
    // Esconder o banner de instalação customizado
    setShowInstallBanner(false);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    // Você pode guardar no localStorage que o usuário dispensou para não mostrar por um tempo
    // localStorage.setItem('pwaInstallDismissed', 'true');
    // localStorage.setItem('pwaInstallDismissedTimestamp', Date.now().toString());
    console.log('PWA: Banner de instalação dispensado pelo usuário.');
  }

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
      {showInstallBanner && deferredInstallPrompt && (
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 md:p-4 bg-gray-800 text-white rounded-lg shadow-xl w-[90%] max-w-md sm:max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
          role="dialog"
          aria-labelledby="pwa-install-banner-title"
          aria-describedby="pwa-install-banner-description"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src="/lovable.png" alt="JusGestão Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-md flex-shrink-0" />
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
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;