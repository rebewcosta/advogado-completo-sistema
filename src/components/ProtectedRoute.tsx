
import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase.auth.getSession();
        const authenticated = !!data.session;
        setIsAuthenticated(authenticated);
        
        if (authenticated && requireAdmin) {
          // Check if user is admin - only webercostag@gmail.com OR has special_access
          const user = data.session.user;
          const isAdminUser = user.email === "webercostag@gmail.com" || 
                             user.user_metadata?.special_access === true;
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        // On error, assume not authenticated/admin
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setIsAdmin(false);
      } else if (requireAdmin) {
        // Re-check admin status when session changes
        const user = session.user;
        const isAdminUser = user.email === "webercostag@gmail.com" || 
                           user.user_metadata?.special_access === true;
        setIsAdmin(isAdminUser);
      }
      setIsLoading(false);
    });

    checkAuth();
    
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
