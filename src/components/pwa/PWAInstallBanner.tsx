
// src/components/pwa/PWAInstallBanner.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lawyer-primary/10 rounded-lg">
                <Smartphone className="h-6 w-6 text-lawyer-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Instale o App JusGestão</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Tenha o JusGestão na sua tela inicial para acesso rápido e fácil! 
            Aproveite uma experiência otimizada e sem interrupções.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onInstall} className="flex-1 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Instalar Aplicativo
            </Button>
            <Button variant="outline" onClick={onDismiss} className="flex-1">
              Agora Não
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallBanner;
