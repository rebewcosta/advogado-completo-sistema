
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export const createCorsResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
};

export const createOptionsResponse = () => {
  return new Response(null, { 
    headers: corsHeaders,
    status: 200 
  });
};

export const createErrorResponse = (error: string, message: string) => {
  return createCorsResponse({
    success: false,
    error,
    message,
    status_integracao: 'ERRO'
  });
};

export const createSuccessResponse = (
  publicacoesEncontradas: number,
  fontesConsultadas: string[],
  tempoExecucao: number,
  nomes: string[],
  estados: string[]
) => {
  const message = publicacoesEncontradas > 0 
    ? `✅ Busca REAL concluída: ${publicacoesEncontradas} publicações encontradas`
    : `ℹ️ Busca REAL concluída: Nenhuma publicação encontrada para os advogados informados`;

  return createCorsResponse({
    success: true,
    publicacoes_encontradas: publicacoesEncontradas,
    fontes_consultadas: fontesConsultadas.length,
    tempo_execucao: tempoExecucao,
    message: message,
    status_integracao: 'INTEGRADO_REAL_MULTI_FONTE',
    detalhes_busca: {
      nomes_buscados: nomes,
      estados_consultados: estados.length > 0 ? estados : ['SP', 'RJ', 'MG', 'RS', 'PR'],
      fontes_utilizadas: fontesConsultadas,
      busca_tipo: 'Busca real em múltiplas fontes: DJe, Jusbrasil e Sites Oficiais'
    }
  });
};
