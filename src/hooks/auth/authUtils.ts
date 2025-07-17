
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
    // Tratamento específico para limite de taxa de email
    if (error.message.includes('email rate limit exceeded') || error.message.includes('429')) {
      const customError = new Error(
        'Muitas tentativas de cadastro detectadas. Por favor, aguarde alguns minutos antes de tentar novamente. Se você já se cadastrou, verifique seu email (incluindo a pasta de spam) para o link de confirmação.'
      );
      throw customError;
    }
    
    // Outros tratamentos de erro
    if (error.message.includes('User already registered')) {
      const customError = new Error(
        'Este email já está cadastrado. Tente fazer login ou use a opção "Esqueci minha senha".'
      );
      throw customError;
    }
    
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
  try {
    // Usar a função do banco de dados para verificar se o email existe
    const { data, error } = await supabase.rpc('get_user_by_email', { 
      email_to_check: email 
    });
    
    if (error) {
      console.error('Erro ao verificar email:', error);
      return false; // Em caso de erro, assume que não existe para permitir a criação
    }
    
    // A função get_user_by_email retorna um array de objetos com propriedade count
    // Verificamos se é um array e pegamos o primeiro item, ou se já é um objeto direto
    let count = 0;
    if (Array.isArray(data) && data.length > 0) {
      count = data[0].count || 0;
    } else if (data && typeof data === 'object' && 'count' in data) {
      count = (data as { count: number }).count || 0;
    }
    
    // Se count for maior que 0, o email já existe
    return count > 0;
  } catch (error) {
    console.error('Erro na verificação de email:', error);
    return false; // Em caso de erro, assume que não existe para permitir a criação
  }
};
