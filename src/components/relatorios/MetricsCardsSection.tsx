
import React from 'react';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import MetricCard from './MetricCard';

interface MetricsCardsSectionProps {
  totalRevenue: number;
  activeClientsCount: number;
  totalProcesses: number;
  totalExpenses: number;
  formatCurrency: (value: number) => string;
}

const MetricsCardsSection: React.FC<MetricsCardsSectionProps> = ({
  totalRevenue,
  activeClientsCount,
  totalProcesses,
  totalExpenses,
  formatCurrency
}) => {
  return (
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
  );
};

export default MetricsCardsSection;
