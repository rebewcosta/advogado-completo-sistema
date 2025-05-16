
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

// Create a type for the database
type Database = any;

type AuthContextType = {
  supabaseClient: SupabaseClient<Database>;
  session: Session | null;
  user: Session['user'] | null;
  signUp: (email: string, password: string, options?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUser: (data: any) => Promise<any>;
  isLoading: boolean;
  checkEmailExists: (email: string) => Promise<boolean>;
  createSpecialAccount: (email: string, password: string, options?: any) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const { toast } = useToast();
  
  // Use the imported Supabase client instead of creating a new one
  const supabaseClient = supabase;

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
    };
    
    getSession();
    
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        return { error: { message: "Este email já está cadastrado." } };
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
      }
      return { data, error };
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive"
      });
      return { error };
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
        window.location.href = '/dashboard';
      }
      return error;
    } catch (error: any) {
      toast({
        title: "Erro ao logar",
        description: error.message,
        variant: "destructive"
      });
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseClient.auth.signOut();
      window.location.href = '/login';
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
        .auth.updateUser({
          data: data
        });
        
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
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an email already exists using raw query to avoid type issues
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Using a type assertion to work around TypeScript limitations with dynamic RPC functions
      const { data, error } = await (supabaseClient.rpc as any)('get_user_by_email', {
        email_to_check: email
      });
      
      if (error) {
        console.error('Erro ao verificar email:', error);
        return false;
      }
      
      return data && data.length > 0 && data[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  // Create a special account (admin function)
  const createSpecialAccount = async (email: string, password: string, options?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: options?.skip_email_confirmation || false,
        user_metadata: {
          ...options,
        }
      });

      if (error) {
        toast({
          title: "Erro ao criar conta especial",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Conta especial criada",
          description: "Conta especial criada com sucesso.",
        });
      }
      return { data, error };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta especial",
        description: error.message,
        variant: "destructive"
      });
      return { error };
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
    isLoading,
    checkEmailExists,
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

// Standalone version with error handling for direct imports
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Using a type assertion to work around TypeScript limitations with dynamic RPC functions
    const { data, error } = await (supabase.rpc as any)('get_user_by_email', {
      email_to_check: email
    });
    
    if (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
    
    return data && data.length > 0 && data[0].count > 0;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
};
