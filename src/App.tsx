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
import PWAInstallToast from '@/components/pwa/PWAInstallToast'; // Assuming this is the correct path

// Import de páginas
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import EquipePage from '@/pages/EquipePage'; // Assuming you have this page
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null); // Store the install prompt event
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState(false);

  const isIOS = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad on iOS 13+
    );
  }, []);

  const isStandalone = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true // iOS Safari
    );
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e); // Stash the event so it can be triggered later.
      // Show a custom install banner/toast if not already installed and not on iOS
      if (!isStandalone && !isIOS) {
         // Check if banner was dismissed before
        const bannerDismissed = localStorage.getItem('pwaInstallBannerDismissed');
        if (!bannerDismissed) {
          setShowPWAInstallBanner(true);
        }
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null); // Clear the deferred prompt
      setShowPWAInstallBanner(false); // Hide banner after installation
      localStorage.removeItem('pwaInstallBannerDismissed'); // Clear dismissal state
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
      deferredPrompt.prompt(); // Show the install prompt
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou o prompt de instalação do PWA');
        } else {
          console.log('Usuário recusou o prompt de instalação do PWA');
        }
        setDeferredPrompt(null); // Clear the deferred prompt
        setShowPWAInstallBanner(false); // Hide banner after interaction
      });
    } else if (isIOS && !isStandalone) {
      // For iOS, we can't trigger programmatically.
      // This function could, for example, show a modal with instructions.
      // The InstalarAppTab.tsx will handle showing instructions directly.
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

// Hook para usar o contexto de instalação do PWA
export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  // Não lançar erro permite que o InstalarAppTab forneça valores padrão se o contexto não for encontrado
  // (embora com o Provider no App.tsx, ele sempre deve ser encontrado)
  return context; 
};
// --- Fim da Lógica de Instalação PWA ---

function App() {
  return (
    <div className="w-full">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <PWAProvider> {/* Para o toast de atualização do Service Worker */}
            <PWAInstallProvider> {/* <<< Provider para a lógica de instalação do PWA */}
              <SidebarProvider> {/* Provider para o estado da Sidebar */}
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
                        <Route path="/pagamento" element={<ProtectedRoute><PagamentoPage /></ProtectedRoute>} /> {/* Pagamento também protegido */}
                        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} /> {/* Sucesso do pagamento protegido */}
                        
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
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} /> {/* Exemplo de rota de admin */}
                        <Route path="/perfil" element={<ProtectedRoute><PerfilUsuarioPage /></ProtectedRoute>} />
                        <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
                        <Route path="/emails" element={<ProtectedRoute requireAdmin><EmailsTransacionaisPage /></ProtectedRoute>} /> {/* Exemplo de rota de admin */}
                        
                        {/* Rota 404 */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <ShadcnToaster /> {/* Renomeado para evitar conflito com o hook useToast */}
                    <PWAInstallToast /> {/* Toast para o banner de instalação do PWA */}
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

export default App;