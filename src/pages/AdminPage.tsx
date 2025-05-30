
// src/pages/AdminPage.tsx
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, UserCog } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  const isAdminUser = user?.email === 'webercostag@gmail.com' || user?.user_metadata?.isAdmin === true;

  if (!isAdminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Painel Administrativo"
          description="Gerenciamento de configurações e funcionalidades especiais do sistema."
          pageIcon={<UserCog />}
          showActionButton={false}
        />
        
        <div className="mt-6 md:mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-green-600" />
                Criar Conta Especial (Acesso sem Pagamento)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CriarContaEspecial />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
