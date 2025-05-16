
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentStorage } from './useDocumentStorage';
import { useDocumentList } from './useDocumentList';
import { useDocumentUpload } from './useDocumentUpload';
import { useDocumentActions } from './useDocumentActions';
import { LIMITE_ARMAZENAMENTO_MB, LIMITE_ARMAZENAMENTO_BYTES } from './useDocumentTypes';

// Re-exportar constantes e tipos
export { LIMITE_ARMAZENAMENTO_MB, LIMITE_ARMAZENAMENTO_BYTES };
export type { Document, DocumentType } from './useDocumentTypes';

export function useDocumentos() {
  const { user, session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hooks especializados
  const storage = useDocumentStorage();
  const documentList = useDocumentList();
  
  // Atualizar recursos após uma ação bem-sucedida
  const refreshResources = useCallback(async () => {
    await documentList.listarDocumentos();
    await storage.calcularEspacoDisponivel();
  }, [documentList.listarDocumentos, storage.calcularEspacoDisponivel]);

  // Hooks para upload e ações em documentos
  const uploadHook = useDocumentUpload(refreshResources, storage.calcularEspacoDisponivel);
  const actionsHook = useDocumentActions(refreshResources);

  // Atualizar dados quando o usuário mudar
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user || !session) {
          if (isMounted) {
            setError("Usuário não autenticado. Faça login para ver seus documentos.");
          }
          setIsLoading(false);
          return;
        }
        
        if (isMounted) {
          await documentList.listarDocumentos();
          await storage.calcularEspacoDisponivel();
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setError(`Falha ao carregar dados: ${errorMessage}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user, session, documentList.listarDocumentos, storage.calcularEspacoDisponivel]);

  // Combinar erros de todos os hooks
  const combinedError = error || uploadHook.uploadError || actionsHook.actionError || storage.error || documentList.error;
  const combinedLoading = isLoading || uploadHook.isUploading || actionsHook.isActionLoading || documentList.isRefreshing || storage.isRefreshing;

  // Fornecer todos os métodos e estados necessários
  return {
    // Do documentList
    documents: documentList.documents,
    listarDocumentos: documentList.listarDocumentos,
    
    // Do storage
    usoAtual: storage.usoAtual,
    espacoDisponivel: storage.espacoDisponivel,
    formatarTamanhoArquivo: storage.formatarTamanhoArquivo,
    calcularEspacoDisponivel: storage.calcularEspacoDisponivel,
    
    // Do uploadHook
    uploadDocumento: uploadHook.uploadDocumento,
    
    // Do actionsHook
    obterUrlDocumento: actionsHook.obterUrlDocumento,
    excluirDocumento: actionsHook.excluirDocumento,
    
    // Estados combinados
    isLoading: combinedLoading,
    isRefreshing: documentList.isRefreshing || storage.isRefreshing,
    error: combinedError
  };
}
