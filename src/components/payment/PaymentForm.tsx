
import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { iniciarCheckout } from '@/services/stripe';

interface PaymentFormProps {
  onProcessingChange: (isProcessing: boolean) => void;
  isTestEnvironment: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onProcessingChange,
  isTestEnvironment
}) => {
  const [email, setEmail] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Função para validar email
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Função para processar o pagamento com Stripe
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    onProcessingChange(true);
    setErrorDetails('');
    
    try {
      if (!email) {
        throw new Error("Email necessário para prosseguir com o pagamento.");
      }

      if (!isValidEmail(email)) {
        throw new Error("Por favor, insira um endereço de email válido.");
      }
      
      console.log('Iniciando checkout com email:', email);
      
      // Usar o modo apropriado baseado no ambiente
      const modo = isTestEnvironment ? 'test' : 'production';
      
      const result = await iniciarCheckout({
        nomePlano: 'Plano Mensal JusGestão',
        valor: 12700,
        emailCliente: email,
        modo: modo
      });
      
      console.log('Resultado do checkout:', result);
      
      if (result && result.url) {
        toast({
          title: "Redirecionando para o pagamento",
          description: "Você será redirecionado para a página de pagamento do Stripe.",
        });
        
        // Abrir em nova aba para garantir compatibilidade
        window.open(result.url, '_blank');
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setIsProcessing(false);
      onProcessingChange(false);
      
      // Extrair mensagem de erro mais detalhada
      let errorMessage = "Erro ao processar pagamento";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Tentar extrair mensagem de erro de uma resposta da API
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error) {
          errorMessage = typeof error.error === 'string' 
            ? error.error 
            : JSON.stringify(error.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      setErrorDetails(errorMessage);
      
      toast({
        title: "Erro no pagamento",
        description: "Houve um problema ao processar seu pagamento. Por favor, verifique os detalhes do erro abaixo.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        onProcessingChange(false);
      }, 2000); // Ensure the UI updates even if there's a network issue
    }
  };

  return (
    <form onSubmit={handleSubmitPayment}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Seu Email
          </Label>
          <Input
            type="email"
            id="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
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
                {isTestEnvironment ? "TESTE - Pagar com Stripe - R$ 127,00" : "Pagar com Stripe - R$ 127,00"}
              </span>
            )}
          </Button>
        </div>

        {errorDetails && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">Detalhes do erro:</p>
            <p className="text-sm text-red-700">{errorDetails}</p>
            <div className="mt-3 pt-3 border-t border-red-100">
              <p className="text-xs text-red-600">
                Se o problema persistir, verifique se a chave de API do Stripe está configurada corretamente 
                nas Edge Functions do Supabase.
              </p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PaymentForm;
