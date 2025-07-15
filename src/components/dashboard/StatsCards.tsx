
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DollarSign, Briefcase, Calendar, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { FinanceValueToggle } from '@/components/finance/FinanceValueToggle';

interface DashboardStats {
  receitaMes: number;
  despesaMes: number;
  saldoMes: number;
  totalProcessosAtivos: number;
  eventosHoje: number;
  tarefasPendentes: number;
}

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    receitaMes: 0,
    despesaMes: 0,
    saldoMes: 0,
    totalProcessosAtivos: 0,
    eventosHoje: 0,
    tarefasPendentes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      const inicioMes = format(startOfMonth(today), 'yyyy-MM-dd');
      const fimMes = format(endOfMonth(today), 'yyyy-MM-dd');
      const hoje = format(today, 'yyyy-MM-dd');

      // Dados financeiros
      const { data: transacoes } = await supabase
        .from('transacoes_financeiras')
        .select('tipo_transacao, valor, status_pagamento')
        .eq('user_id', user.id)
        .gte('data_transacao', inicioMes)
        .lte('data_transacao', fimMes)
        .in('status_pagamento', ['Recebido', 'Pago']);

      let receitaMes = 0;
      let despesaMes = 0;

      (transacoes || []).forEach(t => {
        if (t.tipo_transacao === 'Receita' && (t.status_pagamento === 'Recebido' || t.status_pagamento === 'Pago')) {
          receitaMes += Number(t.valor || 0);
        } else if (t.tipo_transacao === 'Despesa' && t.status_pagamento === 'Pago') {
          despesaMes += Number(t.valor || 0);
        }
      });

      // Processos ativos
      const { data: processos } = await supabase
        .from('processos')
        .select('id')
        .eq('user_id', user.id)
        .eq('status_processo', 'Em andamento');

      // Eventos hoje
      const { data: eventos } = await supabase
        .from('agenda_eventos')
        .select('id')
        .eq('user_id', user.id)
        .gte('data_hora_inicio', `${hoje}T00:00:00`)
        .lt('data_hora_inicio', `${hoje}T23:59:59`);

      // Tarefas pendentes
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'Pendente');

      setStats({
        receitaMes,
        despesaMes,
        saldoMes: receitaMes - despesaMes,
        totalProcessosAtivos: processos?.length || 0,
        eventosHoje: eventos?.length || 0,
        tarefasPendentes: tarefas?.length || 0,
      });

    } catch (err: any) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1,2,3,4,5,6].map(i => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="p-4 sm:p-6 flex justify-center items-center">
              <Spinner />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100">Receita do Mês</CardTitle>
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <FinanceValueToggle value={stats.receitaMes} className="text-white" />
          </div>
          <p className="text-xs text-emerald-100 mt-1">Valores confirmados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-100">Despesa do Mês</CardTitle>
          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <FinanceValueToggle value={stats.despesaMes} className="text-white" />
          </div>
          <p className="text-xs text-red-100 mt-1">Valores pagos</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Saldo do Mês</CardTitle>
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">
            <FinanceValueToggle value={stats.saldoMes} className="text-white" />
          </div>
          <p className="text-xs text-blue-100 mt-1">Receita - Despesa</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">Processos Ativos</CardTitle>
          <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-purple-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.totalProcessosAtivos}</div>
          <p className="text-xs text-purple-100 mt-1">Em andamento</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-100">Eventos Hoje</CardTitle>
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.eventosHoje}</div>
          <p className="text-xs text-orange-100 mt-1">Compromissos agendados</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-100">Tarefas Pendentes</CardTitle>
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-teal-200" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.tarefasPendentes}</div>
          <p className="text-xs text-teal-100 mt-1">Para realizar</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
