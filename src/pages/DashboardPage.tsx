
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ModernVisaoGeralContent from '@/components/dashboard/ModernVisaoGeralContent';
import ModernFinanceiroContent from '@/components/dashboard/ModernFinanceiroContent';
import ModernProcessosContent from '@/components/dashboard/ModernProcessosContent';
import ModernAgendaContent from '@/components/dashboard/ModernAgendaContent';
import { Briefcase, Calendar as CalendarIcon, DollarSign as DollarSignIcon, BarChartHorizontalBig } from 'lucide-react';

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
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      <DashboardHeader
        user={user}
        getUserFirstName={getUserFirstName}
        handleSignOut={handleSignOut}
      />

      <Tabs defaultValue="visao-geral" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-xl mb-6 h-auto shadow-lg border border-white/20">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg h-full transition-all duration-300 hover:scale-105"
          >
            <BarChartHorizontalBig className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg h-full transition-all duration-300 hover:scale-105"
          >
            <DollarSignIcon className="h-4 w-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg h-full transition-all duration-300 hover:scale-105"
          >
            <Briefcase className="h-4 w-4" /> Processos
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg h-full transition-all duration-300 hover:scale-105"
          >
            <CalendarIcon className="h-4 w-4" /> Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <ModernVisaoGeralContent />
        </TabsContent>

        <TabsContent value="financeiro">
          <ModernFinanceiroContent />
        </TabsContent>

        <TabsContent value="processos">
          <ModernProcessosContent />
        </TabsContent>

        <TabsContent value="agenda">
          <ModernAgendaContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
