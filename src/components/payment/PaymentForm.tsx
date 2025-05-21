import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { iniciarCheckout } from '@/services/stripe';

interface PaymentFormProps {
  onProcessingChange: (isProcessing: boolean) => void;
  isTestEnvironment: boolean;
  initialEmail?: string; // Email vindo do cadastro ou do usuário logado
  clientReferenceId?: string; // ID do usuário logado ou email para novos usuários
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onProcessingChange,
  isTestEnvironment,
  initialEmail,
  clientReferenceId // Recebe o ID ou email para referência do cliente no Stripe
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
      
      // O clientReferenceId é importante para o webhook associar o pagamento ao usuário correto
      // no Supabase, especialmente para novos cadastros.
      const checkoutData = {
        nomePlano: 'Plano Mensal JusGestão',
        valor: 12700, // R$ 127,00 em centavos
        emailCliente: email,
        modo: process.env.NODE_ENV === 'production' ? 'production' : 'test',
        dominio,
        // Adicionar o clientReferenceId que será usado pelo webhook do Stripe
        // para identificar o usuário no Supabase.
        // Se for um novo usuário, pode ser o email. Se for um usuário existente, o user.id.
        clientReferenceId: clientReferenceId || email 
      };

      const { data, error: invokeError } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: checkoutData
      });

      if (invokeError) {
        console.error('Erro ao criar sessão de checkout (invokeError):', invokeError);
        throw new Error(`Erro ao criar sessão de checkout: ${invokeError.message || JSON.stringify(invokeError)}`);
      }
      
      if (!data || !data.url) {
        console.error('Resposta inválida da API de checkout:', data);
        throw new Error('Resposta inválida da API de checkout: ' + JSON.stringify(data));
      }

      console.log('Sessão de checkout criada com sucesso:', data);
      
      toast({
        title: "Redirecionando para o pagamento",
        description: "Você será redirecionado para a página de pagamento do Stripe.",
      });
      
      window.location.href = data.url; // Redireciona para a página de checkout do Stripe

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
    } finally {
      // O setIsProcessing e onProcessingChange(false) não são chamados aqui
      // se o redirecionamento para o Stripe ocorrer, pois a página será descarregada.
      // Eles são importantes principalmente se houver um erro ANTES do redirect.
      if (errorDetails || !isProcessing) { // Só reseta se houve erro ou não está mais processando
          setTimeout(() => { // Atraso para garantir que o usuário veja o spinner se o erro for rápido
            setIsProcessing(false);
            onProcessingChange(false);
          }, 500);
      }
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
            // Se o email vem do cadastro, talvez você queira desabilitá-lo aqui
            // para garantir que seja o mesmo email.
            disabled={!!initialEmail || isProcessing} 
          />
          {initialEmail && <p className="text-xs text-gray-500 mt-1">Usando o email informado no cadastro.</p>}
        </div>
        
        {/* Aqui entraria o Stripe Elements se você estivesse usando-o diretamente */}
        {/* Como estamos redirecionando para o Checkout do Stripe, não é necessário aqui */}

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
                Ir para Pagamento Seguro - R$ 127,00
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