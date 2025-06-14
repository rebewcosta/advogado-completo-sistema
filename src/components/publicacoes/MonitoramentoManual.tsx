
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
      
      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: {
          user_id: user.id,
          nomes: configuracao.nomes_monitoramento || [],
          estados: configuracao.estados_monitoramento || [],
          palavras_chave: configuracao.palavras_chave || []
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }

      console.log('Resultado do monitoramento:', data);
      setLastResult(data);
      
      toast({
        title: "Monitoramento Concluído",
        description: `Encontradas ${data.publicacoes_encontradas} publicações em ${data.fontes_consultadas} fontes`
      });

      onMonitoramentoCompleto();
      
    } catch (error: any) {
      console.error('Erro no monitoramento:', error);
      toast({
        title: "Erro no Monitoramento",
        description: error.message || "Ocorreu um erro durante o monitoramento",
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
          <Play className="h-5 w-5" />
          Monitoramento Manual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Execute uma busca manual nas fontes de diários oficiais configuradas.
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
              <div>📄 {lastResult.publicacoes_encontradas} publicações encontradas</div>
              <div>🔍 {lastResult.fontes_consultadas} fontes consultadas</div>
              <div>⏱️ {lastResult.tempo_execucao}s de execução</div>
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
