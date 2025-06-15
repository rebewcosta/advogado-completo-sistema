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

// Mapeamento COMPLETO de todos os tribunais conforme manual CNJ
const TRIBUNAL_INDICES = {
  // Tribunais de Justiça Estaduais
  'TJAC': 'api_publica_tjac',
  'TJAL': 'api_publica_tjal',
  'TJAP': 'api_publica_tjap',
  'TJAM': 'api_publica_tjam',
  'TJBA': 'api_publica_tjba',
  'TJCE': 'api_publica_tjce',
  'TJDF': 'api_publica_tjdft',
  'TJES': 'api_publica_tjes',
  'TJGO': 'api_publica_tjgo',
  'TJMA': 'api_publica_tjma',
  'TJMT': 'api_publica_tjmt',
  'TJMS': 'api_publica_tjms',
  'TJMG': 'api_publica_tjmg',
  'TJPA': 'api_publica_tjpa',
  'TJPB': 'api_publica_tjpb',
  'TJPR': 'api_publica_tjpr',
  'TJPE': 'api_publica_tjpe',
  'TJPI': 'api_publica_tjpi',
  'TJRJ': 'api_publica_tjrj',
  'TJRN': 'api_publica_tjrn',
  'TJRS': 'api_publica_tjrs',
  'TJRO': 'api_publica_tjro',
  'TJRR': 'api_publica_tjrr',
  'TJSC': 'api_publica_tjsc',
  'TJSP': 'api_publica_tjsp',
  'TJSE': 'api_publica_tjse',
  'TJTO': 'api_publica_tjto',
  
  // Tribunais Regionais do Trabalho
  'TRT1': 'api_publica_trt1',
  'TRT2': 'api_publica_trt2',
  'TRT3': 'api_publica_trt3',
  'TRT4': 'api_publica_trt4',
  'TRT5': 'api_publica_trt5',
  'TRT6': 'api_publica_trt6',
  'TRT7': 'api_publica_trt7',
  'TRT8': 'api_publica_trt8',
  'TRT9': 'api_publica_trt9',
  'TRT10': 'api_publica_trt10',
  'TRT11': 'api_publica_trt11',
  'TRT12': 'api_publica_trt12',
  'TRT13': 'api_publica_trt13',
  'TRT14': 'api_publica_trt14',
  'TRT15': 'api_publica_trt15',
  'TRT16': 'api_publica_trt16',
  'TRT17': 'api_publica_trt17',
  'TRT18': 'api_publica_trt18',
  'TRT19': 'api_publica_trt19',
  'TRT20': 'api_publica_trt20',
  'TRT21': 'api_publica_trt21',
  'TRT22': 'api_publica_trt22',
  'TRT23': 'api_publica_trt23',
  'TRT24': 'api_publica_trt24',
  
  // Tribunais Regionais Federais
  'TRF1': 'api_publica_trf1',
  'TRF2': 'api_publica_trf2',
  'TRF3': 'api_publica_trf3',
  'TRF4': 'api_publica_trf4',
  'TRF5': 'api_publica_trf5',
  'TRF6': 'api_publica_trf6',
  
  // Tribunais Superiores
  'TST': 'api_publica_tst',
  'STJ': 'api_publica_stj',
  'STF': 'api_publica_stf',
  'TSE': 'api_publica_tse',
  'STM': 'api_publica_stm',
  
  // Tribunais Regionais Eleitorais
  'TREAC': 'api_publica_treac',
  'TREAL': 'api_publica_treal',
  'TREAP': 'api_publica_treap',
  'TREAM': 'api_publica_tream',
  'TREBA': 'api_publica_treba',
  'TRECE': 'api_publica_trece',
  'TREDF': 'api_publica_tredf',
  'TREES': 'api_publica_trees',
  'TREGO': 'api_publica_trego',
  'TREMA': 'api_publica_trema',
  'TREMT': 'api_publica_tremt',
  'TREMS': 'api_publica_trems',
  'TREMG': 'api_publica_tremg',
  'TREPA': 'api_publica_trepa',
  'TREPB': 'api_publica_trepb',
  'TREPR': 'api_publica_trepr',
  'TREPE': 'api_publica_trepe',
  'TREPI': 'api_publica_trepi',
  'TRERJ': 'api_publica_trerj',
  'TRERN': 'api_publica_trern',
  'TRERS': 'api_publica_trers',
  'TRERO': 'api_publica_trero',
  'TRERR': 'api_publica_trerr',
  'TRESC': 'api_publica_tresc',
  'TRESP': 'api_publica_tresp',
  'TRESE': 'api_publica_trese',
  'TRETO': 'api_publica_treto',
  
  // Tribunais de Justiça Militar
  'TJMSP': 'api_publica_tjmsp',
  'TJMRJ': 'api_publica_tjmrj',
  'TJMRS': 'api_publica_tjmrs',
  'TJMMG': 'api_publica_tjmmg',
  
  // Tribunal Superior do Trabalho Militar
  'TSTM': 'api_publica_tstm',
  
  // Conselho Superior da Justiça do Trabalho
  'CSJT': 'api_publica_csjt',
  
  // Conselho Nacional de Justiça
  'CNJ': 'api_publica_cnj'
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
    let tribunaisParaBuscar: string[];
    
    if (tribunal && tribunal !== 'todos' && TRIBUNAL_INDICES[tribunal as keyof typeof TRIBUNAL_INDICES]) {
      tribunaisParaBuscar = [tribunal];
    } else {
      // Se não especificou tribunal, buscar nos principais
      tribunaisParaBuscar = ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR'];
    }

    console.log('Tribunais para buscar:', tribunaisParaBuscar);

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
        
        console.log(`✅ ${tribunalCode}: ${resultado ? (Array.isArray(resultado) ? resultado.length : 1) : 0} resultado(s)`);
        
      } catch (error) {
        console.error(`❌ Erro no tribunal ${tribunalCode}:`, error.message);
        // Continua para próximo tribunal
      }
    }

    if (resultados.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: `Nenhum processo encontrado na base oficial do CNJ DataJud para "${termo}".`,
          tribunais_consultados: tribunaisParaBuscar,
          detalhes: 'Busca realizada conforme solicitado'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ TOTAL ENCONTRADO: ${resultados.length} processos em ${tribunaisParaBuscar.length} tribunais`);
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
    console.error('❌ ERRO GERAL na consulta DataJud:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        debug: 'Erro na função de consulta DataJud CNJ'
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
    // Busca por número de processo
    const numeroLimpo = termo.replace(/[.\-]/g, '');
    query = {
      query: {
        term: {
          "numeroProcesso": numeroLimpo
        }
      },
      size: 5
    };
  } else if (tipo === 'documento') {
    // Busca por CPF/CNPJ
    const documentoLimpo = termo.replace(/[.\-\/]/g, '');
    query = {
      query: {
        multi_match: {
          query: documentoLimpo,
          fields: [
            "partes.pessoa.cpfCnpj",
            "partes.advogados.cpf"
          ],
          type: "phrase"
        }
      },
      size: 20
    };
  } else if (tipo === 'nome') {
    // Busca por nome - estratégia simplificada e direta
    query = {
      query: {
        multi_match: {
          query: termo,
          fields: [
            "partes.pessoa.nome",
            "partes.advogados.nome"
          ],
          type: "phrase_prefix",
          fuzziness: "AUTO"
        }
      },
      size: 20
    };
  }

  console.log(`📡 URL: ${url}`);
  console.log(`📋 Query ${tipo} para "${termo}":`, JSON.stringify(query, null, 2));

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
    console.error(`❌ Erro HTTP ${tribunalCode}: ${response.status} - ${errorText.substring(0, 500)}`);
    throw new Error(`HTTP ${response.status} em ${tribunalCode}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log(`📦 Resposta ${tribunalCode} - Total hits: ${data.hits?.total?.value || 0}`);
  
  if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
    console.log(`✅ ${data.hits.hits.length} processo(s) encontrado(s) em ${tribunalCode}`);
    
    // Log dos primeiros resultados para debug
    data.hits.hits.slice(0, 2).forEach((hit: any, index: number) => {
      console.log(`🔍 Resultado ${index + 1} em ${tribunalCode}:`, {
        numeroProcesso: hit._source?.numeroProcesso,
        score: hit._score,
        primeiraParteNome: hit._source?.partes?.[0]?.pessoa?.nome || 'N/A'
      });
    });
    
    return data.hits.hits.map((hit: any) => formatarProcesso(hit._source, tribunalCode, hit._score));
  }
  
  console.log(`⚠️ Nenhum processo encontrado em ${tribunalCode}`);
  return null;
}

