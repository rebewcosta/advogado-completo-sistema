
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface ConfiguracaoMonitoramento {
  id: string;
  nomes_monitoramento: string[];
  estados_monitoramento: string[];
  palavras_chave: string[];
  monitoramento_ativo: boolean;
  ultima_busca?: string;
}

export function usePublicacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMonitoramento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const { data, error } = await supabase
        .from('publicacoes_diario_oficial')
        .select('*')
        .eq('user_id', user.id)
        .order('data_publicacao', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublicacoes(data || []);
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao carregar publicações';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar publicações",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchConfiguracao = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('configuracoes_monitoramento')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setConfiguracao(data);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, [user]);

  const toggleLida = useCallback(async (publicacaoId: string, currentStatus: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ lida: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user.id);

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
  }, [user, toast]);

  const toggleImportante = useCallback(async (publicacaoId: string, currentStatus: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ importante: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user.id);

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
  }, [user, toast]);

  const salvarConfiguracao = useCallback(async (configData: Omit<ConfiguracaoMonitoramento, 'id' | 'ultima_busca'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('configuracoes_monitoramento')
        .upsert({
          ...configData,
          user_id: user.id
        });

      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de monitoramento foram atualizadas"
      });
      
      await fetchConfiguracao();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchConfiguracao]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        await Promise.all([fetchPublicacoes(), fetchConfiguracao()]);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, fetchPublicacoes, fetchConfiguracao]);

  const stats = {
    total: publicacoes.length,
    naoLidas: publicacoes.filter(p => !p.lida).length,
    importantes: publicacoes.filter(p => p.importante).length,
    monitoramentoAtivo: configuracao?.monitoramento_ativo || false
  };

  return {
    publicacoes,
    configuracao,
    stats,
    isLoading,
    error,
    fetchPublicacoes,
    fetchConfiguracao,
    toggleLida,
    toggleImportante,
    salvarConfiguracao
  };
}
