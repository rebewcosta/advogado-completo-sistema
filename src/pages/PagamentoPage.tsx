
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PaymentForm from '@/components/payment/PaymentForm';
import TestEnvironmentWarning from '@/components/payment/TestEnvironmentWarning';
import PlanInfoBox from '@/components/payment/PlanInfoBox';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import { useAuth } from '@/hooks/useAuth';

const PagamentoPage = () => {
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [paymentFormProcessing, setPaymentFormProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  
  // Detectar se estamos em produção baseado no domínio
  const isProduction = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('lovable.app') &&
                      !window.location.hostname.includes('lovableproject.com');

  // Dados de registro vindos da página de cadastro
  const registrationData = location.state?.registrationData;
  const clientReferenceId = location.state?.clientReferenceId;

  useEffect(() => {
    console.log("PagamentoPage mounted - Modo:", isProduction ? "PRODUÇÃO" : "TESTE");
    console.log("Registration data:", registrationData);
    console.log("Location state:", location.state);
    
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      // Pagamento foi bem-sucedido no Stripe
      if (registrationData) {
        // Cenário: Novo usuário que acabou de pagar
        handlePostPaymentSignUp();
      } else if (clientReferenceId) {
        // Cenário: Usuário existente que estava reativando/assinando
        console.log("Pagamento bem-sucedido para usuário existente (ID):", clientReferenceId);
        setStep(2); // Mostrar tela de sucesso
        toast({
          title: "Pagamento Confirmado!",
          description: "Sua assinatura de R$ 37,00/mês foi ativada com sucesso!",
        });
      } else {
        console.warn("Sucesso no pagamento, mas sem dados de registro ou ID de cliente de referência.");
        toast({
          title: "Pagamento Concluído",
          description: "Seu pagamento de R$ 37,00/mês foi processado. Você receberá um email de confirmação em breve.",
        });
        setStep(2);
      }
    }
    if (params.get('canceled') === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive"
      });
      // Se o usuário cancelou e estava vindo do cadastro, envia de volta com os dados preenchidos
      if (registrationData) {
         navigate('/cadastro', { state: { prefill: registrationData }, replace: true });
      } else {
         navigate(-1); // Volta para a página anterior
      }
    }
  }, [location.search, registrationData, clientReferenceId, navigate, toast, isProduction]);

  const handlePostPaymentSignUp = async () => {
    if (!registrationData) {
      console.error("handlePostPaymentSignUp chamado sem registrationData.");
      return;
    }

    setIsSubmittingUser(true);
    try {
      console.log("Finalizando cadastro após pagamento para:", registrationData.email);
      
      // IMPORTANTE: signUp não deve logar o usuário automaticamente
      // O usuário precisa confirmar o email primeiro
      await signUp(registrationData.email, registrationData.password, { 
        nome: registrationData.nome,
        telefone: registrationData.telefone,
        oab: registrationData.oab,
        empresa: registrationData.empresa,
        plano: registrationData.plano,
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`
      });
      
      setStep(2); // Mostrar tela de sucesso do pagamento
      
      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Seu pagamento foi confirmado e sua conta foi criada! Verifique seu email para ativá-la antes de fazer login.",
        duration: 8000,
      });
      
    } catch (error) {
      console.error("Erro ao criar conta após pagamento:", error);
      toast({
        title: "Erro ao Finalizar Cadastro",
        description: "Houve um problema ao criar sua conta após o pagamento. Seu pagamento foi processado. Por favor, contate o suporte.",
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsSubmittingUser(false);
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {isSubmittingUser && step === 1 && (
           <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
               <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lawyer-primary"></div>
               </div>
               <p className="text-lg text-gray-700">Finalizando seu cadastro, aguarde...</p>
               <p className="text-sm text-gray-500 mt-2">Seu pagamento foi confirmado. Estamos criando sua conta.</p>
           </div>
        )}
        {!isSubmittingUser && step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <Link 
              to={registrationData ? "/cadastro" : "/"} 
              className="flex items-center text-lawyer-primary hover:underline mb-6"
              state={registrationData ? { prefill: registrationData } : undefined}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {registrationData ? "Voltar para o cadastro" : "Voltar para a home"}
            </Link>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Pagamento da Assinatura
              </h2>
              <p className="mt-2 text-gray-600">
                {registrationData 
                  ? "Complete seu pagamento para criar e ativar sua conta com 7 dias de teste grátis."
                  : "Complete seu pagamento para ativar sua assinatura."
                }
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  💰 Valor: <strong>R$ 37,00 por mês</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {isProduction ? "Ambiente de Produção - Pagamento Real" : "Ambiente de Teste"}
                </p>
                {registrationData && (
                  <p className="text-xs text-green-600 mt-1">
                    🎁 <strong>Inclui 7 dias de teste grátis!</strong>
                  </p>
                )}
              </div>
            </div>
            
            {!isProduction && <TestEnvironmentWarning />}
            
            <PlanInfoBox />
            
            <PaymentForm 
              onProcessingChange={setPaymentFormProcessing}
              isTestEnvironment={!isProduction}
              initialEmail={registrationData?.email || user?.email}
              clientReferenceId={user ? user.id : registrationData?.email}
            />
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seu pagamento é seguro e processado pelo Stripe.</p>
              {registrationData && (
                <p className="mt-1 font-medium text-green-600">
                  ✅ Após o pagamento, você terá 7 dias de teste grátis para explorar todas as funcionalidades.
                </p>
              )}
              <p className="mt-1 font-medium text-red-600">
                ⚠️ Após o pagamento, você receberá um email de confirmação. 
                Confirme seu email antes de tentar fazer login.
              </p>
            </div>
          </div>
        )}
        {step === 2 && (
          <PaymentSuccess />
        )}
      </div>
    </div>
  );
};

export default PagamentoPage;
