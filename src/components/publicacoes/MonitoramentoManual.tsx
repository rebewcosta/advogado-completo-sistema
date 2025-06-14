
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MonitoramentoManualProps {
  configuracao: any;
  onMonitoramentoCompleto: () => void;
}

const MonitoramentoManual: React.FC<MonitoramentoManualProps> = ({
  configuracao,
  onMonitoramentoCompleto
}) => {
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

    setIsMonitoring(true);
    
    try {
      console.log('Iniciando monitoramento manual...');
      
      // Input validation before sending to edge function
      const requestBody = {
        user_id: user.id,
        nomes: configuracao.nomes_monitoramento || [],
        estados: configuracao.estados_monitoramento || [],
        palavras_chave: configuracao.palavras_chave || []
      };

      // Validate input locally first
      if (!requestBody.nomes.length) {
        throw new Error('Pelo menos um nome deve ser configurado para monitoramento');
      }

      if (requestBody.nomes.some((nome: string) => nome.length > 100)) {
        throw new Error('Nome muito longo. Máximo de 100 caracteres por nome.');
      }

      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: requestBody
      });

      if (error) {
        console.error('Erro na função:', error);
        throw new Error(error.message || 'Erro interno do servidor');
      }

      console.log('Resultado do monitoramento:', data);
      setLastResult(data);
      
      toast({
        title: "Monitoramento Concluído",
        description: `Encontradas ${data.publicacoes_encontradas || 0} publicações em ${data.fontes_consultadas || 0} fontes`
      });

      onMonitoramentoCompleto();
      
    } catch (error: any) {
      console.error('Erro no monitoramento:', error);
      
      let errorMessage = "Ocorreu um erro durante o monitoramento";
      
      if (error.message?.includes('Rate limit exceeded')) {
        errorMessage = "Limite de execuções atingido. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error.message?.includes('Invalid input')) {
        errorMessage = "Dados de configuração inválidos. Verifique suas configurações.";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Monitoramento Seguro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Execute uma busca segura nas fontes de diários oficiais configuradas.
        </div>
        
        <Button 
          onClick={executarMonitoramento} 
          disabled={isMonitoring || !configuracao?.monitoramento_ativo}
          className="w-full"
        >
          {isMonitoring ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Executando monitoramento...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Executar Monitoramento Agora
            </>
          )}
        </Button>

        {lastResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastResult.publicacoes_encontradas > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="font-medium text-sm">Último resultado:</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>📄 {lastResult.publicacoes_encontradas || 0} publicações encontradas</div>
              <div>🔍 {lastResult.fontes_consultadas || 0} fontes consultadas</div>
              <div>⏱️ {lastResult.tempo_execucao || 0}s de execução</div>
              {lastResult.erros && (
                <div className="text-red-600">⚠️ Erros: {lastResult.erros}</div>
              )}
            </div>
          </div>
        )}

        {!configuracao?.monitoramento_ativo && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Monitoramento desativado. Ative nas configurações para usar esta funcionalidade.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoramentoManual;
