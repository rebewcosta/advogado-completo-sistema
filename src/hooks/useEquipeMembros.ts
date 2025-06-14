
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type EquipeMembro = Database['public']['Tables']['equipe_membros']['Row'];

export const useEquipeMembros = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveMembro = async (membroData: any) => {
    if (!user) return false;
    
    setIsSubmitting(true);
    try {
      // Prepara os dados para salvamento
      const dataToSave = {
        user_id: user.id,
        nome: membroData.nome.trim(),
        email: membroData.email?.trim() || null,
        cargo: membroData.cargo?.trim() || null,
        telefone: membroData.telefone?.trim() || null,
        nivel_permissao: 'Colaborador',
        ativo: membroData.status === 'ativo'
      };

      if (membroData.id) {
        // Atualizar membro existente
        const { error } = await supabase
          .from('equipe_membros')
          .update(dataToSave)
          .eq('id', membroData.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Membro atualizado!",
          description: `O membro "${membroData.nome}" foi atualizado com sucesso.`
        });
      } else {
        // Criar novo membro
        const { error } = await supabase
          .from('equipe_membros')
          .insert(dataToSave);

        if (error) throw error;
        
        toast({
          title: "Membro cadastrado!",
          description: `O membro "${membroData.nome}" foi adicionado à equipe.`
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar membro:', error);
      toast({
        title: "Erro ao salvar membro",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMembro = async (membro: EquipeMembro, onRefresh: () => void) => {
    if (!user || isSubmitting) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o membro "${membro.nome}"?`)) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('equipe_membros')
          .delete()
          .eq('id', membro.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Membro excluído!",
          description: `O membro "${membro.nome}" foi removido da equipe.`
        });
        onRefresh();
      } catch (error: any) {
        console.error('Erro ao excluir membro:', error);
        toast({
          title: "Erro ao excluir membro",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    saveMembro,
    deleteMembro
  };
};
