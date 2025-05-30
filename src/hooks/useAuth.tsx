import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  login: ( // Esta é a função que HeroSection chama como 'signIn'
    email?: string,
    password?: string,
    provider?: 'google' | 'github',
  ) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('[AuthProvider] useEffect triggered for session and auth state change.');
    const getSessionAndUser = async () => {
      console.log('[AuthProvider] getSessionAndUser called.');
      setLoading(true); // Inicia o carregamento
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('[AuthProvider] Error getting session:', sessionError);
        }
        console.log('[AuthProvider] Fetched session:', currentSession);
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setIsAdmin(currentUser.email === 'webercostag@gmail.com'); // Ajuste conforme sua lógica de admin
          console.log('[AuthProvider] User set. Admin status:', currentUser.email === 'webercostag@gmail.com');
        } else {
          setIsAdmin(false);
          console.log('[AuthProvider] No user session. Admin status: false.');
        }
      } catch (error) {
        console.error('[AuthProvider] Exception in getSessionAndUser:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('[AuthProvider] getSessionAndUser finished. Loading set to false.');
      }
    };

    getSessionAndUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('[AuthProvider] onAuthStateChange triggered. Event:', _event, 'New session:', newSession);
        setLoading(true); // Inicia o carregamento ao detectar mudança
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        if (newUser) {
          setIsAdmin(newUser.email === 'webercostag@gmail.com');
           console.log('[AuthProvider] Auth state changed. New user. Admin status:', newUser.email === 'webercostag@gmail.com');
        } else {
          setIsAdmin(false);
          console.log('[AuthProvider] Auth state changed. No user. Admin status: false.');
        }
        setLoading(false);
        console.log('[AuthProvider] onAuthStateChange finished. Loading set to false.');
      },
    );

    return () => {
      console.log('[AuthProvider] Unsubscribing auth listener.');
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email?: string,
    password?: string,
    provider?: 'google' | 'github',
  ): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> => {
    console.log('[useAuth/login] Login function called with:', { email, provider }); // LOG A
    setLoading(true);
    let response;

    try {
      console.log('[useAuth/login] Checking supabase.auth object:', supabase.auth); // LOG B
      if (provider) {
        console.log(`[useAuth/login] Attempting OAuth with provider: ${provider}`); // LOG C
        console.log('[useAuth/login] supabase.auth.signInWithOAuth type:', typeof supabase.auth.signInWithOAuth); // LOG D
        if (typeof supabase.auth.signInWithOAuth !== 'function') {
          console.error('[useAuth/login] ERROR: supabase.auth.signInWithOAuth is not a function!'); // LOG E
          throw new Error('OAuth sign-in method is not available.');
        }
        response = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        console.log('[useAuth/login] OAuth response:', response); // LOG F
      } else if (email && password) {
        console.log('[useAuth/login] Attempting password sign in.'); // LOG G
        console.log('[useAuth/login] supabase.auth.signInWithPassword type:', typeof supabase.auth.signInWithPassword); // LOG H
        if (typeof supabase.auth.signInWithPassword !== 'function') {
          console.error('[useAuth/login] ERROR: supabase.auth.signInWithPassword is not a function!'); // LOG I
          throw new Error('Password sign-in method is not available.');
        }
        response = await supabase.auth.signInWithPassword({ email, password });
        console.log('[useAuth/login] Password sign in response:', response); // LOG J
      } else {
        console.warn('[useAuth/login] Email/password or provider is required.'); // LOG K
        setLoading(false);
        return { user: null, session: null, error: { message: "Email/password ou provedor é obrigatório.", name: "AuthInputError", status: 400 } as AuthError };
      }

      if (response?.error) {
        console.error('[useAuth/login] Error in response from Supabase:', response.error); // LOG L
      } else if (response?.data?.user) {
        console.log('[useAuth/login] Login successful via Supabase. User:', response.data.user); // LOG M
      } else {
         console.warn('[useAuth/login] Response from Supabase did not contain user or error as expected:', response); // LOG N
      }

    } catch (error: any) {
      console.error('[useAuth/login] Exception during login process:', error); // LOG O
      // Este é o log que você viu: "[HeroSection] Exception during signIn call: TypeError: l is not a function"
      // O erro original (TypeError) ocorreu aqui dentro.
      setLoading(false);
      return { 
        user: null, 
        session: null, 
        error: { 
          name: error.name || 'LoginException', 
          message: error.message || 'Uma exceção ocorreu durante o login.', 
          status: typeof error.status === 'number' ? error.status : 500
        } as AuthError 
      };
    }
    
    setLoading(false);
    console.log('[useAuth/login] Login function finished. isLoading set to false.'); // LOG P
    return {
      user: response?.data?.user || null,
      session: response?.data?.session || null,
      error: response?.error || null,
    };
  };

  const logout = async () => {
    console.log('[useAuth/logout] Logout function called.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[useAuth/logout] Error signing out:', error);
      } else {
        console.log('[useAuth/logout] Sign out successful from Supabase.');
      }
    } catch (error) {
       console.error('[useAuth/logout] Exception during sign out:', error);
    }
    // O onAuthStateChange deve cuidar de atualizar user, session, isAdmin e setLoading.
    // Se não, descomente e ajuste:
    // setUser(null);
    // setSession(null);
    // setIsAdmin(false);
    // setLoading(false); 
    console.log('[useAuth/logout] Logout function finished.');
  };

  const value = {
    session,
    user,
    login,
    logout,
    loading,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
