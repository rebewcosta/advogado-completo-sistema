
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { useGlobalErrorHandler } from "@/hooks/useErrorReporting";
import Index from "./pages/Index";
import Login from "./pages/LoginPage";
import Register from "./pages/CadastroPage";
import Dashboard from "./pages/DashboardPage";
import PasswordReset from "./pages/RecuperarSenhaPage";
import AdminPanelComplete from "./components/admin/AdminPanelComplete";
import Configuracoes from "./pages/ConfiguracoesPage";
import Clientes from "./pages/ClientesPage";
import NovoCliente from "./pages/ClientesPage";
import EditarCliente from "./pages/ClientesPage";
import Processos from "./pages/MeusProcessosPage";
import NovoProcesso from "./pages/MeusProcessosPage";
import EditarProcesso from "./pages/MeusProcessosPage";
import Tarefas from "./pages/TarefasPage";
import NovaTarefa from "./pages/TarefasPage";
import EditarTarefa from "./pages/TarefasPage";
import Financeiro from "./pages/FinanceiroPage";
import NovaTransacao from "./pages/FinanceiroPage";
import EditarTransacao from "./pages/FinanceiroPage";
import Agenda from "./pages/AgendaPage";
import NovoEvento from "./pages/AgendaPage";
import EditarEvento from "./pages/AgendaPage";
import Equipe from "./pages/EquipePage";
import NovoMembro from "./pages/EquipePage";
import EditarMembro from "./pages/EquipePage";
import Fontes from "./pages/PublicacoesPage";
import NovoFonte from "./pages/PublicacoesPage";
import EditarFonte from "./pages/PublicacoesPage";
import Documentos from "./pages/DocumentosPage";
import NovoDocumento from "./pages/DocumentosPage";
import Prazos from "./pages/PrazosPage";
import NovoPrazo from "./pages/PrazosPage";
import EditarPrazo from "./pages/PrazosPage";
import Favoritos from "./pages/DataJudPage";
import Publicacoes from "./pages/PublicacoesPage";
import Consultas from "./pages/DataJudPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

// Componente para inicializar hooks globais
const GlobalHooks = () => {
  useUserTracking();
  useGlobalErrorHandler();
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalHooks />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="*" element={<NotFound />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Clientes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes/novo"
                element={
                  <ProtectedRoute>
                    <NovoCliente />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarCliente />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/processos"
                element={
                  <ProtectedRoute>
                    <Processos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processos/novo"
                element={
                  <ProtectedRoute>
                    <NovoProcesso />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/processos/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarProcesso />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tarefas"
                element={
                  <ProtectedRoute>
                    <Tarefas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tarefas/nova"
                element={
                  <ProtectedRoute>
                    <NovaTarefa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tarefas/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarTarefa />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/financeiro"
                element={
                  <ProtectedRoute>
                    <Financeiro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/novo"
                element={
                  <ProtectedRoute>
                    <NovaTransacao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarTransacao />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/agenda"
                element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agenda/novo"
                element={
                  <ProtectedRoute>
                    <NovoEvento />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agenda/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarEvento />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/equipe"
                element={
                  <ProtectedRoute>
                    <Equipe />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipe/novo"
                element={
                  <ProtectedRoute>
                    <NovoMembro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipe/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarMembro />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/fontes"
                element={
                  <ProtectedRoute>
                    <Fontes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fontes/novo"
                element={
                  <ProtectedRoute>
                    <NovoFonte />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fontes/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarFonte />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/documentos"
                element={
                  <ProtectedRoute>
                    <Documentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentos/novo"
                element={
                  <ProtectedRoute>
                    <NovoDocumento />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/prazos"
                element={
                  <ProtectedRoute>
                    <Prazos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prazos/novo"
                element={
                  <ProtectedRoute>
                    <NovoPrazo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prazos/editar/:id"
                element={
                  <ProtectedRoute>
                    <EditarPrazo />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favoritos"
                element={
                  <ProtectedRoute>
                    <Favoritos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/publicacoes"
                element={
                  <ProtectedRoute>
                    <Publicacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultas"
                element={
                  <ProtectedRoute>
                    <Consultas />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanelComplete />
                  </AdminRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
