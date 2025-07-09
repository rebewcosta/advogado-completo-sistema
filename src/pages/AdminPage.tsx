import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AdminPanelComplete from '@/components/admin/AdminPanelComplete';
import MonitoramentoPagamentos from '@/components/admin/MonitoramentoPagamentos';

const AdminPage = () => {
  const { user } = useAuth();

  // Verificar se é o admin master
  if (!user || user.email !== 'webercostag@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Controle total do sistema JusGestão</p>
      </div>

      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="criar-conta">Criar Conta</TabsTrigger>
          <TabsTrigger value="validacao">Validação</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <MonitoramentoPagamentos />
        </TabsContent>

        {/* ... keep existing code (other TabsContent) the same ... */}
      </Tabs>
    </div>
  );
};

export default AdminPage;
