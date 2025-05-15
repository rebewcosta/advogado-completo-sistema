
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, CreditCard, Info, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { iniciarCheckout } from '@/services/stripe';

const PagamentoPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  
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
  }, [location, toast]);

  // Função para processar o pagamento com Stripe
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('Iniciando checkout com email:', email);
      
      // Inicia o checkout utilizando o Stripe
      const result = await iniciarCheckout({
        nomePlano: 'Plano Mensal JusGestão',
        valor: 12700,
        emailCliente: email // Usamos o email informado pelo usuário
      });
      
      console.log('Resultado do checkout:', result);
      
      if (result && result.url) {
        // Redirecionar para a URL do Stripe checkout
        window.location.href = result.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Redirecionando para o pagamento",
        description: "Você será redirecionado para a página de pagamento do Stripe.",
      });
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setIsProcessing(false);
      toast({
        title: "Erro no pagamento",
        description: "Houve um problema ao processar seu pagamento. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

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
            </div>
            
            {isTestEnvironment && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Ambiente de teste</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Este é um ambiente de teste. Os pagamentos não serão cobrados realmente.
                      Você pode usar os dados de teste fornecidos abaixo.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Check className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-blue-800">Plano Mensal - R$ 127,00/mês</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Acesso completo a todas as funcionalidades do sistema JusGestão.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmitPayment}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Seu Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing || !email}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary ${isProcessing ? 'opacity-75' : ''}`}
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
                      'Pagar com Stripe - R$ 127,00'
                    )}
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seu pagamento é seguro e processado em ambiente criptografado pelo Stripe.</p>
            </div>
            
            {isTestEnvironment && (
              <div className="mt-8 border-t pt-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Info className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="font-medium">Dados para teste (ambiente de desenvolvimento)</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><span className="font-medium">Cartão:</span> 4242 4242 4242 4242</p>
                  <p><span className="font-medium">Expiração:</span> Qualquer data futura (ex: 12/25)</p>
                  <p><span className="font-medium">CVV:</span> Qualquer número de 3 dígitos (ex: 123)</p>
                  <p><span className="font-medium">Nome:</span> Qualquer nome</p>
                  <p className="mt-1 text-gray-500 italic">Estes são dados de teste do Stripe, sem cobrança real.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Pagamento Confirmado!
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Sua assinatura foi ativada com sucesso. Agora você tem acesso completo ao sistema JusGestão.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-8 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Check className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-blue-800">Plano Mensal Ativo</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Próxima cobrança: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
            
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary"
            >
              Acessar o Sistema
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagamentoPage;
