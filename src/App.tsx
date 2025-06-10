import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import PagamentoPage from '@/pages/PagamentoPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import DashboardPage from '@/pages/DashboardPage';
import RecoverPasswordPage from '@/pages/RecoverPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import { SiteLayout } from '@/components/SiteLayout';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

const App = () => {
  // You can add any global state or context here if needed

  return (
    <AuthProvider>
      <Router>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/pagamento" element={<PagamentoPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Protected routes inside DashboardLayout */}
            <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
             <Route path="/admin" element={<DashboardLayout><AdminPage /></DashboardLayout>} />
          </Routes>
        </SiteLayout>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
