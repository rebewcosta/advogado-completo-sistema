
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateMonitoringRequest } from './utils/requestValidation.ts'
import { createOptionsResponse, createErrorResponse, createSuccessResponse } from './utils/responseUtils.ts'
import { MonitoringOrchestrator } from './services/monitoringOrchestrator.ts'

serve(async (req) => {
  console.log(`📝 Nova requisição recebida: ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Processando requisição OPTIONS (CORS preflight)');
    return createOptionsResponse();
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();
    
    // Validar requisição
    const validation = await validateMonitoringRequest(req);
    if (!validation.isValid) {
      return createErrorResponse(validation.error!, 'Configure os dados de monitoramento corretamente');
    }

    const { userId, nomes, estados } = validation.validatedData!;

    // Executar busca usando o orquestrador
    const orchestrator = new MonitoringOrchestrator();
    const resultado = await orchestrator.executarBuscaCompleta(nomes, estados, userId, supabase);

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);

    return createSuccessResponse(
      resultado.publicacoes,
      resultado.fontes,
      tempoExecucao,
      nomes,
      estados
    );

  } catch (error: any) {
    console.error('💥 Erro crítico:', error);
    
    return createErrorResponse(
      'Erro interno do sistema',
      'Ocorreu um erro inesperado. Tente novamente.'
    );
  }
});
