
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

// Function to scrape a website
const scrapeWebsite = async (fonte: any, nomes: string[], palavrasChave: string[]): Promise<any[]> => {
  console.log(`Scraping ${fonte.nome} at ${fonte.url_base}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(fonte.url_base, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.8,en;q=0.6',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received ${html.length} characters from ${fonte.nome}`);
    
    // Extract content based on CSS selectors
    const publications = [];
    const selectors = fonte.seletor_css.split(',').map((s: string) => s.trim());
    
    for (const selector of selectors) {
      // Simple HTML parsing to find content blocks
      const regex = new RegExp(`<[^>]*class[^>]*${selector.replace('.', '')}[^>]*>(.*?)</[^>]*>`, 'gis');
      let match;
      
      while ((match = regex.exec(html)) !== null && publications.length < 10) {
        const rawContent = match[1];
        const textContent = extractTextFromHTML(rawContent);
        
        if (textContent.length < 50) continue; // Skip too short content
        
        // Check if this content mentions any of the monitored names
        if (searchNamesInContent(textContent, nomes, palavrasChave)) {
          console.log(`Found relevant content in ${fonte.nome}: ${textContent.substring(0, 100)}...`);
          
          const publicacao = {
            nome_advogado: nomes.find(nome => textContent.toLowerCase().includes(nome.toLowerCase())) || nomes[0],
            titulo_publicacao: `Publicação encontrada em ${fonte.nome}`,
            conteudo_publicacao: textContent.substring(0, 2000), // Limit content size
            data_publicacao: new Date().toISOString().split('T')[0],
            diario_oficial: fonte.nome,
            estado: fonte.estado,
            tipo_publicacao: determinePublicationType(textContent),
            numero_processo: extractProcessNumber(textContent),
            url_publicacao: fonte.url_base,
            segredo_justica: textContent.toLowerCase().includes('segredo de justiça'),
            lida: false,
            importante: false
          };
          
          publications.push(publicacao);
        }
      }
    }
    
    console.log(`Found ${publications.length} relevant publications in ${fonte.nome}`);
    return publications;
    
  } catch (error) {
    console.error(`Error scraping ${fonte.nome}:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error(`Timeout ao acessar ${fonte.nome}`);
    } else if (error.message.includes('HTTP')) {
      throw new Error(`Erro de acesso ao ${fonte.nome}: ${error.message}`);
    } else {
      throw new Error(`Erro ao processar ${fonte.nome}: ${error.message}`);
    }
  }
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

    // Rate limiting check
    const { data: recentLogs } = await supabase
      .from('logs_monitoramento')
      .select('id')
      .eq('user_id', body.user_id)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Last 10 minutes
      .limit(3);

    if (recentLogs && recentLogs.length >= 3) {
      console.warn('Rate limit exceeded for user:', body.user_id);
      return new Response(
        JSON.stringify({ error: 'Limite de execuções atingido. Aguarde 10 minutos antes de tentar novamente.' }),
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

    console.log(`Checking ${fontesToCheck.length} sources for names: ${sanitizedNomes.join(', ')}`);

    // Process each source with real scraping
    for (const fonte of fontesToCheck.slice(0, 10)) { // Limit to 10 sources to avoid timeout
      try {
        fontesConsultadas.push(fonte.nome);
        
        const publicacoes = await scrapeWebsite(fonte, sanitizedNomes, sanitizedPalavrasChave);
        
        // Insert found publications into database
        for (const pub of publicacoes) {
          try {
            const { error: pubError } = await supabase
              .from('publicacoes_diario_oficial')
              .insert({
                ...pub,
                user_id: body.user_id
              });

            if (pubError) {
              console.error('Error inserting publication:', pubError);
              erros.push(`Erro ao salvar publicação de ${fonte.nome}`);
            } else {
              publicacoesEncontradas++;
            }
          } catch (insertError) {
            console.error('Insert error:', insertError);
            erros.push(`Erro de inserção para ${fonte.nome}`);
          }
        }
        
        // Update source last verification time
        await supabase
          .from('fontes_diarios')
          .update({ ultima_verificacao: new Date().toISOString() })
          .eq('id', fonte.id);
        
      } catch (error) {
        console.error(`Error checking fonte ${fonte.nome}:`, error);
        erros.push(`${fonte.nome}: ${error.message}`);
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
      erros: erros.length > 0 ? erros.join('; ') : null,
      message: publicacoesEncontradas > 0 
        ? `Encontradas ${publicacoesEncontradas} publicações relevantes`
        : 'Nenhuma publicação relevante encontrada'
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
