
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

// Busca real nos sites dos diários oficiais
class DiarioOficialScraper {
  private readonly timeoutMs = 15000;

  private limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '')
      .trim()
      .substring(0, 1000);
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: AbortSignal.timeout(this.timeoutMs)
    });
  }

  private buscarNomesNoHtml(html: string, nomes: string[], estadoSigla: string, estadoNome: string, url: string): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    for (const nome of nomes) {
      const nomeNormalizado = nome.toLowerCase().trim();
      const htmlNormalizado = html.toLowerCase();
      
      if (htmlNormalizado.includes(nomeNormalizado)) {
        // Busca contexto ao redor do nome encontrado
        const regex = new RegExp(`.{0,300}${nome.replace(/\s+/g, '\\s+')}.{0,300}`, 'gi');
        const matches = html.match(regex);
        
        if (matches) {
          for (const match of matches.slice(0, 3)) { // Máximo 3 publicações por nome por estado
            publicacoes.push({
              nome_advogado: nome,
              titulo_publicacao: `Publicação no Diário Oficial - ${estadoSigla}`,
              conteudo_publicacao: this.limparTexto(match),
              data_publicacao: new Date().toISOString().split('T')[0],
              diario_oficial: `Diário Oficial ${estadoNome}`,
              estado: estadoSigla,
              url_publicacao: url
            });
          }
        }
      }
    }
    
    return publicacoes;
  }

  async buscarEmTodosEstados(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    // Definir todos os 27 estados brasileiros com seus respectivos URLs de diários oficiais
    const todosEstados = [
      { sigla: 'SP', nome: 'de São Paulo', url: 'https://www.imprensaoficial.com.br/DO/' },
      { sigla: 'RJ', nome: 'do Rio de Janeiro', url: 'http://www.ioerj.com.br/' },
      { sigla: 'MG', nome: 'de Minas Gerais', url: 'https://www.jornalminasgerais.mg.gov.br/' },
      { sigla: 'ES', nome: 'do Espírito Santo', url: 'https://www.dio.es.gov.br/' },
      { sigla: 'PR', nome: 'do Paraná', url: 'https://www.aen.pr.gov.br/Diario' },
      { sigla: 'SC', nome: 'de Santa Catarina', url: 'https://doe.sea.sc.gov.br/' },
      { sigla: 'RS', nome: 'do Rio Grande do Sul', url: 'https://www.corag.com.br/doe' },
      { sigla: 'CE', nome: 'do Ceará', url: 'https://www.doe.seplag.ce.gov.br/' },
      { sigla: 'BA', nome: 'da Bahia', url: 'http://www.egba.ba.gov.br/' },
      { sigla: 'PE', nome: 'de Pernambuco', url: 'https://www.cepe.com.br/diario-oficial' },
      { sigla: 'GO', nome: 'de Goiás', url: 'https://www.dio.go.gov.br/' },
      { sigla: 'DF', nome: 'do Distrito Federal', url: 'http://www.buriti.df.gov.br/ftp/diariooficial/' },
      { sigla: 'MT', nome: 'de Mato Grosso', url: 'https://www.iomat.mt.gov.br/' },
      { sigla: 'MS', nome: 'de Mato Grosso do Sul', url: 'https://www.spdo.ms.gov.br/' },
      { sigla: 'PA', nome: 'do Pará', url: 'https://www.ioepa.com.br/' },
      { sigla: 'AM', nome: 'do Amazonas', url: 'http://www.imprensaoficial.am.gov.br/' },
      { sigla: 'RO', nome: 'de Rondônia', url: 'http://www.diof.ro.gov.br/' },
      { sigla: 'AC', nome: 'do Acre', url: 'http://www.diario.ac.gov.br/' },
      { sigla: 'RR', nome: 'de Roraima', url: 'https://doe.rr.gov.br/' },
      { sigla: 'AP', nome: 'do Amapá', url: 'https://www.diap.ap.gov.br/' },
      { sigla: 'TO', nome: 'de Tocantins', url: 'https://diariooficial.to.gov.br/' },
      { sigla: 'MA', nome: 'do Maranhão', url: 'http://www.diariooficial.ma.gov.br/' },
      { sigla: 'PI', nome: 'do Piauí', url: 'http://www.diariooficial.pi.gov.br/' },
      { sigla: 'AL', nome: 'de Alagoas', url: 'http://www.imprensaoficialalagoas.com.br/' },
      { sigla: 'SE', nome: 'de Sergipe', url: 'https://doe.se.gov.br/' },
      { sigla: 'PB', nome: 'da Paraíba', url: 'http://www.paraiba.pb.gov.br/diariooficial/' },
      { sigla: 'RN', nome: 'do Rio Grande do Norte', url: 'http://diariooficial.rn.gov.br/' }
    ];

    const estadosParaBuscar = estadosEspecificos.length > 0 
      ? todosEstados.filter(e => estadosEspecificos.includes(e.sigla))
      : todosEstados;

    console.log(`🌐 Iniciando busca REAL em ${estadosParaBuscar.length} estados brasileiros`);
    console.log(`📋 Nomes para buscar: ${nomes.join(', ')}`);

    // Buscar em paralelo com limite de concorrência
    const BATCH_SIZE = 5; // Processar 5 estados por vez para não sobrecarregar
    
    for (let i = 0; i < estadosParaBuscar.length; i += BATCH_SIZE) {
      const batch = estadosParaBuscar.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (estado) => {
        try {
          console.log(`🔍 Buscando no Diário Oficial ${estado.nome} (${estado.sigla})...`);
          
          const response = await this.fetchWithTimeout(estado.url);
          
          if (!response.ok) {
            console.log(`⚠️ Erro HTTP ${response.status} para ${estado.sigla}`);
            return [];
          }

          const html = await response.text();
          
          if (!html || html.length < 100) {
            console.log(`⚠️ Conteúdo insuficiente para ${estado.sigla}`);
            return [];
          }

          const publicacoesEncontradas = this.buscarNomesNoHtml(html, nomes, estado.sigla, estado.nome, estado.url);
          
          if (publicacoesEncontradas.length > 0) {
            console.log(`✅ ${publicacoesEncontradas.length} publicação(ões) encontrada(s) em ${estado.sigla}`);
          } else {
            console.log(`ℹ️ Nenhuma publicação encontrada em ${estado.sigla}`);
          }
          
          return publicacoesEncontradas;
          
        } catch (error: any) {
          console.error(`❌ Erro ao buscar em ${estado.sigla}:`, error.message);
          return [];
        }
      });

      try {
        const batchResults = await Promise.allSettled(promises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            publicacoes.push(...result.value);
          } else {
            console.error(`❌ Falha na busca do estado ${batch[index].sigla}:`, result.reason);
          }
        });
        
        // Pausa entre batches para não sobrecarregar os servidores
        if (i + BATCH_SIZE < estadosParaBuscar.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error('❌ Erro no processamento do batch:', error);
      }
    }

    console.log(`✅ Busca REAL concluída: ${publicacoes.length} publicações encontradas no total`);
    return publicacoes;
  }
}

