
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import type { TarefaComRelacoes, StatusTarefa } from '@/types/tarefas';

type Tarefa = Database['public']['Tables']['tarefas']['Row'] & {
  processos?: { id: string; numero_processo: string } | null;
  clientes?: { id: string; nome: string } | null;
};

export type TarefaFormData = {
  titulo: string;
  descricao?: string | null;
  data_conclusao?: string | null;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  processo_id?: string | null;
  cliente_id?: string | null;
};

type ProcessoParaSelect = Pick<Database['public']['Tables']['processos']['Row'], 'id' | 'numero_processo'>;
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

export const useTarefas = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const saveTarefa = async (formData: TarefaFormData, tarefaId?: string) => {
    if (!user) return false;
    setIsSubmitting(true);
    
    const dadosParaSupabase = {
        user_id: user.id,
        titulo: formData.titulo,
        descricao_detalhada: formData.descricao,
        data_conclusao: formData.data_conclusao || null,
        prioridade: formData.prioridade,
        status: formData.status,
        processo_id: formData.processo_id || null,
        cliente_id: formData.cliente_id || null,
    };

    try {
        if (tarefaId) {
            const { data: updatedTarefa, error } = await supabase
                .from('tarefas')
                .update(dadosParaSupabase)
                .eq('id', tarefaId)
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
        return true;
    } catch (error: any) {
        toast({ title: "Erro ao salvar tarefa", description: error.message, variant: "destructive" });
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const deleteTarefa = async (tarefaId: string) => {
    if (!user || isSubmitting) return false;
    const tarefaToDelete = tarefas.find(t => t.id === tarefaId);
    if (tarefaToDelete && window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefaToDelete.titulo}"?`)) {
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('tarefas').delete().eq('id', tarefaId);
            if (error) throw error;
            toast({ title: "Tarefa excluída!", description: `A tarefa "${tarefaToDelete.titulo}" foi removida.` });
            fetchTarefas(false);
            return true;
        } catch (error: any) {
            toast({ title: "Erro ao excluir tarefa", description: error.message, variant: "destructive" });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }
    return false;
  };

  const toggleStatusTarefa = async (tarefa: Tarefa, novoStatus: TarefaFormData['status']) => {
    if(!user || isSubmitting) return false;
    setIsSubmitting(true);
    try {
        const { data, error } = await supabase
            .from('tarefas')
            .update({ status: novoStatus })
            .eq('id', tarefa.id)
            .select('*, processos(id, numero_processo), clientes(id, nome)')
            .single();
        if (error) throw error;
        toast({ title: "Status da tarefa atualizado!", description: `Tarefa "${data?.titulo}" agora está ${novoStatus}.`});
        fetchTarefas(false);
        return true;
    } catch (error: any) {
        toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTarefas();
      fetchDropdownData();
    } else {
      setTarefas([]); 
      setIsLoading(false);
    }
  }, [user, fetchTarefas, fetchDropdownData]);

  const handleManualRefresh = () => {
    fetchTarefas(true);
  };

  const isLoadingCombined = isLoading || isSubmitting || isRefreshingManually;

  return {
    tarefas,
    isLoading: isLoadingCombined,
    isSubmitting,
    processosDoUsuario,
    clientesDoUsuario,
    isLoadingDropdownData,
    saveTarefa,
    deleteTarefa,
    toggleStatusTarefa,
    handleManualRefresh
  };
};
