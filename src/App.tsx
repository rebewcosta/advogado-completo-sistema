import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { useGlobalErrorHandler } from "@/hooks/useErrorReporting";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PasswordReset from "./pages/PasswordReset";
import AdminPanelComplete from "./components/admin/AdminPanelComplete";
import Configuracoes from "./pages/Configuracoes";
import Clientes from "./pages/Clientes";
import NovoCliente from "./pages/NovoCliente";
import EditarCliente from "./pages/EditarCliente";
import Processos from "./pages/Processos";
import NovoProcesso from "./pages/NovoProcesso";
import EditarProcesso from "./pages/EditarProcesso";
import Tarefas from "./pages/Tarefas";
import NovaTarefa from "./pages/NovaTarefa";
import EditarTarefa from "./pages/EditarTarefa";
import Financeiro from "./pages/Financeiro";
import NovaTransacao from "./pages/NovaTransacao";
import EditarTransacao from "./pages/EditarTransacao";
import Agenda from "./pages/Agenda";
import NovoEvento from "./pages/NovoEvento";
import EditarEvento from "./pages/EditarEvento";
import Equipe from "./pages/Equipe";
import NovoMembro from "./pages/NovoMembro";
import EditarMembro from "./pages/EditarMembro";
import Fontes from "./pages/Fontes";
import NovoFonte from "./pages/NovoFonte";
import EditarFonte from "./pages/EditarFonte";
import Documentos from "./pages/Documentos";
import NovoDocumento from "./pages/NovoDocumento";
import Prazos from "./pages/Prazos";
import NovoPrazo from "./pages/NovoPrazo";
import EditarPrazo from "./pages/EditarPrazo";
import Favoritos from "./pages/Favoritos";
import Publicacoes from "./pages/Publicacoes";
import Consultas from "./pages/Consultas";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
