
import React from 'react';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Iniciante",
      price: "R$ 99",
      period: "/mês",
      description: "Ideal para advogados autônomos",
      features: [
        "Até 50 clientes",
        "Até 100 processos",
        "Agenda e compromissos",
        "Controle financeiro básico",
        "Armazenamento de 5GB",
        "Suporte por email"
      ],
      cta: "Começar grátis",
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 199",
      period: "/mês",
      description: "Perfeito para escritórios em crescimento",
      features: [
        "Até 200 clientes",
        "Processos ilimitados",
        "Agenda compartilhada",
        "Relatórios avançados",
        "Controle financeiro completo",
        "Armazenamento de 20GB",
        "Suporte prioritário"
      ],
      cta: "Assinar agora",
      popular: true
    },
    {
      name: "Empresarial",
      price: "R$ 349",
      period: "/mês",
      description: "Para escritórios de médio e grande porte",
      features: [
        "Clientes ilimitados",
        "Processos ilimitados",
        "Controle de produtividade",
        "Relatórios personalizados",
        "Integração com sistemas",
        "Armazenamento de 50GB",
        "Suporte 24/7",
        "API para integrações"
      ],
      cta: "Entrar em contato",
      popular: false
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Planos e Preços</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Escolha o plano que melhor atende às necessidades do seu escritório de advocacia e comece a otimizar sua gestão hoje mesmo.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-xl ${plan.popular ? 'ring-2 ring-lawyer-primary relative' : ''}`}
            >
              {plan.popular && (
                <div className="bg-lawyer-primary text-white text-sm font-semibold py-1 px-4 absolute top-0 right-0 rounded-bl">
                  Mais popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-end mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-6">
                <button 
                  className={`w-full py-2 rounded-md font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-lawyer-primary text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Precisa de um plano personalizado para seu escritório?</p>
          <button className="btn-primary mx-auto">
            Entre em contato
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
