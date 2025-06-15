
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface AlertHeaderProps {
  isLoading: boolean;
  isGenerating: boolean;
  onRefresh: () => void;
  onGenerateAlerts: () => void;
}

export const AlertHeader: React.FC<AlertHeaderProps> = ({
  isLoading,
  isGenerating,
  onRefresh,
  onGenerateAlerts
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Histórico de Alertas
          </CardTitle>
          <CardDescription>
            Gerencie e visualize todos os alertas de prazos
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            size="sm" 
            onClick={onGenerateAlerts}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Spinner />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Gerar Alertas
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
