
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';

export function useDocumentUpload(
  onUploadSuccess: () => Promise<void>,
  calcularEspacoDisponivel: () => Promise<number>
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const uploadDocumento = async (
    file: File, 
    tipo: string,
    cliente: string,
    processo?: string
  ): Promise<string> => {
    if (!session || !user) {
      const errorMsg = 'Usuário não autenticado. Faça login para fazer upload de documentos.';
      setError(errorMsg);
      toast({
        title: "Erro ao fazer upload",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Verificar tamanho do arquivo
      if (file.size > DocumentosService.LIMITE_ARMAZENAMENTO_BYTES) {
        throw new Error(`O arquivo excede o limite máximo de ${DocumentosService.LIMITE_ARMAZENAMENTO_MB}MB`);
      }

      // Verificar se o usuário tem espaço suficiente
      const espacoDisponivel = await calcularEspacoDisponivel();
      if (file.size > espacoDisponivel) {
        throw new Error(`Você não tem espaço suficiente. Disponível: ${DocumentosService.formatarTamanhoArquivo(espacoDisponivel)}`);
      }

      const filePath = await DocumentosService.uploadDocumento(file, tipo, cliente, processo);

      // Atualizar lista de documentos e espaço disponível
      await onUploadSuccess();

      return filePath;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Falha ao fazer upload: ${errorMessage}`);
      toast({
        title: "Erro ao fazer upload",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadDocumento,
    isUploading: isLoading,
    uploadError: error
  };
}
