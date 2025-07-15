
import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [validationError, setValidationError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setValidationError('');
    }
  }, [initialEmail]);

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidationError('');
    setErrorDetails('');
    
    if (newEmail && !validateEmail(newEmail)) {
      setValidationError('Por favor, insira um email válido');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [PAYMENT FORM] Iniciando processo de pagamento');
    
    // Limpar estados de erro
    setErrorDetails('');
    setValidationError('');
    
    // Validações finais
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setValidationError("Email é obrigatório");
      return;
    }

    if (!validateEmail(emailTrimmed)) {
      setValidationError("Por favor, insira um email válido");
      return;
    }

    setIsProcessing(true);
    onProcessingChange(true);

    try {
      console.log('📧 [PAYMENT FORM] Email:', emailTrimmed);
      console.log('🏷️ [PAYMENT FORM] Environment:', isTestEnvironment ? 'TEST' : 'PRODUCTION');

      // Obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [PAYMENT FORM] Erro ao obter sessão:', sessionError);
      }

      // Preparar dados para envio (simplificado)
      const checkoutData = {
        emailCliente: emailTrimmed
      };

      console.log('📦 [PAYMENT FORM] Dados do checkout:', checkoutData);

      // Configurar headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
        console.log('🔐 [PAYMENT FORM] Token de autenticação incluído');
      }

      console.log('📡 [PAYMENT FORM] Chamando função criar-sessao-checkout...');
      
      // Chamar função do Supabase com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout - tente novamente')), 15000)
      );
      
      
      const { data, error: invokeError } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: checkoutData,
        headers
      });
      
      console.log('📨 [PAYMENT FORM] Resposta completa:', JSON.stringify({ data, invokeError }, null, 2));

      // Verificar erros da invocação
      if (invokeError) {
        console.error('❌ [PAYMENT FORM] Erro na invocação:', invokeError);
        throw new Error(invokeError.message || 'Erro ao processar pagamento');
      }

      // Verificar se dados foram retornados
      if (!data) {
        console.error('❌ [PAYMENT FORM] Nenhum dado retornado');
        throw new Error('Erro na comunicação com o servidor');
      }

      // Verificar erros na resposta
      if (data.error) {
        console.error('❌ [PAYMENT FORM] Erro na resposta:', data.error);
        throw new Error(data.error);
      }

      // Verificar URL de checkout
      if (!data.url) {
        console.error('❌ [PAYMENT FORM] URL de checkout não encontrada:', data);
        throw new Error('URL de checkout não foi gerada');
      }

      console.log('✅ [PAYMENT FORM] Checkout criado com sucesso!');
      console.log('🔗 [PAYMENT FORM] URL:', data.url);

      // Mostrar toast de sucesso
      toast({
        title: "🎉 Redirecionando para pagamento",
        description: `Você será redirecionado para ativar sua assinatura com 7 DIAS GRATUITOS! Ambiente: ${data.ambiente || (isTestEnvironment ? 'TESTE' : 'PRODUÇÃO')}`,
        duration: 8000,
      });

      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        console.log('🔗 [PAYMENT FORM] Redirecionando para:', data.url);
        window.location.href = data.url;
      }, 2000);

    } catch (error) {
      console.error('💥 [PAYMENT FORM] Erro no pagamento:', error);
      
      let errorMessage = "Erro ao processar pagamento";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setErrorDetails(errorMessage);
      
      toast({
        title: "❌ Erro no pagamento",
        description: `Não foi possível processar sua solicitação: ${errorMessage}`,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPayment} className="space-y-6">
      {/* Banner de destaque */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-green-800">
            🎁 7 DIAS COMPLETAMENTE GRATUITOS!
          </h3>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-green-700">
            ✅ SEM cobrança pelos primeiros 7 dias
          </p>
          <p className="text-sm font-semibold text-green-700">
            🚫 CANCELE A QUALQUER MOMENTO durante o teste - SEM COBRANÇA
          </p>
          <p className="text-sm text-green-600">
            💳 Primeira cobrança de R$ 37,00/mês apenas após o período gratuito
          </p>
        </div>
      </div>

      {/* Campo de email */}
      <div className="space-y-2">
        <Label htmlFor="email_assinatura" className="text-sm font-medium text-gray-700">
          Email para Assinatura *
        </Label>
        <Input
          type="email"
          id="email_assinatura"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={handleEmailChange}
          required
          className={`w-full ${validationError ? 'border-red-500' : ''}`}
          disabled={!!initialEmail || isProcessing}
        />
        {validationError && (
          <div className="flex items-center mt-1">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
            <p className="text-xs text-red-600">{validationError}</p>
          </div>
        )}
        {initialEmail && (
          <p className="text-xs text-gray-500">Usando o email informado no cadastro.</p>
        )}
      </div>

      {/* Botão de submit */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isProcessing || !email.trim() || !!validationError}
          className="w-full text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
          size="lg"
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
            <span className="flex items-center justify-center">
              <CreditCard className="mr-2 h-5 w-5" />
              🎁 COMEÇAR 7 DIAS GRATUITOS
            </span>
          )}
        </Button>
        
        {/* Informações adicionais */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm font-bold text-green-700">
            ✅ TOTALMENTE GRATUITO pelos primeiros 7 dias!
          </p>
          <p className="text-sm font-bold text-red-600">
            🚫 CANCELE durante o teste sem ser cobrado
          </p>
          <p className="text-xs text-gray-600">
            Ambiente: {isTestEnvironment ? 'TESTE' : 'PRODUÇÃO'}
          </p>
        </div>
      </div>

      {/* Exibição de erros */}
      {errorDetails && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Erro no pagamento:</p>
              <p className="text-sm text-red-700 mt-1">{errorDetails}</p>
              <p className="text-xs text-gray-600 mt-2">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default PaymentForm;
