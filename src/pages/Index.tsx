
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar sempre visível */}
      <Navbar />
      
      {/* Cabeçalho adicional apenas para usuários logados */}
      {user && (
        <>
          {/* Cabeçalho Mobile - Apenas para smartphone */}
          <MobileHeader />
          
          {/* Cabeçalho Desktop - Apenas para desktop */}
          <div className="hidden md:block bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 shadow-lg border-b border-blue-800/20">
            <div className="container mx-auto py-3 px-4 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                <p className="text-white text-sm md:text-base font-medium">
                  Bem-vindo de volta, <span className="font-semibold text-blue-200">{user.user_metadata?.nome || user.email?.split('@')[0]}</span>
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
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
