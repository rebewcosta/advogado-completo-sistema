import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { Spinner } from '@/components/ui/spinner'; // Importar o Spinner

// Definindo o tipo para o valor do contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean; // Adicionar estado de loading
}

// Criando o contexto com um valor inicial que corresponde ao tipo
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true, // Inicia como true
});

// Componente Provedor
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Finaliza o loading após verificar a sessão
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Se estiver carregando, mostra uma tela de loading em vez de renderizar o app
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // O valor fornecido agora inclui o loading
  const value = {
    user,
    session,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};