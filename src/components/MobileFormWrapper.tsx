import React, { useEffect, useState } from 'react';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormWrapper = ({ children, className = '' }: MobileFormWrapperProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Garantir que o viewport está configurado corretamente
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');

      // Ajustar altura para dispositivos móveis
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
    }
  }, [isMobile]);

  const wrapperClasses = `
    ${className}
    ${isMobile ? 'mobile-form-container' : ''}
    ${isMobile ? 'pb-safe' : ''}
  `;

  return (
    <div className={wrapperClasses.trim()}>
      {children}
    </div>
  );
};