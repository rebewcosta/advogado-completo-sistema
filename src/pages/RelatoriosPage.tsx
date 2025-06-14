import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, AlertCircle, RefreshCw, FileText, CheckSquare } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MetricsCardsSection from '@/components/relatorios/MetricsCardsSection';
import FinancialChart from '@/components/relatorios/FinancialChart';
import StatusPieChart from '@/components/relatorios/StatusPieChart';
import ExecutiveSummary from '@/components/relatorios/ExecutiveSummary';

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

const COLORS_STATUS_PROCESSOS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
const COLORS_STATUS_TAREFAS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

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

        <MetricsCardsSection
          totalRevenue={totalRevenue}
          activeClientsCount={activeClientsCount}
          totalProcesses={totalProcesses}
          totalExpenses={totalExpenses}
          formatCurrency={formatCurrency}
        />

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <FinancialChart 
            monthlyFinancialData={monthlyFinancialData}
            formatCurrency={formatCurrency}
          />

          <StatusPieChart
            title="Status dos Processos"
            description="Distribuição atual dos seus processos"
            data={processStatusData}
            icon={<FileText className="mr-2 h-5 w-5" />}
            gradient="bg-gradient-to-r from-indigo-600 to-indigo-700"
            emptyMessage="Sem dados de processos disponíveis"
          />

          <StatusPieChart
            title="Status das Tarefas"
            description="Distribuição atual das suas tarefas"
            data={taskStatusData}
            icon={<CheckSquare className="mr-2 h-5 w-5" />}
            gradient="bg-gradient-to-r from-purple-600 to-purple-700"
            emptyMessage="Sem dados de tarefas disponíveis"
          />

          <ExecutiveSummary
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            activeClientsCount={activeClientsCount}
            totalProcesses={totalProcesses}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default RelatoriosPage;
