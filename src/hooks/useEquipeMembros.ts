
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
    deleteMembro
  };
};
