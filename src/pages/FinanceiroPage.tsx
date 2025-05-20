// src/pages/FinanceiroPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PinLock from '@/components/PinLock';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter,
  DollarSign, TrendingUp, TrendingDown, FileText, X, Loader2, KeyRound, AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types'; // Importar tipos do Supabase

// Definindo o tipo para uma transação como ela virá do Supabase
type TransacaoSupabase = Database['public']['Tables']['transacoes_financeiras']['Row'];

// Definindo o tipo para os dados do formulário
interface TransacaoFormData {
  tipo: 'Receita' | 'Despesa';
  descricao: string;
  valor: number;
  categoria: string;
  data_transacao: string; // Formato YYYY-MM-DD
  status_pagamento: 'Pendente' | 'Pago' | 'Recebido' | 'Atrasado'; // Ajustar conforme seus status
  cliente_nome_temp?: string; // Campo temporário para o nome do cliente, se não for usar IDs
}


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

  const [transactions, setTransactions] = useState<TransacaoSupabase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<TransacaoSupabase | null>(null);
  const { toast } = useToast();

  // Hook de Autenticação e PIN (igual ao anterior)
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

  // Função para buscar transações do Supabase
  const fetchTransactions = useCallback(async () => {
    if (!user || !pinCheckResult?.verified) {
      setTransactions([]);
      return;
    }
    setIsLoadingTransactions(true);
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
      setIsLoadingTransactions(false);
    }
  }, [user, pinCheckResult?.verified, toast]);

  // useEffect para buscar transações quando o acesso for verificado
  useEffect(() => {
    if (pinCheckResult?.verified) {
      fetchTransactions();
    }
  }, [pinCheckResult?.verified, fetchTransactions]);
  
  // REMOVIDO: useEffects que usavam localStorage

  const handlePinSuccessfullyVerified = () => {
    setPinCheckResult({ verified: true, pinNotSet: false });
    if(user) {
        sessionStorage.setItem(`${PAGE_NAME_FOR_PIN_SESSION_STORAGE}_${user.id}`, 'true');
    }
    // fetchTransactions(); // Agora será chamado pelo useEffect acima
  };
  
  const filteredTransactions = transactions.filter(transaction =>
    (transaction.descricao && transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    // Adicionar busca por outros campos se necessário, ex: categoria.
    // Se você adicionar cliente_nome_temp à tabela ou fizer join, pode buscar por ele também.
    (transaction.categoria && transaction.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cálculos de resumo (ajustar se necessário, especialmente 'valor')
  const receitas = transactions
    .filter(t => t.tipo_transacao === "Receita") // Usar nome da coluna do DB
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesas = transactions
    .filter(t => t.tipo_transacao === "Despesa") // Usar nome da coluna do DB
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const saldo = receitas - despesas;

  const receitasPendentes = transactions
    .filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente") // Usar nome da coluna do DB
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const handleEditTransaction = (transaction: TransacaoSupabase) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    const transactionToDelete = transactions.find(t => t.id === id);
    if (transactionToDelete && window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const { error } = await supabase
          .from('transacoes_financeiras')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
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
      }
    }
  };

  const handleAddOrUpdateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Usuário não autenticado", variant: "destructive" });
        return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const formValues = Object.fromEntries(formData.entries()) as { [key: string]: string };

    // Mapeamento e conversão de dados do formulário para o formato do Supabase
    const transactionDataForSupabase = {
      user_id: user.id,
      tipo_transacao: formValues.tipo as 'Receita' | 'Despesa', // tipo_transacao na tabela
      descricao: formValues.descricao,
      valor: parseFloat(formValues.valor),
      categoria: formValues.categoria,
      data_transacao: formValues.data, // data_transacao na tabela
      status_pagamento: formValues.status as TransacaoSupabase['status_pagamento'], // status_pagamento na tabela
      // cliente_associado_id: null, // Manter null por enquanto
      // processo_associado_id: null, // Manter null por enquanto
      // A coluna 'transacoes_financeiras' (text) não está no formulário, será default ou null no DB.
    };

    try {
      if (currentTransaction) { // Atualizar transação existente
        const { data: updatedData, error } = await supabase
          .from('transacoes_financeiras')
          .update(transactionDataForSupabase)
          .eq('id', currentTransaction.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setTransactions(prev => prev.map(t => t.id === currentTransaction.id ? updatedData : t));
        toast({ title: "Transação atualizada", description: "Os dados da transação foram atualizados." });

      } else { // Adicionar nova transação
        const { data: insertedData, error } = await supabase
          .from('transacoes_financeiras')
          .insert(transactionDataForSupabase)
          .select()
          .single();
        
        if (error) throw error;

        setTransactions(prev => [insertedData, ...prev].sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime()));
        toast({ title: "Transação adicionada", description: "A nova transação foi registrada." });
      }
      setIsModalOpen(false);
      setCurrentTransaction(null);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar transação",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    }
  };


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
  
  return (
    <AdminLayout>
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Controle Financeiro</h1>
                     {pinCheckResult?.pinNotSet && (
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                            <ShieldAlert className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>Para maior segurança, configure um PIN para esta seção em Configurações {'>'} Segurança.</span>
                        </p>
                    )}
                </div>
                <Button
                onClick={() => { setCurrentTransaction(null); setIsModalOpen(true); }}
                className="btn-primary w-full sm:w-auto"
                >
                <Plus className="h-5 w-5 mr-1" />
                Nova Transação
                </Button>
            </div>
          
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Receitas</h3>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo_transacao === "Receita").length
                } transações</span>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Despesas</h3>
                <div className="bg-red-100 p-2 rounded-full">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo_transacao === "Despesa").length
                } transações</span>
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Saldo</h3>
                <div className={`p-2 rounded-full ${saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-2">Balanço atual</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">A Receber</h3>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente").length
                } pendentes</span>
              </p>
            </div>
          </div>

          {/* Tabela e Modal */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar transações..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
            {isLoadingTransactions ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-lawyer-primary" />
                    <span className="ml-2 text-gray-500">Carregando transações...</span>
                </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cliente</th> */}
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${
                            transaction.tipo_transacao === "Receita" ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.tipo_transacao === "Receita" ?
                              <TrendingUp className="h-4 w-4 mr-1" /> :
                              <TrendingDown className="h-4 w-4 mr-1" />
                            }
                            {transaction.tipo_transacao}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.descricao}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          R$ {Number(transaction.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">{transaction.categoria}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.data_transacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status_pagamento === 'Pago' || transaction.status_pagamento === 'Recebido' ? 'bg-green-100 text-green-800' :
                            transaction.status_pagamento === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status_pagamento === 'Atrasado' ? 'bg-orange-100 text-orange-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status_pagamento}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">{transaction.cliente_nome_temp || "-"}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full h-7 w-7"
                              title="Editar Transação"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-full h-7 w-7"
                              title="Excluir Transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredTransactions.length}</span> de <span className="font-medium">{transactions.length}</span> transações
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="p-2 border rounded-md hover:bg-gray-50 h-8 w-8">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="p-2 border rounded-md hover:bg-gray-50 h-8 w-8">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {isModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="text-lg font-semibold">{currentTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentTransaction(null);
                    }}
                    className="h-7 w-7"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <form onSubmit={handleAddOrUpdateTransaction} className="flex-grow overflow-y-auto">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transação</label>
                      <div className="flex">
                        <label className="inline-flex items-center mr-6">
                          <input
                            type="radio"
                            name="tipo" // Nome do campo no formulário
                            value="Receita"
                            defaultChecked={currentTransaction?.tipo_transacao === "Receita" || !currentTransaction}
                            className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                          />
                          <span>Receita</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="tipo" // Nome do campo no formulário
                            value="Despesa"
                            defaultChecked={currentTransaction?.tipo_transacao === "Despesa"}
                            className="mr-2 form-radio h-4 w-4 text-lawyer-primary focus:ring-lawyer-primary"
                          />
                          <span>Despesa</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <Input
                        type="text"
                        id="descricao"
                        name="descricao"
                        defaultValue={currentTransaction?.descricao || ''}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                      <Input
                        type="number"
                        id="valor"
                        name="valor"
                        min="0"
                        step="0.01"
                        defaultValue={currentTransaction?.valor ? String(currentTransaction.valor) : ''}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                          id="categoria"
                          name="categoria"
                          defaultValue={currentTransaction?.categoria || 'Honorários'}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white"
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
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <Input
                          type="date"
                          id="data"
                          name="data" // Nome do campo no formulário
                          defaultValue={currentTransaction?.data_transacao || new Date().toISOString().split('T')[0]}
                          required
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4"> {/* Simplificado para 1 coluna, cliente não está sendo associado via ID por enquanto */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          id="status"
                          name="status" // Nome do campo no formulário
                          defaultValue={currentTransaction?.status_pagamento || 'Pendente'}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Pago">Pago</option>
                          <option value="Recebido">Recebido</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>
                      {/* O campo 'Cliente' como texto livre foi removido do formulário, 
                          pois a tabela espera um cliente_associado_id (UUID).
                          Se quiser manter um campo de texto para nome do cliente temporário, adicione-o aqui
                          e na interface TransacaoFormData.
                      */}
                    </div>
                  </div>
                   <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white z-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentTransaction(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="btn-primary">
                      {currentTransaction ? 'Atualizar' : 'Adicionar'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default FinanceiroPage;