
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';

export const LIMITE_ARMAZENAMENTO_MB = 25;
export const LIMITE_ARMAZENAMENTO_BYTES = LIMITE_ARMAZENAMENTO_MB * 1024 * 1024; // 25MB em bytes

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
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Formatar tamanho em bytes para formato legível
  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Função para obter o uso de armazenamento do usuário atual
  const obterUsoArmazenamento = async (): Promise<number> => {
    if (!user) {
      console.log("Usuário não autenticado ao obter uso de armazenamento");
      return 0;
    }
    
    try {
      const usoBytes = await DocumentosService.obterUsoArmazenamento();
      setUsoAtual(usoBytes);
      return usoBytes;
    } catch (error) {
      console.error('Erro ao obter uso de armazenamento:', error);
      setError(error instanceof Error ? error.message : 'Falha ao obter informações de armazenamento');
      throw error;
    }
  };

  // Função para calcular espaço disponível em bytes
  const calcularEspacoDisponivel = async (): Promise<number> => {
    try {
      setIsRefreshing(true);
      if (!user) {
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
      // Default to showing full space available if error occurs
      setEspacoDisponivel(LIMITE_ARMAZENAMENTO_BYTES);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Carregar documentos
  const listarDocumentos = async () => {
    if (!user) {
      console.log("Usuário não autenticado ao listar documentos");
      setDocuments([]);
      setIsLoading(false);
      return [];
    }
    
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await DocumentosService.listarDocumentos();
      setDocuments(data as Document[]);
      return data;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Falha ao listar documentos: ${errorMessage}`);
      setDocuments([]);
      throw error;
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Função para fazer upload de um documento
  const uploadDocumento = async (
    file: File, 
    tipo: string,
    cliente: string,
    processo?: string
  ): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      setIsLoading(true);
      setError(null);

      // Verificar tamanho do arquivo
      if (file.size > LIMITE_ARMAZENAMENTO_BYTES) {
        throw new Error(`O arquivo excede o limite máximo de ${LIMITE_ARMAZENAMENTO_MB}MB`);
      }

      // Verificar se o usuário tem espaço suficiente
      const espacoDisponivel = await calcularEspacoDisponivel();
      if (file.size > espacoDisponivel) {
        throw new Error(`Você não tem espaço suficiente. Disponível: ${formatarTamanhoArquivo(espacoDisponivel)}`);
      }

      const filePath = await DocumentosService.uploadDocumento(file, tipo, cliente, processo);

      // Atualizar lista de documentos e espaço disponível
      await listarDocumentos();
      await calcularEspacoDisponivel();

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

  // Função para obter URL de download de um documento
  const obterUrlDocumento = async (path: string): Promise<string> => {
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
    try {
      setIsLoading(true);
      setError(null);
      
      await DocumentosService.excluirDocumento(id, path);

      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      });

      // Atualizar lista de documentos e espaço disponível
      await listarDocumentos();
      await calcularEspacoDisponivel();

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

  // Atualizar dados quando o usuário mudar
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!user) {
          if (isMounted) {
            setDocuments([]);
            setUsoAtual(0);
            setEspacoDisponivel(LIMITE_ARMAZENAMENTO_BYTES);
            setIsLoading(false);
          }
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
  }, [user]);

  return {
    documents,
    isLoading,
    isRefreshing,
    espacoDisponivel,
    usoAtual,
    formatarTamanhoArquivo,
    uploadDocumento,
    listarDocumentos,
    obterUrlDocumento,
    excluirDocumento,
    calcularEspacoDisponivel,
    error
  };
}
