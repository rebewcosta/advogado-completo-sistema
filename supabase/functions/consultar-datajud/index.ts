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

// Mapeamento completo dos tribunais para os índices da API DataJud
const TRIBUNAL_INDICES = {
  // Tribunais Superiores
  'TST': 'api_publica_tst',
  'TSE': 'api_publica_tse',
  'STJ': 'api_publica_stj',
  'STM': 'api_publica_stm',

  // Justiça Federal
  'TRF1': 'api_publica_trf1',
  'TRF2': 'api_publica_trf2',
  'TRF3': 'api_publica_trf3',
  'TRF4': 'api_publica_trf4',
  'TRF5': 'api_publica_trf5',
  'TRF6': 'api_publica_trf6',

  // Justiça Estadual
  'TJAC': 'api_publica_tjac',
  'TJAL': 'api_publica_tjal',
  'TJAM': 'api_publica_tjam',
  'TJAP': 'api_publica_tjap',
  'TJBA': 'api_publica_tjba',
  'TJCE': 'api_publica_tjce',
  'TJDF': 'api_publica_tjdft',
  'TJDFT': 'api_publica_tjdft',
  'TJES': 'api_publica_tjes',
  'TJGO': 'api_publica_tjgo',
  'TJMA': 'api_publica_tjma',
  'TJMG': 'api_publica_tjmg',
  'TJMS': 'api_publica_tjms',
  'TJMT': 'api_publica_tjmt',
  'TJPA': 'api_publica_tjpa',
  'TJPB': 'api_publica_tjpb',
  'TJPE': 'api_publica_tjpe',
  'TJPI': 'api_publica_tjpi',
  'TJPR': 'api_publica_tjpr',
  'TJRJ': 'api_publica_tjrj',
  'TJRN': 'api_publica_tjrn',
  'TJRO': 'api_publica_tjro',
  'TJRR': 'api_publica_tjrr',
  'TJRS': 'api_publica_tjrs',
  'TJSC': 'api_publica_tjsc',
  'TJSE': 'api_publica_tjse',
  'TJSP': 'api_publica_tjsp',
  'TJTO': 'api_publica_tjto',

  // Justiça do Trabalho  
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

  // Justiça Eleitoral
  'TREAC': 'api_publica_tre-ac',
  'TREAL': 'api_publica_tre-al',
  'TREAM': 'api_publica_tre-am',
  'TREAP': 'api_publica_tre-ap',
  'TREBA': 'api_publica_tre-ba',
  'TRECE': 'api_publica_tre-ce',
  'TREDF': 'api_publica_tre-dft',
  'TREDFT': 'api_publica_tre-dft',
  'TREES': 'api_publica_tre-es',
  'TREGO': 'api_publica_tre-go',
  'TREMA': 'api_publica_tre-ma',
  'TREMG': 'api_publica_tre-mg',
  'TREMS': 'api_publica_tre-ms',
  'TREMT': 'api_publica_tre-mt',
  'TREPA': 'api_publica_tre-pa',
  'TREPB': 'api_publica_tre-pb',
  'TREPE': 'api_publica_tre-pe',
  'TREPI': 'api_publica_tre-pi',
  'TREPR': 'api_publica_tre-pr',
  'TRERJ': 'api_publica_tre-rj',
  'TRERN': 'api_publica_tre-rn',
  'TRERO': 'api_publica_tre-ro',
  'TRERR': 'api_publica_tre-rr',
  'TRERS': 'api_publica_tre-rs',
  'TRESC': 'api_publica_tre-sc',
  'TRESE': 'api_publica_tre-se',
  'TRESP': 'api_publica_tre-sp',
  'TRETO': 'api_publica_tre-to',

  // Justiça Militar
  'TJMMG': 'api_publica_tjmmg',
  'TJMRS': 'api_publica_tjmrs',
  'TJMSP': 'api_publica_tjmsp'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { tipo, termo, tribunal, useCache = true }: ConsultaRequest = await req.json();
    
    console.log('=== CONSULTA DATAJUD CNJ OFICIAL ===');
    console.log('Tipo:', tipo);
    console.log('Termo:', termo);
    console.log('Tribunal:', tribunal);

    console.log('🔍 Consultando API oficial do CNJ DataJud...');

    // Consultar SOMENTE a API oficial do DataJud CNJ
    const dadosReais = await consultarApiDatajudOficial(tipo, termo, tribunal);

    // Se não encontrar dados, retornar resposta de sucesso com dados vazios
    if (!dadosReais || (Array.isArray(dadosReais) && dadosReais.length === 0)) {
      console.log('⚠️ NENHUM PROCESSO ENCONTRADO na API oficial do CNJ');
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: `Nenhum processo encontrado na base oficial do CNJ DataJud para ${tipo === 'documento' ? 'o documento' : tipo === 'nome' ? 'o nome' : 'o número'} informado.`,
          consulta_realizada: true,
          fonte: 'CNJ DataJud API Oficial'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ DADOS REAIS DO CNJ RETORNADOS COM SUCESSO');
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: dadosReais,
        fromCache: false,
        fonte: 'CNJ DataJud API Oficial'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ ERRO CRÍTICO na consulta DataJud CNJ:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro ao consultar a API oficial do CNJ DataJud: ' + error.message,
        consulta_realizada: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function consultarApiDatajudOficial(tipo: string, termo: string, tribunal?: string) {
  try {
    console.log('🌐 Iniciando consulta à API oficial CNJ DataJud');
    
    if (tipo === 'numero') {
      return await consultarPorNumeroOficial(termo, tribunal);
    } else if (tipo === 'nome') {
      return await consultarPorNomeOficial(termo, tribunal);
    } else if (tipo === 'documento') {
      return await consultarPorDocumentoOficial(termo, tribunal);
    }
    
    throw new Error('Tipo de consulta não suportado pela API oficial do CNJ');
  } catch (error) {
    console.error('❌ Erro ao consultar API CNJ DataJud:', error);
    throw error;
  }
}

async function consultarPorNumeroOficial(numeroProcesso: string, tribunal?: string) {
  const tribunalCode = tribunal || extrairTribunalDoNumero(numeroProcesso);
  const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
  
  if (!indiceApi) {
    console.error(`❌ Tribunal ${tribunalCode} não encontrado no mapeamento oficial`);
    throw new Error(`Tribunal ${tribunalCode} não suportado pela API CNJ DataJud`);
  }

  // Remover formatação do número do processo (pontos, traços)
  const numeroLimpo = numeroProcesso.replace(/[.-]/g, '');

  const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
  
  const query = {
    query: {
      match: {
        numeroProcesso: numeroLimpo
      }
    },
    size: 1
  };

  return await executarConsultaElasticsearch(url, query, numeroProcesso);
}

async function consultarPorDocumentoOficial(documento: string, tribunal?: string) {
  console.log('🔍 Implementando busca por CPF/CNPJ na API oficial CNJ DataJud');
  
  // Limpar documento (remover formatação)
  const documentoLimpo = documento.replace(/[.\-\/]/g, '');
  console.log('📄 Documento limpo:', documentoLimpo);
  
  // Se tribunal específico foi informado, buscar apenas nele
  const tribunaisParaBuscar = tribunal ? [tribunal] : ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR']; // Principais tribunais
  
  const resultados: any[] = [];
  
  for (const tribunalCode of tribunaisParaBuscar) {
    const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
    
    if (!indiceApi) {
      console.log(`⚠️ Tribunal ${tribunalCode} não mapeado, pulando...`);
      continue;
    }

    console.log(`🔍 Buscando documento ${documentoLimpo} no tribunal ${tribunalCode}...`);
    
    try {
      const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
      
      // Query mais ampla para buscar documento em qualquer lugar
      const query = {
        query: {
          bool: {
            should: [
              // Busca no conteúdo geral usando wildcard
              { 
                query_string: {
                  query: `*${documentoLimpo}*`,
                  fields: ["*"],
                  default_operator: "OR"
                }
              },
              // Busca em texto livre
              { 
                match: {
                  "_all": documentoLimpo
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        size: 10,
        sort: [
          {
            "@timestamp": {
              "order": "desc"
            }
          }
        ]
      };

      const result = await executarConsultaElasticsearch(url, query, `documento ${documentoLimpo} em ${tribunalCode}`);
      
      if (result && Array.isArray(result)) {
        resultados.push(...result);
      } else if (result) {
        resultados.push(result);
      }
      
      // Se encontrou resultados e tribunal específico foi informado, pode parar
      if (resultados.length > 0 && tribunal) {
        break;
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar no tribunal ${tribunalCode}:`, error);
      // Continua para o próximo tribunal
    }
  }
  
  if (resultados.length === 0) {
    console.log('⚠️ Nenhum processo encontrado para o documento informado');
    return null;
  }
  
  console.log(`✅ Encontrados ${resultados.length} processos para o documento ${documentoLimpo}`);
  return resultados;
}

async function consultarPorNomeOficial(nome: string, tribunal?: string) {
  console.log('🔍 Implementando busca AMPLA por nome na API oficial CNJ DataJud');
  console.log('👤 Nome buscado:', nome);
  
  // Se tribunal específico foi informado, buscar apenas nele
  const tribunaisParaBuscar = tribunal ? [tribunal] : ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR']; // Principais tribunais
  
  const resultados: any[] = [];
  
  for (const tribunalCode of tribunaisParaBuscar) {
    const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
    
    if (!indiceApi) {
      console.log(`⚠️ Tribunal ${tribunalCode} não mapeado, pulando...`);
      continue;
    }

    console.log(`🔍 Buscando nome "${nome}" no tribunal ${tribunalCode}...`);
    
    try {
      const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
      
      // Query muito mais ampla para buscar nome em QUALQUER lugar do documento
      const query = {
        query: {
          bool: {
            should: [
              // 1. Busca em todos os campos usando query_string
              {
                query_string: {
                  query: `"${nome}"`,
                  fields: ["*"],
                  default_operator: "OR"
                }
              },
              // 2. Busca em todos os campos com wildcard
              {
                query_string: {
                  query: `*${nome.split(' ').join('* AND *')}*`,
                  fields: ["*"],
                  default_operator: "AND"
                }
              },
              // 3. Busca match simples em texto geral
              {
                multi_match: {
                  query: nome,
                  fields: ["*"],
                  type: "phrase",
                  slop: 2
                }
              },
              // 4. Busca match com fuzziness para tolerância a erros
              {
                multi_match: {
                  query: nome,
                  fields: ["*"],
                  fuzziness: "AUTO",
                  operator: "and"
                }
              },
              // 5. Busca nas partes do processo (se existir campo específico)
              {
                nested: {
                  path: "partes",
                  query: {
                    bool: {
                      should: [
                        { match_phrase: { "partes.nome": nome } },
                        { match: { "partes.nome": { query: nome, fuzziness: "AUTO" } } }
                      ]
                    }
                  }
                }
              },
              // 6. Busca em movimentações
              {
                nested: {
                  path: "movimentos",
                  query: {
                    bool: {
                      should: [
                        { match_phrase: { "movimentos.nome": nome } },
                        { match_phrase: { "movimentos.complementosTabelados.nome": nome } },
                        { match: { "movimentos.nome": { query: nome, fuzziness: "AUTO" } } }
                      ]
                    }
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        size: 20,
        sort: [
          {
            "@timestamp": {
              "order": "desc"
            }
          }
        ]
      };

      console.log('📋 Query AMPLA para busca por nome:', JSON.stringify(query, null, 2));

      const result = await executarConsultaElasticsearch(url, query, `nome "${nome}" em ${tribunalCode}`);
      
      if (result && Array.isArray(result)) {
        resultados.push(...result);
        console.log(`✅ Encontrados ${result.length} resultados no ${tribunalCode}`);
      } else if (result) {
        resultados.push(result);
        console.log(`✅ Encontrado 1 resultado no ${tribunalCode}`);
      } else {
        console.log(`⚠️ Nenhum resultado no ${tribunalCode}`);
      }
      
      // Se encontrou resultados e tribunal específico foi informado, pode parar
      if (resultados.length > 0 && tribunal) {
        break;
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar no tribunal ${tribunalCode}:`, error);
      // Continua para o próximo tribunal
    }
  }
  
  if (resultados.length === 0) {
    console.log('⚠️ Nenhum processo encontrado para o nome informado');
    return null;
  }
  
  console.log(`✅ TOTAL: Encontrados ${resultados.length} processos para o nome "${nome}"`);
  return resultados;
}

async function executarConsultaElasticsearch(url: string, query: any, contexto: string) {
  console.log('📡 URL da API CNJ:', url);
  console.log('🔑 Usando API Key oficial do CNJ');
  console.log('📋 Query Elasticsearch:', JSON.stringify(query, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `APIKey ${CNJ_API_KEY}`
    },
    body: JSON.stringify(query)
  });

  console.log('📊 Status da resposta CNJ:', response.status);
  console.log('📊 Headers da resposta:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ ERRO na API oficial CNJ: ${response.status} - ${response.statusText}`);
    console.error('❌ Corpo do erro:', errorText);
    
    if (response.status === 401) {
      throw new Error('Erro de autenticação na API CNJ - API Key inválida');
    } else if (response.status === 403) {
      throw new Error('Acesso negado pela API CNJ - Verifique permissões');
    } else if (response.status === 429) {
      throw new Error('Limite de consultas excedido na API CNJ');
    }
    
    throw new Error(`Erro HTTP ${response.status} na API CNJ: ${errorText}`);
  }

  const data = await response.json();
  console.log('📦 Resposta completa da API CNJ:', JSON.stringify(data, null, 2));
  
  if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
    console.log(`✅ ${data.hits.hits.length} PROCESSO(S) ENCONTRADO(S) na API oficial CNJ para ${contexto}`);
    
    // Se múltiplos resultados, retornar array formatado
    if (data.hits.hits.length > 1) {
      return data.hits.hits.map((hit: any) => formatarProcessoDatajudOficial(hit._source));
    } else {
      // Se único resultado, retornar objeto único
      return formatarProcessoDatajudOficial(data.hits.hits[0]._source);
    }
  }
  
  console.log(`⚠️ Nenhum processo encontrado na base oficial CNJ para: ${contexto}`);
  return null;
}

function formatarProcessoDatajudOficial(processo: any) {
  console.log('🔧 Formatando processo oficial da API CNJ:', JSON.stringify(processo, null, 2));
  
  // FORMATAÇÃO BASEADA NA RESPOSTA REAL DA API CNJ
  const processoFormatado = {
    numero_processo: processo.numeroProcesso || 'Não informado',
    classe: processo.classe?.nome || 'Não informado',
    assunto: extrairAssuntos(processo.assuntos),
    tribunal: processo.tribunal || 'Não informado',
    orgao_julgador: processo.orgaoJulgador?.nome || 'Não informado',
    comarca: processo.orgaoJulgador?.nome || 'Não informado',
    data_ajuizamento: formatarData(processo.dataAjuizamento),
    data_ultima_movimentacao: extrairUltimaMovimentacao(processo.movimentos),
    status: determinarStatus(processo.movimentos),
    valor_causa: 0, // Não disponível na resposta padrão
    partes: [], // Não disponível na resposta básica
    advogados: [], // Não disponível na resposta básica
    movimentacoes: formatarMovimentacoes(processo.movimentos),
    jurimetria: calcularJurimetria(processo),
    fonte_dados: 'CNJ DataJud API Oficial',
    nivel_sigilo: processo.nivelSigilo || 0,
    formato: processo.formato?.nome || 'Não informado',
    sistema: processo.sistema?.nome || 'Não informado',
    grau: processo.grau || 'Não informado'
  };

  console.log('✅ Processo formatado da API oficial CNJ:', JSON.stringify(processoFormatado, null, 2));
  return processoFormatado;
}

function extrairTribunalDoNumero(numeroProcesso: string): string {
  if (!numeroProcesso || numeroProcesso.length < 20) {
    return 'TJSP';
  }
  
  const codigoTribunal = numeroProcesso.substring(13, 15);
  
  const mapeamento: { [key: string]: string } = {
    '26': 'TJSP', '19': 'TJRJ', '13': 'TJMG', '21': 'TJRS',
    '16': 'TJPR', '24': 'TJSC', '09': 'TJGO', '07': 'TJDF',
    '17': 'TJPE', '05': 'TJBA', '06': 'TJCE', '11': 'TJMT',
    '12': 'TJMS', '15': 'TJPB', '02': 'TJAL', '25': 'TJSE',
    '20': 'TJRN', '18': 'TJPI', '10': 'TJMA', '03': 'TJAP',
    '01': 'TJAC', '04': 'TJAM', '23': 'TJRO', '22': 'TJRR',
    '27': 'TJTO', '14': 'TJES', '08': 'TJPA',
    
    '31': 'TRF1', '32': 'TRF2', '33': 'TRF3', '34': 'TRF4',
    '35': 'TRF5', '36': 'TRF6',
    
    '41': 'TRT1', '42': 'TRT2', '43': 'TRT3', '44': 'TRT4',
    '45': 'TRT5', '46': 'TRT6', '47': 'TRT7', '48': 'TRT8',
    '49': 'TRT9', '50': 'TRT10', '51': 'TRT11', '52': 'TRT12',
    '53': 'TRT13', '54': 'TRT14', '55': 'TRT15', '56': 'TRT16',
    '57': 'TRT17', '58': 'TRT18', '59': 'TRT19', '60': 'TRT20',
    '61': 'TRT21', '62': 'TRT22', '63': 'TRT23', '64': 'TRT24',
    
    '90': 'STF', '91': 'STJ', '92': 'TST', '93': 'TSE', '94': 'STM'
  };
  
  return mapeamento[codigoTribunal] || 'TJSP';
}

function extrairAssuntos(assuntos: any[]): string {
  if (!assuntos || !Array.isArray(assuntos) || assuntos.length === 0) {
    return 'Não informado';
  }
  
  // Extrair o primeiro assunto encontrado
  const primeiroAssunto = Array.isArray(assuntos[0]) ? assuntos[0][0] : assuntos[0];
  return primeiroAssunto?.nome || 'Não informado';
}

function formatarMovimentacoes(movimentos: any[]): any[] {
  if (!movimentos || !Array.isArray(movimentos)) {
    return [];
  }
  
  return movimentos.map((mov: any) => ({
    data: formatarData(mov.dataHora),
    descricao: mov.nome || 'Movimentação não identificada',
    observacao: mov.complementosTabelados?.map((comp: any) => comp.nome).join(', ') || ''
  })).slice(-20); // Últimas 20 movimentações
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

function calcularJurimetria(processo: any): any {
  const dataAjuizamento = processo.dataAjuizamento ? new Date(processo.dataAjuizamento) : null;
  const hoje = new Date();
  const diasTramitando = dataAjuizamento ? Math.floor((hoje.getTime() - dataAjuizamento.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const movimentos = processo.movimentos || [];
  const totalMovimentacoes = movimentos.length;
  
  return {
    tempo_total_dias: diasTramitando,
    total_movimentacoes: totalMovimentacoes,
    tempo_medio_entre_movimentacoes: totalMovimentacoes > 1 ? Math.floor(diasTramitando / totalMovimentacoes) : 0,
    fase_atual: determinarFaseAtual(movimentos),
    tempo_na_fase_atual: calcularTempoFaseAtual(movimentos),
    previsao_sentenca: calcularPrevisaoSentenca(diasTramitando)
  };
}

function determinarFaseAtual(movimentacoes: any[]): string {
  if (movimentacoes.length === 0) return 'Não informado';
  
  const ultimaMovimentacao = movimentacoes[movimentacoes.length - 1];
  const descricao = ultimaMovimentacao.nome?.toLowerCase() || '';
  
  if (descricao.includes('audiência') || descricao.includes('audiencia')) {
    return 'Instrução';
  } else if (descricao.includes('contestação') || descricao.includes('contestacao')) {
    return 'Conhecimento';
  } else if (descricao.includes('conclusão') || descricao.includes('concluso')) {
    return 'Concluso para Sentença';
  } else if (descricao.includes('alegações') || descricao.includes('alegacoes')) {
    return 'Alegações Finais';
  } else if (descricao.includes('sentença') || descricao.includes('sentenca')) {
    return 'Sentenciado';
  } else {
    return 'Em andamento';
  }
}

function calcularTempoFaseAtual(movimentacoes: any[]): number {
  if (movimentacoes.length === 0) return 0;
  
  try {
    const ultimaData = new Date(movimentacoes[movimentacoes.length - 1].dataHora);
    const hoje = new Date();
    const diff = Math.floor((hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

function calcularPrevisaoSentenca(diasTramitando: number): string {
  if (diasTramitando === 0) return 'Não informado';
  
  try {
    const diasAdicionais = diasTramitando < 180 ? 90 : 60;
    const previsao = new Date();
    previsao.setDate(previsao.getDate() + diasAdicionais);
    return previsao.toISOString().split('T')[0];
  } catch {
    return 'Não informado';
  }
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
