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
  updateAvailable: boolean;
  isUpdating: boolean;
  updateApp: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDetected = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(iosDetected);
    
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Configurar detecção de atualizações do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        // Verificar se há uma atualização aguardando
        if (reg.waiting) {
          setUpdateAvailable(true);
        }

        // Listener para atualizações do service worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });

      // Listener para quando uma nova versão do SW toma controle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isUpdating) {
          window.location.reload();
        }
      });
    }

    // Verificação periódica de atualizações (a cada 30 minutos)
    const checkForUpdatesInterval = setInterval(() => {
      if (registration) {
        registration.update();
      }
    }, 30 * 60 * 1000);

    // Verificar atualizações quando o app volta do background
    const handleVisibilityChange = () => {
      if (!document.hidden && registration) {
        registration.update();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkForUpdatesInterval);
    };
  }, [registration, isUpdating]);
  
  const triggerInstallPrompt = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome !== 'accepted') {
          setDeferredPrompt(null);
        }
      }).catch(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const updateApp = () => {
    if (registration?.waiting) {
      setIsUpdating(true);
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  return (
    <PWAContext.Provider value={{ 
      deferredPrompt, 
      isStandalone, 
      isIOS, 
      triggerInstallPrompt,
      updateAvailable,
      isUpdating,
      updateApp
    }}>
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