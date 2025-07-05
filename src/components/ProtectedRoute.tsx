
import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { useUserRole } from '@/hooks/useUserRole';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { role, loading: roleLoading, isAdmin } = useUserRole();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          if (mounted) {
            setIsAuthenticated(false);
          }
        } else {
          if (mounted) {
            setIsAuthenticated(!!session);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    });

    checkAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking auth or role
  if (isLoading || (isAuthenticated && roleLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check admin requirement using new role system
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no auth required but user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
