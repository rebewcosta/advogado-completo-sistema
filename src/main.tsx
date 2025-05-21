
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import CadastroPage from '@/pages/CadastroPage'
import NotFound from './pages/NotFound'
import AtualizarSenhaPage from './pages/AtualizarSenhaPage'
import RecuperarSenhaPage from './pages/RecuperarSenhaPage'
import PagamentoPage from './pages/PagamentoPage'
import TermosPrivacidadePage from './pages/TermosPrivacidadePage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MeusProcessosPage from './pages/MeusProcessosPage'
import DashboardPage from './pages/DashboardPage'
import PerfilUsuarioPage from './pages/PerfilUsuarioPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import AdminPage from './pages/AdminPage'
import DocumentosPage from './pages/DocumentosPage'
import VerificarAssinatura from '@/components/VerificarAssinatura'
import RedefinirPinFinanceiroPage from './pages/RedefinirPinFinanceiroPage'
import ClientesPage from './pages/ClientesPage'
import AgendaPage from './pages/AgendaPage'
import FinanceiroPage from './pages/FinanceiroPage'
import RelatoriosPage from './pages/RelatoriosPage'
import SuportePage from './pages/SuportePage'
import EmailsTransacionaisPage from './pages/EmailsTransacionaisPage'

// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Disable React 18 concurrent mode warning
// @ts-ignore - these methods are present but TypeScript doesn't recognize them
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Remove or disable css transitions while the page loads for a smoother first paint
document.getElementById('splash-spinner')?.remove();
document.getElementById('app-loader')?.remove();
document.getElementById('global-spinner')?.remove();
document.getElementById('root-spinner')?.remove();
document.getElementById('splash-screen')?.remove();
document.getElementById('loading-screen')?.remove();
document.getElementById('initial-loader')?.remove();

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } />
              <Route path="/cadastro" element={
                <ProtectedRoute requireAuth={false}>
                  <CadastroPage />
                </ProtectedRoute>
              } />
              <Route path="/pagamento" element={<PagamentoPage />} />
              <Route path="/pagamento-sucesso" element={<PaymentSuccessPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              <Route path="/atualizar-senha" element={<AtualizarSenhaPage />} />
              <Route path="/termos-e-privacidade" element={<TermosPrivacidadePage />} />
              <Route path="/redefinir-pin-financeiro" element={<RedefinirPinFinanceiroPage />} />

              {/* Protected routes that also require subscription verification */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route element={<VerificarAssinatura />}>
                  <Route path="/processos" element={<MeusProcessosPage />} />
                  <Route path="/documentos/*" element={<DocumentosPage />} />
                  <Route path="/agenda" element={<AgendaPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/financeiro" element={<FinanceiroPage />} />
                  <Route path="/relatorios" element={<RelatoriosPage />} />
                </Route>
              </Route>

              {/* Protected routes that don't require subscription verification */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/perfil" element={<PerfilUsuarioPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/suporte" element={<SuportePage />} />
                <Route path="/emails-transacionais" element={<EmailsTransacionaisPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
