
import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectPath = '/login',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check admin requirement (simplified for now)
  if (requireAdmin && (!user || user.email !== 'webercostag@gmail.com')) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no auth required but user is authenticated, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
