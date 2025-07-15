
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, CreditCard, CheckCircle, Clock, Timer } from 'lucide-react';

interface ContaCanceladaProps {
  onRenovarAssinatura?: () => void;
  onVoltar?: () => void;
}

const ContaCancelada: React.FC<ContaCanceladaProps> = ({ onRenovarAssinatura, onVoltar }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar se é expiração de trial
  const isTrialExpired = location.state?.reason === 'expired_trial';
  const message = location.state?.message;

  const handleRenovarAssinatura = async () => {
    if (onRenovarAssinatura) {
      onRenovarAssinatura();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: {
          nomePlano: "JusGestão Premium",
          valor: 3700,
          emailCliente: user?.email,
          dominio: window.location.origin
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Você será redirecionado para completar sua renovação."
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao renovar",
        description: error.message || "Erro ao processar renovação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isTrialExpired ? 'bg-gradient-to-br from-orange-50 to-yellow-50' : 'bg-gradient-to-br from-red-50 to-orange-50'} flex items-center justify-center p-4`}>
      <Card className={`w-full max-w-2xl shadow-2xl ${isTrialExpired ? 'border-orange-200' : 'border-red-200'}`}>
        <CardHeader className={`text-center ${isTrialExpired ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white rounded-t-lg`}>
          <div className="flex justify-center mb-4">
            {isTrialExpired ? (
              <Timer className="h-16 w-16" />
            ) : (
              <AlertCircle className="h-16 w-16" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isTrialExpired ? 'Período de Teste Expirado' : 'Conta Cancelada'}
          </CardTitle>
          <CardDescription className={isTrialExpired ? 'text-orange-100' : 'text-red-100'}>
            {isTrialExpired 
              ? 'Seus 7 dias de teste gratuito chegaram ao fim!' 
              : 'Sua assinatura foi cancelada por falta de pagamento'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className={`${isTrialExpired ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
            <h3 className={`font-semibold ${isTrialExpired ? 'text-orange-800' : 'text-red-800'} mb-3 flex items-center gap-2`}>
              {isTrialExpired ? (
                <Timer className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {isTrialExpired ? 'Como foi seu teste?' : 'O que aconteceu?'}
            </h3>
            <ul className={`space-y-2 ${isTrialExpired ? 'text-orange-700' : 'text-red-700'} text-sm`}>
              {isTrialExpired ? (
                <>
                  <li>• Você testou GRATUITAMENTE por 7 dias completos</li>
                  <li>• Teve acesso a todas as funcionalidades premium</li>
                  <li>• Seus dados estão seguros e preservados</li>
                  <li>• Assine agora para continuar usando sem interrupções</li>
                </>
              ) : (
                <>
                  <li>• Sua assinatura foi cancelada automaticamente após 5 dias de inadimplência</li>
                  <li>• Todos os dados foram preservados por 30 dias</li>
                  <li>• Você pode reativar sua conta a qualquer momento</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {isTrialExpired ? 'Continue usando o JusGestão:' : 'Como reativar sua conta?'}
            </h3>
            <ol className="space-y-2 text-green-700 text-sm">
              {isTrialExpired ? (
                <>
                  <li>1. Clique no botão "Assinar Agora" abaixo</li>
                  <li>2. Complete o pagamento seguro via Stripe</li>
                  <li>3. Sua conta será ativada automaticamente</li>
                  <li>4. Continue de onde parou - sem perder nenhum dado!</li>
                </>
              ) : (
                <>
                  <li>1. Clique no botão "Renovar Assinatura" abaixo</li>
                  <li>2. Complete o pagamento no Stripe</li>
                  <li>3. Aguarde alguns minutos para a ativação</li>
                  <li>4. Faça login novamente para acessar o sistema</li>
                </>
              )}
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Detalhes importantes
            </h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• <strong>Seus dados:</strong> Todos os processos, clientes e documentos estão seguros</li>
              <li>• <strong>Valor:</strong> R$ 37,00/mês - sem taxa de adesão</li>
              <li>• <strong>Pagamento:</strong> Cartão de crédito ou débito via Stripe (seguro)</li>
              <li>• <strong>Cancelamento:</strong> Pode cancelar a qualquer momento</li>
              {isTrialExpired && (
                <li>• <strong>Benefício:</strong> Você já conhece o sistema - não há surpresas!</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button 
              onClick={handleRenovarAssinatura}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              {isLoading ? "Processando..." : isTrialExpired ? "🚀 Assinar Agora - R$ 37/mês" : "Renovar Assinatura Agora"}
            </Button>
            
            {onVoltar && (
              <Button 
                onClick={onVoltar}
                variant="outline"
                className="flex-1 sm:flex-initial border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Precisa de ajuda? Entre em contato conosco pelo email: suporte@jusgestao.com.br
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContaCancelada;
