
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  createSpecialAccount: (email: string, password: string, userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message || "Ocorreu um erro ao tentar entrar.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      if (error) throw error;
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao tentar cadastrar.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Nova função para criar contas especiais (apenas para uso administrativo)
  const createSpecialAccount = async (email: string, password: string, userData: any) => {
    try {
      // Verificar se o usuário atual é administrador (opcional)
      // Esta verificação pode ser melhorada com um sistema de papéis
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            special_access: true
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta especial criada!",
        description: `Uma conta com acesso especial foi criada para ${email}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta especial",
        description: error.message || "Ocorreu um erro ao tentar criar conta especial.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    createSpecialAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
