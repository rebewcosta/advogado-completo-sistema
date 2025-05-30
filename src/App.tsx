import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { Toaster as SonnerToaster } from '@/components/ui/sonner' // Shadcn Sonner
import { Toaster as ShadcnToaster } from '@/components/ui/toaster' // Shadcn Toaster (se usado)

// Importações de componentes UI
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress" // Exemplo de componente de progresso

// Layouts
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute' // Rota protegida
import VerificarAssinatura from './components/VerificarAssinatura' // Componente de verificação de assinatura

// Páginas principais
const Index = lazy(() => import('./pages/Index'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CadastroPage = lazy(() => import('./pages/CadastroPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ClientesPage = lazy(() => import('./pages/ClientesPage'))
const MeusProcessosPage = lazy(() => import('./pages/MeusProcessosPage'))
const AgendaPage = lazy(() => import('./pages/AgendaPage'))
const TarefasPage = lazy(() => import('./pages/TarefasPage'))
const FinanceiroPage = lazy(() => import('./pages/FinanceiroPage'))
const DocumentosPage = lazy(() => import('./pages/DocumentosPage'))
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'))
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PagamentoPage = lazy(() => import('./pages/PagamentoPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const RecuperarSenhaPage = lazy(() => import('./pages/RecuperarSenhaPage'))
const AtualizarSenhaPage = lazy(() => import('./pages/AtualizarSenhaPage'))
const PerfilUsuarioPage = lazy(() => import('./pages/PerfilUsuarioPage'))
const SuportePage = lazy(() => import('./pages/SuportePage'))
const TermosPrivacidadePage = lazy(() => import('./pages/TermosPrivacidadePage'))
const RedefinirPinFinanceiroPage = lazy(() => import('./pages/RedefinirPinFinanceiroPage'))
const EmailsTransacionaisPage = lazy(() => import('./pages/EmailsTransacionaisPage'))


// Componente de Loading
const LoadingFallback = () => {
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 200)
    const timer2 = setTimeout(() => setProgress(100), 500)
    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <img src="/logo-jusgestao-horizontal.png" alt="JusGestão Logo" className="mb-4 h-16" />
      <Progress value={progress} className="w-1/3" />
      <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
    </div>
  )
}

// Componente GlobalStyle para aplicar estilos do tema
const GlobalStyle = () => {
  const { theme, fontSize, compactMode } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Aplicar tamanho da fonte
    const baseFontSize = 16; // Tamanho base em pixels
    if (fontSize === 'small') {
      root.style.fontSize = `${baseFontSize * 0.875}px`; // 14px
    } else if (fontSize === 'large') {
      root.style.fontSize = `${baseFontSize * 1.125}px`; // 18px
    } else {
      root.style.fontSize = `${baseFontSize}px`; // 16px (normal)
    }

    // Aplicar modo compacto
    if (compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }

  }, [theme, fontSize, compactMode]);

  return null;
};

// Configuração do Service Worker para PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const queryClient = new QueryClient()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Verifica se o prompt já foi exibido ou se o app já está instalado
      const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
      const hasPromptBeenShown = localStorage.getItem('installPromptShown');

      if (!isAppInstalled && !hasPromptBeenShown) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Evento para quando o app é instalado
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('installPromptShown', 'true'); // Marca que o prompt foi aceito/app instalado
      // Aqui você pode adicionar lógica para agradecer o usuário ou dar boas-vindas
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      });
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // Opcional: lógica após a aceitação da instalação
      localStorage.setItem('installPromptShown', 'true');
    } else {
      // Opcional: lógica após a recusa da instalação
      localStorage.setItem('installPromptShown', 'true'); // Marca como mostrado mesmo se recusado para não mostrar novamente.
                                                         // Ou defina uma lógica para mostrar novamente depois de um tempo.
    }
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem('installPromptShown', 'true'); // Marca que o prompt foi dispensado
  };


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GlobalStyle /> {/* Aplica estilos globais do tema */}
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
              <Route path="/suporte" element={<SuportePage />} />
              <Route path="/termos-e-privacidade" element={<TermosPrivacidadePage />} />
              <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />

              {/* Rota de Pagamento e Sucesso */}
              <Route path="/pagamento" element={
                <ProtectedRoute>
                  <PagamentoPage />
                </ProtectedRoute>
              } />
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } />

              {/* Rotas Protegidas com AdminLayout e Verificação de Assinatura */}
              <Route
                element={
                  <ProtectedRoute>
                    <VerificarAssinatura>
                      <AdminLayout />
                    </VerificarAssinatura>
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/processos" element={<MeusProcessosPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/tarefas" element={<TarefasPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/documentos" element={<DocumentosPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/perfil" element={<PerfilUsuarioPage />} /> {/* Se for uma página separada */}
                <Route path="/admin" element={<AdminPage />} /> {/* Rota de Admin */}
                <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
              </Route>

              {/* Rota para página não encontrada */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <SonnerToaster richColors position="top-right" />
        <ShadcnToaster /> {/* Para o Shadcn useToast hook */}

        {/* Alerta para instalar PWA */}
        {showInstallPrompt && deferredPrompt && (
          <AlertDialog open onOpenChange={handleDismissInstall}>
            <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-left">
                  Instale o App JusGestão
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-left">
                  Tenha na sua tela inicial para acesso rápido e fácil!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <Button variant="outline" onClick={handleDismissInstall} className="mr-2">
                  Agora não
                </Button>
                <Button onClick={handleInstallClick}>
                  Instalar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App