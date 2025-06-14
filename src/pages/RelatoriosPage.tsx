
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, AlertCircle, RefreshCw, TrendingUp, TrendingDown, Users, DollarSign, FileText, CheckSquare } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { startOfMonth, endOfMonth, format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
}

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  formatValue?: (value: number) => string;
  gradient: string;
}

const COLORS_STATUS_PROCESSOS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
const COLORS_STATUS_TAREFAS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, formatValue, gradient }) => {
  return (
    <Card className={`relative overflow-hidden ${gradient} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
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
          <h3 className="text-2xl font-bold">
            {typeof value === 'number' && formatValue ? formatValue(value) : value}
          </h3>
          <p className="text-white/80 text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const RelatoriosPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyFinancialData, setMonthlyFinancialData] = useState<MonthlyData[]>([]);
  const [processStatusData, setProcessStatusData] = useState<StatusData[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<StatusData[]>([]);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProcesses, setTotalProcesses] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError("Usuário não autenticado.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 1. Dados Financeiros Mensais (Últimos 6 meses)
      const financialPromises = [];
      for (let i = 5; i >= 0; i--) {
        const targetDate = subMonths(new Date(), i);
        const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');
        
        financialPromises.push(
          supabase
            .from('transacoes_financeiras')
            .select('tipo_transacao, valor, status_pagamento')
            .eq('user_id', user.id)
            .gte('data_transacao', startDate)
            .lte('data_transacao', endDate)
            .then(response => ({ 
              month: format(targetDate, 'MMM/yy', { locale: ptBR }), 
              data: response.data, 
              error: response.error 
            }))
        );
      }
      const financialResults = await Promise.all(financialPromises);
      const monthlyData: MonthlyData[] = financialResults.map(res => {
        if (res.error) throw new Error(`Erro financeiro: ${res.error.message}`);
        let receitas = 0;
        let despesas = 0;
        (res.data || []).forEach(t => {
          if (t.tipo_transacao === 'Receita' && (t.status_pagamento === 'Recebido' || t.status_pagamento === 'Pago')) {
            receitas += Number(t.valor || 0);
          } else if (t.tipo_transacao === 'Despesa' && t.status_pagamento === 'Pago') {
            despesas += Number(t.valor || 0);
          }
        });
        return { month: res.month, receitas, despesas, lucro: receitas - despesas };
      });
      setMonthlyFinancialData(monthlyData);

      // Calcular totais
      const totalRev = monthlyData.reduce((sum, data) => sum + data.receitas, 0);
      const totalExp = monthlyData.reduce((sum, data) => sum + data.despesas, 0);
      setTotalRevenue(totalRev);
      setTotalExpenses(totalExp);

      // 2. Status dos Processos
      const { data: processos, error: procError } = await supabase
        .from('processos')
        .select('status_processo')
        .eq('user_id', user.id);
      if (procError) throw procError;
      
      setTotalProcesses(processos?.length || 0);
      
      const procStatusCount: { [key: string]: number } = {};
      (processos || []).forEach(p => {
        const status = p.status_processo || 'Não Definido';
        procStatusCount[status] = (procStatusCount[status] || 0) + 1;
      });
      setProcessStatusData(
        Object.entries(procStatusCount).map(([name, value], index) => ({
          name,
          value,
          fill: COLORS_STATUS_PROCESSOS[index % COLORS_STATUS_PROCESSOS.length],
        }))
      );
      
      // 3. Status das Tarefas
      const { data: tarefas, error: taskError } = await supabase
        .from('tarefas')
        .select('status')
        .eq('user_id', user.id);
      if (taskError) throw taskError;
      const taskStatusCount: { [key: string]: number } = {};
      (tarefas || []).forEach(t => {
        const status = t.status || 'Não Definido';
        taskStatusCount[status] = (taskStatusCount[status] || 0) + 1;
      });
      setTaskStatusData(
        Object.entries(taskStatusCount).map(([name, value], index) => ({
          name,
          value,
          fill: COLORS_STATUS_TAREFAS[index % COLORS_STATUS_TAREFAS.length],
        }))
      );

      // 4. Contagem de Clientes Ativos
      const { count, error: clientError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status_cliente', 'Ativo');
      if (clientError) throw clientError;
      setActiveClientsCount(count || 0);

    } catch (err: any) {
      console.error("Erro ao buscar dados para relatórios:", err);
      setError(err.message || "Ocorreu um erro ao carregar os relatórios.");
    } finally {
      setIsLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    if (user) { 
        fetchData();
    } else {
        setIsLoading(false);
    }
  }, [user, fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
           <SharedPageHeader
              title="Relatórios Gerenciais"
              description="Visualize o desempenho e as métricas chave do seu escritório."
              pageIcon={<BarChart3 />}
              showActionButton={false}
            />
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="lg" />
              <p className="text-slate-600 font-medium">Carregando relatórios...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
            <SharedPageHeader
              title="Relatórios Gerenciais"
              description="Visualize o desempenho e as métricas chave do seu escritório."
              pageIcon={<BarChart3 />}
              showActionButton={false}
            />
            <Card className="border-red-200 bg-red-50 mt-8 shadow-lg">
                <CardHeader>
                <CardTitle className="text-red-700 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5"/>
                  Erro ao Carregar Relatórios
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchData} className="border-red-300 text-red-700 hover:bg-red-100">
                    <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
                </Button>
                </CardContent>
            </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
        <SharedPageHeader
          title="Relatórios Gerenciais"
          description="Visualize o desempenho e as métricas chave do seu escritório."
          pageIcon={<BarChart3 />}
          showActionButton={false}
        />

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8 mb-8">
          <MetricCard
            title="Receita Total (6 meses)"
            value={totalRevenue}
            icon={<DollarSign className="h-6 w-6" />}
            formatValue={formatCurrency}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            trend={8}
          />
          <MetricCard
            title="Clientes Ativos"
            value={activeClientsCount}
            icon={<Users className="h-6 w-6" />}
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={12}
          />
          <MetricCard
            title="Total de Processos"
            value={totalProcesses}
            icon={<FileText className="h-6 w-6" />}
            gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
            trend={5}
          />
          <MetricCard
            title="Lucro Líquido (6 meses)"
            value={totalRevenue - totalExpenses}
            icon={<TrendingUp className="h-6 w-6" />}
            formatValue={formatCurrency}
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={15}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Gráfico Financeiro */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Visão Financeira
              </CardTitle>
              <CardDescription className="text-slate-200">
                Receitas vs. Despesas nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFinancialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                      tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Lucro'
                      ]}
                      labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
                    <Bar dataKey="lucro" fill="#6366f1" radius={[4, 4, 0, 0]} name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status dos Processos */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Status dos Processos
              </CardTitle>
              <CardDescription className="text-indigo-200">
                Distribuição atual dos seus processos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px]">
                {processStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={processStatusData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        labelLine={false} 
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {processStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value, 'Processos']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-center">Sem dados de processos disponíveis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status das Tarefas */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                Status das Tarefas
              </CardTitle>
              <CardDescription className="text-purple-200">
                Distribuição atual das suas tarefas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px]">
                {taskStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={taskStatusData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        labelLine={false} 
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value, 'Tarefas']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-center">Sem dados de tarefas disponíveis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Resumo */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">Resumo Executivo</CardTitle>
              <CardDescription className="text-slate-300 text-center">
                Principais métricas do período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-sm text-slate-300">Receita Total</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl font-bold text-red-400">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-sm text-slate-300">Gastos Totais</div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold text-yellow-400">
                  {formatCurrency(totalRevenue - totalExpenses)}
                </div>
                <div className="text-sm text-slate-300">Lucro Líquido (6 meses)</div>
                <div className="text-xs text-slate-400 mt-1">
                  Margem: {totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{activeClientsCount}</div>
                  <div className="text-xs text-slate-400">Clientes Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{totalProcesses}</div>
                  <div className="text-xs text-slate-400">Total Processos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RelatoriosPage;
