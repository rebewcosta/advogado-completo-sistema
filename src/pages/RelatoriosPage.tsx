// src/pages/RelatoriosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  FileText,
  Users,
  Clock,
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
  const [activeProcessCount, setActiveProcessCount] = useState(0);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [scheduledEventCount, setScheduledEventCount] = useState(0);

  const getPeriodRange = useCallback((periodKey: FinancialPeriodOption) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

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
        startDate = new Date(1970, 0, 1); // Data bem antiga para pegar tudo
        break;
      default: startDate = subMonths(now, 6); break;
    }
    return { startDate, endDate };
  }, []);

  const fetchDataForPeriod = useCallback(async (period: FinancialPeriodOption) => {
    if (!user) return;
    setIsLoading(true);
    const { startDate, endDate } = getPeriodRange(period);
    const queryStartDate = format(startDate, 'yyyy-MM-dd');
    const queryEndDate = format(endDate, 'yyyy-MM-dd');

    try {
      // Dados Financeiros
      const { data: transacoes, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('tipo_transacao, valor, data_transacao')
        .eq('user_id', user.id)
        .gte('data_transacao', queryStartDate)
        .lte('data_transacao', queryEndDate);
      if (transError) throw transError;

      const monthlyData: { [key: string]: MonthlyData } = {};
      const monthYearFormatter = (date: Date): string => format(date, 'MMM/yy', { locale: ptBR });

      (transacoes || []).forEach(t => {
        if (!t.data_transacao) return;
        const transactionDate = parseISO(t.data_transacao);
        const monthKey = monthYearFormatter(transactionDate);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, receitas: 0, despesas: 0, saldo: 0 };
        }
        if (t.tipo_transacao === 'Receita') {
          monthlyData[monthKey].receitas += Number(t.valor);
        } else if (t.tipo_transacao === 'Despesa') {
          monthlyData[monthKey].despesas += Number(t.valor);
        }
        monthlyData[monthKey].saldo = monthlyData[monthKey].receitas - monthlyData[monthKey].despesas;
      });
      const sortedFinancialData = Object.values(monthlyData).sort((a,b) => {
        const [m1str, y1str] = a.month.split('/');
        const [m2str, y2str] = b.month.split('/');
        
        // Get month names from ptBR locale
        const getMonthIndex = (monthStr: string): number => {
          const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          return months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
        };
        
        const m1Index = getMonthIndex(m1str);
        const m2Index = getMonthIndex(m2str);
        
        const d1 = new Date(Number('20'+y1str), m1Index);
        const d2 = new Date(Number('20'+y2str), m2Index);
        
        return d1.getTime() - d2.getTime();
      });
      setFinancialChartData(sortedFinancialData);

      // Dados de Processos (Tipo e Status) e Contagem de Processos Ativos
      const { data: processos, error: procError } = await supabase
        .from('processos')
        .select('tipo_processo, status_processo, created_at')
        .eq('user_id', user.id)
        .gte('created_at', queryStartDate + 'T00:00:00.000Z')
        .lte('created_at', queryEndDate + 'T23:59:59.999Z');
      if (procError) throw procError;

      const typeCount: Record<string, number> = {};
      const statusCount: Record<string, number> = {};
      let currentActiveProcesses = 0;
      (processos || []).forEach(p => {
        const type = p.tipo_processo || 'Não especificado';
        typeCount[type] = (typeCount[type] || 0) + 1;
        const status = p.status_processo || 'Não especificado';
        statusCount[status] = (statusCount[status] || 0) + 1;
        if (p.status_processo === 'Em andamento') currentActiveProcesses++;
      });
      setProcessTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));
      setProcessStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
      setActiveProcessCount(currentActiveProcesses);


      // Dados de Clientes (Tipo e Contagem Total)
       const { data: clientesData, error: cliError, count: totalClientes } = await supabase
        .from('clientes')
        .select('tipo_cliente, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', queryStartDate + 'T00:00:00.000Z')
        .lte('created_at', queryEndDate + 'T23:59:59.999Z');
      if (cliError) throw cliError;
      const clientTypeCount: Record<string, number> = {};
      (clientesData || []).forEach(c => {
        const type = c.tipo_cliente || 'Não especificado';
        clientTypeCount[type] = (clientTypeCount[type] || 0) + 1;
      });
      setClientTypeData(Object.entries(clientTypeCount).map(([name, value]) => ({ name, value })));
      setTotalClientCount(totalClientes || 0);


      // Dados de Eventos (Contagem Agendada para os próximos 30 dias A PARTIR DO FINAL DO PERÍODO SELECIONADO)
      const eventStartDate = endDate;
      const eventEndDate = subDays(endDate, -30);

      const { error: eventosError, count: eventosCount } = await supabase
        .from('agenda_eventos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('data_hora_inicio', format(eventStartDate, 'yyyy-MM-dd') + 'T00:00:00Z')
        .lte('data_hora_inicio', format(eventEndDate, 'yyyy-MM-dd') + 'T23:59:59Z');
      if (eventosError) throw eventosError;
      setScheduledEventCount(eventosCount || 0);

    } catch (error: any) {
      toast({ title: "Erro ao carregar dados dos relatórios", description: error.message, variant: "destructive" });
      setFinancialChartData([]);
      setProcessTypeData([]);
      setClientTypeData([]);
      setProcessStatusData([]);
      setActiveProcessCount(0);
      setTotalClientCount(0);
      setScheduledEventCount(0);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [user, toast, getPeriodRange]);


  useEffect(() => {
    if (user) {
      fetchDataForPeriod(globalPeriod);
    } else {
      setIsLoading(false);
      setFinancialChartData([]); setProcessTypeData([]); setClientTypeData([]); setProcessStatusData([]);
      setActiveProcessCount(0); setTotalClientCount(0); setScheduledEventCount(0);
    }
  }, [user, globalPeriod, fetchDataForPeriod]);


  const emptyData = [{ name: 'Sem dados', value: 1 }];
  const periodOptions: { label: string; value: FinancialPeriodOption }[] = [
    { label: '15d', value: '15days' }, { label: '30d', value: '30days' },
    { label: '3m', value: '3months' }, { label: '6m', value: '6months' },
    { label: '1a', value: '1year' },
    { label: 'Mês Atual', value: 'current_month' },
    { label: 'Ano Atual', value: 'current_year' },
    { label: 'Tudo', value: 'all_time' },
  ];

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    // Ajustar o raio para posicionar o texto um pouco mais para fora se necessário, ou mais para dentro.
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Aumentado de 0.5 para 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    if (percent < 0.03 && name.length > 10) return null; // Não exibir se muito pequeno e nome longo
    if (percent < 0.05) return null; // Não exibir se a fatia for muito pequena

    return (
      <text
        x={x}
        y={y}
        fill="#333" // Cor do texto alterada para cinza escuro
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize="10px" // Pode ajustar o tamanho da fonte se necessário
        fontWeight="bold"
      >
        {`${name.length > 15 ? name.substring(0,12) + '...' : name}`} {/* Trunca nomes longos */}
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  // Fix for undefined variable error
  const setIsLoadingStatus = (value: boolean) => {
    setIsLoading(value);
  };

  return (
    <AdminLayout>
      <main className="py-8 px-4 md:px-6 lg:px-8">
        {/* Cabeçalho da página com título e filtros de período */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
          {/* Título e Subtítulo alinhados à esquerda */}
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-600">Visualize dados sobre seu escritório</p>
          </div>

          {/* Botões de Período */}
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 md:ml-auto">
            <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline">Período:</span>
            {periodOptions.map(opt => (
              <Button
                key={opt.value}
                variant={globalPeriod === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGlobalPeriod(opt.value)}
                className={cn(
                  "text-xs px-2 py-1 h-auto", // Tamanho e padding consistentes
                  globalPeriod === opt.value
                    ? "bg-lawyer-primary text-white hover:bg-lawyer-primary/90"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Removido o Alert que continha a mensagem sobre os dados do Supabase */}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-500">Carregando dados dos relatórios...</p>
          </div>
        ) : (
          // ... keep existing code for the report display sections
          <div>
            {/* ... All existing report display code */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex items-center mb-3"><div className="bg-blue-100 p-2.5 rounded-full mr-3"><FileText className="h-5 w-5 text-blue-600" /></div><div><h3 className="font-semibold text-gray-700">Processos Ativos</h3><p className="text-2xl font-bold">{activeProcessCount}</p></div></div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex items-center mb-3"><div className="bg-green-100 p-2.5 rounded-full mr-3"><Users className="h-5 w-5 text-green-600" /></div><div><h3 className="font-semibold text-gray-700">Total de Clientes</h3><p className="text-2xl font-bold">{totalClientCount}</p></div></div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex items-center mb-3"><div className="bg-yellow-100 p-2.5 rounded-full mr-3"><Clock className="h-5 w-5 text-yellow-600" /></div><div><h3 className="font-semibold text-gray-700">Eventos (Próx. 30d)</h3><p className="text-2xl font-bold">{scheduledEventCount}</p></div></div>
              </div>
            </div>

            {/* ... keep existing code for charts and other visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                {/* ... Chart components */}
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                {/* ... Chart components */}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                    {/* ... Chart components */}
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                    {/* ... Chart components */}
                </div>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default RelatoriosPage;
