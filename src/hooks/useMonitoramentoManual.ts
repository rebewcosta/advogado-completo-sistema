
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMonitoramentoManual = (
  configuracao: any,
  onMonitoramentoCompleto: () => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const executarMonitoramento = async () => {
    if (!user || !configuracao) {
      toast({
        title: "Erro",
        description: "Configure o monitoramento antes de executar",
        variant: "destructive"
      });
      return;
    }

    // Validar se há nomes configurados
    if (!configuracao.nomes_monitoramento || configuracao.nomes_monitoramento.length === 0 || 
        configuracao.nomes_monitoramento.every((nome: string) => !nome.trim())) {
      toast({
        title: "Erro",
        description: "Pelo menos um nome deve ser configurado para monitoramento",
        variant: "destructive"
      });
      return;
    }

    setIsMonitoring(true);
    
    try {
      console.log('Iniciando monitoramento real com configuração:', configuracao);
      
      const requestBody = {
        user_id: user.id,
        nomes: configuracao.nomes_monitoramento.filter((nome: string) => nome.trim() !== ''),
        estados: configuracao.estados_monitoramento || [],
        palavras_chave: configuracao.palavras_chave?.filter((palavra: string) => palavra.trim() !== '') || []
      };

      console.log('Dados da requisição para busca real:', requestBody);

      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: requestBody
      });

      console.log('Resposta da busca real:', { data, error });

      if (error) {
        console.error('Erro na função de busca real:', error);
        
        // Tratar diferentes tipos de erro
        let errorMessage = "Erro durante o monitoramento real";
        
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          errorMessage = "Limite de execuções atingido. Aguarde alguns minutos antes de tentar novamente.";
        } else if (error.message?.includes('timeout')) {
          errorMessage = "Timeout na execução. Tente novamente em alguns minutos.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Monitoramento real concluído:', data);
      setLastResult(data);
      
      const message = data?.message || `Busca concluída: ${data?.publicacoes_encontradas || 0} publicações encontradas em ${data?.fontes_consultadas || 0} fontes`;
      
      toast({
        title: "Monitoramento Concluído",
        description: message,
        variant: data?.publicacoes_encontradas > 0 ? "default" : "default"
      });

      onMonitoramentoCompleto();
      
    } catch (error: any) {
      console.error('Erro no monitoramento real:', error);
      
      toast({
        title: "Erro no Monitoramento",
        description: error.message || "Ocorreu um erro durante o monitoramento",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  return {
    isMonitoring,
    lastResult,
    executarMonitoramento
  };
};
