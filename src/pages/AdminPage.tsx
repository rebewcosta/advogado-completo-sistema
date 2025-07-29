
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TestTube2, 
  Users, 
  UserPlus, 
  Shield, 
  Bell, 
  Settings, 
  Webhook,
  BarChart3,
  Database
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

// Importar todos os componentes necessários
import MonitoramentoPagamentos from '@/components/admin/MonitoramentoPagamentos';
import SystemMonitoring from '@/components/admin/SystemMonitoring';
import UsuariosOnline from '@/components/admin/UsuariosOnline';
import UsuariosTrial from '@/components/admin/UsuariosTrial';
import UsuariosCriados from '@/components/admin/UsuariosCriados';
import SystemTesting from '@/components/admin/SystemTesting';
// import CreateUserAccount from '@/components/admin/CreateUserAccount'; // Removed - deprecated component
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';
import SecurityMonitoring from '@/components/admin/SecurityMonitoring';
import StripeWebhookConfig from '@/components/admin/StripeWebhookConfig';
import AvisosTab from '@/components/configuracoes/AvisosTab';

const AdminPage = () => {
  const { user } = useAuth();

  // Verificar se é o admin master
  if (!user || user.email !== 'webercostag@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header do Painel */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600 text-lg">Controle total do sistema JusGestão</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Sistema Online</span>
        </div>
      </div>

      {/* Tabs principais organizadas */}
      <Tabs defaultValue="usuarios-online" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10 gap-2 h-auto p-2 bg-gray-50 rounded-lg">
          <TabsTrigger value="usuarios-online" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Users className="h-5 w-5" />
            <span className="text-xs">Online</span>
          </TabsTrigger>
          
          <TabsTrigger value="usuarios-criados" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Users className="h-5 w-5" />
            <span className="text-xs">Criados</span>
          </TabsTrigger>
          
          <TabsTrigger value="usuarios-trial" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Users className="h-5 w-5" />
            <span className="text-xs">Trial</span>
          </TabsTrigger>
          
          <TabsTrigger value="monitoramento" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Pagamentos</span>
          </TabsTrigger>
          
          <TabsTrigger value="sistema" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Activity className="h-5 w-5" />
            <span className="text-xs">Sistema</span>
          </TabsTrigger>
          
          <TabsTrigger value="teste-sistema" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <TestTube2 className="h-5 w-5" />
            <span className="text-xs">Testes</span>
          </TabsTrigger>
          
          <TabsTrigger value="criar-conta" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            <UserPlus className="h-5 w-5" />
            <span className="text-xs">Criar Conta</span>
          </TabsTrigger>
          
          <TabsTrigger value="conta-especial" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <Users className="h-5 w-5" />
            <span className="text-xs">Especial</span>
          </TabsTrigger>
          
          <TabsTrigger value="seguranca" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <Shield className="h-5 w-5" />
            <span className="text-xs">Segurança</span>
          </TabsTrigger>
          
          <TabsTrigger value="avisos" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Avisos</span>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Tabs */}
        <TabsContent value="usuarios-online" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-500" />
                Usuários Online
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real de usuários conectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsuariosOnline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios-criados" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Usuários Criados
              </CardTitle>
              <CardDescription>
                Todas as contas criadas no sistema e seu status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsuariosCriados />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios-trial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-500" />
                Usuários Trial
              </CardTitle>
              <CardDescription>
                Gerenciamento de usuários em período trial e suas expirações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsuariosTrial />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoramento" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-orange-500" />
                Monitoramento de Pagamentos
              </CardTitle>
              <CardDescription>
                Acompanhe pagamentos, assinaturas e status financeiro dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonitoramentoPagamentos />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-teal-500" />
                Monitoramento do Sistema
              </CardTitle>
              <CardDescription>
                Status do sistema, performance e logs de operação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teste-sistema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-6 w-6 text-amber-500" />
                Teste de Sistema
              </CardTitle>
              <CardDescription>
                Execução de testes abrangentes para verificar o funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemTesting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criar-conta" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-indigo-500" />
                Criar Conta de Usuário
              </CardTitle>
              <CardDescription>
                Criação de contas regulares para novos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 p-8">
                Componente removido - funcionalidade migrada para "Criar Conta Especial"
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conta-especial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-pink-500" />
                Criar Conta Especial
              </CardTitle>
              <CardDescription>
                Criação de contas com privilégios especiais e acesso vitalício
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CriarContaEspecial />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-500" />
                Monitoramento de Segurança
              </CardTitle>
              <CardDescription>
                Logs de segurança, tentativas de acesso e alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avisos" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-yellow-500" />
                  Gerenciar Avisos do Sistema
                </CardTitle>
                <CardDescription>
                  Envie avisos e notificações para todos os usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvisosTab />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-6 w-6 text-teal-500" />
                  Configuração do Webhook Stripe
                </CardTitle>
                <CardDescription>
                  Configuração e monitoramento dos webhooks do Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StripeWebhookConfig />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
