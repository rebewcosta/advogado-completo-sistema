
// src/components/configuracoes/InstalarAppTab.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud, Share2, CheckCircle, Info, Smartphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePWA } from '@/contexts/PWAContext';

const InstalarAppTab: React.FC = () => {
  const { 
    deferredPrompt, 
    isStandalone, 
    isIOS, 
    triggerInstallPrompt 
  } = usePWA();

  const canInstallPWA = !!deferredPrompt && !isStandalone;

  if (isStandalone) {
    return (
      <div className="max-w-lg mx-auto">
        <Alert>
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Aplicativo Instalado!</AlertTitle>
          <AlertDescription>
            O JusGestão já está instalado neste dispositivo. Você pode acessá-lo diretamente pela sua lista de aplicativos ou tela inicial.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="max-w-lg mx-auto">
        <Alert>
          <Info className="h-5 w-5" />
          <AlertTitle>Instalar no iOS (iPhone/iPad)</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Para uma experiência de aplicativo no seu dispositivo iOS:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o JusGestão no navegador Safari.</li>
              <li>Toque no ícone de Compartilhar <Share2 className="inline h-4 w-4 mx-0.5 align-middle" /> na barra de ferramentas do Safari.</li>
              <li>Role para baixo e selecione "Adicionar à Tela de Início".</li>
              <li>Confirme para adicionar o ícone à sua tela.</li>
            </ol>
            <p className="mt-2 text-xs">
              Nota: Se o banner de instalação não aparecer automaticamente, esta é a forma manual.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (canInstallPWA) { 
    return (
      <div className="space-y-6 max-w-lg mx-auto text-center">
        <Alert>
          <Smartphone className="h-5 w-5" />
          <AlertTitle>Instalar o Aplicativo JusGestão</AlertTitle>
          <AlertDescription>
            Tenha o JusGestão na tela inicial do seu dispositivo para acesso rápido e fácil, com uma experiência otimizada.
          </AlertDescription>
        </Alert>
        <Button onClick={triggerInstallPrompt} size="lg" className="w-full sm:w-auto">
          <DownloadCloud className="mr-2 h-5 w-5" /> Instalar Aplicativo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Alert>
        <Info className="h-5 w-5" />
        <AlertTitle>Instalação do Aplicativo</AlertTitle>
        <AlertDescription>
          A instalação direta do aplicativo não está disponível no momento para este navegador/dispositivo, 
          ou o prompt já foi utilizado. Tente recarregar a página ou verifique as opções do seu navegador para "Adicionar à Tela de Início".
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default InstalarAppTab;
