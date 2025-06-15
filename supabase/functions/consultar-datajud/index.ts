import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API Key oficial do CNJ DataJud
const CNJ_API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

interface ConsultaRequest {
  tipo: 'numero' | 'nome' | 'documento';
  termo: string;
  tribunal?: string;
}

// Mapeamento COMPLETO atualizado conforme documentação oficial CNJ
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
  'STM': 'api_publica_stm'
};

// Cliente Supabase para cache
const supabaseUrl = 'https://lqprcsquknlegzmzdoct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHJjc3F1a25sZWd6bXpkb2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzA4NjAsImV4cCI6MjA2Mjg0Njg2MH0.7L4U-NZvY_WzQy6svqL7xzSUdGVvQ0IkYd-L6PhdYJs';
const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (!termo || !termo.trim()) {
      throw new Error('Termo de busca é obrigatório');
    }

    const termoLimpo = sanitizarTermo(termo.trim(), tipo);
    console.log('Termo sanitizado:', termoLimpo);

    // Verificar cache primeiro
    const cacheKey = `${tipo}_${termoLimpo}_${tribunal || 'todos'}`;
    const resultadoCache = await verificarCache(cacheKey);
    
    if (resultadoCache) {
      console.log('✅ Resultado encontrado no cache');
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: resultadoCache.dados,
          fonte: 'cache',
          cache_timestamp: resultadoCache.timestamp,
          tribunais_consultados: resultadoCache.tribunais || [],
          total_encontrados: resultadoCache.dados?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar tribunais para buscar
    let tribunaisParaBuscar: string[];
    
    if (tribunal === 'principais') {
      tribunaisParaBuscar = ['TJSP', 'TJRJ', 'TJMG'];
    } else if (tribunal && tribunal !== 'todos' && TRIBUNAL_INDICES[tribunal as keyof typeof TRIBUNAL_INDICES]) {
      tribunaisParaBuscar = [tribunal];
    } else {
      // Busca estratégica: principais primeiro
      tribunaisParaBuscar = ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR'];
    }

    console.log('Tribunais para buscar:', tribunaisParaBuscar);

    const resultados: any[] = [];
    const tribunaisConsultados: string[] = [];
    
    // Buscar em paralelo nos tribunais selecionados
    const promisesBusca = tribunaisParaBuscar.map(async (tribunalCode) => {
      const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
      
      if (!indiceApi) {
        console.log(`❌ Tribunal ${tribunalCode} não mapeado`);
        return null;
      }

      console.log(`🔍 Buscando em ${tribunalCode}...`);
      tribunaisConsultados.push(tribunalCode);
      
      try {
        const resultado = await buscarNoTribunalComRetry(tipo, termoLimpo, indiceApi, tribunalCode);
        if (resultado && Array.isArray(resultado) && resultado.length > 0) {
          console.log(`✅ ${tribunalCode}: ${resultado.length} resultado(s)`);
          return resultado;
        } else if (resultado) {
          console.log(`✅ ${tribunalCode}: 1 resultado`);
          return [resultado];
        }
        
        console.log(`⚠️ ${tribunalCode}: Nenhum resultado`);
        return null;
        
      } catch (error) {
        console.error(`❌ Erro no tribunal ${tribunalCode}:`, error.message);
        return null;
      }
    });

    const resultadosBusca = await Promise.allSettled(promisesBusca);
    
    resultadosBusca.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        resultados.push(...result.value);
      }
    });

    // Salvar no cache se houver resultados
    if (resultados.length > 0) {
      await salvarCache(cacheKey, resultados, tribunaisConsultados);
    }

    if (resultados.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: `Nenhum processo encontrado na base oficial do CNJ DataJud para "${termo}".`,
          tribunais_consultados: tribunaisConsultados,
          total_encontrados: 0,
          fonte: 'api_cnj'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Ordenar por relevância e limitar resultados
    const resultadosOrdenados = resultados
      .sort((a, b) => (b.relevancia_score || 0) - (a.relevancia_score || 0))
      .slice(0, 20);

    console.log(`✅ TOTAL ENCONTRADO: ${resultadosOrdenados.length} processos em ${tribunaisConsultados.length} tribunais`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: resultadosOrdenados,
        tribunais_consultados: tribunaisConsultados,
        total_encontrados: resultadosOrdenados.length,
        fonte: 'api_cnj'
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

async function buscarNoTribunalComRetry(tipo: string, termo: string, indiceApi: string, tribunalCode: string, maxRetries = 2) {
  for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
    try {
      console.log(`📡 Tentativa ${tentativa} para ${tribunalCode}`);
      return await buscarNoTribunal(tipo, termo, indiceApi, tribunalCode);
    } catch (error) {
      console.error(`❌ Tentativa ${tentativa} falhou para ${tribunalCode}:`, error.message);
      
      if (tentativa === maxRetries) {
        throw error;
      }
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
    }
  }
}

async function buscarNoTribunal(tipo: string, termo: string, indiceApi: string, tribunalCode: string) {
  const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
  
  let query = construirQuery(tipo, termo);

  console.log(`📡 URL: ${url}`);
  console.log(`📋 Query ${tipo} para "${termo}":`, JSON.stringify(query, null, 2));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `APIKey ${CNJ_API_KEY}`,
        'User-Agent': 'JusGestao/1.0'
      },
      body: JSON.stringify(query),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📊 Status ${tribunalCode}: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${tribunalCode}: ${response.status} - ${errorText.substring(0, 500)}`);
      throw new Error(`HTTP ${response.status} em ${tribunalCode}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`📦 Resposta ${tribunalCode} - Total hits: ${data.hits?.total?.value || 0}`);
    
    if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
      console.log(`✅ ${data.hits.hits.length} processo(s) encontrado(s) em ${tribunalCode}`);
      
      return data.hits.hits.map((hit: any) => formatarProcesso(hit._source, tribunalCode, hit._score));
    }
    
    console.log(`⚠️ Nenhum processo encontrado em ${tribunalCode}`);
    return null;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout na consulta ao ${tribunalCode}`);
    }
    throw error;
  }
}

function construirQuery(tipo: string, termo: string): any {
  if (tipo === 'numero') {
    // Busca por número de processo - conforme documentação CNJ
    const numeroFormatado = formatarNumeroProcesso(termo);
    return {
      query: {
        bool: {
          should: [
            {
              term: {
                "numeroProcesso": {
                  value: numeroFormatado,
                  boost: 3
                }
              }
            },
            {
              term: {
                "numeroProcesso": {
                  value: termo.replace(/\D/g, ''),
                  boost: 2
                }
              }
            },
            {
              wildcard: {
                "numeroProcesso": {
                  value: `*${termo.replace(/\D/g, '').substring(0, 10)}*`,
                  boost: 1
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: 10,
      sort: [
        { "_score": { "order": "desc" } }
      ]
    };
  } else if (tipo === 'documento') {
    // Busca por CPF/CNPJ - conforme documentação CNJ
    const documentoLimpo = termo.replace(/[^\d]/g, '');
    return {
      query: {
        bool: {
          should: [
            {
              term: {
                "partes.pessoa.cpfCnpj": {
                  value: documentoLimpo,
                  boost: 3
                }
              }
            },
            {
              term: {
                "partes.advogados.cpf": {
                  value: documentoLimpo,
                  boost: 2
                }
              }
            },
            {
              multi_match: {
                query: termo,
                fields: [
                  "partes.pessoa.cpfCnpj^2",
                  "partes.advogados.cpf^1"
                ],
                type: "phrase"
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: 15,
      sort: [
        { "_score": { "order": "desc" } }
      ]
    };
  } else if (tipo === 'nome') {
    // Busca por nome - estratégia avançada conforme documentação CNJ
    const nomeNormalizado = normalizarNome(termo);
    return {
      query: {
        bool: {
          should: [
            // Busca exata com boost alto
            {
              multi_match: {
                query: termo,
                fields: [
                  "partes.pessoa.nome^4",
                  "partes.advogados.nome^3"
                ],
                type: "phrase",
                boost: 4
              }
            },
            // Busca normalizada
            {
              multi_match: {
                query: nomeNormalizado,
                fields: [
                  "partes.pessoa.nome^3",
                  "partes.advogados.nome^2"
                ],
                type: "phrase",
                boost: 3
              }
            },
            // Busca com fuzziness para erros de digitação
            {
              multi_match: {
                query: termo,
                fields: [
                  "partes.pessoa.nome^2",
                  "partes.advogados.nome^1.5"
                ],
                type: "best_fields",
                fuzziness: "AUTO",
                boost: 2
              }
            },
            // Busca por termos individuais usando cross_fields
            {
              multi_match: {
                query: termo,
                fields: [
                  "partes.pessoa.nome",
                  "partes.advogados.nome"
                ],
                type: "cross_fields",
                operator: "and",
                boost: 1.5
              }
            },
            // Busca prefix para nomes parciais
            {
              multi_match: {
                query: termo,
                fields: [
                  "partes.pessoa.nome",
                  "partes.advogados.nome"
                ],
                type: "phrase_prefix",
                boost: 1
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: 20,
      sort: [
        { "_score": { "order": "desc" } }
      ]
    };
  }

  // Query padrão se tipo não reconhecido
  return {
    query: {
      multi_match: {
        query: termo,
        fields: ["*"]
      }
    },
    size: 10
  };
}

function sanitizarTermo(termo: string, tipo: string): string {
  switch (tipo) {
    case 'documento':
      return termo.replace(/\D/g, '');
    case 'numero':
      return termo.replace(/[.\-]/g, '');
    case 'nome':
      return termo.replace(/[^\w\sÀ-ÿ]/g, '').trim();
    default:
      return termo.trim();
  }
}

function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function formatarNumeroProcesso(numero: string): string {
  const apenasNumeros = numero.replace(/\D/g, '');
  
  if (apenasNumeros.length === 20) {
    return `${apenasNumeros.substring(0, 7)}-${apenasNumeros.substring(7, 9)}.${apenasNumeros.substring(9, 13)}.${apenasNumeros.substring(13, 14)}.${apenasNumeros.substring(14, 16)}.${apenasNumeros.substring(16, 20)}`;
  }
  
  return apenasNumeros;
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
    relevancia_score: score || 0
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

async function verificarCache(cacheKey: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('processos_cache')
      .select('dados_processo, data_consulta, tribunal')
      .eq('numero_processo', cacheKey)
      .gt('data_expiracao', new Date().toISOString())
      .single();

    if (error) {
      console.log('Cache miss ou erro:', error.message);
      return null;
    }

    console.log('✅ Cache hit para:', cacheKey);
    return {
      dados: data.dados_processo,
      timestamp: data.data_consulta,
      tribunais: data.tribunal ? data.tribunal.split(',') : []
    };
  } catch (error) {
    console.log('Erro ao verificar cache:', error);
    return null;
  }
}

async function salvarCache(cacheKey: string, dados: any[], tribunaisConsultados: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('processos_cache')
      .upsert({
        numero_processo: cacheKey,
        dados_processo: dados,
        tribunal: tribunaisConsultados.join(','),
        data_consulta: new Date().toISOString(),
        data_expiracao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) {
      console.error('Erro ao salvar cache:', error);
    } else {
      console.log('✅ Cache salvo para:', cacheKey);
    }
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
}
