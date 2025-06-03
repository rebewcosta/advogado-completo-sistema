// src/App.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'; // Renamed to avoid conflict
import { PWAProvider } from '@/contexts/PWAContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

// Import PWA Install Toast
import PWAInstallToast from '@/components/pwa/PWAInstallToast';

// Import de páginas
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import EquipePage from '@/pages/EquipePage';
import AgendaPage from '@/pages/AgendaPage';
import TarefasPage from '@/pages/TarefasPage';
import MeusProcessosPage from '@/pages/MeusProcessosPage';
import FinanceiroPage from '@/pages/FinanceiroPage';
import DocumentosPage from '@/pages/DocumentosPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import AdminPage from '@/pages/AdminPage';
import PerfilUsuarioPage from '@/pages/PerfilUsuarioPage';
import RecuperarSenhaPage from '@/pages/RecuperarSenhaPage';
import AtualizarSenhaPage from '@/pages/AtualizarSenhaPage';
import PagamentoPage from '@/pages/PagamentoPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import TermosPrivacidadePage from '@/pages/TermosPrivacidadePage';
import SuportePage from '@/pages/SuportePage';
import EmailsTransacionaisPage from '@/pages/EmailsTransacionaisPage';
import RedefinirPinFinanceiroPage from '@/pages/RedefinirPinFinanceiroPage';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// --- PWA Installation Logic ---
interface PWAInstallState {
  canInstallPWA: boolean;
  triggerPWAInstall: () => void;
  isIOS: boolean;
  isStandalone: boolean;
  showPWAInstallBanner: boolean;
  dismissPWAInstallBanner: () => void;
}

const PWAInstallContext = createContext<PWAInstallState | null>(null);

interface PWAInstallProviderProps {
  children: React.ReactNode;
}

export const PWAInstallProvider: React.FC<PWAInstallProviderProps> = ({
  children,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState(false);

  const isIOS = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }, []);

  const isStandalone = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !isIOS) {
        const bannerDismissed = localStorage.getItem('pwaInstallBannerDismissed');
        if (!bannerDismissed) {
          setShowPWAInstallBanner(true);
        }
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPWAInstallBanner(false);
      localStorage.removeItem('pwaInstallBannerDismissed');
      console.log('JusGestão PWA foi instalado.');
    };

    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (!isStandalone) {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt
        );
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, isIOS]);

  const triggerPWAInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou o prompt de instalação do PWA');
        } else {
          console.log('Usuário recusou o prompt de instalação do PWA');
        }
        setDeferredPrompt(null);
        setShowPWAInstallBanner(false);
      });
    } else if (isIOS && !isStandalone) {
      alert(
        'Para instalar no iOS, abra no Safari, toque no ícone de Compartilhar e depois em "Adicionar à Tela de Início".'
      );
    } else {
      console.warn(
        'PWA não pode ser instalado: deferredPrompt não disponível ou já instalado/iOS sem ação de prompt.'
      );
    }
  }, [deferredPrompt, isIOS, isStandalone]);

  const dismissPWAInstallBanner = useCallback(() => {
    setShowPWAInstallBanner(false);
    localStorage.setItem('pwaInstallBannerDismissed', 'true');
  }, []);

  const canInstallPWA = !!deferredPrompt && !isStandalone;

  const value = {
    canInstallPWA,
    triggerPWAInstall,
    isIOS,
    isStandalone,
    showPWAInstallBanner,
    dismissPWAInstallBanner,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  return context; 
};

function App() {
  return (
    <div className="w-full">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <PWAProvider>
            <PWAInstallProvider>
              <SidebarProvider>
                <Router>
                  <AuthProvider>
                    <div className="min-h-screen bg-background font-sans antialiased w-full">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/cadastro" element={<CadastroPage />} />
                        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
                        <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
                        <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />
                        <Route path="/termos-e-privacidade" element={<TermosPrivacidadePage />} />
                        <Route path="/pagamento" element={<ProtectedRoute><PagamentoPage /></ProtectedRoute>} />
                        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                        
                        {/* Rotas protegidas */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
                        <Route path="/equipe" element={<ProtectedRoute><EquipePage /></ProtectedRoute>} />
                        <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                        <Route path="/tarefas" element={<ProtectedRoute><TarefasPage /></ProtectedRoute>} />
                        <Route path="/meus-processos" element={<ProtectedRoute><MeusProcessosPage /></ProtectedRoute>} />
                        <Route path="/financeiro" element={<ProtectedRoute><FinanceiroPage /></ProtectedRoute>} />
                        <Route path="/documentos" element={<ProtectedRoute><DocumentosPage /></ProtectedRoute>} />
                        <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
                        <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
                        <Route path="/perfil" element={<ProtectedRoute><PerfilUsuarioPage /></ProtectedRoute>} />
                        <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
                        <Route path="/emails" element={<ProtectedRoute requireAdmin><EmailsTransacionaisPage /></ProtectedRoute>} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <ShadcnToaster />
                    <PWAInstallToastComponent />
                  </AuthProvider>
                </Router>
              </SidebarProvider>
            </PWAInstallProvider>
          </PWAProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

const PWAInstallToastComponent = () => {
  const pwaInstall = usePWAInstall();
  
  if (!pwaInstall?.showPWAInstallBanner) {
    return null;
  }
  
  return <PWAInstallToast onClose={pwaInstall.dismissPWAInstallBanner} />;
};

export default App;
