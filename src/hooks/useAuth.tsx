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
    const setData = (sessionData: Session | null) => {
      setSession(sessionData);
      setUser(sessionData?.user ?? null);
    };

    const setupAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setData(currentSession);
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sessionData) => {
        setData(sessionData);
        setLoading(false);
      }
    );

    setupAuth();

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
        console.error("Supabase signIn error:", error);
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
        // setUser e setSession são chamados pelo onAuthStateChange
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      // O erro já foi logado e toast exibido
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
          // Se você quiser redirecionar após a confirmação de email (se habilitada):
          // emailRedirectTo: `${window.location.origin}/dashboard`
        }
      };

      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        console.error("Supabase signUp error:", error);
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
        // Usuário logado diretamente (confirmação de email desabilitada ou usuário já confirmado)
        // setUser e setSession são chamados pelo onAuthStateChange
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para o painel."
        });
        navigate('/dashboard');
      } else if (data.user && !data.session) {
        // Confirmação de email necessária
        toast({
          title: "Cadastro quase concluído!",
          description: "Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada (e spam).",
        });
        navigate('/login'); // Ou para uma página de "verifique seu email"
      } else {
        // Caso inesperado
         toast({
          title: "Resposta inesperada do cadastro",
          description: "Por favor, tente novamente ou contate o suporte.",
          variant: "destructive"
        });
        console.error("Supabase signUp resposta inesperada:", data);
      }
    } catch (error: any) {
      // O erro já foi logado e toast exibido
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // setUser e setSession são zerados pelo onAuthStateChange
      navigate('/');
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      // setUser e setSession são atualizados pelo onAuthStateChange
    } catch (error) {
      console.error("Erro ao atualizar sessão:", error);
      throw error;
    }
  };

  const createSpecialAccount = async (email: string, password: string, metadata: object): Promise<void> => {
    console.log("Tentando criar conta especial para:", email, "com metadados:", metadata);
    try {
      const signUpOptions: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data: metadata || {},
          // Para tentar pular a confirmação de email, a flag `email_confirm: true`
          // precisaria ser passada aqui, mas isso normalmente requer privilégios de admin
          // e seria feito através de uma Edge Function com a chave de serviço do Supabase.
          // A flag `skip_email_confirmation: true` dentro de `metadata.data` é apenas um metadado
          // e não afeta o fluxo de confirmação de email do Supabase por padrão no client-side signUp.
        }
      };
      
      // Se você tiver "Confirm email" DESABILITADO no seu projeto Supabase Auth, este signUp direto funcionará.
      // Se "Confirm email" ESTIVER HABILITADO, este usuário precisará confirmar o email,
      // A MENOS QUE você chame uma Supabase Edge Function aqui que use o Admin Client para criar o usuário.
      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        console.error("Supabase signUp error (createSpecialAccount):", error);
        let errorMessage = "Ocorreu um erro ao criar a conta especial.";
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está registrado.";
        } else if (error.message.toLowerCase().includes("password should be at least 6 characters")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        }
        toast({
          title: "Erro ao criar conta especial",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

      // Verifica se o usuário foi criado e se uma sessão foi iniciada (ou se requer confirmação)
      if (data.user && data.session) {
        toast({
          title: "Conta especial criada",
          description: `Conta com acesso especial criada e logada para ${email}.`,
        });
      } else if (data.user && !data.session) {
         toast({
          title: "Conta especial criada - Confirmação Necessária",
          description: `Conta para ${email} criada. Por favor, confirme o email se necessário.`,
        });
      } else {
        toast({
          title: "Conta especial criada - Status Incerto",
          description: `Conta para ${email} pode ter sido criada, mas o status da sessão é incerto. Verifique os logs.`,
          variant: "default"
        });
        console.warn("createSpecialAccount: Usuário pode ter sido criado, mas não há sessão.", data);
      }

    } catch (error: any) {
      // O erro já foi logado e toast exibido
      console.error("Catch final em createSpecialAccount:", error);
      throw error; // Propaga para o componente CriarContaEspecial
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    console.log("Verificando se o email existe:", email);
    try {
      const { data, error } = await supabase
        .rpc('get_user_by_email', { email_to_check: email });
      
      if (error) {
        console.error("Erro ao chamar RPC get_user_by_email:", error);
        toast({
          title: "Erro ao verificar email",
          description: `Não foi possível verificar o email: ${error.message}`,
          variant: "destructive"
        });
        // Lançar o erro pode ser melhor do que retornar false e potencialmente
        // permitir uma tentativa de cadastro duplicado se a verificação falhar.
        throw error;
      }
      
      const emailExists = data?.[0]?.count > 0;
      console.log(`Email ${email} existe?`, emailExists);
      return emailExists;

    } catch (error: any) {
      console.error("Erro final em checkEmailExists:", error);
      // Não exibir toast aqui, pois já foi exibido no bloco if (error) acima.
      // Re-lançar o erro para que o chamador saiba que a verificação falhou.
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