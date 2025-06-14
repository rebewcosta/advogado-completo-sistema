
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
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
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Contexts
import { PWAProvider } from './contexts/PWAContext';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/hooks/useAuth';

const queryClient = new QueryClient();

function App() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
    (navigator as any).standalone || 
    document.referrer.includes('android-app://');
  
  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <ThemeProvider>
          <Router>
            <AuthProvider>
              <div className="App min-h-screen bg-gray-50">
                <Toaster />
                
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<CadastroPage />} />
                  <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
                  <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
                  <Route path="/termos-privacidade" element={<TermosPrivacidadePage />} />
                  <Route path="/pagamento" element={<PagamentoPage />} />
                  <Route path="/payment-success" element={<PaymentSuccessPage />} />

                  {/* Rotas protegidas */}
                  <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route element={<Navbar />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/meus-processos" element={<MeusProcessosPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      <Route path="/agenda" element={<AgendaPage />} />
                      <Route path="/tarefas" element={<TarefasPage />} />
                      <Route path="/publicacoes" element={<PublicacoesPage />} />
                      <Route path="/financeiro" element={<FinanceiroPage />} />
                      <Route path="/documentos" element={<DocumentosPage />} />
                      <Route path="/relatorios" element={<RelatoriosPage />} />
                      <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                      <Route path="/perfil-usuario" element={<PerfilUsuarioPage />} />
                      <Route path="/equipe" element={<EquipePage />} />
                      <Route path="/suporte" element={<SuportePage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />
                      <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
                    </Route>
                  </Route>

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
