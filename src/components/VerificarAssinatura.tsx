
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerificarAssinatura: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [trialInfo, setTrialInfo] = useState<{daysRemaining: number | null, isInTrial: boolean}>({
    daysRemaining: null,
    isInTrial: false
  });
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const publicOrLowAccessRoutes = [
    '/dashboard', 
    '/perfil', 
    '/configuracoes', 
    '/admin', 
    '/pagamento', 
    '/pagamento-sucesso',
    '/conta-cancelada'
  ];

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setAccessGranted(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Verificar se é uma rota que não precisa de assinatura
      const isPermittedWithoutSubscription = publicOrLowAccessRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isPermittedWithoutSubscription) {
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Verificando assinatura via edge function...");
        
        const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');

        if (funcError) {
          console.error("Erro ao verificar assinatura:", funcError);
          toast({ 
            title: "Erro", 
            description: "Falha ao verificar status da sua conta.", 
            variant: "destructive" 
          });
          setAccessGranted(false);
          setSubscriptionStatus('error');
        } else {
          console.log("Resposta da verificação:", funcResponse);
          
          if (funcResponse?.subscribed === true) {
            setAccessGranted(true);
            setSubscriptionStatus(funcResponse.account_type || 'active');
            
            // Definir informações do trial
            if (funcResponse.account_type === 'trial') {
              setTrialInfo({
                daysRemaining: funcResponse.trial_days_remaining,
                isInTrial: true
              });
              
              // Mostrar toast informativo sobre o trial
              toast({
                title: "Período de Teste Gratuito",
                description: `Você tem ${funcResponse.trial_days_remaining} dias restantes do seu teste gratuito.`,
                duration: 5000,
              });
            }
          } else {
            console.log("Acesso negado - assinatura não ativa");
            setAccessGranted(false);
            setSubscriptionStatus(funcResponse?.account_type || 'inactive');
            setTrialInfo({
              daysRemaining: 0,
              isInTrial: false
            });
          }
        }
      } catch (e) {
        console.error("Erro de comunicação:", e);
        toast({ 
          title: "Erro de Comunicação", 
          description: "Não foi possível verificar o status da sua conta.", 
          variant: "destructive" 
        });
        setAccessGranted(false);
        setSubscriptionStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, location.pathname, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (accessGranted) {
    return <Outlet />;
  } else {
    // Se a conta foi cancelada ou trial expirado, redirecionar para a página específica
    if (subscriptionStatus === 'none' || subscriptionStatus === 'inactive') {
      return (
        <Navigate 
          to="/conta-cancelada" 
          state={{ 
            from: location, 
            message: trialInfo.daysRemaining === 0 ? 
              "Seu período de teste gratuito expirou. Assine para continuar usando o sistema." :
              "Sua conta foi cancelada. Reative para continuar usando o sistema."
          }} 
          replace 
        />
      );
    }
    
    // Para outros casos, redirecionar para o perfil
    return (
      <Navigate 
        to="/perfil" 
        state={{ 
          from: location, 
          message: "Você precisa de uma assinatura ativa ou acesso especial para esta página." 
        }} 
        replace 
      />
    );
  }
};

export default VerificarAssinatura;
