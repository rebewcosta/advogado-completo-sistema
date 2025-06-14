
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
      
      // Garantir que os dados sejam strings válidas
      const requestBody = {
        user_id: user.id,
        nomes: nomesValidos.map(nome => String(nome).trim()).filter(nome => nome.length > 0),
        estados: (configuracao.estados_monitoramento || []).map((estado: any) => String(estado).trim()).filter((estado: string) => estado.length > 0)
      };

      console.log('📤 Enviando dados para Edge Function:', JSON.stringify(requestBody, null, 2));

      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta completa da Edge Function:', { data, error });

      if (error) {
        console.error('❌ Erro retornado pela Edge Function:', error);
        throw new Error(error.message || 'Erro de comunicação com o servidor');
      }

      if (!data) {
        console.error('❌ Nenhuma resposta recebida');
        throw new Error('Nenhuma resposta recebida do servidor');
      }

      // Verificar se a resposta indica sucesso
      if (data.success === false) {
        console.error('❌ Edge Function retornou erro:', data.error);
        throw new Error(data.error || data.message || 'Erro desconhecido durante o monitoramento');
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
      console.error('❌ Erro completo no monitoramento:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
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
