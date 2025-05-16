
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export const LIMITE_ARMAZENAMENTO_MB = 25;
export const LIMITE_ARMAZENAMENTO_BYTES = LIMITE_ARMAZENAMENTO_MB * 1024 * 1024; // 25MB em bytes

// Função para formatar tamanho em bytes para formato legível
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Função para tratar erros de forma consistente
const handleError = (error: any, defaultMessage: string): Error => {
  console.error(defaultMessage, error);
  
  if (error instanceof Error) return error;
  
  if (typeof error === 'object' && error !== null) {
    return new Error(
      error.message || error.error_description || error.error || JSON.stringify(error)
    );
  }
  
  return new Error(String(error || defaultMessage));
};

// Verifica se o usuário está autenticado
const verificarAutenticacao = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  return user;
};

// Função para obter o uso de armazenamento do usuário atual
export const obterUsoArmazenamento = async (): Promise<number> => {
  try {
    await verificarAutenticacao();
    
    const { data, error } = await supabase
      .from('documentos')
      .select('tamanho_bytes');

    if (error) {
      throw error;
    }

    // Calcular total em bytes
    const totalBytes = data?.reduce((acc, doc) => acc + doc.tamanho_bytes, 0) || 0;
    return totalBytes;
  } catch (error) {
    throw handleError(error, 'Erro ao obter uso de armazenamento');
  }
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
    await verificarAutenticacao();
    
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
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

// Função para obter URL de download de um documento
export const obterUrlDocumento = async (path: string): Promise<string> => {
  try {
    await verificarAutenticacao();
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 60); // URL válida por 60 segundos

    if (error) {
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

// Função para excluir um documento
export const excluirDocumento = async (id: string, path: string) => {
  try {
    await verificarAutenticacao();
    
    // Remover o arquivo do Storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([path]);

    if (storageError) {
      throw storageError;
    }

    // Remover o registro do banco de dados
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
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
