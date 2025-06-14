
import { useCallback, useMemo } from 'react';
import { Publicacao } from '@/types/publicacoes';

interface ConfiguracaoMonitoramento {
  nomes_monitoramento: string[];
  estados_monitoramento: string[];
  monitoramento_ativo: boolean;
}

export const usePublicacoesFiltros = (
  publicacoes: Publicacao[],
  configuracao: ConfiguracaoMonitoramento | null,
  searchTerm: string,
  statusFilter: string
) => {
  // Função para verificar se um advogado está na configuração atual
  const isAdvogadoAtivo = useCallback((nomeAdvogado: string): boolean => {
    if (!configuracao || !configuracao.monitoramento_ativo) {
      return false;
    }

    // Verifica se o nome do advogado está nos nomes monitorados
    const nomesAtivos = configuracao.nomes_monitoramento
      .filter(nome => nome.trim() !== '')
      .map(nome => nome.toLowerCase().trim());

    if (nomesAtivos.length === 0) {
      return false;
    }

    const nomeAdvogadoLower = nomeAdvogado.toLowerCase().trim();
    
    return nomesAtivos.some(nomeConfig => 
      nomeAdvogadoLower.includes(nomeConfig) || 
      nomeConfig.includes(nomeAdvogadoLower)
    );
  }, [configuracao]);

  // Função para verificar se o estado está na configuração
  const isEstadoAtivo = useCallback((estado: string): boolean => {
    if (!configuracao || !configuracao.monitoramento_ativo) {
      return false;
    }

    // Se não há estados configurados, aceita todos os estados
    if (!configuracao.estados_monitoramento || configuracao.estados_monitoramento.length === 0) {
      return true;
    }

    // Verifica se o estado está nos estados monitorados
    const estadosAtivos = configuracao.estados_monitoramento
      .filter(est => est.trim() !== '')
      .map(est => est.toUpperCase().trim());

    return estadosAtivos.includes(estado.toUpperCase().trim());
  }, [configuracao]);

  // Filtragem de publicações com base na configuração ativa
  const publicacoesFiltradas = useMemo(() => {
    if (!configuracao?.monitoramento_ativo) {
      return [];
    }

    return publicacoes.filter(pub => {
      // Primeiro filtro: apenas publicações de advogados ativos na configuração
      if (!isAdvogadoAtivo(pub.nome_advogado)) {
        return false;
      }

      // Segundo filtro: apenas publicações dos estados configurados
      if (!isEstadoAtivo(pub.estado)) {
        return false;
      }

      // Filtros de busca
      const matchesSearch = searchTerm === '' || 
                           pub.titulo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.conteudo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.nome_advogado.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (pub.numero_processo && pub.numero_processo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'todas' ||
                           (statusFilter === 'nao_lidas' && !pub.lida) ||
                           (statusFilter === 'importantes' && pub.importante) ||
                           (statusFilter === 'lidas' && pub.lida);
      
      return matchesSearch && matchesStatus;
    });
  }, [publicacoes, isAdvogadoAtivo, isEstadoAtivo, searchTerm, statusFilter, configuracao]);

  // Só mostra publicações se o monitoramento estiver ativo
  const publicacoesParaExibir = configuracao?.monitoramento_ativo ? publicacoesFiltradas : [];

  return {
    publicacoesParaExibir,
    isAdvogadoAtivo,
    isEstadoAtivo
  };
};
