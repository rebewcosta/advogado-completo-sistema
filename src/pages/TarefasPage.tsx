// src/pages/TarefasPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { ListChecks, Plus, Search, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import TarefaForm, { TarefaFormData } from '@/components/tarefas/TarefaForm';
import TarefaListAsCards from '@/components/tarefas/TarefaListAsCards';
import TarefaTable from '@/components/tarefas/TarefaTable'; // <<< IMPORTAR A NOVA TABELA

export type Tarefa = Database['public']['Tables']['tarefas']['Row'] & {
    clientes?: { id: string; nome: string } | null;
    processos?: { id: string; numero_processo: string } | null;
};

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;
type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;

export type StatusTarefa = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada' | 'Aguardando Terceiros';
export type PrioridadeTarefa = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

const TarefasPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [clientesDoUsuario, setClientesDoUsuario] = useState<ClienteParaSelect[]>([]);
  const [processosDoUsuario, setProcessosDoUsuario] = useState<ProcessoParaSelect[]>([]);
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false);
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  const fetchTarefas = useCallback(async (showLoadingSpinner = true) => {
    if (!user) {
      setTarefas([]);
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
      return;
    }
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshingManually(true);

    try {
      const { data, error } = await supabase
        .from('tarefas')
        .select(`*, clientes (id, nome), processos (id, numero_processo)`)
        .eq('user_id', user.id)
        .order('status', { ascending: true }) 
        .order('prioridade', { ascending: false }) 
        .order('data_vencimento', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTarefas(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar tarefas", description: error.message, variant: "destructive" });
      setTarefas([]);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
    }
  }, [user, toast]);
  
  const fetchDropdownData = useCallback(async () => {
    if (!user) return;
    setIsLoadingDropdownData(true);
    try {
      const [clientesRes, processosRes] = await Promise.all([
        supabase.from('clientes').select('id, nome').eq('user_id', user.id).order('nome'),
        supabase.from('processos').select('id, numero_processo').eq('user_id', user.id).order('numero_processo')
      ]);
      if (clientesRes.error) throw clientesRes.error;
      setClientesDoUsuario(clientesRes.data || []);
      if (processosRes.error) throw processosRes.error;
      setProcessosDoUsuario(processosRes.data || []);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados para formulário", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingDropdownData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchTarefas();
      fetchDropdownData();
    } else {
      setIsLoading(false);
      setTarefas([]);
      setClientesDoUsuario([]);
      setProcessosDoUsuario([]);
    }
  }, [user, fetchTarefas, fetchDropdownData]);

  const handleOpenForm = (tarefa?: Tarefa) => {
    setTarefaSelecionada(tarefa || null);
    setIsEditing(!!tarefa);
    setIsFormOpen(true);
  };

  const handleSaveTarefa = async (formData: TarefaFormData) => {
    if (!user) {
        toast({ title: "Usuário não autenticado.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    const dataVencimentoFinal = formData.data_vencimento;
    
    const dadosParaSalvar = {
      titulo: formData.titulo,
      descricao_detalhada: formData.descricao_detalhada || null,
      status: formData.status || 'Pendente',
      prioridade: formData.prioridade || 'Média',
      data_vencimento: dataVencimentoFinal,
      cliente_id: formData.cliente_id || null,
      processo_id: formData.processo_id || null,
      data_conclusao: formData.status === 'Concluída' ? new Date().toISOString() : null,
      user_id: user.id,
    };

    try {
      let operacao;
      let mensagemSucesso;
      if (isEditing && tarefaSelecionada) {
        operacao = supabase.from('tarefas').update(dadosParaSalvar).eq('id', tarefaSelecionada.id).select().single();
        mensagemSucesso = `Tarefa "${formData.titulo}" foi atualizada.`;
      } else {
        // @ts-ignore
        operacao = supabase.from('tarefas').insert(dadosParaSalvar).select().single();
        mensagemSucesso = `Tarefa "${formData.titulo}" foi adicionada.`;
      }
      const { data, error } = await operacao;
      if (error) throw error;
      toast({ title: isEditing ? "Tarefa atualizada!" : "Tarefa criada!", description: mensagemSucesso });
      fetchTarefas(false);
      setIsFormOpen(false);
      setTarefaSelecionada(null);
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteTarefa = async (tarefaId: string) => {
    if (!user || isSubmitting) return;
    const tarefaParaDeletar = tarefas.find(t => t.id === tarefaId);
    if (tarefaParaDeletar && window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefaParaDeletar.titulo}"?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from('tarefas').delete().eq('id', tarefaId).eq('user_id', user.id);
        if (error) throw error;
        toast({ title: "Tarefa excluída!" });
        fetchTarefas(false);
      } catch (error: any) {
        toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleStatus = async (tarefa: Tarefa) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    const novoStatus: StatusTarefa = tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';
    const dataConclusao = novoStatus === 'Concluída' ? new Date().toISOString() : null;
    try {
        const { data, error } = await supabase
            .from('tarefas')
            .update({ status: novoStatus, data_conclusao: dataConclusao })
            .eq('id', tarefa.id).eq('user_id', user.id).select().single();
        if (error) throw error;
        toast({ title: "Status da tarefa atualizado!" });
        fetchTarefas(false);
    } catch (error: any) {
        toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleManualRefresh = () => {
    fetchTarefas(true);
  };

  const filteredTarefas = tarefas.filter(tarefa =>
    tarefa.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarefa.descricao_detalhada && tarefa.descricao_detalhada.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tarefa.clientes?.nome && tarefa.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tarefa.processos?.numero_processo && tarefa.processos.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const isLoadingCombined = isLoading || isSubmitting || isRefreshingManually;

  if (isLoadingCombined && !tarefas.length && !isRefreshingManually) { 
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando tarefas...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
              <ListChecks className="mr-3 h-7 w-7 text-lawyer-primary" />
              Minhas Tarefas
            </h1>
            <p className="text-gray-600 text-left mt-1">
              Organize suas pendências, defina prioridades e acompanhe o progresso.
            </p>
          </div>
           <Button onClick={() => handleOpenForm()} className="mt-4 md:mt-0 w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
        </div>

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                        type="text"
                        placeholder="Buscar por título, cliente, processo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary"
                        />
                    </div>
                    <Button 
                        onClick={handleManualRefresh} 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoadingCombined} 
                        className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingCombined ? 'animate-spin' : ''}`} />
                        {isLoadingCombined ? 'Atualizando...' : 'Atualizar Tarefas'}
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
            <TarefaTable
                tarefas={filteredTarefas}
                onEdit={handleOpenForm}
                onDelete={handleDeleteTarefa}
                onToggleStatus={handleToggleStatus}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
            />
        </div>
        <div className="md:hidden">
            <TarefaListAsCards
                tarefas={filteredTarefas}
                onEdit={handleOpenForm}
                onDelete={handleDeleteTarefa}
                onToggleStatus={handleToggleStatus}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
            />
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if(!open) {
                setTarefaSelecionada(null);
                setIsEditing(false);
            }
            setIsFormOpen(open);
        }}>
          <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
             <TarefaForm
                key={tarefaSelecionada ? tarefaSelecionada.id : 'new-tarefa-key'}
                onSave={handleSaveTarefa}
                onCancel={() => {
                    setIsFormOpen(false);
                    setTarefaSelecionada(null);
                    setIsEditing(false);
                }}
                tarefaParaEditar={tarefaSelecionada}
                isEdit={isEditing}
                clientesDoUsuario={clientesDoUsuario}
                processosDoUsuario={processosDoUsuario}
                isLoadingDropdownData={isLoadingDropdownData}
              />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TarefasPage;