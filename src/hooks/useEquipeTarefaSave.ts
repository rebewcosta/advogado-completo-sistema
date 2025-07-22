import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TarefaFormData {
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: Date | undefined;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'em_andamento' | 'concluida';
}

export const useEquipeTarefaSave = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveTarefa = async (data: TarefaFormData, tarefaId?: string) => {
    if (!user || isSubmitting) return false;
    
    setIsSubmitting(true);
    
    try {
      console.log('💾 Salvando tarefa:', data);
      
      // Mapear os dados do formulário para o formato do banco
      const tarefaData = {
        titulo: data.titulo,
        descricao_detalhada: data.descricao || '',
        responsavel_id: null, // Por enquanto não vamos associar com membros específicos  
        data_vencimento: data.prazo ? data.prazo.toISOString().split('T')[0] : null,
        prioridade: data.prioridade === 'baixa' ? 'Baixa' : 
                   data.prioridade === 'media' ? 'Média' : 'Alta',
        status: data.status === 'em_andamento' ? 'Em Andamento' : 
                data.status === 'concluida' ? 'Concluída' : 'Pendente',
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (tarefaId) {
        // Atualizar tarefa existente
        result = await supabase
          .from('equipe_tarefas')
          .update(tarefaData)
          .eq('id', tarefaId)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Criar nova tarefa
        result = await supabase
          .from('equipe_tarefas')
          .insert(tarefaData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('❌ Erro ao salvar tarefa:', result.error);
        throw result.error;
      }

      console.log('✅ Tarefa salva com sucesso:', result.data);
      
      toast({
        title: tarefaId ? "Tarefa atualizada!" : "Tarefa criada!",
        description: `A tarefa "${data.titulo}" foi ${tarefaId ? 'atualizada' : 'criada'} com sucesso.`
      });
      
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao salvar tarefa:', error);
      toast({
        title: "Erro ao salvar tarefa",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveTarefa,
    isSubmitting
  };
};