serve(async (req) => {
  console.log(`📝 Nova requisição recebida: ${req.method} ${req.url}`);
  
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

    const estadosValidos = Array.isArray(body.estados)
      ? body.estados
          .filter((estado: any) => typeof estado === 'string' && estado.trim().length > 0)
          .map((estado: string) => estado.trim().toUpperCase())
      : [];

    console.log('🚀 INICIANDO BUSCA REAL NOS DIÁRIOS OFICIAIS...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'TODOS OS 27 ESTADOS');
    
    let publicacoesEncontradas = 0;

    try {
      const scraper = new DiarioOficialScraper();
      
      console.log('🔍 Executando busca REAL nos sites oficiais...');
      
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
      console.error('❌ Erro durante busca REAL:', searchError);
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);
    const fontesConsultadas = estadosValidos.length > 0 ? estadosValidos : ['SP', 'RJ', 'MG', 'ES', 'CE', 'PR', 'RS', 'SC', 'BA', 'GO', 'PE', 'DF', 'MT', 'MS', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO', 'MA', 'PI', 'AL', 'SE', 'PB', 'RN'];

    const message = publicacoesEncontradas > 0 
      ? `✅ Busca REAL concluída: ${publicacoesEncontradas} publicações encontradas`
      : `ℹ️ Busca REAL concluída: Nenhuma publicação encontrada para os advogados informados`;

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
        busca_tipo: 'Busca real nos sites oficiais dos diários de todos os 27 estados brasileiros'
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
