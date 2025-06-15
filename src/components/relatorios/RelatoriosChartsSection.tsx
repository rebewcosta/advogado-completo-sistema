
import React from 'react';
import { FileText, CheckSquare } from 'lucide-react';
import FinancialChart from './FinancialChart';
import StatusPieChart from './StatusPieChart';
import ExecutiveSummary from './ExecutiveSummary';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

interface RelatoriosChartsSectionProps {
  monthlyFinancialData: MonthlyData[];
  processStatusData: StatusData[];
  taskStatusData: StatusData[];
  totalRevenue: number;
  totalExpenses: number;
  activeClientsCount: number;
  totalProcesses: number;
  formatCurrency: (value: number) => string;
}

const RelatoriosChartsSection: React.FC<RelatoriosChartsSectionProps> = ({
  monthlyFinancialData,
  processStatusData,
  taskStatusData,
  totalRevenue,
  totalExpenses,
  activeClientsCount,
  totalProcesses,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <FinancialChart 
        monthlyFinancialData={monthlyFinancialData}
        formatCurrency={formatCurrency}
      />

      <StatusPieChart
        title="Status dos Processos"
        description="Distribuição atual dos seus processos"
        data={processStatusData}
        icon={<FileText className="mr-2 h-5 w-5" />}
        gradient="bg-gradient-to-r from-indigo-600 to-indigo-700"
        emptyMessage="Sem dados de processos disponíveis"
      />

      <StatusPieChart
        title="Status das Tarefas"
        description="Distribuição atual das suas tarefas"
        data={taskStatusData}
        icon={<CheckSquare className="mr-2 h-5 w-5" />}
        gradient="bg-gradient-to-r from-purple-600 to-purple-700"
        emptyMessage="Sem dados de tarefas disponíveis"
      />

      <ExecutiveSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        activeClientsCount={activeClientsCount}
        totalProcesses={totalProcesses}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default RelatoriosChartsSection;
