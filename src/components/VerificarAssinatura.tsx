
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificarAssinaturaProps {
  children?: React.ReactNode;
}

const VerificarAssinatura: React.FC<VerificarAssinaturaProps> = ({ children }) => {
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

  // CONTROLE RIGOROSO: Apenas estas rotas são permitidas sem assinatura
  const publicRoutes = [
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
        console.log("❌ Usuário não autenticado - bloqueando acesso");
        setAccessGranted(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log(`🔍 Verificando acesso para rota: ${location.pathname}`);

      // Verificar se é uma rota pública permitida
      const isPublicRoute = publicRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isPublicRoute) {
        console.log("✅ Rota pública - acesso permitido");
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔄 Verificando status de assinatura via edge function...");
        
        const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');

        if (funcError) {
          console.error("❌ Erro ao verificar assinatura:", funcError);
          toast({ 
            title: "Erro de Verificação", 
            description: "Não foi possível verificar sua assinatura. Acesso negado por segurança.", 
            variant: "destructive" 
          });
          setAccessGranted(false);
          setSubscriptionStatus('error');
        } else {
          console.log("📊 Resposta da verificação:", funcResponse);
          
          // CONTROLE RIGOROSO: Verificar se tem acesso válido
          const hasValidAccess = funcResponse?.subscribed === true;
          const accountType = funcResponse?.account_type;
          
          if (hasValidAccess) {
            console.log(`✅ Acesso concedido - Tipo: ${accountType}`);
            setAccessGranted(true);
            setSubscriptionStatus(accountType || 'active');
            
            // Informações do trial
            if (accountType === 'trial') {
              const daysRemaining = funcResponse.trial_days_remaining || 0;
              setTrialInfo({
                daysRemaining,
                isInTrial: true
              });
              
              // Alertas por dias restantes
              if (daysRemaining <= 1) {
                toast({
                  title: "⚠️ Trial Expirando Hoje!",
                  description: "Seu período de teste expira hoje. Assine agora para continuar usando o sistema.",
                  variant: "destructive",
                  duration: 8000,
                });
              } else if (daysRemaining <= 3) {
                toast({
                  title: "⚠️ Trial Expirando Em Breve",
                  description: `Restam apenas ${daysRemaining} dias do seu teste gratuito. Assine para continuar.`,
                  variant: "destructive",
                  duration: 6000,
                });
              }
            }

            // Alertas para assinatura cancelada em período de carência
            if (accountType === 'canceled_grace') {
              const daysRemaining = funcResponse.days_remaining || 0;
              if (daysRemaining <= 3) {
                toast({
                  title: "⚠️ Assinatura Cancelada!",
                  description: `Sua assinatura foi cancelada. Acesso será bloqueado em ${daysRemaining} dias. Reative para continuar.`,
                  variant: "destructive",
                  duration: 10000,
                });
              }
            }

            // Alertas para período de carência por falta de pagamento
            if (accountType === 'grace_period') {
              const graceDays = funcResponse.grace_days_remaining || 0;
              toast({
                title: "⚠️ Pagamento Pendente!",
                description: `Seu pagamento está atrasado. Sistema será bloqueado em ${graceDays} dias se não pagar.`,
                variant: "destructive",
                duration: 10000,
              });
            }
          } else {
            console.log("❌ ACESSO NEGADO - Sem assinatura válida");
            setAccessGranted(false);
            setSubscriptionStatus(accountType || 'inactive');
            setTrialInfo({
              daysRemaining: 0,
              isInTrial: false
            });

            // Toast de aviso crítico
            toast({ 
              title: "🔒 Acesso Bloqueado", 
              description: funcResponse?.message || "Você precisa de uma assinatura ativa para acessar esta funcionalidade.", 
              variant: "destructive",
              duration: 8000
            });
          }
        }
      } catch (e) {
        console.error("❌ Erro crítico de comunicação:", e);
        toast({ 
          title: "Erro Crítico", 
          description: "Falha na comunicação com o servidor. Acesso negado por segurança.", 
          variant: "destructive",
          duration: 10000
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Verificando seus privilégios de acesso...</p>
        </div>
      </div>
    );
  }

  if (accessGranted) {
    return children ? <>{children}</> : <Outlet />;
  } else {
    // REDIRECIONAMENTO RIGOROSO baseado no status
    const currentPath = location.pathname;
    
    // BLOQUEIO TOTAL - Assinatura cancelada e período pago expirado
    if (subscriptionStatus === 'expired_canceled') {
      console.log(`🚫 BLOQUEIO TOTAL - Assinatura cancelada expirada: ${currentPath}`);
      
      return (
        <Navigate 
          to="/conta-cancelada" 
          state={{ 
            from: location, 
            message: "🔒 Sua assinatura foi cancelada e o período pago expirou. Reative sua assinatura para continuar usando o sistema.",
            reason: 'expired_canceled'
          }} 
          replace 
        />
      );
    }

    // BLOQUEIO TOTAL - Período de carência por falta de pagamento expirado  
    if (subscriptionStatus === 'grace_expired') {
      console.log(`🚫 BLOQUEIO TOTAL - Período de carência expirado: ${currentPath}`);
      
      return (
        <Navigate 
          to="/conta-cancelada" 
          state={{ 
            from: location, 
            message: "🔒 O período de carência de 5 dias para pagamento expirou. Reative sua assinatura para continuar.",
            reason: 'grace_expired'
          }} 
          replace 
        />
      );
    }
    
    // Se trial expirado ou sem assinatura
    if (subscriptionStatus === 'none' || subscriptionStatus === 'inactive') {
      console.log(`🚫 Redirecionando de ${currentPath} para conta-cancelada - Status: ${subscriptionStatus}`);
      
      const message = trialInfo.daysRemaining === 0 ? 
        "🔒 Seu período de teste de 7 dias expirou! Assine agora para continuar usando todas as funcionalidades do JusGestão." :
        "🔒 Sua conta foi cancelada. Reative sua assinatura para continuar usando o sistema.";
      
      return (
        <Navigate 
          to="/conta-cancelada" 
          state={{ 
            from: location, 
            message,
            reason: 'expired_trial'
          }} 
          replace 
        />
      );
    }
    
    // Para status de erro ou problemas de pagamento
    if (subscriptionStatus === 'error' || subscriptionStatus === 'pending') {
      console.log(`🚫 Redirecionando de ${currentPath} para perfil - Status: ${subscriptionStatus}`);
      
      return (
        <Navigate 
          to="/perfil" 
          state={{ 
            from: location, 
            message: subscriptionStatus === 'error' ? 
              "❌ Erro ao verificar sua assinatura. Verifique sua conta e tente novamente." :
              "⚠️ Seu pagamento está pendente. Acesse o portal do cliente para resolver."
          }} 
          replace 
        />
      );
    }
    
    // Fallback para qualquer outro caso
    console.log(`🚫 Redirecionamento fallback de ${currentPath} para perfil`);
    return (
      <Navigate 
        to="/perfil" 
        state={{ 
          from: location, 
          message: "🔒 Acesso restrito. Verifique o status da sua assinatura." 
        }} 
        replace 
      />
    );
  }
};

export default VerificarAssinatura;
