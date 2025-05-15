
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PaymentSuccess: React.FC = () => {
  return (
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
      
      <div className="space-y-4 mb-8">
        <h3 className="font-medium text-lg">Próximos Passos:</h3>
        <ul className="text-left space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 mr-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span>Explore o <strong>Dashboard</strong> para ver uma visão geral do seu escritório</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 mr-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span>Adicione seus primeiros <strong>clientes</strong> ao sistema</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 mr-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span>Cadastre seus <strong>processos</strong> em andamento</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 mr-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <span>Configure seu perfil e preferências nas <strong>configurações</strong></span>
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="flex items-center justify-center">
          <Link to="/dashboard">
            Acessar o Sistema 
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="flex items-center justify-center">
          <Link to="/suporte">
            Ver Tutoriais e Suporte
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Precisa de ajuda? Entre em contato com nosso suporte:</p>
        <p className="mt-1">
          <a href="mailto:suporte@sisjusgestao.com.br" className="text-lawyer-primary hover:underline">
            suporte@sisjusgestao.com.br
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
