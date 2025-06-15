
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
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

const COLORS_STATUS_PROCESSOS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
const COLORS_STATUS_TAREFAS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

export const useRelatoriosData = () => {
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
          // Normalizar tipo_transacao para lidar com dados inconsistentes
          const tipoTransacao = t.tipo_transacao || '';
          const statusPagamento = t.status_pagamento || '';
          const valor = Number(t.valor || 0);
          
          console.log('Processando transação:', { tipoTransacao, statusPagamento, valor });
          
          // Se o tipo está vazio mas tem valor positivo e status de pagamento, tentar inferir o tipo
          if (!tipoTransacao && valor > 0 && (statusPagamento === 'Recebido' || statusPagamento === 'Pago')) {
            // Assumir que valores "Recebidos" são receitas e "Pagos" são despesas
            if (statusPagamento === 'Recebido') {
              receitas += valor;
            } else if (statusPagamento === 'Pago') {
              despesas += Math.abs(valor); // Garantir que despesas sejam positivas
            }
          } else {
            // Lógica normal
            if ((tipoTransacao === 'Receita' || tipoTransacao === 'receita') && (statusPagamento === 'Recebido' || statusPagamento === 'Pago')) {
              receitas += Math.abs(valor); // Garantir que receitas sejam positivas
            } else if ((tipoTransacao === 'Despesa' || tipoTransacao === 'despesa') && statusPagamento === 'Pago') {
              despesas += Math.abs(valor); // Garantir que despesas sejam positivas
            }
          }
        });
        console.log(`Mês ${res.month}: Receitas=${receitas}, Despesas=${despesas}`);
        // Lucro pode ser negativo se despesas > receitas
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

  return {
    isLoading,
    error,
    monthlyFinancialData,
    processStatusData,
    taskStatusData,
    activeClientsCount,
    totalRevenue,
    totalExpenses,
    totalProcesses,
    fetchData
  };
};
