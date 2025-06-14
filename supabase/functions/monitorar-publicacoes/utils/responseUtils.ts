
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
  estados: string[],
  diagnostico?: any
) => {
  const estadosConsultados = estados.length > 0 ? estados : ['TODOS'];
  
  let message: string;
  let statusIntegracao: string;
  
  if (diagnostico?.usandoDadosDemo) {
    message = `✅ Sistema funcionando com dados de demonstração: ${publicacoesEncontradas} publicações de exemplo geradas`;
    statusIntegracao = 'FUNCIONANDO_MODO_DEMONSTRACAO';
  } else if (publicacoesEncontradas > 0) {
    message = `✅ Busca oficial concluída: ${publicacoesEncontradas} publicações encontradas`;
    statusIntegracao = 'INTEGRADO_APIS_OFICIAIS';
  } else {
    message = `ℹ️ Nenhuma publicação encontrada nas fontes disponíveis`;
    statusIntegracao = 'SEM_RESULTADOS';
  }

  const response: any = {
    success: true,
    publicacoes_encontradas: publicacoesEncontradas,
    fontes_consultadas: fontesConsultadas.length,
    tempo_execucao: tempoExecucao,
    message: message,
    status_integracao: statusIntegracao,
    detalhes_busca: {
      nomes_buscados: nomes,
      estados_consultados: estadosConsultados,
      fontes_utilizadas: fontesConsultadas,
      busca_tipo: diagnostico?.usandoDadosDemo ? 
        'Demonstração do sistema de monitoramento' : 
        'Busca em APIs oficiais dos tribunais'
    }
  };

  if (diagnostico) {
    response.diagnostico = diagnostico;
  }

  return createCorsResponse(response);
};
