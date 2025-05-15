
import React, { useState } from 'react';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PagamentoPage = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2); // Move to success step
      
      toast({
        title: "Pagamento processado com sucesso",
        description: "Sua assinatura foi ativada.",
      });
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
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
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card-number"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm pl-10"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    id="card-name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                    placeholder="João M. Silva"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Validade
                    </label>
                    <input
                      type="text"
                      id="expiry-date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Segurança (CVV)
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary sm:text-sm"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lawyer-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawyer-primary ${isProcessing ? 'opacity-75' : ''}`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando pagamento...
                      </span>
                    ) : (
                      'Pagar R$ 127,00'
                    )}
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Seu pagamento é seguro e processado em ambiente criptografado.</p>
            </div>
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
