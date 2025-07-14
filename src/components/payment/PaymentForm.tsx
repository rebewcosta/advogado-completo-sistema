
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
        throw new Error("Email é necessário para prosseguir com a assinatura.");
      }

      if (!isValidEmail(email)) {
        throw new Error("Por favor, insira um endereço de email válido.");
      }

      // Para novos usuários vindos do cadastro, não precisamos verificar se estão logados
      // O sistema criará a conta após a assinatura ser ativada
      const { data: { session } } = await supabase.auth.getSession();
      
      const dominio = getDominio();
      console.log('🚀 Iniciando processo de pagamento com 7 dias de teste GRATUITO');
      console.log('📧 Email:', email);
      console.log('🆔 Client Reference ID:', clientReferenceId);
      console.log('🌐 Dominio:', dominio);

      // **CRÍTICO: Configuração com 7 dias de teste gratuito OBRIGATÓRIO**
      const checkoutData = {
        nomePlano: 'JusGestão - 7 DIAS GRATUITOS + R$ 37/mês',
        valor: 3700, // R$ 37,00 em centavos - será cobrado APENAS após 7 dias
        emailCliente: email,
        dominio,
        clientReferenceId: clientReferenceId || email
      };

      console.log('💎 Dados do checkout com 7 dias GRATUITOS:', checkoutData);

      // Se tem sessão ativa, incluir token de autenticação
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
        console.log('🔐 Token de autenticação incluído');
      } else {
        console.log('👤 Processando como novo usuário sem sessão ativa');
      }

      console.log('📡 Chamando função de checkout...');
      const { data, error: invokeError } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: checkoutData,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      if (invokeError) {
        console.error('❌ Erro ao criar sessão de checkout (invokeError):', invokeError);
        let detailedErrorMessage = invokeError.message;
        if (invokeError.context && typeof invokeError.context === 'object' && 'message' in invokeError.context) {
            detailedErrorMessage = (invokeError.context as any).message || detailedErrorMessage;
        } else if (invokeError.context && typeof invokeError.context === 'string') {
            detailedErrorMessage = invokeError.context || detailedErrorMessage;
        }
        throw new Error(`Erro ao criar sessão de checkout: ${detailedErrorMessage}`);
      }

      if (!data || !data.url) {
        console.error('❌ Resposta inválida da API de checkout:', data);
        throw new Error('Resposta inválida da API de checkout: ' + JSON.stringify(data));
      }

      console.log('✅ Sessão de checkout criada com SUCESSO:', data);
      console.log('🎁 CONFIRMADO: 7 dias de teste gratuito configurados!');
      console.log('📅 Data de fim do trial:', new Date(data.trialEnd).toLocaleDateString('pt-BR'));
      console.log('🚫 Cancelamento automático configurado:', data.cancelPolicy);

      const isProduction = !window.location.hostname.includes('localhost') && 
                          !window.location.hostname.includes('lovable.app') &&
                          !window.location.hostname.includes('lovableproject.com');

      toast({
        title: "🎉 Redirecionando para ativação da assinatura",
        description: `Você será redirecionado para o Stripe para ativar sua assinatura com 7 DIAS GRATUITOS! Primeira cobrança apenas em ${new Date(data.trialEnd).toLocaleDateString('pt-BR')}. CANCELE A QUALQUER MOMENTO durante o teste sem ser cobrado. ${isProduction ? '(PRODUÇÃO)' : '(TESTE)'}`,
        duration: 12000,
      });

      // **CRÍTICO: Aguardar 3 segundos para o usuário ler a mensagem completa**
      setTimeout(() => {
        console.log('🔗 Redirecionando para Stripe Checkout:', data.url);
        window.location.href = data.url;
      }, 3000);

    } catch (error) {
      console.error('❌ Erro na ativação da assinatura:', error);
      let errorMessage = "Erro ao processar ativação da assinatura";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'object' && error !== null && 'message' in error) errorMessage = String((error as any).message);
      else if (typeof error === 'string') errorMessage = error;
      
      setErrorDetails(errorMessage);
      toast({
        title: "❌ Erro na ativação da assinatura",
        description: `Houve um problema ao processar sua assinatura. Detalhes: ${errorMessage}`,
        variant: "destructive",
        duration: 10000,
      });
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPayment}>
      <div className="space-y-6">
        {/* Banner de destaque para os 7 dias gratuitos */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-green-800 mb-3">
              🎁 7 DIAS COMPLETAMENTE GRATUITOS!
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-bold text-green-700">
                ✅ <strong>SEM cobrança pelos primeiros 7 dias</strong>
              </p>
              <p className="text-sm font-semibold text-green-700">
                🚫 <strong>CANCELE A QUALQUER MOMENTO durante o teste - SEM COBRANÇA</strong>
              </p>
              <p className="text-sm text-green-600">
                💳 Se não cancelar, será cobrado R$ 37,00/mês apenas após o período gratuito
              </p>
              <p className="text-xs text-green-600 font-medium">
                ⚠️ <strong>IMPORTANTE:</strong> Seu cartão será cadastrado mas NÃO será cobrado durante o teste
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_assinatura" className="text-sm font-medium text-gray-700">
            Email para Assinatura
          </Label>
          <Input
            type="email"
            id="email_assinatura"
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
            className="w-full text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            size="lg"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirecionando em instantes...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CreditCard className="mr-2 h-5 w-5" />
                🎁 COMEÇAR 7 DIAS GRATUITOS
              </span>
            )}
          </Button>
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm font-bold text-green-700">
              ✅ <strong>TOTALMENTE GRATUITO pelos primeiros 7 dias!</strong>
            </p>
            <p className="text-sm font-bold text-red-600">
              🚫 <strong>CANCELE A QUALQUER MOMENTO durante o teste sem ser cobrado</strong>
            </p>
            <p className="text-xs text-gray-600">
              Após o período gratuito: R$ 37,00/mês • Cancele quando quiser
            </p>
            <p className="text-xs text-blue-600 font-medium">
              💳 Cartão será cadastrado mas NÃO será cobrado nos primeiros 7 dias
            </p>
            <p className="text-xs text-orange-600 font-bold">
              ⚠️ Se não cancelar durante o teste, será cobrado automaticamente
            </p>
          </div>
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
