
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface DocumentoMetadado {
  id?: string;
  nome: string;
  tipo: string;
  cliente: string;
  processo?: string;
  tamanho_bytes: number;
  content_type: string;
}

export const LIMITE_ARMAZENAMENTO_MB = 25;
export const LIMITE_ARMAZENAMENTO_BYTES = LIMITE_ARMAZENAMENTO_MB * 1024 * 1024; // 25MB em bytes

// Função para obter o uso de armazenamento do usuário atual
export const obterUsoArmazenamento = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('tamanho_bytes');

    if (error) {
      console.error('Erro ao obter uso de armazenamento:', error);
      throw error;
    }

    // Calcular total em bytes
    const totalBytes = data?.reduce((acc, doc) => acc + doc.tamanho_bytes, 0) || 0;
    return totalBytes;
  } catch (error) {
    console.error('Erro ao obter uso de armazenamento:', error);
    throw error;
  }
};

// Função para calcular espaço disponível em bytes
export const calcularEspacoDisponivel = async (): Promise<number> => {
  const usoAtual = await obterUsoArmazenamento();
  return LIMITE_ARMAZENAMENTO_BYTES - usoAtual;
};

// Função para formatar tamanho em bytes para formato legível
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Função para fazer upload de um documento
export const uploadDocumento = async (
  file: File, 
  tipo: string,
  cliente: string,
  processo?: string
): Promise<string> => {
  try {
    const { user } = await supabase.auth.getUser().then(res => ({ user: res.data.user }));
    if (!user) throw new Error('Usuário não autenticado');

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload do arquivo para o Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro ao fazer upload do arquivo:', uploadError);
      throw uploadError;
    }

    // Criar entrada na tabela de documentos
    const documentoMetadado: DocumentoMetadado = {
      nome: file.name,
      tipo,
      cliente,
      processo,
      tamanho_bytes: file.size,
      content_type: file.type
    };

    const { error: dbError } = await supabase
      .from('documentos')
      .insert({
        user_id: user.id,
        nome: documentoMetadado.nome,
        tipo: documentoMetadado.tipo,
        cliente: documentoMetadado.cliente,
        processo: documentoMetadado.processo,
        tamanho_bytes: documentoMetadado.tamanho_bytes,
        path: filePath,
        content_type: documentoMetadado.content_type
      });

    if (dbError) {
      // Se houver erro ao inserir no banco, remover o arquivo do storage
      await supabase.storage
        .from('documentos')
        .remove([filePath]);
      
      console.error('Erro ao salvar metadados do documento:', dbError);
      throw dbError;
    }

    return filePath;
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast({
      title: "Erro ao fazer upload",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Função para listar documentos do usuário
export const listarDocumentos = async () => {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar documentos:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast({
      title: "Erro ao listar documentos",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Função para obter URL de download de um documento
export const obterUrlDocumento = async (path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 60); // URL válida por 60 segundos

    if (error) {
      console.error('Erro ao obter URL do documento:', error);
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao obter URL do documento:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast({
      title: "Erro ao obter documento",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

// Função para excluir um documento
export const excluirDocumento = async (id: string, path: string) => {
  try {
    // Remover o arquivo do Storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([path]);

    if (storageError) {
      console.error('Erro ao excluir arquivo:', storageError);
      throw storageError;
    }

    // Remover o registro do banco de dados
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Erro ao excluir registro do documento:', dbError);
      throw dbError;
    }

    toast({
      title: "Documento excluído",
      description: "O documento foi excluído com sucesso.",
    });

    return true;
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast({
      title: "Erro ao excluir documento",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};
