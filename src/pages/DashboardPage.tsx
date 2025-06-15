
// src/pages/DashboardPage.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VisaoGeralContent from '@/components/dashboard/VisaoGeralContent';
import FinanceiroContent from '@/components/dashboard/FinanceiroContent';
import ProcessosContent from '@/components/dashboard/ProcessosContent';
import AgendaContent from '@/components/dashboard/AgendaContent';
import FerramentasContent from '@/components/dashboard/FerramentasContent';
import { Briefcase, Calendar as CalendarIcon, DollarSign as DollarSignIcon, BarChartHorizontalBig, Wrench } from 'lucide-react';

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
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
      <DashboardHeader
        user={user}
        getUserFirstName={getUserFirstName}
        handleSignOut={handleSignOut}
      />

      <Tabs defaultValue="visao-geral" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-gray-200 p-1.5 rounded-lg mb-6 h-auto">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <BarChartHorizontalBig className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <DollarSignIcon className="h-4 w-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Briefcase className="h-4 w-4" /> Processos
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <CalendarIcon className="h-4 w-4" /> Agenda
          </TabsTrigger>
          <TabsTrigger
            value="ferramentas"
            className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-lawyer-primary data-[state=active]:shadow-md rounded-md h-full"
          >
            <Wrench className="h-4 w-4" /> Ferramentas
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

        <TabsContent value="ferramentas">
          <FerramentasContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
