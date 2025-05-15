
import React from 'react';
import { AlertTriangle, Info, CreditCard } from 'lucide-react';

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
              Você deve usar os dados de teste abaixo para simular um pagamento.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-6">
        <div className="flex items-center text-sm font-medium text-gray-700 mb-3">
          <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
          <span>Dados para teste do Stripe (use estes dados)</span>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="font-bold text-gray-700 mb-1">Cartão de teste:</p>
              <p className="font-mono bg-white px-2 py-1 border rounded select-all">4242 4242 4242 4242</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-1">Data de validade:</p>
              <p className="font-mono bg-white px-2 py-1 border rounded">Qualquer data futura (ex: 12/25)</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-1">CVV:</p>
              <p className="font-mono bg-white px-2 py-1 border rounded">Qualquer 3 dígitos (ex: 123)</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-1">Nome:</p>
              <p className="font-mono bg-white px-2 py-1 border rounded">Qualquer nome</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <p className="text-blue-700 font-medium flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Estas são informações de teste oficiais do Stripe. Nenhuma cobrança real será feita.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestEnvironmentWarning;
