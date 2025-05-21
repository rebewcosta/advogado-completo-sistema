// src/pages/DashboardPage.tsx
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VisaoGeralContent from '@/components/dashboard/VisaoGeralContent';
import FinanceiroContent from '@/components/dashboard/FinanceiroContent';
import ProcessosContent from '@/components/dashboard/ProcessosContent';
import AgendaContent from '@/components/dashboard/AgendaContent';
import { LayoutDashboard, BarChartBig, Briefcase, CalendarDays } from 'lucide-react';

const DashboardPage = () => {
  const { user, signOut } = useAuth();

  const getUserFirstName = () => {
    if (user?.user_metadata?.nome) {
      const fullName = user.user_metadata.nome;
      return fullName.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Toast de erro já é tratado no useAuth
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8"> {/* Padding geral da página */}
        <DashboardHeader
          user={user}
          getUserFirstName={getUserFirstName}
          handleSignOut={handleSignOut}
        />

        <Tabs defaultValue="visao-geral" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger
              value="visao-geral"
              className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-lawyer-primary"
            >
              <LayoutDashboard className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="financeiro"
              className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-lawyer-primary"
            >
              <BarChartBig className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="processos"
              className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-lawyer-primary"
            >
              <Briefcase className="h-4 w-4" />
              Processos
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm data-[state=active]:text-lawyer-primary"
            >
              <CalendarDays className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <VisaoGeralContent />
          </TabsContent>

          <TabsContent value="financeiro">
            <FinanceiroContent />
          </TabsContent>

          <TabsContent value="processos">
            <ProcessosContent />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaContent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;