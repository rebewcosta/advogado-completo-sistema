


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { PWAProvider } from '@/contexts/PWAContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import PagamentoPage from '@/pages/PagamentoPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import DashboardPage from '@/pages/DashboardPage';
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/pagamento" element={<PagamentoPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
          <Toaster />
        </AuthProvider>
      </PWAProvider>
    </Router>
  );
};

export default App;


