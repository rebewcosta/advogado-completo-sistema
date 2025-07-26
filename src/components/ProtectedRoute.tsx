import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = () => {
  const { user } = useAuth();

  // A lógica agora é simples: se não há usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se há um usuário, permite o acesso às rotas filhas.
  return <Outlet />;
};

export default ProtectedRoute;