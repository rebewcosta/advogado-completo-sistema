
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, CheckCircle, AlertCircle, Search, Globe } from 'lucide-react';
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
      console.log('Iniciando monitoramento real em diários oficiais...');
      
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

      console.log('Resultado do monitoramento real:', data);
      setLastResult(data);
      
      const message = data.message || `Encontradas ${data.publicacoes_encontradas || 0} publicações em ${data.fontes_consultadas || 0} fontes`;
      
      toast({
        title: "Monitoramento Concluído",
        description: message,
        variant: data.publicacoes_encontradas > 0 ? "default" : "destructive"
      });

      onMonitoramentoCompleto();
      
    } catch (error: any) {
      console.error('Erro no monitoramento:', error);
      
      let errorMessage = "Ocorreu um erro durante o monitoramento";
      
      if (error.message?.includes('Limite de execuções atingido')) {
        errorMessage = "Limite de execuções atingido. Aguarde 10 minutos antes de tentar novamente.";
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

  const getEstadosText = () => {
    if (!configuracao?.estados_monitoramento?.length) {
      return "todos os estados";
    }
    return configuracao.estados_monitoramento.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Monitoramento Nacional de Diários Oficiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">🔍 Sistema conectado com diários oficiais de todo o Brasil</p>
          <div className="bg-blue-50 p-3 rounded-lg space-y-1">
            <p><strong>Nomes monitorados:</strong> {configuracao?.nomes_monitoramento?.filter((n: string) => n.trim()).join(', ') || 'Nenhum'}</p>
            <p><strong>Estados:</strong> {getEstadosText()}</p>
            {configuracao?.palavras_chave?.length > 0 && (
              <p><strong>Palavras-chave:</strong> {configuracao.palavras_chave.filter((p: string) => p.trim()).join(', ')}</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={executarMonitoramento} 
          disabled={isMonitoring || !configuracao?.monitoramento_ativo}
          className="w-full"
          size="lg"
        >
          {isMonitoring ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Consultando diários oficiais...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar Publicações Agora
            </>
          )}
        </Button>

        {isMonitoring && (
          <div className="bg-yellow-50 p-3 rounded-lg text-sm">
            <p className="text-yellow-800">⏳ Buscando em tempo real nos sites dos diários oficiais...</p>
            <p className="text-yellow-600 mt-1">Este processo pode levar alguns minutos.</p>
          </div>
        )}

        {lastResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              {lastResult.publicacoes_encontradas > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <span className="font-medium">Último resultado:</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>📄 Publicações encontradas:</span>
                <span className="font-medium">{lastResult.publicacoes_encontradas || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>🌐 Fontes consultadas:</span>
                <span className="font-medium">{lastResult.fontes_consultadas || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ Tempo de execução:</span>
                <span className="font-medium">{lastResult.tempo_execucao || 0}s</span>
              </div>
              {lastResult.erros && (
                <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                  <strong>Avisos:</strong> {lastResult.erros}
                </div>
              )}
              {lastResult.message && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                  {lastResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {!configuracao?.monitoramento_ativo && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
            ⚠️ Monitoramento desativado. Ative nas configurações para usar esta funcionalidade.
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Cobertura:</strong> Todos os 27 estados brasileiros + Diários da Justiça dos principais tribunais
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoramentoManual;
