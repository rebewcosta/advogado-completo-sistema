
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
    const sanitizedNomes = body.nomes.map((nome: string) => sanitizeInput(nome));
    const sanitizedPalavrasChave = body.palavras_chave?.map((palavra: string) => sanitizeInput(palavra)) || [];

    // Rate limiting check (basic implementation)
    const { data: recentLogs } = await supabase
      .from('logs_monitoramento')
      .select('id')
      .eq('user_id', body.user_id)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .limit(5);

    if (recentLogs && recentLogs.length >= 5) {
      console.warn('Rate limit exceeded for user:', body.user_id);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.' }),
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

    // Get active sources
    const { data: fontes, error: fontesError } = await supabase
      .from('fontes_diarios')
      .select('*')
      .eq('ativo', true);

    if (fontesError) {
      console.error('Error fetching sources:', fontesError);
      throw new Error('Failed to fetch monitoring sources');
    }

    let publicacoesEncontradas = 0;
    const fontesConsultadas: string[] = [];
    const erros: string[] = [];

    // Filter sources by user's selected states
    const fontesToCheck = body.estados && body.estados.length > 0 
      ? fontes?.filter(fonte => body.estados.includes(fonte.estado)) || []
      : fontes || [];

    // Simulate monitoring process (replace with actual scraping logic)
    for (const fonte of fontesToCheck) {
      try {
        fontesConsultadas.push(fonte.nome);
        
        // Here you would implement the actual scraping logic
        // For now, we'll simulate finding publications
        console.log(`Checking fonte: ${fonte.nome} for names: ${sanitizedNomes.join(', ')}`);
        
        // Simulate finding publications (replace with real logic)
        const mockPublicacoes = Math.floor(Math.random() * 3); // 0-2 publications
        
        for (let i = 0; i < mockPublicacoes; i++) {
          const { error: pubError } = await supabase
            .from('publicacoes_diario_oficial')
            .insert({
              user_id: body.user_id,
              nome_advogado: sanitizedNomes[0],
              titulo_publicacao: `Publicação encontrada em ${fonte.nome}`,
              conteudo_publicacao: `Conteúdo simulado da publicação ${i + 1}`,
              data_publicacao: new Date().toISOString().split('T')[0],
              diario_oficial: fonte.nome,
              estado: fonte.estado,
              tipo_publicacao: 'Intimação',
              segredo_justica: false,
              lida: false,
              importante: false
            });

          if (pubError) {
            console.error('Error inserting publication:', pubError);
            erros.push(`Erro ao salvar publicação em ${fonte.nome}`);
          } else {
            publicacoesEncontradas++;
          }
        }
        
      } catch (error) {
        console.error(`Error checking fonte ${fonte.nome}:`, error);
        erros.push(`Erro ao consultar ${fonte.nome}: ${error.message}`);
      }
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
      erros: erros.length > 0 ? erros.join('; ') : null
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
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
