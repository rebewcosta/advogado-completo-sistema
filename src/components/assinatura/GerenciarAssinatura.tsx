// src/components/assinatura/GerenciarAssinatura.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StatusAssinatura from '@/components/StatusAssinatura'; // Seu componente para exibir o status
import { Spinner } from '@/components/ui/spinner';
import { CreditCard, RefreshCcw, ShieldCheck, UserCheck, AlertTriangle, Gift, Crown } from 'lucide-react';
import { abrirPortalCliente } from '@/services/stripe';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface AssinaturaDetalhada {
  statusGeral: 'ativa' | 'inativa' | 'pendente' | 'admin' | 'amigo'; // Status simplificado para UI
  account_type: string; // "Admin", "Membro Amigo", "Membro Premium", "Visitante", "Ex-Assinante" etc.
  plano?: string;
  dataProximoFaturamento?: string; // Próxima cobrança ou fim do período atual
  mensagemDetalhada?: string;
  podeGerenciarStripe: boolean;
}

const GerenciarAssinatura = () => {
  const [detalhesAssinatura, setDetalhesAssinatura] = useState<AssinaturaDetalhada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [carregandoPortal, setCarregandoPortal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDetalhesAssinatura = async () => {
    if (!user) {
      setDetalhesAssinatura({
        statusGeral: 'inativa',
        account_type: 'Visitante',
        mensagemDetalhada: 'Faça login para ver os detalhes da sua conta.',
        podeGerenciarStripe: false,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("GerenciarAssinatura: Iniciando verificação de assinatura para", user.email);

    try {
      // Não precisamos mais do token aqui, pois a Edge Function o pegará do header
      const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');

      if (funcError) {
        console.error('GerenciarAssinatura: Erro ao invocar verificar-assinatura:', funcError);
        throw new Error((funcError as any).context?.data?.error || funcError.message || "Erro ao buscar dados da assinatura.");
      }

      console.log("GerenciarAssinatura: Resposta da função verificar-assinatura:", funcResponse);

      const accountType = funcResponse.account_type || "Visitante";
      let statusGeral: AssinaturaDetalhada['statusGeral'] = 'inativa';
      let podeGerenciarStripe = false;

      if (accountType === "Admin") {
        statusGeral = 'admin';
      } else if (accountType === "Membro Amigo") {
        statusGeral = 'amigo';
      } else if (funcResponse.subscribed && accountType === "Membro Premium") {
        statusGeral = 'ativa';
        podeGerenciarStripe = true; // Apenas Membros Premium podem gerenciar no Stripe
      } else if (funcResponse.subscription_status && ['canceled', 'past_due', 'unpaid'].includes(funcResponse.subscription_status)) {
        statusGeral = 'inativa'; // Ou poderia ser 'cancelada', 'pendente_pagamento'
      }


      setDetalhesAssinatura({
        statusGeral,
        account_type: accountType,
        plano: funcResponse.subscription_tier || "N/A",
        dataProximoFaturamento: funcResponse.subscription_end || "N/A",
        mensagemDetalhada: funcResponse.message || "Status da conta.",
        podeGerenciarStripe,
      });

    } catch (error: any) {
      console.error('GerenciarAssinatura: Erro no catch ao verificar assinatura:', error);
      toast({
        title: 'Erro ao Consultar Assinatura',
        description: error.message || 'Não foi possível obter os detalhes da sua conta.',
        variant: 'destructive'
      });
      setDetalhesAssinatura({ statusGeral: 'pendente', account_type: 'Erro', mensagemDetalhada: "Falha ao carregar dados.", podeGerenciarStripe: false });
    } finally {
      setIsLoading(false);
      console.log("GerenciarAssinatura: Verificação de assinatura finalizada.");
    }
  };

  useEffect(() => {
    fetchDetalhesAssinatura();
  }, [user]);

  const handleAbrirPortalClienteStripe = async () => {
    // ... (manter a lógica que já funciona para abrir o portal do Stripe)
    setCarregandoPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Erro de autenticação', description: 'Você precisa estar logado.', variant: 'destructive' });
        setCarregandoPortal(false);
        return;
      }
      toast({ title: 'Redirecionando', description: 'Você será redirecionado para o portal do cliente Stripe.' });
      const url = await abrirPortalCliente();
      window.location.href = url;
    } catch (error: any) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({ title: 'Erro ao abrir portal', description: error.message || 'Não foi possível abrir o portal.', variant: 'destructive' });
    } finally {
      // Não setar carregandoPortal para false aqui, pois a página vai redirecionar
    }
  };
  
  const EtiquetaContaDisplay = () => {
    if (!detalhesAssinatura) return null;

    let icon;
    let bgColorClass = "bg-gray-100";
    let textColorClass = "text-gray-800";
    let textoEtiqueta = detalhesAssinatura.account_type;

    switch (detalhesAssinatura.account_type) {
      case "Admin":
        icon = <ShieldCheck className="mr-3 h-6 w-6" />;
        bgColorClass = "bg-purple-50 border-purple-200";
        textColorClass = "text-purple-700";
        break;
      case "Membro Amigo":
        icon = <Gift className="mr-3 h-6 w-6" />;
        bgColorClass = "bg-blue-50 border-blue-200";
        textColorClass = "text-blue-700";
        break;
      case "Membro Premium":
        icon = <Crown className="mr-3 h-6 w-6" />;
        bgColorClass = "bg-green-50 border-green-200";
        textColorClass = "text-green-700";
        break;
      default: // Visitante, Ex-Assinante, Erro
        icon = <AlertTriangle className="mr-3 h-6 w-6" />;
        bgColorClass = "bg-yellow-50 border-yellow-200";
        textColorClass = "text-yellow-700";
        break;
    }

    return (
      <div className={`p-4 rounded-lg mb-6 border ${bgColorClass} ${textColorClass} flex items-start shadow-sm`}>
        {icon}
        <div>
          <h3 className="text-lg font-semibold">Tipo de Conta: {textoEtiqueta}</h3>
          {detalhesAssinatura.mensagemDetalhada && <p className="text-sm mt-1">{detalhesAssinatura.mensagemDetalhada}</p>}
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="ml-3 text-gray-600">Carregando informações da sua conta...</p>
      </div>
    );
  }

  if (!detalhesAssinatura) {
    return <div className="p-4 text-center text-gray-500">Não foi possível carregar os detalhes da sua conta. Tente atualizar.</div>;
  }

  return (
    <div className="space-y-8">
      <EtiquetaContaDisplay />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold mb-2 md:mb-0">Detalhes da Assinatura</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDetalhesAssinatura}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {(detalhesAssinatura.statusGeral === 'ativa' || detalhesAssinatura.statusGeral === 'admin' || detalhesAssinatura.statusGeral === 'amigo') && (
        <StatusAssinatura
          status={detalhesAssinatura.statusGeral} // Passa o statusGeral
          dataProximoFaturamento={detalhesAssinatura.dataProximoFaturamento}
          plano={detalhesAssinatura.plano}
        />
      )}
      
      {detalhesAssinatura.podeGerenciarStripe && (
         <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Gerenciar Pagamentos</h3>
            <p className="text-gray-600 text-sm mb-4">
              Altere sua forma de pagamento, veja faturas ou cancele sua assinatura através do portal do cliente Stripe.
            </p>
            <Button
              onClick={handleAbrirPortalClienteStripe}
              disabled={carregandoPortal}
            >
              {carregandoPortal ? (
                <><Spinner size="sm" className="mr-2" /> Carregando Portal...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" /> Acessar Portal do Cliente</>
              )}
            </Button>
          </div>
      )}

      {detalhesAssinatura.statusGeral === 'inativa' && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0"/>
            <div>
              <h4 className="font-semibold">Assinatura Inativa</h4>
              <p className="mt-1">
                Para ter acesso completo a todos os recursos do JusGestão, por favor, ative uma assinatura.
              </p>
              <Button
                asChild
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Link to="/pagamento">Assinar Agora</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
       {detalhesAssinatura.statusGeral === 'pendente' && (
             <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 shadow-sm">
                <div className="flex items-start">
                    <Clock className="h-6 w-6 mr-3 flex-shrink-0"/>
                    <div>
                        <h4 className="font-semibold">Status Pendente</h4>
                        <p className="mt-1">Não foi possível confirmar o status da sua assinatura no momento. Tente atualizar em alguns instantes ou contate o suporte.</p>
                    </div>
                </div>
             </div>
          )}
    </div>
  );
};

export default GerenciarAssinatura;