
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';
import { Document } from './useDocumentTypes';

export function useDocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  // Carregar documentos
  const listarDocumentos = useCallback(async () => {
    if (!session || !user) {
      console.log("Usuário não autenticado ao listar documentos");
      setDocuments([]);
      setIsLoading(false);
      setError("Usuário não autenticado. Faça login para ver seus documentos.");
      return [];
    }
    
    try {
      setError(null);
      setIsRefreshing(true);
      const data = await DocumentosService.listarDocumentos();
      setDocuments(data as Document[]);
      return data;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Falha ao listar documentos: ${errorMessage}`);
      setDocuments([]);
      return [];
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [session, user]);

  return {
    documents,
    isLoading,
    isRefreshing,
    listarDocumentos,
    error
  };
}
