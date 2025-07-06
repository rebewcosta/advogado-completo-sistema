
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StripeWebhookConfig from './StripeWebhookConfig';
import SystemMonitoring from './SystemMonitoring';
import ProductionValidation from './ProductionValidation';
import CreateUserAccount from './CreateUserAccount';
import CriarContaEspecial from './CriarContaEspecial';
import SecurityMonitoring from './SecurityMonitoring';
import UserActivityMonitoring from './UserActivityMonitoring';
import AvisosTab from '../configuracoes/AvisosTab';
import { Settings, Activity, CheckSquare, Users, UserPlus, Shield, Bell, UserCheck } from 'lucide-react';

const AdminPanelComplete = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo Completo</h1>
        <p className="text-gray-600 mt-2">
          Gerenciamento completo do sistema, monitoramento e configurações de produção
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="user-activity" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Usuários Online
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Especiais
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="avisos" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Avisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <StripeWebhookConfig />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <SystemMonitoring />
        </TabsContent>

        <TabsContent value="user-activity" className="mt-6">
          <UserActivityMonitoring />
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <ProductionValidation />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <CreateUserAccount />
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <CriarContaEspecial />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="avisos" className="mt-6">
          <AvisosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelComplete;
