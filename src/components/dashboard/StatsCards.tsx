// src/components/dashboard/StatsCards.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface Stats {
  clientesAtivos: number | null;
  processosAndamento: number | null;
  compromissosHoje: number | null;
  receitaMes: number | null;
}

interface StatCardProps {
  title: string;
  value: string | number | null;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  bgColorClass: string; // e.g., 'bg-lawyer-primary'
  iconColorClass?: string; // e.g., 'text-blue-300'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, isLoading, bgColorClass, iconColorClass = 'text-white/70' }) => {
  return (
    <Card className={cn("shadow-lg rounded-lg text-white", bgColorClass)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(iconColorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Spinner size="sm" className="text-white"/> : <div className="text-2xl font-bold">{value ?? 0}</div>}
        <p className="text-xs text-white/80">
          {isLoading ? "Carregando..." : description}
        </p>
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

  if (error) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(4).fill(0).map((_, index) => (
                <Card key={index} className="bg-red-700 text-white shadow-lg rounded-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Erro ao Carregar</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-red-200 truncate">
                            Falha ao buscar dados.
                        </div>
                        <p className="text-xs text-white/70 mt-1">
                            Tente atualizar a página.
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }
  
  const cardBgColors = {
    clientes: 'bg-lawyer-primary', // Azul primário do sistema
    processos: 'bg-slate-700',     // Um cinza escuro elegante
    compromissos: 'bg-sky-700',   // Um azul mais claro, mas ainda escuro
    receita: 'bg-emerald-700'      // Verde escuro para receita
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Clientes Ativos"
        value={stats.clientesAtivos}
        description={(stats.clientesAtivos ?? 0) === 0 ? "Nenhum cliente ativo" : `Total de ${stats.clientesAtivos} clientes`}
        icon={<Users className="h-5 w-5" />}
        isLoading={isLoading}
        bgColorClass={cardBgColors.clientes}
      />
      <StatCard
        title="Processos em Andamento"
        value={stats.processosAndamento}
        description={(stats.processosAndamento ?? 0) === 0 ? "Nenhum processo ativo" : `Total de ${stats.processosAndamento} processos`}
        icon={<FileText className="h-5 w-5" />}
        isLoading={isLoading}
        bgColorClass={cardBgColors.processos}
      />
      <StatCard
        title="Compromissos Hoje"
        value={stats.compromissosHoje}
        description={(stats.compromissosHoje ?? 0) === 0 ? "Nenhum compromisso hoje" : `Total de ${stats.compromissosHoje} para hoje`}
        icon={<Calendar className="h-5 w-5" />}
        isLoading={isLoading}
        bgColorClass={cardBgColors.compromissos}
      />
      <StatCard
        title="Receita no Mês"
        value={`R$ ${(stats.receitaMes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        description={(stats.receitaMes ?? 0) === 0 ? "Nenhuma receita este mês" : "Receita acumulada do mês atual"}
        icon={<DollarSign className="h-5 w-5" />}
        isLoading={isLoading}
        bgColorClass={cardBgColors.receita}
      />
    </div>
  );
};

export default StatsCards;