// src/pages/RelatoriosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
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
}

interface StatusData {
  name: string;
  value: number;
  fill: string;
}

const COLORS_STATUS_PROCESSOS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#6b7280']; // Azul, Verde, Laranja, Vermelho, Cinza
const COLORS_STATUS_TAREFAS = ['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7']; // Amarelo, Verde, Azul, Vermelho, Roxo


const RelatoriosPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyFinancialData, setMonthlyFinancialData] = useState<MonthlyData[]>([]);
  const [processStatusData, setProcessStatusData] = useState<StatusData[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<StatusData[]>([]);
  const [activeClientsCount, setActiveClientsCount] = useState(0);


  const fetchData = useCallback(async () => { // Adicionado useCallback
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
        return { month: res.month, receitas, despesas };
      });
      setMonthlyFinancialData(monthlyData);

      // 2. Status dos Processos
      const { data: processos, error: procError } = await supabase
        .from('processos')
        .select('status_processo')
        .eq('user_id', user.id);
      if (procError) throw procError;
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
        .select('status') // <<< CORRIGIDO AQUI
        .eq('user_id', user.id);
      if (taskError) throw taskError;
      const taskStatusCount: { [key: string]: number } = {};
      (tarefas || []).forEach(t => {
        const status = t.status || 'Não Definido'; // <<< CORRIGIDO AQUI
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
  // Adicionada a dependência 'user' para useCallback
  }, [user]); 

  useEffect(() => {
    // Adicionado if (user) para evitar chamada desnecessária
    if (user) { 
        fetchData();
    } else {
        // Se não houver usuário, parar o loading e indicar que não há dados ou erro de autenticação
        setIsLoading(false);
        // setError("Usuário não autenticado. Não é possível carregar relatórios."); 
        // Você pode optar por mostrar um erro ou simplesmente nada
    }
  }, [user, fetchData]); // fetchData agora é uma dependência estável

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
           <SharedPageHeader
              title="Relatórios Gerenciais"
              description="Visualize o desempenho e as métricas chave do seu escritório."
              pageIcon={<BarChart3 />}
              showActionButton={false}
            />
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Spinner size="lg" />
            <p className="ml-2 text-gray-500">Carregando relatórios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !isLoading) { // Adicionado !isLoading para não mostrar erro durante o carregamento inicial
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
            <SharedPageHeader
              title="Relatórios Gerenciais"
              description="Visualize o desempenho e as métricas chave do seu escritório."
              pageIcon={<BarChart3 />}
              showActionButton={false}
            />
            <Card className="border-destructive bg-red-50 mt-6">
                <CardHeader>
                <CardTitle className="text-destructive-foreground flex items-center"><AlertCircle className="mr-2"/>Erro ao Carregar Relatórios</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-destructive-foreground/90">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchData} className="mt-3">
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
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
          title="Relatórios Gerenciais"
          description="Visualize o desempenho e as métricas chave do seu escritório."
          pageIcon={<BarChart3 />}
          showActionButton={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Visão Financeira (Últimos 6 Meses)</CardTitle>
                    <CardDescription className="text-xs">Receitas vs. Despesas confirmadas.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFinancialData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" fontSize={10} />
                        <YAxis fontSize={10} tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip 
                            formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name === 'receitas' ? 'Receitas' : 'Despesas' ]} 
                            labelStyle={{fontSize: 12, fontWeight: 'bold'}}
                            itemStyle={{fontSize: 12}}
                        />
                        <Legend wrapperStyle={{fontSize: 11}}/>
                        <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Status dos Processos</CardTitle>
                    <CardDescription className="text-xs">Distribuição atual dos seus processos.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                {processStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={processStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                            {processStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string) => [value, name]} />
                            <Legend iconSize={10} wrapperStyle={{fontSize: 11}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    ) : (<p className="text-sm text-center text-gray-500 py-10">Sem dados de processos.</p>)}
                </CardContent>
            </Card>
            
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Status das Tarefas</CardTitle>
                    <CardDescription className="text-xs">Distribuição atual das suas tarefas.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                {taskStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                            {taskStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string) => [value, name]} />
                            <Legend iconSize={10} wrapperStyle={{fontSize: 11}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    ) : (<p className="text-sm text-center text-gray-500 py-10">Sem dados de tarefas.</p>)}
                </CardContent>
            </Card>

            <Card className="shadow-sm flex flex-col justify-center items-center">
                 <CardHeader className="items-center pb-2">
                    <CardTitle className="text-base">Clientes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-lawyer-primary">{activeClientsCount}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RelatoriosPage;