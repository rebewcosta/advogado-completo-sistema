// Caminho do arquivo: advogado-completo-sistema-main/src/hooks/useAuth.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast'; // Certifique-se que o caminho está correto

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
      console.log("AuthProvider: Estado de autenticação atualizado", sessionData);
    };

    const setupAuth = async () => {
      console.log("AuthProvider: Configurando autenticação inicial...");
      setLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setData(currentSession);
        console.log("AuthProvider: Sessão inicial obtida:", currentSession);
      } catch (error) {
        console.error("AuthProvider: Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
        console.log("AuthProvider: Carregamento inicial da autenticação concluído.");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sessionData) => {
        console.log("AuthProvider: Evento onAuthStateChange recebido, evento:", _event);
        setData(sessionData);
        setLoading(false); // Certifique-se de que o loading é atualizado aqui também
      }
    );

    setupAuth();

    return () => {
      console.log("AuthProvider: Desinscrevendo do listener onAuthStateChange.");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("useAuth signIn: Tentando login com:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("useAuth signIn: Erro do Supabase:", error);
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
        // O onAuthStateChange já deve ter atualizado user e session.
        // Apenas navegamos.
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        console.log("useAuth signIn: Login bem-sucedido, redirecionando para:", from);
        navigate(from, { replace: true });
      } else {
        // Caso inesperado
        console.warn("useAuth signIn: Login bem-sucedido mas sem usuário/sessão nos dados retornados.", data);
      }
    } catch (error: any) {
      // O erro já foi logado e toast exibido
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    console.log("useAuth signUp: Tentando cadastro para:", email);
    try {
      const signUpOptions: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/dashboard` // Redireciona após confirmação de email
        }
      };

      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        console.error("useAuth signUp: Erro do Supabase:", error);
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
        console.log("useAuth signUp: Cadastro bem-sucedido e sessão ativa (email confirmação desabilitada ou já confirmada).");
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para o painel."
        });
        navigate('/dashboard');
      } else if (data.user && !data.session) {
        console.log("useAuth signUp: Cadastro realizado, confirmação de email necessária.");
        toast({
          title: "Cadastro quase concluído!",
          description: "Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada (e spam).",
        });
        navigate('/login');
      } else {
        console.warn("useAuth signUp: Resposta inesperada do Supabase:", data);
        toast({
          title: "Resposta inesperada do cadastro",
          description: "Por favor, tente novamente ou contate o suporte.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      // O erro já foi logado e toast exibido
      throw error;
    }
  };

  const signOut = async () => {
    console.log("useAuth signOut: Tentando logout.");
    try {
      await supabase.auth.signOut();
      // setUser e setSession são zerados pelo onAuthStateChange
      console.log("useAuth signOut: Logout bem-sucedido, navegando para /");
      navigate('/');
    } catch (error: any) {
      console.error("useAuth signOut: Erro ao fazer logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    console.log("useAuth refreshSession: Tentando atualizar sessão.");
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("useAuth refreshSession: Erro ao atualizar sessão:", error);
        throw error;
      }
      console.log("useAuth refreshSession: Sessão atualizada (onAuthStateChange deve tratar).");
      // setUser e setSession são atualizados pelo onAuthStateChange
    } catch (error) {
      // O erro já foi logado
      throw error;
    }
  };

  // ESTA É A FUNÇÃO MODIFICADA PARA CHAMAR A EDGE FUNCTION
  const createSpecialAccount = async (email: string, password: string, metadata: object): Promise<void> => {
    console.log("useAuth createSpecialAccount: Chamando Edge Function para:", email);
    console.log("useAuth createSpecialAccount: Metadados a serem enviados:", metadata);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.access_token) {
        console.error("useAuth createSpecialAccount: Erro ao obter sessão do admin ou token de acesso ausente.", sessionError);
        toast({
          title: "Erro de Autenticação do Administrador",
          description: sessionError?.message || "Não foi possível obter o token de acesso do administrador. Faça login novamente.",
          variant: "destructive"
        });
        throw new Error(sessionError?.message || "Token de acesso do administrador não encontrado.");
      }

      console.log("useAuth createSpecialAccount: Token do admin obtido, chamando Edge Function 'create-special-user'.");
      // Invoca a Edge Function 'create-special-user'
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('create-special-user', {
        body: { email, password, metadata }, // Envia email, senha e todos os metadados
        // O cabeçalho Authorization é adicionado automaticamente pelo cliente Supabase
        // quando o usuário (admin, neste caso) está logado.
        // Se precisar forçar, você pode adicionar:
        // headers: {
        //   Authorization: `Bearer ${sessionData.session.access_token}`
        // }
      });

      if (functionError) {
        console.error("useAuth createSpecialAccount: Erro ao invocar Edge Function 'create-special-user':", functionError);
        let detailedErrorMessage = "Erro desconhecido ao chamar a função de criação de conta especial.";
        // Tenta extrair a mensagem de erro do objeto de erro da função, se existir
        if (typeof functionError.context === 'object' && functionError.context !== null && 'data' in functionError.context) {
            const contextData = functionError.context.data as any;
            if (contextData && typeof contextData.error === 'string') {
                detailedErrorMessage = contextData.error;
            } else if (typeof contextData.message === 'string') {
                detailedErrorMessage = contextData.message;
            } else if (typeof contextData === 'string') { // Às vezes o erro é uma string direta
                detailedErrorMessage = contextData;
            }
        } else if (functionError.message) {
            detailedErrorMessage = functionError.message;
        }
        
        toast({
          title: "Erro ao Criar Conta Especial",
          description: detailedErrorMessage,
          variant: "destructive"
        });
        throw new Error(detailedErrorMessage);
      }
      
      console.log("useAuth createSpecialAccount: Resposta da Edge Function 'create-special-user':", functionResponse);

      toast({
        title: "Conta Especial Criada",
        description: functionResponse?.message || `Conta com acesso especial criada para ${email}.`,
      });

    } catch (error: any) {
      console.error("useAuth createSpecialAccount: Catch final:", error.message);
      // O toast já deve ter sido disparado se o erro veio da Edge Function ou da obtenção da sessão.
      // Se um erro inesperado ocorreu antes disso, ele será lançado aqui.
      throw error; 
    }
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    console.log("useAuth checkEmailExists: Verificando se o email existe:", email);
    try {
      const { data, error } = await supabase
        .rpc('get_user_by_email', { email_to_check: email });
      
      if (error) {
        console.error("useAuth checkEmailExists: Erro ao chamar RPC get_user_by_email:", error);
        toast({
          title: "Erro ao verificar email",
          description: `Não foi possível verificar o email: ${error.message}`,
          variant: "destructive"
        });
        throw error; // Re-lança o erro para que o chamador saiba que a verificação falhou
      }
      
      const emailExists = data?.[0]?.count > 0;
      console.log(`useAuth checkEmailExists: Email ${email} existe?`, emailExists);
      return emailExists;

    } catch (error: any) {
      console.error("useAuth checkEmailExists: Erro final:", error.message);
      // O toast já deve ter sido disparado no bloco if (error) acima.
      // Re-lançar o erro para que o chamador (CriarContaEspecial.tsx) saiba que a verificação falhou.
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