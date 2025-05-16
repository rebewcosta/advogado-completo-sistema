
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Database, HardDrive, RefreshCw } from 'lucide-react';
import { useDocumentos, LIMITE_ARMAZENAMENTO_MB, LIMITE_ARMAZENAMENTO_BYTES } from '@/hooks/useDocumentos';
import { Button } from '@/components/ui/button';

const DocumentoStorageInfo = () => {
  const [porcentagemUso, setPorcentagemUso] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { 
    usoAtual, 
    espacoDisponivel, 
    formatarTamanhoArquivo, 
    isRefreshing, 
    calcularEspacoDisponivel 
  } = useDocumentos();

  useEffect(() => {
    // Calcular porcentagem de uso apenas quando usoAtual for atualizado
    if (LIMITE_ARMAZENAMENTO_BYTES > 0) {
      const porcentagem = Math.min((usoAtual / LIMITE_ARMAZENAMENTO_BYTES) * 100, 100);
      setPorcentagemUso(porcentagem);
    }
  }, [usoAtual]);

  // Determinar a cor da barra de progresso com base na porcentagem de uso
  const getProgressColor = () => {
    if (porcentagemUso < 70) return 'bg-green-500';
    if (porcentagemUso < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Função para atualizar manualmente o espaço
  const handleRefresh = async () => {
    try {
      setError(null);
      await calcularEspacoDisponivel();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === 'object' && err !== null ? JSON.stringify(err) : 
                          String(err);
      setError(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <HardDrive className="mr-2 h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Armazenamento ({LIMITE_ARMAZENAMENTO_MB}MB)</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
          title="Atualizar informações de armazenamento"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Atualizar</span>
        </Button>
      </div>
      
      {error ? (
        <div className="p-2 text-xs text-red-600 bg-red-50 rounded mb-2">
          Erro ao atualizar informações: {error}
        </div>
      ) : isRefreshing ? (
        <div className="h-2 w-full bg-gray-100 rounded animate-pulse"></div>
      ) : (
        <>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{formatarTamanhoArquivo(usoAtual)} usado</span>
            <span>{formatarTamanhoArquivo(espacoDisponivel)} livre</span>
          </div>
          
          <Progress 
            value={porcentagemUso} 
            className={`h-2 ${getProgressColor()}`}
          />
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <Database className="h-3 w-3 mr-1" />
            <span>
              {porcentagemUso > 90 
                ? "Seu armazenamento está quase cheio!" 
                : `${porcentagemUso.toFixed(1)}% do armazenamento utilizado`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentoStorageInfo;
