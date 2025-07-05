
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAProvider } from "@/contexts/PWAContext";
import Index from "@/pages/Index";
import Login from "@/pages/LoginPage";
import Register from "@/pages/CadastroPage";
import PasswordReset from "@/pages/RecuperarSenhaPage";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/DashboardPage";
import Configuracoes from "@/pages/ConfiguracoesPage";
import Clientes from "@/pages/ClientesPage";
import Processos from "@/pages/MeusProcessosPage";
import Tarefas from "@/pages/TarefasPage";
import Agenda from "@/pages/AgendaPage";
import Equipe from "@/pages/EquipePage";
import Financeiro from "@/pages/FinanceiroPage";
import Documentos from "@/pages/DocumentosPage";
import Prazos from "@/pages/PrazosPage";
import Publicacoes from "@/pages/PublicacoesPage";
import DataJud from "@/pages/DataJudPage";
import Ferramentas from "@/pages/FerramentasPage";
import Relatorios from "@/pages/RelatoriosPage";
import AdminPage from "@/pages/AdminPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <PWAProvider>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                
                {/* Protected Routes */}
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
                      <Clientes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clientes/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Clientes />
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
                      <Processos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/processos/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Processos />
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
                      <Tarefas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tarefas/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Tarefas />
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
                      <Agenda />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agenda/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Agenda />
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
                      <Equipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/equipe/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Equipe />
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
                      <Financeiro />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/financeiro/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Financeiro />
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
                      <Documentos />
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
                      <Prazos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prazos/editar/:id"
                  element={
                    <ProtectedRoute>
                      <Prazos />
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
                      <DataJud />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favoritos"
                  element={
                    <ProtectedRoute>
                      <DataJud />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ferramentas"
                  element={
                    <ProtectedRoute>
                      <Ferramentas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute>
                      <Relatorios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </PWAProvider>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
