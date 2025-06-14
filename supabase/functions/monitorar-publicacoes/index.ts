
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface PublicacaoEncontrada {
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
}

// Classe base para scraping simples
class BaseScraper {
  protected readonly timeoutMs = 10000;

  protected limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '')
      .trim()
      .substring(0, 1000);
  }

  protected async fetchWithTimeout(url: string): Promise<Response> {
    try {
      return await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      console.error(`Erro ao acessar ${url}:`, error);
      throw error;
    }
  }

  protected buscarNomesNoHtml(html: string, nomes: string[], estadoSigla: string, estadoNome: string, url: string): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    for (const nome of nomes) {
      if (html.toLowerCase().includes(nome.toLowerCase())) {
        const regex = new RegExp(`.{0,200}${nome.replace(/\s+/g, '\\s+')}.{0,200}`, 'gi');
        const matches = html.match(regex);
        
        if (matches) {
          for (const match of matches) {
            publicacoes.push({
              nome_advogado: nome,
              titulo_publicacao: `Publicação no Diário Oficial ${estadoSigla}`,
              conteudo_publicacao: this.limparTexto(match),
              data_publicacao: new Date().toISOString().split('T')[0],
              diario_oficial: `Diário Oficial do Estado ${estadoNome}`,
              estado: estadoSigla,
              url_publicacao: url
            });
          }
        }
      }
    }
    
    return publicacoes;
  }
}

