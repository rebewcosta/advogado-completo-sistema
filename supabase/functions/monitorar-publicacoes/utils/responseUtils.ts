
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
  const estadosConsultados = estados.length > 0 ? estados : ['TODOS OS 26 ESTADOS + DF'];
  const message = publicacoesEncontradas > 0 
    ? `✅ Busca OFICIAL NACIONAL concluída: ${publicacoesEncontradas} publicações encontradas em todo o Brasil`
    : `ℹ️ Busca OFICIAL NACIONAL concluída: Nenhuma publicação encontrada nas fontes oficiais de todo o Brasil`;

  return createCorsResponse({
    success: true,
    publicacoes_encontradas: publicacoesEncontradas,
    fontes_consultadas: fontesConsultadas.length,
    tempo_execucao: tempoExecucao,
    message: message,
    status_integracao: 'INTEGRADO_APIS_OFICIAIS_NACIONAL',
    detalhes_busca: {
      nomes_buscados: nomes,
      estados_consultados: estadosConsultados,
      fontes_utilizadas: fontesConsultadas,
      busca_tipo: 'Busca oficial NACIONAL via APIs de TODOS os Tribunais do Brasil: CNJ + 27 Tribunais Estaduais (26 estados + DF)',
      cobertura: 'NACIONAL - Todo o território brasileiro'
    }
  });
};
