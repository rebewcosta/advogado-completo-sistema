// src/pages/AdminPage.tsx
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, UserCog } from 'lucide-react'; // UserCog para o header
import SharedPageHeader from '@/components/shared/SharedPageHeader'; // <<< IMPORTAR
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">Carregando...</div>
      </AdminLayout>
    );
  }

  // ATENÇÃO: A lógica original permitia acesso se o email fosse webercostag@gmail.com OU se isAdmin fosse true.
  // Verifique se a propriedade isAdmin está sendo corretamente populada no seu objeto user.
  // Se user.user_metadata.isAdmin não existir ou não for confiável, mantenha apenas a verificação de email.
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
          pageIcon={<UserCog />} // Usando UserCog como ícone
          showActionButton={false} // Sem botão de ação principal aqui
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

          {/* Adicione outros cards ou seções de administração aqui, se necessário */}
          {/* Exemplo:
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciar Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade de gerenciamento de usuários (em desenvolvimento).</p>
            </CardContent>
          </Card>
          */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;