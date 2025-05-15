
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificarAssinaturaProps {
  children: React.ReactNode;
}

const VerificarAssinatura: React.FC<VerificarAssinaturaProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAssinante, setIsAssinante] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Lista de rotas que não requerem assinatura ativa, mas requerem autenticação
  const rotasPermitidas = ['/dashboard', '/perfil', '/pagamento', '/admin'];

  useEffect(() => {
    const verificarAssinatura = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        console.log("Verificando assinatura para usuário:", user.email);
        
        // Lista de emails com acesso especial
        const specialEmails = ["webercostag@gmail.com", "teste@sisjusgestao.com.br"];
        
        // Verificar se o usuário tem special_access nos metadados
        const hasSpecialAccess = user.user_metadata?.special_access === true;
        console.log("Special access nos metadados:", hasSpecialAccess, "Metadados:", JSON.stringify(user.user_metadata));
        
        // Verificar se o email está na lista de acesso especial
        const hasSpecialEmail = user.email && specialEmails.includes(user.email);
        console.log("Email está na lista de acesso especial:", hasSpecialEmail);
        
        // Conceder acesso se tiver special_access nos metadados ou email especial
        if (hasSpecialAccess || hasSpecialEmail) {
          console.log("Acesso especial detectado:", 
            hasSpecialAccess ? "via metadados" : "via email");
          setIsAssinante(true);
          setIsLoading(false);
          return;
        }
        
        // Consultar o status da assinatura através da edge function
        const { data, error } = await supabase.functions.invoke('verificar-assinatura');
        
        if (error) {
          console.error('Erro ao verificar assinatura:', error);
          toast({
            title: "Erro ao verificar assinatura",
            description: "Não foi possível verificar o status da sua assinatura. Você será redirecionado para a página de perfil.",
            variant: "destructive"
          });
          setIsAssinante(false);
          setIsLoading(false);
          return;
        }
        
        console.log("Resposta da verificação:", data);
        
        // Verificar se o usuário tem uma assinatura ativa
        setIsAssinante(data?.subscribed || false);
        
        if (data?.subscribed) {
          console.log('Assinatura ativa detectada:', data);
        } else {
          console.log('Assinatura inativa ou não encontrada');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        toast({
          title: "Erro ao verificar assinatura",
          description: "Ocorreu um erro ao verificar sua assinatura. Você será redirecionado para a página de perfil.",
          variant: "destructive"
        });
        setIsAssinante(false);
        setIsLoading(false);
      }
    };

    verificarAssinatura();
  }, [user, toast]);

  // Verificar se a rota atual está na lista de rotas permitidas
  const rotaAtualPermitida = rotasPermitidas.some(rota => 
    location.pathname.startsWith(rota)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAssinante && !rotaAtualPermitida) {
    return <Navigate to="/perfil" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default VerificarAssinatura;
