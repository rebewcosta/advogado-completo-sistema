
// src/App.tsx
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
import SuportePage from './pages/SuportePage';
import EmailsTransacionaisPage from './pages/EmailsTransacionaisPage';
import AdminPage from './pages/AdminPage';
import RecuperarSenhaPage from './pages/RecuperarSenhaPage';
import AtualizarSenhaPage from './pages/AtualizarSenhaPage';
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
          <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
          <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />

          {/* Rotas de autenticação - acessíveis apenas quando não logado */}
          <Route element={<ProtectedRoute requireAuth={false} redirectPath="/dashboard" />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
          </Route>

          {/* Rotas de pagamento (podem precisar ser acessadas por usuários logados mas sem assinatura) */}
          <Route path="/pagamento" element={<PagamentoPage />} />
          <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />

          {/* Rotas protegidas - requerem autenticação */}
          <Route element={<ProtectedRoute requireAuth={true} redirectPath="/login"/>}>
            {/* Rotas que SÃO protegidas por autenticação mas NÃO necessariamente por assinatura paga */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* A página de perfil/configurações geralmente é acessível por todos os usuários logados */}
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />

            {/* Rotas que requerem autenticação E verificação de assinatura/acesso especial */}
            <Route element={<VerificarAssinatura />}>
              <Route path="/meus-processos" element={<MeusProcessosPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/agenda" element={<AgendaPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
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
