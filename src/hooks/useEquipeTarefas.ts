
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type EquipeTarefa = Database['public']['Tables']['equipe_tarefas']['Row'] & {
  responsavel?: { id: string; nome: string } | null;
  delegado_por?: { id: string; nome: string } | null;
};

export const useEquipeTarefas = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteTarefa = async (tarefa: EquipeTarefa, onRefresh: () => void) => {
    if (!user || isSubmitting) return;
    
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('equipe_tarefas')
          .delete()
          .eq('id', tarefa.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Tarefa excluída!",
          description: `A tarefa "${tarefa.titulo}" foi removida.`
        });
        onRefresh();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir tarefa",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const convertToFormInterface = (tarefa: EquipeTarefa) => {
    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao_detalhada || '',
      responsavel: tarefa.responsavel?.nome || '',
      prazo: tarefa.data_vencimento ? new Date(tarefa.data_vencimento) : undefined,
      prioridade: tarefa.prioridade.toLowerCase() as 'baixa' | 'media' | 'alta',
      status: tarefa.status.toLowerCase().replace(' ', '_') as 'pendente' | 'em_andamento' | 'concluida'
    };
  };

  return {
    isSubmitting,
    setIsSubmitting,
    deleteTarefa,
    convertToFormInterface
  };
};
