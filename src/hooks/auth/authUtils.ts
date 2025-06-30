
import { supabase } from '@/integrations/supabase/client';

export const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return { data };
};

export const handleSignUp = async (email: string, password: string, metadata?: object) => {
  // Configurar confirmação de email obrigatória
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // IMPORTANTE: Email deve ser confirmado antes do acesso
      emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
      data: metadata || {}
    }
  });

  if (error) {
    throw error;
  }

  // No signup, o usuário NÃO deve ser logado automaticamente
  // Ele precisa confirmar o email primeiro
  return { data };
};

export const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const handleRefreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    throw error;
  }
  return data;
};

export const handleCreateSpecialAccount = async (email: string, password: string, metadata: object) => {
  const { data, error } = await supabase.functions.invoke('create-special-user', {
    body: { email, password, metadata }
  });

  if (error) {
    throw error;
  }

  return data;
};

export const handleCheckEmailExists = async (email: string): Promise<boolean> => {
  // Esta função pode ser usada para verificar se um email já existe
  // Implementação básica - você pode melhorar conforme necessário
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-to-check-existence'
    });
    
    // Se o erro for "Invalid login credentials", o email existe mas a senha está errada
    // Se o erro for "User not found" ou similar, o email não existe
    if (error?.message?.includes('Invalid login credentials')) {
      return true; // Email existe
    }
    
    return false; // Email não existe
  } catch (error) {
    return false;
  }
};
