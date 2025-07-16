import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/contexts/PWAContext';
import { useToast } from '@/hooks/use-toast';

const PWAUpdateToast: React.FC = () => {
  const { updateAvailable, isUpdating, updateApp } = usePWA();
  const { toast, dismiss } = useToast();

  React.useEffect(() => {
    if (updateAvailable) {
      const toastId = toast({
        title: "Nova atualização disponível!",
        description: "Uma nova versão do aplicativo está pronta para ser instalada.",
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                updateApp();
                dismiss();
              }}
              disabled={isUpdating}
              className="h-8"
            >
              {isUpdating ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {isUpdating ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dismiss()}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ),
        duration: 0, // Toast permanente até o usuário decidir
      });

      return () => {
        if (toastId) {
          dismiss();
        }
      };
    }
  }, [updateAvailable, isUpdating, updateApp, toast, dismiss]);

  return null; // Este componente não renderiza nada visualmente
};

export default PWAUpdateToast;