
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Users, FileText, TrendingUp, CheckSquare, AlertTriangle } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import DashboardChart from '@/components/dashboard/DashboardChart';
import StatusPieChart from '@/components/dashboard/StatusPieChart';
import ExecutiveSummary from '@/components/dashboard/ExecutiveSummary';

const DashboardPage = () => {
  const { user } = useAuth();

  const getUserFirstName = () => {
    if (user?.user_metadata?.nome) {
      const fullName = user.user_metadata.nome;
      return fullName.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  // Dados mockados para demonstração
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRevenue = 4000;
  const totalExpenses = 450;
  const activeClientsCount = 6;
  const totalProcesses = 5;

  const monthlyFinancialData = [
    { month: 'jan/25', receitas: 0, despesas: 0, lucro: 0 },
    { month: 'fev/25', receitas: 0, despesas: 0, lucro: 0 },
    { month: 'mar/25', receitas: 0, despesas: 0, lucro: 0 },
    { month: 'abr/25', receitas: 0, despesas: 0, lucro: 0 },
    { month: 'mai/25', receitas: 3500, despesas: 300, lucro: 3200 },
    { month: 'jun/25', receitas: 4000, despesas: 450, lucro: 3550 }
  ];

  const processStatusData = [
    { name: 'Em andamento', value: 2, fill: '#6366f1' },
    { name: 'Concluído', value: 3, fill: '#10b981' }
  ];

  const taskStatusData = [
    { name: 'Pendente', value: 4, fill: '#f59e0b' },
    { name: 'Em andamento', value: 2, fill: '#6366f1' },
    { name: 'Concluída', value: 8, fill: '#10b981' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <SharedPageHeader 
          title="Dashboard" 
          description={`Bem-vindo, ${getUserFirstName()}! Visualize o desempenho e as métricas chave do seu escritório.`}
          pageIcon={<TrendingUp />}
        />
        
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8 mb-8">
          <MetricCard
            title="Receita Total (6 meses)"
            value={totalRevenue}
            icon={<DollarSign className="h-6 w-6" />}
            formatValue={formatCurrency}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={8}
          />
          <MetricCard
            title="Clientes Ativos"
            value={activeClientsCount}
            icon={<Users className="h-6 w-6" />}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={12}
          />
          <MetricCard
            title="Total de Processos"
            value={totalProcesses}
            icon={<FileText className="h-6 w-6" />}
            gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
            trend={5}
          />
          <MetricCard
            title="Lucro Líquido (6 meses)"
            value={totalRevenue - totalExpenses}
            icon={<TrendingUp className="h-6 w-6" />}
            formatValue={formatCurrency}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={15}
          />
        </div>

        {/* Gráficos e Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <DashboardChart
            title="Visão Financeira"
            description="Receitas vs. Despesas nos últimos 6 meses"
            data={monthlyFinancialData}
            formatCurrency={formatCurrency}
            gradient="bg-gradient-to-r from-slate-600 to-slate-700"
          />
          
          <StatusPieChart
            title="Status dos Processos"
            description="Distribuição atual dos seus processos"
            data={processStatusData}
            icon={<FileText className="mr-2 h-5 w-5" />}
            gradient="bg-gradient-to-r from-indigo-600 to-purple-600"
            emptyMessage="Nenhum processo cadastrado ainda."
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <StatusPieChart
            title="Status das Tarefas"
            description="Distribuição atual das suas tarefas"
            data={taskStatusData}
            icon={<CheckSquare className="mr-2 h-5 w-5" />}
            gradient="bg-gradient-to-r from-purple-600 to-pink-600"
            emptyMessage="Nenhuma tarefa cadastrada ainda."
          />
          
          <ExecutiveSummary
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            activeClientsCount={activeClientsCount}
            totalProcesses={totalProcesses}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
