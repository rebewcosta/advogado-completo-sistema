
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from './ui/spinner';

interface VerificarAssinaturaProps {
  children: React.ReactNode;
}

const VerificarAssinatura: React.FC<VerificarAssinaturaProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAssinante, setIsAssinante] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Lista de rotas que não requerem assinatura ativa, mas requerem autenticação
  const rotasPermitidas = ['/dashboard', '/perfil'];

  useEffect(() => {
    const verificarAssinatura = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Simular verificação de assinatura
        // Em uma implementação real, você consultaria o banco de dados ou uma API
        setTimeout(() => {
          setIsAssinante(true);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setIsAssinante(false);
        setIsLoading(false);
      }
    };

    verificarAssinatura();
  }, [user]);

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
