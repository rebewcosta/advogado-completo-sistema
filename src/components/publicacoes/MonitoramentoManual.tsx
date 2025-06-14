
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
      console.log('Iniciando monitoramento com configuração:', configuracao);
      
      const requestBody = {
        user_id: user.id,
        nomes: configuracao.nomes_monitoramento.filter((nome: string) => nome.trim() !== ''),
        estados: configuracao.estados_monitoramento || [],
        palavras_chave: configuracao.palavras_chave?.filter((palavra: string) => palavra.trim() !== '') || []
      };

      console.log('Dados da requisição:', requestBody);

      const { data, error } = await supabase.functions.invoke('monitorar-publicacoes', {
        body: requestBody
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro na função:', error);
        
        // Tratar diferentes tipos de erro
        let errorMessage = "Erro durante o monitoramento";
        
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          errorMessage = "Limite de execuções atingido. Aguarde alguns minutos antes de tentar novamente.";
        } else if (error.message?.includes('timeout')) {
          errorMessage = "Timeout na execução. Tente novamente em alguns minutos.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Monitoramento concluído com sucesso:', data);
      setLastResult(data);
      
      const message = data?.message || `Encontradas ${data?.publicacoes_encontradas || 0} publicações em ${data?.fontes_consultadas || 0} fontes`;
      
      toast({
        title: "Monitoramento Concluído",
        description: message,
        variant: data?.publicacoes_encontradas > 0 ? "default" : "default"
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

  const getEstadosText = () => {
    if (!configuracao?.estados_monitoramento?.length) {
      return "todos os estados";
    }
    return configuracao.estados_monitoramento.join(', ');
  };

  const getNomesText = () => {
    const nomes = configuracao?.nomes_monitoramento?.filter((n: string) => n.trim()) || [];
    return nomes.length > 0 ? nomes.join(', ') : 'Nenhum';
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
            <p><strong>Nomes monitorados:</strong> {getNomesText()}</p>
            <p><strong>Estados:</strong> {getEstadosText()}</p>
            {configuracao?.palavras_chave?.length > 0 && (
              <p><strong>Palavras-chave:</strong> {configuracao.palavras_chave.filter((p: string) => p.trim()).join(', ')}</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={executarMonitoramento} 
          disabled={isMonitoring || !configuracao?.monitoramento_ativo || getNomesText() === 'Nenhum'}
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

        {getNomesText() === 'Nenhum' && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            ⚠️ Nenhum nome configurado para monitoramento. Configure pelo menos um nome nas configurações.
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
