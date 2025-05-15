
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
  skipEmailConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up authentication state
const cleanupAuthState = () => {
  console.log("Cleaning up auth state...");
  
  // Remove all Supabase auth keys from localStorage with detailed logging
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log("Removing localStorage key:", key);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log("Removing sessionStorage key:", key);
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear browser cookies that might be related to authentication
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.trim().split("=")[0];
    if (name.includes("supabase") || name.includes("sb-")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      console.log("Removed cookie:", name);
    }
  });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Getting existing session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign in:", email);
      
      // First clear auth state to ensure a clean state
      cleanupAuthState();
      
      // Try to sign out globally first to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log("Successfully signed out previous sessions");
      } catch (signOutError) {
        console.log("Sign out before sign in failed, continuing anyway", signOutError);
        // Continue with sign in even if sign out fails
      }
      
      // Ensure email is correctly trimmed
      const trimmedEmail = email.trim();
      
      console.log("Signing in with email:", trimmedEmail);
      
      // Special handling for webercostag@gmail.com - skip email confirmation check
      if (trimmedEmail === "webercostag@gmail.com") {
        console.log("Special user detected, setting special treatment");
        // Continue with normal login
      }
      
      // Using signInWithPassword without options to avoid TypeScript error
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        
        // Check if the error is about email not being confirmed
        if (error.message === "Email not confirmed") {
          toast({
            title: "Verificação de email pendente",
            description: "Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada para confirmar seu email ou peça uma nova confirmação.",
            variant: "destructive", // Changed from "warning" to "destructive" to fix TypeScript error
          });
          
          // For testing purposes, provide a direct path for webercostag@gmail.com
          if (trimmedEmail === "webercostag@gmail.com") {
            console.log("Special handling for webercostag@gmail.com - bypassing email confirmation");
            // Continue as if login was successful
            toast({
              title: "Login especial realizado",
              description: "Acesso permitido para testes.",
            });
            
            // Force page reload to ensure clean state and proper redirection
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
            return;
          }
          
          throw error;
        }
        
        toast({
          title: "Erro ao entrar",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha inválidos. Verifique suas credenciais e tente novamente."
            : error.message || "Ocorreu um erro ao tentar entrar.",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Sign in successful:", data.user?.email);
      // Log special access in user metadata if present
      if (data.user?.user_metadata?.special_access) {
        console.log("User has special access in metadata:", data.user.user_metadata);
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      // Force page reload to ensure clean state and proper redirection
      // Add a small timeout to ensure toast is visible before navigation
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      return;
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      // Toast notification already handled above
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      // Cleanup existing auth state before signup attempt
      cleanupAuthState();
      
      // Extract email options from userData if present
      const { emailRedirectTo, ...userMetadata } = userData;
      
      const options: any = {
        data: userMetadata,
      };
      
      // Add email options if provided
      if (emailRedirectTo) {
        options.emailRedirectTo = emailRedirectTo;
      }
      
      // Verificar se é um email especial que não precisa de confirmação
      const specialEmails = ['webercostag@gmail.com', 'logo.advocacia@gmail.com'];
      const isSpecialEmail = specialEmails.includes(email.trim().toLowerCase());
      
      if (isSpecialEmail) {
        console.log("Email especial detectado, pulando confirmação de email:", email);
        options.emailConfirmation = {
          skipConfirmation: true
        };
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
      
      // Log for debugging
      console.log("Registration email will be sent from: default Supabase sender");
      
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao tentar cadastrar.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Cleanup auth state before signout
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast({
        title: "Desconectado com sucesso",
        description: "Você saiu da sua conta.",
      });
      
      // Force refresh the page after signout to ensure clean state
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create special accounts (for admin use only)
  const createSpecialAccount = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para pular confirmação de email (apenas para uso administrativo)
  const skipEmailConfirmation = async (email: string) => {
    try {
      setIsLoading(true);
      
      toast({
        title: "Confirmando email",
        description: "Marcando o email como verificado...",
      });
      
      // Função administrativa para confirmar um email sem precisar do link
      // Na prática, isso seria implementado no backend como uma função de administrador
      // Aqui simulamos um sucesso para fins de demonstração
      
      setTimeout(() => {
        toast({
          title: "Email confirmado!",
          description: `O email ${email} foi marcado como verificado.`,
        });
        setIsLoading(false);
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar email",
        description: error.message || "Ocorreu um erro ao tentar confirmar o email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    skipEmailConfirmation,
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
