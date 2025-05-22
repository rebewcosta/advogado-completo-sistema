// src/pages/FinanceiroPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import PinLock from '@/components/PinLock';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter,
  DollarSign, TrendingUp, TrendingDown, FileText as FileTextIcon, X, Loader2, KeyRound, AlertCircle, ShieldAlert, BadgePercent
} from 'lucide-react'; // Adicionado BadgePercent
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from '@/integrations/supabase/types';

type TransacaoSupabase = Database['public']['Tables']['transacoes_financeiras']['Row'];

interface TransacaoFormData {
  tipo: 'Receita' | 'Despesa';
  descricao: string;
  valor: number;
  categoria: string;
  data_transacao: string;
  status_pagamento: 'Pendente' | 'Pago' | 'Recebido' | 'Atrasado';
  cliente_nome_temp?: string;
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
    (transaction.descricao && transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transaction.categoria && transaction.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const receitas = transactions
    .filter(t => t.tipo_transacao === "Receita")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const despesas = transactions
    .filter(t => t.tipo_transacao === "Despesa")
    .reduce((sum, t) => sum + Number(t.valor || 0), 0);

  const saldo = receitas - despesas;

  const receitasPendentes = transactions
    .filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente")
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
        
        setTransactions(prev => prev.map(t => t.id === currentTransaction.id ? updatedData : t));
        toast({ title: "Transação atualizada", description: "Os dados da transação foram atualizados." });

      } else {
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
      <main className="py-8 px-4 md:px-6 lg:px-8 bg-lawyer-background min-h-full">
        <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
                <BadgePercent className="mr-3 h-7 w-7 text-lawyer-primary" /> {/* Ícone atualizado */}
                Controle Financeiro
            </h1>
            <p className="text-gray-600 text-left mt-1">
                Gerencie suas receitas, despesas e o fluxo de caixa do seu escritório.
            </p>
            {pinCheckResult?.pinNotSet && (
                <Alert variant="default" className="mt-3 text-xs bg-blue-50 border-blue-200 text-blue-700 max-w-md">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle className="font-medium">PIN de Segurança</AlertTitle>
                    <AlertDescription>
                        Para maior segurança, configure um PIN para esta seção em Configurações {'>'} Segurança.
                    </AlertDescription>
                </Alert>
            )}
        </div>
          
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="shadow-md rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Receitas Totais</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {transactions.filter(t => t.tipo_transacao === "Receita").length} transações
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Despesas Totais</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {transactions.filter(t => t.tipo_transacao === "Despesa").length} transações
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Saldo Atual</CardTitle>
                <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Balanço geral</p>
              </CardContent>
            </Card>

            <Card className="shadow-md rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Contas a Receber</CardTitle>
                <FileTextIcon className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {transactions.filter(t => t.tipo_transacao === "Receita" && t.status_pagamento === "Pendente").length} pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg rounded-lg">
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="relative flex-grow md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                        type="text"
                        placeholder="Buscar transações..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Button variant="outline" className="w-full md:w-auto px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-100 text-gray-700">
                            <Filter className="h-4 w-4" />
                            Filtrar
                        </Button>
                        <Button
                            onClick={() => { setCurrentTransaction(null); setIsModalOpen(true); }}
                            className="w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Transação
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
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="text-gray-600">Tipo</TableHead>
                        <TableHead className="text-gray-600">Descrição</TableHead>
                        <TableHead className="text-gray-600">Valor</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-600">Categoria</TableHead>
                        <TableHead className="text-gray-600">Data</TableHead>
                        <TableHead className="text-gray-600">Status</TableHead>
                        <TableHead className="text-center text-gray-600">Ações</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="py-3 px-4">
                            <div className={`flex items-center text-sm ${
                                transaction.tipo_transacao === "Receita" ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {transaction.tipo_transacao === "Receita" ?
                                <TrendingUp className="h-4 w-4 mr-1 opacity-80" /> :
                                <TrendingDown className="h-4 w-4 mr-1 opacity-80" />
                                }
                                {transaction.tipo_transacao}
                            </div>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-gray-700">{transaction.descricao}</TableCell>
                            <TableCell className={`py-3 px-4 font-medium ${transaction.tipo_transacao === "Receita" ? 'text-green-600' : 'text-red-600'}`}>
                            R$ {Number(transaction.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell py-3 px-4 text-gray-600">{transaction.categoria}</TableCell>
                            <TableCell className="py-3 px-4 text-gray-600">{new Date(transaction.data_transacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                            <TableCell className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                transaction.status_pagamento === 'Pago' || transaction.status_pagamento === 'Recebido' ? 'bg-green-100 text-green-700 border border-green-200' :
                                transaction.status_pagamento === 'Pendente' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                transaction.status_pagamento === 'Atrasado' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                                {transaction.status_pagamento}
                            </span>
                            </TableCell>
                            <TableCell className="py-3 px-4 text-center">
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
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={7} className="px-6 py-10 text-center text-gray-500">
                            Nenhuma transação encontrada.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                )}
                </div>

                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    Mostrando <span className="font-medium">{filteredTransactions.length}</span> de <span className="font-medium">{transactions.length}</span> transações
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="p-2 border rounded-md hover:bg-gray-100 h-8 w-8 text-gray-600">
                    <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="p-2 border rounded-md hover:bg-gray-100 h-8 w-8 text-gray-600">
                    <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                </div>
            </CardContent>
          </Card>

          {isModalOpen && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <CardHeader className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">{currentTransaction ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                        setIsModalOpen(false);
                        setCurrentTransaction(null);
                        }}
                        className="h-7 w-7 text-gray-500 hover:text-gray-700"
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
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
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
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="categoria_modal_fin" className="block text-sm font-medium text-gray-700 mb-1">Categoria</Label>
                        <select
                          id="categoria_modal_fin"
                          name="categoria"
                          defaultValue={currentTransaction?.categoria || 'Honorários'}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white text-sm"
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
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
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
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary bg-white text-sm"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Pago">Pago</option>
                          <option value="Recebido">Recebido</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                   <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-gray-50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentTransaction(null);
                      }}
                      className="text-gray-700 hover:bg-gray-100"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
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