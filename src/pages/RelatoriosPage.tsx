// src/pages/RelatoriosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  FileText,
  Users,
  Clock,
  BarChart2 as BarChart2Icon,
  PieChart as PieChartIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle // Adicionado para o card de erro
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type MonthlyData = { month: string, receitas: number, despesas: number, saldo?: number };
type ChartNameValueData = { name: string, value: number };

const COLORS_PIE_REPORTS = ['#10b981', '#3b82f6', '#f97316', '#ec4899', '#6366f1', '#f59e0b']; // Cores mais vibrantes para gráficos de pizza
const COLORS_BAR_REPORTS = { receita: '#22c55e', despesa: '#ef4444', saldo: '#1a56db' }; // Mantendo as cores semânticas para barras

type FinancialPeriodOption = '15days' | '30days' | '3months' | '6months' | '1year' | 'current_month' | 'current_year' | 'all_time';

interface ReportStatCardProps {
  title: string;
  value: string | number | null;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  bgColorClass: string;
  iconColorClass?: string;
  valueColorClass?: string;
  descriptionColorClass?: string;
}

const ReportStatCard: React.FC<ReportStatCardProps> = ({
  title,
  value,
  description,
  icon,
  isLoading,
  bgColorClass,
  iconColorClass = 'text-white/70',
  valueColorClass = 'text-white',
  descriptionColorClass = 'text-white/80'
}) => {
  return (
    <Card className={cn("shadow-lg rounded-lg text-white", bgColorClass)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {isLoading ? <Spinner size="sm" className={valueColorClass} /> : <div className={cn("text-xl sm:text-2xl font-bold", valueColorClass)}>{value ?? '0'}</div>}
        <p className={cn("text-[10px] sm:text-xs", descriptionColorClass)}>
          {isLoading ? "Carregando..." : description}
        </p>
      </CardContent>
    </Card>
  );
};


const RelatoriosPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [globalPeriod, setGlobalPeriod] = useState<FinancialPeriodOption>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  const [financialChartData, setFinancialChartData] = useState<MonthlyData[]>([]);
  const [processTypeData, setProcessTypeData] = useState<ChartNameValueData[]>([]);
  const [clientTypeData, setClientTypeData] = useState<ChartNameValueData[]>([]);
  const [processStatusData, setProcessStatusData] = useState<ChartNameValueData[]>([]);
  
  // Stats for cards
  const [activeProcessCount, setActiveProcessCount] = useState(0);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);


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
        startDate = new Date(1970, 0, 1);
        break;
      default: startDate = subDays(now, 29); break;
    }
    return { startDate, endDate };
  }, []);

  const fetchDataForPeriod = useCallback(async (period: FinancialPeriodOption) => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setErrorLoading(null);
    const { startDate, endDate } = getPeriodRange(period);
    const queryStartDate = format(startDate, 'yyyy-MM-dd');
    const queryEndDate = format(endDate, 'yyyy-MM-dd');

    try {
      const { data: transacoes, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('tipo_transacao, valor, data_transacao')
        .eq('user_id', user.id)
        .gte('data_transacao', queryStartDate)
        .lte('data_transacao', queryEndDate);
      if (transError) throw transError;

      const monthlyData: { [key: string]: MonthlyData } = {};
      const monthYearFormatter = (date: Date): string => format(date, 'MMM/yy', { locale: ptBR });
      
      let currentTotalRevenue = 0;
      let currentTotalExpenses = 0;

      (transacoes || []).forEach(t => {
        if (!t.data_transacao) return;
        const transactionDate = parseISO(t.data_transacao);
        const monthKey = monthYearFormatter(transactionDate);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, receitas: 0, despesas: 0, saldo: 0 };
        }
        if (t.tipo_transacao === 'Receita') {
          monthlyData[monthKey].receitas += Number(t.valor);
          currentTotalRevenue += Number(t.valor);
        } else if (t.tipo_transacao === 'Despesa') {
          monthlyData[monthKey].despesas += Number(t.valor);
          currentTotalExpenses += Number(t.valor);
        }
        monthlyData[monthKey].saldo = monthlyData[monthKey].receitas - monthlyData[monthKey].despesas;
      });
      const sortedFinancialData = Object.values(monthlyData).sort((a,b) => {
        const [m1str, y1str] = a.month.split('/');
        const [m2str, y2str] = b.month.split('/');
        const getMonthIndex = (monthStr: string): number => {
          const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          return months.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
        };
        const d1 = new Date(Number('20'+y1str), getMonthIndex(m1str));
        const d2 = new Date(Number('20'+y2str), getMonthIndex(m2str));
        return d1.getTime() - d2.getTime();
      });
      setFinancialChartData(sortedFinancialData);
      setTotalRevenue(currentTotalRevenue);
      setTotalExpenses(currentTotalExpenses);

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

    } catch (error: any) {
      setErrorLoading(error.message || "Erro ao carregar dados dos relatórios.");
      toast({ title: "Erro ao carregar dados dos relatórios", description: error.message, variant: "destructive" });
      setFinancialChartData([]); setProcessTypeData([]); setClientTypeData([]); setProcessStatusData([]);
      setActiveProcessCount(0); setTotalClientCount(0); 
      setTotalRevenue(0); setTotalExpenses(0);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, getPeriodRange]);

  useEffect(() => {
    if (user) {
      fetchDataForPeriod(globalPeriod);
    } else {
      setIsLoading(false);
      setFinancialChartData([]); setProcessTypeData([]); setClientTypeData([]); setProcessStatusData([]);
      setActiveProcessCount(0); setTotalClientCount(0);
      setTotalRevenue(0); setTotalExpenses(0);
    }
  }, [user, globalPeriod, fetchDataForPeriod]);

  const emptyDataMessage = (chartName: string) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <PieChartIcon className="w-12 h-12 text-gray-300 mb-2" />
        <p className="text-sm">Sem dados para exibir no período selecionado</p>
        <p className="text-xs">para "{chartName}".</p>
    </div>
  );

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
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55; // Ajustado para posicionar melhor
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    if (percent < 0.07) return null; 

    return (
      <text x={x} y={y} fill="#4A5568" textAnchor={textAnchor} dominantBaseline="central" fontSize="10px" fontWeight="500">
        {`${name.length > 12 ? name.substring(0,10) + '...' : name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  const reportCardBgColors = {
    receita: 'bg-emerald-600',      // Verde escuro
    despesas: 'bg-red-600',        // Vermelho escuro
    processos: 'bg-sky-600',       // Azul céu escuro
    clientes: 'bg-purple-600',     // Roxo escuro
  };


  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 md:mb-8 gap-4">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <BarChart2Icon className="mr-3 h-7 w-7 text-lawyer-primary" />
                Relatórios Gerenciais
            </h1>
            <p className="text-gray-600 text-left mt-1">
                Visualize dados e métricas importantes sobre seu escritório.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 md:ml-auto">
            <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline">Período:</span>
            {periodOptions.map(opt => (
              <Button
                key={opt.value}
                variant={globalPeriod === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setGlobalPeriod(opt.value)}
                className={cn(
                  "text-xs px-2 py-1 h-auto min-w-[40px]", // min-width para botões pequenos
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

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-500">Carregando dados dos relatórios...</p>
          </div>
        ) : errorLoading ? (
            <Card className="shadow-md rounded-lg bg-red-50 border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center"><AlertCircle className="mr-2"/>Erro ao Carregar Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">{errorLoading}</p>
                    <Button onClick={() => fetchDataForPeriod(globalPeriod)} variant="outline" size="sm" className="mt-4">Tentar Novamente</Button>
                </CardContent>
            </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <ReportStatCard
                    title="Receita no Período"
                    value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    description="Total de receitas no período."
                    icon={<TrendingUp className="h-full w-full" />}
                    isLoading={isLoading}
                    bgColorClass={reportCardBgColors.receita}
                />
                <ReportStatCard
                    title="Despesas no Período"
                    value={`R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    description="Total de despesas no período."
                    icon={<TrendingDown className="h-full w-full" />}
                    isLoading={isLoading}
                    bgColorClass={reportCardBgColors.despesas}
                />
                <ReportStatCard
                    title="Processos Ativos"
                    value={activeProcessCount}
                    description="Processos em andamento."
                    icon={<FileText className="h-full w-full" />}
                    isLoading={isLoading}
                    bgColorClass={reportCardBgColors.processos}
                />
                <ReportStatCard
                    title="Total de Clientes"
                    value={totalClientCount}
                    description="Clientes no período."
                    icon={<Users className="h-full w-full" />}
                    isLoading={isLoading}
                    bgColorClass={reportCardBgColors.clientes}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <Card className="shadow-lg rounded-lg h-[400px] flex flex-col bg-white">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg text-gray-700">Fluxo Financeiro Mensal</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-gray-500">Receitas, Despesas e Saldo por mês.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {financialChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                                <XAxis dataKey="month" fontSize={10} tickMargin={5} />
                                <YAxis fontSize={10} tickFormatter={(value) => `${value/1000}k`} tickMargin={5} />
                                <RechartsTooltip
                                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }} /* dark gray */
                                    itemStyle={{ fontSize: '12px' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconSize={10}/>
                                <Bar dataKey="receitas" fill={COLORS_BAR_REPORTS.receita} name="Receitas" radius={[4, 4, 0, 0]} barSize={10} />
                                <Bar dataKey="despesas" fill={COLORS_BAR_REPORTS.despesa} name="Despesas" radius={[4, 4, 0, 0]} barSize={10} />
                                <Bar dataKey="saldo" fill={COLORS_BAR_REPORTS.saldo} name="Saldo" radius={[4, 4, 0, 0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : emptyDataMessage("Fluxo Financeiro Mensal")}
                    </CardContent>
                </Card>

                <Card className="shadow-lg rounded-lg h-[400px] flex flex-col bg-white">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg text-gray-700">Status dos Processos</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-gray-500">Distribuição dos processos por status.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {processStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                data={processStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={CustomPieLabel}
                                outerRadius={90} 
                                innerRadius={40}
                                dataKey="value"
                                nameKey="name"
                                >
                                {processStatusData.map((entry, index) => (
                                    <Cell key={`cell-status-${index}`} fill={COLORS_PIE_REPORTS[index % COLORS_PIE_REPORTS.length]} />
                                ))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number, name: string) => [`${value} (${(value / processStatusData.reduce((s,p) => s + p.value,0) * 100).toFixed(1)}%)`, name]} />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconSize={10} />
                            </PieChart>
                            </ResponsiveContainer>
                        ) : emptyDataMessage("Status dos Processos")}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <Card className="shadow-lg rounded-lg h-[400px] flex flex-col bg-white">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg text-gray-700">Tipos de Processo</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-gray-500">Distribuição dos processos por tipo.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {processTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie data={processTypeData} cx="50%" cy="50%" labelLine={false} label={CustomPieLabel} outerRadius={90} innerRadius={40} dataKey="value" nameKey="name">
                                    {processTypeData.map((entry, index) => (<Cell key={`cell-type-${index}`} fill={COLORS_PIE_REPORTS[index % COLORS_PIE_REPORTS.length]} />))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number, name: string) => [`${value} (${(value / processTypeData.reduce((s,p) => s + p.value,0) * 100).toFixed(1)}%)`, name]} />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : emptyDataMessage("Tipos de Processo")}
                    </CardContent>
                </Card>

                <Card className="shadow-lg rounded-lg h-[400px] flex flex-col bg-white">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg text-gray-700">Tipos de Cliente</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-gray-500">Distribuição de clientes por tipo.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {clientTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                <Pie data={clientTypeData} cx="50%" cy="50%" labelLine={false} label={CustomPieLabel} outerRadius={90} innerRadius={40} dataKey="value" nameKey="name">
                                    {clientTypeData.map((entry, index) => (<Cell key={`cell-client-${index}`} fill={COLORS_PIE_REPORTS[index % COLORS_PIE_REPORTS.length]} />))}
                                </Pie>
                                <RechartsTooltip formatter={(value: number, name: string) => [`${value} (${(value / clientTypeData.reduce((s,p) => s + p.value,0) * 100).toFixed(1)}%)`, name]}/>
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : emptyDataMessage("Tipos de Cliente")}
                    </CardContent>
                </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default RelatoriosPage;