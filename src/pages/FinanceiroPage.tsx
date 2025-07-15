// src/pages/FinanceiroPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PinLock from '@/components/PinLock';
import { BadgePercent, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TransacaoListAsCards from '@/components/financeiro/TransacaoListAsCards';
import TransacaoTable from '@/components/financeiro/TransacaoTable';
import TransacaoModal from '@/components/financeiro/TransacaoModal';
import FinanceiroStatsCards from '@/components/financeiro/FinanceiroStatsCards';
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar';
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
            // Verificar se já mostrou o popup hoje
            const userSpecificToastKey = `finance_pin_disabled_toast_${user.id}`;
            const lastToastDate = localStorage.getItem(userSpecificToastKey);
            const today = new Date().toDateString();
            
            if (lastToastDate !== today) {
                toast({
                    title: "Acesso ao Financeiro",
                    description: "Você ainda não configurou um PIN para esta seção. Considere adicionar um em Configurações > Segurança para maior privacidade.",
                    duration: 7000,
                    className: "bg-blue-50 border-blue-200 text-blue-700",
                });
                localStorage.setItem(userSpecificToastKey, today);
            }
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
    if (showLoadingSpinner) setIsLoadingTransactions(true);
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
      if (showLoadingSpinner) setIsLoadingTransactions(false);
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

  const receitasConfirmadas = transactions
    .filter(t => t.tipo_transacao === "Receita" && (t.status_pagamento === "Recebido" || t.status_pagamento === "Pago"))
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesasConfirmadas = transactions
    .filter(t => t.tipo_transacao === "Despesa" && t.status_pagamento === "Pago")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const saldoAtual = receitasConfirmadas - despesasConfirmadas;

  const receitasPendentes = transactions
    .filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesasPendentes = transactions
    .filter(t => t.tipo_transacao === "Despesa" && t.status_pagamento === "Pendente")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const stats = {
    receitasConfirmadas,
    despesasConfirmadas,
    saldoAtual,
    receitasPendentes,
    despesasPendentes
  };

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

  const handleManualRefresh = () => {
    fetchTransactions(true);
  };

  const handleOpenModal = () => {
    setCurrentTransaction(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  const isLoadingCombined = isLoadingAccess || isLoadingTransactions || isRefreshingManually;

  if (isLoadingAccess) {
    return ( 
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      </AdminLayout> 
    );
  }

  if (!user || (pinCheckResult && !pinCheckResult.verified && !pinCheckResult.pinNotSet) ) {
    if (!user) {
        return ( 
          <AdminLayout>
            <div className="flex items-center justify-center min-h-[calc(100vh-150px)] p-4">
              <Alert variant="destructive" className="max-w-lg">
                  <ShieldAlert className="h-5 w-5" />
                  <AlertTitle>Autenticação Necessária</AlertTitle>
                  <AlertDescription>Por favor, faça login para acessar esta página.</AlertDescription>
              </Alert>
            </div>
          </AdminLayout> 
        );
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
  
  if (isLoadingCombined && !transactions.length && !isRefreshingManually && pinCheckResult?.verified) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <span className="text-gray-600 mt-3 block text-center">Carregando dados financeiros...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleSaveTransaction = async (transacaoData: any): Promise<boolean> => {
    if (!user || isLoadingTransactions) {
      toast({ title: "Aguarde ou usuário não autenticado", variant: "destructive" });
      return false;
    }
    setIsLoadingTransactions(true);

    const transactionDataForSupabase = {
      user_id: user.id,
      tipo_transacao: transacaoData.tipo as 'Receita' | 'Despesa',
      descricao: transacaoData.descricao,
      valor: parseFloat(transacaoData.valor),
      categoria: transacaoData.categoria,
      data_transacao: transacaoData.data_transacao,
      status_pagamento: transacaoData.status_pagamento as TransacaoSupabase['status_pagamento'],
      cliente_associado_id: transacaoData.cliente_associado_id || null,
      processo_associado_id: transacaoData.processo_associado_id || null,
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
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  return (
    <AdminLayout>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          <SharedPageHeader
              title="Controle Financeiro"
              description="Gerencie suas receitas, despesas e o fluxo de caixa do seu escritório."
              pageIcon={<BadgePercent />}
              isLoading={isLoadingCombined}
              showActionButton={false}
          />

          {pinCheckResult?.pinNotSet && (
              <Alert variant="default" className="mb-6 text-xs bg-blue-100/60 backdrop-blur-sm border-blue-200/50 text-blue-700 max-w-md animate-slide-in">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle className="font-medium">PIN de Segurança</AlertTitle>
                  <AlertDescription>
                      Para maior segurança, configure um PIN para esta seção em Configurações {'>'} Segurança.
                  </AlertDescription>
              </Alert>
          )}
            
          <FinanceiroStatsCards stats={stats} />

          <FinanceiroSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddTransaction={handleOpenModal}
            onRefresh={handleManualRefresh}
            isLoading={isLoadingCombined}
          />
            
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

          <TransacaoModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTransaction}
            transacao={currentTransaction}
          />
        </div>
      </main>
    </AdminLayout>
  );
};

export default FinanceiroPage;
