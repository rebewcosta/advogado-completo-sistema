
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import MeusProcessosPage from './pages/MeusProcessosPage';
import AgendaPage from './pages/AgendaPage';
import FinanceiroPage from './pages/FinanceiroPage';
import DocumentosPage from './pages/DocumentosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import PagamentoPage from './pages/PagamentoPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import NotFound from './pages/NotFound';
import TermosPrivacidadePage from './pages/TermosPrivacidadePage';
import PerfilUsuarioPage from './pages/PerfilUsuarioPage';
import SuportePage from './pages/SuportePage';
import EmailsTransacionaisPage from './pages/EmailsTransacionaisPage';
import AdminPage from './pages/AdminPage';
import './App.css';

import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import VerificarAssinatura from './components/VerificarAssinatura';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Index />} />
          <Route path="/termos-privacidade" element={<TermosPrivacidadePage />} />
          <Route path="/suporte" element={<SuportePage />} />
          
          {/* Rotas de autenticação - acessíveis apenas quando não logado */}
          <Route element={<ProtectedRoute requireAuth={false} redirectPath="/dashboard" />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
          </Route>
          
          {/* Rotas de pagamento */}
          <Route path="/pagamento" element={<PagamentoPage />} />
          <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />
          
          {/* Rotas protegidas - requerem autenticação */}
          <Route element={<ProtectedRoute />}>
            {/* Rotas que não requerem verificação de assinatura */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/perfil" element={<PerfilUsuarioPage />} />
            <Route path="/admin" element={<AdminPage />} />
            
            {/* Rotas que requerem verificação de assinatura */}
            <Route element={<VerificarAssinatura>
              <Routes>
                <Route path="/meus-processos" element={<MeusProcessosPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/documentos" element={<DocumentosPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
              </Routes>
            </VerificarAssinatura>}>
              <Route path="/meus-processos" element={null} />
              <Route path="/clientes" element={null} />
              <Route path="/agenda" element={null} />
              <Route path="/financeiro" element={null} />
              <Route path="/documentos" element={null} />
              <Route path="/relatorios" element={null} />
              <Route path="/configuracoes" element={null} />
              <Route path="/emails-transacionais" element={null} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
