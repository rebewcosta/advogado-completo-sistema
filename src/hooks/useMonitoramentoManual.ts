
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
        title: "Configuração Necessária",
        description: "Configure o monitoramento antes de executar",
        variant: "destructive"
      });
      return;
    }

    // Validar nomes
    const nomesValidos = configuracao.nomes_monitoramento?.filter((nome: string) => nome?.trim()) || [];
    if (nomesValidos.length === 0) {
      toast({
        title: "Nomes Obrigatórios",
        description: "Configure pelo menos um nome para monitoramento",
        variant: "destructive"
      });
      return;
    }

    setIsMonitoring(true);
    
    try {
      console.log('🚀 Iniciando monitoramento com:', { 
        user_id: user.id, 
        nomes: nomesValidos,
        estados: configuracao.estados_monitoramento || []
      });
      
      const requestBody = {
        user_id: user.id,
        nomes: nomesValidos,
        estados: configuracao.estados_monitoramento || [],
        palavras_chave: configuracao.palavras_chave?.filter((palavra: string) => palavra?.trim()) || []
      };

      console.log('📤 Enviando requisição para Edge Function:', requestBody);

      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        
        // Tratamento específico para diferentes tipos de erro
        let errorMessage = "Erro durante o monitoramento";
        
        if (error.message?.includes('FunctionsHttpError')) {
          errorMessage = "Erro de comunicação com o servidor. Tente novamente.";
        } else if (error.message?.includes('400')) {
          errorMessage = "Erro na validação dos dados. Verifique sua configuração.";
        } else if (error.message?.includes('timeout')) {
          errorMessage = "Timeout na execução. Tente novamente.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida do servidor');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido durante o monitoramento');
      }

      console.log('✅ Monitoramento concluído com sucesso:', data);
      setLastResult(data);
      
      toast({
        title: "Monitoramento Concluído",
        description: data.message || `${data.publicacoes_encontradas || 0} publicações encontradas`,
        variant: "default"
      });

      onMonitoramentoCompleto();
      
    } catch (error: any) {
      console.error('❌ Erro no monitoramento:', error);
      
      let errorMessage = "Erro durante o monitoramento";
      
      if (error.message?.includes('validação')) {
        errorMessage = "Dados inválidos. Verifique sua configuração.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Timeout na execução. Tente novamente.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (error.message?.includes('Body da requisição')) {
        errorMessage = "Erro na configuração. Verifique os dados e tente novamente.";
      } else if (error.message?.includes('nomes')) {
        errorMessage = "Configure pelo menos um nome válido para monitoramento.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no Monitoramento",
        description: errorMessage,
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
