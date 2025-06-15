
import React from 'react';
import { DollarSign, Users, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import ModernMetricCard from './ModernMetricCard';

const ModernStatsCards: React.FC = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <ModernMetricCard
        title="Receita Total (6 meses)"
        value={4000}
        icon={<DollarSign className="h-6 w-6" />}
        formatValue={formatCurrency}
        gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
        trend={8}
      />
      <ModernMetricCard
        title="Clientes Ativos"
        value={6}
        icon={<Users className="h-6 w-6" />}
        gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        trend={12}
      />
      <ModernMetricCard
        title="Total de Processos"
        value={5}
        icon={<FileText className="h-6 w-6" />}
        gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
        trend={5}
      />
      <ModernMetricCard
        title="Lucro Líquido (6 meses)"
        value={3550}
        icon={<CheckCircle className="h-6 w-6" />}
        formatValue={formatCurrency}
        gradient="bg-gradient-to-r from-purple-500 to-pink-600"
        trend={15}
      />
    </div>
  );
};

export default ModernStatsCards;
