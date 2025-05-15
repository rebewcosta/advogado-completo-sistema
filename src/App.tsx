
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
