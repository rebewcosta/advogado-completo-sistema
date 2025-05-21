// src/pages/RelatoriosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FileText,
  Users,
  Clock,
  DollarSign, // Ícone para financeiro
  BarChart3,  // Ícone para tipo de processo
  PieChart as PieChartIcon, // Ícone para tipo de cliente
  Activity,   // Ícone para status de processo
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Spinner } from '@/components/ui/spinner';
import { format, subDays, subMonths, subYears, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type MonthlyData = { month: string, receitas: number, despesas: number, saldo?: number };
type ChartNameValueData = { name: string, value: number };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#DD60AE', '#8A2BE2', '#FF6347'];
type FinancialPeriodOption = '15days' | '30days' | '3months' | '6months' | '1year' | 'current_month' | 'current_year' | 'all_time';

const RelatoriosPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [globalPeriod, setGlobalPeriod] = useState<FinancialPeriodOption>('30days');
  const [isLoading, setIsLoading] = useState(true);

  const [financialChartData, setFinancialChartData] = useState<MonthlyData[]>([]);
  const [processTypeData, setProcessTypeData] = useState<ChartNameValueData[]>([]);
  const [clientTypeData, setClientTypeData] = useState<ChartNameValueData[]>([]);
  const [processStatusData, setProcessStatusData] = useState<ChartNameValueData[]>([]);

  // Stats para os cards superiores
  const [activeProcessCount, setActiveProcessCount] = useState(0);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [scheduledEventCount, setScheduledEventCount] = useState(0);

  const getPeriodRange = useCallback((periodKey: FinancialPeriodOption) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now; // endDate para financeiros e para calcular eventStartDate

    switch (periodKey) {
      case '15days': startDate = subDays(now, 14); break;
      case '30days': startDate = subDays(now, 29); break;
      case '3months': startDate = subMonths(now, 3); break;
      case '6months': startDate = subMonths(now, 6); break;
      case '1year': startDate = subYears(now, 1); break;
      case 'current_month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'current_year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'all_time':
        startDate = new Date(1970, 0, 1); // Para financeiros "all_time"
        endDate = now; // endDate é 'now' para 'all_time'
        break;
      default:
        startDate = subMonths(now, 1); // Default para 1 mês se algo der errado
        break;
    }
    return { startDate, endDate };
  }, []);

  const fetchDataForPeriod = useCallback(async (period: FinancialPeriodOption) => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { startDate: periodStartDate, endDate: periodEndDate } = getPeriodRange(period);

    const queryFinancialStartDate = format(periodStartDate, 'yyyy-MM-dd');
    const queryFinancialEndDate = format(periodEndDate, 'yyyy-MM-dd');

    try {
      // 1. Dados Financeiros (Filtrados pelo período `globalPeriod`)
      const { data: transacoes, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('tipo_transacao, valor, data_transacao')
        .eq('user_id', user.id)
        .gte('data_transacao', queryFinancialStartDate)
        .lte('data_transacao', queryFinancialEndDate);
      if (transError) throw transError;

      const monthlyDataMap: { [key: string]: MonthlyData } = {};
      const monthYearFormatter = (date: Date): string => format(date, 'MMM/yy', { locale: ptBR });
      (transacoes || []).forEach(t => {
        if (!t.data_transacao) return;
        const transactionDate = parseISO(t.data_transacao);
        const monthKey = monthYearFormatter(transactionDate);
        if (!monthlyDataMap[monthKey]) {
          monthlyDataMap[monthKey] = { month: monthKey, receitas: 0, despesas: 0, saldo: 0 };
        }
        if (t.tipo_transacao === 'Receita') monthlyDataMap[monthKey].receitas += Number(t.valor);
        else if (t.tipo_transacao === 'Despesa') monthlyDataMap[monthKey].despesas += Number(t.valor);
        monthlyDataMap[monthKey].saldo = monthlyDataMap[monthKey].receitas - monthlyDataMap[monthKey].despesas;
      });
      const sortedFinancialData = Object.values(monthlyDataMap).sort((a, b) => {
        const [m1str, y1str] = a.month.split('/'); const [m2str, y2str] = b.month.split('/');
        const getMonthIndex = (monthStr: string): number => ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
        return new Date(Number('20' + y1str), getMonthIndex(m1str)).getTime() - new Date(Number('20' + y2str), getMonthIndex(m2str)).getTime();
      });
      setFinancialChartData(sortedFinancialData);

      // 2. Dados de Processos (Todos do usuário, não filtrados por `globalPeriod` para os gráficos e stats cards)
      const { data: todosProcessos, error: procError } = await supabase
        .from('processos')
        .select('tipo_processo, status_processo')
        .eq('user_id', user.id);
      if (procError) throw procError;

      const typeCount: Record<string, number> = {};
      const statusCount: Record<string, number> = {};
      let currentActiveProcesses = 0;
      (todosProcessos || []).forEach(p => {
        const type = p.tipo_processo || 'Não especificado';
        typeCount[type] = (typeCount[type] || 0) + 1;
        const status = p.status_processo || 'Não especificado';
        statusCount[status] = (statusCount[status] || 0) + 1;
        if (p.status_processo === 'Em andamento') currentActiveProcesses++;
      });
      setProcessTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));
      setProcessStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
      setActiveProcessCount(currentActiveProcesses);

      // 3. Dados de Clientes (Todos do usuário, não filtrados por `globalPeriod` para os gráficos e stats cards)
      const { data: todosClientes, error: cliError, count: totalClientesCount } = await supabase
        .from('clientes')
        .select('tipo_cliente', { count: 'exact' })
        .eq('user_id', user.id);
      if (cliError) throw cliError;

      const clientTypeCount: Record<string, number> = {};
      (todosClientes || []).forEach(c => {
        const type = c.tipo_cliente || 'Não especificado';
        clientTypeCount[type] = (clientTypeCount[type] || 0) + 1;
      });
      setClientTypeData(Object.entries(clientTypeCount).map(([name, value]) => ({ name, value })));
      setTotalClientCount(totalClientesCount || 0);

      // 4. Dados de Eventos da Agenda (Próximos 30 dias a partir do FIM do período selecionado)
      const eventStartDate = periodEndDate; // Fim do período selecionado (ou 'hoje' para 'all_time')
      const eventEndDate = addDays(eventStartDate, 30); // 30 dias para frente

      const { error: eventosError, count: eventosCount } = await supabase
        .from('agenda_eventos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('data_hora_inicio', format(eventStartDate, "yyyy-MM-dd'T'HH:mm:ssxxx"))
        .lte('data_hora_inicio', format(eventEndDate, "yyyy-MM-dd'T'HH:mm:ssxxx"));
      if (eventosError) throw eventosError;
      setScheduledEventCount(eventosCount || 0);

    } catch (error: any) {
      console.error("Erro ao carregar dados dos relatórios:", error);
      toast({ title: "Erro ao carregar dados dos relatórios", description: error.message, variant: "destructive" });
      // Resetar todos os estados em caso de erro
      setFinancialChartData([]);
      setProcessTypeData([]);
      setClientTypeData([]);
      setProcessStatusData([]);
      setActiveProcessCount(0);
      setTotalClientCount(0);
      setScheduledEventCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, getPeriodRange]);

  useEffect(() => {
    if (user) {
      fetchDataForPeriod(globalPeriod);
    } else {
      setIsLoading(false);
      // Resetar estados se não houver usuário
      setFinancialChartData([]); setProcessTypeData([]); setClientTypeData([]); setProcessStatusData([]);
      setActiveProcessCount(0); setTotalClientCount(0); setScheduledEventCount(0);
    }
  }, [user, globalPeriod, fetchDataForPeriod]);

  const periodOptions: { label: string; value: FinancialPeriodOption }[] = [
    { label: '15d', value: '15days' }, { label: '30d', value: '30days' },
    { label: '3m', value: '3months' }, { label: '6m', value: '6months' },
    { label: '1a', value: '1year' },
    { label: 'Mês Atual', value: 'current_month' },
    { label: 'Ano Atual', value: 'current_year' },
    { label: 'Tudo', value: 'all_time' },
  ];

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    if (percent < 0.05 && name.length > 10) return null;
    if (percent < 0.03) return null;

    return (
      <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={textAnchor} dominantBaseline="central" fontSize="10px" fontWeight="500">
        {`${name.length > 12 ? name.substring(0, 10) + '...' : name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  const renderChartCard = (title: string, description: string, chartData: ChartNameValueData[], ChartIcon: React.ElementType, chartType: 'pie' | 'bar' = 'pie') => (
    <Card className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                <ChartIcon className="h-4 w-4 mr-2 text-lawyer-primary" />
                {title}
            </CardTitle>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-gray-400 pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center min-h-[250px] md:min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" labelLine={false} label={<CustomPieLabel />}>
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" stroke="hsl(var(--card))" strokeWidth={2}/>
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: '0.375rem', boxShadow: 'var(--tw-shadow)', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', borderColor: 'hsl(var(--border))' }}/>
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: '10px' }} iconSize={10} />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                <XAxis dataKey="name" fontSize={10} angle={-30} textAnchor="end" height={50} />
                <YAxis fontSize={10} allowDecimals={false}/>
                <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: '0.375rem', boxShadow: 'var(--tw-shadow)', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', borderColor: 'hsl(var(--border))' }}/>
                <Legend wrapperStyle={{fontSize: "11px", paddingTop: '10px'}} iconSize={10}/>
                <Bar dataKey="value" name="Quantidade" radius={[4, 4, 0, 0]}>
                    {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm">
            <ChartIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Nenhum dado disponível para este gráfico.
          </div>
        )}
      </CardContent>
    </Card>
  );


  return (
    <AdminLayout>
      <main className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Relatórios</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visualize dados e métricas sobre seu escritório.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-2 hidden sm:inline">Período (Financeiro):</span>
            {periodOptions.map(opt => (
              <Button
                key={opt.value}
                variant={globalPeriod === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGlobalPeriod(opt.value)}
                className={cn(
                  "text-xs px-2 py-1 h-auto",
                  globalPeriod === opt.value
                    ? "bg-lawyer-primary text-white hover:bg-lawyer-primary/90"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-500 dark:text-gray-400">Carregando dados dos relatórios...</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Cards de Estatísticas Superiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { title: "Processos Ativos", value: activeProcessCount, icon: FileText, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30" },
                { title: "Total de Clientes", value: totalClientCount, icon: Users, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/30" },
                { title: "Eventos (Próx. 30d)", value: scheduledEventCount, icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-900/30" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</CardTitle>
                       <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                         <Icon className={`h-4 w-4 ${item.color}`} />
                       </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{item.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Gráfico Financeiro */}
             <Card className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-lawyer-primary" />
                        Desempenho Financeiro
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-gray-500 dark:text-gray-400 pt-1">Receitas, despesas e saldo ({periodOptions.find(p=>p.value === globalPeriod)?.label}).</CardDescription>
              </CardHeader>
              <CardContent className="h-80 md:h-96">
                {financialChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis fontSize={10} tickFormatter={(value) => `R$${value >= 1000 || value <= -1000 ? (value/1000).toFixed(0) + 'k' : value.toFixed(0)}`} />
                      <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: '0.375rem', boxShadow: 'var(--tw-shadow)', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', borderColor: 'hsl(var(--border))' }}/>
                      <Legend wrapperStyle={{fontSize: "11px", paddingTop: '10px'}} iconSize={10} />
                      <Bar dataKey="receitas" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                     <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-50" />
                     Nenhum dado financeiro para o período selecionado.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráficos de Processos e Clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {renderChartCard("Processos por Tipo", "Distribuição dos seus processos por tipo.", processTypeData, BarChart3, 'bar')}
              {renderChartCard("Processos por Status", "Distribuição dos seus processos por status.", processStatusData, Activity, 'pie')}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
             {renderChartCard("Clientes por Tipo", "Distribuição dos seus clientes por tipo.", clientTypeData, PieChartIcon, 'pie')}
             {/* Espaço para outro gráfico se necessário, ou ajuste para 1 coluna se apenas 3 gráficos */}
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default RelatoriosPage;