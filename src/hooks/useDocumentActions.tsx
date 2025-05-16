
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';

export function useDocumentActions(
  onActionSuccess: () => Promise<void>
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  // Função para obter URL de download de um documento
  const obterUrlDocumento = async (path: string): Promise<string> => {
    if (!session || !user) {
      const errorMsg = 'Usuário não autenticado. Faça login para visualizar documentos.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      setError(null);
      return await DocumentosService.obterUrlDocumento(path);
    } catch (error) {
      console.error('Erro ao obter URL do documento:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Falha ao obter URL do documento: ${errorMessage}`);
      toast({
        title: "Erro ao obter documento",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Função para excluir um documento
  const excluirDocumento = async (id: string, path: string) => {
    if (!session || !user) {
      const errorMsg = 'Usuário não autenticado. Faça login para excluir documentos.';
      setError(errorMsg);
      toast({
        title: "Erro ao excluir documento",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await DocumentosService.excluirDocumento(id, path);

      // Atualizar lista de documentos e espaço disponível
      await onActionSuccess();

      return true;
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Falha ao excluir documento: ${errorMessage}`);
      toast({
        title: "Erro ao excluir documento",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    obterUrlDocumento,
    excluirDocumento,
    isActionLoading: isLoading,
    actionError: error
  };
}
