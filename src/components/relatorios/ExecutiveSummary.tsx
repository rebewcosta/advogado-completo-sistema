
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Scale } from 'lucide-react';
import { FinanceValueToggle } from '@/components/finance/FinanceValueToggle';

interface ExecutiveSummaryProps {
  totalRevenue: number;
  totalExpenses: number;
  activeClientsCount: number;
  totalProcesses: number;
  formatCurrency: (value: number) => string;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  totalRevenue,
  totalExpenses,
  activeClientsCount,
  totalProcesses,
  formatCurrency
}) => {
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
  const avgRevenuePerClient = activeClientsCount > 0 ? totalRevenue / activeClientsCount : 0;

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Resumo Executivo
        </CardTitle>
        <CardDescription className="text-emerald-200">
          Principais indicadores de performance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-blue-600">{profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Média/Cliente</p>
                <div className="text-2xl font-bold text-purple-600">
                  <FinanceValueToggle 
                    value={avgRevenuePerClient} 
                    formatValue={formatCurrency}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processos/Cliente</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeClientsCount > 0 ? (totalProcesses / activeClientsCount).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Análise do Período</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Resultado Financeiro:</strong> 
              <FinanceValueToggle 
                value={totalRevenue - totalExpenses} 
                formatValue={(val) => ` ${formatCurrency(val)}`}
                className="inline-flex ml-1"
              />
              {totalRevenue - totalExpenses >= 0 ? ' (Lucro)' : ' (Prejuízo)'}
            </p>
            <p>• <strong>Performance:</strong> {profitMargin >= 20 ? 'Excelente' : profitMargin >= 10 ? 'Boa' : profitMargin >= 0 ? 'Regular' : 'Atenção necessária'}</p>
            <p>• <strong>Base de Clientes:</strong> {activeClientsCount} clientes ativos com {totalProcesses} processos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummary;
