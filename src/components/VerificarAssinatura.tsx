// src/components/VerificarAssinatura.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom'; // ADICIONADO Outlet
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificarAssinaturaProps {
  // Não precisa mais de children aqui se ele sempre renderiza Outlet ou Navigate
  // children: React.ReactNode; // REMOVER OU DEIXAR OPCIONAL
}

const VerificarAssinatura: React.FC<VerificarAssinaturaProps> = (/* { children } */) => { // children removido
  const [isLoading, setIsLoading] = useState(true);
  const [isAssinante, setIsAssinante] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const rotasPermitidas = ['/dashboard', '/perfil', '/pagamento', '/admin']; // '/configuracoes' não está aqui

  useEffect(() => {
    const verificar = async () => {
      if (!user) {
        setIsAssinante(false); // Garante que não é assinante se não há usuário
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("VerificarAssinatura: Verificando para:", user.email);

        // Lógica para determinar isAssinante (admin, special_access, ou chamada à Edge Function)
        // Mantenha a lógica que já discutimos para chamar a Edge Function 'verificar-assinatura'
        // e definir setIsAssinante(true/false) com base na resposta.
        // Vou simplificar aqui para focar no roteamento, mas a sua lógica completa deve estar aqui.

        if (user.email === "webercostag@gmail.com" || user.user_metadata?.special_access === true) {
          console.log("VerificarAssinatura: Acesso especial local para", user.email);
          setIsAssinante(true);
        } else {
          console.log("VerificarAssinatura: Chamando Edge Function para", user.email);
          const { data: funcResponse, error: funcError } = await supabase.functions.invoke('verificar-assinatura');
          if (funcError) {
            console.error("VerificarAssinatura: Erro da Edge Function", funcError);
            setIsAssinante(false);
            toast({ title: "Erro", description: "Falha ao verificar status da assinatura.", variant: "destructive"});
          } else {
            console.log("VerificarAssinatura: Resposta da Edge Function", funcResponse);
            setIsAssinante(funcResponse?.subscribed === true);
          }
        }
      } catch (e) {
        console.error("VerificarAssinatura: Erro no try/catch", e);
        setIsAssinante(false);
        toast({ title: "Erro", description: "Ocorreu um erro ao verificar sua permissão.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    };
    verificar();
  }, [user, toast]);

  const rotaAtualPermitida = rotasPermitidas.some(rota =>
    location.pathname.startsWith(rota)
  );
  
  // Adicionar /configuracoes às rotas permitidas se usuários não-assinantes (mas logados) devem acessá-la
  // Ou garantir que usuários "Membro Amigo" tenham isAssinante = true
  if (location.pathname.startsWith('/configuracoes') && user) {
      // Se todos os usuários logados podem acessar configurações, descomente a linha abaixo
      // return <Outlet />;
  }


  console.log("VerificarAssinatura - Rota atual:", location.pathname, "É permitida (sem ass.)?:", rotaAtualPermitida, "É assinante?:", isAssinante, "Loading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user && !rotasPermitidas.includes(location.pathname)) { // Se não há usuário e não é uma rota pública permitida (embora ProtectedRoute já deva cuidar disso)
      console.log("VerificarAssinatura: Usuário não logado, redirecionando para login desde VA.");
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAssinante) {
    console.log("VerificarAssinatura: Acesso permitido, renderizando Outlet.");
    return <Outlet />; // <<<---- MUDANÇA IMPORTANTE
  }

  // Se não é assinante E a rota atual NÃO está na lista de rotas permitidas SEM assinatura
  if (!isAssinante && !rotaAtualPermitida) {
    console.log("VerificarAssinatura: Redirecionando para /perfil (ou /pagamento) - usuário não tem acesso à rota:", location.pathname);
    // Redirecionar para a página de pagamento ou perfil se a assinatura for necessária e não estiver ativa
    // Poderia ser /pagamento se o perfil não for o destino ideal
    return <Navigate to="/perfil" state={{ from: location }} replace />;
  }

  // Se é uma rota permitida sem assinatura (ex: /dashboard, /perfil, /admin), renderiza o Outlet
  // Esta condição é para o caso de isAssinante ser false, mas a rota ser permitida.
  console.log("VerificarAssinatura: Rota permitida sem assinatura ou usuário é assinante, renderizando Outlet.");
  return <Outlet />; // <<<---- MUDANÇA IMPORTANTE
};

export default VerificarAssinatura;