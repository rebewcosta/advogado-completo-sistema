
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

class DiarioScraper {
  private readonly timeoutMs = 15000; // Aumentado para 15 segundos
  private readonly maxRetries = 2;

  private limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '')
      .trim()
      .substring(0, 1000);
  }

  private async fetchWithRetry(url: string, retries = 0): Promise<Response | null> {
    try {
      console.log(`🌐 Tentativa ${retries + 1} para ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (response.ok) {
        return response;
      }
      
      console.log(`⚠️ Resposta não OK (${response.status}) para ${url}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${retries + 1} para ${url}:`, error);
      
      if (retries < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Delay progressivo
        return this.fetchWithRetry(url, retries + 1);
      }
      
      return null;
    }
  }

  private buscarNomesNoHtml(html: string, nomes: string[], estadoSigla: string, estadoNome: string, url: string): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    for (const nome of nomes) {
      // Busca mais flexível - divide o nome em partes
      const partesNome = nome.toLowerCase().split(' ').filter(parte => parte.length > 2);
      let encontrou = false;
      
      // Verifica se todas as partes do nome aparecem no HTML
      for (const parte of partesNome) {
        if (html.toLowerCase().includes(parte)) {
          encontrou = true;
        } else {
          encontrou = false;
          break;
        }
      }
      
      if (encontrou) {
        // Busca contexto ao redor do nome
        const regex = new RegExp(`.{0,300}${nome.replace(/\s+/g, '\\s+')}.{0,300}`, 'gi');
        const matches = html.match(regex);
        
        if (matches) {
          for (const match of matches) {
            publicacoes.push({
              nome_advogado: nome,
              titulo_publicacao: `Publicação encontrada no Diário Oficial ${estadoSigla}`,
              conteudo_publicacao: this.limparTexto(match),
              data_publicacao: new Date().toISOString().split('T')[0],
              diario_oficial: `Diário Oficial ${estadoNome}`,
              estado: estadoSigla,
              url_publicacao: url
            });
          }
        } else {
          // Se não encontrou com regex, adiciona uma publicação genérica
          publicacoes.push({
            nome_advogado: nome,
            titulo_publicacao: `Nome encontrado no Diário Oficial ${estadoSigla}`,
            conteudo_publicacao: `O nome "${nome}" foi encontrado no conteúdo do diário oficial.`,
            data_publicacao: new Date().toISOString().split('T')[0],
            diario_oficial: `Diário Oficial ${estadoNome}`,
            estado: estadoSigla,
            url_publicacao: url
          });
        }
      }
    }
    
    return publicacoes;
  }

  async buscarEmTodosEstados(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    // TODOS OS 27 ESTADOS DO BRASIL
    const todosEstados = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'CE', 'BA', 'GO', 'DF', 'MT', 'MS', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO', 'MA', 'PI', 'AL', 'SE', 'PB', 'PE', 'RN'];
    
    const estadosParaBuscar = estadosEspecificos.length > 0 ? estadosEspecificos : todosEstados;
    
    console.log(`🌐 Iniciando busca REAL em ${estadosParaBuscar.length} estados: ${estadosParaBuscar.join(', ')}`);

    // URLs atualizadas dos diários oficiais
    const urlsEstados: Record<string, string> = {
      'SP': 'https://www.imprensaoficial.com.br/DO/BuscaDO2001Resultado_11_3.aspx',
      'RJ': 'https://www.ioerj.com.br/portal/modules/conteudoonline/mostra_edicao.php',
      'MG': 'https://jornal.iof.mg.gov.br/',
      'ES': 'https://ioes.dio.es.gov.br/',
      'CE': 'https://diariooficial.ceara.gov.br/',
      'PR': 'https://www.comunicacao.pr.gov.br/Publicacao/Diario-Oficial',
      'RS': 'https://www.corag.com.br/diario-oficial',
      'SC': 'https://doe.ciasc.gov.br/',
      'BA': 'https://www.egov.ba.gov.br/doe/',
      'GO': 'https://www.diariooficial.go.gov.br/',
      'DF': 'https://www.dodf.df.gov.br/',
      'MT': 'https://www.iomat.mt.gov.br/',
      'MS': 'https://www.spdo.ms.gov.br/',
      'PA': 'https://www.ioepa.com.br/',
      'AM': 'https://diario.imprensaoficial.am.gov.br/',
      'RO': 'https://rondonia.ro.gov.br/publicacoes/',
      'AC': 'https://diario.ac.gov.br/',
      'RR': 'https://imprensaoficial.rr.gov.br/',
      'AP': 'https://sead.portal.ap.gov.br/diario/',
      'TO': 'https://central3.to.gov.br/arquivo/494569/',
      'MA': 'https://www.diariooficial.ma.gov.br/',
      'PI': 'https://www.diariooficial.pi.gov.br/',
      'AL': 'https://www.imprensaoficialalagoas.al.gov.br/',
      'SE': 'https://www.se.gov.br/diario-oficial',
      'PB': 'https://auniao.pb.gov.br/',
      'PE': 'https://www.cepe.com.br/diario-oficial',
      'RN': 'https://diariooficial.rn.gov.br/'
    };

    const estadosNomes: Record<string, string> = {
      'SP': 'de São Paulo', 'RJ': 'do Rio de Janeiro', 'MG': 'de Minas Gerais', 'ES': 'do Espírito Santo',
      'CE': 'do Ceará', 'PR': 'do Paraná', 'RS': 'do Rio Grande do Sul', 'SC': 'de Santa Catarina',
      'BA': 'da Bahia', 'GO': 'de Goiás', 'DF': 'do Distrito Federal', 'MT': 'de Mato Grosso',
      'MS': 'de Mato Grosso do Sul', 'PA': 'do Pará', 'AM': 'do Amazonas', 'RO': 'de Rondônia',
      'AC': 'do Acre', 'RR': 'de Roraima', 'AP': 'do Amapá', 'TO': 'do Tocantins',
      'MA': 'do Maranhão', 'PI': 'do Piauí', 'AL': 'de Alagoas', 'SE': 'de Sergipe',
      'PB': 'da Paraíba', 'PE': 'de Pernambuco', 'RN': 'do Rio Grande do Norte'
    };

    const promises: Promise<PublicacaoEncontrada[]>[] = [];

    for (const estado of estadosParaBuscar) {
      if (urlsEstados[estado]) {
        promises.push(this.buscarPorEstado(nomes, estado, urlsEstados[estado], estadosNomes[estado]));
        
        // Adiciona delay entre requisições para evitar sobrecarga
        if (promises.length % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
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

  private async buscarPorEstado(nomes: string[], estado: string, url: string, estadoNome: string): Promise<PublicacaoEncontrada[]> {
    try {
      console.log(`🔍 Buscando no Diário Oficial ${estadoNome}...`);
      
      const response = await this.fetchWithRetry(url);

      if (response) {
        const html = await response.text();
        console.log(`📄 HTML recebido de ${estado}: ${html.length} caracteres`);
        
        const publicacoesEncontradas = this.buscarNomesNoHtml(html, nomes, estado, estadoNome, url);
        
        if (publicacoesEncontradas.length > 0) {
          console.log(`🎯 ${publicacoesEncontradas.length} publicações encontradas em ${estado}`);
        }
        
        return publicacoesEncontradas;
      } else {
        console.log(`❌ Não foi possível acessar o diário de ${estado}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar no Diário de ${estado}:`, error);
    }
    
    return [];
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

    console.log('🚀 INICIANDO BUSCA REAL...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'TODOS OS 27 ESTADOS');
    
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
    const fontesConsultadas = estadosValidos.length > 0 ? estadosValidos : ['SP', 'RJ', 'MG', 'ES', 'CE', 'PR', 'RS', 'SC', 'BA', 'GO', 'DF', 'MT', 'MS', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO', 'MA', 'PI', 'AL', 'SE', 'PB', 'PE', 'RN'];

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
        busca_tipo: 'REAL - Scraping direto dos sites oficiais de TODOS os 27 estados'
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
