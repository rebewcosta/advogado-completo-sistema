
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Database, HardDrive } from 'lucide-react';
import { useDocumentos, LIMITE_ARMAZENAMENTO_MB, LIMITE_ARMAZENAMENTO_BYTES } from '@/hooks/useDocumentos';

const DocumentoStorageInfo = () => {
  const [porcentagemUso, setPorcentagemUso] = useState<number>(0);
  const { usoAtual, espacoDisponivel, formatarTamanhoArquivo, isRefreshing } = useDocumentos();

  useEffect(() => {
    if (usoAtual > 0) {
      // Calcular porcentagem
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center mb-2">
        <HardDrive className="mr-2 h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Armazenamento ({LIMITE_ARMAZENAMENTO_MB}MB)</h3>
      </div>
      
      {isRefreshing ? (
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
