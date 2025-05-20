// src/components/dashboard/StatsCards.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

interface Stats {
  clientesAtivos: number | null;
  processosAndamento: number | null;
  compromissosHoje: number | null;
  receitaMes: number | null;
}

const StatsCards: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    clientesAtivos: null,
    processosAndamento: null,
    compromissosHoje: null,
    receitaMes: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("StatsCards: Buscando estatísticas...");

    try {
      const today = new Date();
      const inicioDoMes = format(startOfMonth(today), 'yyyy-MM-dd');
      const fimDoMes = format(endOfMonth(today), 'yyyy-MM-dd');
      const inicioDoDia = format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ssxxx");
      const fimDoDia = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ssxxx");

      const [
        clientesRes,
        processosRes,
        compromissosRes,
        transacoesRes
      ] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status_cliente', 'Ativo'),
        supabase.from('processos').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status_processo', 'Em andamento'),
        supabase.from('agenda_eventos').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('data_hora_inicio', inicioDoDia).lte('data_hora_inicio', fimDoDia),
        supabase.from('transacoes_financeiras').select('valor').eq('user_id', user.id).eq('tipo_transacao', 'Receita').gte('data_transacao', inicioDoMes).lte('data_transacao', fimDoMes)
      ]);

      if (clientesRes.error) throw clientesRes.error;
      if (processosRes.error) throw processosRes.error;
      if (compromissosRes.error) throw compromissosRes.error;
      if (transacoesRes.error) throw transacoesRes.error;

      const receitaTotalMes = transacoesRes.data?.reduce((sum, t) => sum + Number(t.valor || 0), 0) || 0;

      console.log("StatsCards: Dados recebidos:", {
        clientesAtivos: clientesRes.count,
        processosAndamento: processosRes.count,
        compromissosHoje: compromissosRes.count,
        receitaMes: receitaTotalMes,
      });

      setStats({
        clientesAtivos: clientesRes.count,
        processosAndamento: processosRes.count,
        compromissosHoje: compromissosRes.count,
        receitaMes: receitaTotalMes,
      });

    } catch (err: any) {
      console.error("StatsCards: Erro ao buscar estatísticas:", err);
      setError(err.message || "Erro ao carregar estatísticas.");
      toast({
        title: "Erro ao carregar estatísticas do Dashboard",
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

  if (error) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">Erro</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-destructive truncate">
                            Falha ao carregar
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tente atualizar.
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Spinner size="sm" /> : <div className="text-2xl font-bold">{stats.clientesAtivos ?? 0}</div>}
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Carregando..." : (stats.clientesAtivos ?? 0) === 0 ? "Nenhum cliente ativo" : `Total de ${stats.clientesAtivos} clientes`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos em Andamento</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Spinner size="sm" /> : <div className="text-2xl font-bold">{stats.processosAndamento ?? 0}</div>}
          <p className="text-xs text-muted-foreground">
             {isLoading ? "Carregando..." : (stats.processosAndamento ?? 0) === 0 ? "Nenhum processo ativo" : `Total de ${stats.processosAndamento} processos`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Spinner size="sm" /> : <div className="text-2xl font-bold">{stats.compromissosHoje ?? 0}</div>}
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Carregando..." : (stats.compromissosHoje ?? 0) === 0 ? "Nenhum compromisso hoje" : `Total de ${stats.compromissosHoje} para hoje`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita no Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Spinner size="sm" /> : <div className="text-2xl font-bold">R$ {(stats.receitaMes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Carregando..." : (stats.receitaMes ?? 0) === 0 ? "Nenhuma receita este mês" : "Receita acumulada do mês atual"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;