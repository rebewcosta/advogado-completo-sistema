
import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
        Pagamento Confirmado!
      </h2>
      
      <p className="text-lg text-gray-600 mb-6">
        Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao sistema JusGestão.
      </p>
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-8 text-left">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Check className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-blue-800">Plano Mensal Ativo</h3>
            <p className="text-sm text-blue-700 mt-1">
              Próxima cobrança: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
      
      <Link
        to="/dashboard"
        className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary"
      >
        Acessar o Sistema
      </Link>
    </div>
  );
};

export default PaymentSuccess;
