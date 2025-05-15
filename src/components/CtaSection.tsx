
import React from 'react';
import { Button } from '@/components/ui/button';

const CtaSection = () => {
  const handleWhatsAppContact = () => {
    window.open('https://wa.me/5588999981618', '_blank');
  };

  return (
    <section className="bg-lawyer-primary py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Pronto para otimizar a gestão do seu escritório?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Acesso Mensal por apenas R$99,90. Cancele quando quiser.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={handleWhatsAppContact}
            size="lg" 
            className="bg-white text-lawyer-primary hover:bg-gray-100"
          >
            Entre em contato
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
