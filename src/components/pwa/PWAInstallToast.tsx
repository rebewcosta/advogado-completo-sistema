
// src/components/pwa/PWAInstallToast.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PWAInstallToastProps {
  onClose: () => void;
}

const PWAInstallToast: React.FC<PWAInstallToastProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguarda a animação terminar
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={`shadow-lg border-l-4 border-l-lawyer-primary transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-lawyer-primary" />
                <h4 className="font-medium text-sm">Instalação do App</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Você pode instalar o JusGestão a qualquer momento acessando 
                <span className="font-medium text-lawyer-primary"> Configurações → Aplicativo</span>.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallToast;
