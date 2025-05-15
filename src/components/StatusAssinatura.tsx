
import React from 'react';
import { Check, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface StatusAssinaturaProps {
  status: 'ativa' | 'pendente' | 'inativa';
  dataProximoFaturamento?: string;
  plano?: string;
  onAbrirPortalCliente?: () => void;
}

const StatusAssinatura: React.FC<StatusAssinaturaProps> = ({ 
  status, 
  dataProximoFaturamento,
  plano = "Plano JusGestão",
  onAbrirPortalCliente
}) => {
  const navigate = useNavigate();

  const handleAssinar = () => {
    navigate('/pagamento');
  };

  return (
    <Card>
      <CardContent className="p-4">
        {status === 'ativa' && (
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-700">Assinatura Ativa</h3>
              <div className="mt-1 flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  Plano: <span className="text-green-700">{plano}</span>
                </p>
                {dataProximoFaturamento && (
                  <p className="text-sm">
                    Próxima cobrança em <span className="font-medium">{dataProximoFaturamento}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Você tem acesso a todos os recursos do JusGestão.
                </p>
              </div>
              
              {onAbrirPortalCliente && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onAbrirPortalCliente}
                  className="mt-4 text-xs flex items-center"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Gerenciar Assinatura
                </Button>
              )}
            </div>
          </div>
        )}

        {status === 'pendente' && (
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-4 mt-1">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-700">Assinatura Pendente</h3>
              <p className="mt-1 text-sm text-gray-600">
                Sua assinatura está sendo processada. Isso pode levar alguns minutos.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Caso o problema persista, verifique seu pagamento ou entre em contato com o suporte.
              </p>
            </div>
          </div>
        )}

        {status === 'inativa' && (
          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-full mr-4 mt-1">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-700">Assinatura Inativa</h3>
              <p className="mt-1 text-sm text-gray-600">
                Você não possui uma assinatura ativa no momento.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Assine um plano para ter acesso completo a todos os recursos do JusGestão.
              </p>
              
              <Button 
                onClick={handleAssinar}
                className="mt-4 bg-lawyer-primary hover:bg-blue-700 text-white"
                size="sm"
              >
                Assinar agora
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusAssinatura;
