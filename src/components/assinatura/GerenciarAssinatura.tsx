
// src/components/assinatura/GerenciarAssinatura.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusAssinatura from '@/components/StatusAssinatura';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, CreditCard, ShoppingCart } from 'lucide-react';

// Definindo um tipo para a resposta esperada da função SQL
interface AssinaturaInfo {
  status: 'ativa' | 'pendente' | 'inativa' | 'admin' | 'amigo';
  proximo_faturamento: string | null;
  account_type: 'premium' | 'admin' | 'amigo' | 'pendente' | 'none';
  message: string;
}

const GerenciarAssinatura = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [assinaturaInfo, setAssinaturaInfo] = useState<AssinaturaInfo | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setErrorMessage(null);
    
    if (!user || !session) {
      setAssinaturaInfo({
        status: 'inativa',
        proximo_faturamento: null,
        account_type: 'none',
        message: 'Faça login para ver os detalhes da sua assinatura.'
      });
      setIsLoadingStatus(false);
      return;
    }

    try {
      console.log("🔄 Verificando status da assinatura para usuário:", user.id);
      
      const { data, error } = await supabase.rpc('verificar_status_assinatura', {
        p_user_id: user.id
      });

      if (error) {
        console.error("❌ Erro RPC verificar_status_assinatura:", error);
        throw new Error(error.message || "Falha ao buscar dados da assinatura.");
      }

      if (data) {
        console.log("✅ Dados da assinatura recebidos:", data);
        setAssinaturaInfo(data as unknown as AssinaturaInfo);
      } else {
        throw new Error("Nenhuma informação de assinatura retornada.");
      }

    } catch (error: any) {
      console.error("❌ Erro ao buscar status da assinatura:", error);
      const errorMsg = error.message || "Erro ao carregar status da assinatura.";
      setErrorMessage(errorMsg);
      setAssinaturaInfo({
        status: 'inativa',
        proximo_faturamento: null,
        account_type: 'none',
        message: errorMsg
      });
      toast({ 
        title: "Erro ao Carregar Assinatura", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, [user, session, toast]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const handleAbrirPortalCliente = async () => {
    setIsPortalLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("🔄 Abrindo portal do cliente...");
      
      const { data, error } = await supabase.functions.invoke('criar-portal-cliente');

      if (error) {
        console.error("❌ Erro ao invocar função do portal:", error);
        throw new Error(error.message || "Erro ao invocar função do portal.");
      }
      
      if (data && data.url) {
        console.log("✅ URL do portal recebida:", data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Portal do Cliente",
          description: "Redirecionando para o portal de gerenciamento...",
        });
      } else {
        console.error("❌ URL do portal não recebida:", data);
        throw new Error("URL do portal do cliente não recebida.");
      }
    } catch (error: any) {
      console.error("❌ Erro ao abrir portal do cliente:", error);
      const errorMsg = error.message || "Erro ao abrir o portal do cliente.";
      setErrorMessage(errorMsg);
      toast({ 
        title: "Erro Portal Cliente", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleNovaAssinatura = async () => {
    setIsCheckoutLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("🔄 Iniciando nova assinatura...");
      
      const { data, error } = await supabase.functions.invoke('criar-sessao-checkout', {
        body: {
          nomePlano: "JusGestão Premium",
          valor: 3700,
          emailCliente: user?.email,
          dominio: window.location.origin
        }
      });

      if (error) {
        console.error("❌ Erro ao criar sessão de checkout:", error);
        throw new Error(error.message || "Erro ao criar sessão de pagamento.");
      }
      
      if (data && data.url) {
        console.log("✅ URL do checkout recebida:", data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Nova Assinatura",
          description: "Redirecionando para o pagamento...",
        });
      } else {
        console.error("❌ URL do checkout não recebida:", data);
        throw new Error("URL de pagamento não recebida.");
      }
    } catch (error: any) {
      console.error("❌ Erro ao iniciar nova assinatura:", error);
      const errorMsg = error.message || "Erro ao iniciar nova assinatura.";
      setErrorMessage(errorMsg);
      toast({ 
        title: "Erro ao Assinar", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };
  
  if (isLoadingStatus) {
    return (
      <Card className="shadow-md rounded-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-lawyer-primary mb-3" />
          <p className="text-gray-500">Verificando status da assinatura...</p>
        </CardContent>
      </Card>
    );
  }

  if (!assinaturaInfo) {
    return (
      <Card className="shadow-md rounded-lg border-red-200 bg-red-50">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
          <p className="text-red-700 font-medium">Não foi possível carregar as informações da assinatura.</p>
          <p className="text-sm text-red-600 mt-1">{errorMessage || "Tente novamente mais tarde."}</p>
           <Button onClick={fetchSubscriptionStatus} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4"/>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Mapeamento para o componente StatusAssinatura
  let statusParaComponente: 'ativa' | 'pendente' | 'inativa' = 'inativa';
  if (assinaturaInfo.account_type === 'premium' && assinaturaInfo.status === 'ativa') {
    statusParaComponente = 'ativa';
  } else if (assinaturaInfo.account_type === 'admin' || assinaturaInfo.account_type === 'amigo') {
    statusParaComponente = 'ativa';
  } else if (assinaturaInfo.status === 'pendente') {
    statusParaComponente = 'pendente';
  }

  const isSpecialAccount = assinaturaInfo.account_type === 'admin' || assinaturaInfo.account_type === 'amigo';
  const isInactiveAccount = assinaturaInfo.account_type === 'none' && statusParaComponente === 'inativa';
  const isPremiumOrPending = assinaturaInfo.account_type === 'premium' || assinaturaInfo.account_type === 'pendente';

  return (
    <Card className="shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Minha Assinatura</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Detalhes sobre seu plano e acesso ao JusGestão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusAssinatura
          status={statusParaComponente}
          dataProximoFaturamento={assinaturaInfo.proximo_faturamento}
          accountType={assinaturaInfo.account_type} 
          customMessage={assinaturaInfo.message}
          plano={
            assinaturaInfo.account_type === 'admin' ? 'Acesso Administrador' :
            assinaturaInfo.account_type === 'amigo' ? 'Assinatura Amiga (Cortesia)' :
            'JusGestão Premium'
          }
          hideActionButtons={true}
        />
        
        {errorMessage && !isLoadingStatus && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center text-sm">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}
        
        {/* Seção de Ações Avançadas */}
        <div className="mt-6 space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Gerenciar Assinatura</h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Botão Portal do Cliente - Disponível para contas premium/pendentes OU canceladas recentemente */}
              {!isSpecialAccount && (
                <Button 
                  onClick={handleAbrirPortalCliente}
                  disabled={isPortalLoading}
                  variant="outline"
                  className="flex items-center gap-2 text-sm"
                >
                  {isPortalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {isPortalLoading ? "Abrindo..." : "Portal do Cliente"}
                </Button>
              )}

              {/* Botão Nova Assinatura - Para contas inativas */}
              {isInactiveAccount && (
                <Button 
                  onClick={handleNovaAssinatura}
                  disabled={isCheckoutLoading}
                  className="flex items-center gap-2 text-sm bg-lawyer-primary hover:bg-lawyer-primary/90"
                >
                  {isCheckoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  {isCheckoutLoading ? "Processando..." : "Nova Assinatura"}
                </Button>
              )}

              {/* Botão Atualizar Status - Sempre disponível */}
              <Button 
                onClick={fetchSubscriptionStatus} 
                variant="outline" 
                size="sm"
                disabled={isLoadingStatus}
                className="flex items-center gap-2 text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingStatus ? 'animate-spin' : ''}`}/>
                {isLoadingStatus ? "Atualizando..." : "Atualizar Status"}
              </Button>
            </div>
          </div>

          {/* Informações de Ajuda - Apenas para contas não especiais */}
          {!isSpecialAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">💡 Como resolver problemas de pagamento:</h4>
              <div className="space-y-2 text-xs text-blue-700">
                <div className="flex items-start gap-2">
                  <span className="font-medium">📋 Cartão vencido/bloqueado:</span>
                  <span>Use o "Portal do Cliente" para atualizar seu método de pagamento</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">💳 Fatura em aberto:</span>
                  <span>Acesse o "Portal do Cliente" para visualizar e pagar pendências</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">❌ Assinatura cancelada:</span>
                  <span>Clique em "Nova Assinatura" para reativar seu plano</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">🔄 Status incorreto:</span>
                  <span>Use "Atualizar Status" após resolver problemas no Stripe</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600 font-medium">
                  ⏰ <strong>Importante:</strong> Você tem 5 dias para resolver problemas de pagamento antes do cancelamento automático.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GerenciarAssinatura;
