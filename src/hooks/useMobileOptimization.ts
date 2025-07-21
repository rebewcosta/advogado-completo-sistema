import { useEffect } from 'react';

export const useMobileOptimization = () => {
  useEffect(() => {
    // Configurar viewport meta tag dinamicamente para dispositivos móveis
    const setViewportMetaTag = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    };

    // Prevenir zoom em inputs no iOS
    const preventZoomOnFocus = () => {
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const element = input as HTMLElement;
        if (element.style.fontSize) return;
        
        // Garantir que o font-size seja pelo menos 16px para prevenir zoom no iOS
        element.style.fontSize = '16px';
      });
    };

    // Ajustar altura da viewport para mobile considerando barra de endereço
    const adjustViewportHeight = () => {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
      });

      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    };

    // Melhorar scrolling em mobile
    const improveMobileScrolling = () => {
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      document.body.style.overflowY = 'auto';
    };

    // Executar otimizações
    setViewportMetaTag();
    const cleanup = adjustViewportHeight();
    improveMobileScrolling();
    
    // Aplicar prevenção de zoom com delay para aguardar carregamento completo
    setTimeout(preventZoomOnFocus, 100);

    return cleanup;
  }, []);
};