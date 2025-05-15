
import React from 'react';
import { Check } from 'lucide-react';

const AboutSection = () => {
  const benefits = [
    "Aumento de produtividade",
    "Organização simplificada",
    "Controle financeiro detalhado",
    "Redução de erros e esquecimentos",
    "Acesso remoto a processos e dados",
    "Segurança e backup de informações",
    "Otimização do tempo da equipe",
    "Interface intuitiva e fácil de usar"
  ];

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Sobre o Sistema</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                O Sistema de Advocacia foi desenvolvido para atender às necessidades específicas de escritórios jurídicos de todos os tamanhos. Nossa plataforma permite que você gerencie todos os aspectos do seu escritório em um único lugar.
              </p>
              <p className="text-gray-700">
                Com uma interface intuitiva e funcionalidades avançadas, você pode aumentar a produtividade e melhorar o atendimento aos seus clientes.
              </p>
              <p className="text-gray-700">
                Desenvolvido por profissionais com experiência no setor jurídico, nosso sistema considera as particularidades da rotina advocatícia, trazendo soluções que realmente fazem a diferença no dia a dia do escritório.
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Benefícios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <Check className="text-green-500 h-5 w-5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2">Suporte técnico especializado</h4>
              <p className="text-gray-600 mb-4">
                Nossa equipe de suporte está disponível para ajudar em qualquer dificuldade que você possa ter com o sistema.
              </p>
              <button className="bg-lawyer-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Fale com o suporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
