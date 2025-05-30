// src/contexts/PWAContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    // console.log("PWAContext: useEffect running to add listeners.");
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // console.log("PWAContext: 'beforeinstallprompt' event captured.", e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iosDetected);
    
    const handleAppInstalled = () => {
      // console.log("PWAContext: App installed successfully via 'appinstalled' event!");
      setIsStandalone(true);
      setDeferredPrompt(null); // Limpar o prompt após a instalação bem-sucedida
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
        // console.log('PWAContext: User choice:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          // O listener 'appinstalled' deve cuidar de setar isStandalone e limpar deferredPrompt.
          // Não é estritamente necessário limpar o deferredPrompt aqui se 'appinstalled' for confiável.
        } else {
          // Usuário dispensou. O deferredPrompt pode não ser reutilizável imediatamente.
          // Para simplificar, vamos setar para null para que o botão de instalar não apareça mais
          // até que o navegador dispare 'beforeinstallprompt' novamente.
          setDeferredPrompt(null);
        }
      }).catch(error => {
        // console.error("PWAContext: Error during userChoice or prompt:", error);
        // Mesmo em caso de erro, pode ser bom limpar o prompt para evitar estados estranhos.
        setDeferredPrompt(null);
      });
    } else {
      // console.warn("PWAContext: triggerInstallPrompt called but deferredPrompt is null.");
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
    // Este erro é uma causa comum de problemas se o provider não estiver configurado corretamente.
    console.error("usePWA must be used within a PWAProvider. Make sure PWAProvider wraps your App.");
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};