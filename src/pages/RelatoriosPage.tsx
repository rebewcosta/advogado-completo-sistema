
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3 } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';
import RelatoriosLoadingState from '@/components/relatorios/RelatoriosLoadingState';
import RelatoriosErrorState from '@/components/relatorios/RelatoriosErrorState';
import MetricsCardsSection from '@/components/relatorios/MetricsCardsSection';
import RelatoriosChartsSection from '@/components/relatorios/RelatoriosChartsSection';

const RelatoriosPage = () => {
  const {
    isLoading,
    error,
    monthlyFinancialData,
    processStatusData,
    taskStatusData,
    activeClientsCount,
    totalRevenue,
    totalExpenses,
    totalProcesses,
    fetchData
  } = useRelatoriosData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <RelatoriosLoadingState />;
  }

  if (error && !isLoading) {
    return <RelatoriosErrorState error={error} onRetry={fetchData} />;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
        <SharedPageHeader
          title="Relatórios Gerenciais"
          description="Visualize o desempenho e as métricas chave do seu escritório."
          pageIcon={<BarChart3 />}
          showActionButton={false}
        />

        <MetricsCardsSection
          totalRevenue={totalRevenue}
          activeClientsCount={activeClientsCount}
          totalProcesses={totalProcesses}
          totalExpenses={totalExpenses}
          formatCurrency={formatCurrency}
        />

        <RelatoriosChartsSection
          monthlyFinancialData={monthlyFinancialData}
          processStatusData={processStatusData}
          taskStatusData={taskStatusData}
          totalRevenue={totalRevenue}
          totalExpenses={totalExpenses}
          activeClientsCount={activeClientsCount}
          totalProcesses={totalProcesses}
          formatCurrency={formatCurrency}
        />
      </div>
    </AdminLayout>
  );
};

export default RelatoriosPage;
