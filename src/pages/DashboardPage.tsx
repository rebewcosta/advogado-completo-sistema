
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VisaoGeralContent from '@/components/dashboard/VisaoGeralContent';
import FinanceiroContent from '@/components/dashboard/FinanceiroContent';
import ProcessosContent from '@/components/dashboard/ProcessosContent';
import AgendaContent from '@/components/dashboard/AgendaContent';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  
  // Obter o primeiro nome do usuário dos metadados ou do email
  const getUserFirstName = () => {
    if (user?.user_metadata?.nome) {
      const fullName = user.user_metadata.nome;
      return fullName.split(' ')[0]; // Retorna apenas o primeiro nome
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <DashboardHeader 
          user={user} 
          getUserFirstName={getUserFirstName} 
          handleSignOut={handleSignOut} 
        />

        <Tabs defaultValue="visao-geral">
          <TabsList className="mb-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="processos">Processos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba Visão Geral */}
          <TabsContent value="visao-geral">
            <VisaoGeralContent />
          </TabsContent>

          {/* Conteúdo da aba Financeiro */}
          <TabsContent value="financeiro">
            <FinanceiroContent />
          </TabsContent>

          {/* Conteúdo da aba Processos */}
          <TabsContent value="processos">
            <ProcessosContent />
          </TabsContent>

          {/* Conteúdo da aba Agenda */}
          <TabsContent value="agenda">
            <AgendaContent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
