
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
      (event, currentSession) => {
        setAuthState(currentSession);
      }
    );

    // Listener para detectar quando o usuário sai da página
    const handleBeforeUnload = () => {
      if (user) {
        // Usar sendBeacon para garantir que a requisição seja enviada mesmo quando a página está fechando
        const data = new FormData();
        data.append('user_id', user.id);
        data.append('action', 'offline');
        
        // Tentar marcar como offline via API
        navigator.sendBeacon('/api/user-offline', data);
        
        // Também atualizar diretamente no Supabase (melhor esforço)
        supabase
          .from('user_profiles')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    };

    const handleVisibilityChange = () => {
      // Remover para evitar loops - a presença já é gerenciada pelo useRealtimePresence
    };

    // Adicionar listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [user]);

  // Função para atualizar presença do usuário
  const updateUserPresence = async (user: User, isOnline: boolean) => {
    try {
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          nome_completo: user.user_metadata?.nome_completo || null,
          telefone: user.user_metadata?.telefone || null,
          oab: user.user_metadata?.oab || null,
          last_seen: new Date().toISOString(),
          is_online: isOnline,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      console.log(`Presença atualizada para ${user.email}: ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await handleSignIn(email, password);

      if (data.user && data.session) {
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Erro de autenticação",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
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
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Primeiro, marcar o usuário como offline
      if (user) {
        await updateUserPresence(user, false);
      }
      
      await handleSignOut();
      setUser(null);
      setSession(null);
      navigate('/', { replace: true });
    } catch (error: any) {
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Ocorreu um erro no servidor ao tentar sair.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      await handleRefreshSession();
    } catch (error) {
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
