
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StatusAssinatura from '@/components/StatusAssinatura';
import { Spinner } from '@/components/ui/spinner';
import { CreditCard, RefreshCcw } from 'lucide-react';
import { abrirPortalCliente } from '@/services/stripe';

interface AssinaturaInfo {
  status: 'ativa' | 'pendente' | 'inativa';
  dataProximoFaturamento?: string;
}

const GerenciarAssinatura = () => {
  const [assinaturaInfo, setAssinaturaInfo] = useState<AssinaturaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [carregandoPortal, setCarregandoPortal] = useState(false);
  const { toast } = useToast();

  const verificarAssinatura = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session) {
        // Simulando dados de assinatura - em produção, você consultaria uma API
        // Em um ambiente real, você consultaria o banco de dados ou uma API do Stripe
        const dataAtual = new Date();
        const proximaCobranca = new Date(dataAtual);
        proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
        
        setAssinaturaInfo({
          status: 'ativa',
          dataProximoFaturamento: proximaCobranca.toLocaleDateString('pt-BR')
        });
      } else {
        setAssinaturaInfo({
          status: 'inativa'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      toast({
        title: 'Erro ao verificar assinatura',
        description: 'Não foi possível verificar o status da sua assinatura.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirPortalCliente = async () => {
    setCarregandoPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para gerenciar sua assinatura.',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Redirecionando',
        description: 'Você será redirecionado para o portal do cliente Stripe.',
      });
      
      // Chamar a função para abrir o portal do cliente
      const url = await abrirPortalCliente();
      
      // Redirecionar para o portal do cliente
      window.location.href = url;
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: 'Erro ao abrir portal do cliente',
        description: 'Não foi possível abrir o portal de gerenciamento de assinatura.',
        variant: 'destructive'
      });
    } finally {
      setCarregandoPortal(false);
    }
  };

  useEffect(() => {
    verificarAssinatura();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold mb-2 md:mb-0">Sua Assinatura</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={verificarAssinatura}
          className="flex items-center"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar Status
        </Button>
      </div>

      {assinaturaInfo ? (
        <>
          <StatusAssinatura 
            status={assinaturaInfo.status} 
            dataProximoFaturamento={assinaturaInfo.dataProximoFaturamento}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Gerenciar Assinatura</h3>
            <p className="text-gray-600 text-sm mb-4">
              Você pode alterar sua forma de pagamento, cancelar ou atualizar sua assinatura através do portal do cliente.
            </p>
            
            <Button 
              onClick={handleAbrirPortalCliente}
              disabled={carregandoPortal || assinaturaInfo.status === 'inativa'}
            >
              {carregandoPortal ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Carregando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gerenciar Assinatura
                </>
              )}
            </Button>
          </div>
          
          {assinaturaInfo.status === 'inativa' && (
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-yellow-800">
                Sua assinatura está inativa. Para acessar todos os recursos do JusGestão, você precisa ativar uma assinatura.
              </p>
              <Button 
                variant="default" 
                className="mt-2"
                onClick={() => window.location.href = '/pagamento'}
              >
                Assinar Agora
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-center">
          <p className="text-gray-600">Não foi possível carregar informações da assinatura.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={verificarAssinatura}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
};

export default GerenciarAssinatura;
