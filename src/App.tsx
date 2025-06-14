
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';
import MeusProcessosPage from './pages/MeusProcessosPage';
import ClientesPage from './pages/ClientesPage';
import AgendaPage from './pages/AgendaPage';
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

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

// Contexts
import { PWAProvider } from './contexts/PWAContext';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/hooks/useAuth';

const queryClient = new QueryClient();

// Layout para páginas públicas (sem navbar, pois ela já está no Index)
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Layout para páginas protegidas (apenas sidebar)
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
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
  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <div className="App min-h-screen">
                <Toaster />
                
                <Routes>
                  {/* Rotas públicas (Index já tem navbar integrada) */}
                  <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
                  <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                  <Route path="/cadastro" element={<PublicLayout><CadastroPage /></PublicLayout>} />
                  <Route path="/recuperar-senha" element={<PublicLayout><RecuperarSenhaPage /></PublicLayout>} />
                  <Route path="/atualizar-senha" element={<PublicLayout><AtualizarSenhaPage /></PublicLayout>} />
                  <Route path="/termos-privacidade" element={<PublicLayout><TermosPrivacidadePage /></PublicLayout>} />
                  <Route path="/pagamento" element={<PublicLayout><PagamentoPage /></PublicLayout>} />
                  <Route path="/payment-success" element={<PublicLayout><PaymentSuccessPage /></PublicLayout>} />

                  {/* Rotas protegidas com sidebar */}
                  <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><DashboardPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/meus-processos" element={<ProtectedRoute><MeusProcessosPage /></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
                  <Route path="/equipe" element={<ProtectedRoute><EquipePage /></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                  <Route path="/tarefas" element={<ProtectedRoute><TarefasPage /></ProtectedRoute>} />
                  <Route path="/publicacoes" element={<ProtectedRoute><PublicacoesPage /></ProtectedRoute>} />
                  <Route path="/financeiro" element={<ProtectedRoute><FinanceiroPage /></ProtectedRoute>} />
                  <Route path="/documentos" element={<ProtectedRoute><DocumentosPage /></ProtectedRoute>} />
                  <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
                  <Route path="/perfil-usuario" element={<ProtectedRoute><PerfilUsuarioPage /></ProtectedRoute>} />
                  <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                  <Route path="/redefinir-pin-financeiro" element={<ProtectedRoute><RedefinirPinFinanceiroPage /></ProtectedRoute>} />
                  <Route path="/emails-transacionais" element={<ProtectedRoute><EmailsTransacionaisPage /></ProtectedRoute>} />

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
