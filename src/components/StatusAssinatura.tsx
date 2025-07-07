
// src/components/StatusAssinatura.tsx
import React from 'react';
import { Check, Clock, AlertTriangle, ExternalLink, Gift, Crown, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StatusAssinaturaProps {
  status: 'ativa' | 'pendente' | 'inativa';
  accountType?: 'premium' | 'admin' | 'amigo' | 'pendente' | 'none';
  customMessage?: string;
  dataProximoFaturamento?: string | null;
  plano?: string;
  onAbrirPortalCliente?: () => void;
  isPortalLoading?: boolean;
  hideActionButtons?: boolean;
}

const StatusAssinatura: React.FC<StatusAssinaturaProps> = ({ 
  status, 
  accountType = 'none',
  customMessage,
  dataProximoFaturamento,
  plano = "JusGestão",
  onAbrirPortalCliente,
  isPortalLoading = false,
  hideActionButtons = false,
}) => {
  const navigate = useNavigate();

  const handleAssinar = () => {
    navigate('/pagamento');
  };

  let IconComponent = AlertTriangle;
  let titleColor = "text-red-700";
  let bgColor = "bg-red-50 border-red-200";
  let iconBgColor = "bg-red-100";
  let iconColor = "text-red-600";
  let planDisplay = plano;
  let description = customMessage || "Verifique os detalhes abaixo.";

  // Configurações visuais baseadas no tipo de conta
  if (accountType === 'admin') {
    IconComponent = Crown;
    titleColor = "text-indigo-700";
    bgColor = "bg-indigo-50 border-indigo-200";
    iconBgColor = "bg-indigo-100";
    iconColor = "text-indigo-600";
    planDisplay = "Acesso Administrador";
    description = "Você possui acesso total de administrador ao sistema.";
  } else if (accountType === 'amigo') {
    IconComponent = Gift;
    titleColor = "text-pink-700";
    bgColor = "bg-pink-50 border-pink-200";
    iconBgColor = "bg-pink-100";
    iconColor = "text-pink-600";
    planDisplay = "Assinatura Amiga (Cortesia)";
    description = "Acesso de cortesia especial concedido. Aproveite!";
  } else if (status === 'ativa' && accountType === 'premium') {
    IconComponent = Check;
    titleColor = "text-green-700";
    bgColor = "bg-green-50 border-green-200";
    iconBgColor = "bg-green-100";
    iconColor = "text-green-600";
    planDisplay = "JusGestão Premium";
    description = "Sua assinatura está ativa e você tem acesso a todos os recursos.";
  } else if (status === 'pendente' || accountType === 'pendente') {
    IconComponent = Clock;
    titleColor = "text-yellow-700";
    bgColor = "bg-yellow-50 border-yellow-200";
    iconBgColor = "bg-yellow-100";
    iconColor = "text-yellow-600";
    description = customMessage || "Seu pagamento está sendo processado ou há uma pendência. Verifique o portal do cliente.";
  } else {
    // Inativa ou 'none'
    description = customMessage || "Você não possui uma assinatura ativa no momento.";
  }

  return (
    <div className={cn("p-4 sm:p-6 rounded-lg border", bgColor)}>
      <div className="flex items-start">
        <div className={cn("p-2 rounded-full mr-3 sm:mr-4 mt-1", iconBgColor)}>
          <IconComponent className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
        </div>
        <div className="flex-1">
          <h3 className={cn("text-md sm:text-lg font-semibold", titleColor)}>
            { accountType === 'admin' ? 'Acesso Administrador' :
              accountType === 'amigo' ? 'Assinatura Amiga' :
              status === 'ativa' ? 'Assinatura Ativa' :
              status === 'pendente' ? 'Assinatura Pendente' :
              'Assinatura Inativa'
            }
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {description}
          </p>

          {/* Detalhes da assinatura premium */}
          {(status === 'ativa' || status === 'pendente') && accountType === 'premium' && (
            <div className="mt-3 space-y-1 text-xs sm:text-sm">
              <p>
                <span className="font-medium text-gray-700">Plano:</span> {planDisplay}
              </p>
              {dataProximoFaturamento && (
                <p>
                  <span className="font-medium text-gray-700">Próxima cobrança:</span> {dataProximoFaturamento}
                </p>
              )}
            </div>
          )}
          
          {/* Botões de ação - só aparecem se não estiver sendo gerenciado externamente */}
          {!hideActionButtons && (
            <>
              {/* Botão de Gerenciar Assinatura */}
              {onAbrirPortalCliente && !['admin', 'amigo'].includes(accountType || '') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onAbrirPortalCliente}
                  disabled={isPortalLoading}
                  className="mt-4 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  {isPortalLoading ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-1.5 h-3 w-3" />
                  )}
                  {isPortalLoading ? "Abrindo..." : "Gerenciar no Stripe"}
                </Button>
              )}

              {/* Botão para Assinar */}
              {status === 'inativa' && accountType === 'none' && (
                 <Button 
                    onClick={handleAssinar}
                    className="mt-4 bg-lawyer-primary hover:bg-lawyer-primary/90 text-white text-xs sm:text-sm"
                    size="sm"
                  >
                    <ShoppingCart className="mr-1.5 h-4 w-4" />
                    Assinar Agora
                  </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusAssinatura;
