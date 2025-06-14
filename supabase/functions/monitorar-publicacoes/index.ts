
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DiarioScraper, PublicacaoEncontrada } from './scrapers/diarioScraper.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schemas
const validateUserInput = (input: any) => {
  const errors: string[] = [];
  
  if (!input.user_id || typeof input.user_id !== 'string') {
    errors.push('Invalid user_id');
  }
  
  if (!Array.isArray(input.nomes) || input.nomes.length === 0) {
    errors.push('Invalid or empty nomes array');
  }
  
  if (input.nomes && input.nomes.some((nome: any) => typeof nome !== 'string' || nome.length > 100)) {
    errors.push('Invalid nome format or length');
  }
  
  if (input.estados && !Array.isArray(input.estados)) {
    errors.push('Invalid estados format');
  }
  
  if (input.palavras_chave && !Array.isArray(input.palavras_chave)) {
    errors.push('Invalid palavras_chave format');
  }
  
  return errors;
};

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"&]/g, '').trim();
};

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
    const sanitizedNomes = body.nomes.map((nome: string) => sanitizeInput(nome)).filter((n: string) => n.length > 0);
    const sanitizedEstados = body.estados?.map((estado: string) => sanitizeInput(estado)).filter((e: string) => e.length > 0) || [];
    const sanitizedPalavrasChave = body.palavras_chave?.map((palavra: string) => sanitizeInput(palavra)).filter((p: string) => p.length > 0) || [];

    if (sanitizedNomes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pelo menos um nome válido deve ser fornecido para monitoramento' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar rate limiting
    const { data: recentLogs } = await supabase
      .from('logs_monitoramento')
      .select('id')
      .eq('user_id', body.user_id)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(5);

    if (recentLogs && recentLogs.length >= 5) {
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
    const { data: logEntry, error: logError } = await supabase
      .from('logs_monitoramento')
      .insert({
        user_id: body.user_id,
        status: 'iniciado',
        data_execucao: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Erro ao criar log:', logError);
      throw new Error('Failed to create monitoring log');
    }

    console.log('🚀 INICIANDO BUSCA REAL NOS DIÁRIOS OFICIAIS...');
    console.log('📋 Configuração da busca:');
    console.log('   - Nomes:', sanitizedNomes);
    console.log('   - Estados:', sanitizedEstados.length > 0 ? sanitizedEstados : 'PRINCIPAIS ESTADOS (SP, RJ, MG, CE, PR)');
    console.log('   - Palavras-chave:', sanitizedPalavrasChave);
    
    let publicacoesEncontradas = 0;
    const fontesConsultadas: string[] = [];
    const erros: string[] = [];

    try {
      // Inicializar o scraper real
      const scraper = new DiarioScraper();
      
      console.log('🌐 Consultando diários oficiais reais...');
      
      // Buscar publicações nos diários oficiais
      const publicacoesReais: PublicacaoEncontrada[] = await scraper.buscarEmTodosEstados(
        sanitizedNomes,
        sanitizedEstados
      );

      console.log(`📄 Publicações encontradas: ${publicacoesReais.length}`);

      // Salvar publicações encontradas no banco
      if (publicacoesReais.length > 0) {
        const publicacoesParaSalvar = publicacoesReais.map(pub => ({
          ...pub,
          user_id: body.user_id,
          segredo_justica: false,
          lida: false,
          importante: false
        }));

        const { error: insertError } = await supabase
          .from('publicacoes_diario_oficial')
          .insert(publicacoesParaSalvar);

        if (insertError) {
          console.error('❌ Erro ao salvar publicações:', insertError);
          erros.push('Erro ao salvar algumas publicações no banco de dados');
        } else {
          console.log('✅ Publicações salvas no banco de dados');
        }
      }

      publicacoesEncontradas = publicacoesReais.length;

      // Listar fontes consultadas baseado nos estados
      const estadosConsultados = sanitizedEstados.length > 0 ? sanitizedEstados : ['SP', 'RJ', 'MG', 'CE', 'PR'];
      
      estadosConsultados.forEach(estado => {
        fontesConsultadas.push(`Diário Oficial ${estado}`);
        fontesConsultadas.push(`Diário da Justiça ${estado}`);
      });

    } catch (error) {
      console.error('❌ Erro durante o scraping:', error);
      erros.push(`Erro durante a consulta aos diários: ${error.message}`);
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);

    // Update log entry with results
    const { error: updateError } = await supabase
      .from('logs_monitoramento')
      .update({
        status: 'concluido',
        publicacoes_encontradas: publicacoesEncontradas,
        tempo_execucao_segundos: tempoExecucao,
        fontes_consultadas: fontesConsultadas,
        erros: erros.length > 0 ? erros.join('; ') : null
      })
      .eq('id', logEntry.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar log:', updateError);
    }

    const message = publicacoesEncontradas > 0 
      ? `✅ BUSCA CONCLUÍDA: Encontradas ${publicacoesEncontradas} publicações nos diários oficiais consultados.`
      : `ℹ️ BUSCA CONCLUÍDA: Nenhuma publicação foi encontrada nos diários oficiais consultados para os nomes e estados especificados.`;

    const response = {
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

    console.log('✅ Resposta final:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro crítico no monitoramento:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        success: false,
        status_integracao: 'ERRO'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
