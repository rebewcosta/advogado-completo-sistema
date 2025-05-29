// src/components/dashboard/ProcessosContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfDay, addDays, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, AlertCircle, Clock, List, ExternalLink, RefreshCw, PieChart as PieChartIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Database } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils'; // <<< ADICIONADO IMPORT DO CN AQUI

type Processo = Database['public']['Tables']['processos']['Row'];
type StatusCount = { name: string, value: number, fill: string };

interface ProcessosStats {
  processosPorStatus: StatusCount[];
  proximosPrazos: Processo[];
  ultimosProcessos: Processo[];
  totalProcessosAtivos: number;
}

const COLORS_STATUS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#6b7280']; // Azul, Verde, Laranja, Vermelho, Cinza

const ProcessosContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ProcessosStats>({
    processosPorStatus: [],
    proximosPrazos: [],
    ultimosProcessos: [],
    totalProcessosAtivos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessosData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hoje = startOfDay(new Date());
      const daqui30Dias = endOfDay(addDays(hoje, 30));

      // Todos os processos para contagem de status e últimos adicionados
      const { data: todosProcessos, error: todosProcessosError } = await supabase
        .from('processos')
        .select('id, numero_processo, status_processo, proximo_prazo, created_at, cliente_id, nome_cliente_text, clientes(nome)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); 

      if (todosProcessosError) throw todosProcessosError;

      const statusCount: { [key: string]: number } = {};
      let totalAtivos = 0;
      (todosProcessos || []).forEach(p => {
        const statusKey = p.status_processo || 'Não definido';
        statusCount[statusKey] = (statusCount[statusKey] || 0) + 1;
        if (p.status_processo === 'Em andamento') {
            totalAtivos++;
        }
      });
      
      const processosPorStatusFormatado: StatusCount[] = Object.entries(statusCount)
        .map(([name, value], index) => ({
          name,
          value,
          fill: COLORS_STATUS[index % COLORS_STATUS.length],
        }))
        .sort((a, b) => b.value - a.value);

      const ultimosProcessosAdicionados = (todosProcessos || []).slice(0, 5);

      // Processos com próximos prazos
      const { data: prazosData, error: prazosError } = await supabase
        .from('processos')
        .select('id, numero_processo, proximo_prazo, status_processo, cliente_id, nome_cliente_text, clientes(nome)')
        .eq('user_id', user.id)
        .neq('status_processo', 'Concluído') 
        .gte('proximo_prazo', format(hoje, 'yyyy-MM-dd'))
        .lte('proximo_prazo', format(daqui30Dias, 'yyyy-MM-dd'))
        .order('proximo_prazo', { ascending: true })
        .limit(5);
      
      if (prazosError) throw prazosError;

      setStats({
        processosPorStatus: processosPorStatusFormatado,
        proximosPrazos: prazosData || [],
        ultimosProcessos: ultimosProcessosAdicionados,
        totalProcessosAtivos: totalAtivos,
      });

    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados dos processos.");
      toast({
        title: "Erro ao carregar resumo de processos",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProcessosData();
  }, [fetchProcessosData]);
  
  const renderProcessoItem = (processo: Processo & { clientes?: { nome: string } | null }, displayField: 'proximo_prazo' | 'created_at' = 'proximo_prazo') => {
    const clienteNome = processo.clientes?.nome || processo.nome_cliente_text; 
    return (
        <li key={processo.id} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 px-1 -mx-1 rounded-md transition-colors">
            <div className="truncate w-full">
                <Link to={`/meus-processos?view=${processo.id}`} className="text-xs font-medium text-blue-600 hover:underline truncate block" title={processo.numero_processo}>
                    {processo.numero_processo}
                </Link>
                {clienteNome && <p className="text-[11px] text-gray-500 truncate" title={clienteNome}>Cliente: {clienteNome}</p>}
            </div>
            <span className={cn( // <<< cn ESTAVA SENDO USADO AQUI SEM IMPORTAR
                "text-xs text-gray-500 whitespace-nowrap pl-2",
                displayField === 'proximo_prazo' && processo.proximo_prazo && parseISO(processo.proximo_prazo) < new Date() && processo.status_processo !== 'Concluído' && "text-red-500 font-medium"
            )}>
                {displayField === 'proximo_prazo' && processo.proximo_prazo ? format(parseISO(processo.proximo_prazo), "dd/MM/yy", { locale: ptBR }) :
                 displayField === 'created_at' && processo.created_at ? format(parseISO(processo.created_at), "dd/MM/yy", { locale: ptBR }) : '-'}
            </span>
        </li>
    );
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + (radius + 10) * Math.cos(-midAngle * RADIAN); 
    const y = cy + (radius + 10) * Math.sin(-midAngle * RADIAN); 

    if (percent < 0.05) return null; 

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" className="font-medium pointer-events-none">
        {`${name} (${value})`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <Card><CardHeader><CardTitle className="text-base">Processos por Status</CardTitle></CardHeader><CardContent className="h-60 flex justify-center items-center"><Spinner/></CardContent></Card>
           <Card><CardHeader><CardTitle className="text-base">Próximos Prazos (30 dias)</CardTitle></CardHeader><CardContent className="h-60 flex justify-center items-center"><Spinner/></CardContent></Card>
           <Card><CardHeader><CardTitle className="text-base">Últimos Processos Adicionados</CardTitle></CardHeader><CardContent className="h-60 flex justify-center items-center"><Spinner/></CardContent></Card>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <Card className="border-destructive bg-red-50">
        <CardHeader>
          <CardTitle className="text-destructive-foreground flex items-center"><AlertCircle className="mr-2"/>Erro no Resumo de Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground/90">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProcessosData} className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
                <PieChartIcon className="mr-2 h-5 w-5 text-blue-500"/>
                Processos por Status
            </CardTitle>
            <CardDescription className="text-xs">Distribuição dos seus processos.</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            {stats.processosPorStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.processosPorStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {stats.processosPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} (${(value / stats.processosPorStatus.reduce((s,p) => s + p.value,0) * 100).toFixed(1)}%)`, name]}/>
                  <Legend iconSize={10} wrapperStyle={{fontSize: "10px", paddingTop: "10px", lineHeight: "1.2"}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-center text-gray-500 py-10">Nenhum processo cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-500"/>
                Próximos Prazos (30 dias)
            </CardTitle>
            <CardDescription className="text-xs">Prazos de processos não concluídos.</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            {stats.proximosPrazos.length > 0 ? (
              <ul className="space-y-1 max-h-full overflow-y-auto pr-2 text-left">
                {stats.proximosPrazos.map(p => renderProcessoItem(p as Processo & { clientes?: { nome: string } | null }, 'proximo_prazo'))}
              </ul>
            ) : (
              <p className="text-sm text-center text-gray-500 py-10">Nenhum prazo nos próximos 30 dias.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
             <CardTitle className="text-base flex items-center">
                <List className="mr-2 h-5 w-5 text-indigo-500"/>
                Últimos Processos Adicionados
            </CardTitle>
            <CardDescription className="text-xs">Os 5 processos mais recentes no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            {stats.ultimosProcessos.length > 0 ? (
              <ul className="space-y-1 max-h-full overflow-y-auto pr-2 text-left">
                {stats.ultimosProcessos.map(p => renderProcessoItem(p as Processo & { clientes?: { nome: string } | null }, 'created_at'))}
              </ul>
            ) : (
              <p className="text-sm text-center text-gray-500 py-10">Nenhum processo cadastrado recentemente.</p>
            )}
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 text-center">
        <Button asChild variant="default" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
          <Link to="/meus-processos">
            Ver Todos os Processos
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProcessosContent;