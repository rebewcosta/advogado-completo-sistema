// src/components/configuracoes/InstalarAppTab.tsx
import React from 'react';
import { usePWAInstall } from '@/App';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Smartphone,
  Laptop,
  Apple,
  Download,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const ChromeMenuIcon = () => (
  <svg
    className="inline h-4 w-4 mx-0.5 align-text-bottom"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const InstalarAppTab: React.FC = () => {
  const pwaInstall = usePWAInstall();
  const canInstallPWA = pwaInstall?.canInstallPWA || false;
  const triggerPWAInstall =
    pwaInstall?.triggerPWAInstall ||
    (() => console.warn('PWA install logic not available.'));
  const isIOS = pwaInstall?.isIOS || false;
  const isStandalone = pwaInstall?.isStandalone || false;

  if (isStandalone) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-green-700 flex items-center">
            <Download className="w-6 h-6 mr-3 text-green-600" />
            Aplicativo Instalado!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-gray-800">
            🎉 O JusGestão já está instalado como um aplicativo no seu dispositivo!
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Você pode acessá-lo diretamente pela sua lista de aplicativos ou
            tela inicial para uma experiência mais rápida e integrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  const AlertaChrome = (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-sm text-blue-700 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
        Para a melhor experiência e funcionalidades completas, recomendamos instalar utilizando o navegador{' '}
        <strong>Google Chrome</strong>.
      </p>
    </div>
  );

  const AlertaAndroid = (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-sm text-blue-700 flex items-start">
        <AlertTriangle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
        <span>
          Utilize o navegador <strong>Google Chrome</strong> para a melhor experiência de instalação.
        </span>
      </p>
    </div>
  );

  const AlertaIOS = (
    <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
      <p className="text-sm text-sky-700 flex items-start">
        <AlertTriangle className="w-5 h-5 mr-2 text-sky-600 flex-shrink-0" />
        <span>
          A instalação em dispositivos iOS (iPhone/iPad) é feita manualmente e exclusivamente através do navegador <strong>Safari</strong>.
        </span>
      </p>
    </div>
  );

  const BotaoInstalar = (label: string) =>
    canInstallPWA ? (
      <Button
        onClick={triggerPWAInstall}
        className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
      >
        <Download className="w-4 h-4 mr-2" /> {label}
      </Button>
    ) : (
      <p className="text-sm text-orange-600 p-3 bg-orange-50 border border-orange-200 rounded-md">
        O botão de instalação direta não está disponível neste navegador ou o aplicativo já pode estar instalado/o prompt já foi exibido. Siga os passos manuais acima usando o Google Chrome.
      </p>
    );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800">Instalar Aplicativo JusGestão</h3>
        <p className="text-sm text-gray-600">
          Instale o JusGestão em seus dispositivos para acesso rápido e funcionalidades offline.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="windows" className="w-full">
        <TabsList
          className={cn(
            'grid w-full grid-cols-2 rounded-lg sm:grid-cols-4 mb-6 bg-gray-100 p-1',
            'gap-2'
          )}
        >
          <TabsTrigger value="windows" className="text-xs sm:text-sm py-2 data-[state=active]:bg-lawyer-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Laptop className="w-4 h-4 mr-1.5" />
            Windows
          </TabsTrigger>
          <TabsTrigger value="mac" className="text-xs sm:text-sm py-2 data-[state=active]:bg-lawyer-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Apple className="w-4 h-4 mr-1.5" />
            macOS
          </TabsTrigger>
          <TabsTrigger value="android" className="text-xs sm:text-sm py-2 data-[state=active]:bg-lawyer-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Smartphone className="w-4 h-4 mr-1.5" />
            Android
          </TabsTrigger>
          <TabsTrigger value="ios" className="text-xs sm:text-sm py-2 data-[state=active]:bg-lawyer-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Smartphone className="w-4 h-4 mr-1.5" />
            iPhone
          </TabsTrigger>
        </TabsList>

        {/* Conteúdos das tabs serão adicionados aqui. */}
        {/* Deixe-me saber se você deseja que eu continue com os blocos restantes. */}
      </Tabs>
    </div>
  );
};

export default InstalarAppTab;
