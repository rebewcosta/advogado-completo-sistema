
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as DocumentosService from '@/services/documentos';
import { LIMITE_ARMAZENAMENTO_BYTES } from './useDocumentTypes';

export function useDocumentStorage() {
  const [usoAtual, setUsoAtual] = useState<number>(0);
  const [espacoDisponivel, setEspacoDisponivel] = useState<number>(LIMITE_ARMAZENAMENTO_BYTES);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

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

  return {
    usoAtual,
    espacoDisponivel,
    isRefreshing,
    formatarTamanhoArquivo,
    obterUsoArmazenamento,
    calcularEspacoDisponivel,
    error
  };
}
