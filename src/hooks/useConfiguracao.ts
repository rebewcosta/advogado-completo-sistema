
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ConfiguracaoMonitoramento {
  id: string;
  nomes_monitoramento: string[];
  estados_monitoramento: string[];
  palavras_chave: string[];
  numeros_oab: string[];
  nomes_escritorio: string[];
  monitoramento_ativo: boolean;
  ultima_busca?: string;
}

export const useConfiguracao = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMonitoramento | null>(null);
  const [nomesMonitoramento, setNomesMonitoramento] = useState<string[]>(['']);
  const [estadosMonitoramento, setEstadosMonitoramento] = useState<string[]>([]);
  const [palavrasChave, setPalavrasChave] = useState<string[]>(['']);
  const [numerosOAB, setNumerosOAB] = useState<string[]>(['']);
  const [nomesEscritorio, setNomesEscritorio] = useState<string[]>(['']);
  const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(true);

  const fetchConfiguracao = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('configuracoes_monitoramento')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguracao(data);
        setNomesMonitoramento(data.nomes_monitoramento.length > 0 ? data.nomes_monitoramento : ['']);
        setEstadosMonitoramento(data.estados_monitoramento || []);
        setPalavrasChave(data.palavras_chave.length > 0 ? data.palavras_chave : ['']);
        setNumerosOAB(data.numeros_oab?.length > 0 ? data.numeros_oab : ['']);
        setNomesEscritorio(data.nomes_escritorio?.length > 0 ? data.nomes_escritorio : ['']);
        setMonitoramentoAtivo(data.monitoramento_ativo);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const salvarConfiguracao = async () => {
    if (!user) return;
    
    try {
      const nomesFiltrados = nomesMonitoramento.filter(n => n.trim() !== '');
      const palavrasFiltradas = palavrasChave.filter(p => p.trim() !== '');
      const numerosFiltrados = numerosOAB.filter(n => n.trim() !== '');
      const escritoriosFiltrados = nomesEscritorio.filter(n => n.trim() !== '');
      
      const configData = {
        user_id: user.id,
        nomes_monitoramento: nomesFiltrados,
        estados_monitoramento: estadosMonitoramento,
        palavras_chave: palavrasFiltradas,
        numeros_oab: numerosFiltrados,
        nomes_escritorio: escritoriosFiltrados,
        monitoramento_ativo: monitoramentoAtivo
      };

      if (configuracao) {
        const { error } = await supabase
          .from('configuracoes_monitoramento')
          .update(configData)
          .eq('id', configuracao.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_monitoramento')
          .insert(configData);

        if (error) throw error;
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de monitoramento foram atualizadas com os novos filtros de precisão"
      });
      
      await fetchConfiguracao();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchConfiguracao();
    }
  }, [user, fetchConfiguracao]);

  return {
    configuracao,
    nomesMonitoramento,
    setNomesMonitoramento,
    estadosMonitoramento,
    setEstadosMonitoramento,
    palavrasChave,
    setPalavrasChave,
    numerosOAB,
    setNumerosOAB,
    nomesEscritorio,
    setNomesEscritorio,
    monitoramentoAtivo,
    setMonitoramentoAtivo,
    fetchConfiguracao,
    salvarConfiguracao
  };
};
