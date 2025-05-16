import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Session,
  SupabaseClient,
  useSessionContext,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

type AuthContextType = {
  supabaseClient: SupabaseClient<Database>;
  session: Session | null;
  user: Session['user'] | null;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUser: (data: any) => Promise<any>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: loadingSession, supabaseClient } = useSessionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setUser(session?.user || null);
  }, [session]);

  const signUp = async (email: string, password: string, options?: any) => {
    setIsLoading(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        toast({
          title: "Erro ao cadastrar",
          description: "Este email já está cadastrado.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: options
        }
      });

      if (error) {
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        router.push('/login');
      }
      return { data, error };
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast({
          title: "Erro ao logar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login realizado",
          description: "Login realizado com sucesso.",
        });
        router.push('/dashboard');
      }
      return error;
    } catch (error: any) {
      toast({
        title: "Erro ao logar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseClient.auth.signOut();
      router.push('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: response, error } = await supabaseClient
        .from('profiles')
        .update(data)
        .eq('id', user?.id)
        .select()
        .single();
      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Perfil atualizado",
          description: "Perfil atualizado com sucesso.",
        });
      }
      return { response, error };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    supabaseClient,
    session,
    user,
    signUp,
    signIn,
    signOut,
    updateUser,
    isLoading: isLoading || loadingSession,
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

const supabase = new SupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const checkEmailExists = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar email:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
};