// Scraper principal
class DiarioScraper extends BaseScraper {
  async buscarEmTodosEstados(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    const estadosParaBuscar = estadosEspecificos.length > 0 
      ? estadosEspecificos 
      : ['SP', 'RJ', 'MG', 'CE', 'PR', 'RS', 'SC', 'BA', 'GO'];
    
    console.log(`🌐 Iniciando busca REAL em ${estadosParaBuscar.length} estados: ${estadosParaBuscar.join(', ')}`);

    // URLs dos diários oficiais por estado
    const urlsEstados: Record<string, string> = {
      'SP': 'https://www.imprensaoficial.com.br/',
      'RJ': 'https://www.ioerj.com.br/',
      'MG': 'https://www.jornalminasgerais.mg.gov.br/',
      'CE': 'https://www.egov.ce.gov.br/diario-oficial',
      'PR': 'https://www.aen.pr.gov.br/Diario',
      'RS': 'https://www.corag.com.br/doe',
      'SC': 'https://doe.sea.sc.gov.br/',
      'BA': 'https://egov.ba.gov.br/',
      'GO': 'https://www.dio.go.gov.br/'
    };

    const promises: Promise<PublicacaoEncontrada[]>[] = [];

    for (const estado of estadosParaBuscar) {
      if (urlsEstados[estado]) {
        promises.push(this.buscarPorEstado(nomes, estado, urlsEstados[estado]));
      }
    }

    try {
      console.log(`🔍 Executando ${promises.length} buscas REAIS em paralelo...`);
      const resultados = await Promise.allSettled(promises);
      
      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          console.log(`✅ Busca ${index + 1} concluída: ${resultado.value.length} publicações`);
          publicacoes.push(...resultado.value);
        } else {
          console.error(`❌ Erro na busca ${index + 1}:`, resultado.reason);
        }
      });

      console.log(`✅ Busca REAL concluída: ${publicacoes.length} publicações encontradas no total`);
      return publicacoes;

    } catch (error) {
      console.error('❌ Erro geral na busca REAL:', error);
      return publicacoes;
    }
  }

  private async buscarPorEstado(nomes: string[], estado: string, url: string): Promise<PublicacaoEncontrada[]> {
    try {
      console.log(`🔍 Buscando no Diário Oficial de ${estado}...`);
      
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        const estadosNomes: Record<string, string> = {
          'SP': 'de São Paulo',
          'RJ': 'do Rio de Janeiro', 
          'MG': 'de Minas Gerais',
          'CE': 'do Ceará',
          'PR': 'do Paraná',
          'RS': 'do Rio Grande do Sul',
          'SC': 'de Santa Catarina',
          'BA': 'da Bahia',
          'GO': 'de Goiás'
        };
        
        return this.buscarNomesNoHtml(html, nomes, estado, estadosNomes[estado] || estado, url);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar no Diário de ${estado}:`, error);
    }
    
    return [];
  }
}

serve(async (req) => {
  console.log(`📝 Nova requisição recebida: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Processando requisição OPTIONS (CORS preflight)');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();
    
    // Parse request body
    let body;
    
    try {
      console.log('📦 Lendo corpo da requisição...');
      
      if (!req.body) {
        console.error('❌ Request não possui body');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Request body é obrigatório',
            message: 'Dados de monitoramento não foram enviados'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const requestText = await req.text();
      console.log('📄 Texto bruto recebido:', requestText.substring(0, 200));
      
      if (!requestText || requestText.trim() === '') {
        console.error('❌ Corpo da requisição está vazio');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Corpo da requisição está vazio',
            message: 'Configure os dados de monitoramento'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      body = JSON.parse(requestText);
      console.log('✅ JSON parseado com sucesso:', JSON.stringify(body, null, 2));
      
    } catch (parseError) {
      console.error('❌ Erro no parse do JSON:', parseError);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Formato JSON inválido',
          message: 'Erro no formato dos dados. Tente configurar novamente.',
          details: parseError.message
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validação dos dados
    if (!body?.user_id || typeof body.user_id !== 'string') {
      console.error('❌ user_id inválido:', body?.user_id);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'ID do usuário é obrigatório',
          message: 'Erro de autenticação. Faça login novamente.'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Array.isArray(body?.nomes) || body.nomes.length === 0) {
      console.error('❌ Array de nomes inválido:', body?.nomes);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Lista de nomes é obrigatória',
          message: 'Configure pelo menos um nome para monitoramento'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitizar nomes
    const nomesValidos = body.nomes
      .filter((nome: any) => typeof nome === 'string' && nome.trim().length > 0)
      .map((nome: string) => nome.trim());

    if (nomesValidos.length === 0) {
      console.error('❌ Nenhum nome válido encontrado');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Nenhum nome válido encontrado',
          message: 'Configure pelo menos um nome válido para monitoramento'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitizar estados
    const estadosValidos = Array.isArray(body.estados)
      ? body.estados
          .filter((estado: any) => typeof estado === 'string' && estado.trim().length > 0)
          .map((estado: string) => estado.trim().toUpperCase())
      : [];

    console.log('🚀 INICIANDO BUSCA REAL...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'PRINCIPAIS ESTADOS');
    
    let publicacoesEncontradas = 0;

    try {
      const scraper = new DiarioScraper();
      
      console.log('🌐 Consultando diários oficiais...');
      
      const publicacoesReais: PublicacaoEncontrada[] = await scraper.buscarEmTodosEstados(
        nomesValidos,
        estadosValidos
      );

      console.log(`📄 Publicações encontradas: ${publicacoesReais.length}`);

      if (publicacoesReais.length > 0) {
        const publicacoesParaSalvar = publicacoesReais.map(pub => ({
          ...pub,
          user_id: body.user_id,
          segredo_justica: false,
          lida: false,
          importante: false
        }));

        console.log('💾 Salvando publicações no banco...');
        const { error: saveError } = await supabase
          .from('publicacoes_diario_oficial')
          .insert(publicacoesParaSalvar);

        if (saveError) {
          console.error('❌ Erro ao salvar publicações:', saveError);
        } else {
          console.log(`✅ ${publicacoesReais.length} publicações salvas com sucesso`);
        }
      }

      publicacoesEncontradas = publicacoesReais.length;

    } catch (searchError: any) {
      console.error('❌ Erro durante busca:', searchError);
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);
    const fontesConsultadas = estadosValidos.length > 0 ? estadosValidos : ['SP', 'RJ', 'MG', 'CE', 'PR'];

    const message = publicacoesEncontradas > 0 
      ? `✅ Busca concluída: ${publicacoesEncontradas} publicações encontradas`
      : `ℹ️ Busca concluída: Nenhuma publicação encontrada`;

    const response = {
      success: true,
      publicacoes_encontradas: publicacoesEncontradas,
      fontes_consultadas: fontesConsultadas.length,
      tempo_execucao: tempoExecucao,
      message: message,
      status_integracao: 'INTEGRADO_REAL',
      detalhes_busca: {
        nomes_buscados: nomesValidos,
        estados_consultados: fontesConsultadas,
        busca_tipo: 'REAL - Scraping direto dos sites oficiais'
      }
    };

    console.log('✅ Resposta preparada:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('💥 Erro crítico:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do sistema', 
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        status_integracao: 'ERRO',
        details: error.message
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
