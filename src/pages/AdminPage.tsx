
import React from 'react';
import { Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateUserAccount from '@/components/admin/CreateUserAccount';
import SecurityMonitoring from '@/components/admin/SecurityMonitoring';
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Administração"
          description="Painel administrativo para gerenciar usuários e sistema."
          pageIcon={<Shield />}
        />

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="special">Contas Especiais</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <CreateUserAccount />
          </TabsContent>

          <TabsContent value="security">
            <SecurityMonitoring />
          </TabsContent>

          <TabsContent value="special">
            <CriarContaEspecial />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminPage;
