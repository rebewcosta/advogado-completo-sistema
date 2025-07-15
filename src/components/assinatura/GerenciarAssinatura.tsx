
// src/components/assinatura/GerenciarAssinatura.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusAssinatura from '@/components/StatusAssinatura';
import HistoricoPagamentos from '@/components/assinatura/HistoricoPagamentos';
import ContaCancelada from '@/components/assinatura/ContaCancelada';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, CreditCard, ShoppingCart, CheckCircle } from 'lucide-react';

// Definindo um tipo para a resposta esperada da função SQL
interface AssinaturaInfo {
  status: 'ativa' | 'pendente' | 'inativa' | 'admin' | 'amigo';
  proximo_faturamento: string | null;
  account_type: 'premium' | 'admin' | 'amigo' | 'pendente' | 'none' | 'trial';
  trial_days_remaining?: number | null;
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
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSubscriptionStatus = useCallback(async (showSuccessToast = false) => {
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
      
      const { data, error } = await supabase.functions.invoke('verificar-assinatura');

      if (error) {
        console.error("❌ Erro ao verificar assinatura:", error);
        throw new Error(error.message || "Falha ao buscar dados da assinatura.");
      }

      if (data) {
        console.log("✅ Dados da assinatura recebidos:", data);
        
        // Mapear a resposta da edge function para o formato esperado
        const mappedData: AssinaturaInfo = {
          status: data.subscribed ? 'ativa' : 'inativa',
          proximo_faturamento: data.subscription_end ? 
            new Date(data.subscription_end).toLocaleDateString('pt-BR') : null,
          account_type: data.account_type || 'none',
          trial_days_remaining: data.trial_days_remaining,
          message: data.message || 'Status verificado com sucesso.'
        };
        
        setAssinaturaInfo(mappedData);
        setLastRefresh(new Date());
        
        if (showSuccessToast) {
          toast({
            title: "Status Atualizado",
            description: "Informações da assinatura atualizadas com sucesso.",
            duration: 3000,
          });
        }
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

  const handleRefreshStatus = () => {
    fetchSubscriptionStatus(true);
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
           <Button onClick={handleRefreshStatus} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4"/>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se a conta foi cancelada, mostrar o componente dedicado
  if (assinaturaInfo.account_type === 'none' && assinaturaInfo.status === 'inativa' && 
      assinaturaInfo.message.includes('cancelada')) {
    return <ContaCancelada onRenovarAssinatura={handleNovaAssinatura} />;
  }
  
  // Mapeamento para o componente StatusAssinatura
  let statusParaComponente: 'ativa' | 'pendente' | 'inativa' = 'inativa';
  if (assinaturaInfo.account_type === 'premium' && assinaturaInfo.status === 'ativa') {
    statusParaComponente = 'ativa';
  } else if (assinaturaInfo.account_type === 'admin' || assinaturaInfo.account_type === 'amigo' || assinaturaInfo.account_type === 'trial') {
    statusParaComponente = 'ativa';
  } else if (assinaturaInfo.status === 'pendente') {
    statusParaComponente = 'pendente';
  }

  const isSpecialAccount = assinaturaInfo.account_type === 'admin' || assinaturaInfo.account_type === 'amigo';
  const isTrialAccount = assinaturaInfo.account_type === 'trial';
  const isInactiveAccount = assinaturaInfo.account_type === 'none' && statusParaComponente === 'inativa';
  const isPremiumOrPending = assinaturaInfo.account_type === 'premium' || assinaturaInfo.account_type === 'pendente';

  return (
    <div className="space-y-6">
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
            trialDaysRemaining={assinaturaInfo.trial_days_remaining}
            customMessage={assinaturaInfo.message}
            plano={
              assinaturaInfo.account_type === 'admin' ? 'Acesso Administrador' :
              assinaturaInfo.account_type === 'amigo' ? 'Assinatura Amiga (Cortesia)' :
              assinaturaInfo.account_type === 'trial' ? 'Período de Teste Gratuito' :
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Ações Rápidas</h3>
                {lastRefresh && (
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Atualizado: {lastRefresh.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Botão Portal do Cliente - Disponível para contas premium/pendentes */}
                {!isSpecialAccount && !isTrialAccount && (
                  <>
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
                    <Button 
                      onClick={handleAbrirPortalCliente}
                      disabled={isPortalLoading}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {isPortalLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {isPortalLoading ? "Abrindo..." : "Cancelar Assinatura"}
                    </Button>
                  </>
                )}

                {/* Botão Nova Assinatura - Para contas inativas ou trial */}
                {(isInactiveAccount || isTrialAccount) && (
                  <Button 
                    onClick={handleNovaAssinatura}
                    disabled={isCheckoutLoading}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                    size="lg"
                  >
                    {isCheckoutLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    {isCheckoutLoading ? "Processando..." : 
                     isTrialAccount ? "🚀 Assinar Agora" : "🚀 Renovar Assinatura"}
                  </Button>
                )}

                {/* Botão Atualizar Status - Sempre disponível */}
                <Button 
                  onClick={handleRefreshStatus} 
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
          </div>
        </CardContent>
      </Card>

      {/* Tabs para histórico e informações adicionais */}
      <Tabs defaultValue="historico" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
          <TabsTrigger value="ajuda">Central de Ajuda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="historico" className="space-y-4">
          <HistoricoPagamentos />
        </TabsContent>
        
        <TabsContent value="ajuda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Central de Ajuda</CardTitle>
              <CardDescription>
                Resolva problemas comuns de pagamento e assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-3">🔧 Problemas Comuns:</h4>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <span className="font-medium">🎁 Teste Gratuito:</span>
                    <span>Você tem 7 dias para testar todas as funcionalidades sem custo!</span>
                  </div>
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
                    <span>Clique em "Renovar Assinatura" para reativar seu plano</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium">🔄 Status incorreto:</span>
                    <span>Use "Atualizar Status" após resolver problemas no Stripe</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">🎉 Teste Gratuito de 7 Dias:</h4>
                <p className="text-sm text-green-700">
                  Novos usuários têm acesso completo por 7 dias sem precisar inserir cartão de crédito!
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800 font-medium">
                  ⏰ <strong>Importante:</strong> Você tem 5 dias para resolver problemas de pagamento antes do cancelamento automático.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">📞 Contato Direto:</h4>
                <p className="text-sm text-green-700">
                  📧 suporte@sisjusgestao.com.br<br />
                  🌐 Responda qualquer email automático que receber
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GerenciarAssinatura;