function formatarProcesso(processo: any, tribunal: string, score?: number) {
  console.log(`🔧 Formatando processo ${processo.numeroProcesso} do ${tribunal} (score: ${score})`);
  
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
    partes: extrairPartes(processo.partes),
    advogados: extrairAdvogados(processo.partes),
    movimentacoes: formatarMovimentacoes(processo.movimentos),
    fonte_dados: 'CNJ DataJud API Oficial',
    nivel_sigilo: processo.nivelSigilo || 0,
    grau: processo.grau || 'Não informado',
    relevancia_score: score
  };
}

function extrairPartes(partes: any[]): any[] {
  if (!partes || !Array.isArray(partes)) {
    return [];
  }
  
  return partes.map((parte: any) => ({
    nome: parte.pessoa?.nome || 'Nome não informado',
    tipo: parte.polo || 'Não informado',
    cpf_cnpj: parte.pessoa?.cpfCnpj || 'Não informado'
  }));
}

function extrairAdvogados(partes: any[]): any[] {
  if (!partes || !Array.isArray(partes)) {
    return [];
  }
  
  const advogados: any[] = [];
  partes.forEach((parte: any) => {
    if (parte.advogados && Array.isArray(parte.advogados)) {
      parte.advogados.forEach((adv: any) => {
        advogados.push({
          nome: adv.nome || 'Nome não informado',
          oab: adv.numeroOAB || 'Não informado',
          cpf: adv.cpf || 'Não informado'
        });
      });
    }
  });
  
  return advogados;
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
