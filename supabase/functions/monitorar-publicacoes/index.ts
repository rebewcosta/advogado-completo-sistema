
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

// Function to extract text content from HTML
const extractTextFromHTML = (html: string): string => {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

// Function to search for names in text content
const searchNamesInContent = (content: string, nomes: string[], palavrasChave: string[]): boolean => {
  const contentLower = content.toLowerCase();
  
  // Check if any of the monitored names appear in the content
  const hasNome = nomes.some(nome => {
    if (!nome.trim()) return false;
    return contentLower.includes(nome.toLowerCase());
  });
  
  // If additional keywords are provided, check for them too
  if (palavrasChave.length > 0) {
    const hasKeyword = palavrasChave.some(palavra => {
      if (!palavra.trim()) return false;
      return contentLower.includes(palavra.toLowerCase());
    });
    return hasNome || hasKeyword;
  }
  
  return hasNome;
};

// Function to determine publication type based on content
const determinePublicationType = (content: string): string => {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('citação') || contentLower.includes('citar')) return 'Citação';
  if (contentLower.includes('intimação') || contentLower.includes('intimar')) return 'Intimação';
  if (contentLower.includes('sentença')) return 'Sentença';
  if (contentLower.includes('despacho')) return 'Despacho';
  if (contentLower.includes('decisão')) return 'Decisão';
  if (contentLower.includes('edital')) return 'Edital';
  
  return 'Publicação';
};

// Function to extract process number from content
const extractProcessNumber = (content: string): string | null => {
  // Pattern for Brazilian process numbers (NNNNNNN-NN.NNNN.N.NN.NNNN)
  const processPattern = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;
  const match = content.match(processPattern);
  return match ? match[0] : null;
};

// Function to create mock publications for testing
const createMockPublications = (nomes: string[], quantidade: number = 2): any[] => {
  const publications = [];
  const tipos = ['Intimação', 'Citação', 'Sentença', 'Despacho'];
  const estados = ['SP', 'RJ', 'MG', 'RS', 'PR'];
  
  for (let i = 0; i < quantidade; i++) {
    const nomeIndex = i % nomes.length;
    const estadoIndex = i % estados.length;
    
    publications.push({
      nome_advogado: nomes[nomeIndex],
      titulo_publicacao: `Publicação encontrada em Diário Oficial - ${tipos[i % tipos.length]}`,
      conteudo_publicacao: `Conteúdo da publicação ${i + 1} referente ao advogado ${nomes[nomeIndex]}. Esta é uma publicação de teste do sistema de monitoramento.`,
      data_publicacao: new Date().toISOString().split('T')[0],
      diario_oficial: `Diário Oficial do Estado de ${estados[estadoIndex]}`,
      estado: estados[estadoIndex],
      tipo_publicacao: tipos[i % tipos.length],
      numero_processo: null,
      url_publicacao: null,
      segredo_justica: false,
      lida: false,
      importante: false
    });
  }
  
  return publications;
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
    const sanitizedNomes = body.nomes.map((nome: string) => sanitizeInput(nome)).filter((n: string) => n.length > 0);
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

    // Verificar rate limiting mais permissivo
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

    // Simular busca em diários (substituindo scraping real por dados mock)
    console.log(`Simulando busca para nomes: ${sanitizedNomes.join(', ')}`);
    
    let publicacoesEncontradas = 0;
    const fontesConsultadas: string[] = [];
    const erros: string[] = [];

    try {
      // Criar publicações mock para teste
      const publicacoesMock = createMockPublications(sanitizedNomes, 2);
      
      // Inserir publicações no banco
      for (const pub of publicacoesMock) {
        try {
          const { error: pubError } = await supabase
            .from('publicacoes_diario_oficial')
            .insert({
              ...pub,
              user_id: body.user_id
            });

          if (pubError) {
            console.error('Error inserting publication:', pubError);
            erros.push(`Erro ao salvar publicação: ${pubError.message}`);
          } else {
            publicacoesEncontradas++;
            console.log('Publicação inserida com sucesso');
          }
        } catch (insertError) {
          console.error('Insert error:', insertError);
          erros.push(`Erro de inserção: ${insertError.message}`);
        }
      }

      fontesConsultadas.push('Diário Oficial - Simulação');
      
    } catch (error) {
      console.error('Erro durante simulação:', error);
      erros.push(`Erro de simulação: ${error.message}`);
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
        : 'Nenhuma publicação relevante encontrada na busca'
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
