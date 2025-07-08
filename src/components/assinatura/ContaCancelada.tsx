
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, CreditCard, CheckCircle, Clock } from 'lucide-react';

interface ContaCanceladaProps {
  onRenovarAssinatura?: () => void;
  onVoltar?: () => void;
}

const ContaCancelada: React.FC<ContaCanceladaProps> = ({ onRenovarAssinatura, onVoltar }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-red-200">
        <CardHeader className="text-center bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold">Conta Cancelada</CardTitle>
          <CardDescription className="text-red-100">
            Sua assinatura foi cancelada por falta de pagamento
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              O que aconteceu?
            </h3>
            <ul className="space-y-2 text-red-700 text-sm">
              <li>• Sua assinatura foi cancelada automaticamente após 5 dias de inadimplência</li>
              <li>• Todos os dados foram preservados por 30 dias</li>
              <li>• Você pode reativar sua conta a qualquer momento</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Como reativar sua conta?
            </h3>
            <ol className="space-y-2 text-green-700 text-sm">
              <li>1. Clique no botão "Renovar Assinatura" abaixo</li>
              <li>2. Complete o pagamento no Stripe</li>
              <li>3. Aguarde alguns minutos para a ativação</li>
              <li>4. Faça login novamente para acessar o sistema</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Importante saber
            </h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li>• <strong>Seus dados:</strong> Todos os processos, clientes e documentos estão seguros</li>
              <li>• <strong>Prazo:</strong> Você tem 30 dias para reativar antes da exclusão permanente</li>
              <li>• <strong>Pagamento:</strong> Cartão de crédito ou débito via Stripe</li>
              <li>• <strong>Valor:</strong> R$ 37,00/mês - mesmo preço anterior</li>
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
              {isLoading ? "Processando..." : "Renovar Assinatura Agora"}
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
