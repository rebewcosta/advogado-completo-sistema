
import { supabase } from '@/integrations/supabase/client';
import { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

export const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    let errorMessage = "Ocorreu um erro ao fazer login.";
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Email ou senha incorretos. Por favor, verifique suas credenciais.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Email não confirmado. Por favor, verifique sua caixa de entrada.";
    }
    throw new Error(errorMessage);
  }

  return { data, error: null };
};

export const handleSignUp = async (email: string, password: string, metadata?: object) => {
  const signUpOptions: SignUpWithPasswordCredentials = {
    email,
    password,
    options: {
      data: metadata || {},
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  };

  const { data, error } = await supabase.auth.signUp(signUpOptions);

  if (error) {
    let errorMessage = "Ocorreu um erro ao criar sua conta.";
    if (error.message.includes("User already registered")) {
      errorMessage = "Este email já está registrado. Por favor, tente fazer login.";
    } else if (error.message.includes("Email rate limit exceeded")) {
      errorMessage = "Muitas tentativas. Por favor, tente novamente mais tarde.";
    } else if (error.message.toLowerCase().includes("password should be at least 6 characters")) {
      errorMessage = "A senha deve ter pelo menos 6 caracteres.";
    }
    throw new Error(errorMessage);
  }

  return { data, error: null };
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
    console.error("Auth: Error refreshing session");
    throw error;
  }
  return data;
};

export const handleCreateSpecialAccount = async (email: string, password: string, metadata: object) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error(sessionError?.message || "Token de acesso do administrador não encontrado.");
  }
  
  const { data: functionResponse, error: functionError } = await supabase.functions.invoke('create-special-user', { 
    body: { email, password, metadata } 
  });
  
  if (functionError) {
    let detailedErrorMessage = "Erro desconhecido ao chamar a função.";
    if (typeof functionError.context === 'object' && functionError.context !== null && 'data' in functionError.context) {
      const contextData = functionError.context.data as any;
      if (contextData && typeof contextData.error === 'string') detailedErrorMessage = contextData.error;
      else if (typeof contextData.message === 'string') detailedErrorMessage = contextData.message;
      else if (typeof contextData === 'string') detailedErrorMessage = contextData;
    } else if (functionError.message) detailedErrorMessage = functionError.message;
    throw new Error(detailedErrorMessage);
  }
  
  return functionResponse;
};

export const handleCheckEmailExists = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('get_user_by_email', { email_to_check: email });
  if (error) {
    throw error;
  }
  return data?.[0]?.count > 0;
};
