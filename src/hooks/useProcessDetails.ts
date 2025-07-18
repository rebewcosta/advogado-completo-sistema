
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ProcessDetails {
  numero_processo: string;
  classe: string;
  assunto: string;
  tribunal: string;
  comarca: string;
  orgao_julgador: string;
  valor_causa: number | null;
  data_ajuizamento: string;
  status: string;
  partes: Array<{
    nome: string;
    tipo: string;
    documento: string;
  }>;
  advogados: Array<{
    nome: string;
    oab: string;
    parte: string;
  }>;
  movimentacoes: Array<{
    data: string;
    descricao: string;
    observacao?: string;
  }>;
  jurimetria?: {
    tempo_total_dias: number;
    total_movimentacoes: number;
    tempo_medio_entre_movimentacoes: number;
    tempo_na_fase_atual: number;
    fase_atual: string;
    previsao_sentenca: string;
  };
}

export const useProcessDetails = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [processDetails, setProcessDetails] = useState<ProcessDetails | null>(null);

  const consultarDetalhesProcesso = async (numeroProcesso: string): Promise<ProcessDetails | null> => {
    if (!numeroProcesso) {
      toast({
        title: "Erro na consulta",
        description: "Número do processo é obrigatório",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log('[PROCESS-DETAILS] Iniciando consulta de detalhes:', numeroProcesso);
      
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: { 
          tipo: 'numero',
          termo: numeroProcesso.replace(/\D/g, ''), // Remove formatação
          tribunal: 'principais' // Busca nos principais tribunais (TJSP, TJRJ, TJMG)
        }
      });

      if (error) {
        console.error('[PROCESS-DETAILS] Erro na edge function:', error);
        toast({
          title: "Erro na consulta",
          description: error.message || "Erro ao consultar detalhes do processo",
          variant: "destructive"
        });
        return null;
      }

      console.log('[PROCESS-DETAILS] Resposta recebida:', data);

      if (!data.success) {
        toast({
          title: "Processo não encontrado",
          description: data.error || "Não foi possível encontrar informações atualizadas para este processo",
          variant: "destructive"
        });
        return null;
      }

      if (!data.data || data.data.length === 0) {
        toast({
          title: "Processo não encontrado",
          description: "Não foi possível encontrar informações atualizadas para este processo nos tribunais consultados",
          variant: "destructive"
        });
        return null;
      }

      // Pegar o primeiro resultado (mais relevante)
      const primeiroResultado = data.data[0];
      setProcessDetails(primeiroResultado);

      toast({
        title: "Consulta realizada com sucesso",
        description: `Detalhes atualizados do processo obtidos via DataJud (${data.tribunais_consultados?.join(', ') || 'CNJ'})`,
      });

      return primeiroResultado;

    } catch (error: any) {
      console.error('[PROCESS-DETAILS] Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: error.message || "Erro inesperado ao consultar detalhes do processo",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const limparDetalhes = () => {
    setProcessDetails(null);
  };

  return {
    isLoading,
    processDetails,
    consultarDetalhesProcesso,
    limparDetalhes
  };
};
