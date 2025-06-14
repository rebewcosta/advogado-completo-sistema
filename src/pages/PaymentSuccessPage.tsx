
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Verificar status da assinatura ao carregar a página
  useEffect(() => {
    const verificarAssinatura = async () => {
      try {
        // Verifica se o usuário está logado
        const { data: { session }} = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Não autenticado",
            description: "Faça login para continuar.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        
        // Invoca a edge function para verificar o status da assinatura
        await supabase.functions.invoke('verificar-assinatura');
        
        // A função acima apenas verifica e atualiza o status, não precisamos fazer nada com o retorno
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
      }
    };
    
    verificarAssinatura();
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Pagamento Concluído!</h1>
          
          <div className="mb-6 text-gray-600">
            <p className="mb-2">
              Obrigado por assinar o JusGestão! Seu pagamento foi processado com sucesso.
            </p>
            <p>
              Sua assinatura está ativa e você já pode acessar todos os recursos do sistema.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/dashboard" className="flex items-center justify-center">
                Ir para o Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/perfil" className="flex items-center justify-center">
                Ver Detalhes da Assinatura
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Se você tiver alguma dúvida sobre sua assinatura, acesse a seção de 
              <Link to="/perfil" className="text-blue-600 hover:text-blue-800 ml-1">
                Perfil
              </Link> ou entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
