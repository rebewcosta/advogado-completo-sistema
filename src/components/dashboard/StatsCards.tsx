
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { FinanceValueToggle } from '@/components/finance/FinanceValueToggle';

interface StatsData {
  totalClientes: number;
  totalProcessos: number;
  totalEventos: number;
  receitaMes: number;
}

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData>({
    totalClientes: 0,
    totalProcessos: 0,
    totalEventos: 0,
    receitaMes: 0,
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

      const [clientesResponse, processosResponse, eventosResponse, receitasResponse] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('processos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('agenda_eventos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase
          .from('transacoes_financeiras')
          .select('valor')
          .eq('user_id', user.id)
          .eq('tipo_transacao', 'Receita')
          .in('status_pagamento', ['Recebido', 'Pago'])
          .gte('data_transacao', inicioMes)
          .lte('data_transacao', fimMes)
      ]);

      const receitaMes = receitasResponse.data?.reduce((sum, t) => sum + Number(t.valor || 0), 0) || 0;

      setStats({
        totalClientes: clientesResponse.count || 0,
        totalProcessos: processosResponse.count || 0,
        totalEventos: eventosResponse.count || 0,
        receitaMes,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium"><Spinner size="sm" /></CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-8 flex items-center"><Spinner /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold text-blue-600 leading-none h-8 flex items-center">
            {stats.totalClientes}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total de Processos</CardTitle>
          <FileText className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold text-indigo-600 leading-none h-8 flex items-center">
            {stats.totalProcessos}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Eventos na Agenda</CardTitle>
          <Calendar className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold text-purple-600 leading-none h-8 flex items-center">
            {stats.totalEventos}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Receita do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold text-green-600 leading-none h-8 flex items-center">
            <FinanceValueToggle 
              value={stats.receitaMes} 
              className="text-green-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
