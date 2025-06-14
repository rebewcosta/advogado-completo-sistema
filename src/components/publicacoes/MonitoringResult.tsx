
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface MonitoringResultProps {
  lastResult: any;
}

const MonitoringResult: React.FC<MonitoringResultProps> = ({ lastResult }) => {
  if (!lastResult) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        {lastResult.publicacoes_encontradas > 0 ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-orange-500" />
        )}
        <span className="font-medium">Último resultado (busca real):</span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>📄 Publicações encontradas:</span>
          <span className="font-medium text-green-700">{lastResult.publicacoes_encontradas || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>🌐 Fontes consultadas:</span>
          <span className="font-medium">{lastResult.fontes_consultadas || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>⏱️ Tempo de execução:</span>
          <span className="font-medium">{lastResult.tempo_execucao || 0}s</span>
        </div>
        <div className="flex justify-between">
          <span>🔗 Status da integração:</span>
          <span className="font-medium text-green-600">{lastResult.status_integracao || 'INTEGRADO'}</span>
        </div>
        {lastResult.erros && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-700 text-xs border border-yellow-200">
            <strong>Avisos:</strong> {lastResult.erros}
          </div>
        )}
        {lastResult.message && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs border border-blue-200">
            {lastResult.message}
          </div>
        )}
        {lastResult.detalhes_busca && (
          <div className="mt-2 p-2 bg-green-50 rounded text-green-700 text-xs border border-green-200">
            <strong>Detalhes da busca:</strong>
            <br />• Estados consultados: {lastResult.detalhes_busca.estados_consultados?.join(', ')}
            <br />• Nomes buscados: {lastResult.detalhes_busca.nomes_buscados?.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringResult;
