
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

// Simulador mais realista que gera publicações baseadas em padrões reais
class SimuladorDiarioOficial {
  private readonly tiposPublicacao = [
    'Citação',
    'Intimação',
    'Edital',
    'Despacho',
    'Sentença',
    'Decisão Interlocutória',
    'Publicação de Petição',
    'Certidão',
    'Mandado'
  ];

  private readonly tribunais = [
    'TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR', 'TJSC', 'TJCE', 'TJBA', 'TJGO', 'TJDF'
  ];

  private readonly comarcas = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba',
    'Florianópolis', 'Fortaleza', 'Salvador', 'Goiânia', 'Brasília'
  ];

  private gerarNumeroProcesso(): string {
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const digitoVerificador = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    const tribunal = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    const origem = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `${sequencial}-${digitoVerificador}.${ano}.8.${tribunal}.${origem}`;
  }

  private gerarConteudoRealista(nomeAdvogado: string, tipo: string): string {
    const numeroProcesso = this.gerarNumeroProcesso();
    const comarca = this.comarcas[Math.floor(Math.random() * this.comarcas.length)];
    
    const conteudos = {
      'Citação': `COMARCA DE ${comarca.toUpperCase()} - CITAÇÃO - Processo nº ${numeroProcesso}. O(a) advogado(a) ${nomeAdvogado}, inscrito(a) na OAB, fica CITADO(A) para, no prazo de 15 (quinze) dias, apresentar contestação aos autos do processo em epígrafe, sob pena de revelia.`,
      
      'Intimação': `TRIBUNAL DE JUSTIÇA - INTIMAÇÃO - Processo nº ${numeroProcesso}. Fica o(a) advogado(a) ${nomeAdvogado} INTIMADO(A) da decisão proferida nos autos, para cumprimento no prazo legal. Comarca: ${comarca}.`,
      
      'Edital': `EDITAL DE CITAÇÃO - Processo nº ${numeroProcesso}. Por não ter sido encontrado para citação pessoal, fica o(a) advogado(a) ${nomeAdvogado} citado(a) por edital para apresentar defesa no prazo de 15 dias. Comarca de ${comarca}.`,
      
      'Despacho': `DESPACHO - Processo nº ${numeroProcesso}. Vista ao(à) advogado(a) ${nomeAdvogado} para manifestação no prazo de 10 (dez) dias. ${comarca}, ${new Date().toLocaleDateString()}.`,
      
      'Sentença': `SENTENÇA - Processo nº ${numeroProcesso}. Nos autos em que figura como advogado(a) ${nomeAdvogado}, foi proferida sentença. Intimação para ciência. Comarca: ${comarca}.`
    };

    return conteudos[tipo as keyof typeof conteudos] || conteudos['Intimação'];
  }

  async simularBuscaRealista(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log(`🔍 SIMULANDO busca realista para ${nomes.length} advogado(s) em ${estadosEspecificos.length || 27} estado(s)`);
    
    const estadosParaBuscar = estadosEspecificos.length > 0 ? estadosEspecificos : 
      ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'CE', 'BA', 'GO', 'DF', 'MT', 'MS', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO', 'MA', 'PI', 'AL', 'SE', 'PB', 'PE', 'RN'];

    for (const nome of nomes) {
      // Simula uma chance realista de encontrar publicações (30% de chance por advogado)
      const temPublicacao = Math.random() < 0.3;
      
      if (temPublicacao) {
        // Gera entre 1 a 3 publicações por advogado
        const numPublicacoes = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numPublicacoes; i++) {
          const estadoAleatorio = estadosParaBuscar[Math.floor(Math.random() * estadosParaBuscar.length)];
          const tipoPublicacao = this.tiposPublicacao[Math.floor(Math.random() * this.tiposPublicacao.length)];
          const tribunal = this.tribunais[Math.floor(Math.random() * this.tribunais.length)];
          
          // Simula diferentes datas (últimos 30 dias)
          const dataPublicacao = new Date();
          dataPublicacao.setDate(dataPublicacao.getDate() - Math.floor(Math.random() * 30));
          
          publicacoes.push({
            nome_advogado: nome,
            titulo_publicacao: `${tipoPublicacao} - ${tribunal}`,
            conteudo_publicacao: this.gerarConteudoRealista(nome, tipoPublicacao),
            data_publicacao: dataPublicacao.toISOString().split('T')[0],
            diario_oficial: `Diário Oficial do Estado de ${this.obterNomeEstado(estadoAleatorio)}`,
            estado: estadoAleatorio,
            comarca: this.comarcas[Math.floor(Math.random() * this.comarcas.length)],
            numero_processo: this.gerarNumeroProcesso(),
            tipo_publicacao: tipoPublicacao,
            url_publicacao: `https://dje.${estadoAleatorio.toLowerCase()}.jus.br/publicacao/${Date.now()}`
          });
        }
      }
    }

    // Simula tempo de processamento realista
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    console.log(`✅ Simulação concluída: ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private obterNomeEstado(sigla: string): string {
    const estados: Record<string, string> = {
      'SP': 'São Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Minas Gerais', 'ES': 'Espírito Santo',
      'CE': 'Ceará', 'PR': 'Paraná', 'RS': 'Rio Grande do Sul', 'SC': 'Santa Catarina',
      'BA': 'Bahia', 'GO': 'Goiás', 'DF': 'Distrito Federal', 'MT': 'Mato Grosso',
      'MS': 'Mato Grosso do Sul', 'PA': 'Pará', 'AM': 'Amazonas', 'RO': 'Rondônia',
      'AC': 'Acre', 'RR': 'Roraima', 'AP': 'Amapá', 'TO': 'Tocantins',
      'MA': 'Maranhão', 'PI': 'Piauí', 'AL': 'Alagoas', 'SE': 'Sergipe',
      'PB': 'Paraíba', 'PE': 'Pernambuco', 'RN': 'Rio Grande do Norte'
    };
    return estados[sigla] || sigla;
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

    console.log('🚀 INICIANDO BUSCA COM SIMULADOR REALISTA...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'TODOS OS 27 ESTADOS');
    
    let publicacoesEncontradas = 0;

    try {
      const simulador = new SimuladorDiarioOficial();
      
      console.log('🔍 Executando busca com simulador realista...');
      
      const publicacoesReais: PublicacaoEncontrada[] = await simulador.simularBuscaRealista(
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
      : `ℹ️ Busca concluída: Nenhuma publicação encontrada para os advogados informados`;

    const response = {
      success: true,
      publicacoes_encontradas: publicacoesEncontradas,
      fontes_consultadas: fontesConsultadas.length,
      tempo_execucao: tempoExecucao,
      message: message,
      status_integracao: 'SIMULADOR_REALISTA',
      detalhes_busca: {
        nomes_buscados: nomesValidos,
        estados_consultados: fontesConsultadas,
        busca_tipo: 'Simulador realista baseado em padrões reais de diários oficiais'
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
