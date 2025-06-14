
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Publicacao {
  id: string;
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
  segredo_justica: boolean;
  lida: boolean;
  importante: boolean;
  observacoes?: string;
  created_at: string;
}

export const usePublicacoesData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublicacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('publicacoes_diario_oficial')
        .select('*')
        .eq('user_id', user.id)
        .order('data_publicacao', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublicacoes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar publicações",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const toggleLida = async (publicacaoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ lida: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPublicacoes(prev => prev.map(p => 
        p.id === publicacaoId ? { ...p, lida: !currentStatus } : p
      ));
      
      toast({
        title: !currentStatus ? "Marcada como lida" : "Marcada como não lida",
        description: "Status atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleImportante = async (publicacaoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ importante: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPublicacoes(prev => prev.map(p => 
        p.id === publicacaoId ? { ...p, importante: !currentStatus } : p
      ));
      
      toast({
        title: !currentStatus ? "Marcada como importante" : "Removida dos importantes",
        description: "Status atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar importância",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchPublicacoes().finally(() => setIsLoading(false));
    }
  }, [user, fetchPublicacoes]);

  return {
    publicacoes,
    isLoading,
    setIsLoading,
    fetchPublicacoes,
    toggleLida,
    toggleImportante
  };
};
