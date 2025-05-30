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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { usePWAInstall } from '../App';

const Index = () => {
  const { user, signOut } = useAuth();
  const pwaInstall = usePWAInstall(); // A variável correta é 'pwaInstall'

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {user && (
        <div className="bg-gradient-to-r from-lawyer-dark to-blue-800 shadow-md">
          <div className="container mx-auto py-2 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-white text-sm md:text-base font-medium">
                Bem-vindo, <span className="font-semibold">{user.user_metadata?.nome || user.email?.split('@')[0]}</span>
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-1 text-white hover:bg-white/10"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4" /> 
              <span className="text-xs md:text-sm">Sair</span>
            </Button>
          </div>
        </div>
      )}
      <main className="flex-grow">
        <HeroSection 
          showPWAInstallBanner={pwaInstall?.showPWAInstallBanner || false}
          canInstallPWA={pwaInstall?.canInstallPWA || false}
          isIOS={pwaInstall?.isIOS || false}
          isStandalone={pwaInstall?.isStandalone || false} // <<< CORREÇÃO AQUI
          onInstallPWA={pwaInstall?.triggerPWAInstall}
          onDismissInstallBanner={pwaInstall?.dismissPWAInstallBanner}
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