
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface SystemStatusCardProps {
  configuracao: any;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ configuracao }) => {
  const getEstadosText = () => {
    if (!configuracao?.estados_monitoramento?.length) {
      return "principais estados (SP, RJ, MG, CE, PR)";
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
        Sistema Integrado aos Diários Oficiais
      </CardTitle>
      <div className="text-sm text-gray-600">
        <p className="mb-2">✅ Sistema TOTALMENTE INTEGRADO e fazendo buscas reais nos sites oficiais</p>
        <div className="bg-green-50 p-3 rounded-lg space-y-1 border border-green-200">
          <p><strong>Nomes monitorados:</strong> {getNomesText()}</p>
          <p><strong>Estados:</strong> {getEstadosText()}</p>
          {configuracao?.palavras_chave?.length > 0 && (
            <p><strong>Palavras-chave:</strong> {configuracao.palavras_chave.filter((p: string) => p.trim()).join(', ')}</p>
          )}
        </div>
        <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
          🌐 <strong>Cobertura Real:</strong> São Paulo, Rio de Janeiro, Minas Gerais, Ceará, Paraná
          <br />
          📡 <strong>Tecnologia:</strong> Web scraping em tempo real dos sites oficiais
        </div>
      </div>
    </CardHeader>
  );
};

export default SystemStatusCard;
