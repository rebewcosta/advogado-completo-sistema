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
  const isTestEnvironment = process.env.NODE_ENV !== 'production';

  // Dados de registro vindos da página de cadastro
  const registrationData = location.state?.registrationData;
  const clientReferenceId = location.state?.clientReferenceId;

  useEffect(() => {
    // Debug logs to help identify issues
    console.log("PagamentoPage mounted");
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
          description: "Sua assinatura foi atualizada. Pode levar alguns instantes para o sistema refletir a mudança.",
        });
      } else {
        // Se não houver registrationData nem clientReferenceId, é um fluxo inesperado
        console.warn("Sucesso no pagamento, mas sem dados de registro ou ID de cliente de referência.");
        toast({
          title: "Pagamento Concluído",
          description: "Seu pagamento foi processado. Se você estava criando uma nova conta, pode haver um atraso na ativação. Contate o suporte se necessário.",
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
  }, [location.search, registrationData, clientReferenceId, navigate, toast]);

  const handlePostPaymentSignUp = async () => {
    if (!registrationData) {
      console.error("handlePostPaymentSignUp chamado sem registrationData.");
      return;
    }

    setIsSubmittingUser(true);
    try {
      console.log("Finalizando cadastro após pagamento para:", registrationData.email);
      await signUp(registrationData.email, registrationData.password, { 
        nome: registrationData.nome,
        emailRedirectTo: `${window.location.origin}/login` 
      });
      setStep(2); // Mostrar tela de sucesso do pagamento
    } catch (error) {
      console.error("Erro ao criar conta após pagamento:", error);
      toast({
        title: "Erro ao Finalizar Cadastro",
        description: "Houve um problema ao criar sua conta após o pagamento. Seu pagamento foi processado. Por favor, contate o suporte com seu email para finalizarmos a ativação da sua conta.",
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
              state={registrationData ? { prefill: registrationData } : undefined} // Para repopular o cadastro
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
                  ? "Complete seu pagamento para criar e ativar sua conta."
                  : "Complete seu pagamento para ativar sua assinatura."
                }
              </p>
              {process.env.NODE_ENV === 'production' ? (
                <div className="mt-2 inline-block px-4 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Ambiente de Produção
                </div>
              ) : (
                <div className="mt-2 inline-block px-4 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Ambiente de Teste
                </div>
              )}
            </div>
            
            {isTestEnvironment && <TestEnvironmentWarning />}
            
            <PlanInfoBox />
            
            <PaymentForm 
              onProcessingChange={setPaymentFormProcessing}
              isTestEnvironment={isTestEnvironment}
              initialEmail={registrationData?.email || user?.email}
              clientReferenceId={user ? user.id : registrationData?.email}
            />
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seu pagamento é seguro e processado em ambiente criptografado pelo Stripe.</p>
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
