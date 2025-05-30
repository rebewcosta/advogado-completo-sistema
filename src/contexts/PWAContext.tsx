// src/contexts/PWAContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface para o evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isStandalone: boolean;
  isIOS: boolean;
  triggerInstallPrompt: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // console.log("PWAContext: 'beforeinstallprompt' event captured.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    // console.log("PWAContext: Event listener for 'beforeinstallprompt' added.");

    // Verifica se está em modo standalone
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iosDetected);
    
    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      // console.log("PWAContext: App installed successfully!");
      setIsStandalone(true); // Atualiza o estado para standalone
      setDeferredPrompt(null); // Limpa o prompt
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      // console.log("PWAContext: Event listeners for PWA removed.");
    };
  }, []);
  
  const triggerInstallPrompt = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          // console.log('PWAContext: User accepted the A2HS prompt');
          // O prompt é limpo automaticamente pelo listener 'appinstalled' ou pode ser limpo aqui se necessário
        } else {
          // console.log('PWAContext: User dismissed the A2HS prompt');
        }
        // Não precisamos mais do prompt após a tentativa, independente do resultado,
        // pois o navegador geralmente não permite chamá-lo múltiplas vezes em curto período.
        // O evento 'appinstalled' cuidará de limpar o prompt se a instalação for bem-sucedida.
        // Se dispensado, o navegador pode oferecer o prompt novamente mais tarde, ou não.
        // Para permitir que o usuário tente de novo se dispensou (e o navegador permitir),
        // não limpe o deferredPrompt aqui, mas o HeroSection e outros componentes devem
        // ser atualizados para refletir que o prompt já foi usado.
        // No entanto, para esta funcionalidade de botão, após uma tentativa, o estado do deferredPrompt
        // pode não ser mais válido imediatamente. O mais seguro é limpar após o `userChoice`.
         setDeferredPrompt(null); 
      });
    }
  };

  return (
    <PWAContext.Provider value={{ deferredPrompt, isStandalone, isIOS, triggerInstallPrompt }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};