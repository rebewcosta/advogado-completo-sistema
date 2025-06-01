
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { PWAProvider } from '@/contexts/PWAContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <PWAProvider>
          <AuthProvider>
            <SidebarProvider>
              <Router>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/cadastro" element={<CadastroPage />} />
                    <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
                    <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
                    <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />
                    <Route path="/termos-e-privacidade" element={<TermosPrivacidadePage />} />
                    <Route path="/pagamento" element={<PagamentoPage />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    
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
                    <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    <Route path="/perfil" element={<ProtectedRoute><PerfilUsuarioPage /></ProtectedRoute>} />
                    <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
                    <Route path="/emails" element={<ProtectedRoute><EmailsTransacionaisPage /></ProtectedRoute>} />
                    
                    {/* Rota 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
              </Router>
            </SidebarProvider>
          </AuthProvider>
        </PWAProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
