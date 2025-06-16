
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, BarChart, Megaphone } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import CreateUserAccount from '@/components/admin/CreateUserAccount';
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';
import SecurityMonitoring from '@/components/admin/SecurityMonitoring';
import AvisosTab from '@/components/configuracoes/AvisosTab';
import { useAuth } from '@/hooks/useAuth';

const AdminPage = () => {
  const { user } = useAuth();

  // VERIFICAÇÃO CRÍTICA: apenas webercostag@gmail.com tem acesso
  if (!user || user.email !== 'webercostag@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <SharedPageHeader
        title="Painel Administrativo"
        description="Gerenciamento avançado do sistema e usuários"
        pageIcon={<Shield />}
        showActionButton={false}
      />

      <Tabs defaultValue="security" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-200 p-1.5 rounded-lg mb-6 h-auto">
          <TabsTrigger
            value="security"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger
            value="special"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Settings className="h-4 w-4" /> Contas Especiais
          </TabsTrigger>
          <TabsTrigger
            value="avisos"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Megaphone className="h-4 w-4" /> Avisos
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <BarChart className="h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="users">
          <CreateUserAccount />
        </TabsContent>

        <TabsContent value="special">
          <CriarContaEspecial />
        </TabsContent>

        <TabsContent value="avisos">
          <AvisosTab />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Analytics do Sistema</h3>
            <p className="text-gray-600">Funcionalidade em desenvolvimento.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
