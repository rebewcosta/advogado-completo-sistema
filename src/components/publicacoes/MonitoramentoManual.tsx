
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMonitoramentoManual } from '@/hooks/useMonitoramentoManual';
import SystemStatusCard from './SystemStatusCard';
import MonitoringButton from './MonitoringButton';
import MonitoringStatus from './MonitoringStatus';
import MonitoringResult from './MonitoringResult';

interface MonitoramentoManualProps {
  configuracao: any;
  onMonitoramentoCompleto: () => void;
}

const MonitoramentoManual: React.FC<MonitoramentoManualProps> = ({
  configuracao,
  onMonitoramentoCompleto
}) => {
  const { isMonitoring, lastResult, executarMonitoramento } = useMonitoramentoManual(
    configuracao,
    onMonitoramentoCompleto
  );

  const getNomesText = () => {
    const nomes = configuracao?.nomes_monitoramento?.filter((n: string) => n.trim()) || [];
    return nomes.length > 0 ? nomes.join(', ') : 'Nenhum';
  };

  const isDisabled = isMonitoring || !configuracao?.monitoramento_ativo || getNomesText() === 'Nenhum';

  return (
    <Card>
      <SystemStatusCard configuracao={configuracao} />
      <CardContent className="space-y-4">
        <MonitoringButton 
          isMonitoring={isMonitoring}
          isDisabled={isDisabled}
          onClick={executarMonitoramento}
        />

        <MonitoringStatus 
          isMonitoring={isMonitoring}
          configuracao={configuracao}
          getNomesText={getNomesText}
        />

        <MonitoringResult lastResult={lastResult} />
      </CardContent>
    </Card>
  );
};

export default MonitoramentoManual;
