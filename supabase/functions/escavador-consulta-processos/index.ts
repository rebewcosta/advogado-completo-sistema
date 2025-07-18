import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ESCAVADOR] Iniciando consulta de processos');

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[ESCAVADOR] Token de autorização não fornecido');
      return new Response(JSON.stringify({ error: 'Token de autorização necessário' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[ESCAVADOR] Usuário não autenticado:', authError);
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ESCAVADOR] Usuário autenticado: ${user.id}`);

    // Obter OAB do body da requisição
    const { oab } = await req.json();
    
    if (!oab) {
      console.error('[ESCAVADOR] OAB não fornecida na requisição');
      return new Response(JSON.stringify({ 
        error: 'OAB é obrigatória para a consulta' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Separar número e estado da OAB (formato: numero/estado)
    const oabParts = oab.split('/');
    if (oabParts.length !== 2) {
      console.error('[ESCAVADOR] Formato de OAB inválido. Use: numero/estado');
      return new Response(JSON.stringify({ 
        error: 'Formato de OAB inválido. Use o formato: numero/estado (ex: 123456/SP)' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [oab_numero, oab_estado] = oabParts;
    console.log(`[ESCAVADOR] OAB fornecida: ${oab_numero}/${oab_estado}`);

    // Obter token do Escavador
    const escavadorToken = Deno.env.get('ESCAVADOR_TOKEN');
    if (!escavadorToken) {
      console.error('[ESCAVADOR] Token do Escavador não configurado');
      return new Response(JSON.stringify({ error: 'Token do Escavador não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Consultar API do Escavador com limite maior para maximizar valor do token
    console.log(`[ESCAVADOR] Consultando processos para OAB: ${oab_numero}/${oab_estado}`);
    
    const escavadorUrl = `https://api.escavador.com/api/v2/advogado/processos?oab_numero=${oab_numero}&oab_estado=${oab_estado}&limit=100&include_movements=true&include_parties=true&include_financial=true`;
    const escavadorResponse = await fetch(escavadorUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${escavadorToken}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!escavadorResponse.ok) {
      const errorText = await escavadorResponse.text();
      console.error('[ESCAVADOR] Erro na API do Escavador:', escavadorResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Erro na consulta Escavador: ${escavadorResponse.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const escavadorData = await escavadorResponse.json();
    console.log(`[ESCAVADOR] Processos encontrados: ${escavadorData.items?.length || 0}`);

    // Função para mapear status da API do Escavador para status válidos do sistema
    const mapearStatus = (statusApi: string): string => {
      if (!statusApi) return 'Em andamento';
      
      const statusLower = statusApi.toLowerCase();
      if (statusLower.includes('concluí') || statusLower.includes('encerr') || statusLower.includes('final') || statusLower.includes('arquiv')) {
        return 'Concluído';
      }
      if (statusLower.includes('suspend') || statusLower.includes('parad') || statusLower.includes('sobrest')) {
        return 'Suspenso';
      }
      // Default para processos em tramitação
      return 'Em andamento';
    };

    // Processar dados enriquecidos do Escavador
    const processosEscavador = escavadorData.items || [];
    const processosNormalizados = [];
    const movimentacoesToInsert = [];
    const partesToInsert = [];
    const financeirosToInsert = [];

    for (const processo of processosEscavador) {
      console.log(`[ESCAVADOR] Mapeando processo enriquecido:`, {
        numero_cnj: processo.numero_cnj,
        classe: processo.capa?.classe,
        status_predito: processo.status_predito,
        titulo_polo_ativo: processo.titulo_polo_ativo,
        unidade_origem: processo.unidade_origem?.nome,
        valor_causa: processo.valor_causa,
        movimentacoes: processo.movimentos?.length || 0,
        partes: processo.partes?.length || 0
      });
      
      const processoNormalizado = {
        numero_processo: processo.numero_cnj || '',
        tipo_processo: processo.capa?.classe || 'Processo Judicial',
        status_processo: mapearStatus(processo.status_predito),
        vara_tribunal: processo.unidade_origem?.nome || processo.orgao_julgador || '',
        proximo_prazo: null,
        cliente_id: null,
        nome_cliente_text: processo.titulo_polo_ativo || null,
        // Campos enriquecidos
        assunto_processo: processo.capa?.assunto || null,
        classe_judicial: processo.capa?.classe || null,
        instancia: processo.grau || null,
        data_distribuicao: processo.data_ajuizamento ? new Date(processo.data_ajuizamento).toISOString().split('T')[0] : null,
        segredo_justica: processo.segredo_justica || false,
        valor_causa: processo.valor_causa || null,
        situacao_processo: processo.situacao || null,
        origem_dados: 'Escavador',
        escavador_id: processo.id?.toString() || null,
        ultima_atualizacao_escavador: new Date().toISOString()
      };
      
      processosNormalizados.push(processoNormalizado);

      // Extrair movimentações
      if (processo.movimentos && Array.isArray(processo.movimentos)) {
        for (const movimento of processo.movimentos.slice(0, 20)) { // Limitar a 20 movimentos mais recentes
          movimentacoesToInsert.push({
            user_id: user.id,
            numero_processo: processo.numero_cnj || '',
            data_movimentacao: movimento.data ? new Date(movimento.data).toISOString().split('T')[0] : null,
            tipo_movimentacao: movimento.tipo || null,
            descricao_movimentacao: movimento.descricao || movimento.texto || null,
            orgao: movimento.orgao || null,
            magistrado: movimento.magistrado || null
          });
        }
      }

      // Extrair partes do processo
      if (processo.partes && Array.isArray(processo.partes)) {
        for (const parte of processo.partes) {
          partesToInsert.push({
            user_id: user.id,
            numero_processo: processo.numero_cnj || '',
            nome_parte: parte.nome || '',
            tipo_parte: parte.polo || null, // 'Polo Ativo', 'Polo Passivo'
            documento: parte.documento || null,
            qualificacao: parte.qualificacao || null
          });
        }
      }

      // Extrair informações financeiras
      if (processo.valor_causa || processo.honorarios) {
        financeirosToInsert.push({
          user_id: user.id,
          numero_processo: processo.numero_cnj || '',
          valor_causa: processo.valor_causa || null,
          honorarios_contratuais: processo.honorarios?.contratuais || null,
          honorarios_sucumbenciais: processo.honorarios?.sucumbenciais || null,
          custas_processuais: processo.custas || null
        });
      }
    }

    // Verificar processos existentes
    const numerosProcessos = processosNormalizados.map(p => p.numero_processo).filter(Boolean);
    const { data: processosExistentes } = await supabase
      .from('processos')
      .select('numero_processo')
      .eq('user_id', user.id)
      .in('numero_processo', numerosProcessos);

    const numerosExistentes = new Set(processosExistentes?.map(p => p.numero_processo) || []);
    const processosNovos = processosNormalizados.filter(p => 
      p.numero_processo && !numerosExistentes.has(p.numero_processo)
    );

    console.log(`[ESCAVADOR] Processos novos para importar: ${processosNovos.length}`);
    console.log(`[ESCAVADOR] Processos já existentes: ${numerosExistentes.size}`);
    console.log(`[ESCAVADOR] Dados enriquecidos coletados:`, {
      movimentacoes: movimentacoesToInsert.length,
      partes: partesToInsert.length,
      financeiros: financeirosToInsert.length
    });

    // Retornar resultado da consulta com dados enriquecidos
    return new Response(JSON.stringify({
      success: true,
      oab: oab,
      totalEncontrados: processosEscavador.length,
      processosNovos: processosNovos.length,
      processosExistentes: numerosExistentes.size,
      processos: processosNovos,
      // Dados enriquecidos que serão importados junto com os processos
      dadosEnriquecidos: {
        movimentacoes: movimentacoesToInsert.filter(m => 
          processosNovos.some(p => p.numero_processo === m.numero_processo)
        ),
        partes: partesToInsert.filter(p => 
          processosNovos.some(proc => proc.numero_processo === p.numero_processo)
        ),
        financeiros: financeirosToInsert.filter(f => 
          processosNovos.some(proc => proc.numero_processo === f.numero_processo)
        )
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ESCAVADOR] Erro geral:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno no servidor', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});