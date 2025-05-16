
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { verificarAutenticacao } from './auth';
import { handleError, formatarTamanhoArquivo, LIMITE_ARMAZENAMENTO_MB, LIMITE_ARMAZENAMENTO_BYTES } from './utils';
import { obterUsoArmazenamento, obterUrlDocumento } from './storage';

// Re-export das funções e constantes
export { 
  formatarTamanhoArquivo, 
  LIMITE_ARMAZENAMENTO_MB, 
  LIMITE_ARMAZENAMENTO_BYTES,
  obterUrlDocumento
};

// Função para calcular espaço disponível em bytes
export const calcularEspacoDisponivel = async (): Promise<number> => {
  try {
    const usoAtual = await obterUsoArmazenamento();
    return LIMITE_ARMAZENAMENTO_BYTES - usoAtual;
  } catch (error) {
    throw handleError(error, 'Erro ao calcular espaço disponível');
  }
};

// Função para listar documentos do usuário
export const listarDocumentos = async () => {
  try {
    const user = await verificarAutenticacao();
    
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao listar documentos:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    throw handleError(error, 'Erro ao listar documentos');
  }
};

// Função para fazer upload de um documento
export const uploadDocumento = async (
  file: File, 
  tipo: string,
  cliente: string,
  processo?: string
): Promise<string> => {
  try {
    const user = await verificarAutenticacao();

    // Verificar tamanho do arquivo
    if (file.size > LIMITE_ARMAZENAMENTO_BYTES) {
      throw new Error(`O arquivo excede o limite máximo de ${LIMITE_ARMAZENAMENTO_MB}MB`);
    }

    // Verificar se o usuário tem espaço suficiente
    const espacoDisponivel = await calcularEspacoDisponivel();
    if (file.size > espacoDisponivel) {
      throw new Error(`Você não tem espaço suficiente. Disponível: ${formatarTamanhoArquivo(espacoDisponivel)}`);
    }

    // Gerar um nome de arquivo único
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = fileName;

    // Upload do arquivo para o Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Erro ao fazer upload:", uploadError);
      throw uploadError;
    }

    // Criar entrada na tabela de documentos
    const { error: dbError } = await supabase
      .from('documentos')
      .insert({
        user_id: user.id,
        nome: file.name,
        tipo,
        cliente,
        processo,
        tamanho_bytes: file.size,
        path: filePath,
        content_type: file.type
      });

    if (dbError) {
      // Se houver erro ao inserir no banco, remover o arquivo do storage
      console.error("Erro ao inserir no banco:", dbError);
      await supabase.storage
        .from('documentos')
        .remove([filePath]);
      
      throw dbError;
    }

    return filePath;
  } catch (error) {
    throw handleError(error, 'Erro ao fazer upload do documento');
  }
};

// Função para excluir um documento
export const excluirDocumento = async (id: string, path: string) => {
  try {
    await verificarAutenticacao();
    
    // Remover o arquivo do Storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([path]);

    if (storageError) {
      console.error("Erro ao remover arquivo:", storageError);
      throw storageError;
    }

    // Remover o registro do banco de dados
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error("Erro ao excluir registro:", dbError);
      throw dbError;
    }

    toast({
      title: "Documento excluído",
      description: "O documento foi excluído com sucesso.",
    });

    return true;
  } catch (error) {
    throw handleError(error, 'Erro ao excluir documento');
  }
};

// Re-export da função obterUsoArmazenamento
export { obterUsoArmazenamento };
