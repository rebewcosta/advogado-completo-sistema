
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];
type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

export const useEquipeData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [membros, setMembros] = useState<EquipeMembro[]>([]);
  const [tarefas, setTarefas] = useState<EquipeTarefa[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembros = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipe_membros')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');
      
      if (error) throw error;
      setMembros(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar membros da equipe",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchTarefas = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('equipe_tarefas')
        .select(`
          *,
          responsavel:equipe_membros!responsavel_id(id, nome),
          delegado_por:equipe_membros!delegado_por_id(id, nome)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const tarefasFormatadas = (data || []).map(tarefa => ({
        ...tarefa,
        responsavel: Array.isArray(tarefa.responsavel) ? tarefa.responsavel[0] : tarefa.responsavel,
        delegado_por: Array.isArray(tarefa.delegado_por) ? tarefa.delegado_por[0] : tarefa.delegado_por
      }));
      
      setTarefas(tarefasFormatadas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tarefas da equipe",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchMembros(),
        fetchTarefas()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMembros, fetchTarefas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    membros,
    tarefas,
    isSubmitting,
    setIsSubmitting,
    fetchMembros,
    fetchTarefas,
    fetchData
  };
};
