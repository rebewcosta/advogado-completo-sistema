
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">Resumo Executivo</CardTitle>
        <CardDescription className="text-slate-300 text-center">
          Principais métricas do período
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-slate-300">Receita Total</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-sm text-slate-300">Gastos Totais</div>
          </div>
        </div>
        
        <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <div className="text-3xl font-bold text-yellow-400">
            {formatCurrency(netProfit)}
          </div>
          <div className="text-sm text-slate-300">Lucro Líquido</div>
          <div className="text-xs text-slate-400 mt-1">
            Margem: {margin}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{activeClientsCount}</div>
            <div className="text-xs text-slate-400">Clientes Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{totalProcesses}</div>
            <div className="text-xs text-slate-400">Total Processos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummary;
