
export const createSuccessResponse = (
  publicacoesEncontradas: number,
  fontesConsultadas: string[],
  tempoExecucao: number,
  erros: string[],
  sanitizedNomes: string[],
  sanitizedEstados: string[],
  sanitizedPalavrasChave: string[]
) => {
  const message = publicacoesEncontradas > 0 
    ? `✅ BUSCA CONCLUÍDA: Encontradas ${publicacoesEncontradas} publicações nos diários oficiais consultados.`
    : `ℹ️ BUSCA CONCLUÍDA: Nenhuma publicação foi encontrada nos diários oficiais consultados para os nomes e estados especificados.`;

  return {
    success: true,
    publicacoes_encontradas: publicacoesEncontradas,
    fontes_consultadas: fontesConsultadas.length,
    tempo_execucao: tempoExecucao,
    erros: erros.length > 0 ? erros.join('; ') : null,
    message: message,
    status_integracao: 'INTEGRADO',
    detalhes_busca: {
      nomes_buscados: sanitizedNomes,
      estados_consultados: sanitizedEstados.length > 0 ? sanitizedEstados : ['SP', 'RJ', 'MG', 'CE', 'PR'],
      palavras_chave: sanitizedPalavrasChave
    }
  };
};

export const createErrorResponse = (message: string, status: number = 500) => {
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error', 
      message: message,
      success: false,
      status_integracao: 'ERRO'
    }),
    { 
      status: status, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json'
      } 
    }
  );
};
