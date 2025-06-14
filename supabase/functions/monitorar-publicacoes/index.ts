
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DiarioScraper } from './scrapers/diarioScraper.ts'
import { PublicacaoEncontrada } from './scrapers/types.ts'
import { validateUserInput, sanitizeInputs } from './utils/validation.ts'
import { checkRateLimit } from './utils/rateLimit.ts'
import { createMonitoringLog, updateMonitoringLog } from './utils/logging.ts'
import { createSuccessResponse, createErrorResponse } from './utils/response.ts'
import { savePublicacoes, getFontesConsultadas } from './utils/publicacoes.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const startTime = Date.now();
    
    // Parse and validate request body
    const body = await req.json();
    console.log('🔍 MONITORAMENTO REAL INICIADO');
    console.log('👤 Usuário:', body.user_id);
    console.log('📝 Nomes para buscar:', body.nomes);
    console.log('🌍 Estados:', body.estados?.length > 0 ? body.estados : 'Todos os estados principais');
    
    // Input validation
    const validationErrors = validateUserInput(body);
    if (validationErrors.length > 0) {
      console.error('❌ Erros de validação:', validationErrors);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationErrors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize inputs
    const { sanitizedNomes, sanitizedEstados, sanitizedPalavrasChave } = sanitizeInputs(body);

    if (sanitizedNomes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pelo menos um nome válido deve ser fornecido para monitoramento' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting
    const isRateLimited = await checkRateLimit(body.user_id, supabase);
    if (isRateLimited) {
      console.warn('⚠️ Limite de execuções atingido para usuário:', body.user_id);
      return new Response(
        JSON.stringify({ 
          error: 'Limite de execuções atingido. Aguarde 5 minutos antes de tentar novamente.',
          success: false
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create initial log entry
    const logEntry = await createMonitoringLog(body.user_id, supabase);

    console.log('🚀 INICIANDO BUSCA REAL NOS DIÁRIOS OFICIAIS...');
    console.log('📋 Configuração da busca:');
    console.log('   - Nomes:', sanitizedNomes);
    console.log('   - Estados:', sanitizedEstados.length > 0 ? sanitizedEstados : 'PRINCIPAIS ESTADOS (SP, RJ, MG, CE, PR)');
    console.log('   - Palavras-chave:', sanitizedPalavrasChave);
    
    let publicacoesEncontradas = 0;
    const erros: string[] = [];

    try {
      // Initialize real scraper
      const scraper = new DiarioScraper();
      
      console.log('🌐 Consultando diários oficiais reais...');
      
      // Search publications in official gazettes
      const publicacoesReais: PublicacaoEncontrada[] = await scraper.buscarEmTodosEstados(
        sanitizedNomes,
        sanitizedEstados
      );

      console.log(`📄 Publicações encontradas: ${publicacoesReais.length}`);

      // Save found publications to database
      try {
        await savePublicacoes(publicacoesReais, body.user_id, supabase);
      } catch (error) {
        erros.push(error.message);
      }

      publicacoesEncontradas = publicacoesReais.length;

    } catch (error) {
      console.error('❌ Erro durante o scraping:', error);
      erros.push(`Erro durante a consulta aos diários: ${error.message}`);
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);
    const fontesConsultadas = getFontesConsultadas(sanitizedEstados);

    // Update log entry with results
    await updateMonitoringLog(
      logEntry.id, 
      publicacoesEncontradas, 
      tempoExecucao, 
      fontesConsultadas, 
      erros, 
      supabase
    );

    const response = createSuccessResponse(
      publicacoesEncontradas,
      fontesConsultadas,
      tempoExecucao,
      erros,
      sanitizedNomes,
      sanitizedEstados,
      sanitizedPalavrasChave
    );

    console.log('✅ Resposta final:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro crítico no monitoramento:', error);
    return createErrorResponse(error.message);
  }
});
