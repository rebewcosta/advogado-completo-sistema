import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'user' | 'moderator' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is the master admin
        if (user.email === 'webercostag@gmail.com') {
          setUserRole('admin');
          setLoading(false);
          return;
        }

        // Check user_metadata for special_access (for compatibility)
        if (user.user_metadata?.special_access === true) {
          setUserRole('admin');
          setLoading(false);
          return;
        }

        // Query the user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true }) // admin < moderator < user
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setUserRole('user'); // Default to user role
        } else {
          setUserRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!userRole || !requiredRole) return false;
    
    const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isModerator = (): boolean => hasRole('moderator');

  return {
    userRole,
    loading,
    hasRole,
    isAdmin,
    isModerator,
    // Keep role for backward compatibility
    role: userRole
  };
};
