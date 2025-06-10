
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PWAProvider } from '@/contexts/PWAContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import VerificarAssinatura from '@/components/VerificarAssinatura';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import PagamentoPage from '@/pages/PagamentoPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import DashboardPage from '@/pages/DashboardPage';
import MeusProcessosPage from '@/pages/MeusProcessosPage';
import ClientesPage from '@/pages/ClientesPage';
import PerfilUsuarioPage from '@/pages/PerfilUsuarioPage';
import RecuperarSenhaPage from '@/pages/RecuperarSenhaPage';
import AdminPage from '@/pages/AdminPage';

const App = () => {
  return (
    <Router>
      <PWAProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cadastro" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <CadastroPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pagamento" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <PagamentoPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route 
                path="/recuperar-senha" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RecuperarSenhaPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <PerfilUsuarioPage />
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
              {/* Routes that require subscription verification */}
              <Route element={<ProtectedRoute><VerificarAssinatura /></ProtectedRoute>}>
                <Route path="/meus-processos" element={<MeusProcessosPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
              </Route>
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </PWAProvider>
    </Router>
  );
};

export default App;
