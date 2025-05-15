
import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface StatusAssinaturaProps {
  status: 'ativa' | 'pendente' | 'inativa';
  dataProximoFaturamento?: string;
}

const StatusAssinatura = ({ status, dataProximoFaturamento }: StatusAssinaturaProps) => {
  return (
    <div className={`p-4 rounded-lg border ${
      status === 'ativa' ? 'bg-green-50 border-green-100' :
      status === 'pendente' ? 'bg-yellow-50 border-yellow-100' :
      'bg-red-50 border-red-100'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          {status === 'ativa' ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : status === 'pendente' ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`font-medium ${
            status === 'ativa' ? 'text-green-800' :
            status === 'pendente' ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {status === 'ativa' ? 'Plano Mensal Ativo' :
             status === 'pendente' ? 'Pagamento Pendente' :
             'Assinatura Inativa'}
          </h3>
          {status === 'ativa' && dataProximoFaturamento && (
            <p className="text-sm text-green-700 mt-1">
              Próxima cobrança: {dataProximoFaturamento}
            </p>
          )}
          {status === 'pendente' && (
            <p className="text-sm text-yellow-700 mt-1">
              Aguardando confirmação do pagamento.
            </p>
          )}
          {status === 'inativa' && (
            <p className="text-sm text-red-700 mt-1">
              Sua assinatura está inativa. Renove para continuar acessando.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusAssinatura;
