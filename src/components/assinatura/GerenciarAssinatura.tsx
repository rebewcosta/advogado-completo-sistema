// src/components/assinatura/GerenciarAssinatura.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusAssinatura from '@/components/StatusAssinatura'; // Será atualizado no Passo 4
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Gift, Crown, ExternalLink, ShoppingCart, RefreshCw } from 'lucide-react'; // Novos ícones

// Definindo um tipo para a resposta esperada da função SQL
interface AssinaturaInfo {
  status: 'ativa' | 'pendente' | 'inativa' | 'admin' | 'amigo'; // Status para o componente StatusAssinatura
  proximo_faturamento: string | null;
  account_type: 'premium' | 'admin' | 'amigo' | 'pendente' | 'none'; // Tipo de conta detalhado
  message: string; // Mensagem descritiva
}

const GerenciarAssinatura = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [assinaturaInfo, setAssinaturaInfo] = useState<AssinaturaInfo | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

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
      const { data, error } = await supabase.rpc('verificar_status_assinatura', {
        p_user_id: user.id
      });

      if (error) {
        console.error("Erro RPC verificar_status_assinatura:", error);
        throw new Error(error.message || "Falha ao buscar dados da assinatura.");
      }

      if (data) {
        setAssinaturaInfo(data as AssinaturaInfo);
        console.log("Dados da assinatura recebidos:", data);
      } else {
        throw new Error("Nenhuma informação de assinatura retornada.");
      }

    } catch (error: any) {
      console.error("Erro ao buscar status da assinatura:", error);
      setErrorMessage(error.message || "Erro ao carregar status da assinatura.");
      setAssinaturaInfo({
        status: 'inativa',
        proximo_faturamento: null,
        account_type: 'none',
        message: error.message || "Erro ao carregar status da assinatura."
      });
      toast({ title: "Erro ao Carregar Assinatura", description: error.message, variant: "destructive" });
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
      const { data, error } = await supabase.functions.invoke('criar-portal-cliente');

      if (error) throw new Error(error.message || "Erro ao invocar função do portal.");
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal do cliente não recebida.");
      }
    } catch (error: any) {
      console.error("Erro ao abrir portal do cliente:", error);
      setErrorMessage(error.message || "Erro ao abrir o portal do cliente.");
      toast({ title: "Erro Portal Cliente", description: error.message, variant: "destructive" });
    } finally {
      setIsPortalLoading(false);
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
  
  // Mapeamento para o componente StatusAssinatura (que espera 'ativa', 'pendente', 'inativa')
  let statusParaComponente: 'ativa' | 'pendente' | 'inativa' = 'inativa';
  if (assinaturaInfo.account_type === 'premium' && assinaturaInfo.status === 'ativa') {
    statusParaComponente = 'ativa';
  } else if (assinaturaInfo.account_type === 'admin' || assinaturaInfo.account_type === 'amigo') {
    statusParaComponente = 'ativa'; // Visualmente, são ativos
  } else if (assinaturaInfo.status === 'pendente') {
    statusParaComponente = 'pendente';
  }

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
          // Passando o tipo de conta para customização no StatusAssinatura
          accountType={assinaturaInfo.account_type} 
          customMessage={assinaturaInfo.message}
          plano={
            assinaturaInfo.account_type === 'admin' ? 'Acesso Administrador' :
            assinaturaInfo.account_type === 'amigo' ? 'Assinatura Amiga (Cortesia)' :
            'JusGestão Premium'
          }
          onAbrirPortalCliente={ (assinaturaInfo.account_type === 'premium' || assinaturaInfo.status === 'pendente' ) ? handleAbrirPortalCliente : undefined}
          isPortalLoading={isPortalLoading}
        />
         {errorMessage && !isLoadingStatus && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center text-sm">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GerenciarAssinatura;