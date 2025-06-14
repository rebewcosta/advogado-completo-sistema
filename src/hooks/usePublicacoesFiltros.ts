
import { useCallback, useMemo } from 'react';
import { Publicacao } from '@/types/publicacoes';

interface ConfiguracaoMonitoramento {
  nomes_monitoramento: string[];
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

    return nomesAtivos.some(nomeConfig => 
      nomeAdvogado.toLowerCase().includes(nomeConfig) || 
      nomeConfig.includes(nomeAdvogado.toLowerCase())
    );
  }, [configuracao]);

  // Filtragem de publicações com base na configuração ativa
  const publicacoesFiltradas = useMemo(() => {
    return publicacoes.filter(pub => {
      // Primeiro filtro: apenas publicações de advogados ativos na configuração
      if (!isAdvogadoAtivo(pub.nome_advogado)) {
        return false;
      }

      // Filtros de busca
      const matchesSearch = pub.titulo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.conteudo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pub.nome_advogado.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todas' ||
                           (statusFilter === 'nao_lidas' && !pub.lida) ||
                           (statusFilter === 'importantes' && pub.importante) ||
                           (statusFilter === 'lidas' && pub.lida);
      
      return matchesSearch && matchesStatus;
    });
  }, [publicacoes, isAdvogadoAtivo, searchTerm, statusFilter]);

  // Só mostra publicações se o monitoramento estiver ativo
  const publicacoesParaExibir = configuracao?.monitoramento_ativo ? publicacoesFiltradas : [];

  return {
    publicacoesParaExibir,
    isAdvogadoAtivo
  };
};
