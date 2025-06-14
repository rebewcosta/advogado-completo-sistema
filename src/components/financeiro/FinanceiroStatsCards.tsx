
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
  receitasConfirmadas: number;
  despesasConfirmadas: number;
  saldoAtual: number;
  receitasPendentes: number;
  despesasPendentes: number;
}

interface FinanceiroStatsCardsProps {
  stats: StatsData;
}

const FinanceiroStatsCards: React.FC<FinanceiroStatsCardsProps> = ({ stats }) => {
  const { receitasConfirmadas, despesasConfirmadas, saldoAtual, receitasPendentes, despesasPendentes } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Receitas Confirmadas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-base font-bold text-green-600 leading-none h-8 flex items-center">
            R$ {receitasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Despesas Confirmadas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-base font-bold text-red-600 leading-none h-8 flex items-center">
            R$ {despesasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
          <DollarSign className={`h-4 w-4 ${saldoAtual >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent className="pb-4">
          <div className={`text-base font-bold leading-none h-8 flex items-center ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Receitas Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-base font-bold text-yellow-600 leading-none h-8 flex items-center">
            R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Despesas Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-base font-bold text-orange-600 leading-none h-8 flex items-center">
            R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroStatsCards;
