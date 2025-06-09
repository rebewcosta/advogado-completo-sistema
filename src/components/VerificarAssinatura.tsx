
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerificarAssinatura: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const publicOrLowAccessRoutes = ['/dashboard', '/perfil', '/configuracoes', '/admin', '/pagamento', '/pagamento-sucesso'];

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setAccessGranted(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const isPermittedWithoutSubscription = publicOrLowAccessRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isPermittedWithoutSubscription) {
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      // Check admin access
      if (user.email === "webercostag@gmail.com") {
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      // Check special access
      if (user.user_metadata?.special_access === true) {
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      // Check subscription via Edge Function
      try {
        const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');

        if (funcError) {
          toast({ title: "Erro", description: "Falha ao verificar status da sua conta.", variant: "destructive" });
          setAccessGranted(false);
        } else {
          if (funcResponse?.subscribed === true) {
            setAccessGranted(true);
          } else {
            setAccessGranted(false);
          }
        }
      } catch (e) {
        toast({ title: "Erro de Comunicação", description: "Não foi possível verificar o status da sua conta.", variant: "destructive" });
        setAccessGranted(false);
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
    return <Navigate to="/perfil" state={{ from: location, message: "Você precisa de uma assinatura ativa ou acesso especial para esta página." }} replace />;
  }
};

export default VerificarAssinatura;
