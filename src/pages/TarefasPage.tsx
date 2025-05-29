// src/pages/TarefasPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Plus, Search, RefreshCw, ListChecks } from 'lucide-react'; // ListChecks para o header
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';
import TarefaForm from '@/components/tarefas/TarefaForm'; // Certifique-se que este componente exista
import TarefaListAsCards from '@/components/tarefas/TarefaListAsCards'; // Para mobile
import TarefaTable from '@/components/tarefas/TarefaTable'; // Para desktop
import SharedPageHeader from '@/components/shared/SharedPageHeader'; // <<< IMPORTAR

type Tarefa = Database['public']['Tables']['tarefas']['Row'] & {
  processos?: { id: string; numero_processo: string } | null;
  clientes?: { id: string; nome: string } | null;
};

export type TarefaFormData = {
  titulo: string;
  descricao?: string | null;
  data_conclusao?: string | null; // formato YYYY-MM-DD
  prioridade: 'baixa' | 'média' | 'alta';
  status_tarefa: 'Pendente' | 'Em andamento' | 'Concluída' | 'Cancelada';
  responsavel_id?: string | null; // Se houver usuários/responsáveis
  processo_id?: string | null;
  cliente_id?: string | null;
};

type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

const TarefasPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaParaForm, setTarefaParaForm] = useState<Partial<TarefaFormData> & { id?: string } | null>(null);

  const [processosDoUsuario, setProcessosDoUsuario] = useState<ProcessoParaSelect[]>([]);
  const [clientesDoUsuario, setClientesDoUsuario] = useState<ClienteParaSelect[]>([]);
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
        .select(`
          *,
          processos (id, numero_processo),
          clientes (id, nome)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTarefas(data || []);
    } catch (error: any) {
      toast({ title: "Erro ao buscar tarefas", description: error.message, variant: "destructive" });
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
      toast({ title: "Erro ao carregar dados associados", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingDropdownData(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchTarefas();
      fetchDropdownData();
    } else {
      setTarefas([]); setIsLoading(false);
    }
  }, [user, fetchTarefas, fetchDropdownData]);

  const filteredTarefas = tarefas.filter(tarefa =>
    (tarefa.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarefa.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (tarefaToEdit?: Tarefa) => {
    if (tarefaToEdit) {
        const formData: Partial<TarefaFormData> & { id: string } = {
            id: tarefaToEdit.id,
            titulo: tarefaToEdit.titulo,
            descricao: tarefaToEdit.descricao,
            data_conclusao: tarefaToEdit.data_conclusao ? format(parseISO(tarefaToEdit.data_conclusao), 'yyyy-MM-dd') : undefined,
            prioridade: tarefaToEdit.prioridade as TarefaFormData['prioridade'],
            status_tarefa: tarefaToEdit.status_tarefa as TarefaFormData['status_tarefa'],
            responsavel_id: tarefaToEdit.responsavel_id,
            processo_id: tarefaToEdit.processo_id,
            cliente_id: tarefaToEdit.cliente_id,
        };
        setTarefaParaForm(formData);
    } else {
        setTarefaParaForm({ prioridade: 'média', status_tarefa: 'Pendente' });
    }
    setIsFormOpen(true);
  };

  const handleSaveTarefa = async (formData: TarefaFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const dadosParaSupabase = {
        user_id: user.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        data_conclusao: formData.data_conclusao || null,
        prioridade: formData.prioridade,
        status_tarefa: formData.status_tarefa,
        responsavel_id: formData.responsavel_id || null,
        processo_id: formData.processo_id || null,
        cliente_id: formData.cliente_id || null,
    };

    try {
        if (tarefaParaForm && tarefaParaForm.id) {
            const { data: updatedTarefa, error } = await supabase
                .from('tarefas')
                .update(dadosParaSupabase)
                .eq('id', tarefaParaForm.id)
                .select('*, processos(id, numero_processo), clientes(id, nome)')
                .single();
            if (error) throw error;
            toast({ title: "Tarefa atualizada!", description: `A tarefa "${updatedTarefa?.titulo}" foi atualizada.` });
        } else {
            const { data: newTarefa, error } = await supabase
                .from('tarefas')
                .insert(dadosParaSupabase)
                .select('*, processos(id, numero_processo), clientes(id, nome)')
                .single();
            if (error) throw error;
            toast({ title: "Tarefa criada!", description: `A tarefa "${newTarefa?.titulo}" foi adicionada.` });
        }
        fetchTarefas(false);
        setIsFormOpen(false);
        setTarefaParaForm(null);
    } catch (error: any) {
        toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteTarefa = async (tarefaId: string) => {
    if (!user || isSubmitting) return;
    const tarefaToDelete = tarefas.find(t => t.id === tarefaId);
    if (tarefaToDelete && window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefaToDelete.titulo}"?`)) {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('tarefas').delete().eq('id', tarefaId);
            if (error) throw error;
            toast({ title: "Tarefa excluída!", description: `A tarefa "${tarefaToDelete.titulo}" foi removida.` });
            fetchTarefas(false);
        } catch (error: any) {
            toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleToggleStatusTarefa = async (tarefa: Tarefa, novoStatus: TarefaFormData['status_tarefa']) => {
    if(!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
        const { data, error } = await supabase
            .from('tarefas')
            .update({ status_tarefa: novoStatus })
            .eq('id', tarefa.id)
            .select('*, processos(id, numero_processo), clientes(id, nome)')
            .single();
        if (error) throw error;
        toast({ title: "Status da tarefa atualizado!", description: `Tarefa "${data?.titulo}" agora está ${novoStatus}.`});
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

  const isLoadingCombined = isLoading || isSubmitting || isRefreshingManually;

  if (isLoadingCombined && tarefas.length === 0 && !isRefreshingManually) {
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
        <SharedPageHeader
            title="Gerenciador de Tarefas"
            description="Organize e acompanhe suas pendências e prazos."
            pageIcon={<ListChecks />} 
            actionButtonText="Nova Tarefa"
            onActionButtonClick={() => handleOpenForm()}
            isLoading={isLoadingCombined}
        />
        
        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                        type="text"
                        placeholder="Buscar por título ou descrição..."
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

        <div className="hidden md:block">
            <TarefaTable
                tarefas={filteredTarefas}
                onEdit={handleOpenForm}
                onDelete={handleDeleteTarefa}
                onToggleStatus={handleToggleStatusTarefa}
                isLoading={isLoadingCombined}
            />
        </div>
        <div className="md:hidden">
            <TarefaListAsCards
                tarefas={filteredTarefas}
                onEdit={handleOpenForm}
                onDelete={handleDeleteTarefa}
                onToggleStatus={handleToggleStatusTarefa}
                isLoading={isLoadingCombined}
            />
        </div>

        <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open) setTarefaParaForm(null); setIsFormOpen(open); }}>
          <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <DialogHeader className="p-4 pb-3 border-b sticky top-0 bg-white z-10">
                <DialogTitle className="text-lg font-semibold">{tarefaParaForm?.id ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto p-4">
                <TarefaForm
                    key={tarefaParaForm ? tarefaParaForm.id || 'new-task-key' : 'new-task-key'}
                    initialData={tarefaParaForm}
                    onSave={handleSaveTarefa}
                    onCancel={() => { setIsFormOpen(false); setTarefaParaForm(null);}}
                    processos={processosDoUsuario}
                    clientes={clientesDoUsuario}
                    isLoadingDropdownData={isLoadingDropdownData}
                    isSubmitting={isSubmitting}
                />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TarefasPage;