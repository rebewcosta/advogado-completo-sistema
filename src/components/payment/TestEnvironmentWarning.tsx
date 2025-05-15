
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const TestEnvironmentWarning: React.FC = () => {
  return (
    <>
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">Ambiente de teste</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Este é um ambiente de teste. Os pagamentos não serão cobrados realmente.
              Você pode usar os dados de teste fornecidos abaixo.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Info className="h-4 w-4 mr-1 text-gray-500" />
          <span className="font-medium">Dados para teste (ambiente de desenvolvimento)</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          <p><span className="font-medium">Cartão:</span> 4242 4242 4242 4242</p>
          <p><span className="font-medium">Expiração:</span> Qualquer data futura (ex: 12/25)</p>
          <p><span className="font-medium">CVV:</span> Qualquer número de 3 dígitos (ex: 123)</p>
          <p><span className="font-medium">Nome:</span> Qualquer nome</p>
          <p className="mt-1 text-gray-500 italic">Estes são dados de teste do Stripe, sem cobrança real.</p>
        </div>
      </div>
    </>
  );
};

export default TestEnvironmentWarning;
