
import { supabase } from '@/integrations/supabase/client';
import { verificarAutenticacao } from './auth';
import { handleError } from './utils';

// Função para obter o uso de armazenamento do usuário atual
export const obterUsoArmazenamento = async (): Promise<number> => {
  try {
    const user = await verificarAutenticacao();
    
    const { data, error } = await supabase
      .from('documentos')
      .select('tamanho_bytes')
      .eq('user_id', user.id);

    if (error) {
      console.error("Erro ao obter documentos:", error);
      throw error;
    }

    // Calcular total em bytes
    const totalBytes = data?.reduce((acc, doc) => acc + doc.tamanho_bytes, 0) || 0;
    return totalBytes;
  } catch (error) {
    throw handleError(error, 'Erro ao obter uso de armazenamento');
  }
};

// Função para obter URL de download de um documento
export const obterUrlDocumento = async (path: string): Promise<string> => {
  try {
    await verificarAutenticacao();
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 60); // URL válida por 60 segundos

    if (error) {
      console.error("Erro ao criar URL assinada:", error);
      throw error;
    }

    if (!data || !data.signedUrl) {
      throw new Error('Não foi possível gerar a URL do documento');
    }

    return data.signedUrl;
  } catch (error) {
    throw handleError(error, 'Erro ao obter URL do documento');
  }
};
