// src/components/dashboard/FinanceiroContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, List, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type Transacao = Database['public']['Tables']['transacoes_financeiras']['Row'];

interface FinanceiroStats {
  receitaMes: number;
  despesaMes: number;
  saldoMes: number;
  proximasReceitas: Transacao[];
  proximasDespesas: Transacao[];
}

const FinanceiroContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FinanceiroStats>({
    receitaMes: 0,
    despesaMes: 0,
    saldoMes: 0,
    proximasReceitas: [],
    proximasDespesas: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceiroData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const inicioMes = format(startOfMonth(today), 'yyyy-MM-dd');
      const fimMes = format(endOfMonth(today), 'yyyy-MM-dd');

      const { data: transacoesMes, error: transError } = await supabase
        .from('transacoes_financeiras')
        .select('tipo_transacao, valor, data_transacao, descricao, status_pagamento, id')
        .eq('user_id', user.id)
        .gte('data_transacao', inicioMes)
        .lte('data_transacao', fimMes);

      if (transError) throw transError;

      let receitaMes = 0;
      let despesaMes = 0;
      (transacoesMes || []).forEach(t => {
        if (t.tipo_transacao === 'Receita' && (t.status_pagamento === 'Recebido' || t.status_pagamento === 'Pago')) {
          receitaMes += Number(t.valor || 0);
        } else if (t.tipo_transacao === 'Despesa' && t.status_pagamento === 'Pago') {
          despesaMes += Number(t.valor || 0);
        }
      });

      // Buscar próximas 3 receitas pendentes (do mês atual ou futuras)
      const { data: proximasReceitasData, error: receitasPendentesError } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_transacao', 'Receita')
        .eq('status_pagamento', 'Pendente')
        .gte('data_transacao', format(today, 'yyyy-MM-dd'))
        .order('data_transacao', { ascending: true })
        .limit(3);
      if (receitasPendentesError) throw receitasPendentesError;

      // Buscar próximas 3 despesas pendentes (do mês atual ou futuras)
      const { data: proximasDespesasData, error: despesasPendentesError } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .eq('tipo_transacao', 'Despesa')
        .eq('status_pagamento', 'Pendente')
        .gte('data_transacao', format(today, 'yyyy-MM-dd'))
        .order('data_transacao', { ascending: true })
        .limit(3);
      if (despesasPendentesError) throw despesasPendentesError;
      
      setStats({
        receitaMes,
        despesaMes,
        saldoMes: receitaMes - despesaMes,
        proximasReceitas: proximasReceitasData || [],
        proximasDespesas: proximasDespesasData || [],
      });

    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados financeiros.");
      toast({
        title: "Erro ao carregar resumo financeiro",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFinanceiroData();
  }, [fetchFinanceiroData]);

  const renderTransacaoItem = (transacao: Transacao) => (
    <li key={transacao.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="text-xs font-medium text-gray-700 truncate w-40" title={transacao.descricao}>{transacao.descricao}</p>
        <p className="text-xs text-gray-500">
          {format(parseISO(transacao.data_transacao), "dd/MM/yy", { locale: ptBR })}
        </p>
      </div>
      <Badge variant={transacao.tipo_transacao === 'Receita' ? "default" : "destructive"} className={cn(
        "text-xs",
        transacao.tipo_transacao === 'Receita' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
      )}>
        R$ {Number(transacao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Badge>
    </li>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i}><CardHeader><CardTitle><Spinner size="sm"/></CardTitle></CardHeader><CardContent className="h-16"></CardContent></Card>
          ))}
        </div>
        <Card><CardHeader><CardTitle>Próximas Contas a Receber</CardTitle></CardHeader><CardContent className="h-32 flex justify-center items-center"><Spinner /></CardContent></Card>
        <Card><CardHeader><CardTitle>Próximas Contas a Pagar</CardTitle></CardHeader><CardContent className="h-32 flex justify-center items-center"><Spinner /></CardContent></Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-red-50">
        <CardHeader>
          <CardTitle className="text-destructive-foreground flex items-center"><AlertCircle className="mr-2"/>Erro no Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground/90">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchFinanceiroData} className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {stats.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500">Confirmadas no mês atual</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Despesa do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {stats.despesaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
             <p className="text-xs text-gray-500">Confirmadas no mês atual</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo do Mês</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.saldoMes >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldoMes >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {stats.saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500">Receitas - Despesas (confirmadas)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <List className="mr-2 h-5 w-5 text-green-500"/>
              Próximas Contas a Receber (Pendentes)
            </CardTitle>
            <CardDescription className="text-xs">Próximas 3 receitas com status "Pendente".</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.proximasReceitas.length > 0 ? (
              <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                {stats.proximasReceitas.map(renderTransacaoItem)}
              </ul>
            ) : (
              <p className="text-sm text-center text-gray-500 py-4">Nenhuma receita pendente encontrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <List className="mr-2 h-5 w-5 text-red-500"/>
              Próximas Contas a Pagar (Pendentes)
            </CardTitle>
             <CardDescription className="text-xs">Próximas 3 despesas com status "Pendente".</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.proximasDespesas.length > 0 ? (
              <ul className="space-y-1 max-h-48 overflow-y-auto pr-2">
                {stats.proximasDespesas.map(renderTransacaoItem)}
              </ul>
            ) : (
              <p className="text-sm text-center text-gray-500 py-4">Nenhuma despesa pendente encontrada.</p>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="mt-6 text-center">
        <Button asChild variant="default" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
          <Link to="/financeiro">
            Acessar Controle Financeiro Completo
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FinanceiroContent;
