
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
                  <Route path="/conta-cancelada" element={<PublicLayout><ContaCanceladaPage /></PublicLayout>} />

                  {/* Rotas protegidas apenas com sidebar */}
                  <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><DashboardPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/meus-processos" element={<ProtectedRoute><ProtectedLayout><MeusProcessosPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute><ProtectedLayout><ClientesPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/equipe" element={<ProtectedRoute><ProtectedLayout><EquipePage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><ProtectedLayout><AgendaPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/prazos" element={<ProtectedRoute><ProtectedLayout><PrazosPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/tarefas" element={<ProtectedRoute><ProtectedLayout><TarefasPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/ferramentas" element={<ProtectedRoute><ProtectedLayout><FerramentasPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/publicacoes" element={<ProtectedRoute><ProtectedLayout><PublicacoesPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/datajud" element={<ProtectedRoute><ProtectedLayout><DataJudPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/financeiro" element={<ProtectedRoute><ProtectedLayout><FinanceiroPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/documentos" element={<ProtectedRoute><ProtectedLayout><DocumentosPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/relatorios" element={<ProtectedRoute><ProtectedLayout><RelatoriosPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><ProtectedLayout><ConfiguracoesPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/perfil-usuario" element={<ProtectedRoute><ProtectedLayout><PerfilUsuarioPage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/suporte" element={<ProtectedRoute><ProtectedLayout><SuportePage /></ProtectedLayout></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><ProtectedLayout><AdminPage /></ProtectedLayout></ProtectedRoute>} />
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
