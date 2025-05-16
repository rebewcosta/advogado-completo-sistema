
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const setData = (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
    };

    // Obter a sessão atual
    const setupAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setData(session);
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    // Configurar o listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setData(session);
        setLoading(false);
      }
    );

    // Inicializar
    setupAuth();

    // Limpar o listener quando o componente for desmontado
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
        // Mapeamento de erros para mensagens amigáveis
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

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        
        // Redirecionar para o dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      throw error; // Propagar o erro para tratamento adicional
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        let errorMessage = "Ocorreu um erro ao criar sua conta.";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está registrado. Por favor, tente fazer login.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Muitas tentativas. Por favor, tente novamente mais tarde.";
        }
        
        toast({
          title: "Erro ao criar conta",
          description: errorMessage,
          variant: "destructive"
        });
        
        throw new Error(errorMessage);
      }

      // Verificar se o email precisa ser confirmado
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        navigate('/dashboard');
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Por favor, confirme seu email antes de fazer login.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      throw error; // Propagar o erro para tratamento adicional
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setUser(data.user);
      setSession(data.session);
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading, refreshSession }}>
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
