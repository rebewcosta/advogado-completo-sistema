
import React from 'react';

const PlanInfoBox = () => {
  return (
    <div>
      <h3 className="text-white text-sm font-medium mb-4">💰 Plano de Assinatura</h3>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">Plano Mensal - R$ 37,00/mês</h4>
        <p className="text-sm text-blue-700">
          Acesso completo a todas as funcionalidades do sistema JusGestão.
          Você será direcionado para a página de pagamento após o cadastro.
        </p>
      </div>
    </div>
  );
};

export default PlanInfoBox;
