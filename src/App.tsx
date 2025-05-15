
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientesPage from "./pages/ClientesPage";
import ProcessosPage from "./pages/ProcessosPage";
import AgendaPage from "./pages/AgendaPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import DocumentosPage from "./pages/DocumentosPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import DashboardPage from "./pages/DashboardPage";
import PagamentoPage from "./pages/PagamentoPage";

// Páginas simples para os links do rodapé
const SobrePage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-4">Sobre Nós</h1><p>Informações sobre a empresa JusGestão.</p></div>;
const PlanosPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-4">Planos e Preços</h1><p>Detalhes sobre os planos disponíveis.</p></div>;
const PrivacidadePage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1><p>Nossa política de privacidade.</p></div>;
const TermosPage = () => <div className="min-h-screen p-8"><h1 className="text-3xl font-bold mb-4">Termos de Uso</h1><p>Termos e condições de uso do sistema.</p></div>;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/processos" element={<ProcessosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pagamento" element={<PagamentoPage />} />
          
          {/* Novas rotas para os links do rodapé */}
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/planos" element={<PlanosPage />} />
          <Route path="/privacidade" element={<PrivacidadePage />} />
          <Route path="/termos" element={<TermosPage />} />
          
          {/* Redirecionamentos para garantir que as páginas estejam interligadas */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
