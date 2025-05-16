
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';
import { useDocumentUpload } from './useDocumentUpload';
import { useDocumentActions } from './useDocumentActions';

export const LIMITE_ARMAZENAMENTO_MB = DocumentosService.LIMITE_ARMAZENAMENTO_MB;
export const LIMITE_ARMAZENAMENTO_BYTES = DocumentosService.LIMITE_ARMAZENAMENTO_BYTES;

// Tipos para documentos
export type DocumentType = 'contrato' | 'petição' | 'procuração' | 'decisão' | 'outro';

export interface Document {
  id: string;
  nome: string;
  tipo: DocumentType;
  cliente: string;
  processo?: string;
  created_at: string;
  tamanho_bytes: number;
  path: string;
  content_type: string;
}

export function useDocumentos() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [espacoDisponivel, setEspacoDisponivel] = useState<number>(LIMITE_ARMAZENAMENTO_BYTES);
  const [usoAtual, setUsoAtual] = useState<number>(0);
  const { user, session } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Formatar tamanho em bytes para formato legível
  const formatarTamanhoArquivo = DocumentosService.formatarTamanhoArquivo;

  // Função para obter o uso de armazenamento do usuário atual
  const obterUsoArmazenamento = useCallback(async (): Promise<number> => {
    if (!session || !user) {
      console.log("Usuário não autenticado ao obter uso de armazenamento");
      setUsoAtual(0);
      return 0;
    }
    
    try {
      const usoBytes = await DocumentosService.obterUsoArmazenamento();
      setUsoAtual(usoBytes);
      return usoBytes;
    } catch (error) {
      console.error('Erro ao obter uso de armazenamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Falha ao obter informações de armazenamento';
      setError(errorMessage);
      return 0;
    }
  }, [session, user]);

  // Função para calcular espaço disponível em bytes
  const calcularEspacoDisponivel = useCallback(async (): Promise<number> => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      if (!session || !user) {
        console.log("Usuário não autenticado ao calcular espaço disponível");
        setEspacoDisponivel(LIMITE_ARMAZENAMENTO_BYTES);
        return LIMITE_ARMAZENAMENTO_BYTES;
      }

      const usoAtualBytes = await obterUsoArmazenamento();
      const disponivel = LIMITE_ARMAZENAMENTO_BYTES - usoAtualBytes;
      setEspacoDisponivel(disponivel);
      return disponivel;
    } catch (error) {
      console.error('Erro ao calcular espaço disponível:', error);
      const errorMessage = error instanceof Error ? error.message : 'Falha ao calcular espaço disponível';
      setError(errorMessage);
      // Default to showing full space available if error occurs
      setEspacoDisponivel(LIMITE_ARMAZENAMENTO_BYTES);
      return LIMITE_ARMAZENAMENTO_BYTES;
    } finally {
      setIsRefreshing(false);
    }
  }, [obterUsoArmazenamento, session, user]);

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

  // Atualizar recursos após uma ação bem-sucedida
  const refreshResources = useCallback(async () => {
    await listarDocumentos();
    await calcularEspacoDisponivel();
  }, [listarDocumentos, calcularEspacoDisponivel]);

  // Hooks para upload e ações em documentos
  const { 
    uploadDocumento, 
    isUploading, 
    uploadError 
  } = useDocumentUpload(refreshResources, calcularEspacoDisponivel);

  const { 
    obterUrlDocumento, 
    excluirDocumento, 
    isActionLoading, 
    actionError 
  } = useDocumentActions(refreshResources);

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
            setDocuments([]);
            setUsoAtual(0);
            setEspacoDisponivel(LIMITE_ARMAZENAMENTO_BYTES);
            setError("Usuário não autenticado. Faça login para ver seus documentos.");
          }
          setIsLoading(false);
          return;
        }
        
        if (isMounted) {
          await listarDocumentos();
          await calcularEspacoDisponivel();
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
  }, [user, session, listarDocumentos, calcularEspacoDisponivel]);

  // Combinar erros de todos os hooks
  const combinedError = error || uploadError || actionError;
  const combinedLoading = isLoading || isUploading || isActionLoading || isRefreshing;

  // Fornecer todos os métodos e estados necessários
  return {
    documents,
    isLoading: combinedLoading,
    isRefreshing,
    espacoDisponivel,
    usoAtual,
    formatarTamanhoArquivo,
    uploadDocumento,
    listarDocumentos,
    obterUrlDocumento,
    excluirDocumento,
    calcularEspacoDisponivel,
    error: combinedError
  };
}
