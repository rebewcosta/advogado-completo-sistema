
import React from 'react';
import { Check } from 'lucide-react';

const PlanInfoBox: React.FC = () => {
  return (
    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Check className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-blue-800">Plano Mensal - R$ 37,00/mês</h3>
          <p className="text-sm text-blue-700 mt-1">
            Acesso completo a todas as funcionalidades do sistema JusGestão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanInfoBox;
