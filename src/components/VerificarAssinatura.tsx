// src/components/VerificarAssinatura.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner'; // Corrigido o caminho se for de ./ui/
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerificarAssinatura: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false); // Novo estado para clareza
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Rotas que um usuário LOGADO pode acessar MESMO SEM ser "assinante" (Admin, Amigo, ou Premium)
  // Ex: dashboard é geral, perfil para todos logados, admin para o admin específico.
  // A página de pagamento também pode ser acessada se o usuário quiser assinar.
  const publicOrLowAccessRoutes = ['/dashboard', '/perfil', '/configuracoes', '/admin', '/pagamento', '/pagamento-sucesso'];

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      console.log("VerificarAssinatura: Iniciando verificação para rota:", location.pathname);
      if (!user) {
        console.log("VerificarAssinatura: Usuário não logado.");
        setAccessGranted(false); // Se não há usuário, não há acesso a rotas protegidas por assinatura
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log("VerificarAssinatura: Verificando para usuário:", user.email);

      // Se a rota atual é uma das que não exigem status de "assinante" pago/especial
      const isPermittedWithoutSubscription = publicOrLowAccessRoutes.some(route =>
        location.pathname.startsWith(route)
      );

      if (isPermittedWithoutSubscription) {
        console.log("VerificarAssinatura: Rota está em publicOrLowAccessRoutes, concedendo acesso:", location.pathname);
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      // Para outras rotas, verificar se é Admin, Amigo ou Premium
      if (user.email === "webercostag@gmail.com") {
        console.log("VerificarAssinatura: Usuário é Admin, concedendo acesso.");
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      if (user.user_metadata?.special_access === true) {
        console.log("VerificarAssinatura: Usuário tem special_access (Membro Amigo), concedendo acesso.");
        setAccessGranted(true);
        setIsLoading(false);
        return;
      }

      // Se não for admin nem special_access local, e não for rota pública, chama a Edge Function
      try {
        console.log("VerificarAssinatura: Chamando Edge Function 'verificar-assinatura' para", user.email);
        const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');

        if (funcError) {
          console.error("VerificarAssinatura: Erro da Edge Function:", funcError);
          toast({ title: "Erro", description: "Falha ao verificar status da sua conta.", variant: "destructive" });
          setAccessGranted(false);
        } else {
          console.log("VerificarAssinatura: Resposta da Edge Function:", funcResponse);
          if (funcResponse?.subscribed === true) {
            console.log("VerificarAssinatura: Edge Function retornou subscribed=true.");
            setAccessGranted(true);
          } else {
            console.log("VerificarAssinatura: Edge Function retornou subscribed=false ou indefinido.");
            setAccessGranted(false);
          }
        }
      } catch (e) {
        console.error("VerificarAssinatura: Erro no try/catch ao chamar Edge Function:", e);
        toast({ title: "Erro de Comunicação", description: "Não foi possível verificar o status da sua conta.", variant: "destructive" });
        setAccessGranted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, location.pathname, toast]); // Adicionado location.pathname para re-verificar se a rota mudar

  if (isLoading) {
    console.log("VerificarAssinatura: Renderizando Spinner (loading)...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (accessGranted) {
    console.log("VerificarAssinatura: Acesso concedido, renderizando Outlet para rota:", location.pathname);
    return <Outlet />;
  } else {
    // Se não tem acesso e não está carregando, redireciona.
    // ProtectedRoute já deve ter redirecionado para /login se não houver usuário.
    // Este redirecionamento é para usuários logados mas sem o tipo de acesso/assinatura necessário.
    console.log("VerificarAssinatura: Acesso NÃO concedido para", location.pathname, "Redirecionando para /perfil (ou página de assinatura).");
    // Idealmente, aqui você pode querer redirecionar para uma página específica de "upgrade de plano" ou /pagamento
    // se for um usuário logado sem assinatura tentando acessar conteúdo premium.
    // Por enquanto, /perfil é um fallback.
    return <Navigate to="/perfil" state={{ from: location, message: "Você precisa de uma assinatura ativa ou acesso especial para esta página." }} replace />;
  }
};

export default VerificarAssinatura;