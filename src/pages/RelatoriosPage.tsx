// src/pages/RelatoriosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Info,
  FileText,
  Users,
  Clock,
  // Download, // Removido pois não haverá botão de download por enquanto
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // Mantido para os botões de período
import { Spinner } from '@/components/ui/spinner';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type MonthlyData = { month: string, receitas: number, despesas: number, saldo?: number };
type ChartNameValueData = { name: string, value: number };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#DD60AE', '#8A2BE2', '#FF6347'];
type FinancialPeriodOption = '15days' | '30days' | '3months' | '6months' | '1year';

const RelatoriosPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [financialChartPeriod, setFinancialChartPeriod] = useState<FinancialPeriodOption>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFinancialChart, setIsLoadingFinancialChart] = useState(false);

  const [financialChartData, setFinancialChartData] = useState<MonthlyData[]>([]);
  const [processTypeData, setProcessTypeData] = useState<ChartNameValueData[]>([]);
  const [clientTypeData, setClientTypeData] = useState<ChartNameValueData[]>([]);
  const [processStatusData, setProcessStatusData] = useState<ChartNameValueData[]>([]);
  const [activeProcessCount, setActiveProcessCount] = useState(0);
  const [totalClientCount, setTotalClientCount] = useState(0);
  const [scheduledEventCount, setScheduledEventCount] = useState(0);

  const getPeriodRange = useCallback((periodKey: FinancialPeriodOption | string) => {
    const now = new Date();
    let startDate: Date;
    switch (periodKey) {
      case '15days': startDate = subDays(now, 14); break;
      case '30days': startDate = subDays(now, 29); break;
      case '3months': startDate = subMonths(now, 3); break;
      case '1year': startDate = subYears(now, 1); break;
      case '6months': default: startDate = subMonths(now, 6); break;
    }
    return { startDate, endDate: now };
  }, []);

  const fetchFinancialData = useCallback(async (period: FinancialPeriodOption) => {
    if (!user) return;
    setIsLoadingFinancialChart(true);
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
      const sortedData = Object.values(monthlyData).sort((a,b) => {
        const [m1str, y1str] = a.month.split('/');
        const [m2str, y2str] = b.month.split('/');
        const d1 = new Date(Number('20'+y1str), ptBR.match.months?.findIndex( (m:any) => m.test(m1str)) || 0);
        const d2 = new Date(Number('20'+y2str), ptBR.match.months?.findIndex( (m:any) => m.test(m2str)) || 0);
        return d1.getTime() - d2.getTime();
      });
      setFinancialChartData(sortedData);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados financeiros", description: error.message, variant: "destructive" });
      setFinancialChartData([]);
    } finally {
      setIsLoadingFinancialChart(false);
    }
  }, [user, toast, getPeriodRange]);

  const fetchSummaryAndOtherChartsData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: processos, error: procError } = await supabase
        .from('processos')
        .select('tipo_processo, status_processo')
        .eq('user_id', user.id);
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

      const { data: clientes, error: cliError, count: totalClientes } = await supabase
        .from('clientes')
        .select('tipo_cliente', {count: 'exact'})
        .eq('user_id', user.id);
      if (cliError) throw cliError;
      const clientTypeCount: Record<string, number> = {};
      (clientes || []).forEach(c => {
        const type = c.tipo_cliente || 'Não especificado';
        clientTypeCount[type] = (clientTypeCount[type] || 0) + 1;
      });
      setClientTypeData(Object.entries(clientTypeCount).map(([name, value]) => ({ name, value })));
      setTotalClientCount(totalClientes || 0);

      const today = format(new Date(), 'yyyy-MM-dd');
      const thirtyDaysFromNow = format(subDays(new Date(), -30), 'yyyy-MM-dd');
      const { error: eventosError, count: eventosCount } = await supabase
        .from('agenda_eventos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('data_hora_inicio', today + 'T00:00:00Z')
        .lte('data_hora_inicio', thirtyDaysFromNow + 'T23:59:59Z');
      if (eventosError) throw eventosError;
      setScheduledEventCount(eventosCount || 0);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados sumários", description: error.message, variant: "destructive" });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchFinancialData(financialChartPeriod);
      fetchSummaryAndOtherChartsData().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setFinancialChartData([]); setProcessTypeData([]); setClientTypeData([]); setProcessStatusData([]);
      setActiveProcessCount(0); setTotalClientCount(0); setScheduledEventCount(0);
    }
  }, [user, financialChartPeriod, fetchFinancialData, fetchSummaryAndOtherChartsData]);

  // Função de download removida/simplificada para não exportar
  // const handleDownloadReport = (reportType: string, dataToExport?: any[], title?: string) => {
  //   console.log("Tentativa de exportar relatório (desabilitado):", reportType, dataToExport, title);
  //   toast({ title: "Exportação desabilitada", description: "A funcionalidade de exportar relatórios está temporariamente desabilitada." });
  // };

  const emptyData = [{ name: 'Sem dados', value: 1 }];
  const periodOptions: { label: string; value: FinancialPeriodOption }[] = [
    { label: '15d', value: '15days' }, { label: '30d', value: '30days' },
    { label: '3m', value: '3months' }, { label: '6m', value: '6months' },
    { label: '1a', value: '1year' },
  ];

  return (
    <AdminLayout>
      <main className="py-8 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-600">Visualize dados sobre seu escritório</p> {/* Alterado */}
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-5 w-5" />
          <AlertDescription>
            Os relatórios abaixo são gerados com base nos dados reais cadastrados no Supabase.
          </AlertDescription>
        </Alert>

        {isLoading && financialChartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Spinner size="lg" />
            <p className="mt-3 text-gray-500">Carregando dados dos relatórios...</p>
          </div>
        ) : (
          <>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="font-semibold text-gray-700 mb-2 sm:mb-0">Receitas x Despesas</h3>
                  <div className="flex space-x-1">
                    {periodOptions.map(opt => (
                      <Button key={opt.value} variant={financialChartPeriod === opt.value ? "default" : "outline"} size="sm" onClick={() => setFinancialChartPeriod(opt.value)}
                        className={cn("text-xs px-2 py-1 h-auto", financialChartPeriod === opt.value ? "bg-lawyer-primary text-white hover:bg-lawyer-primary/90" : "border-gray-300 text-gray-600 hover:bg-gray-100")}>
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Botão de Exportar Removido */}
                <div className="flex-grow relative mt-4"> {/* Adicionado mt-4 para espaço */}
                  {isLoadingFinancialChart && ( <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><Spinner /></div> )}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialChartData.length > 0 ? financialChartData : [{ month: 'N/D', receitas: 0, despesas: 0, saldo: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis fontSize={10} tickFormatter={(value) => `R$${value / 1000}k`} />
                      <RechartsTooltip formatter={(value: number, name: string) => [`R$ ${Number(value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Saldo']} />
                      <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}} />
                      <Bar dataKey="receitas" name="Receitas" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas" fill="#F44336" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Distribuição de Processos (Tipo)</h3>
                   {/* Botão de Exportar Removido */}
                </div>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={processTypeData.length > 0 ? processTypeData : emptyData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                        {(processTypeData.length > 0 ? processTypeData : emptyData).map((_entry, index) => (<Cell key={`cell-proc-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => `${value} processos`} />
                      <Legend wrapperStyle={{fontSize: "10px"}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Tipos de Cliente</h3>
                        {/* Botão de Exportar Removido */}
                    </div>
                    <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={clientTypeData.length > 0 ? clientTypeData : emptyData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                              {(clientTypeData.length > 0 ? clientTypeData : emptyData).map((_entry, index) => (<Cell key={`cell-cli-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                              </Pie>
                              <RechartsTooltip formatter={(value: number) => `${value} clientes`} />
                              <Legend wrapperStyle={{fontSize: "10px"}} />
                          </PieChart>
                      </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 h-96 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Status dos Processos</h3>
                        {/* Botão de Exportar Removido */}
                    </div>
                    <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={processStatusData.length > 0 ? processStatusData : emptyData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} >
                              {(processStatusData.length > 0 ? processStatusData : emptyData).map((_entry, index) => (<Cell key={`cell-stat-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                              </Pie>
                              <RechartsTooltip formatter={(value: number) => `${value} processos`} />
                              <Legend wrapperStyle={{fontSize: "10px"}} />
                          </PieChart>
                      </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default RelatoriosPage;