
import { supabase } from '@/integrations/supabase/client';

// Verifica se o usuário está autenticado e retorna o usuário ou lança um erro
export const verificarAutenticacao = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Erro na autenticação:", error);
    throw new Error(error.message || 'Erro na autenticação');
  }
  
  if (!data.user) {
    throw new Error('Usuário não autenticado');
  }
  
  return data.user;
};
