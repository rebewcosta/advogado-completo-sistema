
import React from 'react';
import { Gift, Clock, Shield, CheckCircle } from 'lucide-react';

const PlanInfoBox = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-green-600" />
        <h3 className="text-gray-800 font-semibold">🎁 Teste Gratuito de 7 Dias</h3>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
        <div className="flex items-start gap-3 mb-3">
          <Clock className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800 mb-1">7 Dias Completamente Grátis</h4>
            <p className="text-sm text-green-700">
              Teste todas as funcionalidades sem limitações e sem precisar inserir cartão de crédito.
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Acesso completo ao sistema</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Gestão de processos e clientes</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Controle financeiro e agenda</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Publicações e monitoramento</span>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Após o período de teste:</span>
          </div>
          <p className="text-sm text-blue-700">
            Apenas R$ 37,00/mês para continuar usando. Cancele a qualquer momento durante o teste sem cobrança.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanInfoBox;
