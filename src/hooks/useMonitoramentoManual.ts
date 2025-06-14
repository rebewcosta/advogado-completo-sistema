
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
        estados: configuracao.estados_monitoramento || []
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
        throw new Error(error.message || 'Erro de comunicação com o servidor');
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
      
      toast({
        title: "Erro no Monitoramento",
        description: error.message || "Erro durante o monitoramento. Tente novamente.",
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
