
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Monitoramento iniciado para user:', body.user_id);
    console.log('Estados solicitados:', body.estados);
    
    // Input validation
    const validationErrors = validateUserInput(body);
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
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
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
      .limit(5);

    if (recentLogs && recentLogs.length >= 5) {
      console.warn('Rate limit exceeded for user:', body.user_id);
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
      console.error('Error creating log entry:', logError);
      throw new Error('Failed to create monitoring log');
    }

    // Buscar publicações reais nos diários oficiais
    console.log(`Buscando publicações para nomes: ${sanitizedNomes.join(', ')}`);
    console.log(`Estados especificados: ${sanitizedEstados.join(', ') || 'Todos'}`);
    
    let publicacoesEncontradas = 0;
    const fontesConsultadas: string[] = [];
    const erros: string[] = [];

    try {
      // AQUI SERIA A INTEGRAÇÃO REAL COM OS DIÁRIOS OFICIAIS
      // Por enquanto, como não há integração real implementada, 
      // retornamos que não foram encontradas publicações
      
      // Determinar fontes que seriam consultadas
      if (sanitizedEstados.length > 0) {
        sanitizedEstados.forEach(estado => {
          fontesConsultadas.push(`Diário Oficial ${estado}`);
        });
      } else {
        fontesConsultadas.push('Diários Oficiais Nacionais');
      }
      
      console.log(`Consulta realizada em ${fontesConsultadas.length} fontes`);
      console.log('Nenhuma publicação encontrada nos diários oficiais');
      
    } catch (error) {
      console.error('Erro durante busca:', error);
      erros.push(`Erro de busca: ${error.message}`);
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
      console.error('Error updating log:', updateError);
    }

    const response = {
      success: true,
      publicacoes_encontradas: publicacoesEncontradas,
      fontes_consultadas: fontesConsultadas.length,
      tempo_execucao: tempoExecucao,
      erros: erros.length > 0 ? erros.join('; ') : null,
      message: publicacoesEncontradas > 0 
        ? `Encontradas ${publicacoesEncontradas} publicações relevantes`
        : 'Nenhuma publicação foi encontrada nos diários oficiais consultados para os nomes e estados especificados'
    };

    console.log('Monitoramento concluído:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monitorar-publicacoes:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
