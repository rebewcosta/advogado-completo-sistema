
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Search } from 'lucide-react';

interface MonitoringButtonProps {
  isMonitoring: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const MonitoringButton: React.FC<MonitoringButtonProps> = ({
  isMonitoring,
  isDisabled,
  onClick
}) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isDisabled}
      className="w-full bg-green-600 hover:bg-green-700"
      size="lg"
    >
      {isMonitoring ? (
        <>
          <Clock className="h-4 w-4 mr-2 animate-spin" />
          Consultando sites oficiais em tempo real...
        </>
      ) : (
        <>
          <Search className="h-4 w-4 mr-2" />
          Buscar Publicações Reais Agora
        </>
      )}
    </Button>
  );
};

export default MonitoringButton;
