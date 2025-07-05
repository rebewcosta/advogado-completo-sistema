import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VisaoGeralContent from '@/components/dashboard/VisaoGeralContent';
import FinanceiroContent from '@/components/dashboard/FinanceiroContent';
import ProcessosContent from '@/components/dashboard/ProcessosContent';
import AgendaContent from '@/components/dashboard/AgendaContent';
import ListaAvisos from '@/components/avisos/ListaAvisos';
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-xl mb-8 shadow-lg border border-white/50 h-auto">
          <TabsTrigger
            value="visao-geral"
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <BarChartHorizontalBig className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> 
            <span className="truncate">Visão</span>
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <DollarSignIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> 
            <span className="truncate">Financ.</span>
          </TabsTrigger>
          <TabsTrigger
            value="processos"
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> 
            <span className="truncate">Process.</span>
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          >
            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /> 
            <span className="truncate">Agenda</span>
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

      {/* Lista de avisos - aparece sempre no canto superior direito */}
      <ListaAvisos />
    </div>
  );
};

export default DashboardPage;
