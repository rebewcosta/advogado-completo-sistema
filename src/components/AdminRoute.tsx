
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Spinner } from '@/components/ui/spinner';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { loading, isAdmin } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
