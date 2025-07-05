
import { useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from './AuthContext';
import { 
  handleSignIn, 
  handleSignUp, 
  handleSignOut, 
  handleRefreshSession, 
  handleCreateSpecialAccount, 
  handleCheckEmailExists 
} from './authUtils';

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

        // Limpar qualquer estado de auth anterior
        const clearAuthState = () => {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
        };

        // Verificar se há uma sessão válida
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth: Error getting initial session:", error);
          clearAuthState();
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

    // Configurar listener de mudanças de estado
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
      const { data } = await handleSignIn(email, password);

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
      const { data } = await handleSignUp(email, password, metadata);

      if (data.user && data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para o painel."
        });
        navigate('/dashboard');
      } else if (data.user && !data.session) {
        toast({
          title: "Cadastro quase concluído!",
          description: "Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada (e spam).",
        });
        navigate('/login');
      } else {
        toast({
          title: "Resposta inesperada do cadastro",
          description: "Por favor, tente novamente ou contate o suporte.",
          variant: "destructive"
        });
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
      await handleSignOut();
      setUser(null);
      setSession(null);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error("SignOut error:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro no servidor ao tentar sair.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      await handleRefreshSession();
    } catch (error) {
      console.error("Refresh session error:", error);
      throw error;
    }
  };

  const createSpecialAccount = async (email: string, password: string, metadata: object): Promise<void> => {
    try {
      const functionResponse = await handleCreateSpecialAccount(email, password, metadata);
      toast({ 
        title: "Conta Especial Criada", 
        description: functionResponse?.message || `Conta para ${email} criada.`
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
      return await handleCheckEmailExists(email);
    } catch (error: any) {
      console.error("Check email exists error:", error);
      toast({ 
        title: "Erro ao verificar email", 
        description: error.message, 
        variant: "destructive"
      });
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
