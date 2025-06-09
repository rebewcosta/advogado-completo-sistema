
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);

    const setAuthState = (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setAuthState(initialSession);
    }).catch(error => {
      console.error("Auth: Error getting initial session");
      setAuthState(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setAuthState(currentSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = "Ocorreu um erro ao fazer login.";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos. Por favor, verifique suas credenciais.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Por favor, verifique sua caixa de entrada.";
        }
        toast({
          title: "Erro de autenticação",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

      if (data.user && data.session) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      const signUpOptions: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      };

      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        let errorMessage = "Ocorreu um erro ao criar sua conta.";
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está registrado. Por favor, tente fazer login.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Muitas tentativas. Por favor, tente novamente mais tarde.";
        } else if (error.message.toLowerCase().includes("password should be at least 6 characters")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        }
        toast({
          title: "Erro ao criar conta",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

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
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Erro ao desconectar",
          description: error.message || "Ocorreu um erro no servidor ao tentar sair.",
          variant: "destructive"
        });
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/', { replace: true });

    } catch (error: any) {
      if (!error.message.includes("Erro ao desconectar")) {
          console.error("Auth: Unexpected error during logout");
      }
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Auth: Error refreshing session");
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const createSpecialAccount = async (email: string, password: string, metadata: object): Promise<void> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        toast({ title: "Erro de Autenticação do Administrador", description: sessionError?.message || "Token de acesso do administrador não encontrado.", variant: "destructive"});
        throw new Error(sessionError?.message || "Token de acesso do administrador não encontrado.");
      }
      
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('create-special-user', { body: { email, password, metadata } });
      if (functionError) {
        let detailedErrorMessage = "Erro desconhecido ao chamar a função.";
        if (typeof functionError.context === 'object' && functionError.context !== null && 'data' in functionError.context) {
            const contextData = functionError.context.data as any;
            if (contextData && typeof contextData.error === 'string') detailedErrorMessage = contextData.error;
            else if (typeof contextData.message === 'string') detailedErrorMessage = contextData.message;
            else if (typeof contextData === 'string') detailedErrorMessage = contextData;
        } else if (functionError.message) detailedErrorMessage = functionError.message;
        toast({ title: "Erro ao Criar Conta Especial", description: detailedErrorMessage, variant: "destructive"});
        throw new Error(detailedErrorMessage);
      }
      
      toast({ title: "Conta Especial Criada", description: functionResponse?.message || `Conta para ${email} criada.`});
    } catch (error: any) {
      throw error;
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('get_user_by_email', { email_to_check: email });
      if (error) {
        toast({ title: "Erro ao verificar email", description: error.message, variant: "destructive"});
        throw error;
      }
      const emailExists = data?.[0]?.count > 0;
      return emailExists;
    } catch (error: any) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
