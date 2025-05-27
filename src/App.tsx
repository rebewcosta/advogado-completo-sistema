// src/App.tsx
import { Navigate, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import MeusProcessosPage from './pages/MeusProcessosPage';
import AgendaPage from './pages/AgendaPage';
import TarefasPage from './pages/TarefasPage'; // <<< DESCOMENTE ESTA LINHA
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
import PerfilUsuarioPage from './pages/PerfilUsuarioPage';
import RedefinirPinFinanceiroPage from './pages/RedefinirPinFinanceiroPage';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import VerificarAssinatura from './components/VerificarAssinatura';

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/termos-privacidade" element={<TermosPrivacidadePage />} />
      <Route path="/suporte" element={<SuportePage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
      <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />


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
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        <Route path="/perfil" element={<PerfilUsuarioPage />} />

        {/* Rotas que requerem autenticação E verificação de assinatura/acesso especial */}
        <Route element={<VerificarAssinatura />}>
          <Route path="/meus-processos" element={<MeusProcessosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/tarefas" element={<TarefasPage />} /> 
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;