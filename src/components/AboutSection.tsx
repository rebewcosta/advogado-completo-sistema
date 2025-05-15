
import React from 'react';
import { Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <section id="about" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Sobre o Sistema</h2>
          <div className="w-20 h-1 bg-lawyer-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-gray-600">
            Desenvolvido para revolucionar a gestão do seu escritório de advocacia
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 items-stretch">
          <div className="md:w-1/2 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:shadow-xl border border-gray-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">
              A evolução da advocacia digital
            </h3>
            <div className="space-y-5 text-gray-700">
              <p>
                O <span className="font-semibold text-lawyer-primary">JusGestão</span> foi meticulosamente projetado para atender às necessidades específicas de escritórios jurídicos modernos, 
                desde profissionais autônomos até grandes sociedades de advogados.
              </p>
              <p>
                Nossa plataforma integra todos os aspectos essenciais da gestão advocatícia em uma interface unificada e intuitiva,
                permitindo que você concentre seu tempo e energia no que realmente importa: seus clientes e casos.
              </p>
              <p>
                Desenvolvido por uma equipe que combina experiência jurídica com excelência tecnológica, 
                nosso sistema incorpora as melhores práticas de gestão legal e tecnologia de ponta para oferecer 
                uma solução completa que cresce junto com seu escritório.
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-gradient-to-br from-white to-blue-50 p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">Benefícios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 group">
                  <div className="bg-green-100 p-2 rounded-full mt-0.5 group-hover:bg-green-200 transition-colors">
                    <Check className="text-green-600 h-4 w-4" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold mb-3 text-lg text-gray-800">Suporte técnico especializado</h4>
              <p className="text-gray-600 mb-5">
                Nossa equipe de suporte está disponível para ajudar em qualquer dificuldade que você possa ter com o sistema.
              </p>
              <Button className="flex items-center gap-2" asChild>
                <a href="mailto:suporte@sisjusgestao.com.br">
                  <Mail className="h-4 w-4" />
                  Fale com o suporte
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
