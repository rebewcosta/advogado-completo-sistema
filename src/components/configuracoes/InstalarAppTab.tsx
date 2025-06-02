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

// Componente para o ícone de três pontinhos do menu do Chrome (Android)
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
            🎉 O JusGestão já está instalado como um aplicativo no seu
            dispositivo!
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Você pode acessá-lo diretamente pela sua lista de aplicativos ou
            tela inicial para uma experiência mais rápida e integrada.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        <TabsList className={cn(
          "grid w-full grid-cols-2 rounded-lg sm:grid-cols-4 mb-6 bg-gray-100 p-1",
          "gap-2" // Aumentado o gap para todas as telas, o grid-cols-2 já faz o empilhamento.
        )}>
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

        <TabsContent value="windows">
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Laptop className="w-5 h-5 mr-2 text-lawyer-primary" /> Instalar no Windows
              </CardTitle>
              <CardDescription>
                Instale o JusGestão como um aplicativo no seu computador Windows para acesso
                rápido e uma experiência otimizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                  <p>Para a melhor experiência e funcionalidades completas, recomendamos instalar utilizando o navegador{" "}
  <strong>Google Chrome</strong>.</p>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Passos para instalar via Google Chrome:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 pl-2">
                  <li>
                    Abra o JusGestão (
                    <a href="https://sisjusgestao.com.br" target="_blank" rel="noopener noreferrer" className="text-lawyer-accent hover:underline">
                      sisjusgestao.com.br
                    </a>
                    ) no Google Chrome.
                  </li>
                  <li>
                    Procure pelo ícone de instalação <Download className="inline h-4 w-4 mx-0.5 align-text-bottom" /> na barra de endereço (geralmente no lado direito).
                  </li>
                  <li>
                    Alternativamente, clique no menu do Chrome (três pontinhos <ChromeMenuIcon />), depois em "Instalar JusGestão..." ou uma opção similar.
                    Em alguns casos pode estar em "Salvar e compartilhar" &gt; "Criar atalho..." (certifique-se que "Abrir como janela" está marcado).
                  </li>
                  <li>Siga as instruções na tela para concluir a instalação.</li>
                </ol>
              </div>
              {!isIOS && !isStandalone && (
                canInstallPWA ? (
                  <Button onClick={triggerPWAInstall} className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Instalar Aplicativo no Windows
                  </Button>
                ) : (
                  <p className="text-sm text-orange-600 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    O botão de instalação direta não está disponível neste navegador ou o aplicativo já pode estar instalado/o prompt já foi exibido. Siga os passos manuais acima usando o Google Chrome.
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mac">
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Apple className="w-5 h-5 mr-2 text-lawyer-primary" /> Instalar no macOS
              </CardTitle>
              <CardDescription>
                Instale o JusGestão como um aplicativo no seu Mac para acesso rápido e uma
                experiência otimizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                  <p> Para a melhor experiência e funcionalidades completas, recomendamos instalar utilizando o navegador{" "}
  <strong>Google Chrome</strong>.</p>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Passos para instalar via Google Chrome:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 pl-2">
                  <li>
                    Abra o JusGestão (
                    <a href="https://sisjusgestao.com.br" target="_blank" rel="noopener noreferrer" className="text-lawyer-accent hover:underline">
                      sisjusgestao.com.br
                    </a>
                    ) no Google Chrome.
                  </li>
                  <li>
                    Procure pelo ícone de instalação <Download className="inline h-4 w-4 mx-0.5 align-text-bottom" /> na barra de endereço (geralmente no lado direito).
                  </li>
                  <li>
                    Alternativamente, clique no menu do Chrome (três pontinhos <ChromeMenuIcon />), depois em "Instalar JusGestão..." ou uma opção similar.
                  </li>
                  <li>Siga as instruções na tela para concluir a instalação.</li>
                </ol>
              </div>
              {!isIOS && !isStandalone && (
                canInstallPWA ? (
                  <Button onClick={triggerPWAInstall} className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Instalar Aplicativo no macOS
                  </Button>
                ) : (
                  <p className="text-sm text-orange-600 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    O botão de instalação direta não está disponível neste navegador ou o aplicativo já pode estar instalado/o prompt já foi exibido. Siga os passos manuais acima usando o Google Chrome.
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="android">
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Smartphone className="w-5 h-5 mr-2 text-lawyer-primary" /> Instalar em Smartphone Android
              </CardTitle>
              <CardDescription>
                Adicione o JusGestão à tela inicial do seu Android para acesso
                como um aplicativo. (Ex: Samsung, Xiaomi, Motorola, LG, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                  <p>
  Utilize o navegador{" "}
  <strong>Google Chrome</strong> para a melhor experiência de instalação.
</p>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Passos para instalar via Google Chrome:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 pl-2">
                  <li>
                    Com seu smartphone Android em mãos, abra o site{" "}
                    <a href="https://sisjusgestao.com.br" target="_blank" rel="noopener noreferrer" className="text-lawyer-accent hover:underline">
                      sisjusgestao.com.br
                    </a>{" "}
                    no navegador Google Chrome.
                  </li>
                  <li>
                    O navegador pode exibir um aviso para adicionar à tela inicial
                    automaticamente. Se sim, siga as instruções.
                  </li>
                  <li>
                    Caso não apareça, toque no menu do Chrome (três pontinhos <ChromeMenuIcon />).
                  </li>
                  <li>
                    Procure e selecione a opção "Instalar aplicativo" ou "Adicionar à tela inicial".
                  </li>
                  <li>Confirme a adição.</li>
                </ol>
              </div>
              {!isIOS && !isStandalone && (
                 canInstallPWA ? (
                  <Button onClick={triggerPWAInstall} className="w-full sm:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
                    <Download className="w-4 h-4 mr-2" /> Adicionar à Tela Inicial
                  </Button>
                ) : (
                  <p className="text-sm text-orange-600 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    Se o botão de instalação não estiver visível, siga os passos manuais no Chrome. O Chrome geralmente oferece o prompt de instalação de forma mais proeminente em dispositivos Android.
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ios">
          <Card className="shadow-md border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Apple className="w-5 h-5 mr-2 text-lawyer-primary" /> Instalar em iPhone (iOS) 
              </CardTitle>
              <CardDescription>
                Siga estes passos para adicionar o JusGestão à tela inicial do
                seu iPhone ou iPad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
                <p className="text-sm text-sky-700 flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-sky-600 flex-shrink-0" />
                  <span>A instalação em dispositivos iOS (iPhone/iPad) é feita manualmente e exclusivamente através do navegador <strong>Safari</strong>.</span>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-700">Passos para instalar via Safari:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-2">
                  <li>
                    Com seu iPhone (ou iPad) em mãos, abra o site{" "}
                    <a href="https://sisjusgestao.com.br" target="_blank" rel="noopener noreferrer" className="text-lawyer-accent hover:underline">
                      sisjusgestao.com.br
                    </a>{" "}
                    no navegador <strong>Safari</strong>.
                  </li>
                  <li>
                    Toque no ícone de <strong>Compartilhamento</strong>{" "}
                    <Share2 className="inline h-4 w-4 mx-0.5 align-text-bottom" />
                    (geralmente um quadrado com uma seta para cima, localizado
                    na barra inferior ou superior do Safari).
                  </li>
                  <li>
                    No menu de opções que aparece, role para baixo e toque em{" "}
                    <strong>"Adicionar à Tela de Início"</strong>.
                  </li>
                  <li>
                    Você poderá editar o nome do ícone (JusGestão é o
                    padrão). Toque em <strong>"Adicionar"</strong> no canto
                    superior direito.
                  </li>
                  <li>
                    Pronto! O ícone do JusGestão aparecerá na sua Tela de
                    Início.
                  </li>
                </ol>
              </div>
               <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-600">
                    ℹ️ Atualmente, o iOS não suporta um botão de instalação direta
                    do PWA como outras plataformas. O processo acima é o método
                    padrão fornecido pela Apple para adicionar aplicativos web à
                    tela inicial no Safari.
                  </p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstalarAppTab;