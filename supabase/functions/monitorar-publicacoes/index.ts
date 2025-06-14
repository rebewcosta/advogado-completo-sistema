
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DJeService } from './services/djeService.ts'
import { JusbrassilService } from './services/jusbrasil.ts'
import { RealScraperService } from './services/realScraper.ts'

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

    console.log('🚀 INICIANDO BUSCA REAL MULTI-FONTE...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'PRINCIPAIS ESTADOS');
    
    const todasPublicacoes: PublicacaoEncontrada[] = [];

    try {
      // 1. Buscar no DJe (Diário da Justiça Eletrônico)
      console.log('🏛️ Iniciando busca no DJe...');
      const djeService = new DJeService();
      const publicacoesDJe = await djeService.buscarPublicacoesDJe(nomesValidos, estadosValidos);
      todasPublicacoes.push(...publicacoesDJe);
      
      // 2. Buscar no Jusbrasil (fonte complementar)
      console.log('⚖️ Iniciando busca no Jusbrasil...');
      const jusbrassilService = new JusbrassilService();
      const publicacoesJusbrasil = await jusbrassilService.buscarPublicacoes(nomesValidos, estadosValidos);
      todasPublicacoes.push(...publicacoesJusbrasil);
      
      // 3. Scraping real dos sites oficiais
      console.log('🌐 Iniciando scraping dos sites oficiais...');
      const realScraperService = new RealScraperService();
      const publicacoesScraping = await realScraperService.buscarPublicacoes(nomesValidos, estadosValidos);
      todasPublicacoes.push(...publicacoesScraping);

      console.log(`📄 Total de publicações encontradas: ${todasPublicacoes.length}`);

      // Remover duplicatas baseado no conteúdo
      const publicacoesUnicas = this.removerDuplicatas(todasPublicacoes);
      console.log(`📄 Publicações únicas após remoção de duplicatas: ${publicacoesUnicas.length}`);

      if (publicacoesUnicas.length > 0) {
        const publicacoesParaSalvar = publicacoesUnicas.map(pub => ({
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
          console.log(`✅ ${publicacoesUnicas.length} publicações salvas com sucesso`);
        }
      }

    } catch (searchError: any) {
      console.error('❌ Erro durante busca REAL:', searchError);
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);
    const fontesConsultadas = ['DJe', 'Jusbrasil', 'Sites Oficiais'];

    const message = todasPublicacoes.length > 0 
      ? `✅ Busca REAL concluída: ${todasPublicacoes.length} publicações encontradas`
      : `ℹ️ Busca REAL concluída: Nenhuma publicação encontrada para os advogados informados`;

    const response = {
      success: true,
      publicacoes_encontradas: todasPublicacoes.length,
      fontes_consultadas: fontesConsultadas.length,
      tempo_execucao: tempoExecucao,
      message: message,
      status_integracao: 'INTEGRADO_REAL_MULTI_FONTE',
      detalhes_busca: {
        nomes_buscados: nomesValidos,
        estados_consultados: estadosValidos.length > 0 ? estadosValidos : ['SP', 'RJ', 'MG', 'RS', 'PR'],
        fontes_utilizadas: fontesConsultadas,
        busca_tipo: 'Busca real em múltiplas fontes: DJe, Jusbrasil e Sites Oficiais'
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

function removerDuplicatas(publicacoes: PublicacaoEncontrada[]): PublicacaoEncontrada[] {
  const vistas = new Set<string>();
  const unicas: PublicacaoEncontrada[] = [];
  
  for (const pub of publicacoes) {
    // Criar chave baseada no conteúdo principal
    const chave = `${pub.nome_advogado}-${pub.estado}-${pub.conteudo_publicacao.substring(0, 200)}`;
    
    if (!vistas.has(chave)) {
      vistas.add(chave);
      unicas.push(pub);
    }
  }
  
  return unicas;
}
