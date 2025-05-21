// Update imports and fix the component to support admin and amigo status types
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusAssinatura from '@/components/StatusAssinatura';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Clock } from 'lucide-react'; // Added Clock import

// Extend the StatusAssinatura component to accept our custom status types
const GerenciarAssinatura = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'ativa' | 'pendente' | 'inativa' | 'admin' | 'amigo'>('inativa');
  const [proximoFaturamento, setProximoFaturamento] = useState<string | null>(null);
  const [planoInfo, setPlanoInfo] = useState<{ nome: string; preco: number } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setIsLoadingStatus(true);
      setErrorMessage(null);
      try {
        if (!user) {
          setStatus('inativa');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_data')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (profileData) {
          setStatus(profileData.subscription_status || 'inativa');
          if (profileData.subscription_data) {
            try {
              const subData = JSON.parse(profileData.subscription_data);
              setProximoFaturamento(subData.current_period_end ? new Date(subData.current_period_end * 1000).toLocaleDateString() : null);
            } catch (parseError) {
              console.error("Erro ao analisar subscription_data:", parseError);
              setErrorMessage("Erro ao carregar detalhes da assinatura.");
            }
          }
        } else {
          setStatus('inativa');
        }

        // Buscar informações do plano (mock, ajuste conforme necessário)
        setPlanoInfo({ nome: "Plano JusGestão", preco: 49.90 });

      } catch (error: any) {
        console.error("Erro ao buscar status da assinatura:", error);
        setErrorMessage(error.message || "Erro ao carregar status da assinatura.");
        toast({ title: "Erro", description: error.message || "Erro ao carregar status da assinatura.", variant: "destructive" });
        setStatus('inativa');
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, toast]);

  const handleAbrirPortalCliente = async () => {
    setIsPortalLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('criar-portal-cliente', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal do cliente não recebida.");
      }

    } catch (error: any) {
      console.error("Erro ao abrir portal do cliente:", error);
      setErrorMessage(error.message || "Erro ao abrir o portal do cliente.");
      toast({ title: "Erro", description: error.message || "Erro ao abrir o portal do cliente.", variant: "destructive" });
    } finally {
      setIsPortalLoading(false);
    }
  };

  // Update the renderAssinaturaStatus function to handle our custom status types
  const renderAssinaturaStatus = () => {
    if (isLoadingStatus) {
      return (
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Verificando status da assinatura...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Map the custom status types to the ones expected by StatusAssinatura
    let statusForComponent: 'ativa' | 'pendente' | 'inativa' = 'inativa';
    
    if (status === 'ativa') {
      statusForComponent = 'ativa';
    } else if (status === 'pendente') {
      statusForComponent = 'pendente';
    } else if (status === 'admin' || status === 'amigo') {
      // For admin/amigo users, we'll still show them as having an "active" subscription
      // but we could customize the text in the StatusAssinatura component if needed
      statusForComponent = 'ativa';
    } else {
      statusForComponent = 'inativa';
    }
    
    return (
      <StatusAssinatura
        status={statusForComponent}
        dataProximoFaturamento={proximoFaturamento}
        plano={planoInfo?.nome}
        onAbrirPortalCliente={handleAbrirPortalCliente}
      />
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Status da Assinatura</h2>
      
      {renderAssinaturaStatus()}
      
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {status === 'pendente' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <p>Seu pagamento está sendo processado. Isso pode levar alguns minutos. Por favor, aguarde.</p>
        </div>
      )}
    </div>
  );
};

export default GerenciarAssinatura;
