
import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  onProcessingChange: (isProcessing: boolean) => void;
  isTestEnvironment: boolean;
  initialEmail?: string;
  clientReferenceId?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onProcessingChange,
  isTestEnvironment,
  initialEmail,
  clientReferenceId
}) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [errorDetails, setErrorDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const isValidEmail = (emailToValidate: string) => {
    return /\S+@\S+\.\S+/.test(emailToValidate);
  };

  const getDominio = () => {
    return window.location.origin;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    onProcessingChange(true);
    setErrorDetails('');

    try {
      if (!email) {
        throw new Error("Email é necessário para prosseguir com o pagamento.");
      }

      if (!isValidEmail(email)) {
        throw new Error("Por favor, insira um endereço de email válido.");
      }

      const dominio = getDominio();
      console.log('Iniciando checkout com email:', email, 'clientReferenceId:', clientReferenceId, 'dominio:', dominio);

      // Usar sempre o valor correto de R$ 37,00
      const checkoutData = {
        nomePlano: 'JusGestão - Plano Mensal',
        valor: 3700, // R$ 37,00 em centavos - valor fixo correto
        emailCliente: email,
        dominio,
        clientReferenceId: clientReferenceId || email
      };

      const { data, error: invokeError } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: checkoutData
      });

      if (invokeError) {
        console.error('Erro ao criar sessão de checkout (invokeError):', invokeError);
        let detailedErrorMessage = invokeError.message;
        if (invokeError.context && typeof invokeError.context === 'object' && 'message' in invokeError.context) {
            detailedErrorMessage = (invokeError.context as any).message || detailedErrorMessage;
        } else if (invokeError.context && typeof invokeError.context === 'string') {
            detailedErrorMessage = invokeError.context || detailedErrorMessage;
        }
        throw new Error(`Erro ao criar sessão de checkout: ${detailedErrorMessage}`);
      }

      if (!data || !data.url) {
        console.error('Resposta inválida da API de checkout:', data);
        throw new Error('Resposta inválida da API de checkout: ' + JSON.stringify(data));
      }

      console.log('Sessão de checkout criada com sucesso:', data);

      const isProduction = !window.location.hostname.includes('localhost') && 
                          !window.location.hostname.includes('lovable.app');

      toast({
        title: "Redirecionando para o pagamento",
        description: `Você será redirecionado para pagar R$ 37,00/mês via Stripe ${isProduction ? '(PRODUÇÃO)' : '(TESTE)'}.`,
      });

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      console.error('Erro no pagamento:', error);
      let errorMessage = "Erro ao processar pagamento";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'object' && error !== null && 'message' in error) errorMessage = String((error as any).message);
      else if (typeof error === 'string') errorMessage = error;
      
      setErrorDetails(errorMessage);
      toast({
        title: "Erro no pagamento",
        description: `Houve um problema ao processar seu pagamento. Detalhes: ${errorMessage}`,
        variant: "destructive",
        duration: 7000,
      });
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPayment}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email_pagamento" className="text-sm font-medium text-gray-700">
            Email para Cobrança
          </Label>
          <Input
            type="email"
            id="email_pagamento"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
            disabled={!!initialEmail || isProcessing}
          />
          {initialEmail && <p className="text-xs text-gray-500 mt-1">Usando o email informado no cadastro.</p>}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isProcessing || !email}
            className="w-full"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <span className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Pagar R$ 37,00/mês - Acesso Completo
              </span>
            )}
          </Button>
        </div>

        {errorDetails && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">Detalhes do erro:</p>
            <p className="text-sm text-red-700">{errorDetails}</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;
