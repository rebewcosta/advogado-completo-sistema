// Caminho do arquivo: advogado-completo-sistema-main/src/hooks/useAuth.tsx

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
  const [loading, setLoading] = useState(true); // Começa como true até a sessão inicial ser verificada
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Montado. Configurando listener e buscando sessão inicial.");
    setLoading(true); // Garante que loading é true ao iniciar

    // Função para definir o estado de autenticação
    const setAuthState = (newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false); // Define loading como false após o estado ser definido
      console.log("AuthProvider: setAuthState chamado. Nova sessão:", newSession);
    };

    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("AuthProvider: Sessão inicial obtida:", initialSession);
      setAuthState(initialSession);
    }).catch(error => {
      console.error("AuthProvider: Erro ao obter sessão inicial:", error);
      setAuthState(null); // Garante que o estado é limpo e loading=false em caso de erro
    });

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        console.log("AuthProvider: onAuthStateChange disparado. Evento:", _event, "Sessão:", currentSession);
        setAuthState(currentSession);
        if (_event === 'SIGNED_OUT') {
          // Garante que o redirecionamento ocorra após o estado ser limpo
          // A navegação principal já está no signOut, mas isso é um reforço
          // if (location.pathname !== '/') {
          //   navigate('/', { replace: true });
          // }
        }
      }
    );

    return () => {
      console.log("AuthProvider: Desmontado. Desinscrevendo do listener onAuthStateChange.");
      subscription.unsubscribe();
    };
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez

  const signIn = async (email: string, password: string) => {
    // ... (código do signIn como na versão anterior, já está bom) ...
    // Mantenha o código do signIn que já funcionava para você
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
        const from = (location.state as any)?.from?.pathname || "/dashboard";
        console.log("useAuth signIn: Login bem-sucedido, redirecionando para:", from);
        navigate(from, { replace: true });
      } else {
        console.warn("useAuth signIn: Login bem-sucedido mas sem usuário/sessão nos dados retornados.", data);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: object) => {
    // ... (código do signUp como na versão anterior, já está bom) ...
    // Mantenha o código do signUp que já funcionava para você
    console.log("useAuth signUp: Tentando cadastro para:", email);
    try {
      const signUpOptions: SignUpWithPasswordCredentials = {
        email,
        password,
        options: {
          data