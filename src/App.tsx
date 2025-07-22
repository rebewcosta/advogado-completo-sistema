
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import ConfirmacaoEmailPage from './pages/ConfirmacaoEmailPage';
import DashboardPage from './pages/DashboardPage';
import MeusProcessosPage from './pages/MeusProcessosPage';
import ClientesPage from './pages/ClientesPage';
import AgendaPage from './pages/AgendaPage';
import PrazosPage from './pages/PrazosPage';
import TarefasPage from './pages/TarefasPage';
import FinanceiroPage from './pages/FinanceiroPage';
import DocumentosPage from './pages/DocumentosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import PerfilUsuarioPage from './pages/PerfilUsuarioPage';
import EquipePage from './pages/EquipePage';
import SuportePage from './pages/SuportePage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';
import RecuperarSenhaPage from './pages/RecuperarSenhaPage';
import AtualizarSenhaPage from './pages/AtualizarSenhaPage';
import TermosPrivacidadePage from './pages/TermosPrivacidadePage';
import PagamentoPage from './pages/PagamentoPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import RedefinirPinFinanceiroPage from './pages/RedefinirPinFinanceiroPage';
import EmailsTransacionaisPage from './pages/EmailsTransacionaisPage';
import PublicacoesPage from './pages/PublicacoesPage';
import DataJudPage from './pages/DataJudPage';
import FerramentasPage from './pages/FerramentasPage';
import ContaCanceladaPage from './pages/ContaCanceladaPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import VerificarAssinatura from './components/VerificarAssinatura';
import PWAUpdateToast from './components/pwa/PWAUpdateToast';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

// Contexts
import { PWAProvider } from './contexts/PWAContext';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

const queryClient = new QueryClient();

// Layout para páginas públicas (sem navbar, pois ela já está no Index)
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Layout para páginas protegidas (apenas sidebar)
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  // Hook para rastrear atividade do usuário e atualizar presença
  useActivityTracker();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

function App() {
  // Aplicar otimizações para mobile globalmente
  useMobileOptimization();
  
  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <div className="App min-h-screen">
                <Toaster />
                <PWAUpdateToast />
                
                <Routes>
                  {/* Rotas públicas (Index já tem navbar integrada) */}
                  <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
                  <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                  <Route path="/cadastro" element={<PublicLayout><CadastroPage /></PublicLayout>} />
                  <Route path="/confirmacao-email" element={<PublicLayout><ConfirmacaoEmailPage /></PublicLayout>} />
                  <Route path="/recuperar-senha" element={<PublicLayout><RecuperarSenhaPage /></PublicLayout>} />
                  <Route path="/atualizar-senha" element={<PublicLayout><AtualizarSenhaPage /></PublicLayout>} />
                  <Route path="/termos-privacidade" element={<PublicLayout><TermosPrivacidadePage /></PublicLayout>} />
                  <Route path="/pagamento" element={<PublicLayout><PagamentoPage /></PublicLayout>} />
                  <Route path="/payment-success" element={<PublicLayout><PaymentSuccessPage /></PublicLayout>} />
                  <Route path="/conta-cancelada" element={<PublicLayout><ContaCanceladaPage /></PublicLayout>} />

                  {/* Rotas protegidas com verificação de assinatura */}
                  <Route path="/dashboard" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><DashboardPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/meus-processos" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><MeusProcessosPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><ClientesPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/equipe" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><EquipePage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><AgendaPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/prazos" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><PrazosPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/tarefas" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><TarefasPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/ferramentas" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><FerramentasPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/publicacoes" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><PublicacoesPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/datajud" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><DataJudPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/financeiro" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><FinanceiroPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/documentos" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><DocumentosPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  <Route path="/relatorios" element={<ProtectedRoute><VerificarAssinatura><ProtectedLayout><RelatoriosPage /></ProtectedLayout></VerificarAssinatura></ProtectedRoute>} />
                  
                  {/* Rotas que sempre têm acesso (perfil, configurações, admin, pagamento) */}
                  <Route path="/configuracoes" element={<ProtectedRoute><ProtectedLayout><ConfiguracoesPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/perfil" element={<ProtectedRoute><ProtectedLayout><PerfilUsuarioPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/perfil-usuario" element={<ProtectedRoute><ProtectedLayout><PerfilUsuarioPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><ProtectedLayout><AdminPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/suporte" element={<ProtectedRoute><ProtectedLayout><SuportePage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/redefinir-pin-financeiro" element={<ProtectedRoute><ProtectedLayout><RedefinirPinFinanceiroPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/emails-transacionais" element={<ProtectedRoute><ProtectedLayout><EmailsTransacionaisPage /></ProtectedLayout></ProtectedRoute>} />

                  {/* Rota 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </PWAProvider>
    </QueryClientProvider>
  );
}

export default App;
