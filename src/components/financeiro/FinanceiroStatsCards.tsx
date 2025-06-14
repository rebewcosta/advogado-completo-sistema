
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8 animate-fade-in">
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in" style={{ animationDelay: '0ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Receitas Confirmadas</CardTitle>
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-lg font-bold text-green-600 leading-none h-8 flex items-center">
            R$ {receitasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in" style={{ animationDelay: '100ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Despesas Confirmadas</CardTitle>
          <div className="p-2 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-lg font-bold text-red-600 leading-none h-8 flex items-center">
            R$ {despesasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in" style={{ animationDelay: '200ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
          <div className={`p-2 rounded-xl ${saldoAtual >= 0 ? 'bg-gradient-to-br from-blue-100 to-cyan-100' : 'bg-gradient-to-br from-red-100 to-rose-100'}`}>
            <DollarSign className={`h-4 w-4 ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className={`text-lg font-bold leading-none h-8 flex items-center ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in" style={{ animationDelay: '300ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Receitas Pendentes</CardTitle>
          <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-lg font-bold text-yellow-600 leading-none h-8 flex items-center">
            R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-in" style={{ animationDelay: '400ms' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Despesas Pendentes</CardTitle>
          <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-lg font-bold text-orange-600 leading-none h-8 flex items-center">
            R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroStatsCards;
