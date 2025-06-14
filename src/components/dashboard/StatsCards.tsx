
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Stats {
  clientesAtivos: number | null;
  processosAndamento: number | null;
  compromissosHoje: number | null;
  receitaMes: number | null;
}

interface ModernStatCardProps {
  title: string;
  value: string | number | null;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  gradient: string;
  trend?: number;
  formatValue?: (value: number) => string;
}

const ModernStatCard: React.FC<ModernStatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  isLoading, 
  gradient, 
  trend,
  formatValue 
}) => {
  return (
    <Card className={`relative overflow-hidden ${gradient} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Spinner size="sm" className="text-white"/>
              <span className="text-lg font-medium text-white/80">Carregando...</span>
            </div>
          ) : (
            <h3 className="text-2xl font-bold">
              {typeof value === 'number' && formatValue ? formatValue(value) : value ?? 0}
            </h3>
          )}
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white/60 text-xs">{isLoading ? "Aguarde..." : description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

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

      setStats({
        clientesAtivos: clientesRes.count,
        processosAndamento: processosRes.count,
        compromissosHoje: compromissosRes.count,
        receitaMes: receitaTotalMes,
      });

    } catch (err: any) {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5"/>
            Erro ao Carregar Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchStats} className="border-red-300 text-red-700 hover:bg-red-100">
            <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <ModernStatCard
        title="Clientes Ativos"
        value={stats.clientesAtivos}
        description={(stats.clientesAtivos ?? 0) === 0 ? "Nenhum cliente ativo" : `Total de ${stats.clientesAtivos} clientes`}
        icon={<Users className="h-6 w-6" />}
        isLoading={isLoading}
        gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        trend={12}
      />
      <ModernStatCard
        title="Processos em Andamento"
        value={stats.processosAndamento}
        description={(stats.processosAndamento ?? 0) === 0 ? "Nenhum processo ativo" : `Total de ${stats.processosAndamento} processos`}
        icon={<FileText className="h-6 w-6" />}
        isLoading={isLoading}
        gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
        trend={5}
      />
      <ModernStatCard
        title="Compromissos Hoje"
        value={stats.compromissosHoje}
        description={(stats.compromissosHoje ?? 0) === 0 ? "Nenhum compromisso hoje" : `Total de ${stats.compromissosHoje} para hoje`}
        icon={<Calendar className="h-6 w-6" />}
        isLoading={isLoading}
        gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        trend={-3}
      />
      <ModernStatCard
        title="Receita no Mês"
        value={stats.receitaMes}
        description={(stats.receitaMes ?? 0) === 0 ? "Nenhuma receita este mês" : "Receita acumulada do mês atual"}
        icon={<DollarSign className="h-6 w-6" />}
        isLoading={isLoading}
        gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
        formatValue={formatCurrency}
        trend={15}
      />
    </div>
  );
};

export default StatsCards;
