
import React from 'react';
import { Check, Clock, AlertTriangle, ExternalLink, Gift, Crown, ShoppingCart, Loader2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StatusAssinaturaProps {
  status: 'ativa' | 'pendente' | 'inativa';
  accountType?: 'premium' | 'admin' | 'amigo' | 'pendente' | 'none' | 'trial';
  customMessage?: string;
  dataProximoFaturamento?: string | null;
  trialDaysRemaining?: number | null;
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
  trialDaysRemaining,
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
  } else if (accountType === 'trial') {
    IconComponent = Timer;
    titleColor = "text-green-700";
    bgColor = "bg-green-50 border-green-200";
    iconBgColor = "bg-green-100";
    iconColor = "text-green-600";
    planDisplay = "🎁 Período de Teste GRATUITO";
    
    if (trialDaysRemaining !== null) {
      if (trialDaysRemaining > 1) {
        description = `🎉 Você está no período de teste GRATUITO! ${trialDaysRemaining} dias restantes para explorar todas as funcionalidades sem pagar nada.`;
      } else if (trialDaysRemaining === 1) {
        description = `⏰ ÚLTIMO DIA do seu teste gratuito! Assine hoje para continuar usando o sistema sem interrupção.`;
        titleColor = "text-orange-700";
        bgColor = "bg-orange-50 border-orange-200";
        iconBgColor = "bg-orange-100";
        iconColor = "text-orange-600";
      } else {
        description = `⏰ Seu teste gratuito expira hoje! Assine agora para continuar usando o sistema.`;
        titleColor = "text-red-700";
        bgColor = "bg-red-50 border-red-200";
        iconBgColor = "bg-red-100";
        iconColor = "text-red-600";
      }
    }
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
    description = customMessage || "Seu pagamento está sendo processado ou há uma pendência. Acesse o portal do cliente para resolver.";
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
              accountType === 'trial' ? '🎁 Teste Gratuito Ativo' :
              status === 'ativa' ? 'Assinatura Ativa' :
              status === 'pendente' ? 'Assinatura Pendente' :
              'Assinatura Inativa'
            }
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
            {description}
          </p>

          {/* Detalhes da assinatura */}
          {(status === 'ativa' || status === 'pendente' || accountType === 'trial') && (
            <div className="mt-3 space-y-1 text-xs sm:text-sm">
              <p>
                <span className="font-medium text-gray-700">Plano:</span> {planDisplay}
              </p>
              {accountType === 'trial' && trialDaysRemaining !== null && (
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-gray-700">Dias restantes do teste:</span> 
                    <span className={cn("ml-1 font-bold", 
                      trialDaysRemaining <= 1 ? "text-red-600" : 
                      trialDaysRemaining <= 2 ? "text-orange-600" : 
                      trialDaysRemaining <= 5 ? "text-yellow-600" : "text-green-600"
                    )}>
                      {trialDaysRemaining} dias
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    💳 Primeira cobrança: R$ 37,00 após o período gratuito
                  </p>
                  <p className="text-xs font-medium text-blue-600">
                    🚫 Cancele a qualquer momento durante o teste sem ser cobrado
                  </p>
                </div>
              )}
              {dataProximoFaturamento && accountType === 'premium' && (
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

              {/* Botão para Assinar - aparece para trial próximo do fim e contas inativas */}
              {((status === 'inativa' && accountType === 'none') || (accountType === 'trial' && (trialDaysRemaining || 0) <= 3)) && (
                 <Button 
                    onClick={handleAssinar}
                    className={cn(
                      "mt-4 text-white text-xs sm:text-sm",
                      accountType === 'trial' 
                        ? (trialDaysRemaining || 0) <= 1 
                          ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                          : "bg-orange-600 hover:bg-orange-700"
                        : "bg-lawyer-primary hover:bg-lawyer-primary/90"
                    )}
                    size="sm"
                  >
                    <ShoppingCart className="mr-1.5 h-4 w-4" />
                    {accountType === 'trial' 
                      ? (trialDaysRemaining || 0) <= 1 
                        ? '🚨 Assinar AGORA - Último Dia!' 
                        : '⏰ Assinar Antes do Fim'
                      : 'Assinar Agora'
                    }
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
