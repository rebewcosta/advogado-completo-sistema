// src/pages/FinanceiroPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PinLock from '@/components/PinLock';
import {
  Search, Plus, Filter, DollarSign, TrendingUp, TrendingDown,
  FileText as FileTextIcon, X, Loader2, KeyRound, AlertCircle,
  ShieldAlert, BadgePercent, RefreshCw, Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransacaoListAsCards from '@/components/financeiro/TransacaoListAsCards';
import TransacaoTable from '@/components/financeiro/TransacaoTable';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import type { Database } from '@/integrations/supabase/types';

type TransacaoSupabase = Database['public']['Tables']['transacoes_financeiras']['Row'];

const PAGE_NAME_FOR_PIN_SESSION_STORAGE = "Financeiro_UserPinAccess";

const FinanceiroPage = () => {
  const { user, session } = useAuth();
  const [pinCheckResult, setPinCheckResult] = useState<{
    verified: boolean;
    pinNotSet?: boolean;
    message?: string;
  } | null>(null);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  const [transactions, setTransactions] = useState<TransacaoSupabase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransacaoSupabase | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAccessOrPinStatus = async () => {
      if (!user || !session) {
        setIsLoadingAccess(false);
        setPinCheckResult({ verified: false, message: "Usuário não autenticado. Por favor, faça login." });
        return;
      }
      const userSpecificSessionKey = `${PAGE_NAME_FOR_PIN_SESSION_STORAGE}_${user.id}`;
      if (sessionStorage.getItem(userSpecificSessionKey) === 'true') {
        setPinCheckResult({ verified: true, pinNotSet: false });
        setIsLoadingAccess(false);
        return;
      }
      setIsLoadingAccess(true);
      try {
        const { data, error: funcError } = await supabase.functions.invoke('verify-finance-pin');
        if (funcError) throw funcError;
        if (data && data.error) throw new Error(data.error);
        setPinCheckResult(data);
        if (data.pinNotSet) {
            toast({
                title: "Acesso ao Financeiro",
                description: "Você ainda não configurou um PIN para esta seção. Considere adicionar um em Configurações > Segurança para maior privacidade.",
                duration: 7000,
                className: "bg-blue-50 border-blue-200 text-blue-700",
            });
        }
      } catch (err: any) {
        console.error("Erro ao verificar status do PIN na FinanceiroPage:", err);
        toast({ title: "Erro de Verificação", description: err.message || "Ocorreu um erro.", variant: "destructive" });
        setPinCheckResult({ verified: false, message: err.message || "Erro desconhecido." });
      } finally {
        setIsLoadingAccess(false);
      }
    };
    checkAccessOrPinStatus();
  }, [user, session, toast]);

  const fetchTransactions = useCallback(async (showLoadingSpinner = true) => {
    if (!user || !pinCheckResult?.verified) {
      setTransactions([]);
      if (showLoadingSpinner) setIsLoadingTransactions(false);
      setIsRefreshingManually(false);
      return;
    }
    if (showLoadingSpinner) setIsLoadingTransactions(true); // Usar setIsLoadingTransactions aqui
    setIsRefreshingManually(true);
    try {
      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .order('data_transacao', { ascending: false });

      if (error) {
        throw error;
      }
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar transações",
        description: error.message || "Não foi possível carregar os dados financeiros.",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      if (showLoadingSpinner) setIsLoadingTransactions(false); // Usar setIsLoadingTransactions aqui
      setIsRefreshingManually(false);
    }
  }, [user, pinCheckResult?.verified, toast]);

  useEffect(() => {
    if (pinCheckResult?.verified) {
      fetchTransactions();
    }
  }, [pinCheckResult?.verified, fetchTransactions]);
  
  const handlePinSuccessfullyVerified = () => {
    setPinCheckResult({ verified: true, pinNotSet: false });
    if(user) {
        sessionStorage.setItem(`${PAGE_NAME_FOR_PIN_SESSION_STORAGE}_${user.id}`, 'true');
    }
  };
  
  const filteredTransactions = transactions.filter(transaction =>
    (transaction.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajustar cálculo do saldo para não incluir transações pendentes
  const receitasConfirmadas = transactions
    .filter(t => t.tipo_transacao === "Receita" && (t.status_pagamento === "Recebido" || t.status_pagamento === "Pago"))
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesasConfirmadas = transactions
    .filter(t => t.tipo_transacao === "Despesa" && t.status_pagamento === "Pago")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const saldoAtual = receitasConfirmadas - despesasConfirmadas;

  // Calcular totais de transações pendentes
  const receitasPendentes = transactions
    .filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesasPendentes = transactions
    .filter(t => t.tipo_transacao === "Despesa" && t.status_pagamento === "Pendente")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const receitas = transactions
    .filter(t => t.tipo_transacao === "Receita")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesas = transactions
    .filter(t => t.tipo_transacao === "Despesa")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const saldo = receitas - despesas;

  const handleEditTransaction = (transaction: TransacaoSupabase) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user || isLoadingTransactions) return;
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete && window.confirm("Tem certeza que deseja excluir esta transação?")) {
      setIsLoadingTransactions(true);
      try {
        const { error } = await supabase
          .from('transacoes_financeiras')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        fetchTransactions(false);
        toast({
          title: "Transação excluída",
          description: "A transação foi removida com sucesso.",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao excluir",
          description: error.message || "Não foi possível excluir a transação.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTransactions(false);
      }
    }
  };

  const handleAddOrUpdateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isLoadingTransactions) {
        toast({ title: "Aguarde ou usuário não autenticado", variant: "destructive" });
        return;
    }
    setIsLoadingTransactions(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const formValues = Object.fromEntries(formData.entries()) as { [key: string]: string };

    const transactionDataForSupabase = {
      user_id: user.id,
      tipo_transacao: formValues.tipo as 'Receita' | 'Despesa',
      descricao: formValues.descricao,
      valor: parseFloat(formValues.valor),
      categoria: formValues.categoria,
      data_transacao: formValues.data,
      status_pagamento: formValues.status as TransacaoSupabase['status_pagamento'],
    };

    try {
      if (currentTransaction) {
        const { data: updatedData, error } = await supabase
          .from('transacoes_financeiras')
          .update(transactionDataForSupabase)
          .eq('id', currentTransaction.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        toast({ title: "Transação atualizada", description: "Os dados da transação foram atualizados." });
      } else {
        const { data: insertedData, error } = await supabase
          .from('transacoes_financeiras')
          .insert(transactionDataForSupabase)
          .select()
          .single();
        
        if (error) throw error;
        toast({ title: "Transação adicionada", description: "A nova transação foi registrada." });
      }
      fetchTransactions(false);
      setIsModalOpen(false);
      setCurrentTransaction(null);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
        setIsLoadingTransactions(false);
    }
  };
  
  const handleManualRefresh = () => {
    fetchTransactions(true);
  };

  const isLoadingCombined = isLoadingAccess || isLoadingTransactions || isRefreshingManually;

  if (isLoadingAccess) {
    return ( <AdminLayout><div className="flex items-center justify-center min-h-[calc(100vh-150px)]"><Loader2 className="h-12 w-12 animate-spin text-lawyer-primary" /></div></AdminLayout> );
  }

  if (!user || (pinCheckResult && !pinCheckResult.verified && !pinCheckResult.pinNotSet) ) {
    if (!user) {
        return ( <AdminLayout><div className="flex items-center justify-center min-h-[calc(100vh-150px)] p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldAlert className="h-5 w-5" />
                <AlertTitle>Autenticação Necessária</AlertTitle>
                <AlertDescription>Por favor, faça login para acessar esta página.</AlertDescription>
            </Alert>
        </div></AdminLayout> );
    }
    return (
      <AdminLayout>
        <PinLock
          onPinVerified={handlePinSuccessfullyVerified}
          pageName={`${PAGE_NAME_FOR_PIN_SESSION_STORAGE}_${user.id}`}
        />
      </AdminLayout>
    );
  }
  
  if (isLoadingCombined && !transactions.length && !isRefreshingManually && pinCheckResult?.verified) { // Adicionado pinCheckResult.verified
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-lawyer-primary" />
          <span className="text-gray-500 mt-3">Carregando dados financeiros...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <SharedPageHeader
            title="Controle Financeiro"
            description="Gerencie suas receitas, despesas e o fluxo de caixa do seu escritório."
            pageIcon={<BadgePercent />}
            actionButtonText="Nova Transação"
            onActionButtonClick={() => { setCurrentTransaction(null); setIsModalOpen(true); }}
            isLoading={isLoadingCombined}
        />

        {pinCheckResult?.pinNotSet && (
            <Alert variant="default" className="mb-6 text-xs bg-blue-50 border-blue-200 text-blue-700 max-w-md">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="font-medium">PIN de Segurança</AlertTitle>
                <AlertDescription>
                    Para maior segurança, configure um PIN para esta seção em Configurações {'>'} Segurança.
                </AlertDescription>
            </Alert>
        )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Receitas Confirmadas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-xl font-bold text-green-600">
                  R$ {receitasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Despesas Confirmadas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-xl font-bold text-red-600">
                  R$ {despesasConfirmadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
                <DollarSign className={`h-4 w-4 ${saldoAtual >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent className="pb-4">
                <div className={`text-xl font-bold ${saldoAtual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Receitas Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-xl font-bold text-yellow-600">
                  R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Despesas Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-xl font-bold text-orange-600">
                  R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                        type="text"
                        placeholder="Buscar por descrição, categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Filter className="mr-1.5 h-3.5 w-3.5" />
                            Filtrar
                        </Button>
                         <Button 
                            onClick={handleManualRefresh} 
                            variant="outline" 
                            size="sm" 
                            disabled={isLoadingCombined} 
                            className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingCombined ? 'animate-spin' : ''}`} />
                            {isLoadingCombined ? 'Atualizando...' : 'Atualizar Transações'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
          
        <div className="hidden md:block">
            <TransacaoTable
                transacoes={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
            />
        </div>
        <div className="md:hidden">
            <TransacaoListAsCards
                transacoes={filteredTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
            />
        </div>

          {isModalOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <CardHeader className="p-4 border-b sticky top-0 bg-white z-10">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">{currentTransaction ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                        setIsModalOpen(false);
                        setCurrentTransaction(null);
                        }}
                        className="h-7 w-7 text-gray-500 hover:text-gray-700 -mr-1 -mt-1"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <form onSubmit={handleAddOrUpdateTransaction} className="flex-grow overflow-y-auto">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transação</Label>
                      <div className="flex">
                        <label className="inline-flex items-center mr-6">
                          <input
                            type="radio"
                            name="tipo"
                            value="Receita"
                            defaultChecked={currentTransaction?.tipo_transacao === "Receita" || !currentTransaction}
                            className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                          />
                          <span className="text-sm text-gray-700">Receita</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="tipo"
                            value="Despesa"
                            defaultChecked={currentTransaction?.tipo_transacao === "Despesa"}
                            className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                          />
                          <span className="text-sm text-gray-700">Despesa</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="descricao_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Descrição</Label>
                      <Input
                        type="text"
                        id="descricao_modal_fin"
                        name="descricao"
                        defaultValue={currentTransaction?.descricao || ''}
                        required
                        className="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</Label>
                      <Input
                        type="number"
                        id="valor_modal_fin"
                        name="valor"
                        min="0"
                        step="0.01"
                        defaultValue={currentTransaction?.valor ? String(currentTransaction.valor) : ''}
                        required
                        className="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoria_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Categoria</Label>
                        <select
                          id="categoria_modal_fin"
                          name="categoria"
                          defaultValue={currentTransaction?.categoria || 'Honorários'}
                          className="w-full px-3 py-2.5 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white text-sm"
                        >
                          <option value="Honorários">Honorários</option>
                          <option value="Consultas">Consultas</option>
                          <option value="Custas Processuais">Custas Processuais</option>
                          <option value="Infraestrutura">Infraestrutura</option>
                          <option value="Software">Software</option>
                          <option value="Salários">Salários</option>
                          <option value="Impostos">Impostos</option>
                          <option value="Suprimentos">Suprimentos</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="data_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Data</Label>
                        <Input
                          type="date"
                          id="data_modal_fin"
                          name="data"
                          defaultValue={currentTransaction?.data_transacao || new Date().toISOString().split('T')[0]}
                          required
                          className="w-full px-3 py-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="status_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
                        <select
                          id="status_modal_fin"
                          name="status"
                          defaultValue={currentTransaction?.status_pagamento || 'Pendente'}
                          className="w-full px-3 py-2.5 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white text-sm"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Pago">Pago</option>
                          <option value="Recebido">Recebido</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                   <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-gray-50 z-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentTransaction(null);
                      }}
                      className="text-gray-700 hover:bg-gray-100 border-gray-300"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white" disabled={isLoadingTransactions}>
                      {isLoadingTransactions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {currentTransaction ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
    </AdminLayout>
  );
};

export default FinanceiroPage;
