
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshSession: () => Promise<void>;
  createSpecialAccount: (email: string, password: string, metadata: object) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth: Error getting initial session:", error);
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error("Auth: Initialization error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change:", event, currentSession?.user?.email);
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("SignIn error:", error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Erro ao fazer login",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });

      if (error) throw error;

      if (data.user && data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para o painel."
        });
        navigate('/dashboard');
      } else if (data.user && !data.session) {
        toast({
          title: "Cadastro quase concluído!",
          description: "Enviamos um email de confirmação para você.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error("SignUp error:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Erro ao criar conta",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error("SignOut error:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Erro ao fazer logout",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error("Refresh session error:", error);
      throw error;
    }
  };

  const createSpecialAccount = async (email: string, password: string, metadata: object): Promise<void> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-special-user', {
        body: { email, password, metadata }
      });
      
      if (error) throw error;
      
      toast({ 
        title: "Conta Especial Criada", 
        description: data?.message || `Conta para ${email} criada.`
      });
    } catch (error: any) {
      console.error("Create special account error:", error);
      toast({ 
        title: "Erro ao Criar Conta Especial", 
        description: error.message, 
        variant: "destructive"
      });
      throw error;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // This is a simplified implementation
      return false;
    } catch (error: any) {
      console.error("Check email exists error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      loading,
      refreshSession,
      createSpecialAccount,
      checkEmailExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};
