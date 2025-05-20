// src/stores/useProcessesStore.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type ProcessoRow = Database['public']['Tables']['processos']['Row'];
// Adicionando a estrutura aninhada de clientes que o Supabase retorna com o join
type ClienteJoin = { id: string; nome: string } | null;
export type ProcessoComCliente = ProcessoRow & {
  clientes?: ClienteJoin; // Supabase aninha o join aqui
  nome_cliente_text?: string | null; // Campo que vamos garantir que exista para a UI
};

type ProcessoFormData = {
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
};

export const useProcessesStore = () => {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<ProcessoComCliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatProcessData = (processData: any): ProcessoComCliente => {
    // A tipagem 'any' aqui é para lidar com o retorno flexível do Supabase com joins
    const clienteAninhado = processData.clientes as { id: string; nome: string } | null;
    return {
      ...processData,
      clientes: undefined, // Removemos o objeto aninhado original para evitar confusão
      nome_cliente_text: clienteAninhado?.nome || processData.nome_cliente_text || 'N/A',
    } as ProcessoComCliente;
  };

  const fetchProcesses = useCallback(async () => {
    if (!user) {
      setProcesses([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          *,
          clientes ( id, nome )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: "Erro ao buscar processos", description: error.message, variant: "destructive" });
      }
      const formattedData = data?.map(formatProcessData) || [];
      setProcesses(formattedData);
      console.log("useProcessesStore: fetchProcesses - Processos formatados:", formattedData);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      setProcesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchProcesses();
    } else {
        setProcesses([]);
    }
  }, [user, fetchProcesses]);

  const parseDateString = (dateString?: string): string | null => {
    if (!dateString || typeof dateString !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const addProcess = async (processFormData: ProcessoFormData) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
      return null;
    }
    setIsLoading(true);
    const dadosParaSupabase = {
      user_id: user.id,
      numero_processo: processFormData.numero,
      cliente_id: processFormData.cliente_id || null,
      nome_cliente_text: processFormData.cliente_id ? null : (processFormData.nome_cliente_text || null),
      tipo_processo: processFormData.tipo,
      vara_tribunal: processFormData.vara || null,
      status_processo: processFormData.status || 'Em andamento',
      proximo_prazo: parseDateString(processFormData.prazo),
    };
    console.log("useProcessesStore: Dados para inserir processo:", dadosParaSupabase);
    try {
      const { data: newProcessData, error } = await supabase
        .from('processos')
        .insert([dadosParaSupabase])
        .select(`*, clientes ( id, nome )`)
        .single();
      if (error) {
        console.error('useProcessesStore: Erro ao adicionar processo no Supabase:', error);
        toast({ title: "Erro ao adicionar processo", description: error.message, variant: "destructive" });
        throw error;
      }
      if (newProcessData) {
        const formattedNewProcess = formatProcessData(newProcessData);
        setProcesses(prev => [formattedNewProcess, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() ));
        toast({ title: "Processo Adicionado", description: `Processo ${formattedNewProcess.numero_processo} criado.` });
        return formattedNewProcess;
      }
      return null;
    } catch (error) {
      console.error('useProcessesStore: Catch final do erro ao adicionar processo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProcess = async (id: string, processFormData: ProcessoFormData) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
      return null;
    }
    setIsLoading(true);
    const dadosParaAtualizar = {
        numero_processo: processFormData.numero,
        cliente_id: processFormData.cliente_id || null,
        nome_cliente_text: processFormData.cliente_id ? null : (processFormData.nome_cliente_text || null),
        tipo_processo: processFormData.tipo,
        vara_tribunal: processFormData.vara || null,
        status_processo: processFormData.status,
        proximo_prazo: parseDateString(processFormData.prazo),
    };
    console.log("useProcessesStore: Dados para ATUALIZAR processo:", dadosParaAtualizar);
    try {
      const { data: updatedProcessData, error } = await supabase
        .from('processos')
        .update(dadosParaAtualizar)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`*, clientes ( id, nome )`)
        .single();
      if (error) {
        console.error('useProcessesStore: Erro ao ATUALIZAR processo no Supabase:', error);
        toast({ title: "Erro ao atualizar processo", description: error.message, variant: "destructive" });
        throw error;
      }
      if (updatedProcessData) {
        const formattedUpdatedProcess = formatProcessData(updatedProcessData);
        setProcesses(prev => prev.map(p => p.id === id ? formattedUpdatedProcess : p));
        toast({ title: "Processo Atualizado", description: `Processo ${formattedUpdatedProcess.numero_processo} atualizado.` });
        return formattedUpdatedProcess;
      }
      return null;
    } catch (error) {
      console.error('useProcessesStore: Catch final do erro ao ATUALIZAR processo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProcessStatus = async (id: string) => {
    if (!user) return null;
    const process = processes.find(p => p.id === id);
    if (!process) return null;

    setIsLoading(true);
    let newStatus: ProcessoRow['status_processo'];
    if (process.status_processo === 'Em andamento') newStatus = 'Concluído';
    else if (process.status_processo === 'Concluído') newStatus = 'Suspenso';
    else newStatus = 'Em andamento';

    try {
      const { data: updatedProcessData, error } = await supabase
        .from('processos')
        .update({ status_processo: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`*, clientes ( id, nome )`)
        .single();
      if (error) {
        toast({ title: "Erro ao mudar status", description: error.message, variant: "destructive" });
        throw error;
      }
      if (updatedProcessData) {
        const formattedUpdatedProcess = formatProcessData(updatedProcessData);
        setProcesses(prev => prev.map(p => p.id === id ? formattedUpdatedProcess : p));
        toast({ title: "Status Alterado", description: `Status do processo ${formattedUpdatedProcess.numero_processo} alterado para ${newStatus}.` });
        return formattedUpdatedProcess;
      }
      return null;
    } catch (error) {
      console.error('Erro ao mudar status do processo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProcess = async (id: string) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Usuário não autenticado.", variant: "destructive" });
      return null;
    }
    setIsLoading(true);
    const processToDelete = processes.find(p => p.id === id);
    try {
      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) {
        toast({ title: "Erro ao deletar processo", description: error.message, variant: "destructive" });
        throw error;
      }
      setProcesses(prev => prev.filter(p => p.id !== id));
      if (processToDelete) {
        toast({ title: "Processo Deletado", description: `Processo ${processToDelete.numero_processo} deletado.` });
      }
      return processToDelete || null;
    } catch (error) {
      console.error('Erro ao deletar processo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getProcessById = (id: string): ProcessoComCliente | null => {
    return processes.find(process => process.id === id) || null;
  };

  return {
    processes,
    isLoading,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById,
    fetchProcesses
  };
};