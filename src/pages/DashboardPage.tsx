
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VisaoGeralContent from '@/components/dashboard/VisaoGeralContent';
import FinanceiroContent from '@/components/dashboard/FinanceiroContent';
import ProcessosContent from '@/components/dashboard/ProcessosContent';
import AgendaContent from '@/components/dashboard/AgendaContent';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <DashboardHeader
        user={user}
        getUserFirstName={getUserFirstName}
        handleSignOut={handleSignOut}
      />

      <Tabs defaultValue="visao-geral" className="mt-8">
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl mb-8 shadow-lg border border-white/50">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <BarChartHorizontalBig className="h-4 w-4" /> 
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Visão</span>
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <DollarSignIcon className="h-4 w-4" /> 
            <span className="hidden sm:inline">Financeiro</span>
            <span className="sm:hidden">Fin.</span>
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <Briefcase className="h-4 w-4" /> 
            <span className="hidden sm:inline">Processos</span>
            <span className="sm:hidden">Proc.</span>
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <CalendarIcon className="h-4 w-4" /> 
            <span className="hidden sm:inline">Agenda</span>
            <span className="sm:hidden">Age.</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <TabsContent value="visao-geral" className="mt-0">
            <VisaoGeralContent />
          </TabsContent>

          <TabsContent value="financeiro" className="mt-0">
            <FinanceiroContent />
          </TabsContent>

          <TabsContent value="processos" className="mt-0">
            <ProcessosContent />
          </TabsContent>

          <TabsContent value="agenda" className="mt-0">
            <AgendaContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
