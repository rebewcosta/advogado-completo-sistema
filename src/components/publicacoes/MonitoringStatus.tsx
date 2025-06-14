
import React from 'react';

interface MonitoringStatusProps {
  isMonitoring: boolean;
  configuracao: any;
  getNomesText: () => string;
}

const MonitoringStatus: React.FC<MonitoringStatusProps> = ({
  isMonitoring,
  configuracao,
  getNomesText
}) => {
  if (isMonitoring) {
    return (
      <div className="bg-blue-50 p-3 rounded-lg text-sm border border-blue-200">
        <p className="text-blue-800">🔄 Fazendo busca real nos sites dos diários oficiais...</p>
        <p className="text-blue-600 mt-1">Aguarde, estamos processando dados reais dos diários.</p>
      </div>
    );
  }

  if (!configuracao?.monitoramento_ativo) {
    return (
      <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
        ⚠️ Monitoramento desativado. Ative nas configurações para usar esta funcionalidade.
      </div>
    );
  }

  if (getNomesText() === 'Nenhum') {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
        ⚠️ Nenhum nome configurado para monitoramento. Configure pelo menos um nome nas configurações.
      </div>
    );
  }

  return null;
};

export default MonitoringStatus;
