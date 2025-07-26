import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { PWAProvider } from "@/contexts/PWAContext";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import CadastroPage from "@/pages/CadastroPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientesPage from "@/pages/ClientesPage";
import ClienteFormPage from "@/pages/ClienteFormPage";
import ProcessosPage from "@/pages/MeusProcessosPage";
import AgendaPage from "@/pages/AgendaPage";
import FinanceiroPage from "@/pages/FinanceiroPage";
import DocumentosPage from "@/pages/DocumentosPage";
import EquipePage from "@/pages/EquipePage";
import PublicacoesPage from "@/pages/PublicacoesPage";
import DataJudPage from "@/pages/DataJudPage";
import RelatoriosPage from "@/pages/RelatoriosPage";
import FerramentasPage from "@/pages/FerramentasPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import SuportePage from "@/pages/SuportePage";
import PerfilUsuarioPage from "@/pages/PerfilUsuarioPage";
import TermosPrivacidadePage from "@/pages/TermosPrivacidadePage";
import PagamentoPage from "@/pages/PagamentoPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import RecuperarSenhaPage from "@/pages/RecuperarSenhaPage";
import AtualizarSenhaPage from "@/pages/AtualizarSenhaPage";
import ConfirmacaoEmailPage from "@/pages/ConfirmacaoEmailPage";
import NotFound from "@/pages/NotFound";
import ContaCanceladaPage from "@/pages/ContaCanceladaPage";
import AdminPage from "@/pages/AdminPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import VerificarAssinatura from "@/components/VerificarAssinatura";
import RedefinirPinFinanceiroPage from "@/pages/RedefinirPinFinanceiroPage";
import PrazosPage from "@/pages/PrazosPage";

function App() {
  return (
    <AuthProvider>
      <PWAProvider>
        <Router>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
            <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
            <Route path="/confirmacao-email" element={<ConfirmacaoEmailPage />} />
            <Route path="/termos-e-privacidade" element={<TermosPrivacidadePage />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pagamento" element={<PagamentoPage />} />
              <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />
              <Route path="/conta-cancelada" element={<ContaCanceladaPage />} />
              
              <Route element={<VerificarAssinatura />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/clientes/novo" element={<ClienteFormPage />} />
                <Route path="/clientes/editar/:id" element={<ClienteFormPage />} />
                <Route path="/processos" element={<ProcessosPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/prazos" element={<PrazosPage />} />
                <Route path="/financeiro" element={<FinanceiroPage />} />
                <Route path="/documentos" element={<DocumentosPage />} />
                <Route path="/publicacoes" element={<PublicacoesPage />} />
                <Route path="/datajud" element={<DataJudPage />} />
                <Route path="/equipe" element={<EquipePage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/ferramentas" element={<FerramentasPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/suporte" element={<SuportePage />} />
                <Route path="/perfil" element={<PerfilUsuarioPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/redefinir-pin" element={<RedefinirPinFinanceiroPage />} />
              </Route>
            </Route>
            
            {/* Rota "Não Encontrado" */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </PWAProvider>
    </AuthProvider>
  );
}

export default App;