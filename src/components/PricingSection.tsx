
import React from 'react';
import { Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const plans = [
    {
      name: "Acesso Mensal",
      price: "R$ 37",
      period: "/mês",
      description: "Acesso completo ao sistema JusGestão",
      features: [
        "Clientes ilimitados",
        "Processos ilimitados",
        "Agenda e compromissos",
        "Tarefas",
        "Notificações",
        "Controle financeiro completo",
        "Armazenamento de documentos",
        "Relatórios avançados",
        "Suporte por email",
        "Atualizações gratuitas"
      ],
      cta: "Começar agora",
      popular: true
    }
  ];

  const handleContactClick = () => {
    window.open("https://wa.me/5588999981618", "_blank");
  };

  const isTestEnvironment = process.env.NODE_ENV !== 'production';

  return (
    <section id="pricing" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Plano de Acesso</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Comece a otimizar a gestão do seu escritório de advocacia hoje mesmo com nosso sistema completo.
        </p>
        
        {isTestEnvironment && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-yellow-100 rounded-lg border border-yellow-200 flex items-start">
            <Info className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-sm text-yellow-800">
              Ambiente de <strong>TESTE</strong> - Os pagamentos processados aqui não serão cobrados realmente. 
              Use cartões de teste para simular pagamentos.
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-xl max-w-md ${plan.popular ? 'ring-2 ring-lawyer-primary relative' : ''}`}
            >
              {plan.popular && (
                <div className="bg-lawyer-primary text-white text-sm font-semibold py-1 px-4 absolute top-0 right-0 rounded-bl">
                  Recomendado
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
                <Link 
                  to="/cadastro"
                  className={`w-full py-2 rounded-md font-medium transition-colors block text-center ${
                    plan.popular 
                      ? 'bg-lawyer-primary text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Tem alguma dúvida sobre nosso plano?</p>
          <button 
            onClick={handleContactClick} 
            className="bg-lawyer-primary hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Entre em contato
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
