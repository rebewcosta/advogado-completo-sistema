
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface SystemStatusCardProps {
  configuracao: any;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ configuracao }) => {
  const getEstadosText = () => {
    if (!configuracao?.estados_monitoramento?.length) {
      return "TODOS OS 27 ESTADOS DO BRASIL (SP, RJ, MG, CE, PR, RS, SC, BA, GO, PE, ES, DF, MT, MS, PA, AM, RO, AC, RR, AP, TO, MA, PI, AL, SE, PB, RN)";
    }
    return configuracao.estados_monitoramento.join(', ');
  };

  const getNomesText = () => {
    const nomes = configuracao?.nomes_monitoramento?.filter((n: string) => n.trim()) || [];
    return nomes.length > 0 ? nomes.join(', ') : 'Nenhum';
  };

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Database className="h-5 w-5 text-green-600" />
        Sistema Integrado aos Diários Oficiais do Brasil - COBERTURA NACIONAL COMPLETA
      </CardTitle>
      <div className="text-sm text-gray-600">
        <p className="mb-2">✅ Sistema TOTALMENTE INTEGRADO fazendo buscas reais em TODO O BRASIL</p>
        <div className="bg-green-50 p-3 rounded-lg space-y-1 border border-green-200">
          <p><strong>Nomes monitorados:</strong> {getNomesText()}</p>
          <p><strong>Cobertura:</strong> {getEstadosText()}</p>
          {configuracao?.palavras_chave?.length > 0 && (
            <p><strong>Palavras-chave:</strong> {configuracao.palavras_chave.filter((p: string) => p.trim()).join(', ')}</p>
          )}
        </div>
        <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
          COBERTURA NACIONAL COMPLETA: Todos os 27 estados brasileiros
          <br />
          📡 <strong>Tecnologia:</strong> Web scraping em tempo real dos sites oficiais
          <br />
          🌐 <strong>Estados cobertos:</strong> SP, RJ, MG, CE, PR, RS, SC, BA, GO, PE, ES, DF, MT, MS, PA, AM, RO, AC, RR, AP, TO, MA, PI, AL, SE, PB, RN
          <br />
          ⚡ <strong>Busca simultânea:</strong> Consulta paralela em todos os diários oficiais do Brasil
        </div>
      </div>
    </CardHeader>
  );
};

export default SystemStatusCard;
