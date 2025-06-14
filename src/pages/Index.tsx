
// src/pages/Index.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import CtaSection from '../components/CtaSection';
import MobileHeader from '../components/MobileHeader';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/contexts/PWAContext';

const Index = () => {
  const { user } = useAuth();
  const { 
    deferredPrompt, 
    isStandalone, 
    isIOS, 
    triggerInstallPrompt 
  } = usePWA();

  // PWA install logic
  const canInstallPWA = !!deferredPrompt && !isStandalone;
  const showPWAInstallBanner = canInstallPWA;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar sempre visível */}
      <Navbar />
      
      {/* Cabeçalho adicional apenas para usuários logados - REMOVIDO O BOTÃO SAIR DUPLICADO */}
      {user && (
        <>
          {/* Cabeçalho Mobile - Apenas para smartphone */}
          <MobileHeader />
          
          {/* Cabeçalho Desktop - Apenas para desktop - SEM BOTÃO SAIR */}
          <div className="hidden md:block bg-gradient-to-r from-lawyer-dark to-blue-800 shadow-md">
            <div className="container mx-auto py-2 px-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <p className="text-white text-sm md:text-base font-medium">
                  Bem-vindo, <span className="font-semibold">{user.user_metadata?.nome || user.email?.split('@')[0]}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      <main className="flex-grow">
        <HeroSection 
          showPWAInstallBanner={showPWAInstallBanner}
          canInstallPWA={canInstallPWA}
          isIOS={isIOS}
          isStandalone={isStandalone}
          onInstallPWA={triggerInstallPrompt}
          onDismissInstallBanner={() => {}}
        />
        <FeaturesSection />
        <AboutSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
