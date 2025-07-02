
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AdminPanelComplete from '@/components/admin/AdminPanelComplete';

const AdminPage = () => {
  const { user } = useAuth();

  // Verificar se é o admin master
  if (!user || user.email !== 'webercostag@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminPanelComplete />;
};

export default AdminPage;
