
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import GlobalHooksProvider from "@/components/GlobalHooksProvider";
import PublicRoutes from "@/components/routes/PublicRoutes";
import ProtectedRoutes from "@/components/routes/ProtectedRoutes";
import ClientesRoutes from "@/components/routes/ClientesRoutes";
import ProcessosRoutes from "@/components/routes/ProcessosRoutes";
import TarefasRoutes from "@/components/routes/TarefasRoutes";
import FinanceiroRoutes from "@/components/routes/FinanceiroRoutes";
import AgendaRoutes from "@/components/routes/AgendaRoutes";
import EquipeRoutes from "@/components/routes/EquipeRoutes";
import OtherRoutes from "@/components/routes/OtherRoutes";  
import AdminRoutes from "@/components/routes/AdminRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalHooksProvider />
            <Routes>
              <PublicRoutes />
              <ProtectedRoutes />
              <ClientesRoutes />
              <ProcessosRoutes />
              <TarefasRoutes />
              <FinanceiroRoutes />
              <AgendaRoutes />
              <EquipeRoutes />
              <OtherRoutes />
              <AdminRoutes />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
