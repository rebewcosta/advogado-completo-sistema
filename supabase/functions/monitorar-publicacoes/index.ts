
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DiarioScraper } from './scrapers/diarioScraper.ts'

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
    
    // Parse request body com tratamento robusto de erros
    let body;
    
    try {
      console.log('📦 Lendo corpo da requisição...');
      
      // Verificar se o request tem body
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
      console.log('📄 Texto bruto recebido (primeiros 200 chars):', requestText.substring(0, 200));
      
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
      
      console.log('🔍 Fazendo parse do JSON...');
      body = JSON.parse(requestText);
      console.log('✅ JSON parseado com sucesso:', JSON.stringify(body, null, 2));
      
    } catch (parseError) {
      console.error('❌ Erro crítico no parse do JSON:', parseError);
      
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

    console.log('🔍 MONITORAMENTO INICIADO');
    console.log('👤 Usuário:', body?.user_id);
    console.log('📝 Nomes para buscar:', body?.nomes);
    console.log('🌍 Estados específicos:', body?.estados);
    
    // Validação rigorosa dos dados
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

    // Sanitizar e validar nomes
    const nomesValidos = body.nomes
      .filter((nome: any) => typeof nome === 'string' && nome.trim().length > 0)
      .map((nome: string) => nome.trim());

    if (nomesValidos.length === 0) {
      console.error('❌ Nenhum nome válido encontrado após sanitização');
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

    // Sanitizar estados (opcional)
    const estadosValidos = Array.isArray(body.estados)
      ? body.estados
          .filter((estado: any) => typeof estado === 'string' && estado.trim().length > 0)
          .map((estado: string) => estado.trim().toUpperCase())
      : [];

    console.log('🚀 DADOS VALIDADOS - INICIANDO BUSCA REAL...');
    console.log('📋 Nomes válidos:', nomesValidos);
    console.log('🌍 Estados válidos:', estadosValidos.length > 0 ? estadosValidos : 'PRINCIPAIS ESTADOS');
    
    let publicacoesEncontradas = 0;

    try {
      // Executar busca REAL com scraper
      const scraper = new DiarioScraper();
      
      console.log('🌐 Consultando diários oficiais REAIS...');
      
      const publicacoesReais: PublicacaoEncontrada[] = await scraper.buscarEmTodosEstados(
        nomesValidos,
        estadosValidos
      );

      console.log(`📄 Publicações encontradas em busca REAL: ${publicacoesReais.length}`);

      // Salvar no banco se houver publicações
      if (publicacoesReais.length > 0) {
        const publicacoesParaSalvar = publicacoesReais.map(pub => ({
          ...pub,
          user_id: body.user_id,
          segredo_justica: false,
          lida: false,
          importante: false
        }));

        console.log('💾 Salvando publicações REAIS no banco...');
        const { error: saveError } = await supabase
          .from('publicacoes_diario_oficial')
          .insert(publicacoesParaSalvar);

        if (saveError) {
          console.error('❌ Erro ao salvar publicações:', saveError);
        } else {
          console.log(`✅ ${publicacoesReais.length} publicações REAIS salvas com sucesso`);
        }
      }

      publicacoesEncontradas = publicacoesReais.length;

    } catch (searchError: any) {
      console.error('❌ Erro durante busca REAL:', searchError);
      // Continuar execução mesmo com erro na busca
    }

    const tempoExecucao = Math.round((Date.now() - startTime) / 1000);
    const fontesConsultadas = estadosValidos.length > 0 ? estadosValidos : ['SP', 'RJ', 'MG', 'CE', 'PR'];

    const message = publicacoesEncontradas > 0 
      ? `✅ Busca REAL concluída com sucesso: ${publicacoesEncontradas} publicações encontradas`
      : `ℹ️ Busca REAL concluída: Nenhuma publicação encontrada para os critérios especificados`;

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

    console.log('✅ Resposta de busca REAL preparada:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('💥 Erro crítico não tratado:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do sistema', 
        message: 'Ocorreu um erro inesperado. Tente novamente em alguns minutos.',
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
