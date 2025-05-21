
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PaymentForm from '@/components/payment/PaymentForm';
import TestEnvironmentWarning from '@/components/payment/TestEnvironmentWarning';
import PlanInfoBox from '@/components/payment/PlanInfoBox';
import PaymentSuccess from '@/components/payment/PaymentSuccess';

const PagamentoPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const location = useLocation();
  const isTestEnvironment = process.env.NODE_ENV !== 'production';
  
  // Verificar parâmetros de URL ao carregar a página
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setStep(2); // Mostrar tela de sucesso
    }
    if (params.get('canceled') === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Tente novamente quando estiver pronto.",
        variant: "destructive"
      });
    }
    
    // Log para debug
    console.log("PagamentoPage carregada. URL params:", Object.fromEntries(params.entries()));
    console.log("Ambiente:", process.env.NODE_ENV === 'production' ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
  }, [location, toast]);

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {step === 1 ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <Link to="/cadastro" className="flex items-center text-lawyer-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o cadastro
            </Link>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Pagamento da Assinatura
              </h2>
              <p className="mt-2 text-gray-600">
                Complete seu pagamento para ativar sua conta
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
              onProcessingChange={setIsProcessing}
              isTestEnvironment={isTestEnvironment}
            />
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seu pagamento é seguro e processado em ambiente criptografado pelo Stripe.</p>
            </div>
          </div>
        ) : (
          <PaymentSuccess />
        )}
      </div>
    </div>
  );
};

export default PagamentoPage;
