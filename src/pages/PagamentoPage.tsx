import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PaymentForm from '@/components/payment/PaymentForm';
import TestEnvironmentWarning from '@/components/payment/TestEnvironmentWarning';
import PlanInfoBox from '@/components/payment/PlanInfoBox';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth
import { supabase } from '@/integrations/supabase/client'; // Importar supabase se precisar do client_reference_id

const PagamentoPage = () => {
  const [isSubmittingUser, setIsSubmittingUser] = useState(false); // Para o processo de signUp pós-pagamento
  const [paymentFormProcessing, setPaymentFormProcessing] = useState(false); // Para o botão de pagamento do Stripe
  const [step, setStep] = useState(1); // 1: Formulário de pagamento, 2: Sucesso
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { signUp, user } = useAuth(); // Pegar a função signUp e user
  const isTestEnvironment = process.env.NODE_ENV !== 'production';

  // Dados de registro vindos da página de cadastro
  const registrationData = (location.state as any)?.registrationData;
  const clientReferenceId = (location.state as any)?.clientReferenceId; // Se você decidir passar o ID do usuário

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      // Pagamento foi bem-sucedido no Stripe
      if (registrationData) {
        // Cenário: Novo usuário que acabou de pagar
        handlePostPaymentSignUp();
      } else if (clientReferenceId) {
        // Cenário: Usuário existente que estava reativando/assinando (o webhook deve tratar)
        // Aqui, apenas mostramos a tela de sucesso. O webhook do Stripe deve atualizar os metadados do usuário.
        console.log("Pagamento bem-sucedido para usuário existente (ID):", clientReferenceId);
        setStep(2); // Mostrar tela de sucesso
        toast({
          title: "Pagamento Confirmado!",
          description: "Sua assinatura foi atualizada. Pode levar alguns instantes para o sistema refletir a mudança.",
        });
      } else {
        // Se não houver registrationData nem clientReferenceId, é um fluxo inesperado
        // ou usuário acessou a URL diretamente.
        console.warn("Sucesso no pagamento, mas sem dados de registro ou ID de cliente de referência.");
        toast({
          title: "Pagamento Concluído",
          description: "Seu pagamento foi processado. Se você estava criando uma nova conta, pode haver um atraso na ativação. Contate o suporte se necessário.",
        });
        // Poderia redirecionar para login ou dashboard, mas mostrar sucesso é mais seguro.
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
      // O signUp em useAuth já lida com toasts de sucesso/erro e navegação inicial.
      // Após o signUp bem-sucedido (e se a confirmação de email não for necessária imediatamente
      // para login, ou estiver desabilitada), o onAuthStateChange no useAuth deve atualizar o 'user'.
      // O importante aqui é que o webhook do Stripe (`checkout.session.completed`)
      // associe o pagamento ao usuário que acabou de ser criado.
      // Por isso, o `client_reference_id` no checkout do Stripe é vital.
      setStep(2); // Mostrar tela de sucesso do pagamento
    } catch (error) {
      console.error("Erro ao criar conta após pagamento:", error);
      toast({
        title: "Erro ao Finalizar Cadastro",
        description: "Houve um problema ao criar sua conta após o pagamento. Seu pagamento foi processado. Por favor, contate o suporte com seu email para finalizarmos a ativação da sua conta.",
        variant: "destructive",
        duration: 10000,
      });
      // Não redirecionar para /cadastro, pois o usuário já pagou.
      // O melhor é mostrar uma mensagem de erro e instrução para contatar suporte.
      // Mantemos o usuário na PagamentoPage ou redirecionamos para uma página de erro específica.
      // Por enquanto, vamos mantê-lo com uma mensagem de erro.
      // setStep(1) // Volta para o formulário de pagamento, mas isso pode ser confuso
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
              // Passar o email do cadastro para o PaymentForm
              // ou o email do usuário logado se não for um novo cadastro.
              initialEmail={registrationData?.email || user?.email}
              // Passar o ID do usuário se ele já existir (não é um novo cadastro)
              // para o client_reference_id no Stripe.
              // Se for um novo cadastro (registrationData existe), não temos user.id ainda.
              // O client_reference_id será o email nesse caso, e o webhook associará ao user_id após o signUp.
              // Se for um usuário existente reativando, passamos o user.id.
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