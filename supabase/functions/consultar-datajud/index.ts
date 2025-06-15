
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API Key oficial do CNJ
const CNJ_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

interface ConsultaRequest {
  tipo: 'numero' | 'nome' | 'documento';
  termo: string;
  tribunal?: string;
  useCache?: boolean;
}

// Mapeamento simplificado dos principais tribunais
const TRIBUNAL_INDICES = {
  'TJSP': 'api_publica_tjsp',
  'TJRJ': 'api_publica_tjrj', 
  'TJMG': 'api_publica_tjmg',
  'TJRS': 'api_publica_tjrs',
  'TJPR': 'api_publica_tjpr',
  'TJSC': 'api_publica_tjsc',
  'TJBA': 'api_publica_tjba',
  'TJGO': 'api_publica_tjgo',
  'TJDF': 'api_publica_tjdft',
  'TST': 'api_publica_tst',
  'STJ': 'api_publica_stj'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, termo, tribunal }: ConsultaRequest = await req.json();
    
    console.log('=== NOVA CONSULTA DATAJUD CNJ ===');
    console.log('Tipo:', tipo);
    console.log('Termo:', termo);
    console.log('Tribunal:', tribunal);

    // Determinar tribunais para buscar
    const tribunaisParaBuscar = tribunal && TRIBUNAL_INDICES[tribunal as keyof typeof TRIBUNAL_INDICES] 
      ? [tribunal] 
      : ['TJSP', 'TJRJ']; // Apenas os principais para evitar timeout

    const resultados: any[] = [];
    
    for (const tribunalCode of tribunaisParaBuscar) {
      const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
      
      if (!indiceApi) {
        console.log(`Tribunal ${tribunalCode} não mapeado`);
        continue;
      }

      console.log(`🔍 Buscando em ${tribunalCode}...`);
      
      try {
        const resultado = await buscarNoTribunal(tipo, termo, indiceApi, tribunalCode);
        if (resultado && Array.isArray(resultado)) {
          resultados.push(...resultado);
        } else if (resultado) {
          resultados.push(resultado);
        }
        
        // Se encontrou algo e é busca específica por tribunal, pode parar
        if (resultados.length > 0 && tribunal) {
          break;
        }
      } catch (error) {
        console.error(`Erro no tribunal ${tribunalCode}:`, error.message);
        // Continua para próximo tribunal
      }
    }

    if (resultados.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: `Nenhum processo encontrado na base oficial do CNJ DataJud.`,
          tribunais_consultados: tribunaisParaBuscar
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Total encontrado: ${resultados.length} processos`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: resultados,
        tribunais_consultados: tribunaisParaBuscar,
        total_encontrados: resultados.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ ERRO na consulta DataJud:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        debug: 'Erro na função de consulta DataJud'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function buscarNoTribunal(tipo: string, termo: string, indiceApi: string, tribunalCode: string) {
  const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
  
  let query;
  
  if (tipo === 'numero') {
    const numeroLimpo = termo.replace(/[.\-]/g, '');
    query = {
      query: {
        match: {
          numeroProcesso: numeroLimpo
        }
      },
      size: 5
    };
  } else if (tipo === 'documento') {
    const documentoLimpo = termo.replace(/[.\-\/]/g, '');
    query = {
      query: {
        query_string: {
          query: `*${documentoLimpo}*`,
          fields: ["*"]
        }
      },
      size: 10
    };
  } else if (tipo === 'nome') {
    // Query mais simples para nome
    query = {
      query: {
        bool: {
          should: [
            {
              query_string: {
                query: `"${termo}"`,
                fields: ["*"]
              }
            },
            {
              match: {
                "_all": termo
              }
            }
          ]
        }
      },
      size: 10
    };
  }

  console.log(`📡 URL: ${url}`);
  console.log(`📋 Query para ${tipo}:`, JSON.stringify(query, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `APIKey ${CNJ_API_KEY}`
    },
    body: JSON.stringify(query)
  });

  console.log(`📊 Status ${tribunalCode}: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro ${tribunalCode}: ${response.status} - ${errorText}`);
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log(`📦 Resposta ${tribunalCode}:`, JSON.stringify(data, null, 2));
  
  if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
    console.log(`✅ ${data.hits.hits.length} processo(s) encontrado(s) em ${tribunalCode}`);
    
    if (data.hits.hits.length > 1) {
      return data.hits.hits.map((hit: any) => formatarProcesso(hit._source, tribunalCode));
    } else {
      return formatarProcesso(data.hits.hits[0]._source, tribunalCode);
    }
  }
  
  console.log(`⚠️ Nenhum processo encontrado em ${tribunalCode}`);
  return null;
}

function formatarProcesso(processo: any, tribunal: string) {
  console.log('🔧 Formatando processo:', JSON.stringify(processo, null, 2));
  
  return {
    numero_processo: processo.numeroProcesso || 'Não informado',
    classe: processo.classe?.nome || processo.classe || 'Não informado',
    assunto: processo.assuntos && Array.isArray(processo.assuntos) && processo.assuntos.length > 0 
      ? processo.assuntos[0]?.nome || processo.assuntos[0] || 'Não informado'
      : 'Não informado',
    tribunal: tribunal,
    orgao_julgador: processo.orgaoJulgador?.nome || 'Não informado',
    data_ajuizamento: formatarData(processo.dataAjuizamento),
    data_ultima_movimentacao: extrairUltimaMovimentacao(processo.movimentos),
    status: determinarStatus(processo.movimentos),
    valor_causa: processo.valorCausa || 0,
    partes: [],
    advogados: [],
    movimentacoes: formatarMovimentacoes(processo.movimentos),
    fonte_dados: 'CNJ DataJud API Oficial',
    nivel_sigilo: processo.nivelSigilo || 0,
    grau: processo.grau || 'Não informado'
  };
}

function formatarMovimentacoes(movimentos: any[]): any[] {
  if (!movimentos || !Array.isArray(movimentos)) {
    return [];
  }
  
  return movimentos.slice(-10).map((mov: any) => ({
    data: formatarData(mov.dataHora),
    descricao: mov.nome || 'Movimentação não identificada',
    observacao: mov.complementosTabelados?.map((comp: any) => comp.nome).join(', ') || ''
  }));
}

function extrairUltimaMovimentacao(movimentos: any[]): string {
  if (!movimentos || !Array.isArray(movimentos) || movimentos.length === 0) {
    return 'Não informado';
  }
  
  const ultimaMovimentacao = movimentos[movimentos.length - 1];
  return formatarData(ultimaMovimentacao.dataHora);
}

function determinarStatus(movimentos: any[]): string {
  if (!movimentos || !Array.isArray(movimentos) || movimentos.length === 0) {
    return 'Em andamento';
  }
  
  const ultimaMovimentacao = movimentos[movimentos.length - 1];
  const nomeMovimento = ultimaMovimentacao.nome?.toLowerCase() || '';
  
  if (nomeMovimento.includes('arquivamento') || nomeMovimento.includes('baixa')) {
    return 'Arquivado';
  } else if (nomeMovimento.includes('sentença') || nomeMovimento.includes('sentenca')) {
    return 'Sentenciado';
  } else if (nomeMovimento.includes('suspensão') || nomeMovimento.includes('suspensao')) {
    return 'Suspenso';
  }
  
  return 'Em andamento';
}

function formatarData(data: any): string {
  if (!data) return 'Não informado';
  
  try {
    const date = new Date(data);
    if (isNaN(date.getTime())) return 'Não informado';
    return date.toISOString().split('T')[0];
  } catch {
    return 'Não informado';
  }
}
